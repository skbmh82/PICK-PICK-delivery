import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/notifications";
import { geocodeAddress } from "@/lib/kakao/geocode";

const OrderItemSchema = z.object({
  menuId:   z.string().uuid(),
  menuName: z.string().min(1),
  price:    z.number().positive(),
  quantity: z.number().int().positive(),
  options:  z.array(z.unknown()).default([]),
});

const CreateOrderSchema = z.object({
  storeId:         z.string().uuid(),
  items:           z.array(OrderItemSchema).min(1),
  totalAmount:     z.number().positive(),
  deliveryFee:     z.number().min(0),
  pickUsed:        z.number().min(0),
  userCouponId:    z.string().uuid().optional(),
  deliveryAddress: z.string().min(1),
  deliveryLat:     z.number().optional(),
  deliveryLng:     z.number().optional(),
  deliveryNote:    z.string().optional(),
  paymentMethod:   z.enum(["PICK", "PI", "PI_MIX"]).default("PICK"),
  orderType:       z.enum(["delivery", "takeout"]).default("delivery"),
});

// POST /api/orders — 주문 생성
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const admin    = getAdminSupabaseClient();

  // 1. 인증 확인
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  // 2. users 테이블에서 내부 userId + 전화번호 조회
  const { data: profile } = await admin
    .from("users")
    .select("id, phone")
    .eq("auth_id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "사용자 프로필을 찾을 수 없습니다" }, { status: 404 });
  }

  // 테스트넷 기간: 현금/Pi 결제 연락을 위해 전화번호 필수
  if (!profile.phone || String(profile.phone).trim() === "") {
    return NextResponse.json(
      { error: "전화번호를 등록해야 주문할 수 있어요. 장바구니에서 전화번호를 입력해주세요.", code: "PHONE_REQUIRED" },
      { status: 400 }
    );
  }

  // 3. 요청 바디 파싱 및 유효성 검사
  const body = await request.json().catch(() => null);
  const parsed = CreateOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "요청 데이터가 올바르지 않습니다", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { storeId, items, totalAmount, deliveryFee, pickUsed, userCouponId,
          deliveryAddress, deliveryLat, deliveryLng, deliveryNote, paymentMethod, orderType } = parsed.data;

  // 4. 가맹점 존재/영업 여부 확인
  const { data: store } = await admin
    .from("stores")
    .select("id, is_open, min_order_amount, delivery_fee, delivery_time")
    .eq("id", storeId)
    .single();

  if (!store) {
    return NextResponse.json({ error: "가맹점을 찾을 수 없습니다" }, { status: 404 });
  }
  if (!store.is_open) {
    return NextResponse.json({ error: "현재 영업 중이 아닌 가맹점입니다" }, { status: 400 });
  }

  // 5. PICK 잔액 확인 + 누적 적립량 조회 (등급 계산용, 쿠폰 검증용)
  const { data: wallet } = await admin
    .from("wallets")
    .select("pick_balance, total_earned")
    .eq("user_id", profile.id)
    .single();

  if (pickUsed > 0) {
    if (!wallet || Number(wallet.pick_balance) < pickUsed) {
      return NextResponse.json({ error: "PICK 잔액이 부족합니다" }, { status: 400 });
    }
  }

  // 6. 쿠폰 검증
  let couponFixedPick = 0;
  if (userCouponId) {
    const { data: uc } = await admin
      .from("user_coupons")
      .select("id, is_used, coupon_id, coupons(type, value, min_order, is_active, expires_at, store_id)")
      .eq("id", userCouponId)
      .eq("user_id", profile.id)
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const coupon = (uc as any)?.coupons;
    if (!uc || uc.is_used || !coupon?.is_active) {
      return NextResponse.json({ error: "유효하지 않은 쿠폰입니다" }, { status: 400 });
    }
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json({ error: "만료된 쿠폰입니다" }, { status: 400 });
    }
    if (coupon.store_id && coupon.store_id !== storeId) {
      return NextResponse.json({ error: "이 가맹점에서 사용할 수 없는 쿠폰입니다" }, { status: 400 });
    }
    if (totalAmount < Number(coupon.min_order ?? 0)) {
      return NextResponse.json({ error: "쿠폰 최소 주문금액을 충족하지 않습니다" }, { status: 400 });
    }
    if (coupon.type === "fixed_pick") couponFixedPick = Number(coupon.value);
    // free_delivery: client already sent deliveryFee=0
  }

  // 7. 서버 측 메뉴 가격 검증 — 클라이언트가 보낸 price를 DB 실제 가격과 대조
  const menuIds = items.map((i) => i.menuId);
  const { data: dbMenus, error: menuFetchError } = await admin
    .from("menus")
    .select("id, price, is_available")
    .in("id", menuIds);

  if (menuFetchError || !dbMenus) {
    return NextResponse.json({ error: "메뉴 정보를 확인할 수 없습니다" }, { status: 500 });
  }

  const menuMap = new Map(dbMenus.map((m) => [m.id, m]));

  for (const item of items) {
    const dbMenu = menuMap.get(item.menuId);
    if (!dbMenu) {
      return NextResponse.json(
        { error: `존재하지 않는 메뉴가 포함되어 있습니다 (${item.menuName})` },
        { status: 400 }
      );
    }
    if (!dbMenu.is_available) {
      return NextResponse.json(
        { error: `현재 주문할 수 없는 메뉴입니다 (${item.menuName})` },
        { status: 400 }
      );
    }
    const dbPrice = Number(dbMenu.price);
    if (Math.abs(dbPrice - item.price) > 0) {
      return NextResponse.json(
        { error: `메뉴 가격이 변경되었습니다. 장바구니를 다시 확인해 주세요 (${item.menuName}: ${item.price.toLocaleString()}원 → ${dbPrice.toLocaleString()}원)` },
        { status: 409 }
      );
    }
  }

  // 7-1. PICK 적립 — 기본 적립 없음, 쿠폰 fixed_pick 발급분만 적립
  const pickReward = couponFixedPick;

  // 8. 배달 좌표 확정 — 클라이언트 제공 우선, 없으면 서버 지오코딩
  let finalLat = deliveryLat ?? null;
  let finalLng = deliveryLng ?? null;
  if (orderType === "delivery" && (finalLat == null || finalLng == null)) {
    const coords = await geocodeAddress(deliveryAddress);
    if (coords) { finalLat = coords.lat; finalLng = coords.lng; }
  }

  // 9. 주문 생성 (admin 클라이언트로 RLS 우회)
  // PI 결제: 서버 측 Pi 콜백에서 orderId로 연결하므로 별도 ref 불필요
  const tossOrderId = null;
  // DB CHECK 제약: 'PICK'|'CASH'|'PI' — PI_MIX는 PI로 저장
  const dbPaymentMethod = paymentMethod === "PI_MIX" ? "PI" : paymentMethod;

  const { data: orderData, error: orderError } = await admin
    .from("orders")
    .insert({
      user_id:          profile.id,
      store_id:         storeId,
      // PI/PI_MIX: Pi 결제 완료 후 pending으로 전환 (그때 사장님 알림 발송)
      status:           (paymentMethod === "PI" || paymentMethod === "PI_MIX")
                          ? "awaiting_pi_payment"
                          : "pending",
      confirmed_at:     null,
      payment_method:   dbPaymentMethod,
      total_amount:     totalAmount + deliveryFee - pickUsed,
      delivery_fee:     deliveryFee,
      pick_used:        paymentMethod === "PICK" ? pickUsed : 0,
      pick_reward:      pickReward,
      delivery_address: deliveryAddress,
      delivery_lat:     finalLat,
      delivery_lng:     finalLng,
      delivery_note:    deliveryNote ?? null,
      estimated_time:   orderType === "takeout"
        ? Math.max((store.delivery_time ?? 30) - 10, 10)
        : store.delivery_time ?? 30,
      toss_order_id:    tossOrderId,
      order_type:       orderType,
    })
    .select("id")
    .single();

  if (orderError || !orderData) {
    console.error("주문 생성 오류:", orderError?.message);
    return NextResponse.json({ error: "주문 생성에 실패했습니다" }, { status: 500 });
  }

  const orderId = orderData.id as string;

  // 10. 주문 아이템 일괄 insert
  // 검증된 DB 가격으로 스냅샷 저장 (클라이언트 price 대신 서버 price 사용)
  const orderItems = items.map((item) => ({
    order_id:  orderId,
    menu_id:   item.menuId,
    menu_name: item.menuName,
    price:     Number(menuMap.get(item.menuId)!.price),
    quantity:  item.quantity,
    options:   item.options,
  }));

  const { error: itemsError } = await admin.from("order_items").insert(orderItems);
  if (itemsError) {
    console.error("주문 아이템 저장 오류:", itemsError.message);
  }

  // 10. 쿠폰 사용 처리
  if (userCouponId) {
    await admin
      .from("user_coupons")
      .update({ is_used: true, used_at: new Date().toISOString(), order_id: orderId })
      .eq("id", userCouponId);
  }

  // 11. PICK 차감 (PICK 결제인 경우만)
  if (paymentMethod === "PICK" && pickUsed > 0) {
    const { error: deductError } = await admin.rpc("deduct_pick", {
      p_user_id:  profile.id,
      p_amount:   pickUsed,
      p_order_id: orderId,
    });
    if (deductError) {
      console.error("deduct_pick 오류:", deductError.message);
    }
  }

  // 12. 사장님에게 신규 주문 알림
  // PI/PI_MIX 결제는 Pi 결제 완료 후(/api/pi/complete) 알림 전송 — 결제 전 선발송 방지
  if (paymentMethod !== "PI" && paymentMethod !== "PI_MIX") {
    const { data: storeOwner } = await admin
      .from("stores")
      .select("owner_id, name")
      .eq("id", storeId)
      .single();

    if (storeOwner?.owner_id) {
      const itemSummary = items
        .slice(0, 2)
        .map((i) => `${i.menuName} x${i.quantity}`)
        .join(", ");
      await createNotification({
        userId: storeOwner.owner_id,
        type:   "order_update",
        title:  "새 주문이 들어왔어요! 🔔",
        body:   `${itemSummary}${items.length > 2 ? ` 외 ${items.length - 2}개` : ""}`,
        data:   { orderId, storeId },
      });
    }
  }

  return NextResponse.json({ orderId }, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

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
  deliveryAddress: z.string().min(1),
  deliveryNote:    z.string().optional(),
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

  // 2. users 테이블에서 내부 userId 조회
  const { data: profile } = await admin
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "사용자 프로필을 찾을 수 없습니다" }, { status: 404 });
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

  const { storeId, items, totalAmount, deliveryFee, pickUsed, deliveryAddress, deliveryNote } = parsed.data;

  // 4. 가맹점 존재/영업 여부 확인
  const { data: store } = await admin
    .from("stores")
    .select("id, is_open, min_order_amount, delivery_fee, pick_reward_rate")
    .eq("id", storeId)
    .single();

  if (!store) {
    return NextResponse.json({ error: "가맹점을 찾을 수 없습니다" }, { status: 404 });
  }
  if (!store.is_open) {
    return NextResponse.json({ error: "현재 영업 중이 아닌 가맹점입니다" }, { status: 400 });
  }

  // 5. PICK 잔액 확인 (pickUsed > 0 인 경우)
  if (pickUsed > 0) {
    const { data: wallet } = await admin
      .from("wallets")
      .select("pick_balance")
      .eq("user_id", profile.id)
      .single();

    if (!wallet || Number(wallet.pick_balance) < pickUsed) {
      return NextResponse.json({ error: "PICK 잔액이 부족합니다" }, { status: 400 });
    }
  }

  // 6. 적립 PICK 계산
  const rewardRate = Number(store.pick_reward_rate) / 100;
  const pickReward = Math.floor((totalAmount + deliveryFee) * rewardRate * 10) / 10;

  // 7. 주문 생성 (admin 클라이언트로 RLS 우회)
  const { data: orderData, error: orderError } = await admin
    .from("orders")
    .insert({
      user_id:         profile.id,
      store_id:        storeId,
      status:          "pending",
      payment_method:  "PICK",
      total_amount:    totalAmount + deliveryFee - pickUsed,
      delivery_fee:    deliveryFee,
      pick_used:       pickUsed,
      pick_reward:     pickReward,
      delivery_address: deliveryAddress,
      delivery_note:   deliveryNote ?? null,
      estimated_time:  store.delivery_fee ?? 30,
    })
    .select("id")
    .single();

  if (orderError || !orderData) {
    console.error("주문 생성 오류:", orderError?.message);
    return NextResponse.json({ error: "주문 생성에 실패했습니다" }, { status: 500 });
  }

  const orderId = orderData.id as string;

  // 8. 주문 아이템 일괄 insert
  const orderItems = items.map((item) => ({
    order_id:  orderId,
    menu_id:   item.menuId,
    menu_name: item.menuName,
    price:     item.price,
    quantity:  item.quantity,
    options:   item.options,
  }));

  const { error: itemsError } = await admin.from("order_items").insert(orderItems);
  if (itemsError) {
    console.error("주문 아이템 저장 오류:", itemsError.message);
  }

  // 9. PICK 차감 (RPC 호출)
  if (pickUsed > 0) {
    const { error: deductError } = await admin.rpc("deduct_pick", {
      p_user_id:  profile.id,
      p_amount:   pickUsed,
      p_order_id: orderId,
    });
    if (deductError) {
      console.error("deduct_pick 오류:", deductError.message);
    }
  }

  return NextResponse.json({ orderId }, { status: 201 });
}

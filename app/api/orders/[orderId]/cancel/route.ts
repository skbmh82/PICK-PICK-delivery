import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/notifications";

// 고객 취소 가능 상태
const USER_CANCELLABLE  = ["pending", "confirmed"];
// 사장님 취소 가능 상태 (라이더 픽업 전까지)
const OWNER_CANCELLABLE = ["pending", "confirmed", "preparing", "calling_rider", "ready"];

// POST /api/orders/[orderId]/cancel — 주문 취소 (고객·사장님 공용, PICK 환불 포함)
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const supabase = await createServerSupabaseClient();
  const admin    = getAdminSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  // 프로필 + 역할 조회
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (admin as any)
    .from("users")
    .select("id, role")
    .eq("auth_id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 });
  }

  // 주문 조회 (가게 owner_id 포함)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: order, error: orderErr } = await (admin as any)
    .from("orders")
    .select("id, user_id, status, pick_used, stores!inner(name, owner_id)")
    .eq("id", orderId)
    .single();

  if (orderErr || !order) {
    return NextResponse.json({ error: "주문을 찾을 수 없습니다" }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const storeName  = (order.stores as any)?.name     ?? "가맹점";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const storeOwner = (order.stores as any)?.owner_id ?? null;
  const isOwner    = profile.role === "owner" && profile.id === storeOwner;
  const isAdmin    = profile.role === "admin";
  const isCustomer = profile.id   === order.user_id;

  // ── 권한 체크 ─────────────────────────────────────────
  if (!isOwner && !isAdmin && !isCustomer) {
    return NextResponse.json({ error: "취소 권한이 없습니다" }, { status: 403 });
  }

  // ── 상태 체크 ─────────────────────────────────────────
  if (isOwner || isAdmin) {
    // 사장님·관리자: 라이더 픽업 전까지 취소 가능
    if (!OWNER_CANCELLABLE.includes(order.status)) {
      return NextResponse.json(
        { error: "라이더가 픽업한 이후에는 취소할 수 없습니다" },
        { status: 409 }
      );
    }
  } else {
    // 고객: 조리 시작 전까지만 취소 가능
    if (!USER_CANCELLABLE.includes(order.status)) {
      return NextResponse.json(
        { error: "조리가 시작된 주문은 취소할 수 없습니다" },
        { status: 409 }
      );
    }
  }

  // ── 주문 상태 → cancelled ─────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateErr } = await (admin as any)
    .from("orders")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("id", orderId);

  if (updateErr) {
    console.error("주문 취소 오류:", updateErr.message);
    return NextResponse.json({ error: "주문 취소에 실패했습니다" }, { status: 500 });
  }

  // ── PICK 환불 (고객에게) ──────────────────────────────
  const pickUsed = Number(order.pick_used ?? 0);
  if (pickUsed > 0) {
    const { error: refundErr } = await admin.rpc("refund_pick", {
      p_user_id:  order.user_id,
      p_amount:   pickUsed,
      p_order_id: orderId,
      p_desc:     "주문 취소 환불",
    });
    if (refundErr) console.error("PICK 환불 오류:", refundErr.message);
  }

  // ── 알림 발송 ─────────────────────────────────────────
  const cancelledBy = isOwner ? "가게" : isAdmin ? "관리자" : "고객";

  // 고객에게 알림
  await createNotification({
    userId: order.user_id,
    type:   "order_update",
    title:  "주문이 취소되었습니다",
    body:   pickUsed > 0
      ? `${storeName} 주문이 ${cancelledBy}에 의해 취소됐어요. ${pickUsed.toLocaleString()} PICK이 환불됩니다.`
      : `${storeName} 주문이 ${cancelledBy}에 의해 취소됐어요.`,
    data: { orderId },
  });

  // 사장님이 취소한 경우 → 가게에도 알림 (관리자 취소 포함)
  if ((isOwner || isAdmin) && order.user_id !== profile.id) {
    // 사장님에게도 확인 알림
    await createNotification({
      userId: profile.id,
      type:   "order_update",
      title:  "주문을 취소했습니다",
      body:   `${storeName} 주문이 취소됐어요. 고객에게 PICK 환불이 처리됩니다.`,
      data:   { orderId },
    });
  }

  return NextResponse.json({ ok: true, refundedPick: pickUsed });
}

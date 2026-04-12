import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/notifications";

// POST /api/orders/[orderId]/cancel — 주문 취소 (사용자용, PICK 환불 포함)
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

  // 사용자 프로필 조회
  const { data: profile } = await admin
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 });
  }

  // 주문 조회 (본인 주문인지 + 취소 가능 상태인지 확인)
  const { data: order, error: orderErr } = await admin
    .from("orders")
    .select("id, user_id, status, pick_used, stores(name)")
    .eq("id", orderId)
    .single();

  if (orderErr || !order) {
    return NextResponse.json({ error: "주문을 찾을 수 없습니다" }, { status: 404 });
  }

  if (order.user_id !== profile.id) {
    return NextResponse.json({ error: "본인 주문만 취소할 수 있습니다" }, { status: 403 });
  }

  const CANCELLABLE = ["pending", "confirmed"];
  if (!CANCELLABLE.includes(order.status)) {
    return NextResponse.json(
      { error: "조리가 시작된 주문은 취소할 수 없습니다" },
      { status: 409 }
    );
  }

  // 주문 상태 → cancelled
  const { error: updateErr } = await admin
    .from("orders")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("id", orderId);

  if (updateErr) {
    console.error("주문 취소 오류:", updateErr.message);
    return NextResponse.json({ error: "주문 취소에 실패했습니다" }, { status: 500 });
  }

  // PICK 환불
  const pickUsed = Number(order.pick_used ?? 0);
  if (pickUsed > 0) {
    const { error: refundErr } = await admin.rpc("refund_pick", {
      p_user_id:  profile.id,
      p_amount:   pickUsed,
      p_order_id: orderId,
      p_desc:     "주문 취소 환불",
    });
    if (refundErr) {
      console.error("PICK 환불 오류:", refundErr.message);
      // 취소는 이미 됐으므로 에러를 throw하지 않음 — 별도 모니터링 필요
    }
  }

  // 취소 알림
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const storeName = (order.stores as any)?.name ?? "가맹점";
  await createNotification({
    userId: profile.id,
    type:   "order_update",
    title:  "주문이 취소되었습니다",
    body:   pickUsed > 0
      ? `${storeName} 주문이 취소됐어요. ${pickUsed.toFixed(1)} PICK이 환불됩니다.`
      : `${storeName} 주문이 취소됐어요.`,
    data: { orderId },
  });

  return NextResponse.json({
    ok:          true,
    refundedPick: pickUsed,
  });
}

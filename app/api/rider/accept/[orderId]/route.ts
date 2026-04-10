import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

// POST /api/rider/accept/[orderId] — 배달 수락 (rider_id 설정 + status=picked_up)
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const supabase = await createServerSupabaseClient();
  const admin    = getAdminSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (admin as any)
    .from("users")
    .select("id, role")
    .eq("auth_id", user.id)
    .single();

  if (!profile || !["rider", "admin"].includes(profile.role)) {
    return NextResponse.json({ error: "라이더 권한이 필요합니다" }, { status: 403 });
  }

  // 주문이 아직 ready 상태이고 rider 미배정인지 확인
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: order } = await (admin as any)
    .from("orders")
    .select("id, status, rider_id, delivery_fee")
    .eq("id", orderId)
    .single();

  if (!order) {
    return NextResponse.json({ error: "주문을 찾을 수 없습니다" }, { status: 404 });
  }
  if (order.status !== "ready") {
    return NextResponse.json({ error: "이미 처리된 주문입니다" }, { status: 409 });
  }
  if (order.rider_id) {
    return NextResponse.json({ error: "이미 다른 라이더가 수락한 주문입니다" }, { status: 409 });
  }

  // rider_id 설정 + status → picked_up
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await (admin as any)
    .from("orders")
    .update({ rider_id: profile.id, status: "picked_up", updated_at: new Date().toISOString() })
    .eq("id", orderId);

  if (updateError) {
    console.error("배달 수락 오류:", updateError.message);
    return NextResponse.json({ error: "배달 수락에 실패했습니다" }, { status: 500 });
  }

  // rider_earnings 레코드 생성 (배달비 기준)
  const earningAmount = Number(order.delivery_fee) > 0 ? Number(order.delivery_fee) : 3000;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any)
    .from("rider_earnings")
    .insert({
      rider_id:    profile.id,
      order_id:    orderId,
      amount_pick: earningAmount,
      status:      "pending",
    });

  return NextResponse.json({ ok: true });
}

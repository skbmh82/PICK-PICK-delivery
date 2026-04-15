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

  // 오프라인 라이더는 수락 불가
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: location } = await (admin as any)
    .from("rider_locations")
    .select("is_active")
    .eq("rider_id", profile.id)
    .single();

  if (!location?.is_active) {
    return NextResponse.json({ error: "온라인 상태일 때만 배달을 수락할 수 있습니다" }, { status: 400 });
  }

  // 주문 존재 여부 사전 확인
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: orderCheck } = await (admin as any)
    .from("orders")
    .select("id, status")
    .eq("id", orderId)
    .single();

  if (!orderCheck) {
    return NextResponse.json({ error: "주문을 찾을 수 없습니다" }, { status: 404 });
  }
  if (orderCheck.status !== "ready") {
    return NextResponse.json({ error: "이미 처리된 주문입니다" }, { status: 409 });
  }

  // 조건부 UPDATE — status=ready AND rider_id IS NULL 인 경우만 업데이트
  // SELECT → UPDATE 사이 Race Condition 방지 (두 라이더 동시 수락 차단)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: updated, error: updateError } = await (admin as any)
    .from("orders")
    .update({ rider_id: profile.id, status: "picked_up", updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .eq("status", "ready")
    .is("rider_id", null)
    .select("id, delivery_fee")
    .single();

  if (updateError || !updated) {
    return NextResponse.json({ error: "이미 다른 라이더가 수락한 주문입니다" }, { status: 409 });
  }

  // rider_earnings 레코드 생성 (배달비 기준)
  const earningAmount = Number(updated.delivery_fee) > 0 ? Number(updated.delivery_fee) : 3000;
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

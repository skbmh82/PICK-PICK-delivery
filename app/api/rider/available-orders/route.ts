import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

// GET /api/rider/available-orders — status='ready' 이고 rider가 아직 배정 안 된 주문
export async function GET() {
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

  // 오프라인 라이더는 빈 목록 반환
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: location } = await (admin as any)
    .from("rider_locations")
    .select("is_active")
    .eq("rider_id", profile.id)
    .single();

  if (!location?.is_active) {
    return NextResponse.json({ orders: [] });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: orders, error } = await (admin as any)
    .from("orders")
    .select(`
      id, status, total_amount, delivery_fee, delivery_address, delivery_lat, delivery_lng, delivery_note, created_at,
      stores ( id, name, address, lat, lng ),
      users!orders_user_id_fkey ( id, name, phone ),
      order_items ( id, menu_name, quantity )
    `)
    .eq("status", "ready")
    .is("rider_id", null)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("available-orders 오류:", error.message);
    return NextResponse.json({ error: "주문 조회에 실패했습니다" }, { status: 500 });
  }

  return NextResponse.json({ orders: orders ?? [] });
}

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

// GET /api/rider/deliveries?tab=active|done
export async function GET(request: NextRequest) {
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

  const tab = request.nextUrl.searchParams.get("tab") ?? "active";

  const activeStatuses = ["picked_up", "delivering"];
  const doneStatuses   = ["delivered", "cancelled"];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: orders, error } = await (admin as any)
    .from("orders")
    .select(`
      id, status, total_amount, delivery_fee, delivery_address, delivery_lat, delivery_lng, created_at,
      stores ( id, name, address, lat, lng ),
      users ( id, name, phone ),
      order_items ( id, menu_name, quantity ),
      rider_earnings ( amount_pick, status )
    `)
    .eq("rider_id", profile.id)
    .in("status", tab === "done" ? doneStatuses : activeStatuses)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    console.error("rider deliveries 오류:", error.message);
    return NextResponse.json({ error: "배달 목록 조회에 실패했습니다" }, { status: 500 });
  }

  return NextResponse.json({ orders: orders ?? [] });
}

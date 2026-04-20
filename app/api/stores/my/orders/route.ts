import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

// GET /api/stores/my/orders?tab=active|done
export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const admin    = getAdminSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const { data: profile } = await admin
    .from("users")
    .select("id, role")
    .eq("auth_id", user.id)
    .single();

  if (!profile || !["owner", "admin"].includes(profile.role)) {
    return NextResponse.json({ error: "사장님 권한이 필요합니다" }, { status: 403 });
  }

  const { data: storeList } = await admin
    .from("stores")
    .select("id")
    .eq("owner_id", profile.id)
    .order("created_at", { ascending: false });

  if (!storeList || storeList.length === 0) {
    return NextResponse.json({ orders: [], storeId: null });
  }

  const storeIds = storeList.map((s: { id: string }) => s.id);

  const tab = request.nextUrl.searchParams.get("tab") ?? "active";
  const doneStatuses    = ["delivered", "cancelled", "refunded"];
  const activeStatuses  = ["pending", "confirmed", "preparing", "calling_rider", "ready", "picked_up", "delivering"];

  const { data: orders, error } = await admin
    .from("orders")
    .select(`
      id, status, total_amount, delivery_fee, pick_used,
      delivery_address, delivery_note, estimated_time, created_at, rider_id, store_id,
      users!orders_user_id_fkey ( id, name, phone ),
      order_items ( id, menu_name, price, quantity )
    `)
    .in("store_id", storeIds)
    .in("status", tab === "done" ? doneStatuses : activeStatuses)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("사장님 주문 조회 오류:", error.message);
    return NextResponse.json({ error: "주문 조회에 실패했습니다" }, { status: 500 });
  }

  return NextResponse.json({ orders: orders ?? [], storeId: storeIds[0], storeIds });
}

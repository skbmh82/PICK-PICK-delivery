import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

// GET /api/orders/my — 내 주문 목록
export async function GET() {
  const supabase = await createServerSupabaseClient();
  const admin    = getAdminSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const { data: profile } = await admin
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ orders: [] });
  }

  const { data: orders, error } = await admin
    .from("orders")
    .select(`
      id, status, total_amount, delivery_fee,
      pick_used, pick_reward, delivery_address,
      estimated_time, created_at,
      stores ( id, name, image_url, category ),
      order_items ( id, menu_name, price, quantity, options )
    `)
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    console.error("fetchMyOrders 오류:", error.message);
    return NextResponse.json({ error: "주문 조회에 실패했습니다" }, { status: 500 });
  }

  return NextResponse.json({ orders: orders ?? [] });
}

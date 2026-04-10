import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

// GET /api/orders/[orderId] — 주문 상세
export async function GET(
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

  const { data: order, error } = await admin
    .from("orders")
    .select(`
      id, status, total_amount, delivery_fee,
      pick_used, pick_reward, delivery_address, delivery_note,
      estimated_time, confirmed_at, picked_up_at, delivered_at,
      cancelled_at, created_at,
      stores ( id, name, image_url, category, phone, address ),
      order_items ( id, menu_name, price, quantity, options )
    `)
    .eq("id", orderId)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "주문을 찾을 수 없습니다" }, { status: 404 });
  }

  return NextResponse.json({ order });
}

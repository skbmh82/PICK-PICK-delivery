import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

const ACTIVE_STATUSES = ["pending","confirmed","preparing","ready","picked_up","delivering"];

// GET /api/orders/my — 내 주문 목록
// ?status=active&limit=1  → activeCount만 반환 (BottomNav 배지용)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get("status");
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
    return NextResponse.json({ orders: [], activeCount: 0 });
  }

  // 진행 중 주문 수만 필요할 때 (BottomNav 배지)
  if (statusFilter === "active") {
    const { count } = await admin
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.id)
      .in("status", ACTIVE_STATUSES);
    return NextResponse.json({ activeCount: count ?? 0 });
  }

  const { data: orders, error } = await admin
    .from("orders")
    .select(`
      id, status, total_amount, delivery_fee,
      pick_used, pick_reward, delivery_address,
      estimated_time, created_at, rider_id,
      stores ( id, name, image_url, category, photo_review_reward_krw ),
      order_items ( id, menu_id, menu_name, price, quantity, options )
    `)
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) {
    console.error("fetchMyOrders 오류:", error.message);
    return NextResponse.json({ error: "주문 조회에 실패했습니다" }, { status: 500 });
  }

  // 배달 완료 주문 중 리뷰 작성 여부 확인
  const deliveredIds = (orders ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((o: any) => o.status === "delivered")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((o: any) => o.id as string);

  const reviewedSet = new Set<string>();
  if (deliveredIds.length > 0) {
    const { data: reviews } = await admin
      .from("reviews").select("order_id").in("order_id", deliveredIds);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (reviews ?? []).forEach((r: any) => reviewedSet.add(r.order_id as string));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = (orders ?? []).map((o: any) => ({
    ...o,
    hasReview: reviewedSet.has(o.id as string),
  }));

  const activeCount = result.filter((o: { status: string }) =>
    ACTIVE_STATUSES.includes(o.status)
  ).length;

  return NextResponse.json({ orders: result, activeCount });
}

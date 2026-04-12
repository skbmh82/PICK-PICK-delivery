import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

// GET /api/stores/my/analytics — 월별 매출 + 인기 메뉴 + 피크시간대
export async function GET() {
  const supabase = await createServerSupabaseClient();
  const admin    = getAdminSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (admin as any)
    .from("users").select("id, role").eq("auth_id", user.id).single();

  if (!profile || !["owner", "admin"].includes(profile.role)) {
    return NextResponse.json({ error: "사장님 권한이 필요합니다" }, { status: 403 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: store } = await (admin as any)
    .from("stores").select("id").eq("owner_id", profile.id).single();

  if (!store) {
    return NextResponse.json({ monthly: [], topMenus: [], peakHours: [], summary: null });
  }

  const now = new Date();

  // ── 1. 월별 매출 (최근 6개월) ──────────────────────────
  const monthly: { month: string; revenue: number; orders: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d     = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(d.getFullYear(), d.getMonth(),     1).toISOString();
    const end   = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: mo } = await (admin as any)
      .from("orders")
      .select("total_amount")
      .eq("store_id", store.id)
      .eq("status", "delivered")
      .gte("created_at", start)
      .lt("created_at", end);

    const rows = mo ?? [];
    monthly.push({
      month:   `${d.getMonth() + 1}월`,
      revenue: rows.reduce((s: number, o: { total_amount: number }) => s + Number(o.total_amount), 0),
      orders:  rows.length,
    });
  }

  // ── 2. 인기 메뉴 TOP 5 (최근 30일) ─────────────────────
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400 * 1000).toISOString();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: recentOrders } = await (admin as any)
    .from("orders")
    .select("id")
    .eq("store_id", store.id)
    .in("status", ["delivered", "confirmed", "preparing", "ready", "picked_up", "delivering"])
    .gte("created_at", thirtyDaysAgo);

  const orderIds = (recentOrders ?? []).map((o: { id: string }) => o.id);

  const menuCountMap: Record<string, { name: string; count: number; revenue: number }> = {};

  if (orderIds.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: items } = await (admin as any)
      .from("order_items")
      .select("menu_name, quantity, price")
      .in("order_id", orderIds);

    for (const item of items ?? []) {
      const key = item.menu_name as string;
      if (!menuCountMap[key]) menuCountMap[key] = { name: key, count: 0, revenue: 0 };
      menuCountMap[key].count   += Number(item.quantity);
      menuCountMap[key].revenue += Number(item.price) * Number(item.quantity);
    }
  }

  const topMenus = Object.values(menuCountMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // ── 3. 피크 시간대 (최근 30일, 시간별 주문수) ─────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: hourOrders } = await (admin as any)
    .from("orders")
    .select("created_at")
    .eq("store_id", store.id)
    .gte("created_at", thirtyDaysAgo);

  const hourMap: Record<number, number> = {};
  for (let h = 0; h < 24; h++) hourMap[h] = 0;
  for (const o of hourOrders ?? []) {
    const h = new Date(o.created_at as string).getHours();
    hourMap[h] = (hourMap[h] ?? 0) + 1;
  }
  // 영업 시간대만 (오전 9시 ~ 자정)
  const peakHours = Array.from({ length: 16 }, (_, i) => {
    const h = i + 9;
    return { hour: `${h}시`, count: hourMap[h] ?? 0 };
  });

  // ── 4. 이번달 vs 지난달 요약 ────────────────────────────
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(),     1).toISOString();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [{ data: thisMo }, { data: lastMo }] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any).from("orders").select("total_amount")
      .eq("store_id", store.id).eq("status", "delivered")
      .gte("created_at", thisMonthStart),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (admin as any).from("orders").select("total_amount")
      .eq("store_id", store.id).eq("status", "delivered")
      .gte("created_at", lastMonthStart).lt("created_at", thisMonthStart),
  ]);

  const thisRevenue = (thisMo ?? []).reduce((s: number, o: { total_amount: number }) => s + Number(o.total_amount), 0);
  const lastRevenue = (lastMo ?? []).reduce((s: number, o: { total_amount: number }) => s + Number(o.total_amount), 0);
  const growthRate  = lastRevenue > 0
    ? Math.round(((thisRevenue - lastRevenue) / lastRevenue) * 100)
    : null;

  return NextResponse.json({
    monthly,
    topMenus,
    peakHours,
    summary: {
      thisMonthRevenue: thisRevenue,
      lastMonthRevenue: lastRevenue,
      thisMonthOrders:  (thisMo ?? []).length,
      lastMonthOrders:  (lastMo ?? []).length,
      growthRate,
    },
  });
}

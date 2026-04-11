import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

// GET /api/admin/stats — 관리자 플랫폼 통계
export async function GET() {
  const supabase = await createServerSupabaseClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminSupabaseClient() as any;

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const { data: profile } = await admin
    .from("users").select("role").eq("auth_id", user.id).single();

  if (!profile || profile.role !== "admin") {
    return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 });
  }

  const today      = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

  const [
    usersRes, storesRes, ordersRes,
    todayOrdersRes, monthOrdersRes,
    walletsRes, pendingStoresRes,
  ] = await Promise.all([
    // 전체 사용자 수 (역할별)
    admin.from("users").select("role"),
    // 전체 가맹점 수
    admin.from("stores").select("id, is_approved"),
    // 전체 주문 수
    admin.from("orders").select("id, status, total_amount, created_at"),
    // 오늘 주문
    admin.from("orders")
      .select("id, status, total_amount")
      .gte("created_at", todayStart),
    // 이번 달 주문
    admin.from("orders")
      .select("id, status, total_amount")
      .gte("created_at", monthStart),
    // PICK 토큰 유통량
    admin.from("wallets").select("pick_balance, total_earned"),
    // 승인 대기 가맹점
    admin.from("stores").select("id").eq("is_approved", false),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allUsers   = (usersRes.data ?? []) as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allStores  = (storesRes.data ?? []) as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allOrders  = (ordersRes.data ?? []) as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const todayOrders = (todayOrdersRes.data ?? []) as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const monthOrders = (monthOrdersRes.data ?? []) as any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allWallets  = (walletsRes.data ?? []) as any[];

  // 사용자 역할별 집계
  const usersByRole = allUsers.reduce<Record<string, number>>((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1;
    return acc;
  }, {});

  // 주문 상태별 집계
  const completedOrders = allOrders.filter((o: { status: string }) => o.status === "delivered");
  const cancelledOrders = allOrders.filter((o: { status: string }) => o.status === "cancelled");

  // 매출 계산
  const totalRevenue = completedOrders.reduce(
    (s: number, o: { total_amount: string | number }) => s + Number(o.total_amount), 0
  );
  const todayRevenue = todayOrders
    .filter((o: { status: string }) => o.status === "delivered")
    .reduce((s: number, o: { total_amount: string | number }) => s + Number(o.total_amount), 0);
  const monthRevenue = monthOrders
    .filter((o: { status: string }) => o.status === "delivered")
    .reduce((s: number, o: { total_amount: string | number }) => s + Number(o.total_amount), 0);

  // PICK 토큰 통계
  const totalPickCirculation = allWallets.reduce(
    (s: number, w: { pick_balance: string | number }) => s + Number(w.pick_balance), 0
  );
  const totalPickEverIssued = allWallets.reduce(
    (s: number, w: { total_earned: string | number }) => s + Number(w.total_earned), 0
  );

  return NextResponse.json({
    users: {
      total:  allUsers.length,
      byRole: usersByRole,
    },
    stores: {
      total:    allStores.length,
      approved: allStores.filter((s: { is_approved: boolean }) => s.is_approved).length,
      pending:  (pendingStoresRes.data ?? []).length,
    },
    orders: {
      total:     allOrders.length,
      completed: completedOrders.length,
      cancelled: cancelledOrders.length,
      today:     todayOrders.length,
      thisMonth: monthOrders.length,
    },
    revenue: {
      total:     Math.round(totalRevenue),
      today:     Math.round(todayRevenue),
      thisMonth: Math.round(monthRevenue),
    },
    pick: {
      circulation:  Math.round(totalPickCirculation * 10) / 10,
      totalIssued:  Math.round(totalPickEverIssued  * 10) / 10,
    },
  });
}

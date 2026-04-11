import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

// GET /api/rider/earnings — 지갑 잔액 + 기간별 수익 + 주간/월별 차트 + 배달 내역
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

  // 지갑 잔액
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: wallet } = await (admin as any)
    .from("wallets")
    .select("pick_balance, total_earned")
    .eq("user_id", profile.id)
    .single();

  const pickBalance = Number(wallet?.pick_balance ?? 0);
  const totalEarned = Number(wallet?.total_earned  ?? 0);

  const now        = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekStart  = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // 전체 수익 내역 (rider_earnings)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: allEarnings } = await (admin as any)
    .from("rider_earnings")
    .select("amount_pick, status, settled_at, created_at")
    .eq("rider_id", profile.id)
    .order("created_at", { ascending: false });

  const earnings = allEarnings ?? [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sumPick = (list: any[]) =>
    list.reduce((s: number, e: { amount_pick: number }) => s + Number(e.amount_pick), 0);

  const todayEarnings = earnings.filter((e: { created_at: string }) => e.created_at >= todayStart);
  const weekEarnings  = earnings.filter((e: { created_at: string }) => e.created_at >= weekStart);
  const monthEarnings = earnings.filter((e: { created_at: string }) => e.created_at >= monthStart);

  const periodStats = [
    { label: "오늘",    pick: sumPick(todayEarnings), count: todayEarnings.length },
    { label: "이번 주", pick: sumPick(weekEarnings),  count: weekEarnings.length  },
    { label: "이번 달", pick: sumPick(monthEarnings), count: monthEarnings.length },
  ];

  // 주간 막대 차트 (7일)
  const weekly: { day: string; pick: number; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d     = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const start = d.toISOString();
    const end   = new Date(d.getTime() + 86400000).toISOString();
    const dayE  = earnings.filter(
      (e: { created_at: string }) => e.created_at >= start && e.created_at < end
    );
    const label = i === 0 ? "오늘" : ["일","월","화","수","목","금","토"][d.getDay()];
    weekly.push({ day: label, pick: sumPick(dayE), count: dayE.length });
  }

  // 월별 차트 (최근 6개월)
  const monthly: { month: string; pick: number; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d      = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start  = d.toISOString();
    const end    = new Date(d.getFullYear(), d.getMonth() + 1, 1).toISOString();
    const monE   = earnings.filter(
      (e: { created_at: string }) => e.created_at >= start && e.created_at < end
    );
    monthly.push({ month: `${d.getMonth() + 1}월`, pick: sumPick(monE), count: monE.length });
  }

  // 최근 완료 배달 내역 (orders 조인)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: recentOrders } = await (admin as any)
    .from("orders")
    .select("id, total_amount, delivery_address, created_at, stores(name), rider_earnings(amount_pick)")
    .eq("rider_id", profile.id)
    .eq("status", "delivered")
    .order("created_at", { ascending: false })
    .limit(20);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const deliveryHistory = (recentOrders ?? []).map((o: any) => ({
    orderId:       o.id,
    storeName:     o.stores?.name ?? "알 수 없는 가게",
    address:       o.delivery_address,
    orderAmount:   Number(o.total_amount),
    pickEarned:    Number(
      Array.isArray(o.rider_earnings)
        ? (o.rider_earnings[0]?.amount_pick ?? 0)
        : (o.rider_earnings?.amount_pick ?? 0)
    ),
    date: new Date(o.created_at).toLocaleDateString("ko-KR", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    }),
  }));

  // 정산 완료 내역 (최근 10건)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const settlementHistory = earnings
    .filter((e: { status: string }) => e.status === "settled")
    .slice(0, 10)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((e: any) => ({
      date:   new Date(e.settled_at ?? e.created_at).toLocaleDateString("ko-KR", {
        month: "short", day: "numeric",
      }),
      pick:   Number(e.amount_pick),
      status: "정산완료",
    }));

  return NextResponse.json({
    pickBalance,
    totalEarned,
    periodStats,
    weekly,
    monthly,
    deliveryHistory,
    settlementHistory,
  });
}

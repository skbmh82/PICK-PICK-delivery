import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

// GET /api/stores/my/settlement — 사장님 정산 가능 잔액 + 기간별 매출 + 주간 차트 + 정산 내역
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
  if (!profile || !["owner","admin"].includes(profile.role)) {
    return NextResponse.json({ error: "사장님 권한이 필요합니다" }, { status: 403 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: store } = await (admin as any)
    .from("stores").select("id").eq("owner_id", profile.id).single();
  if (!store) {
    return NextResponse.json({
      pickBalance: 0, periodStats: [], weekly: [], settlementHistory: [],
    });
  }

  // 지갑 잔액
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: wallet } = await (admin as any)
    .from("wallets").select("pick_balance").eq("user_id", profile.id).single();
  const pickBalance = Number(wallet?.pick_balance ?? 0);

  const now        = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekStart  = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: allOrders } = await (admin as any)
    .from("orders")
    .select("total_amount, status, created_at")
    .eq("store_id", store.id)
    .eq("status", "delivered");

  const orders = allOrders ?? [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sumAmount = (list: any[]) =>
    list.reduce((s: number, o: { total_amount: number }) => s + Number(o.total_amount), 0);

  const todayOrders = orders.filter((o: { created_at: string }) => o.created_at >= todayStart);
  const weekOrders  = orders.filter((o: { created_at: string }) => o.created_at >= weekStart);
  const monthOrders = orders.filter((o: { created_at: string }) => o.created_at >= monthStart);

  const periodStats = [
    { label: "오늘",    amount: sumAmount(todayOrders), orders: todayOrders.length },
    { label: "이번 주", amount: sumAmount(weekOrders),  orders: weekOrders.length  },
    { label: "이번 달", amount: sumAmount(monthOrders), orders: monthOrders.length },
  ];

  // 주간 막대 차트 (7일)
  const weekly: { day: string; amount: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d     = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const start = d.toISOString();
    const end   = new Date(d.getTime() + 86400000).toISOString();
    const dayAmt = orders
      .filter((o: { created_at: string }) => o.created_at >= start && o.created_at < end)
      .reduce((s: number, o: { total_amount: number }) => s + Number(o.total_amount), 0);
    const label = i === 0 ? "오늘" : ["일","월","화","수","목","금","토"][d.getDay()];
    weekly.push({ day: label, amount: dayAmt });
  }

  // 정산 내역 (wallet_transactions 중 payment 타입, 최근 10건)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: txs } = await (admin as any)
    .from("wallet_transactions")
    .select("amount, created_at")
    .eq("wallet_id", (await (admin as any).from("wallets").select("id").eq("user_id", profile.id).single()).data?.id)
    .eq("type", "payment")
    .order("created_at", { ascending: false })
    .limit(10);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const settlementHistory = (txs ?? []).map((t: any) => ({
    date:   new Date(t.created_at).toLocaleDateString("ko-KR", { year: "numeric", month: "short", day: "numeric" }),
    amount: Math.abs(Number(t.amount)),
    status: "완료",
  }));

  return NextResponse.json({ pickBalance, periodStats, weekly, settlementHistory });
}

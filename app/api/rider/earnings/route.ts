import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

// GET /api/rider/earnings — 지갑 잔액 + 기간별 수익 + 정산 내역
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
    .select("pick_balance")
    .eq("user_id", profile.id)
    .single();

  const pickBalance = Number(wallet?.pick_balance ?? 0);

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekStart  = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: allEarnings } = await (admin as any)
    .from("rider_earnings")
    .select("amount_pick, status, settled_at, created_at, orders(id, delivery_address, stores(name))")
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
    { label: "오늘",   pick: sumPick(todayEarnings), count: todayEarnings.length },
    { label: "이번 주", pick: sumPick(weekEarnings),  count: weekEarnings.length },
    { label: "이번 달", pick: sumPick(monthEarnings), count: monthEarnings.length },
  ];

  // 정산 완료 내역 (최근 10건)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const settlementHistory = earnings
    .filter((e: { status: string }) => e.status === "settled")
    .slice(0, 10)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((e: any) => ({
      date:   new Date(e.settled_at ?? e.created_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric" }),
      pick:   Number(e.amount_pick),
      status: "정산완료",
    }));

  return NextResponse.json({ pickBalance, periodStats, settlementHistory });
}

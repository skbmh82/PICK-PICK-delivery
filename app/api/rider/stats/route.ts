import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

// GET /api/rider/stats — 오늘 요약 + 주간 수익
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
    .select("id, role, name")
    .eq("auth_id", user.id)
    .single();

  if (!profile || !["rider", "admin"].includes(profile.role)) {
    return NextResponse.json({ error: "라이더 권한이 필요합니다" }, { status: 403 });
  }

  const now        = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  // 오늘 내 배달 목록
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: todayDeliveries } = await (admin as any)
    .from("orders")
    .select("id, status, delivery_fee, rider_earnings(amount_pick)")
    .eq("rider_id", profile.id)
    .gte("created_at", todayStart);

  const deliveries = todayDeliveries ?? [];

  const completed  = deliveries.filter((d: { status: string }) => d.status === "delivered").length;
  const inProgress = deliveries.filter((d: { status: string }) =>
    ["picked_up", "delivering"].includes(d.status)
  ).length;

  const totalEarning = deliveries
    .filter((d: { status: string }) => d.status === "delivered")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .reduce((sum: number, d: { rider_earnings: any }) => {
      const earn = Array.isArray(d.rider_earnings)
        ? d.rider_earnings[0]?.amount_pick ?? 0
        : d.rider_earnings?.amount_pick ?? 0;
      return sum + Number(earn);
    }, 0);

  // 주간 수익 (오늘 포함 7일)
  const weekly: { day: string; pick: number; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d     = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const start = d.toISOString();
    const end   = new Date(d.getTime() + 86400000).toISOString();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: dayOrders } = await (admin as any)
      .from("orders")
      .select("id, rider_earnings(amount_pick)")
      .eq("rider_id", profile.id)
      .eq("status", "delivered")
      .gte("created_at", start)
      .lt("created_at", end);

    const dayPick = (dayOrders ?? []).reduce((sum: number, o: { rider_earnings: { amount_pick: number }[] }) => {
      const earn = Array.isArray(o.rider_earnings)
        ? o.rider_earnings[0]?.amount_pick ?? 0
        : 0;
      return sum + Number(earn);
    }, 0);

    const dayLabel = i === 0 ? "오늘" : ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
    weekly.push({ day: dayLabel, pick: dayPick, count: (dayOrders ?? []).length });
  }

  return NextResponse.json({
    riderName: profile.name,
    today: { completed, inProgress, totalEarning },
    weekly,
  });
}

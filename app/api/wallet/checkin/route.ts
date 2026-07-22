import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

const CHECKIN_REWARD  = 50;  // 매일 기본 PICK
const WEEKLY_BONUS    = 100; // 7일 완료 보너스 PICK
const ACTIVITY_BONUS  = 50;  // 최근 7일 내 실제 주문이 있으면 가산 (순수 탭 파밍 억제)

// 최근 7일 내 유효 주문(취소·환불·결제대기 제외) 존재 여부
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function hasRecentOrder(admin: any, userId: string): Promise<boolean> {
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const { count } = await admin
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", weekAgo)
    .not("status", "in", "(awaiting_pi_payment,cancelled,refunded)");
  return (count ?? 0) > 0;
}

// GET /api/wallet/checkin — 오늘 출석 여부 + 연속 출석일 조회
export async function GET() {
  const supabase = await createServerSupabaseClient();
  const admin    = getAdminSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (admin as any)
    .from("users").select("id").eq("auth_id", user.id).single();
  if (!profile) return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 });

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // 오늘 체크인 여부
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: todayCheckin } = await (admin as any)
    .from("daily_checkins")
    .select("id, streak, pick_earned")
    .eq("user_id", profile.id)
    .eq("checked_date", today)
    .maybeSingle();

  // 최근 streak (오늘 안 했으면 어제 기록 참조)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: lastCheckin } = await (admin as any)
    .from("daily_checkins")
    .select("checked_date, streak")
    .eq("user_id", profile.id)
    .order("checked_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  const currentStreak = todayCheckin?.streak ?? lastCheckin?.streak ?? 0;
  const activityBonus = (await hasRecentOrder(admin, profile.id)) ? ACTIVITY_BONUS : 0;

  return NextResponse.json({
    checkedToday: !!todayCheckin,
    streak:       currentStreak,
    reward:       CHECKIN_REWARD,
    activityBonus,   // 최근 주문 있으면 오늘 출석에 가산될 보너스
  });
}

// POST /api/wallet/checkin — 오늘 출석 체크인
export async function POST() {
  const supabase = await createServerSupabaseClient();
  const admin    = getAdminSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (admin as any)
    .from("users").select("id").eq("auth_id", user.id).single();
  if (!profile) return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 });

  const today     = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  // 중복 체크인 방지
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (admin as any)
    .from("daily_checkins")
    .select("id")
    .eq("user_id", profile.id)
    .eq("checked_date", today)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "오늘 이미 출석했습니다" }, { status: 409 });
  }

  // 어제 체크인 여부로 streak 계산
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: yesterdayCheckin } = await (admin as any)
    .from("daily_checkins")
    .select("streak")
    .eq("user_id", profile.id)
    .eq("checked_date", yesterday)
    .maybeSingle();

  const streak         = yesterdayCheckin ? yesterdayCheckin.streak + 1 : 1;
  const isWeekComplete = streak % 7 === 0;
  const activityBonus  = (await hasRecentOrder(admin, profile.id)) ? ACTIVITY_BONUS : 0;
  const totalReward    = CHECKIN_REWARD + (isWeekComplete ? WEEKLY_BONUS : 0) + activityBonus;

  // 출석 기록 저장
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: checkinError } = await (admin as any)
    .from("daily_checkins")
    .insert({ user_id: profile.id, checked_date: today, streak, pick_earned: totalReward });

  if (checkinError) {
    return NextResponse.json({ error: "출석 처리에 실패했습니다" }, { status: 500 });
  }

  // 지갑에 PICK 지급
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: wallet } = await (admin as any)
    .from("wallets")
    .select("id, pick_balance, total_earned")
    .eq("user_id", profile.id)
    .maybeSingle();

  if (wallet) {
    const newBalance     = Number(wallet.pick_balance) + totalReward;
    const newTotalEarned = Number(wallet.total_earned) + totalReward;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any)
      .from("wallets")
      .update({ pick_balance: newBalance, total_earned: newTotalEarned, updated_at: new Date().toISOString() })
      .eq("id", wallet.id);

    const parts = [`기본 ${CHECKIN_REWARD}`];
    if (isWeekComplete) parts.push(`7일보너스 ${WEEKLY_BONUS}`);
    if (activityBonus)  parts.push(`활동보너스 ${activityBonus}`);
    const description = `출석 보상 (${streak}일 연속 · ${parts.join(" + ")})`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any)
      .from("wallet_transactions")
      .insert({
        wallet_id:     wallet.id,
        type:          "reward",
        amount:        totalReward,
        balance_after: newBalance,
        description,
      });
  }

  return NextResponse.json({
    success:        true,
    streak,
    reward:         CHECKIN_REWARD,
    bonusReward:    isWeekComplete ? WEEKLY_BONUS : 0,
    activityBonus,
    totalReward,
    isWeekComplete,
    weekNumber:     Math.ceil(streak / 7),
  });
}

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

// 사용자 ID 앞 8자리를 대문자로 — 레퍼럴 코드
export function toReferralCode(userId: string) {
  return userId.replace(/-/g, "").slice(0, 8).toUpperCase();
}

// GET /api/referral — 내 레퍼럴 코드 + 초대 실적
export async function GET() {
  const supabase = await createServerSupabaseClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminSupabaseClient() as any;

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const { data: profile } = await admin
    .from("users").select("id, name").eq("auth_id", user.id).single();
  if (!profile) return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 });

  const code = toReferralCode(profile.id);

  // 실제 지급된 초대자 보상 트랜잭션 (description: "친구초대 보상 ...")
  // — 피초대자 가입 보상("친구초대 가입 보상 ...")과 구분됨
  const walletId = await getWalletId(admin, profile.id);
  const { data: rewardRows } = await admin
    .from("wallet_transactions")
    .select("amount")
    .eq("wallet_id", walletId)
    .eq("type", "reward")
    .ilike("description", "친구초대 보상%");

  // 실제 지급액 합산 (건수 × 상수 추정이 아니라 트랜잭션 금액 그대로)
  const fulfilledCount = (rewardRows ?? []).length;
  const totalReward    = (rewardRows ?? []).reduce(
    (sum: number, r: { amount: number | string }) => sum + Number(r.amount), 0,
  );

  // owner·rider 조건 미충족으로 대기 중인 초대도 실적에 포함
  const { count: pendingCount } = await admin
    .from("pending_referral_rewards")
    .select("id", { count: "exact", head: true })
    .eq("referrer_user_id", profile.id)
    .eq("fulfilled", false)
    .gt("referrer_amount", 0);

  const referralCount = fulfilledCount + (pendingCount ?? 0);

  return NextResponse.json({ code, referralCount, totalReward });
}

async function getWalletId(admin: any, userId: string): Promise<string> { // eslint-disable-line @typescript-eslint/no-explicit-any
  const { data } = await admin.from("wallets").select("id").eq("user_id", userId).single();
  return data?.id ?? "";
}

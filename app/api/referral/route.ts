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

  // 내가 초대한 기록 — wallet_transactions 에서 '친구초대 보상' 건수 집계
  const { data: txRows } = await admin
    .from("wallet_transactions")
    .select("id")
    .eq("wallet_id", await getWalletId(admin, profile.id))
    .eq("type", "reward")
    .ilike("description", "친구초대%");

  const referralCount = (txRows ?? []).length;
  const totalReward   = referralCount * Number(process.env.PICK_REFERRAL_REWARD ?? 50);

  return NextResponse.json({ code, referralCount, totalReward });
}

async function getWalletId(admin: any, userId: string): Promise<string> { // eslint-disable-line @typescript-eslint/no-explicit-any
  const { data } = await admin.from("wallets").select("id").eq("user_id", userId).single();
  return data?.id ?? "";
}

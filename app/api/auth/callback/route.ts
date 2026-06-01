import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { toReferralCode } from "@/app/api/referral/route";
import { createNotification } from "@/lib/notifications";

const REFERRER_REWARD   = Number(process.env.PICK_REFERRAL_REWARD_USER  ?? 5000);
const NEW_USER_REWARDS: Record<string, number> = {
  owner: Number(process.env.PICK_REFERRAL_REWARD_OWNER ?? 20000),
  rider: Number(process.env.PICK_REFERRAL_REWARD_RIDER ?? 10000),
  user:  Number(process.env.PICK_REFERRAL_REWARD_USER  ?? 5000),
};

// Supabase OAuth 콜백 핸들러 (카카오 등 소셜 로그인)
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code        = searchParams.get("code");
  const next        = searchParams.get("next") ?? "/home";
  const refCode     = searchParams.get("ref")?.toUpperCase().slice(0, 8) ?? null;
  const refRole     = searchParams.get("ref_role") ?? "user";
  const errorMsg    = searchParams.get("error_description");

  if (errorMsg) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorMsg)}`, origin)
    );
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", origin));
  }

  const supabase = await createServerSupabaseClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminSupabaseClient() as any;

  // code → session 교환
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.session) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error?.message ?? "auth_failed")}`, origin)
    );
  }

  const authUser = data.session.user;

  // users 테이블에 프로필 없으면 자동 생성 (신규 소셜 가입)
  const { data: existing } = await admin
    .from("users")
    .select("id, role")
    .eq("auth_id", authUser.id)
    .single();

  let newUserId: string | null = null;

  if (!existing) {
    // 카카오 프로필에서 이름/이메일 추출
    const kakaoName =
      (authUser.user_metadata?.full_name as string | undefined) ??
      (authUser.user_metadata?.name as string | undefined) ??
      (authUser.email?.split("@")[0] ?? "PICK유저");
    const email = authUser.email ?? "";

    // users 생성
    const { data: newUser } = await admin
      .from("users")
      .insert({
        auth_id:       authUser.id,
        name:          kakaoName,
        email,
        role:          refRole && ["user","owner","rider"].includes(refRole) ? refRole : "user",
        profile_image: (authUser.user_metadata?.avatar_url as string | undefined) ?? null,
      })
      .select("id, name")
      .single();

    // wallets 자동 생성
    if (newUser?.id) {
      await admin.from("wallets").insert({ user_id: newUser.id }).catch(() => {});
      newUserId = newUser.id as string;

      // 초대 코드가 있으면 PICK 보상 지급
      if (refCode && newUserId) {
        try {
          const { data: allUsers } = await admin.from("users").select("id, name");
          const referrer = (allUsers ?? []).find(
            (u: { id: string; name: string }) => toReferralCode(u.id) === refCode
          );

          if (referrer && referrer.id !== newUserId) {
            const role = refRole && ["user","owner","rider"].includes(refRole) ? refRole : "user";
            const newUserReward = NEW_USER_REWARDS[role] ?? REFERRER_REWARD;

            const { data: newWallet } = await admin
              .from("wallets").select("id, pick_balance, total_earned").eq("user_id", newUserId).single();
            const { data: referrerWallet } = await admin
              .from("wallets").select("id, pick_balance, total_earned").eq("user_id", referrer.id).single();

            if (newWallet && referrerWallet) {
              const newUserBal  = Number(newWallet.pick_balance)      + newUserReward;
              const referrerBal = Number(referrerWallet.pick_balance) + REFERRER_REWARD;

              await Promise.all([
                admin.from("wallets").update({
                  pick_balance: newUserBal,
                  total_earned: Number(newWallet.total_earned ?? 0) + newUserReward,
                  updated_at:   new Date().toISOString(),
                }).eq("id", newWallet.id),
                admin.from("wallet_transactions").insert({
                  wallet_id:     newWallet.id,
                  type:          "reward",
                  amount:        newUserReward,
                  balance_after: newUserBal,
                  description:   `친구초대 가입 보너스 (초대자: ${referrer.name})`,
                }),
                admin.from("wallets").update({
                  pick_balance: referrerBal,
                  total_earned: Number(referrerWallet.total_earned ?? 0) + REFERRER_REWARD,
                  updated_at:   new Date().toISOString(),
                }).eq("id", referrerWallet.id),
                admin.from("wallet_transactions").insert({
                  wallet_id:     referrerWallet.id,
                  type:          "reward",
                  amount:        REFERRER_REWARD,
                  balance_after: referrerBal,
                  description:   `친구초대 보상 (신규: ${newUser.name})`,
                }),
                createNotification({
                  userId: referrer.id,
                  type:   "reward",
                  title:  `${newUser.name}님이 초대 코드로 가입했어요! 🎉`,
                  body:   `${REFERRER_REWARD.toLocaleString()} PICK이 지갑에 추가됐습니다.`,
                  data:   { type: "referral" },
                }),
              ]);
            }
          }
        } catch {
          // 레퍼럴 처리 실패는 가입 자체를 막지 않음
        }
      }
    }
  }

  // pick-role 쿠키 설정 후 리다이렉트
  const role = existing?.role ?? (refRole && ["user","owner","rider"].includes(refRole) ? refRole : "user");
  const redirectUrl = new URL(next.startsWith("/") ? next : "/home", origin);
  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set("pick-role", role as string, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   60 * 60 * 24 * 7,
    path:     "/",
  });

  return response;
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { toReferralCode } from "@/app/api/referral/route";
import { createNotification } from "@/lib/notifications";

const RegisterSchema = z.object({
  email:        z.string().email(),
  password:     z.string().min(6),
  name:         z.string().min(2).max(50),
  role:         z.enum(["user", "owner", "rider"]),
  referralCode: z.string().length(8).optional(),
});

// 초대자는 역할 무관 항상 고정 보상
const REFERRER_REWARD = Number(process.env.PICK_REFERRAL_REWARD_USER ?? 5000);
// 신규 가입자는 역할별 웰컴 보너스
const NEW_USER_REWARDS: Record<string, number> = {
  owner: Number(process.env.PICK_REFERRAL_REWARD_OWNER ?? 20000),
  rider: Number(process.env.PICK_REFERRAL_REWARD_RIDER ?? 10000),
  user:  Number(process.env.PICK_REFERRAL_REWARD_USER  ?? 5000),
};

// POST /api/auth/register — 회원가입 (auth + 프로필 + 지갑 생성)
export async function POST(request: NextRequest) {
  try {
    const body   = await request.json().catch(() => null);
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "입력값이 올바르지 않습니다" }, { status: 400 });
    }

    const { email, password, name, role, referralCode } = parsed.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = getAdminSupabaseClient() as any;

    // 1. auth 계정 생성 (이미 있으면 기존 user 사용)
    let authUserId: string;
    const { data: createData, error: createError } = await admin.auth.admin.createUser({
      email, password, email_confirm: true,
    });

    if (createError) {
      // 이미 가입된 이메일 — 기존 사용자 ID 조회
      if (createError.message?.includes("already")) {
        const { data: listData } = await admin.auth.admin.listUsers();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const existing = listData?.users?.find((u: any) => u.email === email);
        if (!existing) return NextResponse.json({ ok: true }); // 로그인 페이지에서 처리
        authUserId = existing.id as string;
      } else {
        return NextResponse.json({ error: createError.message }, { status: 400 });
      }
    } else {
      authUserId = createData.user.id as string;
    }

    // 2. 프로필 upsert
    const { data: profile } = await admin
      .from("users")
      .upsert(
        { auth_id: authUserId, name, email, role },
        { onConflict: "auth_id", ignoreDuplicates: false }
      )
      .select("id")
      .single();

    // 3. 지갑 생성 (트리거가 이미 생성했으면 무시)
    if (profile?.id) {
      await admin
        .from("wallets")
        .insert({ user_id: profile.id, pick_balance: 0, locked_balance: 0, total_earned: 0 })
        .single()
        .catch(() => {});
    }

    // 4. 레퍼럴 코드가 있으면 보상 지급
    if (profile?.id && referralCode) {
      try {
        // 전체 유저에서 코드에 해당하는 초대자 찾기
        const { data: allUsers } = await admin.from("users").select("id, name");
        const referrer = (allUsers ?? []).find(
          (u: { id: string; name: string }) => toReferralCode(u.id) === referralCode.toUpperCase()
        );

        if (referrer && referrer.id !== profile.id) {
          const newUserReward  = NEW_USER_REWARDS[role] ?? REFERRER_REWARD;

          // 새 유저 지갑
          const { data: newWallet } = await admin
            .from("wallets").select("id, pick_balance, total_earned").eq("user_id", profile.id).single();
          // 초대자 지갑
          const { data: referrerWallet } = await admin
            .from("wallets").select("id, pick_balance, total_earned").eq("user_id", referrer.id).single();

          if (newWallet && referrerWallet) {
            const newUserBal  = Number(newWallet.pick_balance)      + newUserReward;
            const referrerBal = Number(referrerWallet.pick_balance) + REFERRER_REWARD;

            await Promise.all([
              // 새 유저 웰컴 보너스 (역할별)
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
              // 초대자 고정 보상 (5,000 PICK)
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
                description:   `친구초대 보상 (신규 ${role === "owner" ? "사장님" : role === "rider" ? "라이더" : "회원"}: ${name})`,
              }),
              createNotification({
                userId: referrer.id,
                type:   "reward",
                title:  `${name}님이 초대 코드로 가입했어요! 🎉`,
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

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[register] error:", err);
    return NextResponse.json({ ok: true }, { status: 200 }); // 에러여도 로그인 페이지로 이동
  }
}

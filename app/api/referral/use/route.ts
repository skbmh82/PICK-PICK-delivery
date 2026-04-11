import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { toReferralCode } from "@/app/api/referral/route";
import { createNotification } from "@/lib/notifications";

const UseSchema = z.object({
  code: z.string().length(8, "레퍼럴 코드는 8자리입니다"),
});

const REFERRAL_REWARD = Number(process.env.PICK_REFERRAL_REWARD ?? 50);

// POST /api/referral/use — 레퍼럴 코드 입력 → 초대자·피초대자 각 50 PICK
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminSupabaseClient() as any;

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const body   = await request.json().catch(() => null);
  const parsed = UseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "코드가 올바르지 않습니다" },
      { status: 400 },
    );
  }

  const { code } = parsed.data;

  // 현재 사용자 정보
  const { data: me } = await admin
    .from("users").select("id, name").eq("auth_id", user.id).single();
  if (!me) return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 });

  // 자기 자신 코드 방지
  if (toReferralCode(me.id) === code.toUpperCase()) {
    return NextResponse.json({ error: "자신의 초대 코드는 사용할 수 없습니다" }, { status: 400 });
  }

  // 이미 레퍼럴 보상을 받은 적이 있는지 확인
  const { data: myWallet } = await admin
    .from("wallets").select("id, pick_balance").eq("user_id", me.id).single();
  if (!myWallet) return NextResponse.json({ error: "지갑을 찾을 수 없습니다" }, { status: 404 });

  const { data: alreadyUsed } = await admin
    .from("wallet_transactions")
    .select("id")
    .eq("wallet_id", myWallet.id)
    .eq("type", "reward")
    .ilike("description", "친구초대%")
    .limit(1);

  if (alreadyUsed && alreadyUsed.length > 0) {
    return NextResponse.json({ error: "이미 초대 코드를 사용했습니다" }, { status: 409 });
  }

  // 초대자 조회 — 전체 users에서 코드 매칭 (uuid prefix 비교)
  const { data: allUsers } = await admin
    .from("users").select("id, name");

  const referrer = (allUsers ?? []).find(
    (u: { id: string; name: string }) => toReferralCode(u.id) === code.toUpperCase()
  );

  if (!referrer) {
    return NextResponse.json({ error: "유효하지 않은 초대 코드입니다" }, { status: 404 });
  }

  // 초대자 지갑
  const { data: referrerWallet } = await admin
    .from("wallets").select("id, pick_balance").eq("user_id", referrer.id).single();
  if (!referrerWallet) {
    return NextResponse.json({ error: "초대자의 지갑을 찾을 수 없습니다" }, { status: 404 });
  }

  // 두 지갑에 동시 지급
  const myNewBalance       = Number(myWallet.pick_balance)       + REFERRAL_REWARD;
  const referrerNewBalance = Number(referrerWallet.pick_balance) + REFERRAL_REWARD;

  await Promise.all([
    // 피초대자 지급
    admin.from("wallets")
      .update({ pick_balance: myNewBalance, total_earned: admin.rpc, updated_at: new Date().toISOString() })
      .eq("id", myWallet.id),
    admin.from("wallet_transactions").insert({
      wallet_id:    myWallet.id,
      type:         "reward",
      amount:       REFERRAL_REWARD,
      balance_after: myNewBalance,
      description:  `친구초대 가입 보상 (초대자: ${referrer.name})`,
    }),

    // 초대자 지급
    admin.from("wallets")
      .update({ pick_balance: referrerNewBalance, updated_at: new Date().toISOString() })
      .eq("id", referrerWallet.id),
    admin.from("wallet_transactions").insert({
      wallet_id:    referrerWallet.id,
      type:         "reward",
      amount:       REFERRAL_REWARD,
      balance_after: referrerNewBalance,
      description:  `친구초대 보상 (초대: ${me.name})`,
    }),

    // 초대자에게 알림
    createNotification({
      userId: referrer.id,
      type:   "reward",
      title:  `${me.name}님이 초대 코드를 사용했어요! 🎉`,
      body:   `${REFERRAL_REWARD} PICK이 지갑에 추가됐습니다.`,
      data:   { type: "referral" },
    }),
  ]);

  return NextResponse.json({
    ok:      true,
    reward:  REFERRAL_REWARD,
    message: `${REFERRAL_REWARD} PICK이 지갑에 적립됐어요!`,
  });
}

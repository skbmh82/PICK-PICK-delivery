import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { toReferralCode } from "@/app/api/referral/route";
import { createNotification } from "@/lib/notifications";

const UseSchema = z.object({
  code: z.string().length(8, "레퍼럴 코드는 8자리입니다"),
  role: z.enum(["user", "owner", "rider"]).optional(),
});

// 피초대자 역할별 가입 보상
const INVITEE_REWARD: Record<string, number> = {
  owner:  Number(process.env.PICK_REFERRAL_REWARD_OWNER  ?? 20000),
  rider:  Number(process.env.PICK_REFERRAL_REWARD_RIDER  ?? 10000),
  user:   Number(process.env.PICK_REFERRAL_REWARD_USER   ??  5000),
};

// 초대자 보상 (역할 무관, 1인당 최대 5회)
const REFERRER_REWARD   = Number(process.env.PICK_REFERRAL_REWARD_USER ?? 5000);
const MAX_REFERRAL_USES = 5;

// POST /api/referral/use — 레퍼럴 코드 입력 → 초대자(최대 5회)·피초대자(역할별) PICK 지급
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

  const { code, role: newRole } = parsed.data;

  // 현재 사용자 정보
  const { data: me } = await admin
    .from("users").select("id, name, role").eq("auth_id", user.id).single();
  if (!me) return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 });

  // 자기 자신 코드 방지
  if (toReferralCode(me.id) === code.toUpperCase()) {
    return NextResponse.json({ error: "자신의 초대 코드는 사용할 수 없습니다" }, { status: 400 });
  }

  // 이미 레퍼럴 보상을 받은 적이 있는지 확인
  const { data: myWallet } = await admin
    .from("wallets").select("id, pick_balance, total_earned").eq("user_id", me.id).single();
  if (!myWallet) return NextResponse.json({ error: "지갑을 찾을 수 없습니다" }, { status: 404 });

  const { data: alreadyUsed } = await admin
    .from("wallet_transactions")
    .select("id")
    .eq("wallet_id", myWallet.id)
    .eq("type", "reward")
    .ilike("description", "친구초대 가입%")
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
    .from("wallets").select("id, pick_balance, total_earned").eq("user_id", referrer.id).single();
  if (!referrerWallet) {
    return NextResponse.json({ error: "초대자의 지갑을 찾을 수 없습니다" }, { status: 404 });
  }

  // 피초대자 보상 결정 (요청한 역할 또는 현재 역할 기준)
  const effectiveRole = newRole ?? (me.role as string) ?? "user";
  const inviteeReward = INVITEE_REWARD[effectiveRole] ?? INVITEE_REWARD.user;

  // 초대자 최대 5회 초대 보상 제한 확인
  const { count: referralCount } = await admin
    .from("wallet_transactions")
    .select("id", { count: "exact", head: true })
    .eq("wallet_id", referrerWallet.id)
    .eq("type", "reward")
    .ilike("description", "친구초대 보상%");

  const referrerEligible = (referralCount ?? 0) < MAX_REFERRAL_USES;

  // 피초대자 지급 작업 (항상 실행)
  const myNewBalance = Number(myWallet.pick_balance) + inviteeReward;

  const ops: Promise<unknown>[] = [
    admin.from("wallets")
      .update({
        pick_balance: myNewBalance,
        total_earned: Number(myWallet.total_earned ?? 0) + inviteeReward,
        updated_at:   new Date().toISOString(),
      })
      .eq("id", myWallet.id),
    admin.from("wallet_transactions").insert({
      wallet_id:     myWallet.id,
      type:          "reward",
      amount:        inviteeReward,
      balance_after: myNewBalance,
      description:   `친구초대 가입 보상 (초대자: ${referrer.name})`,
    }),
  ];

  // 역할 업데이트 (요청한 경우)
  if (newRole) {
    ops.push(admin.from("users").update({ role: newRole }).eq("id", me.id));
  }

  // 초대자 보상 (최대 5회 이내인 경우에만)
  if (referrerEligible) {
    const referrerNewBalance = Number(referrerWallet.pick_balance) + REFERRER_REWARD;
    const remainAfter        = MAX_REFERRAL_USES - (referralCount ?? 0) - 1;

    ops.push(
      admin.from("wallets")
        .update({
          pick_balance: referrerNewBalance,
          total_earned: Number(referrerWallet.total_earned ?? 0) + REFERRER_REWARD,
          updated_at:   new Date().toISOString(),
        })
        .eq("id", referrerWallet.id),
      admin.from("wallet_transactions").insert({
        wallet_id:     referrerWallet.id,
        type:          "reward",
        amount:        REFERRER_REWARD,
        balance_after: referrerNewBalance,
        description:   `친구초대 보상 (초대: ${me.name})`,
      }),
      createNotification({
        userId: referrer.id,
        type:   "reward",
        title:  `${me.name}님이 초대 코드를 사용했어요! 🎉`,
        body:   remainAfter > 0
          ? `${REFERRER_REWARD.toLocaleString()} PICK 적립! (앞으로 ${remainAfter}명 더 초대 가능)`
          : `${REFERRER_REWARD.toLocaleString()} PICK 적립! (초대 보상 한도 도달)`,
        data:   { type: "referral" },
      }),
    );
  } else {
    // 한도 초과 — 초대자에게 알림만 (보상 없음)
    ops.push(
      createNotification({
        userId: referrer.id,
        type:   "reward",
        title:  `${me.name}님이 초대 코드를 사용했어요`,
        body:   "최대 초대 보상 한도(5명)에 도달해 이번엔 PICK이 지급되지 않았습니다.",
        data:   { type: "referral" },
      }),
    );
  }

  await Promise.all(ops);

  const roleLabel: Record<string, string> = { user: "일반 이용자", owner: "사장님", rider: "라이더" };
  return NextResponse.json({
    ok:      true,
    reward:  inviteeReward,
    message: `${inviteeReward.toLocaleString()} PICK 적립 완료!${newRole ? ` (${roleLabel[newRole]} 입장으로 설정됐어요)` : ""}`,
  });
}

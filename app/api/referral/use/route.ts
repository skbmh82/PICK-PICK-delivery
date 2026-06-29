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
  owner: Number(process.env.PICK_REFERRAL_REWARD_OWNER ?? 20000),
  rider: Number(process.env.PICK_REFERRAL_REWARD_RIDER ?? 10000),
  user:  Number(process.env.PICK_REFERRAL_REWARD_USER  ??  5000),
};

// 초대자 보상 (역할 무관, 1인당 최대 5회)
const REFERRER_REWARD   = Number(process.env.PICK_REFERRAL_REWARD_USER ?? 5000);
const MAX_REFERRAL_USES = 5;

// owner·rider는 조건 충족 후 지급 (즉시 지급 아님)
const DEFERRED_ROLES: Record<string, string> = {
  owner: "owner_first_order",
  rider: "rider_first_delivery",
};

// POST /api/referral/use
// - user  : 즉시 지급
// - owner : 가게 등록 + 첫 주문 완료 후 지급
// - rider : 첫 배달 완료 후 지급
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

  // 지갑 조회
  const { data: myWallet } = await admin
    .from("wallets").select("id, pick_balance, total_earned").eq("user_id", me.id).single();
  if (!myWallet) return NextResponse.json({ error: "지갑을 찾을 수 없습니다" }, { status: 404 });

  // 이미 사용했는지 확인 (즉시 지급된 경우 + 대기 중인 경우 모두 체크)
  const [{ data: alreadyPaid }, { data: alreadyPending }] = await Promise.all([
    admin.from("wallet_transactions")
      .select("id").eq("wallet_id", myWallet.id).eq("type", "reward")
      .ilike("description", "친구초대 가입%").limit(1),
    admin.from("pending_referral_rewards")
      .select("id").eq("invitee_user_id", me.id).limit(1),
  ]);

  if ((alreadyPaid && alreadyPaid.length > 0) || (alreadyPending && alreadyPending.length > 0)) {
    return NextResponse.json({ error: "이미 초대 코드를 사용했습니다" }, { status: 409 });
  }

  // 초대자 조회
  const { data: allUsers } = await admin.from("users").select("id, name");
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

  // 역할 결정
  const effectiveRole = newRole ?? (me.role as string) ?? "user";
  const inviteeReward = INVITEE_REWARD[effectiveRole] ?? INVITEE_REWARD.user;

  // 초대자 최대 5회 제한 — 완료된 보상 + 대기 중 보상 합산
  const [{ count: fulfilledCount }, { count: pendingCount }] = await Promise.all([
    admin.from("wallet_transactions")
      .select("id", { count: "exact", head: true })
      .eq("wallet_id", referrerWallet.id).eq("type", "reward")
      .ilike("description", "친구초대 보상%"),
    admin.from("pending_referral_rewards")
      .select("id", { count: "exact", head: true })
      .eq("referrer_user_id", referrer.id).eq("fulfilled", false).gt("referrer_amount", 0),
  ]);
  const totalReferralCount = (fulfilledCount ?? 0) + (pendingCount ?? 0);
  const referrerEligible   = totalReferralCount < MAX_REFERRAL_USES;
  const referrerAmount     = referrerEligible ? REFERRER_REWARD : 0;

  // 역할 업데이트
  const ops: Promise<unknown>[] = [];
  if (newRole) {
    ops.push(admin.from("users").update({ role: newRole }).eq("id", me.id));
  }

  // ── owner / rider: 조건부 지급 (pending) ─────────────────
  const conditionType = DEFERRED_ROLES[effectiveRole];
  if (conditionType) {
    ops.push(
      admin.from("pending_referral_rewards").insert({
        invitee_user_id:    me.id,
        invitee_wallet_id:  myWallet.id,
        invitee_amount:     inviteeReward,
        invitee_name:       me.name,
        referrer_user_id:   referrer.id,
        referrer_wallet_id: referrerWallet.id,
        referrer_amount:    referrerAmount,
        referrer_name:      referrer.name,
        condition_type:     conditionType,
      }),
    );

    // 초대자 알림 — 대기 중임을 알림
    const conditionLabel = conditionType === "owner_first_order"
      ? "가게 등록 후 첫 주문이 완료되면"
      : "첫 배달을 완료하면";
    ops.push(
      createNotification({
        userId: referrer.id,
        type:   "reward",
        title:  `${me.name}님이 초대 코드를 사용했어요`,
        body:   referrerEligible
          ? `${conditionLabel} ${REFERRER_REWARD.toLocaleString()} PICK이 지급됩니다.`
          : "이번 초대는 한도 초과로 보상이 지급되지 않습니다.",
        data:   { type: "referral" },
      }),
    );

    await Promise.all(ops);

    const roleLabel: Record<string, string> = { owner: "사장님", rider: "라이더" };
    const pendingMsg = conditionType === "owner_first_order"
      ? "가게 등록 + 첫 주문 완료 후 지급됩니다"
      : "첫 배달 완료 후 지급됩니다";
    return NextResponse.json({
      ok:      true,
      reward:  inviteeReward,
      pending: true,
      message: `${inviteeReward.toLocaleString()} PICK은 ${pendingMsg}!${newRole ? ` (${roleLabel[newRole]} 입장으로 설정됐어요)` : ""}`,
    });
  }

  // ── user: 즉시 지급 ───────────────────────────────────────
  const myNewBalance = Number(myWallet.pick_balance) + inviteeReward;

  ops.push(
    admin.from("wallets").update({
      pick_balance: myNewBalance,
      total_earned: Number(myWallet.total_earned ?? 0) + inviteeReward,
      updated_at:   new Date().toISOString(),
    }).eq("id", myWallet.id),
    admin.from("wallet_transactions").insert({
      wallet_id:     myWallet.id,
      type:          "reward",
      amount:        inviteeReward,
      balance_after: myNewBalance,
      description:   `친구초대 가입 보상 (초대자: ${referrer.name})`,
    }),
  );

  if (referrerEligible) {
    const referrerNewBalance = Number(referrerWallet.pick_balance) + REFERRER_REWARD;
    const remainAfter        = MAX_REFERRAL_USES - totalReferralCount - 1;
    ops.push(
      admin.from("wallets").update({
        pick_balance: referrerNewBalance,
        total_earned: Number(referrerWallet.total_earned ?? 0) + REFERRER_REWARD,
        updated_at:   new Date().toISOString(),
      }).eq("id", referrerWallet.id),
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

  return NextResponse.json({
    ok:      true,
    reward:  inviteeReward,
    pending: false,
    message: `${inviteeReward.toLocaleString()} PICK 적립 완료!`,
  });
}

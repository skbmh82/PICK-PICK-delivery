import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

const ChargeSchema = z.object({
  amount:      z.number().int().min(1).max(1000000),
  targetUserId: z.string().uuid().optional(), // 관리자용: 타겟 유저 지정 (없으면 본인)
  description: z.string().max(100).optional(),
});

// POST /api/wallet/charge — PICK 충전 (관리자: 타겟 유저 지정 가능, 일반: 본인만)
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const admin    = getAdminSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (admin as any)
    .from("users").select("id, role").eq("auth_id", user.id).single();
  if (!profile) return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 });

  const body   = await request.json().catch(() => null);
  const parsed = ChargeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "입력값이 올바르지 않습니다" }, { status: 400 });
  }

  const { amount, targetUserId, description } = parsed.data;

  // 타겟 유저 결정
  let chargeUserId = profile.id;
  if (targetUserId && targetUserId !== profile.id) {
    if (profile.role !== "admin") {
      return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 });
    }
    chargeUserId = targetUserId;
  }

  // 지갑 조회
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: wallet } = await (admin as any)
    .from("wallets").select("id, pick_balance, total_earned").eq("user_id", chargeUserId).single();

  if (!wallet) {
    return NextResponse.json({ error: "지갑을 찾을 수 없습니다. 회원가입 후 다시 시도해주세요." }, { status: 404 });
  }

  const newBalance    = Number(wallet.pick_balance) + amount;
  const newTotalEarned = Number(wallet.total_earned) + amount;

  // 잔액 업데이트
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await (admin as any)
    .from("wallets")
    .update({
      pick_balance: newBalance,
      total_earned: newTotalEarned,
      updated_at:   new Date().toISOString(),
    })
    .eq("id", wallet.id);

  if (updateError) {
    console.error("충전 오류:", updateError.message);
    return NextResponse.json({ error: "충전에 실패했습니다" }, { status: 500 });
  }

  // 거래 내역 기록
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any).from("wallet_transactions").insert({
    wallet_id:    wallet.id,
    type:         "charge",
    amount:       amount,
    balance_after: newBalance,
    description:  description ?? "PICK 충전",
  });

  return NextResponse.json({
    ok:         true,
    newBalance,
    charged:    amount,
  });
}

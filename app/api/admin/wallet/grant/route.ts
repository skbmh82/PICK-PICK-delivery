import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

const GrantSchema = z.object({
  targetUserId: z.string().uuid(),
  amount:       z.number().int().min(1).max(10000000),
  description:  z.string().max(100).optional(),
});

// POST /api/admin/wallet/grant — 관리자가 특정 유저에게 PICK 지급
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminSupabaseClient() as any;

  const { data: me } = await admin
    .from("users").select("role").eq("auth_id", user.id).single();
  if (me?.role !== "admin") {
    return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 });
  }

  const body   = await request.json().catch(() => null);
  const parsed = GrantSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "입력값이 올바르지 않습니다" }, { status: 400 });
  }

  const { targetUserId, amount, description } = parsed.data;

  const { data: wallet } = await admin
    .from("wallets")
    .select("id, pick_balance, total_earned")
    .eq("user_id", targetUserId)
    .single();

  if (!wallet) {
    return NextResponse.json({ error: "해당 유저의 지갑을 찾을 수 없습니다" }, { status: 404 });
  }

  const newBalance     = Number(wallet.pick_balance) + amount;
  const newTotalEarned = Number(wallet.total_earned) + amount;

  const { error: updateError } = await admin
    .from("wallets")
    .update({ pick_balance: newBalance, total_earned: newTotalEarned, updated_at: new Date().toISOString() })
    .eq("id", wallet.id);

  if (updateError) {
    return NextResponse.json({ error: "지급에 실패했습니다" }, { status: 500 });
  }

  await admin.from("wallet_transactions").insert({
    wallet_id:     wallet.id,
    type:          "charge",
    amount:        amount,
    balance_after: newBalance,
    description:   description ?? "관리자 PICK 지급",
  });

  return NextResponse.json({ ok: true, newBalance, granted: amount });
}

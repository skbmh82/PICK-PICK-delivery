import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

// GET /api/wallet/transactions — 내 거래 내역
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: wallet } = await (admin as any)
    .from("wallets")
    .select("id, pick_balance, locked_balance, total_earned")
    .eq("user_id", profile.id)
    .single();

  if (!wallet) {
    return NextResponse.json({ balance: 0, lockedBalance: 0, totalEarned: 0, transactions: [] });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: txs } = await (admin as any)
    .from("wallet_transactions")
    .select("id, type, amount, balance_after, description, created_at, ref_order_id")
    .eq("wallet_id", wallet.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return NextResponse.json({
    balance:      Number(wallet.pick_balance),
    lockedBalance: Number(wallet.locked_balance),
    totalEarned:  Number(wallet.total_earned),
    transactions: (txs ?? []).map((t: {
      id: string; type: string; amount: number;
      balance_after: number; description: string | null;
      created_at: string; ref_order_id: string | null;
    }) => ({
      id:           t.id,
      type:         t.type,
      amount:       Number(t.amount),
      balanceAfter: Number(t.balance_after),
      description:  t.description,
      createdAt:    t.created_at,
      refOrderId:   t.ref_order_id,
    })),
  });
}

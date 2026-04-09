// 서버 전용 — 클라이언트 컴포넌트에서 import 금지
import { createServerClient } from "./server";

export interface WalletRow {
  id: string;
  user_id: string;
  pick_balance: number;
  locked_balance: number;
  total_earned: number;
}

export interface TransactionRow {
  id: string;
  type: "charge" | "payment" | "refund" | "reward" | "transfer" | "withdraw";
  amount: number;
  balance_after: number;
  description: string | null;
  created_at: string;
}

// 서버: 지갑 잔액 조회
export async function fetchWalletByUserId(userId: string): Promise<WalletRow | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("wallets")
    .select("id, user_id, pick_balance, locked_balance, total_earned")
    .eq("user_id", userId)
    .single();

  if (error) return null;
  return data as WalletRow;
}

// 서버: 거래 내역 조회
export async function fetchTransactions(walletId: string, limit = 20): Promise<TransactionRow[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("wallet_transactions")
    .select("id, type, amount, balance_after, description, created_at")
    .eq("wallet_id", walletId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return (data ?? []) as TransactionRow[];
}

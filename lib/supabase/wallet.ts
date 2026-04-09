// 클라이언트 컴포넌트에서 사용 가능한 함수만 포함
import { supabase } from "./client";

// 현재 로그인 유저의 PICK 잔액 조회 (클라이언트용)
export async function fetchMyPickBalance(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from("wallets")
    .select("pick_balance")
    .eq("user_id", userId)
    .single();

  if (error || !data) return 0;
  return Number(data.pick_balance);
}

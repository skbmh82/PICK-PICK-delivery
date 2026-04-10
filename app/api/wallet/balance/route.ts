import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

// GET /api/wallet/balance
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
  if (!profile) return NextResponse.json({ balance: 0 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: wallet } = await (admin as any)
    .from("wallets")
    .select("pick_balance, locked_balance")
    .eq("user_id", profile.id)
    .single();

  return NextResponse.json({
    balance:       Number(wallet?.pick_balance  ?? 0),
    lockedBalance: Number(wallet?.locked_balance ?? 0),
  });
}

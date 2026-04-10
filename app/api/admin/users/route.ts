import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

// GET /api/admin/users — 전체 유저 + 지갑 잔액 목록 (관리자 전용)
export async function GET() {
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

  const { data: users } = await admin
    .from("users")
    .select("id, name, email, role, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const { data: wallets } = await admin
    .from("wallets")
    .select("user_id, pick_balance, total_earned");

  const walletMap = new Map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (wallets ?? []).map((w: any) => [w.user_id as string, w])
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = (users ?? []).map((u: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = walletMap.get(u.id as string) as any;
    return {
      id:           u.id,
      name:         u.name,
      email:        u.email,
      role:         u.role,
      createdAt:    u.created_at,
      pickBalance:  Number(w?.pick_balance  ?? 0),
      totalEarned:  Number(w?.total_earned  ?? 0),
      hasWallet:    !!w,
    };
  });

  return NextResponse.json({ users: result });
}

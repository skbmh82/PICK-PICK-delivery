import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

const RegisterSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(6),
  name:     z.string().min(2),
  role:     z.enum(["user", "owner", "rider"]),
});

// POST /api/auth/register — 회원가입 + 지갑 자동 생성
export async function POST(request: NextRequest) {
  const body   = await request.json().catch(() => null);
  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "입력값이 올바르지 않습니다" }, { status: 400 });
  }

  const { email, password, name, role } = parsed.data;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminSupabaseClient() as any;

  // 1. Supabase Auth 계정 생성 (admin → 이메일 인증 없이 바로 생성)
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,   // 이메일 인증 자동 확인 (개발 편의)
  });

  if (authError || !authData?.user) {
    const msg = (authError?.message as string) ?? "회원가입에 실패했습니다";
    // 중복 이메일
    if (msg.includes("already registered") || msg.includes("already been registered")) {
      return NextResponse.json({ error: "이미 가입된 이메일이에요" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const authUserId = authData.user.id as string;

  // 2. users 테이블에 프로필 저장
  const { data: profile, error: profileError } = await admin
    .from("users")
    .insert({ auth_id: authUserId, name, email, role })
    .select("id")
    .single();

  if (profileError || !profile) {
    // 롤백: auth user 삭제
    await admin.auth.admin.deleteUser(authUserId).catch(() => {});
    if ((profileError?.code as string) === "23505") {
      return NextResponse.json({ error: "이미 가입된 이메일이에요" }, { status: 409 });
    }
    return NextResponse.json({ error: "프로필 저장에 실패했습니다" }, { status: 500 });
  }

  // 3. 지갑 생성 (트리거가 없을 경우 대비)
  await admin
    .from("wallets")
    .insert({ user_id: profile.id, pick_balance: 0, locked_balance: 0, total_earned: 0 })
    .select()
    .single()
    .catch(() => {/* 트리거가 이미 생성한 경우 무시 */});

  return NextResponse.json({ ok: true, userId: profile.id as string }, { status: 201 });
}

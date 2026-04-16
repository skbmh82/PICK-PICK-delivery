import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

const RegisterSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(6),
  name:     z.string().min(2).max(50),
  role:     z.enum(["user", "owner", "rider"]),
});

// POST /api/auth/register — 회원가입 (auth + 프로필 + 지갑 생성)
export async function POST(request: NextRequest) {
  try {
    const body   = await request.json().catch(() => null);
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "입력값이 올바르지 않습니다" }, { status: 400 });
    }

    const { email, password, name, role } = parsed.data;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = getAdminSupabaseClient() as any;

    // 1. auth 계정 생성 (이미 있으면 기존 user 사용)
    let authUserId: string;
    const { data: createData, error: createError } = await admin.auth.admin.createUser({
      email, password, email_confirm: true,
    });

    if (createError) {
      // 이미 가입된 이메일 — 기존 사용자 ID 조회
      if (createError.message?.includes("already")) {
        const { data: listData } = await admin.auth.admin.listUsers();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const existing = listData?.users?.find((u: any) => u.email === email);
        if (!existing) return NextResponse.json({ ok: true }); // 로그인 페이지에서 처리
        authUserId = existing.id as string;
      } else {
        return NextResponse.json({ error: createError.message }, { status: 400 });
      }
    } else {
      authUserId = createData.user.id as string;
    }

    // 2. 프로필 upsert
    const { data: profile } = await admin
      .from("users")
      .upsert(
        { auth_id: authUserId, name, email, role },
        { onConflict: "auth_id", ignoreDuplicates: false }
      )
      .select("id")
      .single();

    // 3. 지갑 생성 (트리거가 이미 생성했으면 무시)
    if (profile?.id) {
      await admin
        .from("wallets")
        .insert({ user_id: profile.id, pick_balance: 0, locked_balance: 0, total_earned: 0 })
        .single()
        .catch(() => {});
    }

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("[register] error:", err);
    return NextResponse.json({ ok: true }, { status: 200 }); // 에러여도 로그인 페이지로 이동
  }
}

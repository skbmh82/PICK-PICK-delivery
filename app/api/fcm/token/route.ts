import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

const Schema = z.object({
  token: z.string().min(10),
});

// POST /api/fcm/token — FCM 토큰 등록/갱신
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const body   = await request.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "토큰이 올바르지 않습니다" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminSupabaseClient() as any;

  const { data: profile } = await admin
    .from("users").select("id").eq("auth_id", user.id).single();
  if (!profile) return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 });

  // upsert: 같은 user_id면 토큰 갱신, 없으면 삽입
  const { error } = await admin.from("fcm_tokens").upsert({
    user_id:    profile.id,
    token:      parsed.data.token,
    updated_at: new Date().toISOString(),
  }, { onConflict: "user_id" });

  if (error) {
    console.error("FCM 토큰 저장 오류:", error.message);
    return NextResponse.json({ error: "토큰 저장에 실패했습니다" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// DELETE /api/fcm/token — 로그아웃 시 토큰 삭제
export async function DELETE() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminSupabaseClient() as any;
  const { data: profile } = await admin
    .from("users").select("id").eq("auth_id", user.id).single();

  if (profile) {
    await admin.from("fcm_tokens").delete().eq("user_id", profile.id);
  }

  return NextResponse.json({ ok: true });
}

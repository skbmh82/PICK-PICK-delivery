import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// 로그인 후 pick-role 쿠키 설정
// 클라이언트에서 로그인 성공 → 이 API 호출 → httpOnly 쿠키 설정
export async function POST() {
  const supabase = await createServerSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "인증되지 않은 요청" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("auth_id", user.id)
    .single();

  const role = (profile?.role as string) ?? "user";

  const response = NextResponse.json({ role });

  response.cookies.set("pick-role", role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7일
    path: "/",
  });

  return response;
}

// 로그아웃 시 pick-role 쿠키 삭제
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("pick-role");
  return response;
}

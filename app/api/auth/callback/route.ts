import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

// Supabase OAuth 콜백 핸들러 (카카오 등 소셜 로그인)
// Supabase가 code를 넘겨주면 → 세션 교환 → users/wallets 자동 생성 → pick-role 쿠키 설정
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code     = searchParams.get("code");
  const next     = searchParams.get("next") ?? "/home";
  const errorMsg = searchParams.get("error_description");

  if (errorMsg) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorMsg)}`, origin)
    );
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", origin));
  }

  const supabase = await createServerSupabaseClient();
  const admin    = getAdminSupabaseClient();

  // code → session 교환
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.session) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error?.message ?? "auth_failed")}`, origin)
    );
  }

  const authUser = data.session.user;

  // users 테이블에 프로필 없으면 자동 생성 (신규 소셜 가입)
  const { data: existing } = await admin
    .from("users")
    .select("id, role")
    .eq("auth_id", authUser.id)
    .single();

  if (!existing) {
    // 카카오 프로필에서 이름/이메일 추출
    const kakaoName =
      (authUser.user_metadata?.full_name as string | undefined) ??
      (authUser.user_metadata?.name as string | undefined) ??
      (authUser.email?.split("@")[0] ?? "PICK유저");
    const email = authUser.email ?? "";

    // users 생성
    const { data: newUser } = await admin
      .from("users")
      .insert({
        auth_id:       authUser.id,
        name:          kakaoName,
        email,
        role:          "user",
        profile_image: (authUser.user_metadata?.avatar_url as string | undefined) ?? null,
      })
      .select("id")
      .single();

    // wallets 자동 생성
    if (newUser?.id) {
      await admin.from("wallets").insert({ user_id: newUser.id });
    }
  }

  // pick-role 쿠키 설정 후 리다이렉트
  const role = existing?.role ?? "user";
  const redirectUrl = new URL(next.startsWith("/") ? next : "/home", origin);
  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set("pick-role", role as string, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   60 * 60 * 24 * 7,
    path:     "/",
  });

  return response;
}

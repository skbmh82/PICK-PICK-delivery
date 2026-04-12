import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// ── 경로별 권한 정의 ──────────────────────────────────
// 인증 필요 (역할 무관)
const AUTH_REQUIRED = [
  "/wallet",
  "/orders",
  "/my-pick",
  "/notifications",
  "/checkout",
  "/payments",
];

// 역할별 전용 경로
const ROLE_ROUTES: Record<string, string[]> = {
  "/owner": ["owner", "admin"],
  "/rider": ["rider", "admin"],
  "/admin": ["admin"],
};

// 로그인 상태면 리다이렉트할 인증 페이지
const AUTH_PAGES = ["/login", "/register", "/forgot-password", "/reset-password"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 정적 파일, API, Next.js 내부 경로는 통과
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/manifest") ||
    pathname.startsWith("/sw") ||
    pathname.match(/\.\w+$/)          // .png, .jpg, .js 등
  ) {
    return NextResponse.next();
  }

  // ── Supabase 세션 갱신 (SSR 필수) ─────────────────────
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(toSet) {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: request.headers } });
          toSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const isAuthed = !!user;

  // ── 루트 경로 리다이렉트 ──────────────────────────────
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // ── 인증 페이지 — 로그인 상태면 홈으로 ───────────────
  if (AUTH_PAGES.some((p) => pathname.startsWith(p))) {
    if (isAuthed) {
      return NextResponse.redirect(new URL("/home", request.url));
    }
    return response;
  }

  // ── 인증 필요 경로 ─────────────────────────────────────
  const needsAuth =
    AUTH_REQUIRED.some((p) => pathname.startsWith(p)) ||
    Object.keys(ROLE_ROUTES).some((p) => pathname.startsWith(p));

  if (needsAuth && !isAuthed) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── 역할 기반 접근 제어 ────────────────────────────────
  if (isAuthed) {
    const role = request.cookies.get("pick-role")?.value ?? "user";

    for (const [prefix, allowed] of Object.entries(ROLE_ROUTES)) {
      if (pathname.startsWith(prefix)) {
        if (!allowed.includes(role)) {
          // 권한 없는 역할 → 홈으로
          return NextResponse.redirect(new URL("/home", request.url));
        }
        break;
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * 아래 경로는 제외:
     * - _next/static, _next/image
     * - favicon, manifest, sw 파일
     * - public 폴더 파일
     */
    "/((?!_next/static|_next/image|favicon.ico|icons|manifest|sw|workbox).*)",
  ],
};

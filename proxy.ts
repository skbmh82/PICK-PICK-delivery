import { NextRequest, NextResponse } from "next/server";

// ── 라우트 분류 ────────────────────────────────
const PUBLIC_ROUTES   = ["/login", "/register"];          // 누구나 접근 가능
const AUTH_ROUTES     = ["/home", "/wallet", "/orders", "/my-pick", "/store"]; // 로그인 필요
const OWNER_ROUTES    = ["/owner"];                        // owner, admin만
const RIDER_ROUTES    = ["/rider"];                        // rider, admin만
const ADMIN_ROUTES    = ["/admin"];                        // admin만

function matchesAny(pathname: string, routes: string[]) {
  return routes.some((r) => pathname === r || pathname.startsWith(r + "/"));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 정적 파일, API, Next.js 내부 경로는 건너뜀
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const response = NextResponse.next({ request });

  // 세션 확인: supabase.auth.token 또는 pick-role 쿠키 존재 여부로 판단
  // (sb_publishable_* ANON KEY는 GoTrue getUser() API를 거치면 실패하므로 쿠키 직접 확인)
  const hasSession = !!request.cookies.get("supabase.auth.token")?.value;
  const roleCookie = request.cookies.get("pick-role")?.value;
  const isLoggedIn = hasSession || !!roleCookie;

  // ── 1. 루트("/") → 적절한 페이지로 리다이렉트 ──
  if (pathname === "/") {
    const dest = isLoggedIn ? "/home" : "/login";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // ── 2. 공개 라우트 (로그인 상태면 홈으로) ──
  if (matchesAny(pathname, PUBLIC_ROUTES)) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/home", request.url));
    }
    return response;
  }

  // ── 3. 역할 기반 라우트 체크 (pick-role 쿠키 사용) ──
  // Note: AUTH_ROUTES(home/wallet/orders/my-pick)는 미들웨어 레벨에서 체크하지 않음.
  // Pi Network pinet.com 프록시가 Cookie 헤더를 Vercel로 전달하지 않아
  // 서버에서 쿠키를 읽으면 항상 비로그인으로 판단되어 무한 리다이렉트가 발생함.
  // 인증 보호는 각 페이지의 클라이언트 훅(useAuth)에서 처리.
  if (
    isLoggedIn && roleCookie &&
    (matchesAny(pathname, OWNER_ROUTES) ||
     matchesAny(pathname, RIDER_ROUTES) ||
     matchesAny(pathname, ADMIN_ROUTES))
  ) {
    if (matchesAny(pathname, OWNER_ROUTES) && !["owner", "admin"].includes(roleCookie)) {
      return NextResponse.redirect(new URL("/home", request.url));
    }
    if (matchesAny(pathname, RIDER_ROUTES) && !["rider", "admin"].includes(roleCookie)) {
      return NextResponse.redirect(new URL("/home", request.url));
    }
    if (matchesAny(pathname, ADMIN_ROUTES) && roleCookie !== "admin") {
      return NextResponse.redirect(new URL("/home", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

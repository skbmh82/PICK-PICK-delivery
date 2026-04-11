import { createServerClient } from "@supabase/ssr";
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

  // Supabase 세션 확인용 클라이언트 생성
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 현재 로그인 유저 확인 (세션 쿠키 기반)
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

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

  // ── 3. 인증 필요 라우트 (비로그인 → 로그인으로) ──
  if (
    matchesAny(pathname, AUTH_ROUTES) ||
    matchesAny(pathname, OWNER_ROUTES) ||
    matchesAny(pathname, RIDER_ROUTES) ||
    matchesAny(pathname, ADMIN_ROUTES)
  ) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // ── 4. 역할 기반 라우트 체크 ──
  if (
    isLoggedIn &&
    (matchesAny(pathname, OWNER_ROUTES) ||
     matchesAny(pathname, RIDER_ROUTES) ||
     matchesAny(pathname, ADMIN_ROUTES))
  ) {
    // 역할은 pick-role 쿠키에서 읽음 (로그인 시 API에서 설정)
    const roleCookie = request.cookies.get("pick-role")?.value;

    if (roleCookie) {
      const isOwnerRoute = matchesAny(pathname, OWNER_ROUTES);
      const isRiderRoute = matchesAny(pathname, RIDER_ROUTES);
      const isAdminRoute = matchesAny(pathname, ADMIN_ROUTES);

      if (isOwnerRoute && !["owner", "admin"].includes(roleCookie)) {
        return NextResponse.redirect(new URL("/home", request.url));
      }
      if (isRiderRoute && !["rider", "admin"].includes(roleCookie)) {
        return NextResponse.redirect(new URL("/home", request.url));
      }
      if (isAdminRoute && roleCookie !== "admin") {
        return NextResponse.redirect(new URL("/home", request.url));
      }
    } else {
      // pick-role 쿠키 없으면 서버에서 조회 후 설정
      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("auth_id", user!.id)
        .single();

      if (profile) {
        const role = profile.role as string;
        response.cookies.set("pick-role", role, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 7일
          path: "/",
        });

        const isOwnerRoute = matchesAny(pathname, OWNER_ROUTES);
        const isRiderRoute = matchesAny(pathname, RIDER_ROUTES);
        const isAdminRoute = matchesAny(pathname, ADMIN_ROUTES);

        if (isOwnerRoute && !["owner", "admin"].includes(role)) {
          return NextResponse.redirect(new URL("/home", request.url));
        }
        if (isRiderRoute && !["rider", "admin"].includes(role)) {
          return NextResponse.redirect(new URL("/home", request.url));
        }
        if (isAdminRoute && role !== "admin") {
          return NextResponse.redirect(new URL("/home", request.url));
        }
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

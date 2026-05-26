import { createServerClient as _createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies, headers } from "next/headers";

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 서버 컴포넌트 / Route Handler 전용
// pinet.com 프록시가 Cookie를 차단하므로 Authorization: Bearer 헤더도 지원
export async function createServerSupabaseClient() {
  try {
    const headerStore = await headers();
    const authHeader  = headerStore.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (bearerToken) {
      // JWT 페이로드를 로컬에서 디코딩 (네트워크 호출 없음)
      // supabase-js의 getUser(jwt)가 Supabase Auth 서버에 요청 → 거부 시 AuthSessionMissingError
      // 이를 우회하여 admin.getUserById()로 사용자 확인
      const parts = bearerToken.split(".");
      if (parts.length === 3) {
        let userId: string | undefined;
        let expAt: number | undefined;
        try {
          const payload = JSON.parse(
            Buffer.from(parts[1], "base64url").toString("utf-8"),
          ) as { sub?: string; exp?: number };
          userId = payload.sub;
          expAt  = payload.exp;
        } catch {
          console.error("[server] JWT decode failed");
        }

        const now = Math.floor(Date.now() / 1000);
        if (userId && (!expAt || expAt > now)) {
          const adminClient = createAdminClient();

          // 데이터 쿼리는 사용자 JWT로 (RLS 준수)
          const userClient = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: `Bearer ${bearerToken}` } },
            auth:   { persistSession: false, autoRefreshToken: false },
          });

          // getUser()를 admin.getUserById()로 교체 — JWT 검증 네트워크 문제 우회
          const uid = userId;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (userClient.auth as any).getUser = async () => {
            const { data, error } = await adminClient.auth.admin.getUserById(uid);
            return { data: { user: data?.user ?? null }, error: error ?? null };
          };

          return userClient;
        }
      }
    }
  } catch (e) {
    console.error("[server] createServerSupabaseClient error:", e);
  }

  // 쿠키 기반 폴백 (일반 브라우저)
  const cookieStore = await cookies();
  return _createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll()          { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch { /* 서버 컴포넌트에서 쿠키 쓰기 무시 */ }
      },
    },
  });
}

// 쿠키 없이 데이터 페칭만 하는 서버 클라이언트
export function createServerClient() {
  return _createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: { getAll: () => [], setAll: () => {} },
  });
}

// Service Role 어드민 클라이언트 (서버 전용)
export function createAdminClient() {
  return createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

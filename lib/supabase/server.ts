import { createServerClient as _createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies, headers } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 서버 컴포넌트 / Route Handler 전용
// pinet.com 프록시가 Cookie를 차단하므로 Authorization: Bearer 헤더도 지원
export async function createServerSupabaseClient() {
  // ① Authorization: Bearer 헤더 우선 (Pi Browser / pinet.com 환경)
  try {
    const headerStore = await headers();
    const authHeader = headerStore.get("authorization");
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (bearerToken) {
      const client = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${bearerToken}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      });

      // getUser() 를 override — bearer token으로 직접 검증
      const origGetUser = client.auth.getUser.bind(client.auth);
      client.auth.getUser = async (jwt?: string) => origGetUser(jwt ?? bearerToken);

      return client;
    }
  } catch { /* headers() 사용 불가 환경 무시 */ }

  // ② 쿠키 기반 (일반 브라우저 fallback)
  const cookieStore = await cookies();
  return _createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
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
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

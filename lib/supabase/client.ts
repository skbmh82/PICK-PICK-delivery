import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 브라우저 클라이언트 — @supabase/ssr 사용으로 세션이 쿠키에 저장됨
// (미들웨어에서 세션 읽기 가능)
export function getSupabaseClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// 기본 export (직접 import 해서 쓸 때)
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

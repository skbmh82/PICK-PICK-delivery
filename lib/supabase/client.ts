import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// pinet.com 프록시가 쿠키 헤더를 차단하므로 localStorage 기반 createClient 사용
// setSession() / getSession() 모두 localStorage에서 동작 → 페이지 이동 후에도 세션 유지
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: "sb-pickpick-session",
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export function getSupabaseClient() {
  return supabase;
}

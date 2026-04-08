import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 서버 전용 클라이언트 — 매 요청마다 새 인스턴스 생성 (서버 컴포넌트, Route Handler 용)
export function createServerClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      // 서버 사이드에서는 세션 자동 저장 비활성화
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

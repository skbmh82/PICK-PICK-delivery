import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 브라우저 클라이언트 — 싱글톤
let client: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey);
  }
  return client;
}

// 기본 export (서버 컴포넌트 없이 직접 쓸 때)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

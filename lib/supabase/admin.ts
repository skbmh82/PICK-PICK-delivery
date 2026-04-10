// 서버 전용 — Service Role 클라이언트
// SUPABASE_SERVICE_ROLE_KEY 를 사용하므로 절대 클라이언트에 노출 금지
// app/api/* 서버 라우트에서만 import 하세요
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// 싱글턴 (모듈 캐시 활용)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _adminClient: SupabaseClient<any> | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getAdminSupabaseClient(): SupabaseClient<any> {
  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY 환경변수가 설정되지 않았습니다.");
  }
  if (!_adminClient) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _adminClient = createClient<any>(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return _adminClient;
}

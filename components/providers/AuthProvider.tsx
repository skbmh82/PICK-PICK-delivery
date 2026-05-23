"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabase/client";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const init             = useAuthStore((s) => s.init);
  const refreshFromSession = useAuthStore((s) => s.refreshFromSession);
  const clearUser        = useAuthStore((s) => s.clearUser);

  useEffect(() => {
    // ── fetch 인터셉터: 모든 /api/ 요청에 Authorization: Bearer 자동 추가 ──
    // pinet.com 프록시가 Cookie 헤더를 차단하므로 서버 auth는 Bearer 토큰으로 처리
    const nativeFetch = window.fetch.bind(window);
    window.fetch = async (input, init = {}) => {
      const url =
        typeof input === "string" ? input
        : input instanceof URL ? input.toString()
        : (input as Request).url;

      if (url.startsWith("/api/")) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          const reqInit = init as RequestInit;
          const hdrs = new Headers(reqInit.headers);
          if (!hdrs.has("Authorization")) {
            hdrs.set("Authorization", `Bearer ${session.access_token}`);
          }
          return nativeFetch(input, { ...reqInit, headers: hdrs });
        }
      }
      return nativeFetch(input, init);
    };

    // ── 1. 마운트 시 세션 1회 확인 ──
    void init();

    // ── 2. 세션 변경 감지 ──
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) void refreshFromSession(session.user.id);
        else clearUser();
      }
    );

    return () => {
      window.fetch = nativeFetch; // 인터셉터 복원
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}

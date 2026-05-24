"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabase/client";

// 모듈 레벨 토큰 캐시 — onAuthStateChange로 동기 업데이트
// getSession() 비동기 호출 없이 인터셉터에서 즉시 사용 가능
let _cachedToken: string | null = null;

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const init               = useAuthStore((s) => s.init);
  const refreshFromSession = useAuthStore((s) => s.refreshFromSession);
  const clearUser          = useAuthStore((s) => s.clearUser);

  useEffect(() => {
    const nativeFetch = window.fetch.bind(window);

    window.fetch = async (input: RequestInfo | URL, reqInit: RequestInit = {}) => {
      const url =
        typeof input === "string" ? input
        : input instanceof URL   ? input.toString()
        : (input as Request).url;

      if (url.startsWith("/api/")) {
        // 캐시된 토큰 우선 — 없으면 getSession() 폴백
        const token =
          _cachedToken ??
          (await supabase.auth.getSession()).data.session?.access_token ??
          null;

        if (token) {
          const hdrs = new Headers(reqInit.headers);
          if (!hdrs.has("Authorization")) {
            hdrs.set("Authorization", `Bearer ${token}`);
          }
          return nativeFetch(input, { ...reqInit, headers: hdrs });
        }
      }
      return nativeFetch(input, reqInit);
    };

    // ① 현재 세션에서 토큰 캐시 초기화
    void supabase.auth.getSession().then(({ data: { session } }) => {
      _cachedToken = session?.access_token ?? null;
    });

    // ② 앱 마운트 시 세션 1회 확인
    void init();

    // ③ 세션 변경 감지 → 캐시 동기화
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        _cachedToken = session?.access_token ?? null;
        if (session?.user) void refreshFromSession(session.user.id);
        else clearUser();
      }
    );

    return () => {
      window.fetch = nativeFetch;
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}

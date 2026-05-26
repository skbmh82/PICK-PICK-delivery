"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabase/client";

// 모듈 레벨 토큰 캐시
// Pi Browser는 하드 네비게이션마다 모든 스토리지를 초기화하므로
// URL 해시(#_pp=TOKEN)로 토큰을 넘기고 여기에 캐시한다
let _cachedToken: string | null = null;

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const init               = useAuthStore((s) => s.init);
  const refreshFromSession = useAuthStore((s) => s.refreshFromSession);
  const clearUser          = useAuthStore((s) => s.clearUser);

  useEffect(() => {
    // ① URL 해시에서 토큰 추출 — Pi Browser 하드 네비게이션 후 토큰 전달 수단
    //    window.location.replace("/home#_pp=TOKEN") 으로 넘겨받은 토큰
    const hashToken = (() => {
      try {
        const m = window.location.hash.match(/[#&]_pp=([^&]+)/);
        if (!m) return null;
        const tok = decodeURIComponent(m[1]);
        // 해시에서 토큰 제거 (URL에 노출 최소화)
        const clean = window.location.pathname + window.location.search;
        window.history.replaceState(null, "", clean);
        return tok;
      } catch { return null; }
    })();

    if (hashToken) _cachedToken = hashToken;

    // ② fetch 인터셉터 — /api/ 요청마다 Authorization 자동 주입
    const nativeFetch = window.fetch.bind(window);

    window.fetch = async (input: RequestInfo | URL, reqInit: RequestInit = {}) => {
      const url =
        typeof input === "string" ? input
        : input instanceof URL   ? input.toString()
        : (input as Request).url;

      if (url.startsWith("/api/")) {
        // _cachedToken(해시 토큰 포함) → getSession() → sessionStorage → localStorage 순 폴백
        const token =
          _cachedToken ??
          (await supabase.auth.getSession()).data.session?.access_token ??
          (typeof sessionStorage !== "undefined" ? sessionStorage.getItem("_pp_token") : null) ??
          (typeof localStorage !== "undefined"   ? localStorage.getItem("_pp_token")   : null) ??
          null;

        const hdrs = new Headers(reqInit.headers);
        if (token && !hdrs.has("Authorization")) {
          hdrs.set("Authorization", `Bearer ${token}`);
        }
        return nativeFetch(input, { ...reqInit, headers: hdrs });
      }
      return nativeFetch(input, reqInit);
    };

    // ③ Supabase 세션 초기화
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token && !_cachedToken) {
        _cachedToken = session.access_token;
      }
    });

    void init();

    // ④ 세션 변경 감지 → 캐시 동기화
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.access_token) {
          _cachedToken = session.access_token;
          try { sessionStorage.setItem("_pp_token", session.access_token); } catch {}
          try { localStorage.setItem("_pp_token", session.access_token); } catch {}
        }
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

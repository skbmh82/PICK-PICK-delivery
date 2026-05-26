"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabase/client";

// ─── 모듈 레벨 ───────────────────────────────────────────────────────────────
// Pi Browser는 window.location.replace() 하드 네비게이션 시 스토리지를 초기화한다.
// React useEffect는 children → parent 순이라 자식 컴포넌트의 첫 API 호출이
// AuthProvider의 useEffect보다 먼저 실행된다.
// 따라서 해시 추출 + fetch 인터셉터를 모듈 최상위에서 즉시 실행한다.

let _cachedToken: string | null = null;

// ① 해시에서 access_token / refresh_token 추출 (모듈 로드 즉시)
interface HashTokens { at: string; rt: string | null }
const _hashTokens: HashTokens | null = (() => {
  if (typeof window === "undefined") return null;
  try {
    const hash = window.location.hash;
    if (!hash) return null;

    const atM = hash.match(/[#&]_pp_at=([^&]+)/);
    const rtM = hash.match(/[#&]_pp_rt=([^&]+)/);
    // 이전 단일 토큰 형식 (_pp=TOKEN) 하위 호환
    const legM = !atM ? hash.match(/[#&]_pp=([^&]+)/) : null;

    const at = atM ? decodeURIComponent(atM[1]) : legM ? decodeURIComponent(legM[1]) : null;
    const rt = rtM ? decodeURIComponent(rtM[1]) : null;

    if (!at) return null;
    _cachedToken = at;

    // URL에서 해시 제거
    window.history.replaceState(
      null, "",
      window.location.pathname + window.location.search,
    );
    return { at, rt };
  } catch { return null; }
})();

// ② fetch 인터셉터 설치 (모듈 로드 즉시) — /api/ 요청에 Authorization 자동 주입
if (typeof window !== "undefined") {
  const _native = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url =
      typeof input === "string" ? input
      : input instanceof URL    ? input.toString()
      : (input as Request).url;

    if (url.startsWith("/api/")) {
      const token =
        _cachedToken ??
        (await supabase.auth.getSession()).data.session?.access_token ??
        (typeof sessionStorage !== "undefined" ? sessionStorage.getItem("_pp_token") : null) ??
        (typeof localStorage  !== "undefined"  ? localStorage.getItem("_pp_token")  : null) ??
        null;

      const hdrs = new Headers(init.headers);
      if (token && !hdrs.has("Authorization")) hdrs.set("Authorization", `Bearer ${token}`);
      return _native(input, { ...init, headers: hdrs });
    }
    return _native(input, init);
  };
}
// ─────────────────────────────────────────────────────────────────────────────

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const init               = useAuthStore((s) => s.init);
  const refreshFromSession = useAuthStore((s) => s.refreshFromSession);
  const clearUser          = useAuthStore((s) => s.clearUser);

  useEffect(() => {
    // ③ 해시에 토큰이 있으면 Supabase 세션 완전 복원
    //    setSession() 호출 → onAuthStateChange(SIGNED_IN) → auth store 갱신
    if (_hashTokens?.at) {
      const { at, rt } = _hashTokens;
      if (rt) {
        void supabase.auth.setSession({ access_token: at, refresh_token: rt }).then(({ error }) => {
          if (!error) {
            try { sessionStorage.setItem("_pp_token", at); } catch {}
            try { localStorage.setItem("_pp_token", at); } catch {}
          }
        });
      } else {
        // refresh_token 없을 때는 스토리지에만 저장
        try { sessionStorage.setItem("_pp_token", at); } catch {}
        try { localStorage.setItem("_pp_token", at); } catch {}
      }
    }

    // ④ Supabase 세션 초기화 — 이미 스토리지에 세션이 있는 경우 캐시 동기화
    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token && !_cachedToken) {
        _cachedToken = session.access_token;
      }
    });

    void init();

    // ⑤ 세션 변경 감지 → 캐시 동기화
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.access_token) {
          _cachedToken = session.access_token;
          try { sessionStorage.setItem("_pp_token", session.access_token); } catch {}
          try { localStorage.setItem("_pp_token", session.access_token); } catch {}
        }
        if (session?.user) void refreshFromSession(session.user.id);
        else clearUser();
      },
    );

    return () => { subscription.unsubscribe(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}

"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/lib/supabase/client";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  // 개별 selector로 분리 — 객체 반환 패턴 사용하지 않음
  const init = useAuthStore((s) => s.init);
  const refreshFromSession = useAuthStore((s) => s.refreshFromSession);
  const clearUser = useAuthStore((s) => s.clearUser);

  useEffect(() => {
    // 1. 마운트 시 현재 세션 1회 확인
    void init();

    // 2. 이후 세션 변경만 감지 (로그인/로그아웃)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          void refreshFromSession(session.user.id);
        } else {
          clearUser();
        }
      }
    );

    // 3. 언마운트 시 구독 해제 (메모리 누수 방지)
    return () => {
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 마운트 1회만 실행

  return <>{children}</>;
}

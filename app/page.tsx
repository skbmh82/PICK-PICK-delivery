"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Status = "sdk" | "auth" | "login" | "done" | "error";

const LABEL: Record<Status, string> = {
  sdk:   "Pi SDK 초기화 중...",
  auth:  "Pi 인증 중...",
  login: "로그인 중...",
  done:  "이동 중...",
  error: "",
};

function dest(role: string) {
  return role === "owner" ? "/owner/dashboard"
       : role === "rider" ? "/rider/dashboard"
       : "/home";
}

export default function SplashPage() {
  const [status, setStatus] = useState<Status>("sdk");
  const [error,  setError]  = useState("");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      // Wait up to 10 s for Pi SDK (preloaded in <head>)
      let ms = 0;
      while (!window.Pi && ms < 10_000) {
        await new Promise<void>(r => setTimeout(r, 200));
        ms += 200;
      }
      if (cancelled) return;

      if (!window.Pi) {
        // Regular browser — go to login page as fallback
        window.location.href = "/login";
        return;
      }

      try {
        // ① Pi SDK init + authenticate → triggers permission dialog
        setStatus("auth");
        await (window.Pi.init({ version: "2.0" }) as unknown as Promise<void> | void);
        const auth = await window.Pi.authenticate(["username"], async () => {});
        if (cancelled) return;

        // ② Server-side session creation + cookie
        setStatus("login");
        const res = await fetch("/api/auth/pi-login", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ accessToken: auth.accessToken }),
        });

        if (!res.ok) {
          const j = await res.json().catch(() => ({})) as { error?: string };
          setError(j.error ?? `서버 오류 (${res.status})`);
          setStatus("error");
          return;
        }

        const { role, access_token, refresh_token } = await res.json() as {
          role: string; access_token: string; refresh_token: string;
        };

        // ③ 브라우저 Supabase 클라이언트에 세션 직접 주입
        await supabase.auth.setSession({ access_token, refresh_token });

        // ④ Navigate
        setStatus("done");
        window.location.href = dest(role);
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
          setStatus("error");
        }
      }
    }

    void run();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAF5FF] gap-6 px-6">
      {/* Logo */}
      <div className="text-center">
        <p className="text-7xl mb-3">🛵</p>
        <h1
          className="text-4xl font-black text-[#4C1D95]"
          style={{ fontFamily: "var(--font-logo, 'Jua', sans-serif)" }}
        >
          PICK PICK
        </h1>
        <p className="text-sm text-gray-500 mt-1">맛있는 음식을 PICK 하세요!</p>
      </div>

      {/* Spinner */}
      {status !== "error" && (
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-4 border-[#A855F7] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">{LABEL[status]}</p>
        </div>
      )}

      {/* Error */}
      {status === "error" && (
        <div className="w-full max-w-xs bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
          <p className="text-sm text-red-600 font-bold break-all">⚠️ {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-[#7B3FE4] text-white rounded-full text-sm font-bold active:scale-95 transition-transform"
          >
            다시 시도
          </button>
        </div>
      )}
    </div>
  );
}

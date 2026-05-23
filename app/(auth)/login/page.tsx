"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

declare global {
  interface Window {
    __piReady?: boolean;
    __piLoginDone?: boolean;
    __piAuthPromise?: Promise<{ accessToken: string; user: { uid: string; username: string } }>;
  }
}

export default function LoginPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirectTo   = searchParams.get("redirect") ?? "/home";

  const [piLoading, setPiLoading] = useState(false);
  const [piError,   setPiError]   = useState("");
  const [piStatus,  setPiStatus]  = useState<"detecting" | "found" | "not-found">("detecting");
  const piTriggered = useRef(false);

  const navigate = (role: string) => {
    if      (role === "owner") router.replace("/owner/dashboard");
    else if (role === "rider") router.replace("/rider/dashboard");
    else                       router.replace(redirectTo);
  };

  const doPiAuth = async () => {
    if (!window.Pi) {
      setPiError("Pi SDK가 로드되지 않았어요.");
      setPiStatus("not-found");
      return;
    }
    try {
      setPiLoading(true);
      setPiError("");
      const auth = await (window.__piAuthPromise ?? window.Pi.authenticate(["username", "payments"], async () => {}));
      window.__piAuthPromise = undefined;

      const res = await fetch("/api/auth/pi-login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ accessToken: auth.accessToken }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({})) as { error?: string };
        setPiError(j.error ?? `서버 오류 (${res.status})`);
        return;
      }
      const { access_token, refresh_token, role } = await res.json() as {
        access_token:  string;
        refresh_token: string;
        role:          string;
      };
      const { error: sessionErr } = await supabase.auth.setSession({ access_token, refresh_token });
      if (sessionErr) { setPiError(sessionErr.message); return; }
      // API 응답의 role로 바로 이동 (authStore 갱신 대기 불필요)
      navigate(role);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[Pi Auth Error]", msg);
      setPiError(`Pi 인증 오류: ${msg}`);
    } finally {
      setPiLoading(false);
    }
  };

  useEffect(() => {
    const tryPi = () => {
      if (piTriggered.current) return;
      // PiSdkLoader가 이미 자동 로그인 완료 → 바로 이동
      if (window.__piLoginDone) {
        piTriggered.current = true;
        setPiStatus("found");
        const role = (window as unknown as Record<string, string>).__piLoginRole ?? "user";
        navigate(role);
        return;
      }
      if (window.__piReady && window.Pi) {
        piTriggered.current = true;
        setPiStatus("found");
        void doPiAuth();
      }
    };

    tryPi();

    let count = 0;
    const id = setInterval(() => {
      count++;
      tryPi();
      if (window.__piReady || window.__piLoginDone || count >= 60) {
        clearInterval(id);
        if (!window.__piReady && !window.__piLoginDone) setPiStatus("not-found");
      }
    }, 300);

    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 py-8">
      {/* 로고 */}
      <div className="text-center">
        <p className="text-6xl mb-3">🛵</p>
        <h1 className="text-4xl font-black text-pick-purple-dark" style={{ fontFamily: "var(--font-logo)" }}>
          PICK PICK
        </h1>
        <p className="text-sm text-pick-text-sub mt-1">맛있는 음식을 PICK 하세요!</p>
      </div>

      {/* Pi 로그인 카드 */}
      <div className="w-full bg-gradient-to-br from-[#7B3FE4]/10 to-[#A855F7]/10 rounded-3xl border-2 border-[#A855F7]/30 p-8 shadow-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-3xl font-black text-[#7B3FE4]">π</span>
          <h2 className="font-black text-pick-text text-xl">Pi Network 로그인</h2>
        </div>
        <p className="text-center text-xs text-pick-text-sub mb-6">
          {piStatus === "detecting" && "Pi SDK 감지 중..."}
          {piStatus === "found"     && "Pi Browser 감지됨. 인증 중..."}
          {piStatus === "not-found" && "버튼을 눌러 Pi 계정으로 로그인하세요."}
        </p>

        <button
          type="button"
          disabled={piLoading}
          onClick={() => { piTriggered.current = false; void doPiAuth(); }}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#7B3FE4] to-[#A855F7] text-white font-black py-4 rounded-full text-lg disabled:opacity-60 active:scale-95 transition-all"
        >
          {piLoading ? "Pi 인증 중..." : <><span className="text-xl leading-none">π</span> Pi로 로그인</>}
        </button>

        {piError && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-2xl p-3">
            <p className="text-xs text-red-600 font-medium text-center">⚠️ {piError}</p>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";

declare global {
  interface Window {
    __piReady?: boolean;
    __piLoginDone?: boolean;
    __piLoginRole?: string;
    __piAuthPromise?: Promise<{ accessToken: string; user: { uid: string; username: string } }>;
  }
}

type Step = "idle" | "pi-auth" | "api" | "navigate";

const STEP_LABEL: Record<Step, string> = {
  "idle":     "Pi로 로그인",
  "pi-auth":  "① Pi 인증 중...",
  "api":      "② 서버 연결 중...",
  "navigate": "③ 이동 중...",
};

function goTo(role: string, redirectTo: string) {
  const dest = role === "owner" ? "/owner/dashboard"
             : role === "rider" ? "/rider/dashboard"
             : redirectTo;
  window.location.href = dest;
}

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectTo   = searchParams.get("redirect") ?? "/home";

  const [step,     setStep]     = useState<Step>("idle");
  const [piError,  setPiError]  = useState("");
  const [piStatus, setPiStatus] = useState<"detecting" | "found" | "not-found">("detecting");
  const piTriggered = useRef(false);

  const doPiAuth = async () => {
    if (!window.Pi) {
      setPiError("Pi Browser에서만 로그인할 수 있어요.");
      setPiStatus("not-found");
      return;
    }

    const timer = setTimeout(() => {
      setPiError(`타임아웃 — ${STEP_LABEL[step]} 단계에서 멈췄어요.`);
      setStep("idle");
    }, 40_000);

    try {
      setPiError("");

      // ① Pi 인증
      setStep("pi-auth");
      const auth = await (window.__piAuthPromise ?? window.Pi.authenticate(["username"], async () => {}));
      window.__piAuthPromise = undefined;

      // PiSdkLoader가 이미 완료한 경우
      if (window.__piLoginDone) {
        clearTimeout(timer);
        setStep("navigate");
        goTo(window.__piLoginRole ?? "user", redirectTo);
        return;
      }

      // ② 서버 로그인 (서버가 직접 세션 쿠키 설정)
      setStep("api");
      const res = await fetch("/api/auth/pi-login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ accessToken: auth.accessToken }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({})) as { error?: string };
        setPiError(j.error ?? `서버 오류 (${res.status})`);
        setStep("idle");
        return;
      }

      const { role } = await res.json() as { role: string };

      // ③ 이동 (쿠키는 서버가 이미 설정 완료)
      clearTimeout(timer);
      setStep("navigate");
      goTo(role, redirectTo);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setPiError(`오류: ${msg}`);
      setStep("idle");
    } finally {
      clearTimeout(timer);
    }
  };

  useEffect(() => {
    const tryPi = () => {
      if (piTriggered.current) return;

      if (window.__piLoginDone) {
        piTriggered.current = true;
        setPiStatus("found");
        setStep("navigate");
        goTo(window.__piLoginRole ?? "user", redirectTo);
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

  const isLoading = step !== "idle";

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
          {piStatus === "found"     && (isLoading ? STEP_LABEL[step] : "Pi Browser 감지됨")}
          {piStatus === "not-found" && "버튼을 눌러 Pi 계정으로 로그인하세요."}
        </p>

        <button
          type="button"
          disabled={isLoading}
          onClick={() => { piTriggered.current = false; void doPiAuth(); }}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#7B3FE4] to-[#A855F7] text-white font-black py-4 rounded-full text-lg disabled:opacity-60 active:scale-95 transition-all"
        >
          {isLoading
            ? STEP_LABEL[step]
            : <><span className="text-xl leading-none">π</span> Pi로 로그인</>
          }
        </button>

        {piError && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-2xl p-4">
            <p className="text-sm text-red-600 font-bold text-center break-all">⚠️ {piError}</p>
          </div>
        )}
      </div>
    </div>
  );
}

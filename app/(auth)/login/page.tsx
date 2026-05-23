"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Status = "sdk" | "auth" | "login" | "done" | "error";

const LABEL: Record<Status, string> = {
  sdk:   "Pi SDK 초기화 중...",
  auth:  "Pi 인증 중...",
  login: "로그인 중...",
  done:  "이동 중...",
  error: "",
};

function getDest(role: string, redirectTo: string) {
  return role === "owner" ? "/owner/dashboard"
       : role === "rider" ? "/rider/dashboard"
       : redirectTo;
}

export default function LoginPage() {
  const searchParams = useSearchParams();
  const redirectTo   = searchParams.get("redirect") ?? "/home";

  const [status, setStatus] = useState<Status>("sdk");
  const [error,  setError]  = useState("");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      // Pi SDK가 주입될 때까지 최대 10초 대기
      let ms = 0;
      while (!window.Pi && ms < 10_000) {
        await new Promise<void>(r => setTimeout(r, 200));
        ms += 200;
      }
      if (cancelled) return;

      if (!window.Pi) {
        setError("Pi Browser에서만 이용할 수 있어요.\nPi Browser로 접속해 주세요.");
        setStatus("error");
        return;
      }

      try {
        // ① Pi 인증 → 동의창 표시
        setStatus("auth");
        await (window.Pi.init({ version: "2.0" }) as unknown as Promise<void> | void);
        const auth = await window.Pi.authenticate(["username"], async () => {});
        if (cancelled) return;

        // ② 서버에서 세션 쿠키 설정
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

        const { role } = await res.json() as { role: string };

        // ③ 이동 (쿠키는 서버가 이미 설정)
        setStatus("done");
        window.location.href = getDest(role, redirectTo);
      } catch (e: unknown) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
          setStatus("error");
        }
      }
    }

    void run();
    return () => { cancelled = true; };
  }, [redirectTo]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAF5FF] gap-6 px-6">
      {/* 로고 */}
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

      {/* 로딩 스피너 */}
      {status !== "error" && (
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-4 border-[#A855F7] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">{LABEL[status]}</p>
        </div>
      )}

      {/* 오류 */}
      {status === "error" && (
        <div className="w-full max-w-xs bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
          <p className="text-sm text-red-600 font-bold whitespace-pre-line break-all">
            ⚠️ {error}
          </p>
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

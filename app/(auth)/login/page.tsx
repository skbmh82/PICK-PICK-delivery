"use client";

import { useEffect, useRef, useState } from "react";

type Status = "sdk" | "auth" | "login" | "done" | "error";

const LABEL: Record<Status, string> = {
  sdk:   "Pi SDK 초기화 중...",
  auth:  "Pi 인증 중...",
  login: "로그인 중...",
  done:  "이동 중...",
  error: "",
};

function destByRole(role: string) {
  return role === "owner" ? "/owner/dashboard"
       : role === "rider" ? "/rider/dashboard"
       : "/home";
}

export default function LoginPage() {
  const [status, setStatus] = useState<Status>("sdk");
  const [error,  setError]  = useState("");
  // useRef로 run()이 단 한 번만 실행되도록 보장
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function run() {
      // Pi SDK 최대 10초 대기 (Pi Browser는 즉시 주입)
      let ms = 0;
      while (!window.Pi && ms < 10_000) {
        await new Promise<void>(r => setTimeout(r, 200));
        ms += 200;
      }

      if (!window.Pi) {
        setError("Pi Browser에서만 이용할 수 있어요.\nPi Browser로 접속해 주세요.");
        setStatus("error");
        return;
      }

      try {
        // ① Pi 인증 → 동의창
        setStatus("auth");
        await (window.Pi.init({ version: "2.0" }) as unknown as Promise<void> | void);
        const auth = await window.Pi.authenticate(["username"], async () => {});

        // ② 서버 로그인 (30초 타임아웃)
        setStatus("login");
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 30_000);

        let res: Response;
        try {
          res = await fetch("/api/auth/pi-login", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ accessToken: auth.accessToken }),
            signal:  controller.signal,
          });
        } finally {
          clearTimeout(timer);
        }

        if (!res.ok) {
          const j = await res.json().catch(() => ({})) as { error?: string };
          setError(j.error ?? `서버 오류 (${res.status})`);
          setStatus("error");
          return;
        }

        const { role } = await res.json() as { role: string };

        // ③ 이동
        setStatus("done");
        window.location.replace(destByRole(role));
      } catch (e: unknown) {
        const msg = (e instanceof Error && e.name === "AbortError")
          ? "서버 응답 시간 초과 (30초). 다시 시도해 주세요."
          : (e instanceof Error ? e.message : String(e));
        setError(msg);
        setStatus("error");
      }
    }

    void run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      {/* 로딩 */}
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
            onClick={() => { started.current = false; window.location.reload(); }}
            className="mt-4 px-6 py-2 bg-[#7B3FE4] text-white rounded-full text-sm font-bold active:scale-95 transition-transform"
          >
            다시 시도
          </button>
        </div>
      )}
    </div>
  );
}

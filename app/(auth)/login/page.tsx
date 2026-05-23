"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

// ── 이메일 로그인 임시 비활성화 (Pi App Studio 검증용) ──────────────────
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import Link from "next/link";
// import { Eye, EyeOff } from "lucide-react";
// const schema = z.object({
//   email:    z.string().email("올바른 이메일을 입력해주세요"),
//   password: z.string().min(6, "비밀번호는 6자 이상이어야 해요"),
// });
// type FormData = z.infer<typeof schema>;
// ────────────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    __piReady?: boolean;
    __piAuthPromise?: Promise<{ accessToken: string; user: { uid: string; username: string } }>;
  }
}

export default function LoginPage() {
  const router      = useRouter();
  const searchParams = useSearchParams();
  const redirectTo  = searchParams.get("redirect") ?? "/home";

  const [piLoading, setPiLoading] = useState(false);
  const [piError,   setPiError]   = useState("");
  const [piStatus,  setPiStatus]  = useState<"detecting" | "found" | "not-found">("detecting");
  const piTriggered = useRef(false);

  const doPiAuth = async () => {
    if (!window.Pi) {
      setPiError("Pi SDK가 로드되지 않았어요.");
      setPiStatus("not-found");
      return;
    }
    try {
      setPiLoading(true);
      setPiError("");
      const auth = await (window.__piAuthPromise ?? window.Pi.authenticate(["username"], async () => {}));
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
      const { token_hash, role } = await res.json() as { token_hash: string; role: string };
      const { error: otpErr } = await supabase.auth.verifyOtp({ token_hash, type: "magiclink" });
      if (otpErr) { setPiError(otpErr.message); return; }

      if      (role === "owner") router.replace("/owner/dashboard");
      else if (role === "rider") router.replace("/rider/dashboard");
      else                       router.replace(redirectTo);
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
      if (window.__piReady || count >= 30) {
        clearInterval(id);
        if (!window.__piReady) setPiStatus("not-found");
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

      {/* ── 이메일 로그인 임시 비활성화 ─────────────────────────────────────
      <div className="flex items-center gap-3 w-full">
        <div className="flex-1 h-px bg-pick-border" />
        <span className="text-xs text-pick-text-sub">또는 이메일로 로그인</span>
        <div className="flex-1 h-px bg-pick-border" />
      </div>
      <div className="bg-white rounded-3xl border-2 border-pick-border p-6 shadow-sm w-full">
        ... 이메일 로그인 폼 ...
      </div>
      <p className="text-center text-sm text-pick-text-sub">
        아직 계정이 없으신가요?{" "}
        <Link href="/register" className="text-pick-purple font-black">회원가입</Link>
      </p>
      ──────────────────────────────────────────────────────────────────── */}
    </div>
  );
}

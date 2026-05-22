"use client";

import { useState, useEffect, useRef } from "react";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Eye, EyeOff } from "lucide-react";

const schema = z.object({
  email:    z.string().email("올바른 이메일을 입력해주세요"),
  password: z.string().min(6, "비밀번호는 6자 이상이어야 해요"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirectTo   = searchParams.get("redirect") ?? "/home";

  const [showPw,      setShowPw]      = useState(false);
  const [serverError, setServerError] = useState("");
  const [piLoading,   setPiLoading]   = useState(false);
  const [piError,     setPiError]     = useState("");
  const [piStatus,    setPiStatus]    = useState<"idle" | "detecting" | "found" | "not-found">("detecting");
  const piTriggered = useRef(false);

  const doPiAuth = async () => {
    if (!window.Pi) {
      setPiError("Pi SDK가 로드되지 않았어요. Pi Browser에서 접속해주세요.");
      setPiStatus("not-found");
      return;
    }
    try {
      setPiLoading(true);
      setPiError("");
      // Pi.init()은 layout의 beforeInteractive 스크립트에서 이미 완료됨
      const auth = await window.Pi.authenticate(["username"], async () => {});
      const res = await fetch("/api/auth/pi-login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ accessToken: auth.accessToken }),
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({})) as { error?: string };
        setPiError(errJson.error ?? `서버 오류 (${res.status})`);
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

  // Pi SDK 감지 → 자동 인증
  useEffect(() => {
    if (typeof window === "undefined") return;

    const tryPi = () => {
      if (piTriggered.current) return;
      // __piReady: PiSdkLoader의 onLoad에서 Pi.init() 완료 후 세팅
      if (window.Pi) {
        piTriggered.current = true;
        setPiStatus("found");
        void doPiAuth();
      }
    };

    // 즉시 시도
    tryPi();

    // pi-sdk.js script onload 이벤트 감지
    const scriptEl = document.querySelector<HTMLScriptElement>(
      'script[src="https://sdk.minepi.com/pi-sdk.js"]',
    );
    scriptEl?.addEventListener("load", tryPi);

    // 폴링 (300ms × 30 = 최대 9초)
    let count = 0;
    const id = setInterval(() => {
      count++;
      tryPi();
      if (window.Pi || count >= 30) {
        clearInterval(id);
        if (!window.Pi) setPiStatus("not-found");
      }
    }, 300);

    return () => {
      clearInterval(id);
      scriptEl?.removeEventListener("load", tryPi);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError("");
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        setServerError("이메일 인증이 필요해요. 가입 시 받은 메일의 링크를 클릭해주세요.");
      } else if (error.message.includes("Invalid login credentials")) {
        setServerError("이메일 또는 비밀번호가 올바르지 않아요.");
      } else {
        setServerError(error.message);
      }
      return;
    }

    const sessionRes  = await fetch("/api/auth/session", { method: "POST" });
    const sessionJson = await sessionRes.json() as { role?: string };
    const role        = sessionJson.role ?? "user";

    if      (role === "admin") router.replace("/admin/dashboard");
    else if (role === "owner") router.replace("/owner/dashboard");
    else if (role === "rider") router.replace("/rider/dashboard");
    else                       router.replace(redirectTo);
  };

  return (
    <div className="flex flex-col gap-6 py-8">
      {/* 로고 */}
      <div className="text-center mb-2">
        <p className="text-5xl mb-3">🛵</p>
        <h1
          className="text-4xl text-pick-purple-dark"
          style={{ fontFamily: "var(--font-logo)" }}
        >
          PICK PICK
        </h1>
        <p className="text-sm text-pick-text-sub mt-1">맛있는 음식을 PICK 하세요!</p>
      </div>

      {/* Pi Network 로그인 — 최상단 배치 (App Studio 감지용) */}
      <div className="bg-gradient-to-br from-[#7B3FE4]/10 to-[#A855F7]/10 rounded-3xl border-2 border-[#A855F7]/30 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl font-black text-[#7B3FE4]">π</span>
          <h2 className="font-black text-pick-text text-lg">Pi Network 로그인</h2>
        </div>
        <p className="text-xs text-pick-text-sub mb-4">
          {piStatus === "detecting" && "Pi SDK 감지 중..."}
          {piStatus === "found"     && "Pi Browser 감지됨. 자동 인증 중이에요."}
          {piStatus === "not-found" && "Pi Browser가 아닌 환경이에요. 버튼을 눌러 시도하세요."}
          {piStatus === "idle"      && "Pi Browser에서 접속하면 자동으로 로그인돼요."}
        </p>

        <button
          type="button"
          disabled={piLoading}
          onClick={() => {
            piTriggered.current = false;
            void doPiAuth();
          }}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#7B3FE4] to-[#A855F7] text-white font-black py-3.5 rounded-full disabled:opacity-60 active:scale-95 transition-all"
        >
          {piLoading ? "Pi 인증 중..." : <><span className="text-lg leading-none">π</span> Pi로 로그인</>}
        </button>

        {piError && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-2xl p-3">
            <p className="text-xs text-red-600 font-medium">⚠️ {piError}</p>
          </div>
        )}
      </div>

      {/* 구분선 */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-pick-border" />
        <span className="text-xs text-pick-text-sub font-medium">또는 이메일로 로그인</span>
        <div className="flex-1 h-px bg-pick-border" />
      </div>

      {/* 이메일 로그인 카드 */}
      <div className="bg-white rounded-3xl border-2 border-pick-border p-6 shadow-sm">
        <h2 className="font-black text-pick-text text-lg mb-5">이메일 로그인</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* 이메일 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-pick-text-sub">이메일</label>
            <input
              type="email"
              placeholder="example@email.com"
              {...register("email")}
              className="rounded-2xl border-2 border-pick-border px-4 py-3 text-sm text-pick-text outline-none focus:border-pick-purple transition-colors"
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* 비밀번호 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-pick-text-sub">비밀번호</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                placeholder="비밀번호를 입력하세요"
                {...register("password")}
                className="w-full rounded-2xl border-2 border-pick-border px-4 py-3 pr-11 text-sm text-pick-text outline-none focus:border-pick-purple transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-pick-text-sub"
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* 서버 에러 */}
          {serverError && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-3 flex items-start gap-2">
              <span className="text-sm">⚠️</span>
              <p className="text-xs text-red-600 font-medium">{serverError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-pick-purple to-pick-purple-light text-white font-black py-3.5 rounded-full disabled:opacity-60 active:scale-95 transition-all mt-1"
          >
            {isSubmitting ? "로그인 중..." : "로그인 💜"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link href="/forgot-password" className="text-xs text-pick-text-sub underline underline-offset-2">
            비밀번호를 잊으셨나요?
          </Link>
        </div>
      </div>

      {/* 회원가입 링크 */}
      <p className="text-center text-sm text-pick-text-sub">
        아직 계정이 없으신가요?{" "}
        <Link href="/register" className="text-pick-purple font-black">
          회원가입
        </Link>
      </p>
    </div>
  );
}

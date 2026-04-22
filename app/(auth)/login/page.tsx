"use client";

import { useState } from "react";
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
  const [piLoading, setPiLoading] = useState(false);

  const handlePiLogin = async () => {
    if (!window.Pi) {
      setServerError("Pi Browser에서만 사용 가능합니다. Pi 앱에서 열어주세요.");
      return;
    }
    setPiLoading(true);
    setServerError("");
    try {
      window.Pi.init({ version: "2.0", sandbox: true });
      const auth = await window.Pi.authenticate(["username", "payments"], async () => {});
      const res = await fetch("/api/auth/pi-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessToken: auth.accessToken }),
      });
      const json = await res.json() as { access_token?: string; refresh_token?: string; error?: string };
      if (!res.ok || !json.access_token) {
        setServerError(json.error ?? "Pi 로그인 실패");
        return;
      }
      await supabase.auth.setSession({
        access_token:  json.access_token,
        refresh_token: json.refresh_token ?? "",
      });
      router.replace(redirectTo);
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Pi 로그인 중 오류가 발생했어요");
    } finally {
      setPiLoading(false);
    }
  };

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

    // pick-role 쿠키 설정 (미들웨어 역할 체크용)
    await fetch("/api/auth/session", { method: "POST" });
    router.replace(redirectTo);
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

      {/* 폼 카드 */}
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

          {/* 서버 에러 — 실제 메시지 표시 */}
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

      {/* Pi 로그인 버튼 — 항상 표시, 클릭 시 Pi Browser 여부 체크 */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-pick-border" />
          <span className="text-xs text-pick-text-sub font-medium">또는</span>
          <div className="flex-1 h-px bg-pick-border" />
        </div>
        <button
          onClick={() => void handlePiLogin()}
          disabled={piLoading}
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-[#7C3AED] to-[#D97706] text-white font-black py-4 rounded-full shadow-lg active:scale-95 transition-all disabled:opacity-60"
        >
          {piLoading ? (
            <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <span className="text-xl font-black" style={{ fontFamily: "serif" }}>π</span>
          )}
          {piLoading ? "Pi 인증 중..." : "Pi 계정으로 로그인"}
        </button>
        <p className="text-center text-xs text-pick-text-sub">
          Pi Browser에서 Pi 계정으로 바로 로그인됩니다
        </p>
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

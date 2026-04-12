"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Eye, EyeOff } from "lucide-react";

function KakaoIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="#3C1E1E">
      <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.74 1.63 5.15 4.09 6.59L5.1 21l4.54-2.95c.77.12 1.55.18 2.36.18 5.523 0 10-3.477 10-7.8C22 6.477 17.523 3 12 3z"/>
    </svg>
  );
}

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
  const [kakaoLoading, setKakaoLoading] = useState(false);

  const handleKakaoLogin = async () => {
    setKakaoLoading(true);
    const callbackUrl = `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(redirectTo)}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options:  { redirectTo: callbackUrl },
    });
    if (error) {
      setServerError("카카오 로그인에 실패했어요. 다시 시도해주세요.");
      setKakaoLoading(false);
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

      {/* 카카오 로그인 */}
      <button
        type="button"
        onClick={() => void handleKakaoLogin()}
        disabled={kakaoLoading}
        className="w-full flex items-center justify-center gap-3 bg-[#FEE500] text-[#3C1E1E] font-black py-3.5 rounded-full shadow-sm active:scale-95 transition-all disabled:opacity-60"
      >
        {kakaoLoading ? (
          <span className="w-5 h-5 border-2 border-[#3C1E1E]/30 border-t-[#3C1E1E] rounded-full animate-spin" />
        ) : (
          <KakaoIcon />
        )}
        카카오로 로그인
      </button>

      {/* 구분선 */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-pick-border" />
        <span className="text-xs text-pick-text-sub font-medium">또는</span>
        <div className="flex-1 h-px bg-pick-border" />
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

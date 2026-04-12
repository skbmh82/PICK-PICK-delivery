"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Eye, EyeOff, CheckCircle2, AlertTriangle } from "lucide-react";

const schema = z.object({
  password:        z.string().min(6, "비밀번호는 6자 이상이어야 해요"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "비밀번호가 일치하지 않아요",
  path:    ["confirmPassword"],
});
type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const [showPw,      setShowPw]      = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState("");
  const [done,        setDone]        = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  // Supabase가 URL hash에서 세션 토큰 파싱하기를 기다림
  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setSessionReady(true);
      }
    });
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError("");
    const { error } = await supabase.auth.updateUser({ password: data.password });
    if (error) {
      setServerError(error.message ?? "비밀번호 변경에 실패했어요");
      return;
    }
    setDone(true);
    setTimeout(() => router.replace("/login"), 2500);
  };

  if (done) {
    return (
      <div className="flex flex-col items-center gap-6 py-12 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 size={40} className="text-green-500" strokeWidth={1.8} />
        </div>
        <div>
          <h2 className="font-black text-pick-text text-xl mb-2">비밀번호 변경 완료! 🎉</h2>
          <p className="text-sm text-pick-text-sub">잠시 후 로그인 페이지로 이동합니다.</p>
        </div>
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center px-4">
        <AlertTriangle size={40} className="text-amber-400" />
        <h2 className="font-black text-pick-text text-lg">링크를 확인 중이에요</h2>
        <p className="text-sm text-pick-text-sub leading-relaxed">
          이메일의 재설정 링크를 통해 접근해주세요.
          <br />
          <span className="text-xs opacity-70">잠시 후에도 이 화면이 보이면 링크가 만료된 것일 수 있어요.</span>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <div className="text-center mb-2">
        <p className="text-5xl mb-3">🔒</p>
        <h1 className="font-black text-pick-text text-2xl">새 비밀번호 설정</h1>
        <p className="text-sm text-pick-text-sub mt-1">안전한 새 비밀번호를 입력해주세요</p>
      </div>

      <div className="bg-white rounded-3xl border-2 border-pick-border p-6 shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* 새 비밀번호 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-pick-text-sub">새 비밀번호</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                placeholder="6자 이상 입력해주세요"
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

          {/* 비밀번호 확인 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-pick-text-sub">비밀번호 확인</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="비밀번호를 한 번 더 입력해주세요"
                {...register("confirmPassword")}
                className="w-full rounded-2xl border-2 border-pick-border px-4 py-3 pr-11 text-sm text-pick-text outline-none focus:border-pick-purple transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-pick-text-sub"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>
            )}
          </div>

          {serverError && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-3">
              <p className="text-xs text-red-600 font-medium">⚠️ {serverError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-pick-purple to-pick-purple-light text-white font-black py-3.5 rounded-full disabled:opacity-60 active:scale-95 transition-all mt-1"
          >
            {isSubmitting ? "변경 중..." : "비밀번호 변경하기 💜"}
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

const schema = z.object({
  email: z.string().email("올바른 이메일을 입력해주세요"),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent,        setSent]        = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError("");
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setServerError(error.message ?? "이메일 전송에 실패했어요. 다시 시도해주세요.");
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-6 py-12 text-center px-2">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 size={40} className="text-green-500" strokeWidth={1.8} />
        </div>
        <div>
          <h2 className="font-black text-pick-text text-xl mb-2">메일을 확인해주세요 📬</h2>
          <p className="text-sm text-pick-text-sub leading-relaxed">
            <strong className="text-pick-text">{getValues("email")}</strong>으로<br />
            비밀번호 재설정 링크를 보냈어요.
          </p>
          <p className="text-xs text-pick-text-sub mt-3 opacity-70">
            메일이 안 오면 스팸 폴더를 확인해보세요.
          </p>
        </div>
        <Link
          href="/login"
          className="mt-2 bg-pick-purple text-white font-black px-8 py-3.5 rounded-full active:scale-95 transition-all"
        >
          로그인으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      {/* 헤더 */}
      <div className="flex items-center gap-3 -mb-2">
        <Link
          href="/login"
          className="w-9 h-9 flex items-center justify-center rounded-full bg-pick-bg border-2 border-pick-border active:scale-95 transition-transform"
        >
          <ArrowLeft size={18} className="text-pick-purple" />
        </Link>
        <h1 className="font-black text-pick-text text-lg">비밀번호 찾기</h1>
      </div>

      <div className="bg-white rounded-3xl border-2 border-pick-border p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-pick-bg flex items-center justify-center flex-shrink-0">
            <Mail size={22} className="text-pick-purple" />
          </div>
          <p className="text-sm text-pick-text-sub leading-snug">
            가입 시 사용한 이메일을 입력하면<br />
            재설정 링크를 보내드려요.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
            {isSubmitting ? "전송 중..." : "재설정 링크 보내기 💜"}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-pick-text-sub">
        비밀번호가 기억났나요?{" "}
        <Link href="/login" className="text-pick-purple font-black">
          로그인
        </Link>
      </p>
    </div>
  );
}

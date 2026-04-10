"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Eye, EyeOff } from "lucide-react";

const schema = z.object({
  name:     z.string().min(2, "이름은 2자 이상이어야 해요"),
  email:    z.string().email("올바른 이메일을 입력해주세요"),
  password: z.string().min(6, "비밀번호는 6자 이상이어야 해요"),
  role:     z.enum(["user", "owner", "rider"]),
});
type FormData = z.infer<typeof schema>;

const ROLES = [
  { value: "user",  label: "👤 일반 사용자", desc: "음식 주문 & PICK 적립" },
  { value: "owner", label: "🏪 사장님",       desc: "가게 등록 & 주문 관리" },
  { value: "rider", label: "🛵 라이더",        desc: "배달 & 수익 관리" },
] as const;

export default function RegisterPage() {
  const router = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [serverError, setServerError] = useState("");
  // 이메일 인증이 필요한 경우 이 state가 true로 바뀜
  const [needsEmailConfirm, setNeedsEmailConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "user" },
  });

  const selectedRole = watch("role");

  const onSubmit = async (data: FormData) => {
    setServerError("");
    setNeedsEmailConfirm(false);

    // 1. 서버 API로 회원가입 + 지갑 자동 생성
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setServerError((err.error as string) ?? "회원가입에 실패했어요. 다시 시도해주세요.");
      return;
    }

    // 2. 방금 생성된 계정으로 로그인 (클라이언트 세션 수립)
    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (signInError || !authData.session) {
      // 이메일 인증이 필요한 경우
      setNeedsEmailConfirm(true);
      return;
    }

    // 3. pick-role 쿠키 설정
    await fetch("/api/auth/session", { method: "POST" });
    router.replace("/home");
  };

  // ── 이메일 인증 대기 화면 ──
  if (needsEmailConfirm) {
    return (
      <div className="flex flex-col gap-6 py-8">
        <div className="bg-white rounded-3xl border-2 border-pick-border p-8 shadow-sm flex flex-col items-center text-center gap-4">
          <span className="text-6xl">📬</span>
          <h2 className="font-black text-pick-text text-xl">이메일을 확인해주세요!</h2>
          <p className="text-sm text-pick-text-sub leading-relaxed">
            <span className="font-bold text-pick-purple">{getValues("email")}</span>으로<br />
            인증 메일을 보냈어요.<br />
            메일의 링크를 클릭하면 로그인됩니다.
          </p>
          <div className="w-full bg-pick-bg rounded-2xl p-4 text-xs text-pick-text-sub">
            📌 메일이 안 보이면 <strong>스팸함</strong>도 확인해보세요.
          </div>
          <div className="flex flex-col gap-2 w-full mt-2">
            <p className="text-xs text-pick-text-sub text-center">
              또는 Supabase 대시보드 → Authentication → Providers → Email →{" "}
              <strong>Confirm email 체크 해제</strong> 후 다시 시도하면<br />
              이메일 인증 없이 바로 로그인할 수 있어요.
            </p>
            <Link
              href="/login"
              className="mt-2 w-full text-center bg-pick-purple text-white font-black py-3.5 rounded-full active:scale-95 transition-all"
            >
              로그인 페이지로 이동
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      {/* 로고 */}
      <div className="text-center mb-2">
        <p className="text-5xl mb-3">🎉</p>
        <h1
          className="text-4xl text-pick-purple-dark"
          style={{ fontFamily: "var(--font-logo)" }}
        >
          PICK PICK
        </h1>
        <p className="text-sm text-pick-text-sub mt-1">새 계정을 만들어보세요!</p>
      </div>

      {/* 폼 카드 */}
      <div className="bg-white rounded-3xl border-2 border-pick-border p-6 shadow-sm">
        <h2 className="font-black text-pick-text text-lg mb-5">회원가입</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* 역할 선택 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-pick-text-sub">역할 선택</label>
            <div className="flex flex-col gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setValue("role", r.value)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all text-left ${
                    selectedRole === r.value
                      ? "border-pick-purple bg-pick-bg"
                      : "border-pick-border bg-white"
                  }`}
                >
                  <span className="text-xl">{r.label.split(" ")[0]}</span>
                  <div>
                    <p className={`text-sm font-bold ${selectedRole === r.value ? "text-pick-purple" : "text-pick-text"}`}>
                      {r.label.split(" ").slice(1).join(" ")}
                    </p>
                    <p className="text-xs text-pick-text-sub">{r.desc}</p>
                  </div>
                  {selectedRole === r.value && (
                    <span className="ml-auto w-5 h-5 rounded-full bg-pick-purple flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs">✓</span>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 이름 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-pick-text-sub">이름</label>
            <input
              type="text"
              placeholder="이름을 입력하세요"
              {...register("name")}
              className="rounded-2xl border-2 border-pick-border px-4 py-3 text-sm text-pick-text outline-none focus:border-pick-purple transition-colors"
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          {/* 이메일 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-pick-text-sub">이메일</label>
            <input
              type="email"
              placeholder="example@email.com"
              {...register("email")}
              className="rounded-2xl border-2 border-pick-border px-4 py-3 text-sm text-pick-text outline-none focus:border-pick-purple transition-colors"
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

          {/* 비밀번호 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-pick-text-sub">비밀번호</label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                placeholder="6자 이상 입력하세요"
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
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>

          {/* 서버 에러 — 실제 메시지 표시 */}
          {serverError && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-3 flex items-start gap-2">
              <span className="text-red-500 text-sm">⚠️</span>
              <p className="text-xs text-red-600 font-medium">{serverError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-pick-purple to-pick-purple-light text-white font-black py-3.5 rounded-full disabled:opacity-60 active:scale-95 transition-all mt-1"
          >
            {isSubmitting ? "가입 중..." : "가입하기 🎉"}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-pick-text-sub">
        이미 계정이 있으신가요?{" "}
        <Link href="/login" className="text-pick-purple font-black">
          로그인
        </Link>
      </p>
    </div>
  );
}

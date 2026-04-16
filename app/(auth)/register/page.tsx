"use client";

import { useState, useEffect } from "react";
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
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [showPw,       setShowPw]       = useState(false);
  const [kakaoLoading, setKakaoLoading] = useState(false);
  const [referralCode, setReferralCode] = useState("");

  const handleKakaoLogin = async () => {
    setKakaoLoading(true);
    const callbackUrl = `${window.location.origin}/api/auth/callback`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options:  { redirectTo: callbackUrl },
    });
    if (error) {
      setKakaoLoading(false);
    }
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "user" },
  });

  const selectedRole = watch("role");

  // URL ?ref=CODE&role=owner 파라미터 자동 처리
  useEffect(() => {
    const ref  = searchParams.get("ref");
    const role = searchParams.get("role") as FormData["role"] | null;
    if (ref)  setReferralCode(ref.toUpperCase().slice(0, 8));
    if (role && ["user", "owner", "rider"].includes(role)) setValue("role", role);
  }, [searchParams, setValue]);

  const onSubmit = async (data: FormData) => {
    // 서버에 가입 요청 후 결과 상관없이 로그인 페이지로 이동
    await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, ...(referralCode ? { referralCode } : {}) }),
    }).catch(() => {});

    router.replace("/login");
  };

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

      {/* 초대 코드 배너 */}
      {referralCode && (
        <div className="bg-gradient-to-r from-pick-purple to-pick-purple-light rounded-3xl p-4 text-white text-center shadow-md">
          <p className="text-xs text-white/80 mb-1">🎁 초대 코드로 가입하면</p>
          <p className="font-black text-lg">5,000 PICK 즉시 지급!</p>
          <p className="text-xs text-white/70 mt-1">코드: {referralCode}</p>
        </div>
      )}

      {/* 카카오로 빠른 시작 */}
      <div className="bg-white rounded-3xl border-2 border-pick-border p-5 shadow-sm">
        <p className="text-xs text-pick-text-sub text-center mb-3 font-medium">소셜 계정으로 빠르게 시작해요</p>
        <button
          type="button"
          onClick={() => void handleKakaoLogin()}
          disabled={kakaoLoading}
          className="w-full flex items-center justify-center gap-3 bg-[#FEE500] text-[#3C1E1E] font-black py-3.5 rounded-full active:scale-95 transition-all disabled:opacity-60"
        >
          {kakaoLoading ? (
            <span className="w-5 h-5 border-2 border-[#3C1E1E]/30 border-t-[#3C1E1E] rounded-full animate-spin" />
          ) : (
            <KakaoIcon />
          )}
          카카오로 시작하기
        </button>
        <p className="text-[10px] text-pick-text-sub text-center mt-2.5">
          카카오 가입 시 일반 사용자(User)로 자동 등록됩니다
        </p>
      </div>

      {/* 구분선 */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-pick-border" />
        <span className="text-xs text-pick-text-sub font-medium">또는 이메일로 가입</span>
        <div className="flex-1 h-px bg-pick-border" />
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

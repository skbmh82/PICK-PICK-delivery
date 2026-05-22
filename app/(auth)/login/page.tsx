"use client";

import { useState, useEffect } from "react";
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

// Pi 로그인 처리 함수
async function handlePiLogin(router: ReturnType<typeof useRouter>, redirectTo: string) {
  if (typeof window === "undefined" || !window.Pi) return false;
  try {
    window.Pi.init({ version: "2.0", sandbox: process.env.NEXT_PUBLIC_PI_SANDBOX !== "false" });
    const auth = await window.Pi.authenticate(["username"], async () => {});
    const res = await fetch("/api/auth/pi-login", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ accessToken: auth.accessToken }),
    });
    if (!res.ok) return false;
    const { token_hash, role } = await res.json() as { token_hash: string; role: string };
    const { error } = await supabase.auth.verifyOtp({ token_hash, type: "magiclink" });
    if (error) return false;
    if      (role === "owner") router.replace("/owner/dashboard");
    else if (role === "rider") router.replace("/rider/dashboard");
    else                       router.replace(redirectTo);
    return true;
  } catch {
    return false;
  }
}

export default function LoginPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirectTo   = searchParams.get("redirect") ?? "/home";

  const [showPw,      setShowPw]      = useState(false);
  const [serverError, setServerError] = useState("");
  const [piLoading,   setPiLoading]   = useState(false);
  const [isPiBrowser, setIsPiBrowser] = useState(false);

  // Pi Browser 감지 → 자동 Pi 인증
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isPi = !!(window.Pi);
    setIsPiBrowser(isPi);
    if (isPi) {
      setPiLoading(true);
      handlePiLogin(router, redirectTo)
        .finally(() => setPiLoading(false));
    }
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

      {/* Pi Network 로그인 */}
      <div className="bg-white rounded-3xl border-2 border-pick-border p-6 shadow-sm">
        <h2 className="font-black text-pick-text text-lg mb-1">Pi Network 로그인</h2>
        <p className="text-xs text-pick-text-sub mb-5">
          {isPiBrowser
            ? "Pi Browser가 감지되었어요. 자동으로 인증 중이에요."
            : "Pi Browser에서 접속하면 자동으로 로그인돼요."}
        </p>

        <button
          type="button"
          disabled={piLoading}
          onClick={() => {
            setPiLoading(true);
            handlePiLogin(router, redirectTo).finally(() => setPiLoading(false));
          }}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#7B3FE4] to-[#A855F7] text-white font-black py-3.5 rounded-full disabled:opacity-60 active:scale-95 transition-all"
        >
          {piLoading ? (
            "인증 중..."
          ) : (
            <>
              <span className="text-lg leading-none">π</span>
              Pi로 로그인
            </>
          )}
        </button>

        {!isPiBrowser && (
          <p className="mt-3 text-center text-xs text-pick-text-sub">
            Pi Browser 앱이 필요해요 →{" "}
            <span className="font-bold text-pick-text">minepi.com</span>
          </p>
        )}
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

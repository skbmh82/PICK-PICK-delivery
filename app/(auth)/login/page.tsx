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

type Role = "user" | "owner" | "rider";

const ROLES: { value: Role; label: string; emoji: string; desc: string }[] = [
  { value: "user",  label: "일반 유저", emoji: "🛍️", desc: "음식 주문하기" },
  { value: "owner", label: "사장님",    emoji: "🏪", desc: "가맹점 운영하기" },
  { value: "rider", label: "라이더",    emoji: "🛵", desc: "배달하고 수익내기" },
];

export default function LoginPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirectTo   = searchParams.get("redirect") ?? "/home";

  const [showPw,      setShowPw]      = useState(false);
  const [serverError, setServerError] = useState("");
  const [isPiBrowser, setIsPiBrowser] = useState(false);
  const [piRole,      setPiRole]      = useState<Role>("user");
  const [piLoading,   setPiLoading]   = useState(false);
  const [piError,     setPiError]     = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && !!window.Pi) {
      setIsPiBrowser(true);
      // Pi SDK는 페이지 로드 즉시 init() 해야 함 — 버튼 클릭 시 호출하면 에러
      const sandbox = process.env.NEXT_PUBLIC_PI_SANDBOX === "true";
      window.Pi.init({ version: "2.0", sandbox });
    }
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

  const handlePiLogin = async () => {
    if (!window.Pi) return;
    setPiError("");
    setPiLoading(true);

    try {
      const auth = await window.Pi.authenticate(["username"], (payment) => {
        console.warn("미완료 Pi 결제 발견:", payment.identifier);
      });

      const res = await fetch("/api/auth/pi-login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ accessToken: auth.accessToken, role: piRole }),
      });

      const json = await res.json() as { token_hash?: string; role?: string; error?: string };
      if (!res.ok) {
        setPiError(json.error ?? "Pi 로그인에 실패했어요");
        return;
      }

      const { error: sessionError } = await supabase.auth.verifyOtp({
        token_hash: json.token_hash!,
        type:       "magiclink",
      });

      if (sessionError) {
        setPiError("세션 생성 실패: " + sessionError.message);
        return;
      }

      await fetch("/api/auth/session", { method: "POST" });

      const role = json.role ?? "user";
      if      (role === "admin") router.replace("/admin/dashboard");
      else if (role === "owner") router.replace("/owner/dashboard");
      else if (role === "rider") router.replace("/rider/dashboard");
      else                       router.replace(redirectTo);
    } catch (e) {
      setPiError(e instanceof Error ? e.message : String(e));
    } finally {
      setPiLoading(false);
    }
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

      {/* Pi Browser 전용 — Pi 로그인 + 역할 선택 */}
      {isPiBrowser && (
        <div className="bg-white rounded-3xl border-2 border-pick-border p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl font-black text-indigo-700">π</span>
            <h2 className="font-black text-pick-text text-lg">Pi로 로그인</h2>
          </div>
          <p className="text-xs text-pick-text-sub mb-4">
            Pi Browser에서 Pi 계정으로 바로 로그인하세요
          </p>

          {/* 역할 선택 */}
          <p className="text-xs font-bold text-pick-text-sub mb-2">
            역할 선택{" "}
            <span className="font-normal text-pick-text-sub/70">
              (신규 가입 시 적용 · 기존 계정은 유지)
            </span>
          </p>
          <div className="grid grid-cols-3 gap-2 mb-5">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setPiRole(r.value)}
                className={`flex flex-col items-center gap-1 rounded-2xl border-2 py-3 transition-all active:scale-95 ${
                  piRole === r.value
                    ? "border-pick-purple bg-pick-purple/5"
                    : "border-pick-border bg-white"
                }`}
              >
                <span className="text-2xl">{r.emoji}</span>
                <span
                  className={`text-[11px] font-bold ${
                    piRole === r.value ? "text-pick-purple" : "text-pick-text-sub"
                  }`}
                >
                  {r.label}
                </span>
                <span className="text-[9px] text-pick-text-sub/70 text-center leading-tight px-1">
                  {r.desc}
                </span>
              </button>
            ))}
          </div>

          {piError && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-3 flex items-start gap-2 mb-3">
              <span className="text-sm">⚠️</span>
              <p className="text-xs text-red-600 font-medium">{piError}</p>
            </div>
          )}

          <button
            type="button"
            onClick={handlePiLogin}
            disabled={piLoading}
            className="w-full bg-gradient-to-r from-indigo-700 to-purple-700 text-white font-black py-3.5 rounded-full disabled:opacity-60 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {piLoading ? (
              "로그인 중..."
            ) : (
              <>
                <span className="text-xl font-black leading-none">π</span>
                Pi 계정으로 로그인
              </>
            )}
          </button>
        </div>
      )}

      {/* 구분선 (Pi Browser에서만 표시) */}
      {isPiBrowser && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-pick-border" />
          <span className="text-xs text-pick-text-sub font-bold">또는</span>
          <div className="flex-1 h-px bg-pick-border" />
        </div>
      )}

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

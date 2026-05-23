"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type Role   = "user" | "owner" | "rider" | "admin";
type Status = "role" | "sdk" | "auth" | "login" | "done" | "error";

const LABEL: Record<Status, string> = {
  role:  "",
  sdk:   "Pi SDK 초기화 중...",
  auth:  "Pi 인증 중...",
  login: "로그인 중...",
  done:  "이동 중...",
  error: "",
};

const ROLES: { role: Role; emoji: string; label: string; sub: string; color: string; active: string }[] = [
  {
    role:   "user",
    emoji:  "👤",
    label:  "일반 유저",
    sub:    "음식 주문 · PICK 적립",
    color:  "border-pick-border bg-white",
    active: "border-pick-purple bg-pick-purple/5",
  },
  {
    role:   "owner",
    emoji:  "🏪",
    label:  "사장님",
    sub:    "가게 등록 · 주문 관리",
    color:  "border-pick-border bg-white",
    active: "border-amber-400 bg-amber-50",
  },
  {
    role:   "rider",
    emoji:  "🛵",
    label:  "라이더",
    sub:    "배달 수행 · 수익 적립",
    color:  "border-pick-border bg-white",
    active: "border-sky-400 bg-sky-50",
  },
  {
    role:   "admin",
    emoji:  "🛠️",
    label:  "관리자",
    sub:    "앱 전체 운영 · 승인 관리",
    color:  "border-pick-border bg-white",
    active: "border-gray-500 bg-gray-50",
  },
];

function destByRole(role: string) {
  return role === "owner" ? "/owner/dashboard"
       : role === "rider" ? "/rider/dashboard"
       : role === "admin" ? "/admin/dashboard"
       : "/home";
}

export default function LoginPage() {
  const [status,  setStatus]  = useState<Status>("role");
  const [error,   setError]   = useState("");
  const [role,    setRole]    = useState<Role>("user");
  const [adminPin, setAdminPin] = useState("");
  const started = useRef(false);

  // admin 이외 역할 선택 시 PIN 초기화
  useEffect(() => {
    if (role !== "admin") setAdminPin("");
  }, [role]);

  const canStart =
    role !== "admin" || adminPin.length === 4;

  const startLogin = () => {
    if (!canStart) return;
    if (started.current) return;
    started.current = true;
    void run(role, adminPin);
  };

  async function run(selectedRole: Role, pin: string) {
    // admin PIN 검증 (클라이언트 사전 검증)
    if (selectedRole === "admin") {
      const validPin = process.env.NEXT_PUBLIC_ADMIN_PIN ?? "0000";
      if (pin !== validPin) {
        setError("관리자 PIN이 올바르지 않습니다.");
        setStatus("error");
        started.current = false;
        return;
      }
    }

    // Pi SDK 최대 10초 대기
    setStatus("sdk");
    let ms = 0;
    while (!window.Pi && ms < 10_000) {
      await new Promise<void>((r) => setTimeout(r, 200));
      ms += 200;
    }

    if (!window.Pi) {
      setError("Pi Browser에서만 이용할 수 있어요.\nPi Browser로 접속해 주세요.");
      setStatus("error");
      return;
    }

    try {
      // ① Pi 인증
      setStatus("auth");
      await (window.Pi.init({ version: "2.0" }) as unknown as Promise<void> | void);
      const auth = await window.Pi.authenticate(["username"], async () => {});

      // ② 서버 로그인 (30초 타임아웃)
      setStatus("login");
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 30_000);

      let res: Response;
      try {
        res = await fetch("/api/auth/pi-login", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ accessToken: auth.accessToken, role: selectedRole }),
          signal:  controller.signal,
        });
      } finally {
        clearTimeout(timer);
      }

      if (!res.ok) {
        const j = await res.json().catch(() => ({})) as { error?: string };
        setError(j.error ?? `서버 오류 (${res.status})`);
        setStatus("error");
        return;
      }

      const { role: assignedRole, access_token, refresh_token } = await res.json() as {
        role: string; access_token: string; refresh_token: string;
      };

      // ③ Supabase 세션 설정 (localStorage에 저장됨)
      const { error: sessionError } = await supabase.auth.setSession({ access_token, refresh_token });
      if (sessionError) {
        setError(`세션 설정 실패: ${sessionError.message}`);
        setStatus("error");
        return;
      }

      // ④ 이동
      setStatus("done");
      window.location.replace(destByRole(assignedRole));
    } catch (e: unknown) {
      const msg = (e instanceof Error && e.name === "AbortError")
        ? "서버 응답 시간 초과 (30초). 다시 시도해 주세요."
        : (e instanceof Error ? e.message : String(e));
      setError(msg);
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAF5FF] gap-6 px-6 py-10">
      {/* 로고 */}
      <div className="text-center">
        <p className="text-7xl mb-3">🛵</p>
        <h1
          className="text-4xl font-black text-[#4C1D95]"
          style={{ fontFamily: "var(--font-logo, 'Jua', sans-serif)" }}
        >
          PICK PICK
        </h1>
        <p className="text-sm text-gray-500 mt-1">맛있는 음식을 PICK 하세요!</p>
      </div>

      {/* 역할 선택 */}
      {status === "role" && (
        <div className="w-full max-w-xs flex flex-col gap-3">
          <p className="text-center text-sm font-bold text-gray-600">어떤 역할로 시작할까요?</p>

          <div className="grid grid-cols-2 gap-3">
            {ROLES.map((r) => (
              <button
                key={r.role}
                onClick={() => setRole(r.role)}
                className={`flex flex-col items-center gap-2 p-4 rounded-3xl border-2 transition-all active:scale-95 ${
                  role === r.role ? r.active : r.color
                }`}
              >
                <span className="text-3xl">{r.emoji}</span>
                <span className="font-black text-sm text-gray-800">{r.label}</span>
                <span className="text-[10px] text-gray-400 text-center leading-tight">{r.sub}</span>
              </button>
            ))}
          </div>

          {/* 관리자 PIN */}
          {role === "admin" && (
            <div className="mt-1">
              <p className="text-xs text-gray-500 text-center mb-2">관리자 PIN 4자리를 입력하세요</p>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="• • • •"
                className="w-full text-center text-xl font-black tracking-[0.5em] border-2 border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-[#4C1D95]"
              />
            </div>
          )}

          <button
            onClick={startLogin}
            disabled={!canStart}
            className="w-full mt-2 py-4 rounded-full bg-gradient-to-r from-[#4C1D95] to-[#A855F7] text-white font-black text-base shadow-lg active:scale-95 transition-all disabled:opacity-40"
          >
            Pi로 시작하기 ▶
          </button>

          <p className="text-center text-[11px] text-gray-400">
            기존 회원은 처음 가입한 역할로 자동 로그인됩니다
          </p>
        </div>
      )}

      {/* 로딩 */}
      {status !== "role" && status !== "error" && (
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-4 border-[#A855F7] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">{LABEL[status]}</p>
        </div>
      )}

      {/* 오류 */}
      {status === "error" && (
        <div className="w-full max-w-xs bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
          <p className="text-sm text-red-600 font-bold whitespace-pre-line break-all">
            ⚠️ {error}
          </p>
          <button
            onClick={() => {
              started.current = false;
              setAdminPin("");
              setStatus("role");
              setError("");
            }}
            className="mt-4 px-6 py-2 bg-[#7B3FE4] text-white rounded-full text-sm font-bold active:scale-95 transition-transform"
          >
            다시 시도
          </button>
        </div>
      )}
    </div>
  );
}

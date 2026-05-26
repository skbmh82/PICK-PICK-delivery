"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase/client";

type NewRole = "user" | "owner" | "rider";
type Status  =
  | "checking"   // 기존 세션 확인
  | "sdk"        // Pi SDK 초기화
  | "auth"       // Pi 인증
  | "login"      // 서버 로그인
  | "roleSelect" // 신규 유저 역할 선택
  | "saving"     // 역할 저장
  | "done"       // 이동 중
  | "error";

const STATUS_LABEL: Partial<Record<Status, string>> = {
  checking:  "로그인 상태 확인 중...",
  sdk:       "Pi SDK 초기화 중...",
  auth:      "Pi 인증 중...",
  login:     "로그인 중...",
  saving:    "역할 저장 중...",
  done:      "이동 중...",
};

const ROLE_OPTIONS: { role: NewRole; emoji: string; label: string; sub: string; active: string }[] = [
  { role: "user",  emoji: "👤", label: "일반 유저", sub: "음식 주문 · PICK 적립",   active: "border-pick-purple bg-pick-purple/5" },
  { role: "owner", emoji: "🏪", label: "사장님",   sub: "가게 등록 · 주문 관리",   active: "border-amber-400 bg-amber-50" },
  { role: "rider", emoji: "🛵", label: "라이더",   sub: "배달 수행 · 수익 적립",   active: "border-sky-400 bg-sky-50" },
];

function destByRole(role: string) {
  return role === "owner" ? "/owner/dashboard"
       : role === "rider" ? "/rider/dashboard"
       : "/home";   // user, admin 모두 홈으로 (admin은 MyPick에서 대시보드 진입)
}

export default function SplashPage() {
  const [status,       setStatus]       = useState<Status>("checking");
  const [error,        setError]        = useState("");
  const [selectedRole, setSelectedRole] = useState<NewRole>("user");
  const started = useRef(false);

  useEffect(() => {
    void checkSession();
  }, []);

  async function checkSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // 기존 세션 있음 → 역할 조회 후 바로 이동
        try {
          const { data } = await supabase
            .from("users")
            .select("role")
            .eq("auth_id", session.user.id)
            .single();
          if (data?.role) {
            setStatus("done");
            window.location.replace(destByRole(data.role as string));
            return;
          }
        } catch { /* role 조회 실패 시 /home으로 */ }
        // 세션은 있으나 역할 조회 실패 → 홈으로 안전하게 이동
        setStatus("done");
        window.location.replace("/home");
        return;
      }
    } catch {
      // getSession 실패 시 Pi 인증으로 진행
    }

    // Pi SDK 없으면 일반 브라우저 → /login으로
    if (!window.Pi) {
      let ms = 0;
      while (!window.Pi && ms < 3_000) {
        await new Promise<void>((r) => setTimeout(r, 200));
        ms += 200;
      }
    }
    if (!window.Pi) {
      window.location.replace("/login");
      return;
    }

    void runPiAuth();
  }

  async function runPiAuth() {
    if (started.current) return;
    started.current = true;

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
      setStatus("auth");
      await (window.Pi.init({ version: "2.0" }) as unknown as Promise<void> | void);
      const auth = await window.Pi.authenticate(["username"], async () => {});

      // 서버 로그인 (30초 타임아웃) — role 없이 전송
      setStatus("login");
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 30_000);

      let res: Response;
      try {
        res = await fetch("/api/auth/pi-login", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ accessToken: auth.accessToken }),
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

      const data = await res.json() as {
        role: string; access_token: string; refresh_token: string; isNew: boolean;
      };

      // Supabase 세션 설정
      const { error: sessionError } = await supabase.auth.setSession({
        access_token:  data.access_token,
        refresh_token: data.refresh_token,
      });
      if (sessionError) {
        setError(`세션 설정 실패: ${sessionError.message}`);
        setStatus("error");
        return;
      }
      // Pi Browser는 하드 네비게이션 시 모든 스토리지 초기화 → 해시로 토큰 전달
      try { sessionStorage.setItem("_pp_token", data.access_token); } catch {}
      try { localStorage.setItem("_pp_token", data.access_token); } catch {}

      if (data.isNew) {
        // 신규 가입 → 역할 선택
        setSelectedRole("user");
        setStatus("roleSelect");
      } else {
        // 기존 유저 → 해시에 토큰 포함해서 이동 (AuthProvider가 읽어 _cachedToken으로 캐시)
        setStatus("done");
        const dest = destByRole(data.role);
        window.location.replace(`${dest}#_pp=${encodeURIComponent(data.access_token)}`);
      }
    } catch (e: unknown) {
      const msg =
        e instanceof Error && e.name === "AbortError"
          ? "서버 응답 시간 초과 (30초). 다시 시도해 주세요."
          : e instanceof Error ? e.message : String(e);
      setError(msg);
      setStatus("error");
    }
  }

  async function handleRoleConfirm() {
    setStatus("saving");
    try {
      await fetch("/api/users/me/role", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ role: selectedRole }),
      });
    } catch { /* 실패해도 이동 */ }
    setStatus("done");
    const { data: { session } } = await supabase.auth.getSession();
    const tok = session?.access_token ?? "";
    const dest = destByRole(selectedRole);
    window.location.replace(tok ? `${dest}#_pp=${encodeURIComponent(tok)}` : dest);
  }

  function handleRetry() {
    started.current = false;
    setError("");
    setStatus("checking");
    void checkSession();
  }

  const isLoading = !["roleSelect", "error"].includes(status);

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

      {/* 로딩 */}
      {isLoading && (
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-4 border-[#A855F7] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">{STATUS_LABEL[status] ?? ""}</p>
        </div>
      )}

      {/* 신규 유저 역할 선택 */}
      {status === "roleSelect" && (
        <div className="w-full max-w-xs flex flex-col gap-4">
          <div className="text-center">
            <p className="text-base font-black text-gray-700">어떤 역할로 시작할까요?</p>
            <p className="text-xs text-gray-400 mt-1">나중에 마이페이지에서 변경할 수 있어요</p>
          </div>
          <div className="flex flex-col gap-3">
            {ROLE_OPTIONS.map((r) => (
              <button
                key={r.role}
                onClick={() => setSelectedRole(r.role)}
                className={`flex items-center gap-4 p-4 rounded-3xl border-2 transition-all active:scale-95 ${
                  selectedRole === r.role ? r.active : "border-pick-border bg-white"
                }`}
              >
                <span className="text-3xl">{r.emoji}</span>
                <div className="text-left">
                  <p className="font-black text-sm text-gray-800">{r.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{r.sub}</p>
                </div>
                {selectedRole === r.role && (
                  <span className="ml-auto text-pick-purple font-black text-lg">✓</span>
                )}
              </button>
            ))}
          </div>
          <button
            onClick={() => void handleRoleConfirm()}
            className="w-full py-4 rounded-full bg-gradient-to-r from-[#4C1D95] to-[#A855F7] text-white font-black text-base shadow-lg active:scale-95 transition-all mt-1"
          >
            시작하기 →
          </button>
        </div>
      )}

      {/* 오류 */}
      {status === "error" && (
        <div className="w-full max-w-xs bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
          <p className="text-sm text-red-600 font-bold whitespace-pre-line break-all">
            ⚠️ {error}
          </p>
          <button
            onClick={handleRetry}
            className="mt-4 px-6 py-2 bg-[#7B3FE4] text-white rounded-full text-sm font-bold active:scale-95 transition-transform"
          >
            다시 시도
          </button>
        </div>
      )}
    </div>
  );
}

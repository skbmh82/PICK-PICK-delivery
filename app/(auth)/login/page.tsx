"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { loadPiSdk } from "@/components/pwa/PiSdkLoader";

// ── Pi Browser 전용 타입 ─────────────────────────────────
type PiStatus =
  | "checking" | "sdk" | "auth" | "login"
  | "roleSelect" | "saving" | "done" | "error";

const PI_STATUS_LABEL: Partial<Record<PiStatus, string>> = {
  checking: "로그인 상태 확인 중...",
  sdk:      "Pi SDK 초기화 중...",
  auth:     "Pi 인증 중...",
  login:    "로그인 중...",
  saving:   "역할 저장 중...",
  done:     "이동 중...",
};

type NewRole = "user" | "owner" | "rider";

const ROLE_OPTIONS = [
  { role: "user"  as NewRole, emoji: "👤", label: "일반 유저", sub: "음식 주문 · PICK 적립",   active: "border-pick-purple bg-pick-purple/5" },
  { role: "owner" as NewRole, emoji: "🏪", label: "사장님",   sub: "가게 등록 · 주문 관리",   active: "border-amber-400 bg-amber-50" },
  { role: "rider" as NewRole, emoji: "🛵", label: "라이더",   sub: "배달 수행 · 수익 적립",   active: "border-sky-400 bg-sky-50" },
];

function destByRole(role: string) {
  return role === "owner" ? "/owner/dashboard"
       : role === "rider" ? "/rider/dashboard"
       : "/home";
}

function KakaoIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="#3C1E1E">
      <path d="M12 3C6.477 3 2 6.477 2 10.8c0 2.74 1.63 5.15 4.09 6.59L5.1 21l4.54-2.95c.77.12 1.55.18 2.36.18 5.523 0 10-3.477 10-7.8C22 6.477 17.523 3 12 3z"/>
    </svg>
  );
}

// ── 일반 브라우저용 이메일/카카오 로그인 ─────────────────
function NormalLogin({ onPiClick }: { onPiClick: () => void }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [kakaoLoading, setKakaoLoading] = useState(false);
  const [error,    setError]    = useState("");

  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError("");
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) { setError(authError.message); return; }
      if (data.session) {
        const { data: profile } = await supabase
          .from("users").select("role").eq("auth_id", data.session.user.id).single();
        window.location.replace(destByRole(profile?.role ?? "user"));
      }
    } catch {
      setError("로그인에 실패했습니다");
    } finally {
      setLoading(false);
    }
  };

  const handleKakaoLogin = async () => {
    setKakaoLoading(true);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options:  { redirectTo: `${window.location.origin}/api/auth/callback` },
    });
    if (oauthError) setKakaoLoading(false);
  };

  return (
    <div className="w-full max-w-xs flex flex-col gap-4">
      {/* Pi Browser 로그인 */}
      <button
        onClick={onPiClick}
        className="w-full flex items-center justify-center gap-3 py-3.5 rounded-full bg-gradient-to-r from-[#4C1D95] to-[#A855F7] font-bold text-white text-sm active:scale-95 transition-all shadow-md"
      >
        <span className="text-lg leading-none">π</span>
        Pi Browser로 로그인
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">또는</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* 카카오 로그인 */}
      <button
        onClick={() => void handleKakaoLogin()}
        disabled={kakaoLoading}
        className="w-full flex items-center justify-center gap-3 py-3.5 rounded-full bg-[#FEE500] font-bold text-[#3C1E1E] text-sm active:scale-95 transition-all disabled:opacity-60 shadow-sm"
      >
        {kakaoLoading
          ? <span className="w-5 h-5 border-2 border-[#3C1E1E]/30 border-t-[#3C1E1E] rounded-full animate-spin" />
          : <KakaoIcon />}
        카카오로 로그인
      </button>

      {/* 이메일 로그인 폼 */}
      <form onSubmit={(e) => void handleEmailLogin(e)} className="flex flex-col gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일"
          required
          className="w-full border-2 border-pick-border rounded-2xl px-4 py-3 text-sm text-pick-text focus:outline-none focus:border-pick-purple bg-white"
        />
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            required
            className="w-full border-2 border-pick-border rounded-2xl px-4 py-3 pr-11 text-sm text-pick-text focus:outline-none focus:border-pick-purple bg-white"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {error && <p className="text-xs text-red-500 font-bold text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#1d4ed8] to-[#38bdf8] text-white font-black text-sm active:scale-95 transition-all disabled:opacity-60 shadow-md"
        >
          {loading
            ? <span className="inline-block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            : "로그인"}
        </button>
      </form>

      <p className="text-center text-xs text-gray-400">
        계정이 없으신가요?{" "}
        <Link href="/register" className="text-pick-purple font-bold underline underline-offset-2">
          회원가입
        </Link>
      </p>
    </div>
  );
}

// ── Pi Browser용 Pi 인증 ──────────────────────────────────
function PiLogin() {
  const [status,       setStatus]       = useState<PiStatus>("checking");
  const [error,        setError]        = useState("");
  const [selectedRole, setSelectedRole] = useState<NewRole>("user");
  const started = useRef(false);

  useEffect(() => { void checkSession(); }, []);

  async function checkSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        try {
          const { data } = await supabase.from("users").select("role").eq("auth_id", session.user.id).single();
          if (data?.role) { setStatus("done"); window.location.replace(destByRole(data.role as string)); return; }
        } catch {}
        setStatus("done"); window.location.replace("/home"); return;
      }
    } catch {}
    void runPiAuth();
  }

  async function runPiAuth() {
    if (started.current) return;
    started.current = true;
    setStatus("sdk");
    // PiSdkLoader가 /login에서 건너뛰므로 여기서 직접 로드
    await loadPiSdk();
    if (!window.Pi) { setError("Pi SDK를 불러올 수 없어요. 다시 시도해주세요."); setStatus("error"); return; }

    try {
      setStatus("auth");
      await (window.Pi.init({ version: "2.0" }) as unknown as Promise<void> | void);
      const auth = await window.Pi.authenticate(["username"], async () => {});
      setStatus("login");
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 30_000);
      let res: Response;
      try {
        res = await fetch("/api/auth/pi-login", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken: auth.accessToken }), signal: controller.signal,
        });
      } finally { clearTimeout(timer); }
      if (!res.ok) {
        const j = await res.json().catch(() => ({})) as { error?: string };
        setError(j.error ?? `서버 오류 (${res.status})`); setStatus("error"); return;
      }
      const data = await res.json() as { role: string; access_token: string; refresh_token: string; isNew: boolean };
      const { error: sessionError } = await supabase.auth.setSession({ access_token: data.access_token, refresh_token: data.refresh_token });
      if (sessionError) { setError(`세션 설정 실패: ${sessionError.message}`); setStatus("error"); return; }
      try { sessionStorage.setItem("_pp_token", data.access_token); } catch {}
      try { localStorage.setItem("_pp_token", data.access_token); } catch {}
      if (data.isNew) { setSelectedRole("user"); setStatus("roleSelect"); }
      else {
        setStatus("done");
        const dest = destByRole(data.role);
        window.location.replace(`${dest}#_pp_at=${encodeURIComponent(data.access_token)}&_pp_rt=${encodeURIComponent(data.refresh_token)}`);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error && e.name === "AbortError" ? "서버 응답 시간 초과 (30초). 다시 시도해 주세요." : e instanceof Error ? e.message : String(e);
      setError(msg); setStatus("error");
    }
  }

  async function handleRoleConfirm() {
    setStatus("saving");
    try { await fetch("/api/users/me/role", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: selectedRole }) }); } catch {}
    setStatus("done");
    const { data: { session } } = await supabase.auth.getSession();
    const dest = destByRole(selectedRole);
    const at = session?.access_token ?? ""; const rt = session?.refresh_token ?? "";
    window.location.replace(at && rt ? `${dest}#_pp_at=${encodeURIComponent(at)}&_pp_rt=${encodeURIComponent(rt)}` : dest);
  }

  const isLoading = !["roleSelect", "error"].includes(status);

  return (
    <>
      {isLoading && (
        <div className="flex flex-col items-center gap-3">
          <div className="w-9 h-9 border-4 border-[#A855F7] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">{PI_STATUS_LABEL[status] ?? ""}</p>
        </div>
      )}
      {status === "roleSelect" && (
        <div className="w-full max-w-xs flex flex-col gap-4">
          <div className="text-center">
            <p className="text-base font-black text-gray-700">어떤 역할로 시작할까요?</p>
            <p className="text-xs text-gray-400 mt-1">나중에 마이페이지에서 변경할 수 있어요</p>
          </div>
          <div className="flex flex-col gap-3">
            {ROLE_OPTIONS.map((r) => (
              <button key={r.role} onClick={() => setSelectedRole(r.role)}
                className={`flex items-center gap-4 p-4 rounded-3xl border-2 transition-all active:scale-95 ${selectedRole === r.role ? r.active : "border-pick-border bg-white"}`}>
                <span className="text-3xl">{r.emoji}</span>
                <div className="text-left">
                  <p className="font-black text-sm text-gray-800">{r.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{r.sub}</p>
                </div>
                {selectedRole === r.role && <span className="ml-auto text-pick-purple font-black text-lg">✓</span>}
              </button>
            ))}
          </div>
          <button onClick={() => void handleRoleConfirm()}
            className="w-full py-4 rounded-full bg-gradient-to-r from-[#4C1D95] to-[#A855F7] text-white font-black text-base shadow-lg active:scale-95 transition-all mt-1">
            시작하기 →
          </button>
        </div>
      )}
      {status === "error" && (
        <div className="w-full max-w-xs bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
          <p className="text-sm text-red-600 font-bold whitespace-pre-line break-all">⚠️ {error}</p>
          <button onClick={() => { started.current = false; setError(""); setStatus("checking"); void checkSession(); }}
            className="mt-4 px-6 py-2 bg-[#7B3FE4] text-white rounded-full text-sm font-bold active:scale-95 transition-transform">
            다시 시도
          </button>
        </div>
      )}
    </>
  );
}

// ── 메인 페이지 ───────────────────────────────────────────
export default function LoginPage() {
  // "normal" = 이메일/카카오, "pi" = Pi 인증
  const [mode, setMode] = useState<"normal" | "pi">("normal");

  useEffect(() => {
    // UA 또는 도메인 확인으로 Pi 환경 빠르게 감지 → 자동 전환
    const ua   = navigator.userAgent;
    const host = window.location.hostname;
    if (
      /PiBrowser/i.test(ua) ||
      host.endsWith(".pinet.com") ||
      host.endsWith(".minepi.com")
    ) {
      setMode("pi");
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAF5FF] gap-6 px-6 py-10">
      <div className="text-center">
        <p className="text-7xl mb-3">🛵</p>
        <h1 className="text-4xl font-black text-[#4C1D95]" style={{ fontFamily: "var(--font-logo, 'Jua', sans-serif)" }}>
          PICK PICK
        </h1>
        <p className="text-sm text-gray-500 mt-1">맛있는 음식을 PICK 하세요!</p>
      </div>

      {mode === "pi" ? (
        <>
          <PiLogin />
          <button
            onClick={() => setMode("normal")}
            className="text-xs text-gray-400 underline underline-offset-2"
          >
            이메일로 로그인
          </button>
        </>
      ) : (
        <NormalLogin onPiClick={() => setMode("pi")} />
      )}
    </div>
  );
}

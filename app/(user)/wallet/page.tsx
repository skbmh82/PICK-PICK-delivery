"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  ArrowDownLeft, ArrowUpRight, X, Check, Search, User,
  ShoppingCart, Gift, Fingerprint, Wallet, History, Flame,
  Coins, TrendingUp, ArrowLeftRight, Lock, Info, Star,
} from "lucide-react";

// ── 충전 모달 ─────────────────────────────────────────
const CHARGE_PRESETS = [1000, 3000, 5000, 10000, 30000, 50000];

function ChargeModal({ onClose, onCharged }: { onClose: () => void; onCharged: () => void }) {
  const [amount,  setAmount]  = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleCharge = async () => {
    const num = parseInt(amount, 10);
    if (isNaN(num) || num < 100) return setError("100 PICK 이상 입력해주세요");
    if (num > 1000000)           return setError("최대 1,000,000 PICK까지 충전 가능합니다");
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/wallet/charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: num, description: "PICK 직접 충전" }),
      });
      if (res.ok) { onCharged(); onClose(); }
      else {
        const err = await res.json().catch(() => ({}));
        setError(err.error ?? "충전에 실패했습니다");
      }
    } finally { setLoading(false); }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[55]" onClick={onClose} />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[60] bg-white rounded-t-3xl shadow-2xl">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-pick-border">
          <h2 className="font-black text-pick-text text-lg">PICK 충전 💜</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-pick-bg">
            <X size={16} className="text-pick-text-sub" />
          </button>
        </div>
        <div className="px-5 py-4 flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-pick-text-sub mb-1.5 block">충전 금액 (PICK)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
              placeholder="충전할 PICK 수량 입력"
              className="w-full border-2 border-pick-border rounded-2xl px-4 py-3 text-sm text-pick-text focus:outline-none focus:border-pick-purple"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {CHARGE_PRESETS.map((p) => (
              <button key={p} onClick={() => setAmount(String(p))}
                className={`py-2.5 rounded-2xl text-sm font-bold transition-all ${
                  amount === String(p)
                    ? "bg-pick-purple text-white"
                    : "bg-pick-bg border border-pick-border text-pick-text"
                }`}>
                {p.toLocaleString()}P
              </button>
            ))}
          </div>
          {error && <p className="text-xs text-red-500 font-bold text-center">{error}</p>}
        </div>
        <div className="px-5 pb-8 pt-1 border-t border-pick-border">
          <button onClick={() => void handleCharge()} disabled={loading || !amount}
            className="w-full bg-gradient-to-r from-pick-purple to-pick-purple-light text-white font-black py-4 rounded-full shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50">
            {loading
              ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <Check size={18} />}
            {amount ? `${parseInt(amount || "0").toLocaleString()} PICK 충전` : "충전하기"}
          </button>
        </div>
      </div>
    </>
  );
}

// ── 보내기 모달 ───────────────────────────────────────
const TRANSFER_PRESETS = [100, 500, 1000, 3000, 5000, 10000];
interface FoundUser { id: string; name: string; email: string; profileImage: string | null }

function TransferModal({ myBalance, onClose, onTransferred }: {
  myBalance: number; onClose: () => void; onTransferred: () => void;
}) {
  const [email,     setEmail]     = useState("");
  const [amount,    setAmount]    = useState("");
  const [memo,      setMemo]      = useState("");
  const [found,     setFound]     = useState<FoundUser | null>(null);
  const [searching, setSearching] = useState(false);
  const [notFound,  setNotFound]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [done,      setDone]      = useState(false);

  const searchUser = async () => {
    if (!email.includes("@")) return;
    setSearching(true); setFound(null); setNotFound(false); setError("");
    try {
      const res = await fetch(`/api/users/search?email=${encodeURIComponent(email)}`);
      const json = await res.json();
      if (json.user) setFound(json.user); else setNotFound(true);
    } finally { setSearching(false); }
  };

  const handleTransfer = async () => {
    const num = parseInt(amount, 10);
    if (!found)               return setError("수신자를 먼저 검색해주세요");
    if (isNaN(num) || num < 1) return setError("1 PICK 이상 입력해주세요");
    if (num > myBalance)       return setError(`잔액 부족 (보유: ${myBalance.toLocaleString()} PICK)`);
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/wallet/transfer", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toEmail: found.email, amount: num, memo: memo || undefined }),
      });
      if (res.ok) {
        setDone(true);
        setTimeout(() => { onTransferred(); onClose(); }, 1500);
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.error ?? "전송에 실패했습니다");
      }
    } finally { setLoading(false); }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[55]" onClick={onClose} />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[60] bg-white dark:bg-pick-card rounded-t-3xl shadow-2xl">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-pick-border">
          <h2 className="font-black text-pick-text text-lg">PICK 보내기 🚀</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-pick-bg">
            <X size={16} className="text-pick-text-sub" />
          </button>
        </div>
        {done ? (
          <div className="px-5 py-10 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <Check size={32} className="text-green-600" />
            </div>
            <p className="font-black text-pick-text text-lg">전송 완료!</p>
            <p className="text-sm text-pick-text-sub">{found?.name}님께 {parseInt(amount).toLocaleString()} PICK을 보냈어요</p>
          </div>
        ) : (
          <div className="px-5 py-4 flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-pick-text-sub mb-1.5 block">받는 사람 이메일</label>
              <div className="flex gap-2">
                <input type="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); setFound(null); setNotFound(false); }}
                  onKeyDown={(e) => e.key === "Enter" && searchUser()}
                  placeholder="example@email.com"
                  className="flex-1 border-2 border-pick-border rounded-2xl px-4 py-3 text-sm text-pick-text focus:outline-none focus:border-pick-purple"
                />
                <button onClick={() => void searchUser()} disabled={searching || !email.includes("@")}
                  className="w-12 h-12 rounded-2xl bg-pick-purple text-white flex items-center justify-center disabled:opacity-40 flex-shrink-0">
                  {searching
                    ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    : <Search size={18} />}
                </button>
              </div>
              {found && (
                <div className="mt-2 flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
                  <div className="w-9 h-9 rounded-full bg-pick-purple/10 flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-pick-purple" />
                  </div>
                  <div><p className="text-sm font-bold text-pick-text">{found.name}</p>
                    <p className="text-xs text-pick-text-sub">{found.email}</p></div>
                  <Check size={16} className="text-green-600 ml-auto" />
                </div>
              )}
              {notFound && <p className="mt-2 text-xs text-red-500 font-bold px-1">해당 이메일의 사용자를 찾을 수 없어요</p>}
            </div>
            <div>
              <label className="text-xs font-bold text-pick-text-sub mb-1.5 block">
                전송 금액 (PICK) · 보유 {myBalance.toLocaleString()}P
              </label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                placeholder="전송할 PICK 수량" min="1"
                className="w-full border-2 border-pick-border rounded-2xl px-4 py-3 text-sm text-pick-text focus:outline-none focus:border-pick-purple"
              />
              <div className="grid grid-cols-3 gap-2 mt-2">
                {TRANSFER_PRESETS.map((p) => (
                  <button key={p} onClick={() => setAmount(String(p))}
                    className={`py-2 rounded-2xl text-xs font-bold transition-all ${
                      amount === String(p)
                        ? "bg-pick-purple text-white"
                        : "bg-pick-bg border border-pick-border text-pick-text"
                    }`}>
                    {p.toLocaleString()}P
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-pick-text-sub mb-1.5 block">메모 (선택)</label>
              <input type="text" value={memo} onChange={(e) => setMemo(e.target.value)}
                placeholder="메모를 입력해주세요" maxLength={100}
                className="w-full border-2 border-pick-border rounded-2xl px-4 py-3 text-sm text-pick-text focus:outline-none focus:border-pick-purple"
              />
            </div>
            {error && <p className="text-xs text-red-500 font-bold text-center">{error}</p>}
          </div>
        )}
        {!done && (
          <div className="px-5 pb-8 pt-1 border-t border-pick-border">
            <button onClick={() => void handleTransfer()} disabled={loading || !found || !amount}
              className="w-full bg-gradient-to-r from-pick-purple to-pick-purple-light text-white font-black py-4 rounded-full shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50">
              {loading
                ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <ArrowUpRight size={18} />}
              {found && amount
                ? `${found.name}님께 ${parseInt(amount || "0").toLocaleString()} PICK 보내기`
                : "보내기"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}


// ── 타입 ─────────────────────────────────────────────
interface Transaction {
  id: string; type: string; amount: number;
  balanceAfter: number; description: string | null; createdAt: string;
}
interface WalletData {
  balance: number; lockedBalance: number; totalEarned: number; transactions: Transaction[];
}

// ── 거래 유형 설정 ────────────────────────────────────
const TX_CONFIG: Record<string, {
  label: string; color: string; bg: string; sign: string; icon: React.ReactNode;
}> = {
  charge:   { label: "충전",   color: "text-green-600",       bg: "bg-green-50",    sign: "+", icon: <ArrowDownLeft size={18} /> },
  payment:  { label: "결제",   color: "text-red-500",         bg: "bg-red-50",      sign: "-", icon: <ShoppingCart size={18} /> },
  refund:   { label: "환불",   color: "text-blue-500",        bg: "bg-blue-50",     sign: "+", icon: <ArrowDownLeft size={18} /> },
  reward:   { label: "리워드", color: "text-pick-purple",     bg: "bg-pick-surface",sign: "+", icon: <Gift size={18} /> },
  transfer: { label: "전송",   color: "text-pick-yellow",     bg: "bg-pick-bg",     sign: "-", icon: <ArrowUpRight size={18} /> },
  withdraw: { label: "출금",   color: "text-pick-text-sub",   bg: "bg-pick-bg",     sign: "-", icon: <ArrowUpRight size={18} /> },
};

function txIcon(tx: Transaction) {
  if (tx.type === "reward" && tx.description?.includes("출석")) {
    return <Fingerprint size={18} />;
  }
  return TX_CONFIG[tx.type]?.icon ?? <ArrowDownLeft size={18} />;
}

// ── 로딩 스켈레톤 ─────────────────────────────────────
function WalletSkeleton() {
  return (
    <div className="min-h-full px-4 py-6 flex flex-col gap-5 animate-pulse">
      <div className="h-52 bg-pick-purple-light/30 rounded-3xl" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-14 bg-gray-100 rounded-full" />
        <div className="h-14 bg-gray-100 rounded-full" />
      </div>
      <div className="h-28 bg-pick-bg rounded-3xl border-2 border-pick-border" />
      <div className="h-6 w-32 bg-gray-200 rounded-full" />
      {[0,1,2].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-3xl" />)}
    </div>
  );
}

// ── Pi 결제 훅 ────────────────────────────────────────
function usePiPayment(onSuccess: () => void) {
  const [piStatus, setPiStatus]   = useState<"idle"|"auth"|"paying"|"done"|"error">("idle");
  const [piError,  setPiError]    = useState("");
  const hasPi = typeof window !== "undefined" && !!window.Pi;

  const payWithPi = useCallback(async (amount: number, memo: string) => {
    if (!window.Pi) { setPiError("Pi Browser에서만 사용 가능합니다"); return; }
    setPiStatus("auth"); setPiError("");
    try {
      window.Pi.init({ version: "2.0", sandbox: true });
      await window.Pi.authenticate(["payments"], async (incompletePmt) => {
        // 미완료 결제 처리
        if (incompletePmt.status.developer_approved && !incompletePmt.status.developer_completed) {
          const txid = incompletePmt.transaction?.txid;
          if (txid) {
            await fetch("/api/pi/complete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId: incompletePmt.identifier, txid }),
            });
          }
        }
      });
      setPiStatus("paying");
      window.Pi.createPayment(
        { amount, memo, metadata: { source: "pickpick_wallet" } },
        {
          onReadyForServerApproval: async (paymentId) => {
            await fetch("/api/pi/approve", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId }),
            });
          },
          onReadyForServerCompletion: async (paymentId, txid) => {
            await fetch("/api/pi/complete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId, txid }),
            });
            setPiStatus("done");
            onSuccess();
          },
          onCancel: () => { setPiStatus("idle"); },
          onError: (err) => { setPiStatus("error"); setPiError(err.message); },
        }
      );
    } catch (e) {
      setPiStatus("error");
      setPiError(e instanceof Error ? e.message : "Pi 인증 실패");
    }
  }, [onSuccess]);

  return { hasPi, piStatus, piError, payWithPi };
}

// ── 메인 페이지 ───────────────────────────────────────
export default function WalletPage() {
  const [data,          setData]          = useState<WalletData | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [isLoggedIn,    setIsLoggedIn]    = useState(true);
  const [chargeOpen,    setChargeOpen]    = useState(false);
  const [transferOpen,  setTransferOpen]  = useState(false);

  // 출석 체크인
  const [checkedToday,  setCheckedToday]  = useState(false);
  const [streak,        setStreak]        = useState(0);
  const [checkLoading,  setCheckLoading]  = useState(false);
  const [checkDone,     setCheckDone]     = useState(false);
  const checkinFetched = useRef(false);

  const fetchWallet = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/wallet/transactions");
      if (res.status === 401) { setIsLoggedIn(false); return; }
      if (res.ok) setData(await res.json());
    } finally { setLoading(false); }
  }, []);

  const { hasPi, piStatus, piError, payWithPi } = usePiPayment(fetchWallet);

  const fetchCheckin = useCallback(async () => {
    if (checkinFetched.current) return;
    checkinFetched.current = true;
    try {
      const res = await fetch("/api/wallet/checkin");
      if (res.ok) {
        const json = await res.json();
        setCheckedToday(json.checkedToday);
        setStreak(json.streak);
      }
    } catch { /* 무시 */ }
  }, []);

  useEffect(() => { fetchWallet(); fetchCheckin(); }, [fetchWallet, fetchCheckin]);

  const handleCheckin = async () => {
    if (checkedToday || checkLoading) return;
    setCheckLoading(true);
    try {
      const res = await fetch("/api/wallet/checkin", { method: "POST" });
      if (res.ok) {
        const json = await res.json();
        setCheckedToday(true);
        setStreak(json.streak);
        setCheckDone(true);
        const walletRes = await fetch("/api/wallet/transactions");
        if (walletRes.ok) setData(await walletRes.json());
        setTimeout(() => setCheckDone(false), 3000);
      }
    } finally { setCheckLoading(false); }
  };

  if (loading) return <WalletSkeleton />;

  const balance      = data?.balance       ?? 0;
  const lockedBalance = data?.lockedBalance ?? 0;
  const totalEarned  = data?.totalEarned   ?? 0;
  const transactions = data?.transactions  ?? [];

  return (
    <div className="min-h-full px-4 py-6 flex flex-col gap-5">

      {/* ── 잔액 카드 ── */}
      <div className="rounded-3xl bg-gradient-to-br from-pick-purple-dark via-pick-purple to-pick-purple-light p-6 text-white shadow-xl">
        {/* 상단: 레이블 + 시세 */}
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm text-white/70 font-medium">내 PICK 잔액 💜</p>
          <span className="text-[11px] text-white/60 bg-white/10 px-2.5 py-1 rounded-full font-medium">
            1 PICK = ₩1.00
          </span>
        </div>

        {/* 잔액 숫자 */}
        <div className="flex items-end gap-2 mb-1">
          <span className="text-5xl font-black">{balance.toLocaleString()}</span>
          <span className="text-pick-yellow-light font-black text-xl mb-1.5">PICK</span>
        </div>
        <p className="text-sm text-white/60 font-medium mb-5">≈ ₩{balance.toLocaleString()}</p>

        {/* 잠금 잔액 + 누적 적립 */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-white/10 rounded-2xl px-4 py-2.5 flex items-center gap-2">
            <Coins size={13} className="text-white/60" />
            <div>
              <p className="text-[10px] text-white/60">잠금 잔액</p>
              <p className="text-sm font-black text-white">{lockedBalance.toLocaleString()} P</p>
            </div>
          </div>
          <div className="bg-white/10 rounded-2xl px-4 py-2.5 flex items-center gap-2">
            <TrendingUp size={13} className="text-white/60" />
            <div>
              <p className="text-[10px] text-white/60">누적 적립</p>
              <p className="text-sm font-black text-pick-yellow-light">{totalEarned.toLocaleString()} P</p>
            </div>
          </div>
        </div>

        {/* Pi 잔액 / 결제 */}
        <div className="bg-white/10 rounded-2xl px-4 py-3 mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">π</span>
            <div>
              <p className="text-[10px] text-white/60">Pi Network</p>
              {hasPi ? (
                <p className="text-sm font-black text-pick-yellow-light">Pi Browser 연결됨 ✓</p>
              ) : (
                <p className="text-sm font-black text-white/40 flex items-center gap-1">
                  <Lock size={11} />
                  Pi Browser에서 열어주세요
                </p>
              )}
            </div>
          </div>
          {hasPi ? (
            <button
              onClick={() => void payWithPi(0.001, "PICK PICK 테스트 결제")}
              disabled={piStatus === "auth" || piStatus === "paying" || piStatus === "done"}
              className="text-[11px] font-black text-pick-purple bg-white px-3 py-1.5 rounded-full active:scale-95 transition-all disabled:opacity-50"
            >
              {piStatus === "auth"   ? "인증 중..." :
               piStatus === "paying" ? "결제 중..." :
               piStatus === "done"   ? "완료 ✓"    : "Pi 결제"}
            </button>
          ) : (
            <span className="text-[10px] text-white/40 bg-white/10 px-2 py-0.5 rounded-full">준비 중</span>
          )}
        </div>
        {piError && (
          <p className="text-[10px] text-red-300 bg-red-900/30 rounded-xl px-3 py-1.5 mb-2">{piError}</p>
        )}

        {/* 토큰 기본 정보 */}
        <div className="flex items-center gap-3 bg-white/10 rounded-2xl px-4 py-2.5 mb-5">
          <Info size={12} className="text-white/40 flex-shrink-0" />
          <p className="text-[10px] text-white/50 leading-relaxed">
            총 발행량 <span className="font-black text-white/70">100억 PICK</span>
            &nbsp;·&nbsp;
            현재 시세 <span className="font-black text-white/70">1 PICK = ₩1.00</span>
          </p>
        </div>

        {/* 충전 / 보내기 버튼 */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setChargeOpen(true)}
            className="flex items-center justify-center gap-2 bg-white text-pick-purple rounded-full py-3.5 font-bold text-sm active:scale-95 transition-all shadow-sm">
            <ArrowDownLeft size={16} />
            충전하기
          </button>
          <button onClick={() => setTransferOpen(true)}
            className="flex items-center justify-center gap-2 bg-white/20 text-white border border-white/30 rounded-full py-3.5 font-bold text-sm active:scale-95 transition-all">
            <ArrowUpRight size={16} />
            보내기
          </button>
        </div>
      </div>

      {/* ── PICK ↔ Pi 교환 ── */}
      <div className="bg-white dark:bg-pick-card rounded-3xl border-2 border-pick-border shadow-sm overflow-hidden">
        {/* 헤더 */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-pick-purple/10 flex items-center justify-center">
              <ArrowLeftRight size={18} className="text-pick-purple" />
            </span>
            <div>
              <p className="text-sm font-black text-pick-text">PICK ↔ Pi 교환</p>
              <p className="text-xs text-pick-text-sub">Pi Network 연동 후 이용 가능</p>
            </div>
          </div>
          <span className="text-[10px] font-black text-pick-purple bg-pick-purple/10 px-2.5 py-1 rounded-full">준비 중</span>
        </div>

        {/* 환율 정보 */}
        <div className="mx-5 mb-4 bg-pick-bg rounded-2xl p-4">
          {/* PICK → Pi 방향 */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-pick-purple/20 flex items-center justify-center text-xs font-black text-pick-purple">P</span>
              <span className="text-sm font-bold text-pick-text">PICK</span>
            </div>
            <ArrowLeftRight size={14} className="text-pick-text-sub" />
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-black text-amber-600">π</span>
              <span className="text-sm font-bold text-pick-text">Pi</span>
            </div>
          </div>
          {/* 현재 환율 */}
          <div className="flex items-center justify-between pt-2 border-t border-pick-border">
            <div className="text-center flex-1">
              <p className="text-lg font-black text-pick-purple">300 PICK</p>
              <p className="text-[10px] text-pick-text-sub">≈ ₩300</p>
            </div>
            <span className="text-pick-text-sub text-xs font-bold">=</span>
            <div className="text-center flex-1">
              <p className="text-lg font-black text-amber-600">1 π</p>
              <p className="text-[10px] text-pick-text-sub">Pi 시세 ₩300 기준</p>
            </div>
          </div>
          {/* 자동 조정 안내 */}
          <div className="mt-3 flex items-start gap-1.5 bg-amber-50 rounded-xl px-3 py-2">
            <Info size={11} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-700 leading-relaxed">
              Pi 시세가 변동되면 환율이 자동 조정됩니다.
              예) Pi = ₩600 시 → <strong>1 π = 600 PICK</strong>
            </p>
          </div>
        </div>

        {/* 교환 버튼 (비활성 — Pi 연동 후 활성화) */}
        <div className="px-5 pb-5">
          <button
            disabled
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-pick-bg border-2 border-dashed border-pick-border text-pick-text-sub font-bold text-sm cursor-not-allowed"
          >
            <Lock size={15} />
            Pi Network 연동 후 이용 가능합니다
          </button>
        </div>
      </div>

      {/* ── 탭투언 출석 보상 ── */}
      <div className={`rounded-3xl border-2 shadow-sm overflow-hidden transition-all duration-300 ${
        checkedToday
          ? "bg-gradient-to-br from-pick-purple-dark via-pick-purple to-pick-purple-light border-pick-purple"
          : "bg-white border-pick-border"
      }`}>

        {checkedToday ? (
          /* ── 출석 완료 상태 ── */
          <div className="px-5 pt-5 pb-6">

            {/* 헤더 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎉</span>
                <p className="text-base font-black text-white">오늘 출석 완료!</p>
              </div>
              {streak > 0 && (
                <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                  <Flame size={13} className="text-pick-yellow-light" />
                  <span className="text-xs font-black text-white">{streak}일 연속 🔥</span>
                </div>
              )}
            </div>

            {/* PICK 적립 확인 카드 */}
            <div className="bg-white/15 rounded-3xl px-5 py-5 mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-white/70 font-medium mb-1">오늘 적립된 PICK</p>
                <div className="flex items-end gap-1.5">
                  <span className="text-4xl font-black text-white">+50</span>
                  <span className="text-pick-yellow-light font-black text-lg mb-1">PICK</span>
                </div>
                <p className="text-xs text-white/60 mt-0.5">≈ ₩50 지갑에 추가됐어요</p>
              </div>
              {/* 코인 스택 시각화 */}
              <div className="flex flex-col items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-10 h-3 rounded-full bg-pick-yellow-light shadow-sm"
                    style={{
                      opacity: 1 - i * 0.12,
                      transform: `scaleX(${1 - i * 0.08})`,
                    }}
                  />
                ))}
                <span className="text-lg mt-1">🪙</span>
              </div>
            </div>

            {/* 현재 잔액 */}
            <div className="bg-white/10 rounded-2xl px-4 py-3 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet size={14} className="text-white/60" />
                <span className="text-xs text-white/70 font-medium">현재 잔액</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-base font-black text-white">{balance.toLocaleString()}</span>
                <span className="text-xs text-pick-yellow-light font-black">PICK</span>
              </div>
            </div>

            {/* 7일 연속 출석 달력 */}
            <div className="bg-white/10 rounded-2xl px-4 py-3 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-white/70 font-medium">7일 연속 출석 현황</span>
                <span className="text-xs font-black text-pick-yellow-light">{Math.min(streak, 7)}/7일</span>
              </div>
              {/* 날짜 원형 뱃지 */}
              <div className="flex justify-between gap-1">
                {[...Array(7)].map((_, i) => {
                  const dayStreak = streak >= 7 ? 7 : streak;
                  const filled = i < dayStreak;
                  const isToday = i === dayStreak - 1;
                  return (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        isToday
                          ? "bg-pick-yellow-light shadow-lg scale-110"
                          : filled
                            ? "bg-white/80"
                            : "bg-white/15 border border-white/20"
                      }`}>
                        {filled
                          ? <Check size={14} className={isToday ? "text-pick-purple-dark" : "text-pick-purple"} strokeWidth={3} />
                          : <span className="text-[10px] text-white/40 font-bold">{i + 1}</span>
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* 진행 바 */}
              <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-pick-yellow-light rounded-full transition-all duration-700"
                  style={{ width: `${Math.min((streak / 7) * 100, 100)}%` }}
                />
              </div>
            </div>

            {/* 별 누적 적립 */}
            <div className="flex items-center justify-center gap-2">
              <Star size={12} className="text-pick-yellow-light fill-pick-yellow-light" />
              <p className="text-xs text-white/70">
                누적 출석 적립 <span className="font-black text-white">{(streak * 50).toLocaleString()} PICK</span> 이상 달성 중
              </p>
              <Star size={12} className="text-pick-yellow-light fill-pick-yellow-light" />
            </div>

            {/* 내일 안내 */}
            <p className="text-center text-xs text-white/50 mt-3">내일도 잊지 말고 출석하세요 👋</p>
          </div>

        ) : (
          /* ── 출석 전 상태 ── */
          <div className="px-5 pt-5 pb-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-pick-purple/10 flex items-center justify-center text-lg">👆</span>
                <div>
                  <p className="text-sm font-black text-pick-text">오늘의 출석 보상</p>
                  <p className="text-xs text-pick-text-sub">매일 탭하고 PICK을 모으세요</p>
                </div>
              </div>
              {streak > 0 && (
                <div className="flex items-center gap-1 bg-pick-purple/10 px-2.5 py-1 rounded-full">
                  <Flame size={12} className="text-pick-purple-light" />
                  <span className="text-xs font-black text-pick-purple">{streak}일 연속</span>
                </div>
              )}
            </div>

            <button onClick={() => void handleCheckin()} disabled={checkLoading}
              className="w-full rounded-3xl py-5 px-6 flex items-center gap-4 font-black text-white bg-gradient-to-r from-pick-purple to-pick-purple-light active:scale-95 transition-all disabled:opacity-70 shadow-lg">
              {checkLoading ? (
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin mx-auto" />
              ) : (
                <>
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    <Fingerprint size={22} />
                  </div>
                  <div className="flex flex-col items-start leading-tight flex-1">
                    <span className="text-base">출석하고 PICK 받기</span>
                    <span className="text-xs text-white/70 font-medium">+50 PICK ≈ ₩50</span>
                  </div>
                  <div className="flex flex-col items-center flex-shrink-0">
                    <span className="text-2xl font-black text-pick-yellow-light leading-none">50</span>
                    <span className="text-xs font-black text-pick-yellow-light/80">PICK</span>
                  </div>
                </>
              )}
            </button>

            {streak > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-pick-text-sub">연속 출석 현황</span>
                  <span className="text-[11px] font-black text-pick-purple">{Math.min(streak, 7)}/7일</span>
                </div>
                <div className="h-2 bg-pick-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pick-purple to-pick-purple-light rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((streak / 7) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── 로그인 안내 ── */}
      {!isLoggedIn && (
        <div className="bg-pick-bg border-2 border-pick-border rounded-3xl p-6 flex flex-col items-center text-center">
          <Wallet size={36} className="text-pick-purple-light mb-3 opacity-50" />
          <p className="text-sm font-bold text-pick-text">로그인 후 잔액을 확인할 수 있어요</p>
        </div>
      )}

      {/* ── 거래 내역 ── */}
      {isLoggedIn && (
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <History size={16} className="text-pick-purple" />
            <h2 className="font-bold text-pick-text">거래 내역</h2>
            {transactions.length > 0 && (
              <span className="text-xs text-pick-text-sub bg-pick-bg border border-pick-border px-2 py-0.5 rounded-full ml-1">
                최근 {Math.min(transactions.length, 10)}건
              </span>
            )}
          </div>

          {transactions.length === 0 ? (
            <div className="bg-white dark:bg-pick-card rounded-3xl border-2 border-pick-border p-10 flex flex-col items-center text-pick-text-sub shadow-sm">
              <Wallet size={44} className="mb-3 opacity-20" />
              <p className="text-sm font-medium">아직 거래 내역이 없어요</p>
              <p className="text-xs mt-1 opacity-70">충전하고 첫 주문을 해보세요!</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-pick-card rounded-3xl border-2 border-pick-border overflow-hidden shadow-sm divide-y divide-pick-border">
              {transactions.slice(0, 10).map((tx) => {
                const cfg = TX_CONFIG[tx.type] ?? TX_CONFIG.charge;
                return (
                  <div key={tx.id} className="flex items-center gap-4 px-5 py-4">
                    <div className={`w-10 h-10 rounded-2xl ${cfg.bg} flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                      {txIcon(tx)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-black px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-pick-text-sub mt-0.5 truncate">
                        {tx.description ?? cfg.label}
                      </p>
                      <p className="text-[10px] text-pick-text-sub mt-0.5">
                        {new Date(tx.createdAt).toLocaleDateString("ko-KR", {
                          month: "short", day: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`font-black text-base ${cfg.color}`}>
                        {cfg.sign}{Math.abs(tx.amount).toLocaleString()}
                        <span className="text-xs ml-0.5">P</span>
                      </p>
                      <p className="text-[10px] text-pick-text-sub mt-0.5">
                        잔액 {tx.balanceAfter.toLocaleString()}P
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {chargeOpen && (
        <ChargeModal onClose={() => setChargeOpen(false)} onCharged={fetchWallet} />
      )}
      {transferOpen && (
        <TransferModal myBalance={balance} onClose={() => setTransferOpen(false)} onTransferred={fetchWallet} />
      )}
    </div>
  );
}

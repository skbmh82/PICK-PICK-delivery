"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  ArrowDownLeft, ArrowUpRight, X, Check, Search, User,
  Ticket, ChevronDown, ChevronUp, Tag, ShoppingCart,
  Gift, Fingerprint, Wallet, History, Flame,
  Coins, TrendingUp, ArrowLeftRight, Lock, Info,
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

// ── 쿠폰 섹션 ─────────────────────────────────────────
interface CouponItem {
  userCouponId: string; isUsed: boolean; usedAt: string | null; receivedAt: string;
  coupon: {
    id: string; code: string; title: string; description: string | null;
    type: "fixed_pick" | "pick_rate" | "free_delivery";
    value: number; minOrder: number; expiresAt: string | null;
    storeId: string | null; isExpired: boolean;
  };
}

function couponTypeLabel(type: CouponItem["coupon"]["type"], value: number) {
  if (type === "fixed_pick")    return `${value.toLocaleString()} PICK 지급`;
  if (type === "pick_rate")     return `PICK ${value}% 추가 적립`;
  if (type === "free_delivery") return "배달비 무료";
  return "";
}

function CouponSection() {
  const [coupons,     setCoupons]     = useState<CouponItem[]>([]);
  const [available,   setAvailable]   = useState(0);
  const [code,        setCode]        = useState("");
  const [registering, setRegistering] = useState(false);
  const [regError,    setRegError]    = useState("");
  const [regSuccess,  setRegSuccess]  = useState("");
  const [expanded,    setExpanded]    = useState(false);
  const [loadingList, setLoadingList] = useState(false);

  const fetchCoupons = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await fetch("/api/coupons");
      if (res.ok) {
        const json = await res.json();
        setCoupons(json.coupons ?? []);
        setAvailable(json.available ?? 0);
      }
    } finally { setLoadingList(false); }
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const handleRegister = async () => {
    if (!code.trim()) return;
    setRegistering(true); setRegError(""); setRegSuccess("");
    try {
      const res = await fetch("/api/coupons", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const json = await res.json();
      if (res.ok) { setRegSuccess(json.message ?? "쿠폰이 등록됐습니다!"); setCode(""); fetchCoupons(); }
      else setRegError(json.error ?? "쿠폰 등록에 실패했습니다");
    } finally { setRegistering(false); }
  };

  return (
    <div className="bg-white dark:bg-pick-card rounded-3xl border-2 border-pick-border shadow-sm overflow-hidden">
      <button onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 active:bg-pick-bg transition-colors">
        <div className="flex items-center gap-2">
          <Ticket size={18} className="text-pick-purple" />
          <span className="font-bold text-pick-text">내 쿠폰함</span>
          {available > 0 && (
            <span className="bg-pick-purple text-white text-xs font-black px-2 py-0.5 rounded-full">
              {available}
            </span>
          )}
        </div>
        {expanded ? <ChevronUp size={16} className="text-pick-text-sub" /> : <ChevronDown size={16} className="text-pick-text-sub" />}
      </button>
      {expanded && (
        <div className="border-t border-pick-border">
          <div className="px-5 py-4 bg-pick-bg">
            <p className="text-xs font-bold text-pick-text-sub mb-2">쿠폰 코드 등록</p>
            <div className="flex gap-2">
              <input type="text" value={code}
                onChange={(e) => { setCode(e.target.value.toUpperCase()); setRegError(""); setRegSuccess(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                placeholder="쿠폰 코드 입력 (예: WELCOME50)" maxLength={30}
                className="flex-1 border-2 border-pick-border rounded-2xl px-4 py-2.5 text-sm text-pick-text bg-white dark:bg-pick-surface focus:outline-none focus:border-pick-purple uppercase placeholder:normal-case"
              />
              <button onClick={() => void handleRegister()} disabled={registering || !code.trim()}
                className="px-4 py-2.5 bg-pick-purple text-white rounded-2xl text-sm font-bold disabled:opacity-40 active:scale-95 transition-all flex-shrink-0">
                {registering
                  ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
                  : "등록"}
              </button>
            </div>
            {regError   && <p className="text-xs text-red-500 font-bold mt-2 px-1">{regError}</p>}
            {regSuccess  && <p className="text-xs text-green-600 font-bold mt-2 px-1">✓ {regSuccess}</p>}
          </div>
          {loadingList ? (
            <div className="px-5 py-6 flex justify-center">
              <span className="w-6 h-6 border-2 border-pick-purple/30 border-t-pick-purple rounded-full animate-spin" />
            </div>
          ) : coupons.length === 0 ? (
            <div className="px-5 py-8 flex flex-col items-center gap-2 text-pick-text-sub">
              <Tag size={32} className="opacity-20" />
              <p className="text-sm font-medium">보유 중인 쿠폰이 없어요</p>
              <p className="text-xs opacity-70">쿠폰 코드를 입력해 등록해보세요!</p>
            </div>
          ) : (
            <div className="divide-y divide-pick-border">
              {coupons.map((item) => {
                const disabled = item.isUsed || item.coupon.isExpired;
                return (
                  <div key={item.userCouponId} className={`px-5 py-4 flex gap-4 ${disabled ? "opacity-50" : ""}`}>
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${disabled ? "bg-gray-100" : "bg-pick-purple/10"}`}>
                      <Ticket size={20} className={disabled ? "text-gray-400" : "text-pick-purple"} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-sm text-pick-text leading-tight">{item.coupon.title}</p>
                        {item.isUsed && <span className="text-[10px] font-black bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">사용완료</span>}
                        {!item.isUsed && item.coupon.isExpired && <span className="text-[10px] font-black bg-red-50 text-red-400 px-2 py-0.5 rounded-full">만료됨</span>}
                        {!item.isUsed && !item.coupon.isExpired && <span className="text-[10px] font-black bg-pick-purple/10 text-pick-purple px-2 py-0.5 rounded-full">사용가능</span>}
                      </div>
                      <p className="text-xs text-pick-purple-light font-bold mt-0.5">{couponTypeLabel(item.coupon.type, item.coupon.value)}</p>
                      {item.coupon.description && <p className="text-xs text-pick-text-sub mt-0.5 leading-tight">{item.coupon.description}</p>}
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        {item.coupon.minOrder > 0 && <span className="text-[10px] text-pick-text-sub">최소주문 {item.coupon.minOrder.toLocaleString()}원</span>}
                        {item.coupon.expiresAt && <span className="text-[10px] text-pick-text-sub">~{new Date(item.coupon.expiresAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })} 까지</span>}
                        <span className="text-[10px] text-pick-text-sub font-mono tracking-widest">{item.coupon.code}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
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

        {/* Pi 잔액 (디자인 전용 — Pi SDK 연동 예정) */}
        <div className="bg-white/10 rounded-2xl px-4 py-3 mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">π</span>
            <div>
              <p className="text-[10px] text-white/60">Pi 잔액</p>
              <p className="text-sm font-black text-white/40 flex items-center gap-1">
                <Lock size={11} />
                Pi Network 연동 예정
              </p>
            </div>
          </div>
          <span className="text-[10px] text-white/40 bg-white/10 px-2 py-0.5 rounded-full">준비 중</span>
        </div>

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
      <div className="bg-white dark:bg-pick-card rounded-3xl border-2 border-pick-border shadow-sm overflow-hidden">
        <div className="px-5 pt-5 pb-4 flex items-center justify-between">
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

        <div className="px-5 pb-5">
          {checkedToday ? (
            <div className="flex flex-col items-center gap-2 py-3 bg-pick-bg rounded-3xl">
              <div className="w-12 h-12 rounded-full bg-pick-purple/10 flex items-center justify-center">
                <Check size={22} className="text-pick-purple" />
              </div>
              <p className="text-sm font-black text-pick-text">오늘 출석 완료!</p>
              <p className="text-xs text-pick-text-sub">내일 또 만나요 👋</p>
            </div>
          ) : (
            <button onClick={() => void handleCheckin()} disabled={checkLoading}
              className="w-full rounded-3xl py-4 flex items-center justify-center gap-3 font-black text-white bg-gradient-to-r from-pick-purple to-pick-purple-light active:scale-95 transition-all disabled:opacity-70 shadow-md">
              {checkLoading ? (
                <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Fingerprint size={20} />
                  <span>+50 PICK 받기</span>
                  <span className="text-sm text-white/70">≈ ₩50</span>
                </>
              )}
            </button>
          )}

          {checkDone && (
            <p className="text-center text-xs font-bold mt-2 text-pick-purple">
              🎉 +50 PICK이 지갑에 추가됐어요!
            </p>
          )}

          {/* 연속 출석 진행 바 */}
          {streak > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-pick-text-sub font-medium">7일 연속 출석 목표</span>
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
      </div>

      {/* ── 쿠폰함 ── */}
      {isLoggedIn && <CouponSection />}

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

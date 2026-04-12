"use client";

import { useEffect, useState, useCallback } from "react";
import { Wallet, ArrowDownLeft, ArrowUpRight, History, Coins, TrendingUp, X, Check, Search, User, Ticket, ChevronDown, ChevronUp, Tag } from "lucide-react";

// ── 충전 모달 ──────────────────────────────────────────
const CHARGE_PRESETS = [1000, 3000, 5000, 10000, 30000, 50000];

function ChargeModal({ onClose, onCharged }: { onClose: () => void; onCharged: (amount: number) => void }) {
  const [amount,  setAmount]  = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleCharge = async () => {
    const num = parseInt(amount, 10);
    if (isNaN(num) || num < 100) return setError("100 PICK 이상 입력해주세요");
    if (num > 1000000)           return setError("최대 1,000,000 PICK까지 충전 가능합니다");
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/wallet/charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: num, description: "PICK 직접 충전" }),
      });
      if (res.ok) {
        onCharged(num);
        onClose();
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.error ?? "충전에 실패했습니다");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[55]" onClick={onClose} />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[60] bg-white dark:bg-pick-card rounded-t-3xl shadow-2xl">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-pick-border">
          <h2 className="font-black text-pick-text text-lg">PICK 충전 💜</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-pick-bg">
            <X size={16} className="text-pick-text-sub" />
          </button>
        </div>
        <div className="px-5 py-4 flex flex-col gap-4">
          {/* 금액 입력 */}
          <div>
            <label className="text-xs font-bold text-pick-text-sub mb-1.5 block">충전 금액 (PICK)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="충전할 PICK 수량 입력"
              min="100"
              className="w-full border-2 border-pick-border rounded-2xl px-4 py-3 text-sm text-pick-text focus:outline-none focus:border-pick-purple"
            />
          </div>
          {/* 프리셋 버튼 */}
          <div className="grid grid-cols-3 gap-2">
            {CHARGE_PRESETS.map((p) => (
              <button
                key={p}
                onClick={() => setAmount(String(p))}
                className={`py-2.5 rounded-2xl text-sm font-bold transition-all ${
                  amount === String(p)
                    ? "bg-pick-purple text-white"
                    : "bg-pick-bg border border-pick-border text-pick-text"
                }`}
              >
                {p.toLocaleString()}P
              </button>
            ))}
          </div>
          {error && <p className="text-xs text-red-500 font-bold text-center">{error}</p>}
        </div>
        <div className="px-5 pb-8 pt-1 border-t border-pick-border">
          <button
            onClick={() => void handleCharge()}
            disabled={loading || !amount}
            className="w-full bg-gradient-to-r from-pick-purple to-pick-purple-light text-white font-black py-4 rounded-full shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading
              ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <Check size={18} />
            }
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

function TransferModal({
  myBalance,
  onClose,
  onTransferred,
}: {
  myBalance: number;
  onClose: () => void;
  onTransferred: (amount: number) => void;
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

  // 이메일 검색
  const searchUser = async () => {
    if (!email.includes("@")) return;
    setSearching(true);
    setFound(null);
    setNotFound(false);
    setError("");
    try {
      const res = await fetch(`/api/users/search?email=${encodeURIComponent(email)}`);
      const json = await res.json();
      if (json.user) {
        setFound(json.user);
      } else {
        setNotFound(true);
      }
    } finally {
      setSearching(false);
    }
  };

  const handleTransfer = async () => {
    const num = parseInt(amount, 10);
    if (!found)           return setError("수신자를 먼저 검색해주세요");
    if (isNaN(num) || num < 1) return setError("1 PICK 이상 입력해주세요");
    if (num > myBalance)  return setError(`잔액이 부족합니다 (보유: ${myBalance.toLocaleString()} PICK)`);
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/wallet/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toEmail: found.email, amount: num, memo: memo || undefined }),
      });
      if (res.ok) {
        setDone(true);
        setTimeout(() => {
          onTransferred(num);
          onClose();
        }, 1500);
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.error ?? "전송에 실패했습니다");
      }
    } finally {
      setLoading(false);
    }
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
            {/* 수신자 검색 */}
            <div>
              <label className="text-xs font-bold text-pick-text-sub mb-1.5 block">받는 사람 이메일</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setFound(null); setNotFound(false); }}
                  onKeyDown={(e) => e.key === "Enter" && searchUser()}
                  placeholder="example@email.com"
                  className="flex-1 border-2 border-pick-border rounded-2xl px-4 py-3 text-sm text-pick-text focus:outline-none focus:border-pick-purple"
                />
                <button
                  onClick={() => void searchUser()}
                  disabled={searching || !email.includes("@")}
                  className="w-12 h-12 rounded-2xl bg-pick-purple text-white flex items-center justify-center disabled:opacity-40 flex-shrink-0"
                >
                  {searching
                    ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    : <Search size={18} />
                  }
                </button>
              </div>
              {/* 검색 결과 */}
              {found && (
                <div className="mt-2 flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
                  <div className="w-9 h-9 rounded-full bg-pick-purple/10 flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-pick-purple" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-pick-text">{found.name}</p>
                    <p className="text-xs text-pick-text-sub">{found.email}</p>
                  </div>
                  <Check size={16} className="text-green-600 ml-auto" />
                </div>
              )}
              {notFound && (
                <p className="mt-2 text-xs text-red-500 font-bold px-1">해당 이메일의 사용자를 찾을 수 없어요</p>
              )}
            </div>

            {/* 금액 */}
            <div>
              <label className="text-xs font-bold text-pick-text-sub mb-1.5 block">
                전송 금액 (PICK) · 보유 {myBalance.toLocaleString()}P
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="전송할 PICK 수량"
                min="1"
                className="w-full border-2 border-pick-border rounded-2xl px-4 py-3 text-sm text-pick-text focus:outline-none focus:border-pick-purple"
              />
              <div className="grid grid-cols-3 gap-2 mt-2">
                {TRANSFER_PRESETS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setAmount(String(p))}
                    className={`py-2 rounded-2xl text-xs font-bold transition-all ${
                      amount === String(p)
                        ? "bg-pick-purple text-white"
                        : "bg-pick-bg border border-pick-border text-pick-text"
                    }`}
                  >
                    {p.toLocaleString()}P
                  </button>
                ))}
              </div>
            </div>

            {/* 메모 */}
            <div>
              <label className="text-xs font-bold text-pick-text-sub mb-1.5 block">메모 (선택)</label>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="메모를 입력해주세요"
                maxLength={100}
                className="w-full border-2 border-pick-border rounded-2xl px-4 py-3 text-sm text-pick-text focus:outline-none focus:border-pick-purple"
              />
            </div>

            {error && <p className="text-xs text-red-500 font-bold text-center">{error}</p>}
          </div>
        )}

        {!done && (
          <div className="px-5 pb-8 pt-1 border-t border-pick-border">
            <button
              onClick={() => void handleTransfer()}
              disabled={loading || !found || !amount}
              className="w-full bg-gradient-to-r from-pick-purple to-pick-purple-light text-white font-black py-4 rounded-full shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading
                ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <ArrowUpRight size={18} />
              }
              {found && amount
                ? `${found.name}님께 ${parseInt(amount || "0").toLocaleString()} PICK 보내기`
                : "보내기"
              }
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ── 쿠폰 섹션 ─────────────────────────────────────────
interface CouponItem {
  userCouponId: string;
  isUsed: boolean;
  usedAt: string | null;
  receivedAt: string;
  coupon: {
    id: string;
    code: string;
    title: string;
    description: string | null;
    type: "fixed_pick" | "pick_rate" | "free_delivery";
    value: number;
    minOrder: number;
    expiresAt: string | null;
    storeId: string | null;
    isExpired: boolean;
  };
}

function couponTypeLabel(type: CouponItem["coupon"]["type"], value: number) {
  if (type === "fixed_pick")    return `${value.toLocaleString()} PICK 지급`;
  if (type === "pick_rate")     return `PICK ${value}% 추가 적립`;
  if (type === "free_delivery") return "배달비 무료";
  return "";
}

function CouponSection() {
  const [coupons,    setCoupons]    = useState<CouponItem[]>([]);
  const [available,  setAvailable]  = useState(0);
  const [code,       setCode]       = useState("");
  const [registering,setRegistering]= useState(false);
  const [regError,   setRegError]   = useState("");
  const [regSuccess, setRegSuccess] = useState("");
  const [expanded,   setExpanded]   = useState(false);
  const [loadingList,setLoadingList] = useState(false);

  const fetchCoupons = useCallback(async () => {
    setLoadingList(true);
    try {
      const res = await fetch("/api/coupons");
      if (res.ok) {
        const json = await res.json();
        setCoupons(json.coupons ?? []);
        setAvailable(json.available ?? 0);
      }
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const handleRegister = async () => {
    if (!code.trim()) return;
    setRegistering(true);
    setRegError("");
    setRegSuccess("");
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const json = await res.json();
      if (res.ok) {
        setRegSuccess(json.message ?? "쿠폰이 등록됐습니다!");
        setCode("");
        fetchCoupons();
      } else {
        setRegError(json.error ?? "쿠폰 등록에 실패했습니다");
      }
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="bg-white dark:bg-pick-card rounded-3xl border-2 border-pick-border shadow-sm overflow-hidden">
      {/* 헤더 */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 active:bg-pick-bg transition-colors"
      >
        <div className="flex items-center gap-2">
          <Ticket size={18} className="text-pick-purple" />
          <span className="font-bold text-pick-text">내 쿠폰함</span>
          {available > 0 && (
            <span className="bg-pick-purple text-white text-xs font-black px-2 py-0.5 rounded-full">
              {available}
            </span>
          )}
        </div>
        {expanded
          ? <ChevronUp  size={16} className="text-pick-text-sub" />
          : <ChevronDown size={16} className="text-pick-text-sub" />
        }
      </button>

      {expanded && (
        <div className="border-t border-pick-border">
          {/* 쿠폰 코드 등록 */}
          <div className="px-5 py-4 bg-pick-bg">
            <p className="text-xs font-bold text-pick-text-sub mb-2">쿠폰 코드 등록</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => { setCode(e.target.value.toUpperCase()); setRegError(""); setRegSuccess(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                placeholder="쿠폰 코드 입력 (예: WELCOME50)"
                maxLength={30}
                className="flex-1 border-2 border-pick-border rounded-2xl px-4 py-2.5 text-sm text-pick-text bg-white dark:bg-pick-surface focus:outline-none focus:border-pick-purple uppercase placeholder:normal-case"
              />
              <button
                onClick={() => void handleRegister()}
                disabled={registering || !code.trim()}
                className="px-4 py-2.5 bg-pick-purple text-white rounded-2xl text-sm font-bold disabled:opacity-40 active:scale-95 transition-all flex-shrink-0"
              >
                {registering
                  ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin inline-block" />
                  : "등록"
                }
              </button>
            </div>
            {regError   && <p className="text-xs text-red-500 font-bold mt-2 px-1">{regError}</p>}
            {regSuccess  && <p className="text-xs text-green-600 font-bold mt-2 px-1">✓ {regSuccess}</p>}
          </div>

          {/* 쿠폰 목록 */}
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
                  <div
                    key={item.userCouponId}
                    className={`px-5 py-4 flex gap-4 ${disabled ? "opacity-50" : ""}`}
                  >
                    {/* 아이콘 */}
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      disabled ? "bg-gray-100" : "bg-pick-purple/10"
                    }`}>
                      <Ticket size={20} className={disabled ? "text-gray-400" : "text-pick-purple"} />
                    </div>
                    {/* 내용 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-sm text-pick-text leading-tight">{item.coupon.title}</p>
                        {item.isUsed && (
                          <span className="text-[10px] font-black bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">사용완료</span>
                        )}
                        {!item.isUsed && item.coupon.isExpired && (
                          <span className="text-[10px] font-black bg-red-50 text-red-400 px-2 py-0.5 rounded-full">만료됨</span>
                        )}
                        {!item.isUsed && !item.coupon.isExpired && (
                          <span className="text-[10px] font-black bg-pick-purple/10 text-pick-purple px-2 py-0.5 rounded-full">사용가능</span>
                        )}
                      </div>
                      <p className="text-xs text-pick-purple-light font-bold mt-0.5">
                        {couponTypeLabel(item.coupon.type, item.coupon.value)}
                      </p>
                      {item.coupon.description && (
                        <p className="text-xs text-pick-text-sub mt-0.5 leading-tight">{item.coupon.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        {item.coupon.minOrder > 0 && (
                          <span className="text-[10px] text-pick-text-sub">
                            최소주문 {item.coupon.minOrder.toLocaleString()}원
                          </span>
                        )}
                        {item.coupon.expiresAt && (
                          <span className="text-[10px] text-pick-text-sub">
                            ~{new Date(item.coupon.expiresAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })} 까지
                          </span>
                        )}
                        <span className="text-[10px] text-pick-text-sub font-mono tracking-widest">
                          {item.coupon.code}
                        </span>
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

// ── 타입 ──────────────────────────────────────────────
interface Transaction {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  description: string | null;
  createdAt: string;
}

interface WalletData {
  balance: number;
  lockedBalance: number;
  totalEarned: number;
  transactions: Transaction[];
}

// ── 거래 유형 설정 ─────────────────────────────────────
const TX_CONFIG: Record<string, { label: string; color: string; bg: string; sign: string }> = {
  charge:   { label: "충전",  color: "text-green-600",   bg: "bg-green-50",  sign: "+" },
  payment:  { label: "결제",  color: "text-red-500",     bg: "bg-red-50",    sign: "-" },
  refund:   { label: "환불",  color: "text-blue-500",    bg: "bg-blue-50",   sign: "+" },
  reward:   { label: "적립",  color: "text-pick-purple", bg: "bg-pick-bg",   sign: "+" },
  transfer: { label: "전송",  color: "text-orange-500",  bg: "bg-orange-50", sign: "-" },
  withdraw: { label: "출금",  color: "text-gray-500",    bg: "bg-gray-50",   sign: "-" },
};

// ── 로딩 스켈레톤 ──────────────────────────────────────
function WalletSkeleton() {
  return (
    <div className="min-h-full px-4 py-6 flex flex-col gap-5 animate-pulse">
      <div className="h-44 bg-pick-purple-light/30 rounded-3xl" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-14 bg-gray-100 rounded-full" />
        <div className="h-14 bg-gray-100 rounded-full" />
      </div>
      <div className="h-6 w-32 bg-gray-200 rounded-full" />
      <div className="flex flex-col gap-3">
        {[0,1,2].map((i) => <div key={i} className="h-16 bg-gray-100 rounded-3xl" />)}
      </div>
    </div>
  );
}

// ── 메인 페이지 ───────────────────────────────────────
export default function WalletPage() {
  const [data,         setData]         = useState<WalletData | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [isLoggedIn,   setIsLoggedIn]   = useState(true);
  const [chargeOpen,   setChargeOpen]   = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  const fetchWallet = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/wallet/transactions");
      if (res.status === 401) {
        setIsLoggedIn(false);
        return;
      }
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWallet(); }, [fetchWallet]);

  if (loading) return <WalletSkeleton />;

  const balance       = data?.balance       ?? 0;
  const lockedBalance = data?.lockedBalance ?? 0;
  const totalEarned   = data?.totalEarned   ?? 0;
  const transactions  = data?.transactions  ?? [];

  return (
    <div className="min-h-full px-4 py-6 flex flex-col gap-5">
      {/* 잔액 카드 */}
      <div className="rounded-3xl bg-gradient-to-br from-pick-purple-dark via-pick-purple to-pick-purple-light p-6 text-white shadow-xl">
        <p className="text-sm text-white/70 mb-1 font-medium">내 PICK 잔액 💜</p>
        <div className="flex items-end gap-2 mb-5">
          <span className="text-5xl font-black">
            {balance.toLocaleString()}
          </span>
          <span className="text-pick-yellow-light font-black text-lg mb-1.5">PICK</span>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 flex items-center justify-between bg-white/10 rounded-2xl px-4 py-2.5">
            <div className="flex items-center gap-1.5">
              <Coins size={13} className="text-white/70" />
              <span className="text-xs text-white/70">잠금 잔액</span>
            </div>
            <span className="text-sm font-bold text-white">{lockedBalance.toLocaleString()} PICK</span>
          </div>
        </div>
        {totalEarned > 0 && (
          <div className="flex items-center gap-1.5 mt-2 bg-white/10 rounded-2xl px-4 py-2.5">
            <TrendingUp size={13} className="text-white/70" />
            <span className="text-xs text-white/70">누적 적립</span>
            <span className="ml-auto text-sm font-bold text-white">{totalEarned.toLocaleString()} PICK</span>
          </div>
        )}
      </div>

      {/* 빠른 액션 */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setChargeOpen(true)}
          className="flex items-center justify-center gap-2 bg-white rounded-full py-4 border-2 border-pick-border shadow-sm font-bold text-pick-purple active:scale-95 transition-all"
        >
          <ArrowDownLeft size={18} />
          충전하기
        </button>
        <button
          onClick={() => setTransferOpen(true)}
          className="flex items-center justify-center gap-2 bg-white rounded-full py-4 border-2 border-pick-border shadow-sm font-bold text-pick-purple active:scale-95 transition-all"
        >
          <ArrowUpRight size={18} />
          보내기
        </button>
      </div>

      {chargeOpen && (
        <ChargeModal
          onClose={() => setChargeOpen(false)}
          onCharged={() => { fetchWallet(); }}
        />
      )}
      {transferOpen && (
        <TransferModal
          myBalance={balance}
          onClose={() => setTransferOpen(false)}
          onTransferred={() => { fetchWallet(); }}
        />
      )}

      {/* 쿠폰함 */}
      {isLoggedIn && <CouponSection />}

      {/* 로그인 안내 */}
      {!isLoggedIn && (
        <div className="bg-pick-bg border-2 border-pick-border rounded-3xl p-6 flex flex-col items-center text-center">
          <Wallet size={36} className="text-pick-purple-light mb-3 opacity-50" />
          <p className="text-sm font-bold text-pick-text">로그인 후 잔액을 확인할 수 있어요</p>
        </div>
      )}

      {/* 거래 내역 */}
      {isLoggedIn && (
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <History size={16} className="text-pick-purple" />
            <h2 className="font-bold text-pick-text">거래 내역</h2>
            {transactions.length > 0 && (
              <span className="text-xs text-pick-text-sub bg-pick-bg border border-pick-border px-2 py-0.5 rounded-full ml-1">
                {transactions.length}건
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
              {transactions.map((tx) => {
                const cfg    = TX_CONFIG[tx.type] ?? TX_CONFIG.charge;
                const isPlus = cfg.sign === "+";
                return (
                  <div key={tx.id} className="flex items-center gap-4 px-5 py-4">
                    <div className={`w-10 h-10 rounded-2xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                      {isPlus
                        ? <ArrowDownLeft size={18} className={cfg.color} />
                        : <ArrowUpRight  size={18} className={cfg.color} />
                      }
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
    </div>
  );
}

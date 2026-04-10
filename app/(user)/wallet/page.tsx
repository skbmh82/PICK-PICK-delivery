"use client";

import { useEffect, useState, useCallback } from "react";
import { Wallet, ArrowDownLeft, ArrowUpRight, History, Coins, TrendingUp, X, Check } from "lucide-react";

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
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[60] bg-white rounded-t-3xl shadow-2xl">
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
  const [data,        setData]        = useState<WalletData | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [isLoggedIn,  setIsLoggedIn]  = useState(true);
  const [chargeOpen,  setChargeOpen]  = useState(false);

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
        <button className="flex items-center justify-center gap-2 bg-white rounded-full py-4 border-2 border-pick-border shadow-sm font-bold text-pick-purple active:scale-95 transition-all">
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
            <div className="bg-white rounded-3xl border-2 border-pick-border p-10 flex flex-col items-center text-pick-text-sub shadow-sm">
              <Wallet size={44} className="mb-3 opacity-20" />
              <p className="text-sm font-medium">아직 거래 내역이 없어요</p>
              <p className="text-xs mt-1 opacity-70">충전하고 첫 주문을 해보세요!</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border-2 border-pick-border overflow-hidden shadow-sm divide-y divide-pick-border">
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

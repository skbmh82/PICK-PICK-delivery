"use client";

import { useEffect, useState, useCallback } from "react";
import { Wallet, ArrowDownLeft, ArrowUpRight, History, Coins, TrendingUp } from "lucide-react";

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
  const [data,    setData]    = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

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
        <button className="flex items-center justify-center gap-2 bg-white rounded-full py-4 border-2 border-pick-border shadow-sm font-bold text-pick-purple active:scale-95 transition-all">
          <ArrowDownLeft size={18} />
          충전하기
        </button>
        <button className="flex items-center justify-center gap-2 bg-white rounded-full py-4 border-2 border-pick-border shadow-sm font-bold text-pick-purple active:scale-95 transition-all">
          <ArrowUpRight size={18} />
          보내기
        </button>
      </div>

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

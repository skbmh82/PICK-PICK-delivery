"use client";

import { useState, useEffect, useCallback } from "react";
import { TrendingUp, Wallet, CalendarDays, Download, RefreshCw } from "lucide-react";

// ── 타입 ──────────────────────────────────────────────
interface PeriodStat {
  label: string;
  amount: number;
  orders: number;
}

interface WeeklyDay {
  day: string;
  amount: number;
}

interface SettlementRecord {
  date: string;
  amount: number;
  status: string;
}

interface SettlementData {
  pickBalance: number;
  periodStats: PeriodStat[];
  weekly: WeeklyDay[];
  settlementHistory: SettlementRecord[];
}

// ── 정산 가능 잔액 ─────────────────────────────────────
function SettlementBalance({ pickBalance }: { pickBalance: number }) {
  return (
    <div className="mx-4 mb-5 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-400 p-5 text-white shadow-lg">
      <p className="text-sm text-white/80 font-medium mb-1">PICK 잔액 💰</p>
      <div className="flex items-end gap-2 mb-4">
        <span className="text-4xl font-black">{pickBalance.toLocaleString()}</span>
        <span className="text-lg font-bold text-white/90 mb-1">PICK</span>
      </div>
      <button className="w-full bg-white text-amber-600 font-black py-3 rounded-2xl text-sm active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-sm">
        <Download size={16} />
        정산 신청하기
      </button>
    </div>
  );
}

// ── 기간별 매출 ────────────────────────────────────────
function RevenueSummary({ periodStats }: { periodStats: PeriodStat[] }) {
  return (
    <div className="mx-4 mb-5">
      <h3 className="font-bold text-pick-text text-sm mb-3 flex items-center gap-2">
        <CalendarDays size={16} className="text-amber-500" />
        기간별 매출
      </h3>
      <div className="flex flex-col gap-3">
        {periodStats.map((s) => (
          <div key={s.label} className="bg-white rounded-3xl border-2 border-pick-border px-5 py-4 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-pick-text-sub font-medium mb-1">{s.label}</p>
              <p className="font-black text-pick-text text-lg">
                {s.amount.toLocaleString()}
                <span className="text-sm font-bold ml-1">원</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-pick-text-sub">주문 수</p>
              <p className="font-black text-amber-600 text-xl">
                {s.orders}<span className="text-sm ml-0.5">건</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 주간 막대 차트 ─────────────────────────────────────
function WeeklyChart({ weekly }: { weekly: WeeklyDay[] }) {
  const max = Math.max(...weekly.map((d) => d.amount), 1);

  return (
    <div className="mx-4 mb-5 bg-white rounded-3xl border-2 border-pick-border p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={18} className="text-amber-500" />
        <h3 className="font-bold text-pick-text text-sm">주간 매출 추이</h3>
      </div>
      <div className="flex items-end gap-2 h-32">
        {weekly.map((d) => {
          const heightPct = Math.round((d.amount / max) * 100);
          const isToday   = d.day === "오늘";
          return (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
              {isToday && d.amount > 0 && (
                <span className="text-[9px] font-black text-amber-600">
                  {(d.amount / 1000).toFixed(0)}k
                </span>
              )}
              <div className="w-full flex flex-col justify-end" style={{ height: "100px" }}>
                <div
                  className={`w-full rounded-t-xl ${
                    isToday ? "bg-gradient-to-t from-amber-500 to-orange-300" : "bg-amber-100"
                  }`}
                  style={{ height: `${Math.max(heightPct, 4)}%` }}
                />
              </div>
              <span className={`text-[10px] font-bold ${isToday ? "text-amber-600" : "text-pick-text-sub"}`}>
                {d.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── 정산 내역 ──────────────────────────────────────────
function SettlementHistory({ history }: { history: SettlementRecord[] }) {
  if (history.length === 0) {
    return (
      <div className="mx-4 mb-4">
        <h3 className="font-bold text-pick-text text-sm mb-3 flex items-center gap-2">
          <Wallet size={16} className="text-amber-500" />
          정산 내역
        </h3>
        <div className="bg-white rounded-3xl border-2 border-pick-border px-4 py-8 text-center shadow-sm">
          <p className="text-3xl mb-2">💰</p>
          <p className="text-sm text-pick-text-sub font-medium">아직 정산 내역이 없어요</p>
          <p className="text-xs text-pick-text-sub mt-1">주문이 완료되면 매출이 집계됩니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-4 mb-4">
      <h3 className="font-bold text-pick-text text-sm mb-3 flex items-center gap-2">
        <Wallet size={16} className="text-amber-500" />
        정산 내역
      </h3>
      <div className="bg-white rounded-3xl border-2 border-pick-border overflow-hidden shadow-sm divide-y divide-pick-border">
        {history.map((h, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-xs text-pick-text-sub">{h.date}</p>
              <p className="font-black text-pick-text text-base mt-0.5">
                {h.amount.toLocaleString()}원
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1.5 rounded-full text-green-600 bg-green-50">
              {h.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 로딩 스켈레톤 ──────────────────────────────────────
function SettlementSkeleton() {
  return (
    <div className="min-h-full py-5 animate-pulse">
      <div className="px-4 mb-5">
        <div className="h-7 bg-gray-200 rounded-full w-40 mb-2" />
        <div className="h-4 bg-gray-100 rounded-full w-32" />
      </div>
      <div className="mx-4 mb-5 h-36 bg-amber-100 rounded-3xl" />
      <div className="mx-4 mb-5 flex flex-col gap-3">
        {[0,1,2].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-3xl" />)}
      </div>
    </div>
  );
}

// ── 메인 페이지 ───────────────────────────────────────
export default function OwnerSettlementPage() {
  const [data,    setData]    = useState<SettlementData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stores/my/settlement");
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <SettlementSkeleton />;

  const pickBalance   = data?.pickBalance       ?? 0;
  const periodStats   = data?.periodStats       ?? [];
  const weekly        = data?.weekly            ?? [];
  const history       = data?.settlementHistory ?? [];

  return (
    <div className="min-h-full py-5">
      <div className="px-4 mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-black text-pick-text text-xl">정산 / 매출 💰</h1>
          <p className="text-sm text-pick-text-sub mt-0.5">매출 현황과 정산을 관리하세요</p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 rounded-full bg-pick-bg border border-pick-border text-pick-text-sub"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <SettlementBalance pickBalance={pickBalance} />
      <RevenueSummary periodStats={periodStats} />
      {weekly.length > 0 && <WeeklyChart weekly={weekly} />}
      <SettlementHistory history={history} />
    </div>
  );
}

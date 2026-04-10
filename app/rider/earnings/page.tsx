"use client";

import { useState, useEffect, useCallback } from "react";
import { TrendingUp, Wallet, Download, Bike } from "lucide-react";

// ── 타입 ──────────────────────────────────────────────
interface PeriodStat {
  label: string;
  pick: number;
  count: number;
}

interface Settlement {
  date: string;
  pick: number;
  status: string;
}

interface EarningsData {
  pickBalance: number;
  periodStats: PeriodStat[];
  settlementHistory: Settlement[];
}

// ── 정산 가능 잔액 ─────────────────────────────────────
function EarningBalance({ pickBalance }: { pickBalance: number }) {
  return (
    <div className="mx-4 mb-5 rounded-3xl bg-gradient-to-br from-sky-600 to-blue-500 p-5 text-white shadow-lg">
      <p className="text-sm text-white/80 font-medium mb-1">PICK 잔액 💙</p>
      <div className="flex items-end gap-2 mb-4">
        <span className="text-4xl font-black">{pickBalance.toLocaleString()}</span>
        <span className="text-lg font-bold text-white/90 mb-1">PICK</span>
      </div>
      <button className="w-full bg-white text-sky-600 font-black py-3 rounded-2xl text-sm active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-sm">
        <Download size={16} />
        정산 신청하기
      </button>
    </div>
  );
}

// ── 기간별 수익 ────────────────────────────────────────
function EarningSummary({ periodStats }: { periodStats: PeriodStat[] }) {
  return (
    <div className="mx-4 mb-5">
      <h3 className="font-bold text-pick-text text-sm mb-3 flex items-center gap-2">
        <Wallet size={16} className="text-sky-500" />
        기간별 수익
      </h3>
      <div className="flex flex-col gap-3">
        {periodStats.map((s) => (
          <div key={s.label} className="bg-white rounded-3xl border-2 border-pick-border px-5 py-4 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs text-pick-text-sub font-medium mb-1">{s.label}</p>
              <p className="font-black text-pick-text text-lg">
                {s.pick.toLocaleString()}
                <span className="text-sm font-bold ml-1 text-sky-600">PICK</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-pick-text-sub">배달 수</p>
              <p className="font-black text-sky-600 text-xl">
                {s.count}<span className="text-sm ml-0.5">건</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 정산 내역 ──────────────────────────────────────────
function SettlementHistory({ history }: { history: Settlement[] }) {
  if (history.length === 0) {
    return (
      <div className="mx-4 mb-4">
        <h3 className="font-bold text-pick-text text-sm mb-3 flex items-center gap-2">
          <Download size={16} className="text-sky-500" />
          정산 내역
        </h3>
        <div className="bg-white rounded-3xl border-2 border-pick-border px-4 py-8 text-center shadow-sm">
          <p className="text-3xl mb-2">💙</p>
          <p className="text-sm text-pick-text-sub font-medium">아직 정산 내역이 없어요</p>
          <p className="text-xs text-pick-text-sub mt-1">배달을 완료하면 PICK이 적립됩니다</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-4 mb-4">
      <h3 className="font-bold text-pick-text text-sm mb-3 flex items-center gap-2">
        <Download size={16} className="text-sky-500" />
        정산 내역
      </h3>
      <div className="bg-white rounded-3xl border-2 border-pick-border overflow-hidden shadow-sm divide-y divide-pick-border">
        {history.map((h, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-4">
            <div>
              <p className="text-xs text-pick-text-sub">{h.date}</p>
              <p className="font-black text-pick-text text-base mt-0.5">
                {h.pick.toLocaleString()}
                <span className="text-sm text-sky-600 ml-1">PICK</span>
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
function EarningsSkeleton() {
  return (
    <div className="min-h-full py-5 animate-pulse">
      <div className="px-4 mb-5">
        <div className="h-7 bg-gray-200 rounded-full w-40 mb-2" />
        <div className="h-4 bg-gray-100 rounded-full w-32" />
      </div>
      <div className="mx-4 mb-5 h-36 bg-gray-200 rounded-3xl" />
      <div className="mx-4 mb-5 flex flex-col gap-3">
        {[0,1,2].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-3xl" />)}
      </div>
    </div>
  );
}

// ── 메인 페이지 ───────────────────────────────────────
export default function RiderEarningsPage() {
  const [data, setData]       = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/rider/earnings");
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  // 주간 수익 차트 (periodStats 기반)
  const WeeklyChartSection = useCallback(() => {
    if (!data?.periodStats) return null;
    return null; // periodStats로 주간 데이터 없음 — rider/stats API에서 weekly 가져와야 함
  }, [data]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <EarningsSkeleton />;

  const pickBalance    = data?.pickBalance      ?? 0;
  const periodStats    = data?.periodStats      ?? [];
  const settlementHist = data?.settlementHistory ?? [];

  return (
    <div className="min-h-full py-5">
      <div className="px-4 mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-black text-pick-text text-xl">수익 내역 💙</h1>
          <p className="text-sm text-pick-text-sub mt-0.5">수익 현황과 정산을 확인하세요</p>
        </div>
        <div className="flex items-center gap-1.5 bg-pick-bg border border-pick-border rounded-full px-3 py-1.5">
          <Bike size={13} className="text-sky-500" />
          <span className="text-xs font-bold text-pick-text">라이더</span>
        </div>
      </div>

      <EarningBalance pickBalance={pickBalance} />
      <EarningSummary periodStats={periodStats} />
      <WeeklyChartSection />
      <SettlementHistory history={settlementHist} />
    </div>
  );
}

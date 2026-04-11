"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp, Wallet, Download, Bike, RefreshCw,
  BarChart2, ArrowUpRight, MapPin, Store,
} from "lucide-react";

// ── 타입 ──────────────────────────────────────────────
interface PeriodStat    { label: string; pick: number; count: number }
interface ChartItem     { label: string; pick: number; count: number }
interface DeliveryItem  {
  orderId:     string;
  storeName:   string;
  address:     string;
  orderAmount: number;
  pickEarned:  number;
  date:        string;
}
interface Settlement    { date: string; pick: number; status: string }

interface EarningsData {
  pickBalance:       number;
  totalEarned:       number;
  periodStats:       PeriodStat[];
  weekly:            { day: string; pick: number; count: number }[];
  monthly:           { month: string; pick: number; count: number }[];
  deliveryHistory:   DeliveryItem[];
  settlementHistory: Settlement[];
}

type ChartTab = "weekly" | "monthly";
type HistoryTab = "deliveries" | "settlements";

// ── 공통 바 차트 ───────────────────────────────────────
function BarChart({ items, highlightLast }: { items: ChartItem[]; highlightLast: boolean }) {
  const [selected, setSelected] = useState<number | null>(null);
  const max = Math.max(...items.map((d) => d.pick), 1);

  return (
    <div>
      {selected !== null && items[selected] && (
        <div className="flex items-center justify-between mb-3 bg-sky-50 border border-sky-200 rounded-2xl px-4 py-2.5">
          <span className="text-xs font-bold text-sky-700">{items[selected].label}</span>
          <div className="text-right">
            <p className="text-sm font-black text-sky-700">
              {items[selected].pick.toLocaleString()} PICK
            </p>
            <p className="text-[10px] text-sky-500">{items[selected].count}건</p>
          </div>
        </div>
      )}
      <div className="flex items-end gap-1 overflow-x-auto pb-2" style={{ height: "138px" }}>
        {items.map((d, i) => {
          const isHigh = highlightLast ? i === items.length - 1 : d.pick === max;
          const pct    = Math.round((d.pick / max) * 100);
          return (
            <button
              key={`${d.label}-${i}`}
              onClick={() => setSelected(selected === i ? null : i)}
              className="flex flex-col items-center gap-1 flex-shrink-0 group"
              style={{ minWidth: "32px" }}
            >
              <div className="flex flex-col justify-end" style={{ height: "110px" }}>
                <div
                  className={`w-full rounded-t-lg transition-all ${
                    selected === i
                      ? "bg-sky-600"
                      : isHigh && d.pick > 0
                      ? "bg-gradient-to-t from-sky-500 to-blue-300"
                      : d.pick > 0
                      ? "bg-sky-200 group-hover:bg-sky-300"
                      : "bg-gray-100"
                  }`}
                  style={{ height: `${Math.max(pct, d.pick > 0 ? 6 : 3)}%` }}
                />
              </div>
              <span className={`text-[9px] font-bold leading-none ${
                isHigh && d.pick > 0 ? "text-sky-600" : "text-pick-text-sub"
              }`}>
                {d.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── 수익 차트 카드 ─────────────────────────────────────
function EarningsChart({
  weekly,
  monthly,
}: {
  weekly:  { day: string; pick: number; count: number }[];
  monthly: { month: string; pick: number; count: number }[];
}) {
  const [tab, setTab] = useState<ChartTab>("weekly");

  const TABS: { key: ChartTab; label: string }[] = [
    { key: "weekly",  label: "주간" },
    { key: "monthly", label: "월별" },
  ];

  const weeklyItems:  ChartItem[] = weekly.map((d) => ({ label: d.day,   pick: d.pick, count: d.count }));
  const monthlyItems: ChartItem[] = monthly.map((d) => ({ label: d.month, pick: d.pick, count: d.count }));
  const items     = tab === "weekly" ? weeklyItems : monthlyItems;
  const totalPick = items.reduce((s, d) => s + d.pick, 0);
  const totalCnt  = items.reduce((s, d) => s + d.count, 0);
  const best      = [...items].sort((a, b) => b.pick - a.pick)[0];

  return (
    <div className="mx-4 mb-5 bg-white rounded-3xl border-2 border-pick-border p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart2 size={18} className="text-sky-500" />
          <h3 className="font-bold text-pick-text text-sm">수익 추이</h3>
        </div>
        <div className="flex gap-1">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                tab === key
                  ? "bg-sky-500 text-white shadow-sm"
                  : "bg-pick-bg text-pick-text-sub border border-pick-border"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 요약 */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-sky-50 rounded-2xl px-3 py-2.5">
          <p className="text-[10px] text-sky-600 font-medium">총 수익</p>
          <p className="text-sm font-black text-sky-700">
            {totalPick >= 10000
              ? `${(totalPick / 10000).toFixed(1)}만`
              : totalPick.toLocaleString()}P
          </p>
        </div>
        <div className="bg-blue-50 rounded-2xl px-3 py-2.5">
          <p className="text-[10px] text-blue-600 font-medium">배달 수</p>
          <p className="text-sm font-black text-blue-700">{totalCnt}건</p>
        </div>
        {best && best.pick > 0 && (
          <div className="bg-green-50 rounded-2xl px-3 py-2.5">
            <p className="text-[10px] text-green-600 font-medium flex items-center gap-1">
              <ArrowUpRight size={10} /> 최고
            </p>
            <p className="text-sm font-black text-green-700 truncate">
              {best.label} · {best.pick >= 10000
                ? `${(best.pick / 10000).toFixed(1)}만`
                : best.pick.toLocaleString()}P
            </p>
          </div>
        )}
      </div>

      <BarChart items={items} highlightLast={tab === "weekly"} />

      {totalPick === 0 && (
        <p className="text-center text-xs text-pick-text-sub mt-2">
          이 기간에 완료된 배달이 없어요
        </p>
      )}
    </div>
  );
}

// ── PICK 잔액 카드 ─────────────────────────────────────
function BalanceCard({ pickBalance, totalEarned }: { pickBalance: number; totalEarned: number }) {
  return (
    <div className="mx-4 mb-5 rounded-3xl bg-gradient-to-br from-sky-600 to-blue-500 p-5 text-white shadow-lg">
      <p className="text-sm text-white/80 font-medium mb-1">PICK 잔액 💙</p>
      <div className="flex items-end gap-2 mb-1">
        <span className="text-4xl font-black">{pickBalance.toLocaleString()}</span>
        <span className="text-lg font-bold text-white/90 mb-1">PICK</span>
      </div>
      <p className="text-xs text-white/60 mb-4">
        누적 수익 {totalEarned.toLocaleString()} PICK
      </p>
      <button className="w-full bg-white text-sky-600 font-black py-3 rounded-2xl text-sm active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-sm">
        <Download size={16} />
        정산 신청하기
      </button>
    </div>
  );
}

// ── 기간별 수익 요약 ───────────────────────────────────
function PeriodSummary({ periodStats }: { periodStats: PeriodStat[] }) {
  return (
    <div className="mx-4 mb-5">
      <h3 className="font-bold text-pick-text text-sm mb-3 flex items-center gap-2">
        <Wallet size={16} className="text-sky-500" />
        기간별 수익
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {periodStats.map((s) => (
          <div key={s.label} className="bg-white rounded-3xl border-2 border-pick-border px-3 py-4 shadow-sm text-center">
            <p className="text-[10px] text-pick-text-sub font-medium mb-1">{s.label}</p>
            <p className="font-black text-sky-600 text-base leading-tight">
              {s.pick >= 10000
                ? `${(s.pick / 10000).toFixed(1)}만`
                : s.pick.toLocaleString()}
              <span className="text-xs font-bold">P</span>
            </p>
            <p className="text-xs font-bold text-pick-text-sub mt-1">{s.count}건</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 배달 내역 ──────────────────────────────────────────
function DeliveryHistory({ items }: { items: DeliveryItem[] }) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-3xl border-2 border-pick-border px-4 py-8 text-center shadow-sm">
        <p className="text-3xl mb-2">🛵</p>
        <p className="text-sm text-pick-text-sub font-medium">완료된 배달이 없어요</p>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-3xl border-2 border-pick-border overflow-hidden shadow-sm divide-y divide-pick-border">
      {items.map((d) => (
        <div key={d.orderId} className="px-4 py-3.5">
          <div className="flex items-start justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <Store size={12} className="text-pick-text-sub flex-shrink-0 mt-0.5" />
              <span className="font-black text-pick-text text-sm">{d.storeName}</span>
            </div>
            <span className="font-black text-sky-600 text-sm flex-shrink-0">
              +{d.pickEarned.toLocaleString()} PICK
            </span>
          </div>
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1 text-[11px] text-pick-text-sub">
              <MapPin size={10} className="flex-shrink-0" />
              <span className="truncate max-w-[170px]">{d.address}</span>
            </p>
            <p className="text-[10px] text-pick-text-sub flex-shrink-0">{d.date}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── 정산 내역 ──────────────────────────────────────────
function SettlementHistoryList({ items }: { items: Settlement[] }) {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-3xl border-2 border-pick-border px-4 py-8 text-center shadow-sm">
        <p className="text-3xl mb-2">💙</p>
        <p className="text-sm text-pick-text-sub font-medium">정산 완료 내역이 없어요</p>
        <p className="text-xs text-pick-text-sub mt-1">정산 신청 후 완료되면 여기에 표시됩니다</p>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-3xl border-2 border-pick-border overflow-hidden shadow-sm divide-y divide-pick-border">
      {items.map((h, i) => (
        <div key={i} className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-xs text-pick-text-sub">{h.date}</p>
            <p className="font-black text-pick-text text-base mt-0.5">
              {h.pick.toLocaleString()}
              <span className="text-sm text-sky-600 ml-1">PICK</span>
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 rounded-full text-green-600 bg-green-50 border border-green-200">
            {h.status}
          </span>
        </div>
      ))}
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
      <div className="mx-4 mb-5 h-40 bg-blue-100 rounded-3xl" />
      <div className="mx-4 mb-5 h-12 bg-gray-100 rounded-3xl" />
      <div className="mx-4 mb-5 h-56 bg-gray-100 rounded-3xl" />
      <div className="mx-4 mb-5 flex flex-col gap-3">
        {[0,1,2].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-3xl" />)}
      </div>
    </div>
  );
}

// ── 메인 페이지 ───────────────────────────────────────
export default function RiderEarningsPage() {
  const [data,       setData]       = useState<EarningsData | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [histTab,    setHistTab]    = useState<HistoryTab>("deliveries");

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch("/api/rider/earnings");
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <EarningsSkeleton />;

  const pickBalance       = data?.pickBalance       ?? 0;
  const totalEarned       = data?.totalEarned        ?? 0;
  const periodStats       = data?.periodStats        ?? [];
  const weekly            = data?.weekly             ?? [];
  const monthly           = data?.monthly            ?? [];
  const deliveryHistory   = data?.deliveryHistory    ?? [];
  const settlementHistory = data?.settlementHistory  ?? [];

  return (
    <div className="min-h-full py-5">
      {/* 헤더 */}
      <div className="px-4 mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-black text-pick-text text-xl">수익 내역 💙</h1>
          <p className="text-sm text-pick-text-sub mt-0.5">수익 현황과 정산을 확인하세요</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-pick-bg border border-pick-border rounded-full px-3 py-1.5">
            <Bike size={13} className="text-sky-500" />
            <span className="text-xs font-bold text-pick-text">라이더</span>
          </div>
          <button
            onClick={() => fetchData(true)}
            className="p-2 rounded-full bg-pick-bg border border-pick-border text-pick-text-sub"
          >
            <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <BalanceCard pickBalance={pickBalance} totalEarned={totalEarned} />
      <PeriodSummary periodStats={periodStats} />
      <EarningsChart weekly={weekly} monthly={monthly} />

      {/* 내역 탭 */}
      <div className="mx-4 mb-4">
        <div className="flex gap-1 mb-4">
          {([
            { key: "deliveries"   as const, label: `배달 내역 (${deliveryHistory.length})` },
            { key: "settlements"  as const, label: `정산 내역 (${settlementHistory.length})` },
          ]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setHistTab(key)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                histTab === key
                  ? "bg-sky-500 text-white shadow-sm"
                  : "bg-white border-2 border-pick-border text-pick-text-sub"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {histTab === "deliveries"
          ? <DeliveryHistory items={deliveryHistory} />
          : <SettlementHistoryList items={settlementHistory} />
        }
      </div>

      {/* 하단 안내 */}
      <div className="mx-4 mb-4 bg-pick-bg border-2 border-pick-border rounded-3xl px-4 py-3">
        <p className="text-xs text-pick-text-sub flex items-center gap-1.5">
          <TrendingUp size={12} className="text-sky-500 flex-shrink-0" />
          수익은 배달 완료 즉시 PICK으로 적립됩니다. 취소 건은 제외됩니다.
        </p>
      </div>
    </div>
  );
}

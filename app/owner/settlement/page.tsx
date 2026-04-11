"use client";

import { useState, useEffect, useCallback } from "react";
import { TrendingUp, Wallet, CalendarDays, Download, RefreshCw, BarChart2, ArrowUpRight } from "lucide-react";

// ── 타입 ──────────────────────────────────────────────
interface PeriodStat  { label: string; amount: number; orders: number }
interface ChartItem   { label: string; amount: number; orders: number }
interface SettlementRecord { date: string; amount: number; status: string }

interface SettlementData {
  pickBalance:       number;
  periodStats:       PeriodStat[];
  weekly:            { day: string; amount: number }[];
  monthly:           { month: string; amount: number; orders: number }[];
  daily:             { day: string;  amount: number; orders: number }[];
  settlementHistory: SettlementRecord[];
}

type ChartTab = "weekly" | "monthly" | "daily";

// ── 공통 바 차트 ───────────────────────────────────────
function BarChart({
  items,
  highlightLast,
  compact,
}: {
  items: ChartItem[];
  highlightLast: boolean;
  compact?: boolean;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const max = Math.max(...items.map((d) => d.amount), 1);
  const barH = compact ? 80 : 110;

  return (
    <div>
      {/* 선택된 바 툴팁 */}
      {selected !== null && items[selected] && (
        <div className="flex items-center justify-between mb-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-2.5">
          <span className="text-xs font-bold text-amber-700">{items[selected].label}</span>
          <div className="text-right">
            <p className="text-sm font-black text-amber-700">
              {items[selected].amount.toLocaleString()}원
            </p>
            <p className="text-[10px] text-amber-500">{items[selected].orders}건</p>
          </div>
        </div>
      )}

      <div className="flex items-end gap-1 overflow-x-auto pb-2" style={{ height: `${barH + 28}px` }}>
        {items.map((d, i) => {
          const isHigh = highlightLast ? i === items.length - 1 : d.amount === max;
          const pct    = Math.round((d.amount / max) * 100);
          return (
            <button
              key={`${d.label}-${i}`}
              onClick={() => setSelected(selected === i ? null : i)}
              className="flex flex-col items-center gap-1 flex-shrink-0 group"
              style={{ minWidth: compact ? "28px" : "32px" }}
            >
              <div className="flex flex-col justify-end" style={{ height: `${barH}px` }}>
                <div
                  className={`w-full rounded-t-lg transition-all ${
                    selected === i
                      ? "bg-amber-600"
                      : isHigh && d.amount > 0
                      ? "bg-gradient-to-t from-amber-500 to-orange-300"
                      : d.amount > 0
                      ? "bg-amber-200 group-hover:bg-amber-300"
                      : "bg-gray-100"
                  }`}
                  style={{ height: `${Math.max(pct, d.amount > 0 ? 6 : 3)}%` }}
                />
              </div>
              <span className={`text-[9px] font-bold leading-none ${
                isHigh && d.amount > 0 ? "text-amber-600" : "text-pick-text-sub"
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

// ── 탭 전환 차트 카드 ─────────────────────────────────
function RevenueChart({ weekly, monthly, daily }: {
  weekly:  { day: string; amount: number }[];
  monthly: { month: string; amount: number; orders: number }[];
  daily:   { day: string; amount: number; orders: number }[];
}) {
  const [tab, setTab] = useState<ChartTab>("weekly");

  const TABS: { key: ChartTab; label: string }[] = [
    { key: "weekly",  label: "주간" },
    { key: "monthly", label: "월별" },
    { key: "daily",   label: "30일" },
  ];

  const weeklyItems:  ChartItem[] = weekly.map((d) => ({ label: d.day,   amount: d.amount, orders: 0 }));
  const monthlyItems: ChartItem[] = monthly.map((d) => ({ label: d.month, amount: d.amount, orders: d.orders }));
  const dailyItems:   ChartItem[] = daily.map((d) => ({ label: d.day,   amount: d.amount, orders: d.orders }));

  const currentItems = tab === "weekly" ? weeklyItems : tab === "monthly" ? monthlyItems : dailyItems;
  const totalAmt     = currentItems.reduce((s, d) => s + d.amount, 0);
  const totalOrders  = currentItems.reduce((s, d) => s + d.orders, 0);
  const bestItem     = [...currentItems].sort((a, b) => b.amount - a.amount)[0];

  return (
    <div className="mx-4 mb-5 bg-white rounded-3xl border-2 border-pick-border p-5 shadow-sm">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart2 size={18} className="text-amber-500" />
          <h3 className="font-bold text-pick-text text-sm">매출 추이</h3>
        </div>
        <div className="flex gap-1">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                tab === key
                  ? "bg-amber-500 text-white shadow-sm"
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
        <div className="bg-amber-50 rounded-2xl px-3 py-2.5">
          <p className="text-[10px] text-amber-600 font-medium">총 매출</p>
          <p className="text-sm font-black text-amber-700">
            {totalAmt >= 10000
              ? `${(totalAmt / 10000).toFixed(1)}만`
              : totalAmt.toLocaleString()}원
          </p>
        </div>
        {tab !== "weekly" && (
          <div className="bg-orange-50 rounded-2xl px-3 py-2.5">
            <p className="text-[10px] text-orange-600 font-medium">총 주문</p>
            <p className="text-sm font-black text-orange-700">{totalOrders}건</p>
          </div>
        )}
        {bestItem && bestItem.amount > 0 && (
          <div className={`rounded-2xl px-3 py-2.5 ${tab === "weekly" ? "col-span-2" : ""} bg-green-50`}>
            <p className="text-[10px] text-green-600 font-medium flex items-center gap-1">
              <ArrowUpRight size={10} /> 최고
            </p>
            <p className="text-sm font-black text-green-700 truncate">
              {bestItem.label} · {bestItem.amount >= 10000
                ? `${(bestItem.amount / 10000).toFixed(1)}만`
                : bestItem.amount.toLocaleString()}원
            </p>
          </div>
        )}
      </div>

      {/* 차트 */}
      <BarChart
        items={currentItems}
        highlightLast={tab === "weekly"}
        compact={tab === "daily"}
      />

      {totalAmt === 0 && (
        <p className="text-center text-xs text-pick-text-sub mt-2">
          이 기간에 완료된 주문이 없어요
        </p>
      )}
    </div>
  );
}

// ── 기간별 매출 요약 카드 ──────────────────────────────
function PeriodSummary({ periodStats }: { periodStats: PeriodStat[] }) {
  return (
    <div className="mx-4 mb-5">
      <h3 className="font-bold text-pick-text text-sm mb-3 flex items-center gap-2">
        <CalendarDays size={16} className="text-amber-500" />
        기간별 매출
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {periodStats.map((s) => (
          <div key={s.label} className="bg-white rounded-3xl border-2 border-pick-border px-3 py-4 shadow-sm text-center">
            <p className="text-[10px] text-pick-text-sub font-medium mb-1">{s.label}</p>
            <p className="font-black text-pick-text text-base leading-tight">
              {s.amount >= 10000
                ? `${(s.amount / 10000).toFixed(1)}만`
                : s.amount.toLocaleString()}
              <span className="text-xs font-bold">원</span>
            </p>
            <p className="text-xs font-bold text-amber-500 mt-1">{s.orders}건</p>
          </div>
        ))}
      </div>
    </div>
  );
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

// ── 정산 내역 ──────────────────────────────────────────
function SettlementHistory({ history }: { history: SettlementRecord[] }) {
  return (
    <div className="mx-4 mb-6">
      <h3 className="font-bold text-pick-text text-sm mb-3 flex items-center gap-2">
        <Wallet size={16} className="text-amber-500" />
        최근 완료 주문
      </h3>
      {history.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-pick-border px-4 py-8 text-center shadow-sm">
          <p className="text-3xl mb-2">💰</p>
          <p className="text-sm text-pick-text-sub font-medium">완료된 주문이 없어요</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border-2 border-pick-border overflow-hidden shadow-sm divide-y divide-pick-border">
          {history.map((h, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-xs text-pick-text-sub">{h.date}</p>
                <p className="font-black text-pick-text text-base mt-0.5">
                  {h.amount.toLocaleString()}<span className="text-sm font-bold ml-0.5">원</span>
                </p>
              </div>
              <span className="text-xs font-bold px-3 py-1.5 rounded-full text-green-600 bg-green-50 border border-green-200">
                {h.status}
              </span>
            </div>
          ))}
        </div>
      )}
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
      <div className="mx-4 mb-5 h-12 bg-gray-100 rounded-3xl" />
      <div className="mx-4 mb-5 h-56 bg-gray-100 rounded-3xl" />
    </div>
  );
}

// ── 메인 페이지 ───────────────────────────────────────
export default function OwnerSettlementPage() {
  const [data,    setData]    = useState<SettlementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch("/api/stores/my/settlement");
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <SettlementSkeleton />;

  const pickBalance = data?.pickBalance       ?? 0;
  const periodStats = data?.periodStats       ?? [];
  const weekly      = data?.weekly            ?? [];
  const monthly     = data?.monthly           ?? [];
  const daily       = data?.daily             ?? [];
  const history     = data?.settlementHistory ?? [];

  return (
    <div className="min-h-full py-5">
      <div className="px-4 mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-black text-pick-text text-xl">정산 / 매출 💰</h1>
          <p className="text-sm text-pick-text-sub mt-0.5">매출 현황과 정산을 관리하세요</p>
        </div>
        <button
          onClick={() => fetchData(true)}
          className="p-2 rounded-full bg-pick-bg border border-pick-border text-pick-text-sub"
        >
          <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      <SettlementBalance pickBalance={pickBalance} />
      <PeriodSummary periodStats={periodStats} />
      <RevenueChart weekly={weekly} monthly={monthly} daily={daily} />
      <SettlementHistory history={history} />

      {/* 하단 안내 */}
      <div className="mx-4 mb-4 bg-pick-bg border-2 border-pick-border rounded-3xl px-4 py-3">
        <p className="text-xs text-pick-text-sub flex items-center gap-1.5">
          <TrendingUp size={12} className="text-pick-purple flex-shrink-0" />
          매출 기준은 배달 완료된 주문입니다. 취소·환불 건은 제외됩니다.
        </p>
      </div>
    </div>
  );
}

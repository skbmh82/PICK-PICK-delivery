"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Bike, TrendingUp, MapPin, CheckCircle, Clock, Star, RefreshCw } from "lucide-react";

// ── 타입 ──────────────────────────────────────────────
interface AvailableOrder {
  id: string;
  total_amount: number;
  delivery_fee: number;
  delivery_address: string;
  created_at: string;
  stores: { id: string; name: string; address: string } | null;
  order_items: { id: string; menu_name: string; quantity: number }[];
}

interface TodayStats {
  completed: number;
  inProgress: number;
  totalEarning: number;
}

interface WeeklyDay {
  day: string;
  pick: number;
  count: number;
}

// ── 오늘 현황 카드 ─────────────────────────────────────
function SummaryCards({ today }: { today: TodayStats }) {
  const stats = [
    {
      label: "완료 배달",
      value: today.completed,
      unit: "건",
      icon: <CheckCircle size={20} />,
      bg: "bg-green-50", border: "border-green-200",
      text: "text-green-700", iconBg: "bg-green-100",
    },
    {
      label: "진행 중",
      value: today.inProgress,
      unit: "건",
      icon: <Clock size={20} />,
      bg: "bg-blue-50", border: "border-blue-200",
      text: "text-blue-700", iconBg: "bg-blue-100",
    },
    {
      label: "오늘 수익",
      value: today.totalEarning.toLocaleString(),
      unit: "P",
      icon: <Star size={20} />,
      bg: "bg-sky-50", border: "border-sky-200",
      text: "text-sky-700", iconBg: "bg-sky-100",
    },
    {
      label: "배달 상태",
      value: today.inProgress > 0 ? "배달 중" : "대기 중",
      unit: "",
      icon: <MapPin size={20} />,
      bg: "bg-violet-50", border: "border-violet-200",
      text: "text-violet-700", iconBg: "bg-violet-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 px-4 mb-5">
      {stats.map((s) => (
        <div key={s.label} className={`${s.bg} border-2 ${s.border} rounded-3xl px-4 py-4 flex items-center gap-3`}>
          <span className={`w-10 h-10 rounded-2xl ${s.iconBg} ${s.text} flex items-center justify-center flex-shrink-0`}>
            {s.icon}
          </span>
          <div>
            <p className="text-xs text-pick-text-sub font-medium">{s.label}</p>
            <p className={`text-xl font-black ${s.text}`}>
              {s.value}<span className="text-sm ml-0.5">{s.unit}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── 오늘 수익 카드 ─────────────────────────────────────
function TodayEarning({ today }: { today: TodayStats }) {
  return (
    <div className="mx-4 mb-5 rounded-3xl bg-gradient-to-br from-sky-600 to-blue-500 p-5 text-white shadow-lg">
      <p className="text-sm text-white/80 font-medium mb-1">오늘 수익 💙</p>
      <div className="flex items-end gap-2 mb-4">
        <span className="text-4xl font-black">
          {today.totalEarning.toLocaleString()}
        </span>
        <span className="text-lg font-bold text-white/90 mb-1">PICK</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/20 rounded-2xl px-3 py-2.5 text-center">
          <p className="text-xs text-white/70">완료 건수</p>
          <p className="font-black text-white">{today.completed}건</p>
        </div>
        <div className="bg-white/20 rounded-2xl px-3 py-2.5 text-center">
          <p className="text-xs text-white/70">진행 중</p>
          <p className="font-black text-white">{today.inProgress}건</p>
        </div>
      </div>
    </div>
  );
}

// ── 주간 수익 차트 ─────────────────────────────────────
function WeeklyChart({ weekly }: { weekly: WeeklyDay[] }) {
  const max = Math.max(...weekly.map((d) => d.pick), 1);

  return (
    <div className="mx-4 mb-5 bg-white rounded-3xl border-2 border-pick-border p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={18} className="text-sky-500" />
        <h3 className="font-bold text-pick-text text-sm">주간 수익 현황</h3>
      </div>
      <div className="flex items-end gap-2 h-28">
        {weekly.map((d) => {
          const heightPct = Math.round((d.pick / max) * 100);
          const isToday   = d.day === "오늘";
          return (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
              {isToday && d.pick > 0 && (
                <span className="text-[9px] font-black text-sky-600">
                  {(d.pick / 1000).toFixed(1)}k
                </span>
              )}
              <div className="w-full flex flex-col justify-end" style={{ height: "90px" }}>
                <div
                  className={`w-full rounded-t-xl ${
                    isToday ? "bg-gradient-to-t from-sky-500 to-blue-400" : "bg-sky-100"
                  }`}
                  style={{ height: `${Math.max(heightPct, 4)}%` }}
                />
              </div>
              <span className={`text-[10px] font-bold ${isToday ? "text-sky-600" : "text-pick-text-sub"}`}>
                {d.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── 배달 가능 주문 알림 ────────────────────────────────
function AvailableOrderAlerts({ orders }: { orders: AvailableOrder[] }) {
  if (orders.length === 0) return null;

  return (
    <div className="mx-4 mb-5">
      <div className="flex items-center gap-2 mb-3">
        <Bike size={16} className="text-sky-500" />
        <h3 className="font-bold text-pick-text text-sm">배달 가능 주문</h3>
        <span className="text-xs bg-red-500 text-white font-black px-2 py-0.5 rounded-full">
          {orders.length}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {orders.map((order) => {
          const itemSummary = order.order_items
            .slice(0, 2)
            .map((i) => `${i.menu_name} x${i.quantity}`)
            .join(", ");
          const timeStr = new Date(order.created_at).toLocaleTimeString("ko-KR", {
            hour: "2-digit", minute: "2-digit",
          });
          return (
            <Link
              key={order.id}
              href="/rider/delivery"
              className="flex items-center gap-4 bg-blue-50 border-2 border-blue-200 rounded-3xl px-4 py-4 active:scale-95 transition-transform"
            >
              <span className="text-3xl">🛵</span>
              <div className="flex-1 min-w-0">
                <p className="font-black text-pick-text text-sm">
                  {order.stores?.name ?? "가게"}
                </p>
                <p className="text-xs text-pick-text-sub mt-0.5 truncate">{itemSummary}</p>
                <p className="text-xs font-bold text-sky-600 mt-1">
                  {timeStr} · +{Number(order.delivery_fee) > 0
                    ? Number(order.delivery_fee).toLocaleString()
                    : "3,000"} PICK
                </p>
              </div>
              <span className="text-xs font-bold text-sky-600 bg-sky-100 px-3 py-1.5 rounded-full flex-shrink-0">
                수락하기
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ── 로딩 스켈레톤 ──────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="min-h-full py-5 animate-pulse">
      <div className="px-4 mb-5">
        <div className="h-7 bg-gray-200 rounded-full w-48 mb-2" />
        <div className="h-4 bg-gray-100 rounded-full w-36" />
      </div>
      <div className="grid grid-cols-2 gap-3 px-4 mb-5">
        {[0,1,2,3].map((i) => <div key={i} className="h-20 bg-gray-100 rounded-3xl" />)}
      </div>
      <div className="mx-4 mb-5 h-32 bg-gray-200 rounded-3xl" />
      <div className="mx-4 mb-5 h-40 bg-gray-100 rounded-3xl" />
    </div>
  );
}

// ── 메인 페이지 ───────────────────────────────────────
export default function RiderDashboardPage() {
  const [stats, setStats]           = useState<{ today: TodayStats; weekly: WeeklyDay[]; riderName: string } | null>(null);
  const [availableOrders, setAvailableOrders] = useState<AvailableOrder[]>([]);
  const [loading, setLoading]       = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, ordersRes] = await Promise.all([
        fetch("/api/rider/stats"),
        fetch("/api/rider/available-orders"),
      ]);
      if (statsRes.ok)  setStats(await statsRes.json());
      if (ordersRes.ok) {
        const { orders } = await ordersRes.json();
        setAvailableOrders(orders ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <DashboardSkeleton />;

  const today  = stats?.today  ?? { completed: 0, inProgress: 0, totalEarning: 0 };
  const weekly = stats?.weekly ?? [];
  const name   = stats?.riderName ?? "라이더";

  return (
    <div className="min-h-full py-5">
      <div className="px-4 mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-black text-pick-text text-xl">안녕하세요, {name}님! 🛵</h1>
          <p className="text-sm text-pick-text-sub mt-0.5">오늘도 안전하게 달려요!</p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 rounded-full bg-pick-bg border border-pick-border text-pick-text-sub"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <AvailableOrderAlerts orders={availableOrders} />
      <SummaryCards today={today} />
      <TodayEarning today={today} />
      {weekly.length > 0 && <WeeklyChart weekly={weekly} />}
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ClipboardList, TrendingUp, Bell, Star, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";
import { useStoreOrderRealtime } from "@/hooks/useRealtime";

// ── 타입 ──────────────────────────────────────────────
interface PendingOrder {
  id: string;
  customerName: string;
  phone: string | null;
  totalAmount: number;
  items: { name: string; quantity: number }[];
  createdAt: string;
}

interface TodayStats {
  newOrders: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
  pickEarned: number;
}

interface WeeklyDay {
  day: string;
  amount: number;
}

interface DashboardData {
  storeName: string | null;
  today: TodayStats;
  weekly: WeeklyDay[];
  pendingOrders: PendingOrder[];
  storeId?: string;
}

// ── 오늘 현황 카드 ────────────────────────────────────
function SummaryCards({ today }: { today: TodayStats }) {
  const stats = [
    {
      label: "신규 주문",
      value: today.newOrders,
      unit: "건",
      icon: <ClipboardList size={20} />,
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
      iconBg: "bg-amber-100",
    },
    {
      label: "진행 중",
      value: today.inProgress,
      unit: "건",
      icon: <Clock size={20} />,
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
      iconBg: "bg-blue-100",
    },
    {
      label: "완료",
      value: today.completed,
      unit: "건",
      icon: <CheckCircle size={20} />,
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
      iconBg: "bg-green-100",
    },
    {
      label: "취소",
      value: today.cancelled,
      unit: "건",
      icon: <XCircle size={20} />,
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-600",
      iconBg: "bg-red-100",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 px-4 mb-5">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`${s.bg} border-2 ${s.border} rounded-3xl px-4 py-4 flex items-center gap-3`}
        >
          <span className={`w-10 h-10 rounded-2xl ${s.iconBg} ${s.text} flex items-center justify-center flex-shrink-0`}>
            {s.icon}
          </span>
          <div>
            <p className="text-xs text-pick-text-sub font-medium">{s.label}</p>
            <p className={`text-2xl font-black ${s.text}`}>
              {s.value}<span className="text-sm ml-0.5">{s.unit}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── 오늘 매출 카드 ─────────────────────────────────────
function TodayRevenue({ today }: { today: TodayStats }) {
  return (
    <div className="mx-4 mb-5 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-400 p-5 text-white shadow-lg">
      <p className="text-sm text-white/80 font-medium mb-1">오늘 총 매출 💰</p>
      <div className="flex items-end gap-2 mb-4">
        <span className="text-4xl font-black">
          {today.totalRevenue.toLocaleString()}
        </span>
        <span className="text-lg font-bold text-white/90 mb-1">원</span>
      </div>
      <div className="flex items-center justify-between bg-white/20 rounded-2xl px-4 py-2.5">
        <span className="text-xs text-white/80">획득 PICK 토큰</span>
        <span className="text-sm font-black">+{Math.floor(today.pickEarned)} PICK</span>
      </div>
    </div>
  );
}

// ── 주간 매출 바 차트 ──────────────────────────────────
function WeeklyChart({ weekly }: { weekly: WeeklyDay[] }) {
  const max = Math.max(...weekly.map((d) => d.amount), 1);

  return (
    <div className="mx-4 mb-5 bg-white rounded-3xl border-2 border-pick-border p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={18} className="text-amber-500" />
        <h3 className="font-bold text-pick-text text-sm">주간 매출 현황</h3>
      </div>
      <div className="flex items-end gap-2 h-24">
        {weekly.map((d) => {
          const heightPct = Math.round((d.amount / max) * 100);
          const isToday = d.day === "오늘";
          return (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col justify-end" style={{ height: "80px" }}>
                <div
                  className={`w-full rounded-t-xl transition-all ${
                    isToday
                      ? "bg-gradient-to-t from-amber-500 to-orange-400"
                      : "bg-amber-100"
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

// ── 신규 주문 알림 ─────────────────────────────────────
function NewOrderAlerts({ pendingOrders }: { pendingOrders: PendingOrder[] }) {
  if (pendingOrders.length === 0) return null;

  return (
    <div className="mx-4 mb-5">
      <div className="flex items-center gap-2 mb-3">
        <Bell size={16} className="text-amber-500" />
        <h3 className="font-bold text-pick-text text-sm">신규 주문 알림</h3>
        <span className="text-xs bg-red-500 text-white font-black px-2 py-0.5 rounded-full">
          {pendingOrders.length}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {pendingOrders.map((order) => (
          <Link
            key={order.id}
            href="/owner/orders"
            className="flex items-center gap-4 bg-red-50 border-2 border-red-200 rounded-3xl px-4 py-4 active:scale-95 transition-transform"
          >
            <span className="text-3xl">🛎️</span>
            <div className="flex-1 min-w-0">
              <p className="font-black text-pick-text text-sm">
                {order.customerName}님의 새 주문!
              </p>
              <p className="text-xs text-pick-text-sub mt-0.5 truncate">
                {order.items.map((i) => `${i.name} x${i.quantity}`).join(", ")}
              </p>
              <p className="text-xs font-bold text-red-600 mt-1">
                {order.totalAmount.toLocaleString()}원 · {order.createdAt}
              </p>
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-100 px-3 py-1.5 rounded-full flex-shrink-0">
              확인하기
            </span>
          </Link>
        ))}
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
        {[0,1,2,3].map((i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-3xl" />
        ))}
      </div>
      <div className="mx-4 mb-5 h-32 bg-gray-200 rounded-3xl" />
      <div className="mx-4 mb-5 h-40 bg-gray-100 rounded-3xl" />
    </div>
  );
}

// ── 메인 페이지 ───────────────────────────────────────
export default function OwnerDashboardPage() {
  const [data, setData]       = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [storeId, setStoreId] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, storeRes] = await Promise.all([
        fetch("/api/stores/my/stats"),
        fetch("/api/stores/my"),
      ]);
      if (statsRes.ok) {
        const stats: DashboardData = await statsRes.json();
        setData(stats);
      }
      if (storeRes.ok) {
        const { store } = await storeRes.json();
        if (store?.id) setStoreId(store.id);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  // 신규 주문 실시간 알림 → 대시보드 자동 갱신
  useStoreOrderRealtime(storeId, () => {
    fetchDashboard();
  });

  if (loading) return <DashboardSkeleton />;

  const today: TodayStats = data?.today ?? {
    newOrders: 0, inProgress: 0, completed: 0, cancelled: 0, totalRevenue: 0, pickEarned: 0,
  };
  const weekly   = data?.weekly ?? [];
  const pending  = data?.pendingOrders ?? [];
  const storeName = data?.storeName ?? "사장님";

  return (
    <div className="min-h-full py-5">
      <div className="px-4 mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-black text-pick-text text-xl">
            안녕하세요, {storeName}! 👋
          </h1>
          <p className="text-sm text-pick-text-sub mt-0.5">오늘도 맛있는 하루 보내세요 🍗</p>
        </div>
        <button
          onClick={fetchDashboard}
          className="p-2 rounded-full bg-pick-bg border border-pick-border text-pick-text-sub"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <NewOrderAlerts pendingOrders={pending} />
      <SummaryCards today={today} />
      <TodayRevenue today={today} />
      {weekly.length > 0 && <WeeklyChart weekly={weekly} />}

      {/* 최근 리뷰 — 추후 API 연동 예정 */}
      <div className="mx-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Star size={16} className="text-amber-500" />
          <h3 className="font-bold text-pick-text text-sm">최근 리뷰</h3>
          <span className="text-xs text-pick-text-sub bg-pick-bg border border-pick-border px-2 py-0.5 rounded-full">
            준비 중
          </span>
        </div>
        <div className="bg-pick-bg border-2 border-pick-border rounded-3xl px-4 py-8 text-center">
          <p className="text-3xl mb-2">⭐</p>
          <p className="text-sm text-pick-text-sub font-medium">리뷰 기능이 곧 추가됩니다</p>
        </div>
      </div>
    </div>
  );
}

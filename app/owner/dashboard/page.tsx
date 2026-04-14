"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { ClipboardList, TrendingUp, Bell, CheckCircle, XCircle, Clock, RefreshCw, Store, ChevronDown, X, Check, BarChart2, Utensils, Zap, ArrowUp, ArrowDown, Settings, MapPin, Navigation } from "lucide-react";

import { useStoreOrderRealtime } from "@/hooks/useRealtime";
import { useOrderSound } from "@/lib/useOrderSound";

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

// ── 고급 통계 타입 ─────────────────────────────────────
interface AnalyticsData {
  monthly:   { month: string; revenue: number; orders: number }[];
  topMenus:  { name: string; count: number; revenue: number }[];
  peakHours: { hour: string; count: number }[];
  summary: {
    thisMonthRevenue: number;
    lastMonthRevenue: number;
    thisMonthOrders:  number;
    lastMonthOrders:  number;
    growthRate:       number | null;
  } | null;
}

// ── 고급 통계 섹션 ────────────────────────────────────
function AnalyticsSection() {
  const [data,    setData]    = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState<"monthly" | "menu" | "peak">("monthly");

  useEffect(() => {
    fetch("/api/stores/my/analytics")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-4 mb-5 bg-white rounded-3xl border-2 border-pick-border shadow-sm overflow-hidden">
      {/* 헤더 */}
      <div className="px-5 pt-4 pb-3 border-b border-pick-border">
        <div className="flex items-center gap-2 mb-3">
          <BarChart2 size={18} className="text-pick-purple" />
          <h3 className="font-bold text-pick-text text-sm">고급 통계</h3>
        </div>

        {/* 탭 */}
        <div className="flex gap-2">
          {([
            { key: "monthly" as const, label: "월별 매출" },
            { key: "menu"    as const, label: "인기 메뉴" },
            { key: "peak"    as const, label: "피크 시간" },
          ]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                tab === key
                  ? "bg-pick-purple text-white"
                  : "bg-pick-bg text-pick-text-sub border border-pick-border"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-pick-purple border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tab === "monthly" ? (
          <MonthlyChart data={data} />
        ) : tab === "menu" ? (
          <TopMenus data={data} />
        ) : (
          <PeakHours data={data} />
        )}
      </div>
    </div>
  );
}

function MonthlyChart({ data }: { data: AnalyticsData | null }) {
  const monthly = data?.monthly ?? [];
  const summary = data?.summary ?? null;
  const max = Math.max(...monthly.map((d) => d.revenue), 1);

  return (
    <div>
      {/* 이번달 vs 지난달 */}
      {summary && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-pick-bg rounded-2xl p-3">
            <p className="text-[10px] text-pick-text-sub font-medium mb-1">이번달 매출</p>
            <p className="font-black text-pick-text text-lg">{summary.thisMonthRevenue.toLocaleString()}원</p>
            <p className="text-[10px] text-pick-text-sub mt-0.5">{summary.thisMonthOrders}건</p>
          </div>
          <div className="bg-pick-bg rounded-2xl p-3">
            <p className="text-[10px] text-pick-text-sub font-medium mb-1">전월 대비</p>
            {summary.growthRate !== null ? (
              <div className={`flex items-center gap-1 ${summary.growthRate >= 0 ? "text-green-600" : "text-red-500"}`}>
                {summary.growthRate >= 0
                  ? <ArrowUp size={16} />
                  : <ArrowDown size={16} />
                }
                <span className="font-black text-lg">{Math.abs(summary.growthRate)}%</span>
              </div>
            ) : (
              <p className="font-black text-pick-text-sub text-lg">-</p>
            )}
            <p className="text-[10px] text-pick-text-sub mt-0.5">지난달 {summary.lastMonthRevenue.toLocaleString()}원</p>
          </div>
        </div>
      )}

      {/* 월별 바 차트 */}
      <div className="flex items-end gap-1.5 h-28">
        {monthly.map((d, i) => {
          const heightPct = Math.round((d.revenue / max) * 100);
          const isThis    = i === monthly.length - 1;
          return (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex flex-col justify-end" style={{ height: "88px" }}>
                <div
                  className={`w-full rounded-t-lg transition-all ${
                    isThis ? "bg-gradient-to-t from-pick-purple to-pick-purple-light" : "bg-pick-purple/20"
                  }`}
                  style={{ height: `${Math.max(heightPct, 4)}%` }}
                />
              </div>
              <span className={`text-[9px] font-bold ${isThis ? "text-pick-purple" : "text-pick-text-sub"}`}>
                {d.month}
              </span>
            </div>
          );
        })}
      </div>
      {monthly.every((d) => d.revenue === 0) && (
        <p className="text-xs text-pick-text-sub text-center mt-2">아직 매출 데이터가 없어요</p>
      )}
    </div>
  );
}

function TopMenus({ data }: { data: AnalyticsData | null }) {
  const menus = data?.topMenus ?? [];

  if (menus.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 gap-2">
        <Utensils size={32} className="text-pick-border" />
        <p className="text-xs text-pick-text-sub">최근 30일 주문 데이터가 없어요</p>
      </div>
    );
  }

  const maxCount = Math.max(...menus.map((m) => m.count), 1);

  return (
    <div className="flex flex-col gap-3">
      {menus.map((menu, i) => (
        <div key={menu.name} className="flex items-center gap-3">
          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
            i === 0 ? "bg-pick-yellow text-white"
            : i === 1 ? "bg-gray-300 text-white"
            : i === 2 ? "bg-amber-700/60 text-white"
            : "bg-pick-bg text-pick-text-sub"
          }`}>
            {i + 1}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-bold text-pick-text truncate">{menu.name}</p>
              <p className="text-xs font-black text-pick-purple flex-shrink-0 ml-2">{menu.count}개</p>
            </div>
            <div className="w-full h-1.5 bg-pick-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pick-purple to-pick-purple-light rounded-full"
                style={{ width: `${(menu.count / maxCount) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PeakHours({ data }: { data: AnalyticsData | null }) {
  const hours = data?.peakHours ?? [];
  const max   = Math.max(...hours.map((h) => h.count), 1);
  const peak  = hours.reduce((a, b) => (a.count >= b.count ? a : b), hours[0]);

  return (
    <div>
      {peak && peak.count > 0 && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-3 py-2 mb-4">
          <Zap size={14} className="text-amber-500 flex-shrink-0" />
          <p className="text-xs font-bold text-amber-700">
            피크 시간: <span className="text-amber-600">{peak.hour}</span> — {peak.count}건
          </p>
        </div>
      )}

      <div className="flex items-end gap-1 h-20 overflow-x-auto scrollbar-hide">
        {hours.map((h) => {
          const heightPct = Math.round((h.count / max) * 100);
          const isPeak    = h.count === max && max > 0;
          return (
            <div key={h.hour} className="flex-shrink-0 w-6 flex flex-col items-center gap-0.5">
              <div className="w-full flex flex-col justify-end" style={{ height: "60px" }}>
                <div
                  className={`w-full rounded-t transition-all ${
                    isPeak ? "bg-amber-400" : "bg-amber-100"
                  }`}
                  style={{ height: `${Math.max(heightPct, 4)}%` }}
                />
              </div>
              <span className="text-[8px] text-pick-text-sub font-medium">
                {h.hour.replace("시", "")}
              </span>
            </div>
          );
        })}
      </div>
      {hours.every((h) => h.count === 0) && (
        <p className="text-xs text-pick-text-sub text-center mt-2">최근 30일 주문 데이터가 없어요</p>
      )}
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

// ── 카테고리 목록 ──────────────────────────────────────
const CATEGORIES: { id: string; label: string; emoji: string }[] = [
  { id: "burger",   label: "버거",      emoji: "🍔" },
  { id: "korean",   label: "한식",      emoji: "🍚" },
  { id: "chicken",  label: "치킨",      emoji: "🍗" },
  { id: "snack",    label: "분식",      emoji: "🍜" },
  { id: "pork",     label: "돈까스",    emoji: "🥩" },
  { id: "jokbal",   label: "족발/보쌈", emoji: "🐷" },
  { id: "stew",     label: "찜/탕",     emoji: "🍲" },
  { id: "grill",    label: "구이",      emoji: "🔥" },
  { id: "pizza",    label: "피자",      emoji: "🍕" },
  { id: "chinese",  label: "중식",      emoji: "🥟" },
  { id: "japanese", label: "일식",      emoji: "🍱" },
  { id: "seafood",  label: "회/해물",   emoji: "🦐" },
  { id: "western",  label: "양식",      emoji: "🥗" },
  { id: "coffee",   label: "커피/차",   emoji: "☕" },
  { id: "dessert",  label: "디저트",    emoji: "🍰" },
  { id: "snacks",   label: "간식",      emoji: "🍿" },
];

// ── 가게 등록 모달 ─────────────────────────────────────
function RegisterStoreModal({ onClose, onRegistered }: {
  onClose: () => void;
  onRegistered: () => void;
}) {
  const [form, setForm] = useState({
    name: "", category: "", description: "", phone: "",
    address: "", deliveryFee: "3000", minOrderAmount: "15000",
    deliveryTime: "30", deliveryRadiusKm: "5",
  });
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [done,       setDone]       = useState(false);
  const [addrSearch, setAddrSearch] = useState(false);
  const searchLayerRef = useRef<HTMLDivElement>(null);

  const set = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Daum Postcode 열기
  const openPostcode = useCallback(() => setAddrSearch(true), []);

  useEffect(() => {
    if (!addrSearch || !searchLayerRef.current) return;
    const embed = () => {
      if (!window.daum?.Postcode || !searchLayerRef.current) return;
      searchLayerRef.current.innerHTML = "";
      new window.daum.Postcode({
        oncomplete: (data) => {
          set("address", data.roadAddress || data.jibunAddress);
          setAddrSearch(false);
        },
      }).embed(searchLayerRef.current);
    };
    if (window.daum?.Postcode) {
      embed();
    } else {
      const script = document.createElement("script");
      script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
      script.onload = embed;
      document.head.appendChild(script);
    }
  }, [addrSearch]);

  const handleSubmit = async () => {
    if (!form.name.trim())    return setError("가게 이름을 입력해주세요");
    if (!form.category)       return setError("카테고리를 선택해주세요");
    if (!form.address.trim()) return setError("주소를 입력해주세요");
    const radius = parseFloat(form.deliveryRadiusKm);
    if (isNaN(radius) || radius < 1 || radius > 30) return setError("배달 반경은 1~30km 사이로 입력해주세요");

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/stores/my", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:             form.name.trim(),
          category:         form.category,
          description:      form.description.trim() || undefined,
          phone:            form.phone.trim() || undefined,
          address:          form.address.trim(),
          deliveryFee:      Number(form.deliveryFee)      || 0,
          minOrderAmount:   Number(form.minOrderAmount)   || 0,
          deliveryTime:     Number(form.deliveryTime)     || 30,
          deliveryRadiusKm: radius,
        }),
      });
      const json = await res.json();
      if (res.ok) {
        setDone(true);
        setTimeout(() => { onRegistered(); onClose(); }, 1600);
      } else {
        setError(json.error ?? "등록에 실패했습니다");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[55]" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-[60] bg-white rounded-t-3xl shadow-2xl max-h-[92vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-pick-border flex-shrink-0">
          <h2 className="font-black text-pick-text text-lg">가게 등록하기 🏪</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-pick-bg">
            <X size={16} className="text-pick-text-sub" />
          </button>
        </div>

        {/* 주소 검색 레이어 */}
        {addrSearch && (
          <div className="fixed inset-0 z-[70] flex flex-col bg-white">
            <div className="flex items-center justify-between px-4 py-3 border-b border-pick-border flex-shrink-0">
              <p className="font-black text-pick-text text-sm">주소 검색 🔍</p>
              <button
                onClick={() => setAddrSearch(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-pick-bg"
              >
                <X size={16} className="text-pick-text-sub" />
              </button>
            </div>
            <div ref={searchLayerRef} className="flex-1" />
          </div>
        )}

        {done ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-12">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <Check size={40} className="text-green-600" />
            </div>
            <p className="font-black text-pick-text text-xl">등록 완료!</p>
            <p className="text-sm text-pick-text-sub text-center px-8">
              가게가 등록됐어요.<br/>관리자 승인 후 앱에 노출됩니다 🎉
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
            {/* 가게 이름 */}
            <div>
              <label className="text-xs font-bold text-pick-text-sub mb-1.5 block">가게 이름 *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="예) 홍길동 치킨"
                maxLength={50}
                className="w-full border-2 border-pick-border rounded-2xl px-4 py-3 text-sm text-pick-text focus:outline-none focus:border-pick-purple"
              />
            </div>

            {/* 카테고리 */}
            <div>
              <label className="text-xs font-bold text-pick-text-sub mb-1.5 block">카테고리 *</label>
              <div className="relative">
                <select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  className="w-full border-2 border-pick-border rounded-2xl px-4 py-3 text-sm text-pick-text focus:outline-none focus:border-pick-purple appearance-none bg-white"
                >
                  <option value="">카테고리 선택</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-pick-text-sub pointer-events-none" />
              </div>
            </div>

            {/* 가게 주소 — 카카오 주소 검색 */}
            <div>
              <label className="text-xs font-bold text-pick-text-sub mb-1.5 block">가게 주소 *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.address}
                  readOnly
                  placeholder="주소 검색 버튼을 눌러주세요"
                  className="flex-1 border-2 border-pick-border rounded-2xl px-4 py-3 text-sm text-pick-text bg-pick-bg cursor-pointer focus:outline-none"
                  onClick={openPostcode}
                />
                <button
                  type="button"
                  onClick={openPostcode}
                  className="flex-shrink-0 flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-pick-purple text-white text-xs font-black whitespace-nowrap active:scale-95 transition-transform"
                >
                  <MapPin size={13} /> 검색
                </button>
              </div>
              {form.address && (
                <p className="text-[11px] text-pick-purple font-semibold mt-1.5 flex items-center gap-1">
                  <Navigation size={10} /> 좌표는 등록 시 자동으로 저장됩니다
                </p>
              )}
            </div>

            {/* 전화번호 */}
            <div>
              <label className="text-xs font-bold text-pick-text-sub mb-1.5 block">전화번호</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="예) 02-1234-5678"
                className="w-full border-2 border-pick-border rounded-2xl px-4 py-3 text-sm text-pick-text focus:outline-none focus:border-pick-purple"
              />
            </div>

            {/* 가게 소개 */}
            <div>
              <label className="text-xs font-bold text-pick-text-sub mb-1.5 block">가게 소개</label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="가게를 간단히 소개해주세요"
                rows={3}
                maxLength={200}
                className="w-full border-2 border-pick-border rounded-2xl px-4 py-3 text-sm text-pick-text focus:outline-none focus:border-pick-purple resize-none"
              />
            </div>

            {/* 배달비 / 최소주문금액 / 예상시간 */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: "deliveryFee",    label: "배달비 (원)",   placeholder: "3000" },
                { key: "minOrderAmount", label: "최소주문 (원)", placeholder: "15000" },
                { key: "deliveryTime",   label: "예상시간 (분)", placeholder: "30" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-bold text-pick-text-sub mb-1.5 block">{label}</label>
                  <input
                    type="number"
                    value={form[key as keyof typeof form]}
                    onChange={(e) => set(key, e.target.value)}
                    placeholder={placeholder}
                    min="0"
                    className="w-full border-2 border-pick-border rounded-2xl px-3 py-3 text-sm text-pick-text focus:outline-none focus:border-pick-purple"
                  />
                </div>
              ))}
            </div>

            {/* 배달 반경 */}
            <div>
              <label className="text-xs font-bold text-pick-text-sub mb-1.5 flex items-center gap-1.5 block">
                <MapPin size={11} /> 배달 반경 (km) *
              </label>
              <p className="text-[11px] text-pick-text-sub mb-2">이 반경 내 고객에게만 가게가 노출돼요</p>
              <div className="flex gap-2 mb-2">
                {[3, 5, 7, 10].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => set("deliveryRadiusKm", String(r))}
                    className={`flex-1 py-2.5 rounded-2xl text-xs font-bold transition-all active:scale-95 ${
                      form.deliveryRadiusKm === String(r)
                        ? "bg-pick-purple text-white"
                        : "bg-pick-bg border-2 border-pick-border text-pick-text-sub"
                    }`}
                  >
                    {r}km
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={form.deliveryRadiusKm}
                onChange={(e) => set("deliveryRadiusKm", e.target.value)}
                placeholder="직접 입력 (1~30)"
                min="1"
                max="30"
                step="0.5"
                className="w-full border-2 border-pick-border rounded-2xl px-4 py-2.5 text-sm text-pick-text text-right focus:outline-none focus:border-pick-purple"
              />
            </div>

            {error && <p className="text-xs text-red-500 font-bold text-center">{error}</p>}

            <p className="text-xs text-pick-text-sub text-center pb-2">
              ℹ️ 등록 후 관리자 승인이 완료되면 앱에 노출됩니다
            </p>
          </div>
        )}

        {!done && (
          <div className="px-5 pb-8 pt-3 border-t border-pick-border flex-shrink-0">
            <button
              onClick={() => void handleSubmit()}
              disabled={loading}
              className="w-full bg-gradient-to-r from-pick-purple to-pick-purple-light text-white font-black py-4 rounded-full shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading
                ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <Store size={18} />
              }
              가게 등록하기
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ── 가게 없음 배너 ─────────────────────────────────────
function NoStoreBanner({ onRegister }: { onRegister: () => void }) {
  return (
    <div className="mx-4 mb-6">
      <div className="rounded-3xl bg-gradient-to-br from-pick-purple-dark via-pick-purple to-pick-purple-light p-6 text-white shadow-xl relative overflow-hidden">
        {/* 배경 장식 */}
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/10" />

        <div className="relative">
          <span className="text-5xl block mb-4">🏪</span>
          <h2 className="font-black text-xl mb-1">아직 가게가 없어요!</h2>
          <p className="text-sm text-white/80 mb-5 leading-relaxed">
            PICK PICK에 가게를 등록하고<br/>
            바로 주문을 받아보세요 🛵
          </p>

          {/* 혜택 목록 */}
          <div className="flex flex-col gap-2 mb-6">
            {[
              "✅ 무료 입점 — 초기 비용 없음",
              "💜 PICK 토큰으로 수수료 정산",
              "📊 실시간 주문·매출 대시보드",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-white/90">
                <span>{item}</span>
              </div>
            ))}
          </div>

          <button
            onClick={onRegister}
            className="w-full bg-pick-yellow text-white font-black py-4 rounded-full shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Store size={18} />
            지금 가게 등록하기
          </button>
        </div>
      </div>

      {/* 안내 카드 */}
      <div className="mt-3 bg-white rounded-3xl border-2 border-pick-border p-4">
        <p className="text-xs font-bold text-pick-text mb-3">📋 등록 절차</p>
        <div className="flex items-center justify-between gap-2">
          {["가게 정보\n입력", "관리자\n승인", "메뉴\n등록", "주문\n시작!"].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-pick-purple/10 text-pick-purple text-xs font-black flex items-center justify-center">
                  {i + 1}
                </div>
                <p className="text-[10px] text-pick-text-sub font-medium text-center whitespace-pre-line leading-tight">{step}</p>
              </div>
              {i < 3 && <div className="w-4 h-0.5 bg-pick-border flex-shrink-0 mb-3" />}
            </div>
          ))}
        </div>
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
  const [data,          setData]          = useState<DashboardData | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [storeId,       setStoreId]       = useState<string | null>(null);
  const [hasStore,      setHasStore]      = useState<boolean | null>(null);
  const [isApproved,    setIsApproved]    = useState<boolean | null>(null);
  const [registerOpen,  setRegisterOpen]  = useState(false);
  const playOrderSound = useOrderSound();

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, storeRes] = await Promise.all([
        fetch("/api/stores/my/stats"),
        fetch("/api/stores/my"),
      ]);
      if (storeRes.ok) {
        const { store } = await storeRes.json();
        setHasStore(!!store?.id);
        if (store?.id) {
          setStoreId(store.id);
          setIsApproved(!!store.is_approved);
        }
      }
      if (statsRes.ok) {
        const stats: DashboardData = await statsRes.json();
        setData(stats);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  // 신규 주문 실시간 알림 → 대시보드 자동 갱신 + 음성 알림
  useStoreOrderRealtime(storeId, () => {
    playOrderSound();
    fetchDashboard();
  });

  if (loading) return <DashboardSkeleton />;

  // 가게가 없으면 등록 배너 전용 화면
  if (hasStore === false) {
    return (
      <div className="min-h-full py-5">
        <div className="px-4 mb-5">
          <h1 className="font-black text-pick-text text-xl">사장님 대시보드 👋</h1>
          <p className="text-sm text-pick-text-sub mt-0.5">PICK PICK에서 쉽고 빠르게 장사 시작!</p>
        </div>
        <NoStoreBanner onRegister={() => setRegisterOpen(true)} />
        {registerOpen && (
          <RegisterStoreModal
            onClose={() => setRegisterOpen(false)}
            onRegistered={fetchDashboard}
          />
        )}
      </div>
    );
  }

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

      {/* 승인 대기 배너 */}
      {isApproved === false && (
        <div className="mx-4 mb-4 bg-amber-50 border-2 border-amber-200 rounded-3xl p-4 flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">⏳</span>
          <div>
            <p className="font-black text-amber-800 text-sm">관리자 승인 대기 중입니다</p>
            <p className="text-xs text-amber-700 mt-1 leading-relaxed">
              가게 등록 신청이 완료됐어요! 관리자 검토 후 승인되면 고객에게 가게가 노출됩니다. 보통 1~2 영업일 내 처리됩니다.
            </p>
          </div>
        </div>
      )}

      <NewOrderAlerts pendingOrders={pending} />
      <SummaryCards today={today} />
      <TodayRevenue today={today} />
      {weekly.length > 0 && <WeeklyChart weekly={weekly} />}
      <AnalyticsSection />

      {/* 빠른 메뉴 */}
      <div className="mx-4 mb-4">
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/owner/menu"
            className="flex items-center gap-3 bg-white border-2 border-pick-border rounded-3xl p-4 active:scale-95 transition-all shadow-sm"
          >
            <span className="w-9 h-9 rounded-2xl bg-green-50 flex items-center justify-center">
              <ClipboardList size={18} className="text-green-600" />
            </span>
            <span className="text-sm font-bold text-pick-text">메뉴 관리</span>
          </Link>
          <Link
            href="/owner/store-settings"
            className="flex items-center gap-3 bg-white border-2 border-pick-border rounded-3xl p-4 active:scale-95 transition-all shadow-sm"
          >
            <span className="w-9 h-9 rounded-2xl bg-purple-50 flex items-center justify-center">
              <Settings size={18} className="text-pick-purple" />
            </span>
            <span className="text-sm font-bold text-pick-text">가게 설정</span>
          </Link>
          <Link
            href="/owner/orders"
            className="flex items-center gap-3 bg-white border-2 border-pick-border rounded-3xl p-4 active:scale-95 transition-all shadow-sm"
          >
            <span className="w-9 h-9 rounded-2xl bg-amber-50 flex items-center justify-center">
              <Bell size={18} className="text-amber-600" />
            </span>
            <span className="text-sm font-bold text-pick-text">주문 관리</span>
          </Link>
          <Link
            href="/owner/settlement"
            className="flex items-center gap-3 bg-white border-2 border-pick-border rounded-3xl p-4 active:scale-95 transition-all shadow-sm"
          >
            <span className="w-9 h-9 rounded-2xl bg-blue-50 flex items-center justify-center">
              <TrendingUp size={18} className="text-blue-600" />
            </span>
            <span className="text-sm font-bold text-pick-text">매출/정산</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

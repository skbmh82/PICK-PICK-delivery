import Link from "next/link";
import { Bike, TrendingUp, MapPin, CheckCircle, Clock, Star } from "lucide-react";
import {
  TODAY_RIDER_SUMMARY,
  WEEKLY_RIDER_EARNINGS,
  MOCK_DELIVERIES,
} from "@/lib/mock/rider";

/* ────────────── 오늘 현황 카드 ────────────── */
function SummaryCards() {
  const stats = [
    {
      label: "완료 배달",
      value: TODAY_RIDER_SUMMARY.completed,
      unit: "건",
      icon: <CheckCircle size={20} />,
      bg: "bg-green-50", border: "border-green-200",
      text: "text-green-700", iconBg: "bg-green-100",
    },
    {
      label: "진행 중",
      value: TODAY_RIDER_SUMMARY.inProgress,
      unit: "건",
      icon: <Clock size={20} />,
      bg: "bg-blue-50", border: "border-blue-200",
      text: "text-blue-700", iconBg: "bg-blue-100",
    },
    {
      label: "오늘 수익",
      value: TODAY_RIDER_SUMMARY.totalEarning.toLocaleString(),
      unit: "P",
      icon: <Star size={20} />,
      bg: "bg-sky-50", border: "border-sky-200",
      text: "text-sky-700", iconBg: "bg-sky-100",
    },
    {
      label: "이동 거리",
      value: TODAY_RIDER_SUMMARY.totalDistance,
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

/* ────────────── 오늘 수익 카드 ────────────── */
function TodayEarning() {
  return (
    <div className="mx-4 mb-5 rounded-3xl bg-gradient-to-br from-sky-600 to-blue-500 p-5 text-white shadow-lg">
      <p className="text-sm text-white/80 font-medium mb-1">오늘 수익 💙</p>
      <div className="flex items-end gap-2 mb-4">
        <span className="text-4xl font-black">
          {TODAY_RIDER_SUMMARY.totalEarning.toLocaleString()}
        </span>
        <span className="text-lg font-bold text-white/90 mb-1">PICK</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/20 rounded-2xl px-3 py-2.5 text-center">
          <p className="text-xs text-white/70">완료 건수</p>
          <p className="font-black text-white">{TODAY_RIDER_SUMMARY.completed}건</p>
        </div>
        <div className="bg-white/20 rounded-2xl px-3 py-2.5 text-center">
          <p className="text-xs text-white/70">이동 거리</p>
          <p className="font-black text-white">{TODAY_RIDER_SUMMARY.totalDistance}</p>
        </div>
      </div>
    </div>
  );
}

/* ────────────── 진행 중인 배달 ────────────── */
function ActiveDelivery() {
  const active = MOCK_DELIVERIES.find((d) => d.status === "accepted");
  if (!active) return null;

  return (
    <div className="mx-4 mb-5">
      <h3 className="font-bold text-pick-text text-sm mb-3 flex items-center gap-2">
        <Bike size={16} className="text-sky-500" />
        진행 중인 배달
      </h3>
      <div className="bg-white rounded-3xl border-2 border-sky-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-sky-500 to-blue-400 px-4 py-2.5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-white text-xs font-black">픽업 이동 중 🛵</span>
        </div>
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{active.storeEmoji}</span>
            <div>
              <p className="font-black text-pick-text">{active.storeName}</p>
              <p className="text-xs text-pick-text-sub">{active.storeAddress}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-sky-50 rounded-2xl px-3 py-2.5 mb-3">
            <MapPin size={14} className="text-sky-600 flex-shrink-0" />
            <p className="text-xs text-pick-text">{active.customerAddress}</p>
          </div>
          <div className="flex items-center justify-between text-xs text-pick-text-sub">
            <span>{active.items}</span>
            <span className="font-black text-sky-600">+{active.pickEarning.toLocaleString()} PICK</span>
          </div>
        </div>
        <div className="px-4 pb-4">
          <Link
            href="/rider/delivery"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-sky-500 text-white font-bold text-sm active:scale-95 transition-transform"
          >
            <Navigation size={15} />
            배달 현황 보기
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ────────────── 주간 수익 차트 ────────────── */
function WeeklyChart() {
  const max = Math.max(...WEEKLY_RIDER_EARNINGS.map((d) => d.pick));

  return (
    <div className="mx-4 mb-5 bg-white rounded-3xl border-2 border-pick-border p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={18} className="text-sky-500" />
        <h3 className="font-bold text-pick-text text-sm">주간 수익 현황</h3>
      </div>
      <div className="flex items-end gap-2 h-28">
        {WEEKLY_RIDER_EARNINGS.map((d) => {
          const heightPct = Math.round((d.pick / max) * 100);
          const isToday = d.day === "오늘";
          return (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
              {isToday && (
                <span className="text-[9px] font-black text-sky-600">
                  {(d.pick / 1000).toFixed(1)}k
                </span>
              )}
              <div className="w-full flex flex-col justify-end" style={{ height: "90px" }}>
                <div
                  className={`w-full rounded-t-xl ${
                    isToday ? "bg-gradient-to-t from-sky-500 to-blue-400" : "bg-sky-100"
                  }`}
                  style={{ height: `${heightPct}%` }}
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

/* ────────────── 새 배달 요청 알림 ────────────── */
function NewRequestAlert() {
  const waiting = MOCK_DELIVERIES.filter((d) => d.status === "waiting");
  if (waiting.length === 0) return null;

  return (
    <div className="mx-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Bike size={16} className="text-sky-500" />
        <h3 className="font-bold text-pick-text text-sm">새 배달 요청</h3>
        <span className="text-xs bg-red-500 text-white font-black px-2 py-0.5 rounded-full">
          {waiting.length}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {waiting.map((d) => (
          <Link
            key={d.id}
            href="/rider/delivery"
            className="flex items-center gap-4 bg-blue-50 border-2 border-blue-200 rounded-3xl px-4 py-4 active:scale-95 transition-transform"
          >
            <span className="text-3xl">{d.storeEmoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-black text-pick-text text-sm">{d.storeName}</p>
              <p className="text-xs text-pick-text-sub mt-0.5 truncate">{d.items}</p>
              <p className="text-xs font-bold text-sky-600 mt-1">
                {d.distance} · {d.estimatedMinutes}분 · +{d.pickEarning.toLocaleString()} PICK
              </p>
            </div>
            <span className="text-xs font-bold text-sky-600 bg-sky-100 px-3 py-1.5 rounded-full flex-shrink-0">
              수락하기
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ────────────── 페이지 ────────────── */
export default function RiderDashboardPage() {
  return (
    <div className="min-h-full py-5">
      <div className="px-4 mb-5">
        <h1 className="font-black text-pick-text text-xl">안녕하세요, 라이더님! 🛵</h1>
        <p className="text-sm text-pick-text-sub mt-0.5">오늘도 안전하게 달려요!</p>
      </div>

      <NewRequestAlert />
      <ActiveDelivery />
      <SummaryCards />
      <TodayEarning />
      <WeeklyChart />
    </div>
  );
}

function Navigation({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="3 11 22 2 13 21 11 13 3 11" />
    </svg>
  );
}

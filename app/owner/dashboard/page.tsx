import { ClipboardList, TrendingUp, Bell, Star, CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import { TODAY_SUMMARY, WEEKLY_REVENUE, MOCK_ORDERS } from "@/lib/mock/orders";

/* ────────────── 오늘 현황 카드 ────────────── */
function SummaryCards() {
  const stats = [
    {
      label: "신규 주문",
      value: TODAY_SUMMARY.newOrders,
      unit: "건",
      icon: <ClipboardList size={20} />,
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
      iconBg: "bg-amber-100",
    },
    {
      label: "진행 중",
      value: TODAY_SUMMARY.inProgress,
      unit: "건",
      icon: <Clock size={20} />,
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
      iconBg: "bg-blue-100",
    },
    {
      label: "완료",
      value: TODAY_SUMMARY.completed,
      unit: "건",
      icon: <CheckCircle size={20} />,
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
      iconBg: "bg-green-100",
    },
    {
      label: "취소",
      value: TODAY_SUMMARY.cancelled,
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

/* ────────────── 오늘 매출 카드 ────────────── */
function TodayRevenue() {
  return (
    <div className="mx-4 mb-5 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-400 p-5 text-white shadow-lg">
      <p className="text-sm text-white/80 font-medium mb-1">오늘 총 매출 💰</p>
      <div className="flex items-end gap-2 mb-4">
        <span className="text-4xl font-black">
          {TODAY_SUMMARY.totalRevenue.toLocaleString()}
        </span>
        <span className="text-lg font-bold text-white/90 mb-1">원</span>
      </div>
      <div className="flex items-center justify-between bg-white/20 rounded-2xl px-4 py-2.5">
        <span className="text-xs text-white/80">획득 PICK 토큰</span>
        <span className="text-sm font-black">+{TODAY_SUMMARY.pickEarned} PICK</span>
      </div>
    </div>
  );
}

/* ────────────── 주간 매출 바 차트 ────────────── */
function WeeklyChart() {
  const max = Math.max(...WEEKLY_REVENUE.map((d) => d.amount));

  return (
    <div className="mx-4 mb-5 bg-white rounded-3xl border-2 border-pick-border p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={18} className="text-amber-500" />
        <h3 className="font-bold text-pick-text text-sm">주간 매출 현황</h3>
      </div>
      <div className="flex items-end gap-2 h-24">
        {WEEKLY_REVENUE.map((d) => {
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
                  style={{ height: `${heightPct}%` }}
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

/* ────────────── 신규 주문 알림 ────────────── */
function NewOrderAlerts() {
  const newOrders = MOCK_ORDERS.filter((o) => o.status === "pending");

  if (newOrders.length === 0) return null;

  return (
    <div className="mx-4 mb-5">
      <div className="flex items-center gap-2 mb-3">
        <Bell size={16} className="text-amber-500" />
        <h3 className="font-bold text-pick-text text-sm">신규 주문 알림</h3>
        <span className="text-xs bg-red-500 text-white font-black px-2 py-0.5 rounded-full">
          {newOrders.length}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {newOrders.map((order) => (
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

/* ────────────── 최근 리뷰 미리보기 ────────────── */
function RecentReviews() {
  const reviews = [
    { name: "김○○", rating: 5, content: "치킨이 너무 바삭하고 맛있어요! 양도 많고 자주 시킬게요 😊", time: "1시간 전" },
    { name: "이○○", rating: 4, content: "맛은 좋은데 배달이 조금 늦었어요. 다음엔 더 빨리 해주세요!", time: "3시간 전" },
  ];

  return (
    <div className="mx-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Star size={16} className="text-amber-500" />
        <h3 className="font-bold text-pick-text text-sm">최근 리뷰</h3>
      </div>
      <div className="flex flex-col gap-3">
        {reviews.map((r, i) => (
          <div key={i} className="bg-white border-2 border-pick-border rounded-3xl px-4 py-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-pick-text text-sm">{r.name}</span>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star
                      key={si}
                      size={12}
                      className={si < r.rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}
                    />
                  ))}
                </div>
              </div>
              <span className="text-xs text-pick-text-sub">{r.time}</span>
            </div>
            <p className="text-xs text-pick-text leading-relaxed">{r.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────────── 페이지 ────────────── */
export default function OwnerDashboardPage() {
  return (
    <div className="min-h-full py-5">
      <div className="px-4 mb-5">
        <h1 className="font-black text-pick-text text-xl">안녕하세요, 사장님! 👋</h1>
        <p className="text-sm text-pick-text-sub mt-0.5">오늘도 맛있는 하루 보내세요 🍗</p>
      </div>

      <NewOrderAlerts />
      <SummaryCards />
      <TodayRevenue />
      <WeeklyChart />
      <RecentReviews />
    </div>
  );
}

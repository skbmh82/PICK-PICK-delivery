import { TrendingUp, Wallet, CalendarDays, Download } from "lucide-react";
import { WEEKLY_REVENUE } from "@/lib/mock/orders";

/* ────────────── 정산 가능 잔액 ────────────── */
function SettlementBalance() {
  return (
    <div className="mx-4 mb-5 rounded-3xl bg-gradient-to-br from-amber-500 to-orange-400 p-5 text-white shadow-lg">
      <p className="text-sm text-white/80 font-medium mb-1">정산 가능 잔액 💰</p>
      <div className="flex items-end gap-2 mb-4">
        <span className="text-4xl font-black">124,500</span>
        <span className="text-lg font-bold text-white/90 mb-1">PICK</span>
      </div>
      <button className="w-full bg-white text-amber-600 font-black py-3 rounded-2xl text-sm active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-sm">
        <Download size={16} />
        정산 신청하기
      </button>
    </div>
  );
}

/* ────────────── 기간별 탭 매출 ────────────── */
function RevenueSummary() {
  const periodStats = [
    { label: "오늘",  amount: 52500,   orders: 4 },
    { label: "이번 주", amount: 996500, orders: 58 },
    { label: "이번 달", amount: 3840000, orders: 214 },
  ];

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
              <p className="font-black text-amber-600 text-xl">{s.orders}<span className="text-sm ml-0.5">건</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────────── 주간 막대 차트 ────────────── */
function WeeklyChart() {
  const max = Math.max(...WEEKLY_REVENUE.map((d) => d.amount));

  return (
    <div className="mx-4 mb-5 bg-white rounded-3xl border-2 border-pick-border p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={18} className="text-amber-500" />
        <h3 className="font-bold text-pick-text text-sm">주간 매출 추이</h3>
      </div>
      <div className="flex items-end gap-2 h-32">
        {WEEKLY_REVENUE.map((d) => {
          const heightPct = Math.round((d.amount / max) * 100);
          const isToday = d.day === "오늘";
          return (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5">
              {isToday && (
                <span className="text-[9px] font-black text-amber-600">
                  {(d.amount / 1000).toFixed(0)}k
                </span>
              )}
              <div className="w-full flex flex-col justify-end" style={{ height: "100px" }}>
                <div
                  className={`w-full rounded-t-xl ${
                    isToday
                      ? "bg-gradient-to-t from-amber-500 to-orange-300"
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

/* ────────────── 정산 내역 ────────────── */
function SettlementHistory() {
  const history = [
    { date: "2026.03.31", amount: 3840000, status: "완료", statusColor: "text-green-600 bg-green-50" },
    { date: "2026.02.28", amount: 3210000, status: "완료", statusColor: "text-green-600 bg-green-50" },
    { date: "2026.01.31", amount: 2980000, status: "완료", statusColor: "text-green-600 bg-green-50" },
  ];

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
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${h.statusColor}`}>
              {h.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ────────────── 페이지 ────────────── */
export default function OwnerSettlementPage() {
  return (
    <div className="min-h-full py-5">
      <div className="px-4 mb-5">
        <h1 className="font-black text-pick-text text-xl">정산 / 매출 💰</h1>
        <p className="text-sm text-pick-text-sub mt-0.5">매출 현황과 정산을 관리하세요</p>
      </div>

      <SettlementBalance />
      <RevenueSummary />
      <WeeklyChart />
      <SettlementHistory />
    </div>
  );
}

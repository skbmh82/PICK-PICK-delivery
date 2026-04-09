import { TrendingUp, Wallet, Download, Bike, CheckCircle } from "lucide-react";
import { WEEKLY_RIDER_EARNINGS, RIDER_SETTLEMENT_HISTORY, MOCK_DELIVERIES } from "@/lib/mock/rider";

/* ────────────── 정산 가능 잔액 ────────────── */
function EarningBalance() {
  return (
    <div className="mx-4 mb-5 rounded-3xl bg-gradient-to-br from-sky-600 to-blue-500 p-5 text-white shadow-lg">
      <p className="text-sm text-white/80 font-medium mb-1">정산 가능 잔액 💙</p>
      <div className="flex items-end gap-2 mb-4">
        <span className="text-4xl font-black">195,000</span>
        <span className="text-lg font-bold text-white/90 mb-1">PICK</span>
      </div>
      <button className="w-full bg-white text-sky-600 font-black py-3 rounded-2xl text-sm active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-sm">
        <Download size={16} />
        정산 신청하기
      </button>
    </div>
  );
}

/* ────────────── 기간별 수익 ────────────── */
function EarningSummary() {
  const stats = [
    { label: "오늘", pick: 5700, count: 2 },
    { label: "이번 주", pick: 200700, count: 76 },
    { label: "이번 달", pick: 721000, count: 287 },
  ];

  return (
    <div className="mx-4 mb-5">
      <h3 className="font-bold text-pick-text text-sm mb-3 flex items-center gap-2">
        <Wallet size={16} className="text-sky-500" />
        기간별 수익
      </h3>
      <div className="flex flex-col gap-3">
        {stats.map((s) => (
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
              <p className="font-black text-sky-600 text-xl">{s.count}<span className="text-sm ml-0.5">건</span></p>
            </div>
          </div>
        ))}
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
        <h3 className="font-bold text-pick-text text-sm">주간 수익 추이</h3>
      </div>
      <div className="flex items-end gap-2 h-32">
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
              <div className="w-full flex flex-col justify-end" style={{ height: "100px" }}>
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

/* ────────────── 오늘 배달 내역 ────────────── */
function TodayDeliveries() {
  const completed = MOCK_DELIVERIES.filter((d) => d.status === "delivered");

  return (
    <div className="mx-4 mb-5">
      <h3 className="font-bold text-pick-text text-sm mb-3 flex items-center gap-2">
        <Bike size={16} className="text-sky-500" />
        오늘 배달 내역
      </h3>
      {completed.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-pick-border p-8 flex flex-col items-center text-pick-text-sub shadow-sm">
          <p className="text-sm font-medium">오늘 완료된 배달이 없어요</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border-2 border-pick-border overflow-hidden shadow-sm divide-y divide-pick-border">
          {completed.map((d) => (
            <div key={d.id} className="flex items-center gap-4 px-5 py-4">
              <span className="text-2xl flex-shrink-0">{d.storeEmoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-pick-text text-sm">{d.storeName}</p>
                <p className="text-xs text-pick-text-sub mt-0.5 truncate">{d.customerAddress}</p>
                <p className="text-xs text-pick-text-sub mt-0.5">{d.requestedAt} · {d.distance}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1 mb-1">
                  <CheckCircle size={11} className="text-green-500" />
                  <span className="text-xs text-green-600 font-bold">완료</span>
                </div>
                <span className="font-black text-sky-600 text-sm">+{d.pickEarning.toLocaleString()}P</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ────────────── 정산 내역 ────────────── */
function SettlementHistory() {
  return (
    <div className="mx-4 mb-4">
      <h3 className="font-bold text-pick-text text-sm mb-3 flex items-center gap-2">
        <Download size={16} className="text-sky-500" />
        정산 내역
      </h3>
      <div className="bg-white rounded-3xl border-2 border-pick-border overflow-hidden shadow-sm divide-y divide-pick-border">
        {RIDER_SETTLEMENT_HISTORY.map((h, i) => (
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

/* ────────────── 페이지 ────────────── */
export default function RiderEarningsPage() {
  return (
    <div className="min-h-full py-5">
      <div className="px-4 mb-5">
        <h1 className="font-black text-pick-text text-xl">수익 내역 💙</h1>
        <p className="text-sm text-pick-text-sub mt-0.5">수익 현황과 정산을 확인하세요</p>
      </div>

      <EarningBalance />
      <EarningSummary />
      <WeeklyChart />
      <TodayDeliveries />
      <SettlementHistory />
    </div>
  );
}

"use client";

import { useState } from "react";
import { MapPin, Package, CheckCircle, X, Clock, Bike } from "lucide-react";
import { MOCK_DELIVERIES, type MockDelivery, type DeliveryStatus } from "@/lib/mock/rider";

/* ────────────── 상태 설정 ────────────── */
const STATUS_CONFIG: Record<DeliveryStatus, { label: string; color: string; bg: string; border: string }> = {
  waiting:   { label: "수락 대기", color: "text-blue-600",  bg: "bg-blue-50",  border: "border-blue-200" },
  accepted:  { label: "픽업 이동", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  picked_up: { label: "배달 중",  color: "text-sky-600",   bg: "bg-sky-50",   border: "border-sky-200" },
  delivered: { label: "배달 완료", color: "text-gray-400",  bg: "bg-gray-50",  border: "border-gray-200" },
  rejected:  { label: "거절",     color: "text-gray-400",  bg: "bg-gray-50",  border: "border-gray-100" },
};

/* ────────────── 배달 요청 카드 ────────────── */
function DeliveryCard({
  delivery,
  onAccept,
  onReject,
  onPickup,
  onComplete,
}: {
  delivery: MockDelivery;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onPickup: (id: string) => void;
  onComplete: (id: string) => void;
}) {
  const cfg = STATUS_CONFIG[delivery.status];
  const isDone = delivery.status === "delivered" || delivery.status === "rejected";

  return (
    <div className={`bg-white rounded-3xl border-2 ${cfg.border} shadow-sm overflow-hidden`}>
      {/* 헤더 */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-black px-3 py-1.5 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
              {cfg.label}
            </span>
            <span className="text-xs text-pick-text-sub">{delivery.requestedAt}</span>
          </div>
          <span className="font-black text-sky-600 text-sm">
            +{delivery.pickEarning.toLocaleString()} PICK
          </span>
        </div>

        {/* 거리/시간 뱃지 */}
        <div className="flex gap-2 mb-3">
          <span className="flex items-center gap-1 text-xs bg-sky-50 border border-sky-200 text-sky-700 font-bold px-3 py-1.5 rounded-full">
            <Bike size={11} />
            {delivery.distance}
          </span>
          <span className="flex items-center gap-1 text-xs bg-pick-bg border border-pick-border text-pick-text-sub font-medium px-3 py-1.5 rounded-full">
            <Clock size={11} />
            약 {delivery.estimatedMinutes}분
          </span>
        </div>

        {/* 픽업 위치 */}
        <div className="flex items-start gap-2 mb-2">
          <div className="flex flex-col items-center gap-1 flex-shrink-0 mt-0.5">
            <span className="text-xl">{delivery.storeEmoji}</span>
            <div className="w-0.5 h-5 bg-pick-border" />
            <MapPin size={16} className="text-sky-500" />
          </div>
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <div>
              <p className="text-xs text-pick-text-sub font-medium">픽업</p>
              <p className="font-bold text-pick-text text-sm">{delivery.storeName}</p>
              <p className="text-xs text-pick-text-sub truncate">{delivery.storeAddress}</p>
            </div>
            <div>
              <p className="text-xs text-pick-text-sub font-medium">배달</p>
              <p className="text-xs text-pick-text truncate">{delivery.customerAddress}</p>
            </div>
          </div>
        </div>

        {/* 주문 요약 */}
        <div className="bg-pick-bg rounded-2xl px-3 py-2.5 mb-3">
          <p className="text-xs text-pick-text-sub">{delivery.items}</p>
          <p className="text-xs font-bold text-pick-text mt-0.5">
            주문 금액 {delivery.totalAmount.toLocaleString()}원
          </p>
        </div>

        {/* 액션 버튼 */}
        {delivery.status === "waiting" && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onReject(delivery.id)}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-red-200 bg-red-50 text-red-600 font-bold text-sm active:scale-95 transition-transform"
            >
              <X size={15} />
              거절
            </button>
            <button
              onClick={() => onAccept(delivery.id)}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-400 text-white font-bold text-sm active:scale-95 transition-transform shadow-md"
            >
              <Bike size={15} />
              수락
            </button>
          </div>
        )}

        {delivery.status === "accepted" && (
          <button
            onClick={() => onPickup(delivery.id)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-amber-500 text-white font-bold text-sm active:scale-95 transition-transform shadow-md"
          >
            <Package size={15} />
            픽업 완료
          </button>
        )}

        {delivery.status === "picked_up" && (
          <button
            onClick={() => onComplete(delivery.id)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-green-500 text-white font-bold text-sm active:scale-95 transition-transform shadow-md"
          >
            <CheckCircle size={15} />
            배달 완료
          </button>
        )}

        {delivery.status === "delivered" && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
            <CheckCircle size={16} className="text-green-500" />
            <span className="text-sm font-bold text-green-600">배달 완료! +{delivery.pickEarning.toLocaleString()} PICK 적립</span>
          </div>
        )}

        {delivery.status === "rejected" && (
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
            <X size={16} className="text-gray-400" />
            <span className="text-sm font-bold text-gray-400">거절한 배달</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ────────────── 탭 ────────────── */
type Tab = "active" | "done";

/* ────────────── 메인 페이지 ────────────── */
export default function RiderDeliveryPage() {
  const [deliveries, setDeliveries] = useState<MockDelivery[]>(MOCK_DELIVERIES);
  const [tab, setTab] = useState<Tab>("active");

  const handleAccept = (id: string) =>
    setDeliveries((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "accepted" as DeliveryStatus } : d))
    );

  const handleReject = (id: string) =>
    setDeliveries((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "rejected" as DeliveryStatus } : d))
    );

  const handlePickup = (id: string) =>
    setDeliveries((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "picked_up" as DeliveryStatus } : d))
    );

  const handleComplete = (id: string) =>
    setDeliveries((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "delivered" as DeliveryStatus } : d))
    );

  const activeList = deliveries.filter(
    (d) => d.status === "waiting" || d.status === "accepted" || d.status === "picked_up"
  );
  const doneList = deliveries.filter(
    (d) => d.status === "delivered" || d.status === "rejected"
  );

  const waitingCount = deliveries.filter((d) => d.status === "waiting").length;

  return (
    <div className="min-h-full py-5">
      <div className="px-4 mb-4">
        <h1 className="font-black text-pick-text text-xl">배달 하기 🛵</h1>
        <p className="text-sm text-pick-text-sub mt-0.5">요청을 수락하고 배달을 완료하세요</p>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 px-4 mb-4">
        <button
          onClick={() => setTab("active")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all ${
            tab === "active"
              ? "bg-sky-500 text-white shadow-md"
              : "bg-white text-pick-text-sub border-2 border-pick-border"
          }`}
        >
          진행 중
          {waitingCount > 0 && (
            <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
              tab === "active" ? "bg-white/30 text-white" : "bg-red-500 text-white"
            }`}>
              {waitingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("done")}
          className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all ${
            tab === "done"
              ? "bg-sky-500 text-white shadow-md"
              : "bg-white text-pick-text-sub border-2 border-pick-border"
          }`}
        >
          완료 / 거절
        </button>
      </div>

      {/* 목록 */}
      <div className="px-4 flex flex-col gap-3">
        {tab === "active" ? (
          activeList.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-pick-text-sub">
              <span className="text-5xl mb-3">🎉</span>
              <p className="text-sm font-medium">모든 배달이 완료됐어요!</p>
              <p className="text-xs mt-1 opacity-70">새 요청을 기다리는 중...</p>
            </div>
          ) : (
            activeList.map((d) => (
              <DeliveryCard
                key={d.id}
                delivery={d}
                onAccept={handleAccept}
                onReject={handleReject}
                onPickup={handlePickup}
                onComplete={handleComplete}
              />
            ))
          )
        ) : (
          doneList.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-pick-text-sub">
              <span className="text-5xl mb-3">📋</span>
              <p className="text-sm font-medium">완료된 배달이 없어요</p>
            </div>
          ) : (
            doneList.map((d) => (
              <DeliveryCard
                key={d.id}
                delivery={d}
                onAccept={handleAccept}
                onReject={handleReject}
                onPickup={handlePickup}
                onComplete={handleComplete}
              />
            ))
          )
        )}
      </div>
    </div>
  );
}

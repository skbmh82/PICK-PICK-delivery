"use client";

import { ClipboardList, Clock, CheckCircle, Bike } from "lucide-react";
import Link from "next/link";
import { useOrderStore } from "@/stores/orderStore";

/* ────────────── 진행 중 주문 카드 ────────────── */
function ActiveOrderCard() {
  const lastOrder = useOrderStore((s) => s.lastOrder);

  if (!lastOrder) return null;

  return (
    <div className="bg-white rounded-3xl border-2 border-pick-purple/30 shadow-sm overflow-hidden">
      {/* 상태 바 */}
      <div className="bg-gradient-to-r from-pick-purple to-pick-purple-light px-4 py-2.5 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
        <span className="text-white text-xs font-black">조리 중 🍳</span>
      </div>

      <div className="px-4 py-4">
        {/* 가게명 */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-3xl">{lastOrder.storeEmoji}</span>
          <div>
            <p className="font-black text-pick-text">{lastOrder.storeName}</p>
            <p className="text-xs text-pick-text-sub">{lastOrder.placedAt} 주문</p>
          </div>
        </div>

        {/* 주문 아이템 요약 */}
        <p className="text-sm text-pick-text-sub mb-3">
          {lastOrder.items.map((i) => `${i.menuName} x${i.quantity}`).join(", ")}
        </p>

        {/* 진행 단계 */}
        <div className="flex items-center gap-1 mb-4">
          {[
            { label: "주문확인", done: true },
            { label: "조리중", done: true, active: true },
            { label: "배달중", done: false },
            { label: "완료", done: false },
          ].map((step, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black mb-1 ${
                  step.active
                    ? "bg-pick-purple text-white ring-2 ring-pick-purple/30"
                    : step.done
                    ? "bg-pick-purple-light text-white"
                    : "bg-pick-bg border-2 border-pick-border text-pick-text-sub"
                }`}>
                  {step.done ? "✓" : i + 1}
                </div>
                <span className={`text-[9px] font-bold ${step.active ? "text-pick-purple" : "text-pick-text-sub"}`}>
                  {step.label}
                </span>
              </div>
              {i < 3 && (
                <div className={`h-0.5 flex-1 -mt-4 ${step.done && !step.active ? "bg-pick-purple-light" : "bg-pick-border"}`} />
              )}
            </div>
          ))}
        </div>

        {/* 배달 정보 */}
        <div className="flex items-center gap-4 text-xs text-pick-text-sub">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            약 {lastOrder.estimatedMinutes}분 예상
          </span>
          <span className="flex items-center gap-1">
            <Bike size={12} />
            {lastOrder.deliveryAddress}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ────────────── 완료 주문 카드 ────────────── */
function CompletedOrderCard() {
  const lastOrder = useOrderStore((s) => s.lastOrder);

  if (!lastOrder) return null;

  return (
    <div className="bg-white rounded-3xl border-2 border-pick-border shadow-sm px-4 py-4">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{lastOrder.storeEmoji}</span>
        <div className="flex-1">
          <p className="font-black text-pick-text text-sm">{lastOrder.storeName}</p>
          <p className="text-xs text-pick-text-sub">{lastOrder.placedAt}</p>
        </div>
        <div className="flex items-center gap-1 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
          <CheckCircle size={11} className="text-green-500" />
          <span className="text-xs font-bold text-green-600">완료</span>
        </div>
      </div>
      <p className="text-xs text-pick-text-sub mb-2">
        {lastOrder.items.map((i) => `${i.menuName} x${i.quantity}`).join(", ")}
      </p>
      <div className="flex items-center justify-between">
        <span className="font-black text-pick-text">{lastOrder.totalPaid.toLocaleString()}원</span>
        <button className="text-xs font-bold text-pick-purple bg-pick-bg border border-pick-border px-3 py-1.5 rounded-full">
          재주문
        </button>
      </div>
    </div>
  );
}

/* ────────────── 메인 페이지 ────────────── */
export default function OrdersPage() {
  const lastOrder = useOrderStore((s) => s.lastOrder);

  return (
    <div className="min-h-full px-4 py-6">
      <h1 className="font-black text-pick-text text-xl mb-6">PICK 주문 📋</h1>

      {/* 진행 중인 주문 */}
      <section className="mb-5">
        <h2 className="font-bold text-pick-text text-sm mb-3 px-1">진행 중인 주문</h2>
        {lastOrder ? (
          <ActiveOrderCard />
        ) : (
          <div className="bg-white rounded-3xl border-2 border-pick-border p-10 flex flex-col items-center text-pick-text-sub shadow-sm">
            <span className="text-5xl mb-3">🛵</span>
            <p className="text-sm font-medium">진행 중인 주문이 없어요</p>
          </div>
        )}
      </section>

      {/* 주문 내역 */}
      <section>
        <h2 className="font-bold text-pick-text text-sm mb-3 px-1">주문 내역</h2>
        {lastOrder ? (
          <CompletedOrderCard />
        ) : (
          <div className="bg-white rounded-3xl border-2 border-pick-border p-10 flex flex-col items-center text-pick-text-sub shadow-sm">
            <ClipboardList size={44} className="mb-3 opacity-20" />
            <p className="text-sm font-medium">아직 주문 내역이 없어요</p>
            <p className="text-xs mt-1 opacity-70">첫 주문을 시작해보세요!</p>
            <Link
              href="/home"
              className="mt-4 bg-pick-purple text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-pick-purple-dark active:scale-95 transition-all"
            >
              음식 주문하러 가기
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

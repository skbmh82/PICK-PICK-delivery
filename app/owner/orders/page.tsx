"use client";

import { useState } from "react";
import { Check, X, ChefHat, Clock, Bike, CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { MOCK_ORDERS, STATUS_LABEL, type MockOrder, type OrderStatus } from "@/lib/mock/orders";

/* ────────────── 상태 설정 ────────────── */
const STATUS_CONFIG: Record<OrderStatus, { color: string; bg: string; border: string }> = {
  pending:    { color: "text-red-600",    bg: "bg-red-50",    border: "border-red-200" },
  confirmed:  { color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-200" },
  preparing:  { color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-200" },
  ready:      { color: "text-green-600",  bg: "bg-green-50",  border: "border-green-200" },
  picked_up:  { color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
  delivering: { color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
  delivered:  { color: "text-gray-500",   bg: "bg-gray-50",   border: "border-gray-200" },
  cancelled:  { color: "text-gray-400",   bg: "bg-gray-50",   border: "border-gray-100" },
};

/* ────────────── 주문 카드 ────────────── */
function OrderCard({
  order,
  onAccept,
  onReject,
  onComplete,
}: {
  order: MockOrder;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onComplete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(order.status === "pending");
  const cfg = STATUS_CONFIG[order.status];
  const isCompleted = order.status === "delivered" || order.status === "cancelled";

  return (
    <div className={`bg-white rounded-3xl border-2 ${cfg.border} shadow-sm overflow-hidden`}>
      {/* 헤더 */}
      <button
        className="w-full flex items-center justify-between px-4 pt-4 pb-3"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          {/* 상태 뱃지 */}
          <span className={`text-xs font-black px-3 py-1.5 rounded-full ${cfg.bg} ${cfg.color} ${cfg.border} border`}>
            {STATUS_LABEL[order.status]}
          </span>
          <div className="text-left">
            <p className="font-black text-pick-text text-sm">{order.customerName}님</p>
            <p className="text-xs text-pick-text-sub">{order.createdAt} 주문</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-black text-pick-text text-sm">
            {order.totalAmount.toLocaleString()}원
          </span>
          {expanded ? (
            <ChevronUp size={16} className="text-pick-text-sub" />
          ) : (
            <ChevronDown size={16} className="text-pick-text-sub" />
          )}
        </div>
      </button>

      {/* 상세 (접힘/펼침) */}
      {expanded && (
        <div className="px-4 pb-4">
          {/* 주문 아이템 */}
          <div className={`${cfg.bg} rounded-2xl px-4 py-3 mb-3`}>
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-1">
                <span className="text-sm text-pick-text">
                  {item.name} <span className="text-pick-text-sub">x{item.quantity}</span>
                </span>
                <span className="text-sm font-bold text-pick-text">
                  {(item.price * item.quantity).toLocaleString()}원
                </span>
              </div>
            ))}
            <div className="border-t border-dashed border-pick-border mt-2 pt-2 flex items-center justify-between">
              <span className="text-xs text-pick-text-sub">배달비</span>
              <span className="text-xs text-pick-text-sub">
                {order.deliveryFee === 0 ? "무료" : `+${order.deliveryFee.toLocaleString()}원`}
              </span>
            </div>
            {order.pickUsed > 0 && (
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-pick-text-sub">PICK 사용</span>
                <span className="text-xs text-purple-600 font-bold">-{order.pickUsed.toLocaleString()}원</span>
              </div>
            )}
          </div>

          {/* 배달 정보 */}
          <div className="flex flex-col gap-1.5 mb-4">
            <div className="flex items-start gap-2">
              <Bike size={13} className="text-pick-text-sub mt-0.5 flex-shrink-0" />
              <p className="text-xs text-pick-text">{order.deliveryAddress}</p>
            </div>
            {order.deliveryNote && (
              <div className="flex items-start gap-2">
                <span className="text-xs text-pick-text-sub flex-shrink-0">📝</span>
                <p className="text-xs text-pick-text-sub">{order.deliveryNote}</p>
              </div>
            )}
          </div>

          {/* 액션 버튼 */}
          {order.status === "pending" && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onReject(order.id)}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-red-200 bg-red-50 text-red-600 font-bold text-sm active:scale-95 transition-transform"
              >
                <X size={16} />
                거절
              </button>
              <button
                onClick={() => onAccept(order.id)}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-400 text-white font-bold text-sm active:scale-95 transition-transform shadow-md"
              >
                <Check size={16} />
                수락
              </button>
            </div>
          )}

          {order.status === "confirmed" && (
            <button
              onClick={() => onComplete(order.id)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-blue-500 text-white font-bold text-sm active:scale-95 transition-transform shadow-md"
            >
              <ChefHat size={16} />
              조리 시작
            </button>
          )}

          {order.status === "preparing" && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-amber-500 animate-spin" style={{ animationDuration: "3s" }} />
                <span className="text-xs text-amber-600 font-bold">조리 중...</span>
              </div>
              <button
                onClick={() => onComplete(order.id)}
                className="flex items-center gap-2 py-2.5 px-5 rounded-2xl bg-green-500 text-white font-bold text-sm active:scale-95 transition-transform shadow-md"
              >
                <ChefHat size={14} />
                조리 완료
              </button>
            </div>
          )}

          {order.status === "ready" && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
              <CheckCircle size={16} className="text-green-600" />
              <span className="text-sm font-bold text-green-700">조리 완료 — 라이더 배정 중</span>
            </div>
          )}

          {order.status === "delivered" && (
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
              <CheckCircle size={16} className="text-gray-400" />
              <span className="text-sm font-bold text-gray-500">배달 완료</span>
            </div>
          )}

          {order.status === "cancelled" && (
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
              <XCircle size={16} className="text-gray-400" />
              <span className="text-sm font-bold text-gray-500">취소된 주문</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ────────────── 탭 필터 ────────────── */
type Tab = "active" | "done";

/* ────────────── 메인 페이지 ────────────── */
export default function OwnerOrdersPage() {
  const [orders, setOrders] = useState<MockOrder[]>(MOCK_ORDERS);
  const [tab, setTab] = useState<Tab>("active");

  const handleAccept = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "confirmed" as OrderStatus } : o))
    );
  };

  const handleReject = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: "cancelled" as OrderStatus } : o))
    );
  };

  const handleComplete = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        if (o.status === "confirmed") return { ...o, status: "preparing" as OrderStatus };
        if (o.status === "preparing") return { ...o, status: "ready" as OrderStatus };
        return o;
      })
    );
  };

  const activeOrders = orders.filter(
    (o) => !["delivered", "cancelled"].includes(o.status)
  );
  const doneOrders = orders.filter(
    (o) => o.status === "delivered" || o.status === "cancelled"
  );

  const pendingCount = orders.filter((o) => o.status === "pending").length;

  return (
    <div className="min-h-full py-5">
      <div className="px-4 mb-4">
        <h1 className="font-black text-pick-text text-xl">주문 관리 📋</h1>
        <p className="text-sm text-pick-text-sub mt-0.5">
          실시간으로 주문을 확인하고 처리하세요
        </p>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 px-4 mb-4">
        <button
          onClick={() => setTab("active")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all ${
            tab === "active"
              ? "bg-amber-500 text-white shadow-md"
              : "bg-white text-pick-text-sub border-2 border-pick-border"
          }`}
        >
          진행 중
          {pendingCount > 0 && (
            <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
              tab === "active" ? "bg-white/30 text-white" : "bg-red-500 text-white"
            }`}>
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("done")}
          className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all ${
            tab === "done"
              ? "bg-amber-500 text-white shadow-md"
              : "bg-white text-pick-text-sub border-2 border-pick-border"
          }`}
        >
          완료 / 취소
        </button>
      </div>

      {/* 주문 목록 */}
      <div className="px-4 flex flex-col gap-3">
        {tab === "active" ? (
          activeOrders.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-pick-text-sub">
              <span className="text-5xl mb-3">🎉</span>
              <p className="text-sm font-medium">모든 주문이 처리됐어요!</p>
            </div>
          ) : (
            activeOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onAccept={handleAccept}
                onReject={handleReject}
                onComplete={handleComplete}
              />
            ))
          )
        ) : (
          doneOrders.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-pick-text-sub">
              <span className="text-5xl mb-3">📋</span>
              <p className="text-sm font-medium">완료된 주문이 없어요</p>
            </div>
          ) : (
            doneOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onAccept={handleAccept}
                onReject={handleReject}
                onComplete={handleComplete}
              />
            ))
          )
        )}
      </div>
    </div>
  );
}

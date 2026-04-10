"use client";

import { useEffect, useState, useCallback } from "react";
import { ClipboardList, Clock, Bike, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useOrderStore } from "@/stores/orderStore";
import { useOrderRealtime, type OrderStatus } from "@/hooks/useRealtime";
import { getCategoryEmoji } from "@/lib/utils/categoryEmoji";

// ── 타입 ──────────────────────────────────────────────
interface OrderItem {
  id: string;
  menu_name: string;
  price: number;
  quantity: number;
}

interface OrderStore {
  id: string;
  name: string;
  image_url: string | null;
  category: string;
}

interface Order {
  id: string;
  status: OrderStatus;
  total_amount: number;
  delivery_fee: number;
  pick_used: number;
  pick_reward: number;
  delivery_address: string;
  estimated_time: number;
  created_at: string;
  stores: OrderStore | null;
  order_items: OrderItem[];
}

// ── 상태 레이블 / 색상 ────────────────────────────────
const STATUS_CONFIG: Record<OrderStatus, { label: string; emoji: string; color: string; bg: string }> = {
  pending:    { label: "결제 확인 중",    emoji: "⏳", color: "text-yellow-600",  bg: "bg-yellow-50 border-yellow-200" },
  confirmed:  { label: "주문 수락됨",     emoji: "✅", color: "text-blue-600",    bg: "bg-blue-50 border-blue-200" },
  preparing:  { label: "조리 중",         emoji: "🍳", color: "text-orange-600",  bg: "bg-orange-50 border-orange-200" },
  ready:      { label: "픽업 대기 중",    emoji: "📦", color: "text-purple-600",  bg: "bg-purple-50 border-purple-200" },
  picked_up:  { label: "라이더 픽업 완료", emoji: "🛵", color: "text-indigo-600",  bg: "bg-indigo-50 border-indigo-200" },
  delivering: { label: "배달 중",         emoji: "🚀", color: "text-pick-purple", bg: "bg-pick-bg border-pick-border" },
  delivered:  { label: "배달 완료",       emoji: "🎉", color: "text-green-600",   bg: "bg-green-50 border-green-200" },
  cancelled:  { label: "취소됨",          emoji: "❌", color: "text-red-500",     bg: "bg-red-50 border-red-200" },
  refunded:   { label: "환불 완료",       emoji: "💸", color: "text-gray-500",    bg: "bg-gray-50 border-gray-200" },
};

const ACTIVE_STATUSES: OrderStatus[] = [
  "pending","confirmed","preparing","ready","picked_up","delivering"
];

const STEP_LABELS = ["주문확인","조리중","픽업","배달중","완료"];
const STEP_STATUSES: OrderStatus[][] = [
  ["confirmed"],
  ["preparing"],
  ["ready","picked_up"],
  ["delivering"],
  ["delivered"],
];

function getStepIndex(status: OrderStatus): number {
  for (let i = 0; i < STEP_STATUSES.length; i++) {
    if (STEP_STATUSES[i].includes(status)) return i;
  }
  return status === "pending" ? -1 : -1;
}

// ── 진행 중 주문 카드 ──────────────────────────────────
function ActiveOrderCard({ order }: { order: Order }) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  useOrderRealtime(order.id, setStatus);

  const cfg      = STATUS_CONFIG[status];
  const stepIdx  = getStepIndex(status);
  const storeEmoji = order.stores ? getCategoryEmoji(order.stores.category) : "🍽️";

  return (
    <div className="bg-white rounded-3xl border-2 border-pick-purple/30 shadow-sm overflow-hidden">
      {/* 상태 바 */}
      <div className={`px-4 py-2.5 flex items-center gap-2 border-b ${cfg.bg}`}>
        <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
        <span className={`text-xs font-black ${cfg.color}`}>
          {cfg.emoji} {cfg.label}
        </span>
        <span className="ml-auto text-[10px] text-gray-400">#{order.id.slice(0,8)}</span>
      </div>

      <div className="px-4 py-4">
        {/* 가게 정보 */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-3xl">{storeEmoji}</span>
          <div>
            <p className="font-black text-pick-text">{order.stores?.name ?? "가맹점"}</p>
            <p className="text-xs text-pick-text-sub">
              {new Date(order.created_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })} 주문
            </p>
          </div>
        </div>

        {/* 주문 아이템 */}
        <p className="text-sm text-pick-text-sub mb-3">
          {order.order_items.map((i) => `${i.menu_name} x${i.quantity}`).join(", ")}
        </p>

        {/* 진행 단계 */}
        {status !== "cancelled" && status !== "refunded" && (
          <div className="flex items-center gap-1 mb-4">
            {STEP_LABELS.map((label, i) => {
              const done   = i <= stepIdx;
              const active = i === stepIdx;
              return (
                <div key={i} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black mb-1 ${
                      active  ? "bg-pick-purple text-white ring-2 ring-pick-purple/30"
                      : done  ? "bg-pick-purple-light text-white"
                               : "bg-pick-bg border-2 border-pick-border text-pick-text-sub"
                    }`}>
                      {done ? "✓" : i + 1}
                    </div>
                    <span className={`text-[9px] font-bold ${active ? "text-pick-purple" : "text-pick-text-sub"}`}>
                      {label}
                    </span>
                  </div>
                  {i < STEP_LABELS.length - 1 && (
                    <div className={`h-0.5 flex-1 -mt-4 ${i < stepIdx ? "bg-pick-purple-light" : "bg-pick-border"}`} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 배달 정보 */}
        <div className="flex items-center gap-4 text-xs text-pick-text-sub">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            약 {order.estimated_time}분 예상
          </span>
          <span className="flex items-center gap-1 truncate">
            <Bike size={12} />
            <span className="truncate">{order.delivery_address}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ── 완료 주문 카드 ────────────────────────────────────
function CompletedOrderCard({ order }: { order: Order }) {
  const cfg        = STATUS_CONFIG[order.status];
  const storeEmoji = order.stores ? getCategoryEmoji(order.stores.category) : "🍽️";
  const isCancel   = order.status === "cancelled" || order.status === "refunded";

  return (
    <div className="bg-white rounded-3xl border-2 border-pick-border shadow-sm px-4 py-4">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-3xl">{storeEmoji}</span>
        <div className="flex-1 min-w-0">
          <p className="font-black text-pick-text text-sm truncate">{order.stores?.name ?? "가맹점"}</p>
          <p className="text-xs text-pick-text-sub">
            {new Date(order.created_at).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
          </p>
        </div>
        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-xs font-bold ${cfg.bg} ${cfg.color}`}>
          {isCancel ? <XCircle size={11} /> : <CheckCircle size={11} />}
          {cfg.label}
        </div>
      </div>

      <p className="text-xs text-pick-text-sub mb-2">
        {order.order_items.map((i) => `${i.menu_name} x${i.quantity}`).join(", ")}
      </p>

      <div className="flex items-center justify-between">
        <div>
          <span className="font-black text-pick-text">
            {Number(order.total_amount).toLocaleString()}원
          </span>
          {Number(order.pick_reward) > 0 && (
            <span className="ml-2 text-xs text-pick-yellow font-bold">
              +{Number(order.pick_reward).toFixed(1)} PICK 적립
            </span>
          )}
        </div>
        {!isCancel && (
          <Link
            href={`/home`}
            className="text-xs font-bold text-pick-purple bg-pick-bg border border-pick-border px-3 py-1.5 rounded-full"
          >
            재주문
          </Link>
        )}
      </div>
    </div>
  );
}

// ── 메인 페이지 ────────────────────────────────────────
export default function OrdersPage() {
  const lastOrder        = useOrderStore((s) => s.lastOrder);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders/my");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders ?? []);
      }
    } catch (e) {
      console.error("주문 조회 오류:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // lastOrder(Zustand)가 있으면 방금 주문한 것 — 목록에 없으면 prepend
  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const doneOrders   = orders.filter((o) => !ACTIVE_STATUSES.includes(o.status));

  // lastOrder 가 activeOrders 에 없으면 표시 (방금 주문 직후)
  const showLastOrderFallback =
    lastOrder &&
    activeOrders.length === 0 &&
    !orders.find((o) => o.id === lastOrder.orderId);

  return (
    <div className="min-h-full px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-black text-pick-text text-xl">PICK 주문 📋</h1>
        <button
          onClick={fetchOrders}
          className="p-2 rounded-full bg-pick-bg border border-pick-border text-pick-text-sub"
          aria-label="새로고침"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* 진행 중인 주문 */}
      <section className="mb-5">
        <h2 className="font-bold text-pick-text text-sm mb-3 px-1">진행 중인 주문</h2>

        {loading && activeOrders.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-pick-border p-8 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-pick-purple border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeOrders.length > 0 ? (
          <div className="space-y-3">
            {activeOrders.map((o) => <ActiveOrderCard key={o.id} order={o} />)}
          </div>
        ) : showLastOrderFallback ? (
          /* Zustand fallback — DB 반영 전 */
          <div className="bg-white rounded-3xl border-2 border-pick-purple/30 shadow-sm p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{lastOrder!.storeEmoji}</span>
              <p className="font-black text-pick-text">{lastOrder!.storeName}</p>
            </div>
            <p className="text-sm text-pick-text-sub">
              {lastOrder!.items.map((i) => `${i.menuName} x${i.quantity}`).join(", ")}
            </p>
            <p className="mt-2 text-xs text-pick-purple font-bold">⏳ 주문 처리 중...</p>
          </div>
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

        {doneOrders.length > 0 ? (
          <div className="space-y-3">
            {doneOrders.map((o) => <CompletedOrderCard key={o.id} order={o} />)}
          </div>
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

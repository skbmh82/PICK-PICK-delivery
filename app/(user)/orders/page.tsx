"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ClipboardList, Clock, Bike, CheckCircle, XCircle,
  RefreshCw, Star, X, Check, RotateCcw, Navigation,
} from "lucide-react";
import Link from "next/link";
import { useOrderStore } from "@/stores/orderStore";
import { useCartStore } from "@/stores/cartStore";
import { useOrderRealtime, useRiderLocationRealtime, type OrderStatus } from "@/hooks/useRealtime";
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
  hasReview: boolean;
  rider_id: string | null;
  stores: OrderStore | null;
  order_items: OrderItem[];
}

// ── 상태 레이블 / 색상 ────────────────────────────────
const STATUS_CONFIG: Record<OrderStatus, { label: string; emoji: string; color: string; bg: string }> = {
  pending:    { label: "결제 확인 중",     emoji: "⏳", color: "text-yellow-600",  bg: "bg-yellow-50 border-yellow-200" },
  confirmed:  { label: "주문 수락됨",      emoji: "✅", color: "text-blue-600",    bg: "bg-blue-50 border-blue-200" },
  preparing:  { label: "조리 중",          emoji: "🍳", color: "text-orange-600",  bg: "bg-orange-50 border-orange-200" },
  ready:      { label: "픽업 대기 중",     emoji: "📦", color: "text-purple-600",  bg: "bg-purple-50 border-purple-200" },
  picked_up:  { label: "라이더 픽업 완료", emoji: "🛵", color: "text-indigo-600",  bg: "bg-indigo-50 border-indigo-200" },
  delivering: { label: "배달 중",          emoji: "🚀", color: "text-pick-purple", bg: "bg-pick-bg border-pick-border" },
  delivered:  { label: "배달 완료",        emoji: "🎉", color: "text-green-600",   bg: "bg-green-50 border-green-200" },
  cancelled:  { label: "취소됨",           emoji: "❌", color: "text-red-500",     bg: "bg-red-50 border-red-200" },
  refunded:   { label: "환불 완료",        emoji: "💸", color: "text-gray-500",    bg: "bg-gray-50 border-gray-200" },
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
  return -1;
}

// ── 리뷰 모달 ──────────────────────────────────────────
function ReviewModal({
  order,
  onClose,
  onReviewed,
}: {
  order: Order;
  onClose: () => void;
  onReviewed: () => void;
}) {
  const [rating,  setRating]  = useState(5);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, rating, content: content || undefined }),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => { onReviewed(); onClose(); }, 900);
      } else {
        const err = await res.json().catch(() => ({}));
        setError((err.error as string) ?? "리뷰 저장에 실패했습니다");
      }
    } finally {
      setLoading(false);
    }
  };

  const storeEmoji = order.stores ? getCategoryEmoji(order.stores.category) : "🍽️";

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[55]" onClick={onClose} />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[60] bg-white rounded-t-3xl shadow-2xl">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-pick-border">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{storeEmoji}</span>
            <div>
              <h2 className="font-black text-pick-text text-base">리뷰 작성 ⭐</h2>
              <p className="text-xs text-pick-text-sub">{order.stores?.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-pick-bg">
            <X size={16} className="text-pick-text-sub" />
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-4">
          {/* 별점 */}
          <div>
            <label className="text-xs font-bold text-pick-text-sub mb-2 block">별점</label>
            <div className="flex gap-2 justify-center">
              {[1,2,3,4,5].map((s) => (
                <button key={s} onClick={() => setRating(s)} className="active:scale-90 transition-transform">
                  <Star
                    size={36}
                    className={s <= rating ? "text-pick-yellow fill-pick-yellow" : "text-gray-200 fill-gray-200"}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-xs text-pick-text-sub mt-2">
              {["", "별로였어요", "조금 아쉬워요", "괜찮았어요", "맛있었어요", "정말 최고예요!"][rating]}
            </p>
          </div>
          {/* 내용 */}
          <div>
            <label className="text-xs font-bold text-pick-text-sub mb-1.5 block">후기 (선택)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="음식과 배달 서비스는 어땠나요?"
              maxLength={500}
              rows={3}
              className="w-full border-2 border-pick-border rounded-2xl px-4 py-3 text-sm text-pick-text focus:outline-none focus:border-pick-purple resize-none"
            />
            <p className="text-right text-[10px] text-pick-text-sub">{content.length}/500</p>
          </div>
          {/* PICK 보상 안내 */}
          <div className="bg-pick-bg rounded-2xl px-4 py-2.5 flex items-center gap-2">
            <span className="text-base">✨</span>
            <span className="text-xs text-pick-text-sub">리뷰 작성 시 <strong className="text-pick-purple">+10 PICK</strong> 보상!</span>
          </div>
          {error && <p className="text-xs text-red-500 font-bold text-center">{error}</p>}
        </div>

        <div className="px-5 pb-8 pt-1 border-t border-pick-border">
          <button
            onClick={() => void handleSubmit()}
            disabled={loading || success}
            className="w-full bg-gradient-to-r from-pick-purple to-pick-purple-light text-white font-black py-4 rounded-full shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
          >
            {success ? (
              <><Check size={18} /> 리뷰 등록 완료!</>
            ) : loading ? (
              <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <><Star size={18} /> 리뷰 등록하기</>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

// ── 라이더 위치 카드 ───────────────────────────────────
function RiderLocationCard({ riderId }: { riderId: string }) {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [hasLocation, setHasLocation] = useState(false);

  useRiderLocationRealtime(riderId, (_lat, _lng) => {
    setHasLocation(true);
    setLastUpdated(new Date());
  });

  return (
    <div className="flex items-center gap-3 bg-pick-bg border-2 border-pick-border rounded-2xl px-4 py-3 mb-3">
      <div className="w-9 h-9 rounded-full bg-pick-purple/10 flex items-center justify-center flex-shrink-0">
        <Navigation size={16} className="text-pick-purple animate-pulse" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-pick-text">라이더가 배달 중이에요 🛵</p>
        <p className="text-xs text-pick-text-sub mt-0.5">
          {hasLocation && lastUpdated
            ? `위치 업데이트 ${lastUpdated.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`
            : "라이더 위치 수신 대기 중..."}
        </p>
      </div>
      {hasLocation && (
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
      )}
    </div>
  );
}

// ── 진행 중 주문 카드 ──────────────────────────────────
function ActiveOrderCard({
  order,
  onCancelled,
}: {
  order: Order;
  onCancelled: () => void;
}) {
  const [status,     setStatus]     = useState<OrderStatus>(order.status);
  const [cancelling, setCancelling] = useState(false);
  useOrderRealtime(order.id, setStatus);

  const cfg      = STATUS_CONFIG[status];
  const stepIdx  = getStepIndex(status);
  const storeEmoji = order.stores ? getCategoryEmoji(order.stores.category) : "🍽️";
  const canCancel  = status === "pending";

  const handleCancel = async () => {
    if (!confirm("주문을 취소하시겠어요?")) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (res.ok) onCancelled();
    } finally {
      setCancelling(false);
    }
  };

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
          <div className="flex-1">
            <p className="font-black text-pick-text">{order.stores?.name ?? "가맹점"}</p>
            <p className="text-xs text-pick-text-sub">
              {new Date(order.created_at).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })} 주문
            </p>
          </div>
          {canCancel && (
            <button
              onClick={() => void handleCancel()}
              disabled={cancelling}
              className="text-xs font-bold text-red-500 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full active:scale-90 transition-transform disabled:opacity-50"
            >
              {cancelling ? "취소 중..." : "취소"}
            </button>
          )}
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

        {/* 라이더 실시간 위치 */}
        {status === "delivering" && order.rider_id && (
          <div className="mt-3">
            <RiderLocationCard riderId={order.rider_id} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── 완료 주문 카드 ────────────────────────────────────
function CompletedOrderCard({
  order,
  onReorder,
  onReviewOpen,
}: {
  order: Order;
  onReorder: (order: Order) => void;
  onReviewOpen: (order: Order) => void;
}) {
  const cfg        = STATUS_CONFIG[order.status];
  const storeEmoji = order.stores ? getCategoryEmoji(order.stores.category) : "🍽️";
  const isCancel   = order.status === "cancelled" || order.status === "refunded";
  const isDelivered = order.status === "delivered";

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

      <p className="text-xs text-pick-text-sub mb-3">
        {order.order_items.map((i) => `${i.menu_name} x${i.quantity}`).join(", ")}
      </p>

      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <span className="font-black text-pick-text">
            {Number(order.total_amount).toLocaleString()}원
          </span>
          {Number(order.pick_reward) > 0 && (
            <span className="ml-2 text-xs text-pick-yellow font-bold">
              +{Number(order.pick_reward).toFixed(1)} PICK 적립
            </span>
          )}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {/* 재주문 */}
          {!isCancel && (
            <button
              onClick={() => onReorder(order)}
              className="flex items-center gap-1 text-xs font-bold text-pick-purple bg-pick-bg border border-pick-border px-3 py-1.5 rounded-full active:scale-90 transition-transform"
            >
              <RotateCcw size={11} />
              재주문
            </button>
          )}
          {/* 리뷰 */}
          {isDelivered && !order.hasReview && (
            <button
              onClick={() => onReviewOpen(order)}
              className="flex items-center gap-1 text-xs font-bold text-white bg-pick-purple px-3 py-1.5 rounded-full active:scale-90 transition-transform"
            >
              <Star size={11} />
              리뷰
            </button>
          )}
          {isDelivered && order.hasReview && (
            <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
              <Check size={11} />
              리뷰완료
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 메인 페이지 ────────────────────────────────────────
export default function OrdersPage() {
  const lastOrder  = useOrderStore((s) => s.lastOrder);
  const cartStore  = useCartStore();
  const [orders,   setOrders]   = useState<Order[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [reviewTarget, setReviewTarget] = useState<Order | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders/my");
      if (res.ok) {
        const data = await res.json() as { orders: Order[] };
        setOrders(data.orders ?? []);
      }
    } catch (e) {
      console.error("주문 조회 오류:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleReorder = (order: Order) => {
    if (!order.stores) return;
    // 장바구니에 이전 주문 아이템 담기
    const storeInfo = {
      storeId:        order.stores.id,
      storeName:      order.stores.name,
      storeEmoji:     getCategoryEmoji(order.stores.category),
      deliveryFee:    Number(order.delivery_fee),
      minOrderAmount: 0,
      pickRewardRate: 1,
    };
    cartStore.clearCart();
    order.order_items.forEach((item) => {
      cartStore.addItem(storeInfo, {
        menuId:   item.id,
        menuName: item.menu_name,
        price:    Number(item.price),
        image:    "🍽️",
      });
      // 2개 이상이면 추가
      for (let i = 1; i < item.quantity; i++) {
        cartStore.addItem(storeInfo, {
          menuId:   item.id,
          menuName: item.menu_name,
          price:    Number(item.price),
          image:    "🍽️",
        });
      }
    });
    window.location.href = `/store/${order.stores.id}`;
  };

  const activeOrders = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const doneOrders   = orders.filter((o) => !ACTIVE_STATUSES.includes(o.status));

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
            {activeOrders.map((o) => (
              <ActiveOrderCard key={o.id} order={o} onCancelled={fetchOrders} />
            ))}
          </div>
        ) : showLastOrderFallback ? (
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
            {doneOrders.map((o) => (
              <CompletedOrderCard
                key={o.id}
                order={o}
                onReorder={handleReorder}
                onReviewOpen={setReviewTarget}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border-2 border-pick-border p-10 flex flex-col items-center text-pick-text-sub shadow-sm">
            <ClipboardList size={44} className="mb-3 opacity-20" />
            <p className="text-sm font-medium">아직 주문 내역이 없어요</p>
            <p className="text-xs mt-1 opacity-70">첫 주문을 시작해보세요!</p>
            <Link
              href="/home"
              className="mt-4 bg-pick-purple text-white text-sm font-bold px-6 py-2.5 rounded-full active:scale-95 transition-all"
            >
              음식 주문하러 가기
            </Link>
          </div>
        )}
      </section>

      {/* 리뷰 모달 */}
      {reviewTarget && (
        <ReviewModal
          order={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onReviewed={fetchOrders}
        />
      )}
    </div>
  );
}

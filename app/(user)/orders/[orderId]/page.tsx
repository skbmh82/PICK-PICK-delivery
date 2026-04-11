"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Clock, Bike, MapPin, Coins, Star, X,
  CheckCircle, RotateCcw, Navigation, Phone, Copy, Check,
} from "lucide-react";
import { useOrderRealtime, useRiderLocationRealtime, type OrderStatus } from "@/hooks/useRealtime";
import { useCartStore } from "@/stores/cartStore";
import { getCategoryEmoji } from "@/lib/utils/categoryEmoji";

// ── 타입 ──────────────────────────────────────────────
interface OrderItem {
  id: string;
  menu_name: string;
  price: number;
  quantity: number;
  options: { optionName?: string; extraPrice?: number }[];
}

interface OrderStore {
  id: string;
  name: string;
  image_url: string | null;
  category: string;
  phone: string | null;
  address: string;
}

interface OrderDetail {
  id: string;
  status: OrderStatus;
  total_amount: number;
  delivery_fee: number;
  pick_used: number;
  pick_reward: number;
  delivery_address: string;
  delivery_note: string | null;
  estimated_time: number | null;
  confirmed_at: string | null;
  picked_up_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  rider_id: string | null;
  stores: OrderStore | null;
  order_items: OrderItem[];
}

// ── 상태 설정 ─────────────────────────────────────────
const STATUS_CONFIG: Record<OrderStatus, { label: string; emoji: string; color: string; bg: string; border: string }> = {
  pending:    { label: "결제 확인 중",     emoji: "⏳", color: "text-yellow-600",  bg: "bg-yellow-50",  border: "border-yellow-200" },
  confirmed:  { label: "주문 수락됨",      emoji: "✅", color: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-200" },
  preparing:  { label: "조리 중",          emoji: "🍳", color: "text-orange-600",  bg: "bg-orange-50",  border: "border-orange-200" },
  ready:      { label: "픽업 대기 중",     emoji: "📦", color: "text-purple-600",  bg: "bg-purple-50",  border: "border-purple-200" },
  picked_up:  { label: "라이더 픽업 완료", emoji: "🛵", color: "text-indigo-600",  bg: "bg-indigo-50",  border: "border-indigo-200" },
  delivering: { label: "배달 중",          emoji: "🚀", color: "text-pick-purple", bg: "bg-pick-bg",    border: "border-pick-border" },
  delivered:  { label: "배달 완료",        emoji: "🎉", color: "text-green-600",   bg: "bg-green-50",   border: "border-green-200" },
  cancelled:  { label: "취소됨",           emoji: "❌", color: "text-red-500",     bg: "bg-red-50",     border: "border-red-200" },
  refunded:   { label: "환불 완료",        emoji: "💸", color: "text-gray-500",    bg: "bg-gray-50",    border: "border-gray-200" },
};

const STEP_LABELS   = ["주문확인", "조리중", "픽업", "배달중", "완료"];
const STEP_STATUSES: OrderStatus[][] = [
  ["confirmed"],
  ["preparing"],
  ["ready", "picked_up"],
  ["delivering"],
  ["delivered"],
];

function getStepIndex(status: OrderStatus): number {
  for (let i = 0; i < STEP_STATUSES.length; i++) {
    if (STEP_STATUSES[i].includes(status)) return i;
  }
  return -1;
}

// ── 라이더 위치 카드 ──────────────────────────────────
function RiderLocationCard({ riderId }: { riderId: string }) {
  const [hasLocation, setHasLocation] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useRiderLocationRealtime(riderId, () => {
    setHasLocation(true);
    setLastUpdated(new Date());
  });

  return (
    <div className="flex items-center gap-3 bg-pick-bg border-2 border-pick-border rounded-2xl px-4 py-3">
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
      {hasLocation && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />}
    </div>
  );
}

// ── 리뷰 모달 ─────────────────────────────────────────
function ReviewModal({
  order,
  onClose,
  onReviewed,
}: {
  order: OrderDetail;
  onClose: () => void;
  onReviewed: () => void;
}) {
  const [rating,  setRating]  = useState(5);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setLoading(true); setError("");
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
    } finally { setLoading(false); }
  };

  const emoji = order.stores ? getCategoryEmoji(order.stores.category) : "🍽️";

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[55]" onClick={onClose} />
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[60] bg-white rounded-t-3xl shadow-2xl">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-pick-border">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{emoji}</span>
            <div>
              <h2 className="font-black text-pick-text text-base">리뷰 작성 ⭐</h2>
              <p className="text-xs text-pick-text-sub">{order.stores?.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-pick-bg">
            <X size={16} />
          </button>
        </div>
        <div className="px-5 py-4 flex flex-col gap-4">
          <div className="flex gap-2 justify-center">
            {[1,2,3,4,5].map((s) => (
              <button key={s} onClick={() => setRating(s)} className="active:scale-90 transition-transform">
                <Star size={36} className={s <= rating ? "text-pick-yellow fill-pick-yellow" : "text-gray-200 fill-gray-200"} />
              </button>
            ))}
          </div>
          <p className="text-center text-xs text-pick-text-sub">
            {["","별로였어요","조금 아쉬워요","괜찮았어요","맛있었어요","정말 최고예요!"][rating]}
          </p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="음식과 배달 서비스는 어땠나요?"
            maxLength={500}
            rows={4}
            className="w-full border-2 border-pick-border rounded-2xl px-4 py-3 text-sm text-pick-text resize-none focus:outline-none focus:border-pick-purple"
          />
          {error   && <p className="text-xs text-red-500 font-bold text-center">{error}</p>}
          {success && <p className="text-xs text-green-600 font-bold text-center">✓ 리뷰가 등록됐어요! +10 PICK 지급</p>}
        </div>
        <div className="px-5 pb-8 pt-1 border-t border-pick-border">
          <button
            onClick={() => void handleSubmit()}
            disabled={loading || success}
            className="w-full bg-gradient-to-r from-pick-purple to-pick-purple-light text-white font-black py-4 rounded-full flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading
              ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <><Star size={16} /> 리뷰 등록</>
            }
          </button>
        </div>
      </div>
    </>
  );
}

// ── 메인 페이지 ───────────────────────────────────────
export default function OrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = use(params);
  const router      = useRouter();
  const cartStore   = useCartStore();

  const [order,       setOrder]       = useState<OrderDetail | null>(null);
  const [status,      setStatus]      = useState<OrderStatus>("pending");
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [reviewOpen,  setReviewOpen]  = useState(false);
  const [hasReview,   setHasReview]   = useState(false);
  const [cancelling,  setCancelling]  = useState(false);
  const [copied,      setCopied]      = useState(false);

  const fetchOrder = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (!res.ok) { setError("주문을 찾을 수 없어요"); return; }
      const { order: data } = await res.json() as { order: OrderDetail };
      setOrder(data);
      setStatus(data.status);

      // 리뷰 존재 여부 확인
      const rvRes = await fetch(`/api/reviews?orderId=${orderId}`);
      if (rvRes.ok) {
        const { exists } = await rvRes.json() as { exists: boolean };
        setHasReview(exists);
      }
    } catch {
      setError("주문 정보를 불러올 수 없어요");
    } finally { setLoading(false); }
  }, [orderId]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  // 실시간 상태 업데이트
  useOrderRealtime(orderId, (newStatus) => setStatus(newStatus));

  const handleCancel = async () => {
    if (!confirm("주문을 취소하시겠어요?")) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (res.ok) { setStatus("cancelled"); setOrder((o) => o ? { ...o, status: "cancelled" } : o); }
    } finally { setCancelling(false); }
  };

  const handleReorder = () => {
    if (!order?.stores) return;
    cartStore.clearCart();
    const storeInfo = {
      storeId: order.stores.id, storeName: order.stores.name,
      storeEmoji: getCategoryEmoji(order.stores.category),
      deliveryFee: Number(order.delivery_fee), minOrderAmount: 0, pickRewardRate: 1,
    };
    order.order_items.forEach((item) => {
      for (let i = 0; i < item.quantity; i++) {
        cartStore.addItem(storeInfo, {
          menuId: item.id, menuName: item.menu_name, price: Number(item.price), image: "🍽️",
        });
      }
    });
    router.push(`/store/${order.stores.id}`);
  };

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ── 로딩 ──
  if (loading) {
    return (
      <div className="min-h-full px-4 py-6 animate-pulse">
        <div className="h-10 w-24 bg-gray-100 rounded-full mb-4" />
        <div className="h-24 bg-gray-100 rounded-3xl mb-4" />
        <div className="h-48 bg-gray-100 rounded-3xl mb-4" />
        <div className="h-32 bg-gray-100 rounded-3xl" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center px-6 gap-4">
        <span className="text-5xl">😕</span>
        <p className="font-bold text-pick-text text-center">{error || "주문 정보를 불러올 수 없어요"}</p>
        <button onClick={() => router.back()} className="bg-pick-purple text-white font-bold px-6 py-3 rounded-full">
          돌아가기
        </button>
      </div>
    );
  }

  const cfg       = STATUS_CONFIG[status];
  const stepIdx   = getStepIndex(status);
  const emoji     = order.stores ? getCategoryEmoji(order.stores.category) : "🍽️";
  const isActive  = !["delivered","cancelled","refunded"].includes(status);
  const isDone    = status === "delivered";
  const isCancelled = status === "cancelled" || status === "refunded";
  const itemsAmount = order.order_items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);

  return (
    <div className="min-h-full pb-8">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b border-pick-border px-4 pt-4 pb-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-pick-bg border border-pick-border flex-shrink-0"
        >
          <ArrowLeft size={18} className="text-pick-text" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-black text-pick-text text-base">주문 상세</h1>
          <button onClick={copyOrderId} className="flex items-center gap-1 text-[10px] text-pick-text-sub mt-0.5">
            #{orderId.slice(0, 8).toUpperCase()}
            {copied ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
          </button>
        </div>
        {/* 상태 뱃지 */}
        <span className={`flex items-center gap-1 text-xs font-black px-3 py-1.5 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
          {cfg.emoji} {cfg.label}
        </span>
      </div>

      <div className="px-4 pt-4 flex flex-col gap-4">

        {/* 진행 단계 (취소·환불 제외) */}
        {isActive && stepIdx >= 0 && (
          <div className="bg-white rounded-3xl border-2 border-pick-border shadow-sm px-5 py-5">
            <p className="text-xs font-bold text-pick-text-sub mb-4">주문 진행 현황</p>
            <div className="flex items-center gap-1">
              {STEP_LABELS.map((label, i) => {
                const done   = i <= stepIdx;
                const active = i === stepIdx;
                return (
                  <div key={i} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black mb-1.5 transition-all ${
                        active  ? "bg-pick-purple text-white ring-4 ring-pick-purple/20 scale-110"
                        : done  ? "bg-pick-purple-light text-white"
                                 : "bg-pick-bg border-2 border-pick-border text-pick-text-sub"
                      }`}>
                        {done ? "✓" : i + 1}
                      </div>
                      <span className={`text-[9px] font-bold text-center leading-tight ${
                        active ? "text-pick-purple" : done ? "text-pick-purple-light" : "text-pick-text-sub"
                      }`}>{label}</span>
                    </div>
                    {i < STEP_LABELS.length - 1 && (
                      <div className={`h-0.5 flex-1 -mt-5 transition-all ${i < stepIdx ? "bg-pick-purple-light" : "bg-pick-border"}`} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* 배달 중 라이더 위치 */}
            {status === "delivering" && order.rider_id && (
              <div className="mt-4">
                <RiderLocationCard riderId={order.rider_id} />
              </div>
            )}

            {/* 예상 도착 시간 */}
            {order.estimated_time && status !== "cancelled" && (
              <div className="flex items-center gap-2 mt-4 bg-pick-bg rounded-2xl px-4 py-2.5">
                <Clock size={14} className="text-pick-purple" />
                <span className="text-xs text-pick-text-sub">예상 배달 시간</span>
                <span className="ml-auto text-sm font-black text-pick-purple">약 {order.estimated_time}분</span>
              </div>
            )}

            {/* 취소 버튼 */}
            {status === "pending" && (
              <button
                onClick={() => void handleCancel()}
                disabled={cancelling}
                className="mt-3 w-full py-3 rounded-2xl border-2 border-red-200 text-red-500 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
              >
                {cancelling
                  ? <span className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                  : "주문 취소"
                }
              </button>
            )}
          </div>
        )}

        {/* 완료/취소 상태 카드 */}
        {(isDone || isCancelled) && (
          <div className={`rounded-3xl border-2 ${cfg.border} ${cfg.bg} px-5 py-5 flex flex-col items-center gap-2`}>
            <span className="text-5xl">{cfg.emoji}</span>
            <p className={`font-black text-lg ${cfg.color}`}>{cfg.label}</p>
            {order.delivered_at && isDone && (
              <p className="text-xs text-pick-text-sub">
                {new Date(order.delivered_at).toLocaleString("ko-KR", {
                  month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                })} 완료
              </p>
            )}
            {/* PICK 적립 */}
            {isDone && Number(order.pick_reward) > 0 && (
              <div className="mt-1 flex items-center gap-1.5 bg-pick-yellow/10 border border-pick-yellow/30 rounded-full px-4 py-1.5">
                <Coins size={14} className="text-pick-yellow" />
                <span className="text-sm font-black text-pick-yellow-dark">
                  +{Number(order.pick_reward).toLocaleString()} PICK 적립!
                </span>
              </div>
            )}
          </div>
        )}

        {/* 가게 정보 */}
        <div className="bg-white rounded-3xl border-2 border-pick-border shadow-sm px-5 py-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">{emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-black text-pick-text">{order.stores?.name ?? "가맹점"}</p>
              <p className="text-xs text-pick-text-sub mt-0.5">{order.stores?.address}</p>
            </div>
          </div>
          {order.stores?.phone && (
            <a
              href={`tel:${order.stores.phone}`}
              className="flex items-center gap-2 bg-pick-bg rounded-2xl px-4 py-2.5 active:bg-pick-border transition-colors"
            >
              <Phone size={14} className="text-pick-purple" />
              <span className="text-sm font-bold text-pick-text">{order.stores.phone}</span>
              <span className="ml-auto text-xs text-pick-purple font-bold">전화하기</span>
            </a>
          )}
        </div>

        {/* 주문 아이템 */}
        <div className="bg-white rounded-3xl border-2 border-pick-border shadow-sm px-5 py-4">
          <p className="text-xs font-bold text-pick-text-sub mb-3">주문 내역</p>
          <div className="flex flex-col gap-3">
            {order.order_items.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-pick-text text-sm">
                    {item.menu_name}
                    <span className="text-pick-text-sub font-normal ml-1">× {item.quantity}</span>
                  </p>
                  {Array.isArray(item.options) && item.options.length > 0 && (
                    <p className="text-[10px] text-pick-text-sub mt-0.5">
                      {(item.options as { optionName?: string }[]).map((o) => o.optionName).filter(Boolean).join(", ")}
                    </p>
                  )}
                </div>
                <span className="font-bold text-pick-text text-sm flex-shrink-0">
                  {(Number(item.price) * item.quantity).toLocaleString()}원
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 결제 요약 */}
        <div className="bg-white rounded-3xl border-2 border-pick-border shadow-sm px-5 py-4">
          <p className="text-xs font-bold text-pick-text-sub mb-3">결제 정보</p>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-pick-text-sub">메뉴 합계</span>
              <span className="font-bold">{itemsAmount.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between">
              <span className="text-pick-text-sub flex items-center gap-1"><Bike size={12} />배달비</span>
              <span className="font-bold">
                {Number(order.delivery_fee) === 0
                  ? <span className="text-green-600">무료</span>
                  : `+${Number(order.delivery_fee).toLocaleString()}원`}
              </span>
            </div>
            {Number(order.pick_used) > 0 && (
              <div className="flex justify-between">
                <span className="text-pick-purple">PICK 할인</span>
                <span className="font-bold text-pick-purple">-{Number(order.pick_used).toLocaleString()} PICK</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-dashed border-pick-border">
              <span className="font-black text-pick-text">최종 결제</span>
              <span className="font-black text-pick-text text-base">{Number(order.total_amount).toLocaleString()}원</span>
            </div>
            {Number(order.pick_reward) > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-pick-yellow text-xs font-bold flex items-center gap-1">
                  <Coins size={11} />적립 예정
                </span>
                <span className="font-bold text-pick-yellow text-xs">+{Number(order.pick_reward).toLocaleString()} PICK</span>
              </div>
            )}
          </div>
        </div>

        {/* 배달 정보 */}
        <div className="bg-white rounded-3xl border-2 border-pick-border shadow-sm px-5 py-4">
          <p className="text-xs font-bold text-pick-text-sub mb-3">배달 정보</p>
          <div className="flex items-start gap-2 mb-2">
            <MapPin size={14} className="text-pick-purple mt-0.5 flex-shrink-0" />
            <p className="text-sm text-pick-text leading-relaxed">{order.delivery_address}</p>
          </div>
          {order.delivery_note && (
            <p className="text-xs text-pick-text-sub bg-pick-bg rounded-2xl px-3 py-2">
              💬 {order.delivery_note}
            </p>
          )}
          <p className="text-xs text-pick-text-sub mt-2">
            {new Date(order.created_at).toLocaleString("ko-KR", {
              month: "short", day: "numeric",
              hour: "2-digit", minute: "2-digit",
            })} 주문
          </p>
        </div>

        {/* 완료 후 액션 버튼 */}
        {isDone && (
          <div className="flex gap-3">
            {!hasReview ? (
              <button
                onClick={() => setReviewOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-pick-purple to-pick-purple-light text-white font-black py-4 rounded-full shadow-lg active:scale-95 transition-all"
              >
                <Star size={18} /> 리뷰 작성
              </button>
            ) : (
              <div className="flex-1 flex items-center justify-center gap-2 bg-green-50 border-2 border-green-200 text-green-700 font-black py-4 rounded-full">
                <CheckCircle size={18} /> 리뷰 완료
              </div>
            )}
            <button
              onClick={handleReorder}
              className="flex items-center justify-center gap-2 bg-white border-2 border-pick-border text-pick-purple font-black py-4 px-6 rounded-full active:scale-95 transition-all"
            >
              <RotateCcw size={18} /> 재주문
            </button>
          </div>
        )}

      </div>

      {/* 리뷰 모달 */}
      {reviewOpen && (
        <ReviewModal
          order={order}
          onClose={() => setReviewOpen(false)}
          onReviewed={() => setHasReview(true)}
        />
      )}
    </div>
  );
}

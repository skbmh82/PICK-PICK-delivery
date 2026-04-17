"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Check, X, ChefHat, Clock, Bike, CheckCircle,
  XCircle, ChevronDown, ChevronUp, RefreshCw, Bell, Volume2, VolumeX,
} from "lucide-react";
import { useStoreOrderRealtime, useStoreOrderStatusRealtime } from "@/hooks/useRealtime";
import { useOrderSound } from "@/lib/useOrderSound";

// ── 타입 ──────────────────────────────────────────────
type OrderStatus =
  | "pending" | "confirmed" | "preparing" | "calling_rider" | "ready"
  | "picked_up" | "delivering" | "delivered" | "cancelled" | "refunded";

interface OrderItem {
  id: string;
  menu_name: string;
  price: number;
  quantity: number;
}

interface OrderUser {
  id: string;
  name: string;
  phone: string | null;
}

interface Order {
  id: string;
  status: OrderStatus;
  total_amount: number;
  delivery_fee: number;
  pick_used: number;
  delivery_address: string;
  delivery_note: string | null;
  estimated_time: number | null;
  created_at: string;
  rider_id: string | null;
  users: OrderUser | null;
  order_items: OrderItem[];
}

// ── 상태 설정 ─────────────────────────────────────────
const STATUS_LABEL: Record<OrderStatus, string> = {
  pending:        "신규 주문 🔴",
  confirmed:      "수락됨",
  preparing:      "조리 중 🍳",
  calling_rider:  "라이더 호출됨 🛵",
  ready:          "픽업 대기",
  picked_up:      "라이더 픽업",
  delivering:     "배달 중",
  delivered:      "배달 완료",
  cancelled:      "취소",
  refunded:       "환불",
};

const STATUS_CONFIG: Record<OrderStatus, { color: string; bg: string; border: string }> = {
  pending:       { color: "text-red-600",    bg: "bg-red-50",    border: "border-red-200" },
  confirmed:     { color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-200" },
  preparing:     { color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-200" },
  calling_rider: { color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200" },
  ready:         { color: "text-green-600",  bg: "bg-green-50",  border: "border-green-200" },
  picked_up:     { color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
  delivering:    { color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
  delivered:     { color: "text-gray-500",   bg: "bg-gray-50",   border: "border-gray-200" },
  cancelled:     { color: "text-gray-400",   bg: "bg-gray-50",   border: "border-gray-100" },
  refunded:      { color: "text-gray-400",   bg: "bg-gray-50",   border: "border-gray-100" },
};

const ETA_OPTIONS = [10, 15, 20, 25, 30, 40, 50, 60];

// ── 주문 카드 ─────────────────────────────────────────
function OrderCard({
  order,
  onStatusChange,
  onCancel,
}: {
  order: Order;
  onStatusChange: (id: string, status: OrderStatus, estimatedTime?: number) => Promise<void>;
  onCancel: (id: string) => Promise<void>;
}) {
  const [expanded,    setExpanded]    = useState(order.status === "pending");
  const [loading,     setLoading]     = useState(false);
  const [eta,         setEta]         = useState(30);
  const [showReject,  setShowReject]  = useState(false);
  const [showCancel,  setShowCancel]  = useState(false);
  const [notifying,   setNotifying]   = useState(false);
  const loadingRef  = useRef(false); // 즉각 잠금 (React 렌더 전에도 작동)
  const notifyRef   = useRef(false);
  const cfg = STATUS_CONFIG[order.status];

  const handleStatus = async (status: OrderStatus, estimatedTime?: number) => {
    if (loadingRef.current) return; // 즉각 중복 방지
    loadingRef.current = true;
    setLoading(true);
    await onStatusChange(order.id, status, estimatedTime);
    loadingRef.current = false;
    setLoading(false);
    setShowReject(false);
    setShowCancel(false);
  };

  const handleCancelConfirm = async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    await onCancel(order.id);
    loadingRef.current = false;
    setLoading(false);
    setShowCancel(false);
  };

  const handleNotifyRiders = async () => {
    if (notifyRef.current) return;
    notifyRef.current = true;
    setNotifying(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/notify-riders`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        alert(data.notified > 0
          ? `${data.notified}명의 라이더에게 재요청을 보냈어요 🛵`
          : (data.message ?? "근처 라이더가 없어요"));
      } else {
        alert(data.error ?? "라이더 재호출에 실패했습니다");
      }
    } finally {
      notifyRef.current = false;
      setNotifying(false);
    }
  };

  const timeStr = new Date(order.created_at).toLocaleTimeString("ko-KR", {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className={`bg-white rounded-3xl border-2 ${cfg.border} shadow-sm overflow-hidden`}>
      {/* 헤더 */}
      <button
        className="w-full flex items-center justify-between px-4 pt-4 pb-3"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <span className={`text-xs font-black px-3 py-1.5 rounded-full ${cfg.bg} ${cfg.color} ${cfg.border} border`}>
            {STATUS_LABEL[order.status]}
          </span>
          <div className="text-left">
            <p className="font-black text-pick-text text-sm">
              {order.users?.name ?? "고객"}님
            </p>
            <p className="text-xs text-pick-text-sub">{timeStr} 주문</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-black text-pick-text text-sm">
            {Number(order.total_amount).toLocaleString()}원
          </span>
          {expanded
            ? <ChevronUp size={16} className="text-pick-text-sub" />
            : <ChevronDown size={16} className="text-pick-text-sub" />}
        </div>
      </button>

      {/* 상세 */}
      {expanded && (
        <div className="px-4 pb-4">
          {/* 주문 아이템 */}
          <div className={`${cfg.bg} rounded-2xl px-4 py-3 mb-3`}>
            {order.order_items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-1">
                <span className="text-sm text-pick-text">
                  {item.menu_name} <span className="text-pick-text-sub">x{item.quantity}</span>
                </span>
                <span className="text-sm font-bold text-pick-text">
                  {(Number(item.price) * item.quantity).toLocaleString()}원
                </span>
              </div>
            ))}
            <div className="border-t border-dashed border-pick-border mt-2 pt-2 flex items-center justify-between">
              <span className="text-xs text-pick-text-sub">배달비</span>
              <span className="text-xs text-pick-text-sub">
                {Number(order.delivery_fee) === 0 ? "무료" : `+${Number(order.delivery_fee).toLocaleString()}원`}
              </span>
            </div>
            {Number(order.pick_used) > 0 && (
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-pick-text-sub">PICK 할인</span>
                <span className="text-xs text-purple-600 font-bold">
                  -{Number(order.pick_used).toLocaleString()}원
                </span>
              </div>
            )}
          </div>

          {/* 배달 정보 */}
          <div className="flex flex-col gap-1.5 mb-4">
            <div className="flex items-start gap-2">
              <Bike size={13} className="text-pick-text-sub mt-0.5 flex-shrink-0" />
              <p className="text-xs text-pick-text">{order.delivery_address}</p>
            </div>
            {order.delivery_note && (
              <div className="flex items-start gap-2">
                <span className="text-xs flex-shrink-0">📝</span>
                <p className="text-xs text-pick-text-sub">{order.delivery_note}</p>
              </div>
            )}
            {order.users?.phone && (
              <div className="flex items-start gap-2">
                <span className="text-xs flex-shrink-0">📞</span>
                <p className="text-xs text-pick-text-sub">{order.users.phone}</p>
              </div>
            )}
            {order.estimated_time && order.status !== "pending" && (
              <div className="flex items-start gap-2">
                <Clock size={13} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-600 font-bold">예상 {order.estimated_time}분</p>
              </div>
            )}
          </div>

          {/* ── 액션 버튼 ── */}

          {/* pending: 거절 확인 or 수락+ETA */}
          {order.status === "pending" && !showReject && (
            <div className="flex flex-col gap-2">
              {/* ETA 선택 */}
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-3 py-2.5">
                <Clock size={14} className="text-amber-500 flex-shrink-0" />
                <span className="text-xs font-bold text-amber-700 flex-shrink-0">예상 조리</span>
                <div className="flex gap-1.5 overflow-x-auto flex-1 pb-0.5">
                  {ETA_OPTIONS.map((min) => (
                    <button
                      key={min}
                      onClick={() => setEta(min)}
                      className={`flex-shrink-0 text-xs font-black px-2.5 py-1 rounded-full transition-all ${
                        eta === min
                          ? "bg-amber-500 text-white shadow-sm"
                          : "bg-white text-amber-600 border border-amber-200"
                      }`}
                    >
                      {min}분
                    </button>
                  ))}
                </div>
              </div>
              {/* 버튼 2개 */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={loading}
                  onClick={() => setShowReject(true)}
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-red-200 bg-red-50 text-red-600 font-bold text-sm active:scale-95 transition-transform disabled:opacity-50"
                >
                  <X size={16} /> 거절
                </button>
                <button
                  disabled={loading}
                  onClick={() => handleStatus("confirmed", eta)}
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-400 text-white font-bold text-sm active:scale-95 transition-transform shadow-md disabled:opacity-50"
                >
                  {loading
                    ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    : <Check size={16} />}
                  수락
                </button>
              </div>
            </div>
          )}

          {/* pending: 거절 확인 팝업 */}
          {order.status === "pending" && showReject && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl px-4 py-3">
              <p className="text-sm font-bold text-red-700 mb-3 text-center">정말 거절하시겠어요?</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowReject(false)}
                  className="py-2.5 rounded-2xl border-2 border-pick-border text-pick-text-sub font-bold text-sm active:scale-95 transition-transform"
                >
                  취소
                </button>
                <button
                  disabled={loading}
                  onClick={() => handleStatus("cancelled")}
                  className="py-2.5 rounded-2xl bg-red-500 text-white font-bold text-sm active:scale-95 transition-transform disabled:opacity-50"
                >
                  {loading
                    ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin mx-auto block" />
                    : "거절 확인"}
                </button>
              </div>
            </div>
          )}

          {order.status === "confirmed" && (
            <button
              disabled={loading}
              onClick={() => handleStatus("preparing")}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-blue-500 text-white font-bold text-sm active:scale-95 transition-transform shadow-md disabled:opacity-50"
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <ChefHat size={16} />}
              조리 시작
            </button>
          )}

          {order.status === "preparing" && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-2xl px-3 py-2">
                <Clock size={14} className="text-amber-500 animate-spin flex-shrink-0" style={{ animationDuration: "3s" }} />
                <span className="text-xs text-amber-600 font-bold">조리 중...</span>
              </div>
              {!showCancel ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    {/* 라이더 미리 호출 → calling_rider (조리는 계속, 라이더만 출발) */}
                    <button
                      disabled={loading}
                      onClick={() => handleStatus("calling_rider")}
                      className="flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pick-purple text-white font-bold text-sm active:scale-95 transition-transform shadow-md disabled:opacity-50"
                    >
                      {loading
                        ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        : <Bike size={14} />}
                      라이더 호출
                    </button>
                    {/* 조리 완료 → ready (라이더 픽업 가능) */}
                    <button
                      disabled={loading}
                      onClick={() => handleStatus("ready")}
                      className="flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-green-500 text-white font-bold text-sm active:scale-95 transition-transform shadow-md disabled:opacity-50"
                    >
                      {loading
                        ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        : <ChefHat size={14} />}
                      조리 완료
                    </button>
                  </div>
                  <button
                    disabled={loading}
                    onClick={() => setShowCancel(true)}
                    className="w-full text-xs text-gray-400 underline py-1 active:opacity-60 transition-opacity"
                  >
                    주문 취소
                  </button>
                </>
              ) : (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl px-4 py-3">
                  <p className="text-sm font-bold text-red-700 mb-3 text-center">정말 취소하시겠어요?</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setShowCancel(false)}
                      className="py-2.5 rounded-2xl border-2 border-pick-border text-pick-text-sub font-bold text-sm active:scale-95 transition-transform"
                    >
                      돌아가기
                    </button>
                    <button
                      disabled={loading}
                      onClick={handleCancelConfirm}
                      className="py-2.5 rounded-2xl bg-red-500 text-white font-bold text-sm active:scale-95 transition-transform disabled:opacity-50"
                    >
                      {loading
                        ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin mx-auto block" />
                        : "취소 확인"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 라이더 호출됨 — 조리는 계속, 라이더 출발 중 */}
          {order.status === "calling_rider" && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-2xl px-3 py-2">
                <Bike size={14} className="text-orange-500 flex-shrink-0" />
                <span className="text-xs text-orange-600 font-bold">라이더 출발 중 — 조리 마무리하세요</span>
              </div>
              {!showCancel ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      disabled={notifying}
                      onClick={handleNotifyRiders}
                      className="flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-orange-100 border-2 border-orange-300 text-orange-700 font-bold text-sm active:scale-95 transition-transform disabled:opacity-50"
                    >
                      {notifying
                        ? <span className="w-4 h-4 border-2 border-orange-400/40 border-t-orange-600 rounded-full animate-spin" />
                        : <Bell size={14} />}
                      라이더 재호출
                    </button>
                    <button
                      disabled={loading}
                      onClick={() => handleStatus("ready")}
                      className="flex items-center justify-center gap-1.5 py-3 rounded-2xl bg-green-500 text-white font-bold text-sm active:scale-95 transition-transform shadow-md disabled:opacity-50"
                    >
                      {loading
                        ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        : <ChefHat size={14} />}
                      조리 완료
                    </button>
                  </div>
                  <button
                    disabled={loading}
                    onClick={() => setShowCancel(true)}
                    className="w-full text-xs text-gray-400 underline py-1 active:opacity-60 transition-opacity"
                  >
                    주문 취소
                  </button>
                </>
              ) : (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl px-4 py-3">
                  <p className="text-sm font-bold text-red-700 mb-3 text-center">정말 취소하시겠어요?</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setShowCancel(false)}
                      className="py-2.5 rounded-2xl border-2 border-pick-border text-pick-text-sub font-bold text-sm active:scale-95 transition-transform"
                    >
                      돌아가기
                    </button>
                    <button
                      disabled={loading}
                      onClick={handleCancelConfirm}
                      className="py-2.5 rounded-2xl bg-red-500 text-white font-bold text-sm active:scale-95 transition-transform disabled:opacity-50"
                    >
                      {loading
                        ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin mx-auto block" />
                        : "취소 확인"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {order.status === "ready" && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
                <CheckCircle size={16} className="text-green-600" />
                <span className="text-sm font-bold text-green-700">
                  {order.rider_id ? "조리 완료 — 라이더 픽업 대기 중" : "조리 완료 — 라이더 배정 중"}
                </span>
              </div>
              {!showCancel ? (
                <>
                  {!order.rider_id && (
                    <button
                      disabled={notifying}
                      onClick={handleNotifyRiders}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-orange-100 border-2 border-orange-300 text-orange-700 font-bold text-sm active:scale-95 transition-transform disabled:opacity-50"
                    >
                      {notifying
                        ? <span className="w-4 h-4 border-2 border-orange-400/40 border-t-orange-600 rounded-full animate-spin" />
                        : <Bell size={14} />}
                      라이더 재호출 🛵
                    </button>
                  )}
                  <button
                    disabled={loading}
                    onClick={() => setShowCancel(true)}
                    className="w-full text-xs text-gray-400 underline py-1 active:opacity-60 transition-opacity"
                  >
                    주문 취소
                  </button>
                </>
              ) : (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl px-4 py-3">
                  <p className="text-sm font-bold text-red-700 mb-3 text-center">정말 취소하시겠어요?</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setShowCancel(false)}
                      className="py-2.5 rounded-2xl border-2 border-pick-border text-pick-text-sub font-bold text-sm active:scale-95 transition-transform"
                    >
                      돌아가기
                    </button>
                    <button
                      disabled={loading}
                      onClick={handleCancelConfirm}
                      className="py-2.5 rounded-2xl bg-red-500 text-white font-bold text-sm active:scale-95 transition-transform disabled:opacity-50"
                    >
                      {loading
                        ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin mx-auto block" />
                        : "취소 확인"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {(order.status === "picked_up" || order.status === "delivering") && (
            <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-2xl px-4 py-3">
              <Bike size={16} className="text-purple-600" />
              <span className="text-sm font-bold text-purple-700">배달 중 🛵</span>
            </div>
          )}

          {order.status === "delivered" && (
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
              <CheckCircle size={16} className="text-gray-400" />
              <span className="text-sm font-bold text-gray-500">배달 완료</span>
            </div>
          )}

          {(order.status === "cancelled" || order.status === "refunded") && (
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

// ── 메인 페이지 ──────────────────────────────────────
type Tab = "active" | "done";

export default function OwnerOrdersPage() {
  const [orders,   setOrders]   = useState<Order[]>([]);
  const [storeId,  setStoreId]  = useState<string | null>(null);
  const [tab,      setTab]      = useState<Tab>("active");
  const [loading,  setLoading]  = useState(true);
  const [newAlert, setNewAlert] = useState(0);   // 신규 주문 건수
  const [soundOn,  setSoundOn]  = useState(true);
  const { play: playOrderSound, stop: stopOrderSound, unlock: unlockSound } = useOrderSound();
  const alertRef = useRef(newAlert);

  const fetchOrders = useCallback(async (t: Tab = tab) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/stores/my/orders?tab=${t}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders ?? []);
        if (data.storeId) setStoreId(data.storeId);
      }
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // newAlert ref 동기화 (클로저 stale 방지)
  useEffect(() => { alertRef.current = newAlert; }, [newAlert]);

  // 신규 주문 INSERT 알림 + 소리
  useStoreOrderRealtime(storeId, () => {
    setNewAlert((n) => n + 1);
    if (soundOn) playOrderSound();
    if (tab === "active") fetchOrders("active");
  });

  // 주문 상태 UPDATE 실시간 반영 — Realtime 보조
  useStoreOrderStatusRealtime(storeId, (orderId, newStatus) => {
    if (newStatus === "cancelled") stopOrderSound();
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  });

  // 폴링 — 15초마다 active 탭 자동 갱신 (Realtime 누락 대비)
  // 고객 취소 등 외부 변경이 최대 15초 내에 반영됨
  const ordersRef = useRef(orders);
  useEffect(() => { ordersRef.current = orders; }, [orders]);

  useEffect(() => {
    if (!storeId) return;
    const interval = setInterval(async () => {
      if (tab !== "active") return;
      const res = await fetch("/api/stores/my/orders?tab=active");
      if (!res.ok) return;
      const data = await res.json();
      const fresh: Order[] = data.orders ?? [];

      // 이전에 pending 이었던 주문이 사라지거나 cancelled 가 되면 소리 중단
      const prevPendingIds = ordersRef.current
        .filter((o) => o.status === "pending")
        .map((o) => o.id);
      const freshMap = new Map(fresh.map((o) => [o.id, o]));
      const hasCancelledPending = prevPendingIds.some(
        (id) => !freshMap.has(id) || freshMap.get(id)?.status === "cancelled"
      );
      if (hasCancelledPending) stopOrderSound();

      setOrders(fresh);
    }, 15000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, tab]);

  const handleStatusChange = async (id: string, status: OrderStatus, estimatedTime?: number) => {
    const res = await fetch(`/api/orders/${id}/status`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ status, ...(estimatedTime ? { estimatedTime } : {}) }),
    });
    if (res.ok) {
      // 수락(preparing) 또는 취소 시 알림음 중단
      if (["preparing", "calling_rider", "cancelled"].includes(status)) stopOrderSound();
      setOrders((prev) =>
        prev.map((o) =>
          o.id === id
            ? { ...o, status, ...(estimatedTime ? { estimated_time: estimatedTime } : {}) }
            : o
        )
      );
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error ?? "상태 변경에 실패했습니다");
    }
  };

  const handleCancel = async (id: string) => {
    const res = await fetch(`/api/orders/${id}/cancel`, { method: "POST" });
    if (res.ok) {
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: "cancelled" as OrderStatus } : o))
      );
    } else {
      const err = await res.json().catch(() => ({}));
      alert(err.error ?? "주문 취소에 실패했습니다");
    }
  };

  const handleTabChange = (t: Tab) => {
    setTab(t);
    fetchOrders(t);
    if (t === "active") setNewAlert(0);
  };

  const activeOrders  = orders.filter((o) => !["delivered","cancelled","refunded"].includes(o.status));
  const doneOrders    = orders.filter((o) =>  ["delivered","cancelled","refunded"].includes(o.status));
  const pendingCount  = orders.filter((o) => o.status === "pending").length;
  const displayOrders = tab === "active" ? activeOrders : doneOrders;

  return (
    <div className="min-h-full py-5">
      <div className="px-4 mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-black text-pick-text text-xl">주문 관리 📋</h1>
          <p className="text-sm text-pick-text-sub mt-0.5">실시간으로 주문을 확인하고 처리하세요</p>
        </div>
        <div className="flex items-center gap-2">
          {/* 소리 알림 토글 */}
          <button
            onClick={() => { unlockSound(); setSoundOn((v) => !v); }}
            className={`p-2 rounded-full border transition-colors ${
              soundOn
                ? "bg-pick-purple text-white border-pick-purple"
                : "bg-pick-bg border-pick-border text-pick-text-sub"
            }`}
            title={soundOn ? "알림 소리 켜짐" : "알림 소리 꺼짐"}
          >
            {soundOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>
          <button
            onClick={() => fetchOrders()}
            className="p-2 rounded-full bg-pick-bg border border-pick-border text-pick-text-sub"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* 신규 주문 알림 배너 */}
      {newAlert > 0 && tab !== "active" && (
        <div
          className="mx-4 mb-3 bg-red-500 text-white rounded-2xl px-4 py-3 flex items-center justify-between cursor-pointer active:scale-95 transition-transform"
          onClick={() => handleTabChange("active")}
        >
          <div className="flex items-center gap-2">
            <Bell size={16} className="animate-bounce" />
            <span className="text-sm font-black">새 주문 {newAlert}건이 들어왔어요!</span>
          </div>
          <span className="text-xs font-bold underline">확인하기</span>
        </div>
      )}

      {/* 탭 */}
      <div className="flex gap-2 px-4 mb-4">
        {(["active", "done"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => handleTabChange(t)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all ${
              tab === t
                ? "bg-amber-500 text-white shadow-md"
                : "bg-white text-pick-text-sub border-2 border-pick-border"
            }`}
          >
            {t === "active" ? "진행 중" : "완료 / 취소"}
            {t === "active" && (pendingCount > 0 || newAlert > 0) && (
              <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                tab === "active" ? "bg-white/30 text-white" : "bg-red-500 text-white"
              }`}>
                {pendingCount || newAlert}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 주문 목록 */}
      <div className="px-4 flex flex-col gap-3">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-pick-purple border-t-transparent rounded-full animate-spin" />
          </div>
        ) : displayOrders.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-pick-text-sub">
            <span className="text-5xl mb-3">{tab === "active" ? "🎉" : "📋"}</span>
            <p className="text-sm font-medium">
              {tab === "active" ? "모든 주문이 처리됐어요!" : "완료된 주문이 없어요"}
            </p>
          </div>
        ) : (
          displayOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusChange={handleStatusChange}
              onCancel={handleCancel}
            />
          ))
        )}
      </div>
    </div>
  );
}

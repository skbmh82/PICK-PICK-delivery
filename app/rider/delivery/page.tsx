"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MapPin, Package, CheckCircle, X, Clock, Bike, RefreshCw, Navigation } from "lucide-react";

// ── 타입 ──────────────────────────────────────────────
type DBStatus = "ready" | "picked_up" | "delivering" | "delivered" | "cancelled";

interface DeliveryOrder {
  id: string;
  status: DBStatus;
  total_amount: number;
  delivery_fee: number;
  delivery_address: string;
  created_at: string;
  stores: { id: string; name: string; address: string } | null;
  order_items: { id: string; menu_name: string; quantity: number }[];
  rider_earnings: { amount_pick: number }[] | null;
}

interface AvailableOrder {
  id: string;
  status: string;
  total_amount: number;
  delivery_fee: number;
  delivery_address: string;
  created_at: string;
  stores: { id: string; name: string; address: string } | null;
  order_items: { id: string; menu_name: string; quantity: number }[];
}

// ── 상태 설정 ─────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  ready:      { label: "수락 대기", color: "text-blue-600",  bg: "bg-blue-50",  border: "border-blue-200" },
  picked_up:  { label: "픽업 이동", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  delivering: { label: "배달 중",  color: "text-sky-600",   bg: "bg-sky-50",   border: "border-sky-200" },
  delivered:  { label: "배달 완료", color: "text-gray-400",  bg: "bg-gray-50",  border: "border-gray-200" },
  cancelled:  { label: "취소",     color: "text-gray-400",  bg: "bg-gray-50",  border: "border-gray-100" },
};

// ── 배달 가능 주문 카드 ────────────────────────────────
function AvailableCard({
  order,
  onAccept,
  loading,
}: {
  order: AvailableOrder;
  onAccept: (id: string) => Promise<void>;
  loading: boolean;
}) {
  const itemSummary = order.order_items
    .slice(0, 3)
    .map((i) => `${i.menu_name} x${i.quantity}`)
    .join(", ");
  const timeStr = new Date(order.created_at).toLocaleTimeString("ko-KR", {
    hour: "2-digit", minute: "2-digit",
  });
  const earnPick = Number(order.delivery_fee) > 0 ? Number(order.delivery_fee) : 3000;

  return (
    <div className="bg-white rounded-3xl border-2 border-blue-200 shadow-sm overflow-hidden">
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-black px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
            수락 대기
          </span>
          <span className="font-black text-sky-600 text-sm">
            +{earnPick.toLocaleString()} PICK
          </span>
        </div>

        <div className="flex gap-2 mb-3">
          <span className="flex items-center gap-1 text-xs bg-pick-bg border border-pick-border text-pick-text-sub font-medium px-3 py-1.5 rounded-full">
            <Clock size={11} />
            {timeStr} 요청
          </span>
        </div>

        <div className="flex items-start gap-2 mb-2">
          <div className="flex flex-col items-center gap-1 flex-shrink-0 mt-0.5">
            <span className="text-xl">🍽️</span>
            <div className="w-0.5 h-5 bg-pick-border" />
            <MapPin size={16} className="text-sky-500" />
          </div>
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <div>
              <p className="text-xs text-pick-text-sub font-medium">픽업</p>
              <p className="font-bold text-pick-text text-sm">{order.stores?.name ?? "가게"}</p>
              <p className="text-xs text-pick-text-sub truncate">{order.stores?.address ?? ""}</p>
            </div>
            <div>
              <p className="text-xs text-pick-text-sub font-medium">배달</p>
              <p className="text-xs text-pick-text truncate">{order.delivery_address}</p>
            </div>
          </div>
        </div>

        <div className="bg-pick-bg rounded-2xl px-3 py-2.5 mb-3">
          <p className="text-xs text-pick-text-sub truncate">{itemSummary}</p>
          <p className="text-xs font-bold text-pick-text mt-0.5">
            주문 금액 {Number(order.total_amount).toLocaleString()}원
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            disabled={loading}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-red-200 bg-red-50 text-red-600 font-bold text-sm active:scale-95 transition-transform disabled:opacity-50"
          >
            <X size={15} />
            거절
          </button>
          <button
            disabled={loading}
            onClick={() => onAccept(order.id)}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-400 text-white font-bold text-sm active:scale-95 transition-transform shadow-md disabled:opacity-50"
          >
            {loading
              ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <Bike size={15} />
            }
            수락
          </button>
        </div>
      </div>
    </div>
  );
}

// ── GPS 위치 전송 훅 ──────────────────────────────────
function useGpsTracking(isTracking: boolean) {
  const watchIdRef  = useRef<number | null>(null);
  const [gpsActive, setGpsActive] = useState(false);

  const sendLocation = useCallback(async (lat: number, lng: number) => {
    await fetch("/api/rider/location", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lng, isActive: true }),
    }).catch(() => {/* 네트워크 오류 무시 */});
  }, []);

  useEffect(() => {
    if (!isTracking || !navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setGpsActive(true);
        void sendLocation(pos.coords.latitude, pos.coords.longitude);
      },
      () => setGpsActive(false),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 },
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      // 배달 종료 시 비활성 처리
      fetch("/api/rider/location", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat: 0, lng: 0, isActive: false }),
      }).catch(() => {});
    };
  }, [isTracking, sendLocation]);

  return gpsActive;
}

// ── 내 배달 카드 ───────────────────────────────────────
function DeliveryCard({
  order,
  onStatusChange,
  loadingId,
}: {
  order: DeliveryOrder;
  onStatusChange: (id: string, status: DBStatus) => Promise<void>;
  loadingId: string | null;
}) {
  const cfg      = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.delivered;
  const loading  = loadingId === order.id;
  const isDelivering = order.status === "delivering";
  const gpsActive    = useGpsTracking(isDelivering);
  const isDone  = order.status === "delivered" || order.status === "cancelled";
  const earn    = Array.isArray(order.rider_earnings)
    ? Number(order.rider_earnings[0]?.amount_pick ?? 0)
    : 0;
  const itemSummary = order.order_items
    .slice(0, 3)
    .map((i) => `${i.menu_name} x${i.quantity}`)
    .join(", ");

  return (
    <div className={`bg-white rounded-3xl border-2 ${cfg.border} shadow-sm overflow-hidden`}>
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-black px-3 py-1.5 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
            {cfg.label}
          </span>
          <span className="font-black text-sky-600 text-sm">
            +{earn > 0 ? earn.toLocaleString() : (Number(order.delivery_fee) > 0 ? Number(order.delivery_fee).toLocaleString() : "3,000")} PICK
          </span>
        </div>

        <div className="flex items-start gap-2 mb-2">
          <div className="flex flex-col items-center gap-1 flex-shrink-0 mt-0.5">
            <span className="text-xl">🍽️</span>
            <div className="w-0.5 h-5 bg-pick-border" />
            <MapPin size={16} className="text-sky-500" />
          </div>
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <div>
              <p className="text-xs text-pick-text-sub font-medium">픽업</p>
              <p className="font-bold text-pick-text text-sm">{order.stores?.name ?? "가게"}</p>
              <p className="text-xs text-pick-text-sub truncate">{order.stores?.address ?? ""}</p>
            </div>
            <div>
              <p className="text-xs text-pick-text-sub font-medium">배달</p>
              <p className="text-xs text-pick-text truncate">{order.delivery_address}</p>
            </div>
          </div>
        </div>

        <div className="bg-pick-bg rounded-2xl px-3 py-2.5 mb-3">
          <p className="text-xs text-pick-text-sub truncate">{itemSummary}</p>
          <p className="text-xs font-bold text-pick-text mt-0.5">
            주문 금액 {Number(order.total_amount).toLocaleString()}원
          </p>
        </div>

        {/* 배달 중 GPS 상태 */}
        {isDelivering && (
          <div className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 mb-3 ${
            gpsActive ? "bg-green-50 border border-green-200" : "bg-amber-50 border border-amber-200"
          }`}>
            <Navigation size={14} className={gpsActive ? "text-green-600 animate-pulse" : "text-amber-600"} />
            <span className={`text-xs font-bold ${gpsActive ? "text-green-600" : "text-amber-600"}`}>
              {gpsActive ? "위치 공유 중 — 고객에게 실시간 전송되고 있어요" : "GPS 신호 확인 중..."}
            </span>
          </div>
        )}

        {!isDone && (
          <>
            {order.status === "picked_up" && (
              <button
                disabled={loading}
                onClick={() => onStatusChange(order.id, "delivering")}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-amber-500 text-white font-bold text-sm active:scale-95 transition-transform shadow-md disabled:opacity-50"
              >
                {loading
                  ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : <Package size={15} />
                }
                픽업 완료
              </button>
            )}
            {order.status === "delivering" && (
              <button
                disabled={loading}
                onClick={() => onStatusChange(order.id, "delivered")}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-green-500 text-white font-bold text-sm active:scale-95 transition-transform shadow-md disabled:opacity-50"
              >
                {loading
                  ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : <CheckCircle size={15} />
                }
                배달 완료
              </button>
            )}
          </>
        )}

        {order.status === "delivered" && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
            <CheckCircle size={16} className="text-green-500" />
            <span className="text-sm font-bold text-green-600">
              배달 완료! +{earn > 0 ? earn.toLocaleString() : "3,000"} PICK 적립
            </span>
          </div>
        )}

        {order.status === "cancelled" && (
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
            <X size={16} className="text-gray-400" />
            <span className="text-sm font-bold text-gray-400">취소된 주문</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 탭 ────────────────────────────────────────────────
type Tab = "available" | "active" | "done";

// ── 메인 페이지 ───────────────────────────────────────
export default function RiderDeliveryPage() {
  const [tab, setTab]                         = useState<Tab>("available");
  const [availableOrders, setAvailableOrders] = useState<AvailableOrder[]>([]);
  const [myDeliveries, setMyDeliveries]       = useState<DeliveryOrder[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [acceptingId, setAcceptingId]         = useState<string | null>(null);
  const [statusLoadingId, setStatusLoadingId] = useState<string | null>(null);

  const fetchTab = useCallback(async (t: Tab) => {
    setLoading(true);
    try {
      if (t === "available") {
        const res = await fetch("/api/rider/available-orders");
        if (res.ok) {
          const { orders } = await res.json();
          setAvailableOrders(orders ?? []);
        }
      } else {
        const res = await fetch(`/api/rider/deliveries?tab=${t === "active" ? "active" : "done"}`);
        if (res.ok) {
          const { orders } = await res.json();
          setMyDeliveries(orders ?? []);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTab(tab); }, [fetchTab, tab]);

  const handleAccept = async (orderId: string) => {
    setAcceptingId(orderId);
    try {
      const res = await fetch(`/api/rider/accept/${orderId}`, { method: "POST" });
      if (res.ok) {
        setAvailableOrders((prev) => prev.filter((o) => o.id !== orderId));
        setTab("active");
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error ?? "수락에 실패했습니다");
      }
    } finally {
      setAcceptingId(null);
    }
  };

  const handleStatusChange = async (orderId: string, status: DBStatus) => {
    setStatusLoadingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setMyDeliveries((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status } : o))
        );
        if (status === "delivered") {
          // 잠시 후 목록 새로고침 (PICK 적립 확인)
          setTimeout(() => fetchTab("active"), 500);
        }
      } else {
        alert("상태 변경에 실패했습니다");
      }
    } finally {
      setStatusLoadingId(null);
    }
  };

  const activeCount    = myDeliveries.filter((o) => ["picked_up","delivering"].includes(o.status)).length;
  const availableCount = availableOrders.length;

  return (
    <div className="min-h-full py-5">
      <div className="px-4 mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-black text-pick-text text-xl">배달 하기 🛵</h1>
          <p className="text-sm text-pick-text-sub mt-0.5">요청을 수락하고 배달을 완료하세요</p>
        </div>
        <button
          onClick={() => fetchTab(tab)}
          className="p-2 rounded-full bg-pick-bg border border-pick-border text-pick-text-sub"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 px-4 mb-4">
        {([
          { key: "available" as Tab, label: "배달 요청", count: availableCount },
          { key: "active"    as Tab, label: "진행 중",   count: activeCount    },
          { key: "done"      as Tab, label: "완료 / 취소", count: 0            },
        ] as const).map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-sm transition-all ${
              tab === key
                ? "bg-sky-500 text-white shadow-md"
                : "bg-white text-pick-text-sub border-2 border-pick-border"
            }`}
          >
            {label}
            {count > 0 && (
              <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                tab === key ? "bg-white/30 text-white" : "bg-red-500 text-white"
              }`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 목록 */}
      <div className="px-4 flex flex-col gap-3">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tab === "available" ? (
          availableOrders.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-pick-text-sub">
              <span className="text-5xl mb-3">🛵</span>
              <p className="text-sm font-medium">배달 가능한 주문이 없어요</p>
              <p className="text-xs mt-1 opacity-70">새 요청을 기다리는 중...</p>
            </div>
          ) : (
            availableOrders.map((order) => (
              <AvailableCard
                key={order.id}
                order={order}
                onAccept={handleAccept}
                loading={acceptingId === order.id}
              />
            ))
          )
        ) : myDeliveries.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-pick-text-sub">
            <span className="text-5xl mb-3">{tab === "active" ? "🎉" : "📋"}</span>
            <p className="text-sm font-medium">
              {tab === "active" ? "진행 중인 배달이 없어요" : "완료된 배달이 없어요"}
            </p>
          </div>
        ) : (
          myDeliveries.map((order) => (
            <DeliveryCard
              key={order.id}
              order={order}
              onStatusChange={handleStatusChange}
              loadingId={statusLoadingId}
            />
          ))
        )}
      </div>
    </div>
  );
}

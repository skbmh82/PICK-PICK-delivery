"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export type OrderStatus =
  | "pending" | "confirmed" | "preparing" | "calling_rider" | "ready"
  | "picked_up" | "delivering" | "delivered" | "cancelled" | "refunded";

// ── 주문 상태 실시간 구독 ─────────────────────────────
// orderId 가 바뀌면 자동으로 채널 재구독합니다
export function useOrderRealtime(
  orderId: string | null,
  onStatusChange: (newStatus: OrderStatus) => void
) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const cbRef      = useRef(onStatusChange);
  cbRef.current    = onStatusChange;

  useEffect(() => {
    if (!orderId) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`order:${orderId}`)
      .on(
        "postgres_changes",
        {
          event:  "UPDATE",
          schema: "public",
          table:  "orders",
        },
        (payload) => {
          const row = payload.new as { id: string; status: OrderStatus };
          if (row.id === orderId && row.status) cbRef.current(row.status);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);
}

// ── 가맹점 신규 주문 알림 (사장님용) ──────────────────
export function useStoreOrderRealtime(
  storeId: string | null,
  onNewOrder: (orderId: string) => void
) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const cbRef      = useRef(onNewOrder);
  cbRef.current    = onNewOrder; // 항상 최신 콜백 유지

  useEffect(() => {
    if (!storeId) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`store:${storeId}:orders`)
      .on(
        "postgres_changes",
        {
          event:  "INSERT",
          schema: "public",
          table:  "orders",
          filter: `store_id=eq.${storeId}`,
        },
        (payload) => {
          const orderId = (payload.new as { id: string }).id;
          if (orderId) cbRef.current(orderId);
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);
}

// ── 가맹점 주문 상태 변경 실시간 (고객 취소·라이더 픽업·배달 완료 등) ──
// NOTE: UPDATE 이벤트에 서버사이드 filter를 쓰면 REPLICA IDENTITY 미설정 시
//       이벤트가 묵음 처리됨. 필터 없이 받아서 클라이언트에서 store_id 확인.
export function useStoreOrderStatusRealtime(
  storeId: string | null,
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void
) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const cbRef      = useRef(onStatusChange);
  cbRef.current    = onStatusChange; // 항상 최신 콜백 유지

  useEffect(() => {
    if (!storeId) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`store:${storeId}:status`)
      .on(
        "postgres_changes",
        {
          event:  "UPDATE",
          schema: "public",
          table:  "orders",
          // 필터 없이 수신 후 클라이언트에서 store_id 검증
        },
        (payload) => {
          const row = payload.new as { id: string; status: OrderStatus; store_id: string };
          if (row.store_id === storeId && row.id && row.status) {
            cbRef.current(row.id, row.status);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);
}

// ── 라이더 배달 요청 알림 (status → ready 변경 감지) ────
// 사장님이 "라이더 호출" 또는 "조리 완료" 버튼을 누르면 fires
export function useRiderAvailableOrderRealtime(
  enabled: boolean,
  onNewRequest: () => void
) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const cbRef      = useRef(onNewRequest);
  cbRef.current    = onNewRequest;

  useEffect(() => {
    if (!enabled) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel("rider:available-orders")
      .on(
        "postgres_changes",
        {
          event:  "UPDATE",
          schema: "public",
          table:  "orders",
          filter: "status=eq.ready",
        },
        (payload) => {
          // rider_id 가 없고, 라이더 호출 또는 조리 완료 상태인 경우
          const row = payload.new as { status: string; rider_id: string | null };
          if ((row.status === "ready" || row.status === "calling_rider") && !row.rider_id) {
            cbRef.current();
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled]);
}

// ── 라이더: 배달 가능 주문의 상태 변경 감지 (취소 등) ──
// availableOrderIds 목록에 포함된 주문의 status 가 바뀌면 fires
export function useRiderAvailableOrderStatusRealtime(
  orderIds: string[],
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void
) {
  const cbRef      = useRef(onStatusChange);
  cbRef.current    = onStatusChange;
  const idsRef     = useRef(orderIds);
  idsRef.current   = orderIds;
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel("rider:available-order-status")
      .on(
        "postgres_changes",
        {
          event:  "UPDATE",
          schema: "public",
          table:  "orders",
        },
        (payload) => {
          const row = payload.new as { id: string; status: OrderStatus };
          if (row.id && row.status && idsRef.current.includes(row.id)) {
            cbRef.current(row.id, row.status);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // 한 번만 구독, orderIds 는 ref 로 관리
}

// ── 라이더 위치 실시간 구독 (배달 중인 사용자용) ────────
export function useRiderLocationRealtime(
  riderId: string | null,
  onLocationUpdate: (lat: number, lng: number) => void
) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!riderId) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    const channel = supabase
      .channel(`rider:${riderId}:location`)
      .on(
        "postgres_changes",
        {
          event:  "UPDATE",
          schema: "public",
          table:  "rider_locations",
          filter: `rider_id=eq.${riderId}`,
        },
        (payload) => {
          const { lat, lng } = payload.new as { lat: number; lng: number };
          if (lat && lng) onLocationUpdate(Number(lat), Number(lng));
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [riderId]);
}

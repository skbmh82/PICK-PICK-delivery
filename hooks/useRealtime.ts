"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export type OrderStatus =
  | "pending" | "confirmed" | "preparing" | "ready"
  | "picked_up" | "delivering" | "delivered" | "cancelled" | "refunded";

// ── 주문 상태 실시간 구독 ─────────────────────────────
// orderId 가 바뀌면 자동으로 채널 재구독합니다
export function useOrderRealtime(
  orderId: string | null,
  onStatusChange: (newStatus: OrderStatus) => void
) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!orderId) return;

    // 기존 채널 정리
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
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          const newStatus = (payload.new as { status: OrderStatus }).status;
          if (newStatus) onStatusChange(newStatus);
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
          if (orderId) onNewOrder(orderId);
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

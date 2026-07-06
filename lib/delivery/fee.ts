/**
 * 배달비 계산 공용 로직 (서버 사이드)
 *
 * 주문 생성 API와 장바구니 배달비 미리보기 API가 동일하게 사용 →
 * "미리보기 배달비"와 "실제 청구 배달비" 불일치 원천 차단.
 */

/** Haversine 공식 — 두 좌표 간 거리(km) */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R    = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a    =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface DeliveryZone {
  min_km:           number;
  max_km:           number;
  delivery_fee:     number;
  min_order_amount: number;
}

export interface ResolveDeliveryFeeParams {
  storeLat:    number | null;
  storeLng:    number | null;
  destLat:     number | null;
  destLng:     number | null;
  zones:       DeliveryZone[] | null;
  fallbackFee: number;   // 구역 미설정/좌표 없음 시 사용할 가게 기본 배달비
}

export interface ResolveDeliveryFeeResult {
  fee:          number;   // 확정 배달비
  zoneMinOrder: number;   // 매칭 구역의 최소 주문금액(없으면 0)
  outOfRange:   boolean;  // 구역은 있으나 어떤 구역에도 안 들어감(배달 불가)
  maxKm:        number | null;   // 배달 가능 최대 거리(에러 메시지용)
  distanceKm:   number | null;   // 계산된 거리
  usedZone:     boolean;  // 구역 배달비를 적용했는가(false면 fallback)
}

/**
 * 구역 기반 배달비 확정.
 * - 목적지/가게 좌표 없음 또는 구역 미설정 → fallbackFee 사용(usedZone=false)
 * - 구역 있으나 매칭 없음 → outOfRange=true
 * - 매칭 → 해당 구역 배달비 + 최소주문금액
 */
export function resolveDeliveryFee(p: ResolveDeliveryFeeParams): ResolveDeliveryFeeResult {
  const { storeLat, storeLng, destLat, destLng, zones, fallbackFee } = p;

  const base: ResolveDeliveryFeeResult = {
    fee:          fallbackFee,
    zoneMinOrder: 0,
    outOfRange:   false,
    maxKm:        null,
    distanceKm:   null,
    usedZone:     false,
  };

  if (
    destLat == null || destLng == null ||
    storeLat == null || storeLng == null ||
    !zones || zones.length === 0
  ) {
    return base;
  }

  const distKm = haversineKm(storeLat, storeLng, destLat, destLng);
  const sorted = [...zones].sort((a, b) => Number(a.min_km) - Number(b.min_km));
  const matched = sorted.find(
    (z) => distKm >= Number(z.min_km) && distKm < Number(z.max_km)
  );

  if (!matched) {
    return {
      ...base,
      outOfRange: true,
      maxKm:      Number(sorted[sorted.length - 1].max_km),
      distanceKm: distKm,
    };
  }

  return {
    fee:          Number(matched.delivery_fee),
    zoneMinOrder: Number(matched.min_order_amount),
    outOfRange:   false,
    maxKm:        Number(sorted[sorted.length - 1].max_km),
    distanceKm:   distKm,
    usedZone:     true,
  };
}

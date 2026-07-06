/**
 * 배달비 계산 공용 로직 (서버 사이드)
 *
 * 모델: "기본 구간 배달비 + 초과 거리 비례 할증"
 *   - 기본 구간(baseKm) 이내 → 기본 배달비(baseFee)
 *   - 초과 시 → baseFee + (거리 − baseKm) ÷ 할증단위(surchargeUnitKm) × 할증요금(surchargeFee)
 *     (올림 아님 — 거리에 정비례. 예: 기본5km/2000, 2km당 1000 → 10km = 4,500원)
 *   - 최대 배달거리(MAX_DELIVERY_KM = 20km) 초과 → 배달 불가
 *
 * 주문 생성 API와 배달비 미리보기 API가 동일하게 사용 →
 * "미리보기 배달비"와 "실제 청구 배달비" 불일치 원천 차단.
 */

/** 시스템 고정 최대 배달거리(km) — 초과 시 배달 불가 */
export const MAX_DELIVERY_KM = 20;

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

export interface DeliveryFeeConfig {
  baseKm:          number;   // 기본 구간 거리
  baseFee:         number;   // 기본 구간 배달비
  surchargeUnitKm: number;   // 할증 단위 거리
  surchargeFee:    number;   // 단위당 할증 요금
}

export interface ResolveDeliveryFeeParams extends DeliveryFeeConfig {
  storeLat: number | null;
  storeLng: number | null;
  destLat:  number | null;
  destLng:  number | null;
}

export interface ResolveDeliveryFeeResult {
  fee:        number;         // 확정 배달비
  outOfRange: boolean;        // 최대 배달거리 초과(배달 불가)
  distanceKm: number | null;  // 계산된 거리(좌표 없으면 null)
  maxKm:      number;         // 최대 배달거리(= MAX_DELIVERY_KM)
}

/** 거리·설정으로 배달비 계산 (좌표 무관 순수 함수) */
export function calcDeliveryFee(distanceKm: number, cfg: DeliveryFeeConfig): number {
  const { baseKm, baseFee, surchargeUnitKm, surchargeFee } = cfg;
  if (distanceKm <= baseKm) return roundTo10(baseFee);
  if (surchargeUnitKm <= 0) return roundTo10(baseFee);
  const over = distanceKm - baseKm;
  const fee  = baseFee + (over / surchargeUnitKm) * surchargeFee;
  return roundTo10(fee);
}

/** 10원 단위 반올림 (비례 계산 소수 금액 정리) */
function roundTo10(v: number): number {
  return Math.round(v / 10) * 10;
}

/**
 * 좌표 기반 배달비 확정.
 * - 목적지/가게 좌표 없음 → 거리 계산 불가 → 기본 배달비로 응답(outOfRange=false)
 * - 거리 > MAX_DELIVERY_KM → outOfRange=true
 * - 그 외 → 기본+할증 계산
 */
export function resolveDeliveryFee(p: ResolveDeliveryFeeParams): ResolveDeliveryFeeResult {
  const { storeLat, storeLng, destLat, destLng, baseKm, baseFee, surchargeUnitKm, surchargeFee } = p;
  const cfg: DeliveryFeeConfig = { baseKm, baseFee, surchargeUnitKm, surchargeFee };

  if (destLat == null || destLng == null || storeLat == null || storeLng == null) {
    return { fee: roundTo10(baseFee), outOfRange: false, distanceKm: null, maxKm: MAX_DELIVERY_KM };
  }

  const distKm = haversineKm(storeLat, storeLng, destLat, destLng);

  if (distKm > MAX_DELIVERY_KM) {
    return { fee: roundTo10(baseFee), outOfRange: true, distanceKm: distKm, maxKm: MAX_DELIVERY_KM };
  }

  return { fee: calcDeliveryFee(distKm, cfg), outOfRange: false, distanceKm: distKm, maxKm: MAX_DELIVERY_KM };
}

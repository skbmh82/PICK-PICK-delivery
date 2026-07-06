import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { geocodeAddress } from "@/lib/kakao/geocode";
import { resolveDeliveryFee, MAX_DELIVERY_KM } from "@/lib/delivery/fee";

/**
 * GET /api/stores/[storeId]/delivery-fee — 배달 주소 기준 배달비 미리보기
 *
 * 쿼리: lat & lng (선호) 또는 address (좌표 없을 때 서버 지오코딩)
 * 주문 생성 API(/api/orders)와 동일한 resolveDeliveryFee 로직 → 청구액과 항상 일치.
 *
 * 응답: { fee, outOfRange, maxKm, distanceKm }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  const { storeId } = await params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminSupabaseClient() as any;

  const sp      = request.nextUrl.searchParams;
  const latRaw  = sp.get("lat");
  const lngRaw  = sp.get("lng");
  const address = sp.get("address") ?? "";

  // 가게 정보 (좌표 + 배달비 설정)
  const { data: store } = await admin
    .from("stores")
    .select("id, lat, lng, delivery_fee, delivery_base_km, delivery_surcharge_unit_km, delivery_surcharge_fee")
    .eq("id", storeId)
    .single();

  if (!store) {
    return NextResponse.json({ error: "가맹점을 찾을 수 없습니다" }, { status: 404 });
  }

  const baseFee = Number(store.delivery_fee ?? 0);

  // 목적지 좌표 확정 — 쿼리 좌표 우선, 없으면 주소 지오코딩
  let destLat: number | null = latRaw != null && latRaw !== "" ? Number(latRaw) : null;
  let destLng: number | null = lngRaw != null && lngRaw !== "" ? Number(lngRaw) : null;
  if ((destLat == null || destLng == null || Number.isNaN(destLat) || Number.isNaN(destLng)) && address.trim()) {
    const coords = await geocodeAddress(address.trim());
    if (coords) { destLat = coords.lat; destLng = coords.lng; }
  }
  if (destLat != null && Number.isNaN(destLat)) destLat = null;
  if (destLng != null && Number.isNaN(destLng)) destLng = null;

  // 좌표를 못 구하면 기본 배달비로 응답 (미리보기 실패 아님)
  if (destLat == null || destLng == null) {
    return NextResponse.json({
      fee:        baseFee,
      outOfRange: false,
      maxKm:      MAX_DELIVERY_KM,
      distanceKm: null,
    });
  }

  const resolved = resolveDeliveryFee({
    storeLat:        store.lat != null ? Number(store.lat) : null,
    storeLng:        store.lng != null ? Number(store.lng) : null,
    destLat,
    destLng,
    baseKm:          Number(store.delivery_base_km ?? 3),
    baseFee,
    surchargeUnitKm: Number(store.delivery_surcharge_unit_km ?? 2),
    surchargeFee:    Number(store.delivery_surcharge_fee ?? 0),
  });

  return NextResponse.json({
    fee:        resolved.fee,
    outOfRange: resolved.outOfRange,
    maxKm:      resolved.maxKm,
    distanceKm: resolved.distanceKm,
  });
}

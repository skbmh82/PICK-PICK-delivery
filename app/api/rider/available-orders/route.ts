import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

// 라이더에게 주문을 노출할 최대 반경 (km)
const RIDER_VISIBLE_RADIUS_KM = 5;

/** Haversine 공식 — 두 좌표 간 거리(km) 계산 */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R    = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a    =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// GET /api/rider/available-orders — status='ready'/'calling_rider' 이고 rider 미배정 + 반경 내 주문만
export async function GET() {
  const supabase = await createServerSupabaseClient();
  const admin    = getAdminSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (admin as any)
    .from("users")
    .select("id, role")
    .eq("auth_id", user.id)
    .single();

  if (!profile || !["rider", "admin"].includes(profile.role)) {
    return NextResponse.json({ error: "라이더 권한이 필요합니다" }, { status: 403 });
  }

  // 라이더 위치 + 온라인 여부 조회
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: location } = await (admin as any)
    .from("rider_locations")
    .select("is_active, lat, lng")
    .eq("rider_id", profile.id)
    .single();

  if (!location?.is_active) {
    return NextResponse.json({ orders: [] });
  }

  const riderLat = Number(location.lat);
  const riderLng = Number(location.lng);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: orders, error } = await (admin as any)
    .from("orders")
    .select(`
      id, status, total_amount, delivery_fee, delivery_address, delivery_lat, delivery_lng, delivery_note, created_at,
      stores ( id, name, address, lat, lng ),
      users!orders_user_id_fkey ( id, name, phone ),
      order_items ( id, menu_name, quantity )
    `)
    .in("status", ["calling_rider", "ready"])
    .is("rider_id", null)
    .order("created_at", { ascending: false })
    .limit(50); // 넉넉히 가져와서 거리 필터링 후 반환

  if (error) {
    console.error("available-orders 오류:", error.message);
    return NextResponse.json({ error: "주문 조회에 실패했습니다" }, { status: 500 });
  }

  // 라이더 위치 기준 반경 내 주문만 필터링 (가게 좌표 기준)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nearby = (orders ?? []).filter((o: any) => {
    const storeLat = Number(o.stores?.lat);
    const storeLng = Number(o.stores?.lng);
    if (!storeLat || !storeLng) return true; // 좌표 없으면 일단 노출
    if (!riderLat || !riderLng) return true; // 라이더 좌표 미등록 시 일단 노출
    const dist = haversineKm(riderLat, riderLng, storeLat, storeLng);
    return dist <= RIDER_VISIBLE_RADIUS_KM;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }).map((o: any) => ({
    ...o,
    distanceKm: (riderLat && riderLng && o.stores?.lat && o.stores?.lng)
      ? Math.round(haversineKm(riderLat, riderLng, Number(o.stores.lat), Number(o.stores.lng)) * 10) / 10
      : null,
  }));

  // 가까운 순으로 정렬
  nearby.sort((a: { distanceKm: number | null }, b: { distanceKm: number | null }) => {
    if (a.distanceKm === null) return 1;
    if (b.distanceKm === null) return -1;
    return a.distanceKm - b.distanceKm;
  });

  return NextResponse.json({ orders: nearby });
}

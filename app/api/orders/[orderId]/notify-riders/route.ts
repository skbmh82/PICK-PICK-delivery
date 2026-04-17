import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/notifications";

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

const RIDER_NOTIFY_RADIUS_KM = 5;

// POST /api/orders/[orderId]/notify-riders
// 사장님이 수동으로 근처 라이더에게 재호출 알림을 보내는 API
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
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

  if (!profile || !["owner", "admin"].includes(profile.role)) {
    return NextResponse.json({ error: "사장님 권한이 필요합니다" }, { status: 403 });
  }

  // 주문 조회 — ready 또는 calling_rider 이고 rider 미배정 상태만 허용
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: order } = await (admin as any)
    .from("orders")
    .select("id, status, rider_id, delivery_address, stores!inner(name, owner_id, lat, lng)")
    .eq("id", orderId)
    .single();

  if (!order) {
    return NextResponse.json({ error: "주문을 찾을 수 없습니다" }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const storeOwner = (order.stores as any)?.owner_id ?? null;
  if (profile.role === "owner" && profile.id !== storeOwner) {
    return NextResponse.json({ error: "이 가게의 주문이 아닙니다" }, { status: 403 });
  }

  if (!["ready", "calling_rider"].includes(order.status)) {
    return NextResponse.json(
      { error: "라이더를 호출할 수 있는 상태가 아닙니다" },
      { status: 409 }
    );
  }

  if (order.rider_id) {
    return NextResponse.json(
      { error: "이미 라이더가 배정된 주문입니다" },
      { status: 409 }
    );
  }

  // 근처 활성 라이더 조회
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: activeRiders } = await (admin as any)
    .from("rider_locations")
    .select("rider_id, lat, lng")
    .eq("is_active", true);

  if (!activeRiders || activeRiders.length === 0) {
    return NextResponse.json({ ok: true, notified: 0, message: "현재 온라인 라이더가 없습니다" });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const storeLat  = Number((order.stores as any)?.lat ?? 0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const storeLng  = Number((order.stores as any)?.lng ?? 0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const storeName = (order.stores as any)?.name ?? "가게";

  const nearbyRiders = activeRiders.filter((r: { rider_id: string; lat: number; lng: number }) => {
    if (!storeLat || !storeLng) return true;
    if (!r.lat   || !r.lng)    return false;
    return haversineKm(storeLat, storeLng, Number(r.lat), Number(r.lng)) <= RIDER_NOTIFY_RADIUS_KM;
  });

  if (nearbyRiders.length === 0) {
    return NextResponse.json({ ok: true, notified: 0, message: "5km 내 온라인 라이더가 없습니다" });
  }

  await Promise.all(
    nearbyRiders.map((r: { rider_id: string }) =>
      createNotification({
        userId: r.rider_id,
        type:   "order_update",
        title:  `🔔 라이더 재요청이 있어요 🛵`,
        body:   `${storeName} → ${order.delivery_address ?? "배달지"} (배차 대기 중)`,
        data:   { orderId, type: "rider_request" },
      })
    )
  );

  return NextResponse.json({ ok: true, notified: nearbyRiders.length });
}

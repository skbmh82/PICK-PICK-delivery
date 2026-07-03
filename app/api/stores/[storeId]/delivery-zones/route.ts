import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

// GET /api/stores/[storeId]/delivery-zones — 배달 구역 목록 (누구나)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  const { storeId } = await params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminSupabaseClient() as any;

  const { data, error } = await admin
    .from("delivery_zones")
    .select("id, min_km, max_km, delivery_fee, min_order_amount, sort_order")
    .eq("store_id", storeId)
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "배달 구역 조회에 실패했습니다" }, { status: 500 });
  }

  return NextResponse.json({ zones: data ?? [] });
}

const ZoneSchema = z.object({
  min_km:           z.number().min(0),
  max_km:           z.number().positive(),
  delivery_fee:     z.number().min(0),
  min_order_amount: z.number().min(0),
  sort_order:       z.number().int().min(0).optional(),
});

const PutSchema = z.object({
  zones: z.array(ZoneSchema).min(1).max(10),
});

// PUT /api/stores/[storeId]/delivery-zones — 구역 전체 교체 (사장님만)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  const { storeId } = await params;
  const supabase = await createServerSupabaseClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminSupabaseClient() as any;

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  // 가게 소유자 확인
  const { data: store } = await admin
    .from("stores")
    .select("owner_id, users!stores_owner_id_fkey(auth_id)")
    .eq("id", storeId)
    .single();

  const ownerAuthId = store?.users?.auth_id;
  const { data: me } = await admin.from("users").select("role").eq("auth_id", user.id).single();

  if (!store || (ownerAuthId !== user.id && me?.role !== "admin")) {
    return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = PutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "입력값이 올바르지 않습니다", detail: parsed.error.flatten() }, { status: 400 });
  }

  // 범위 겹침 검증
  const zones = parsed.data.zones.sort((a, b) => a.min_km - b.min_km);
  for (let i = 0; i < zones.length; i++) {
    if (zones[i].max_km <= zones[i].min_km) {
      return NextResponse.json({ error: `구역 ${i + 1}: 최대 거리는 최소 거리보다 커야 합니다` }, { status: 400 });
    }
    if (i > 0 && zones[i].min_km < zones[i - 1].max_km) {
      return NextResponse.json({ error: `구역 ${i + 1}: 구역 범위가 겹칩니다` }, { status: 400 });
    }
  }

  // 기존 구역 삭제 후 재삽입
  await admin.from("delivery_zones").delete().eq("store_id", storeId);

  const rows = zones.map((z, i) => ({
    store_id:         storeId,
    min_km:           z.min_km,
    max_km:           z.max_km,
    delivery_fee:     z.delivery_fee,
    min_order_amount: z.min_order_amount,
    sort_order:       i,
  }));

  const { error: insertError } = await admin.from("delivery_zones").insert(rows);
  if (insertError) {
    return NextResponse.json({ error: "배달 구역 저장에 실패했습니다" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

const HourSchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  // 브라우저에 따라 HH:MM 또는 HH:MM:SS 로 넘어올 수 있어 모두 허용 후 앞 5자리만 사용
  open_time:   z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).transform((v) => v.slice(0, 5)),
  close_time:  z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).transform((v) => v.slice(0, 5)),
  is_closed:   z.boolean(),
});

const PutSchema = z.object({
  hours: z.array(HourSchema).length(7),
  is_open_override: z.boolean().optional(), // 임시 수동 영업 상태
});

async function getOwnerStore(user: { id: string }) {
  const admin = getAdminSupabaseClient() as ReturnType<typeof getAdminSupabaseClient> & {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    from: (t: string) => any;
  };
  const { data: profile } = await admin
    .from("users").select("id, role").eq("auth_id", user.id).single();
  if (!profile || !["owner", "admin"].includes(profile.role as string)) return null;

  const { data: storeList } = await admin
    .from("stores").select("id, is_open").eq("owner_id", profile.id)
    .order("created_at", { ascending: false }).limit(1);
  return storeList?.[0] ?? null;
}

// GET /api/stores/my/hours — 내 가게 영업시간 조회
export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const store = await getOwnerStore(user);
  if (!store) {
    return NextResponse.json({ error: "가게 정보를 찾을 수 없습니다" }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminSupabaseClient() as any;
  const { data: rows, error } = await admin
    .from("store_hours")
    .select("id, day_of_week, open_time, close_time, is_closed")
    .eq("store_id", store.id)
    .order("day_of_week", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "영업시간 조회에 실패했습니다" }, { status: 500 });
  }

  return NextResponse.json({ hours: rows ?? [], is_open: store.is_open });
}

// PUT /api/stores/my/hours — 영업시간 일괄 저장
export async function PUT(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const store = await getOwnerStore(user);
  if (!store) {
    return NextResponse.json({ error: "가게 정보를 찾을 수 없습니다" }, { status: 404 });
  }

  const body   = await request.json().catch(() => null);
  const parsed = PutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "올바른 데이터 형식이 아닙니다" }, { status: 400 });
  }

  const { hours, is_open_override } = parsed.data;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminSupabaseClient() as any;

  // 영업시간 upsert
  const upsertRows = hours.map((h) => ({
    store_id:    store.id,
    day_of_week: h.day_of_week,
    open_time:   h.open_time,
    close_time:  h.close_time,
    is_closed:   h.is_closed,
  }));

  const { error } = await admin
    .from("store_hours")
    .upsert(upsertRows, { onConflict: "store_id,day_of_week" });

  if (error) {
    console.error("store_hours upsert 오류:", error.message);
    return NextResponse.json({ error: "영업시간 저장에 실패했습니다" }, { status: 500 });
  }

  // 수동 영업 상태 override가 있으면 stores.is_open 업데이트
  if (typeof is_open_override === "boolean") {
    await admin
      .from("stores")
      .update({ is_open: is_open_override, updated_at: new Date().toISOString() })
      .eq("id", store.id);
  }

  return NextResponse.json({ ok: true });
}

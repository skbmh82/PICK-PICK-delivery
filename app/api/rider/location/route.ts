import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

const LocationSchema = z.object({
  lat:      z.number().min(-90).max(90),
  lng:      z.number().min(-180).max(180),
  isActive: z.boolean().optional(),
});

// PATCH /api/rider/location — 라이더 실시간 위치 업데이트
export async function PATCH(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminSupabaseClient() as any;

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const body   = await request.json().catch(() => null);
  const parsed = LocationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "위치 정보가 올바르지 않습니다" }, { status: 400 });
  }

  const { data: profile } = await admin
    .from("users")
    .select("id, role")
    .eq("auth_id", user.id)
    .single();

  if (!profile || !["rider", "admin"].includes(profile.role)) {
    return NextResponse.json({ error: "라이더 권한이 필요합니다" }, { status: 403 });
  }

  const { lat, lng, isActive = true } = parsed.data;

  // upsert — 없으면 insert, 있으면 update
  const { error: upsertError } = await admin
    .from("rider_locations")
    .upsert(
      {
        rider_id:   profile.id,
        lat,
        lng,
        is_active:  isActive,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "rider_id" },
    );

  if (upsertError) {
    console.error("위치 업데이트 오류:", upsertError.message);
    return NextResponse.json({ error: "위치 업데이트에 실패했습니다" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

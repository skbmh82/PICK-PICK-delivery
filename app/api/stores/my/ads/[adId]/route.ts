import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

const UpdateAdSchema = z.object({
  status: z.enum(["paused", "active"]).optional(),
});

/* ─── 광고 일시정지 / 재개 ─── */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ adId: string }> }
) {
  const { adId } = await params;

  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = UpdateAdSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const admin = getAdminSupabaseClient();

  // 소유권 확인
  const { data: owner } = await admin.from("users").select("id").eq("auth_id", user.id).single();
  if (!owner) return NextResponse.json({ error: "사용자 없음" }, { status: 404 });

  const { data: ad } = await admin
    .from("store_ads")
    .select("id, store_id, status")
    .eq("id", adId)
    .single();

  if (!ad) return NextResponse.json({ error: "광고를 찾을 수 없습니다" }, { status: 404 });

  const { data: store } = await admin
    .from("stores").select("owner_id").eq("id", ad.store_id).single();

  if (!store || store.owner_id !== owner.id) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  // pending/rejected는 변경 불가
  if (["pending", "rejected", "expired"].includes(ad.status)) {
    return NextResponse.json({ error: "변경할 수 없는 상태입니다" }, { status: 400 });
  }

  const { data: updated, error } = await admin
    .from("store_ads")
    .update({ status: parsed.data.status, updated_at: new Date().toISOString() })
    .eq("id", adId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ad: updated });
}

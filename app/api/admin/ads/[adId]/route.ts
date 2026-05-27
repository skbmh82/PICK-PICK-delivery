import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminSupabaseClient() as any;
  const { data: profile } = await admin
    .from("users").select("id, role").eq("auth_id", user.id).single();
  if (!profile || profile.role !== "admin") return null;
  return { profile, admin };
}

// PATCH /api/admin/ads/[adId] — 상태 변경
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ adId: string }> },
) {
  const ctx = await requireAdmin();
  if (!ctx) return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });

  const { adId } = await params;
  const body = await req.json() as { status: "active" | "paused" };

  const { admin } = ctx;
  const { error } = await admin
    .from("store_ads")
    .update({ status: body.status })
    .eq("id", adId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/ads/[adId] — 광고 삭제
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ adId: string }> },
) {
  const ctx = await requireAdmin();
  if (!ctx) return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });

  const { adId } = await params;
  const { admin } = ctx;
  const { error } = await admin
    .from("store_ads")
    .delete()
    .eq("id", adId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

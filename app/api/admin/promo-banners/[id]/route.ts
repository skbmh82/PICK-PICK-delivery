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

// PATCH /api/admin/promo-banners/[id] — 배너 수정
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = await requireAdmin();
  if (!ctx) return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });

  const { id } = await params;
  const body = await req.json() as Partial<{
    gradient:   string;
    badge:      string;
    badgeBg:    string;
    title:      string;
    sub:        string;
    href:       string;
    sortOrder:  number;
    isActive:   boolean;
    startsAt:   string | null;
    endsAt:     string | null;
  }>;

  const patch: Record<string, unknown> = {};
  if (body.gradient   !== undefined) patch.gradient   = body.gradient;
  if (body.badge      !== undefined) patch.badge      = body.badge;
  if (body.badgeBg    !== undefined) patch.badge_bg   = body.badgeBg;
  if (body.title      !== undefined) patch.title      = body.title;
  if (body.sub        !== undefined) patch.sub        = body.sub;
  if (body.href       !== undefined) patch.href       = body.href;
  if (body.sortOrder  !== undefined) patch.sort_order = body.sortOrder;
  if (body.isActive   !== undefined) patch.is_active  = body.isActive;
  if (body.startsAt   !== undefined) patch.starts_at  = body.startsAt;
  if (body.endsAt     !== undefined) patch.ends_at    = body.endsAt;

  const { admin } = ctx;
  const { error } = await admin
    .from("promo_banners")
    .update(patch)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/promo-banners/[id] — 배너 삭제
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = await requireAdmin();
  if (!ctx) return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });

  const { id } = await params;
  const { admin } = ctx;
  const { error } = await admin
    .from("promo_banners")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

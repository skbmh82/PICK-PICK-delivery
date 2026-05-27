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

// GET /api/admin/promo-banners — 전체 목록 (비활성 포함)
export async function GET() {
  const ctx = await requireAdmin();
  if (!ctx) return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });

  const { admin } = ctx;
  const { data, error } = await admin
    .from("promo_banners")
    .select("id, gradient, badge, badge_bg, title, sub, href, sort_order, is_active, starts_at, ends_at, created_at")
    .order("sort_order", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ banners: data ?? [] });
}

// POST /api/admin/promo-banners — 배너 등록
export async function POST(req: NextRequest) {
  const ctx = await requireAdmin();
  if (!ctx) return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });

  const body = await req.json() as {
    gradient:   string;
    badge:      string;
    badgeBg:    string;
    title:      string;
    sub?:       string;
    href:       string;
    sortOrder?: number;
    startsAt?:  string;
    endsAt?:    string;
  };

  if (!body.gradient || !body.badge || !body.title || !body.href) {
    return NextResponse.json({ error: "필수 항목이 누락됐습니다" }, { status: 400 });
  }

  const { admin } = ctx;
  const { data, error } = await admin
    .from("promo_banners")
    .insert({
      gradient:   body.gradient,
      badge:      body.badge,
      badge_bg:   body.badgeBg ?? "bg-white/30 text-white",
      title:      body.title,
      sub:        body.sub ?? null,
      href:       body.href,
      sort_order: body.sortOrder ?? 0,
      is_active:  true,
      starts_at:  body.startsAt ?? null,
      ends_at:    body.endsAt ?? null,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}

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

// GET /api/admin/ads — 광고 목록
export async function GET() {
  const ctx = await requireAdmin();
  if (!ctx) return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });

  const { admin } = ctx;
  const { data, error } = await admin
    .from("store_ads")
    .select(`
      id, type, status, start_date, end_date,
      banner_title, banner_sub, banner_gradient, created_at,
      stores ( id, name, category )
    `)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const ads = (data ?? []).map((row: Record<string, unknown>) => {
    const store = Array.isArray(row.stores) ? row.stores[0] : row.stores;
    return {
      id:             row.id,
      type:           row.type,
      status:         row.status,
      startDate:      row.start_date,
      endDate:        row.end_date,
      bannerTitle:    row.banner_title,
      bannerSub:      row.banner_sub,
      bannerGradient: row.banner_gradient,
      createdAt:      row.created_at,
      store:          store ?? null,
    };
  });

  return NextResponse.json({ ads });
}

// POST /api/admin/ads — 광고 등록
export async function POST(req: NextRequest) {
  const ctx = await requireAdmin();
  if (!ctx) return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });

  const body = await req.json() as {
    storeId: string;
    type: "top" | "banner";
    startDate: string;
    endDate: string;
    bannerTitle?: string;
    bannerSub?: string;
    bannerGradient?: string;
  };

  if (!body.storeId || !body.type || !body.startDate || !body.endDate) {
    return NextResponse.json({ error: "필수 항목이 누락됐습니다" }, { status: 400 });
  }

  const { admin } = ctx;
  const { data, error } = await admin
    .from("store_ads")
    .insert({
      store_id:        body.storeId,
      type:            body.type,
      status:          "active",
      start_date:      body.startDate,
      end_date:        body.endDate,
      banner_title:    body.bannerTitle ?? null,
      banner_sub:      body.bannerSub ?? null,
      banner_gradient: body.bannerGradient ?? null,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}

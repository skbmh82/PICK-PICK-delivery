import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

async function requireOwner() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminSupabaseClient() as any;
  const { data: profile } = await admin
    .from("users").select("id, role").eq("auth_id", user.id).single();
  if (!profile || !["owner", "admin"].includes(profile.role)) return null;
  // 본인 가게 확인
  const { data: store } = await admin
    .from("stores").select("id").eq("owner_id", profile.id).single();
  return store ? { profile, store, admin } : null;
}

// GET /api/owner/coupons — 내 가게 쿠폰 목록
export async function GET() {
  const ctx = await requireOwner();
  if (!ctx) return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });

  const { store, admin } = ctx;
  const { data: rows } = await admin
    .from("coupons")
    .select("id, code, title, description, type, value, min_order, max_uses, used_count, is_active, expires_at, created_at")
    .eq("store_id", store.id)
    .order("created_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const coupons = (rows ?? []).map((c: any) => ({
    id:          c.id,
    code:        c.code,
    title:       c.title,
    description: c.description,
    type:        c.type,
    value:       Number(c.value),
    minOrder:    Number(c.min_order ?? 0),
    maxUses:     c.max_uses,
    usedCount:   c.used_count ?? 0,
    isActive:    c.is_active,
    expiresAt:   c.expires_at,
    createdAt:   c.created_at,
  }));

  return NextResponse.json({ coupons });
}

// POST /api/owner/coupons — 가게 쿠폰 생성
const CreateCouponSchema = z.object({
  code:        z.string().min(2).max(30).toUpperCase(),
  title:       z.string().min(2).max(100),
  description: z.string().max(300).optional(),
  type:        z.enum(["fixed_pick", "pick_rate", "free_delivery"]),
  value:       z.number().min(0),
  minOrder:    z.number().min(0).default(0),
  maxUses:     z.number().int().positive().nullable().default(null),
  expiresAt:   z.string().datetime().nullable().optional(),
});

export async function POST(request: NextRequest) {
  const ctx = await requireOwner();
  if (!ctx) return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });

  const body   = await request.json().catch(() => null);
  const parsed = CreateCouponSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다" },
      { status: 400 }
    );
  }

  const { admin, profile, store } = ctx;
  const d = parsed.data;

  const { data: existing } = await admin
    .from("coupons").select("id").eq("code", d.code).single();
  if (existing) return NextResponse.json({ error: "이미 사용 중인 쿠폰 코드입니다" }, { status: 409 });

  const { data: coupon, error } = await admin
    .from("coupons")
    .insert({
      code:        d.code,
      title:       d.title,
      description: d.description ?? null,
      type:        d.type,
      value:       d.value,
      min_order:   d.minOrder,
      max_uses:    d.maxUses,
      store_id:    store.id,
      issued_by:   profile.id,
      expires_at:  d.expiresAt ?? null,
      is_active:   true,
    })
    .select("id, code, title")
    .single();

  if (error) return NextResponse.json({ error: "쿠폰 생성에 실패했습니다" }, { status: 500 });

  return NextResponse.json({ ok: true, coupon }, { status: 201 });
}

// PATCH /api/owner/coupons — 쿠폰 활성화 토글
const ToggleSchema = z.object({
  couponId: z.string().uuid(),
  isActive: z.boolean(),
});

export async function PATCH(request: NextRequest) {
  const ctx = await requireOwner();
  if (!ctx) return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });

  const body   = await request.json().catch(() => null);
  const parsed = ToggleSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "입력값이 올바르지 않습니다" }, { status: 400 });

  const { admin, store } = ctx;
  // 본인 가게 쿠폰인지 확인
  const { data: c } = await admin.from("coupons").select("id").eq("id", parsed.data.couponId).eq("store_id", store.id).single();
  if (!c) return NextResponse.json({ error: "쿠폰을 찾을 수 없습니다" }, { status: 404 });

  await admin.from("coupons").update({ is_active: parsed.data.isActive }).eq("id", parsed.data.couponId);
  return NextResponse.json({ ok: true });
}

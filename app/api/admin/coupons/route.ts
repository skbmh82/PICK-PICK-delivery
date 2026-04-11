import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
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

// GET /api/admin/coupons — 쿠폰 전체 목록 + 사용 통계
export async function GET() {
  const ctx = await requireAdmin();
  if (!ctx) return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });

  const { admin } = ctx;
  const { data: rows, error } = await admin
    .from("coupons")
    .select(`
      id, code, title, description, type, value,
      min_order, max_uses, used_count, max_per_user,
      store_id, is_active, starts_at, expires_at, created_at,
      stores(name)
    `)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "목록 조회 실패" }, { status: 500 });

  // 각 쿠폰별 발급 수
  const { data: ucRows } = await admin
    .from("user_coupons")
    .select("coupon_id, is_used");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ucMap: Record<string, { issued: number; used: number }> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const uc of (ucRows ?? []) as any[]) {
    if (!ucMap[uc.coupon_id]) ucMap[uc.coupon_id] = { issued: 0, used: 0 };
    ucMap[uc.coupon_id].issued++;
    if (uc.is_used) ucMap[uc.coupon_id].used++;
  }

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
    maxPerUser:  c.max_per_user ?? 1,
    storeId:     c.store_id,
    storeName:   c.stores?.name ?? null,
    isActive:    c.is_active,
    startsAt:    c.starts_at,
    expiresAt:   c.expires_at,
    createdAt:   c.created_at,
    issuedCount: ucMap[c.id]?.issued ?? 0,
    claimedUsed: ucMap[c.id]?.used ?? 0,
  }));

  return NextResponse.json({ coupons });
}

// POST /api/admin/coupons — 쿠폰 생성
const CreateCouponSchema = z.object({
  code:        z.string().min(2).max(30).toUpperCase(),
  title:       z.string().min(2).max(100),
  description: z.string().max(300).optional(),
  type:        z.enum(["fixed_pick", "pick_rate", "free_delivery"]),
  value:       z.number().min(0),
  minOrder:    z.number().min(0).default(0),
  maxUses:     z.number().int().positive().nullable().default(null),
  maxPerUser:  z.number().int().positive().default(1),
  storeId:     z.string().uuid().nullable().default(null),
  expiresAt:   z.string().datetime().nullable().optional(),
});

export async function POST(request: NextRequest) {
  const ctx = await requireAdmin();
  if (!ctx) return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });

  const body   = await request.json().catch(() => null);
  const parsed = CreateCouponSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다" },
      { status: 400 }
    );
  }

  const { admin, profile } = ctx;
  const d = parsed.data;

  // 중복 코드 확인
  const { data: existing } = await admin
    .from("coupons").select("id").eq("code", d.code).single();
  if (existing) return NextResponse.json({ error: "이미 사용 중인 쿠폰 코드입니다" }, { status: 409 });

  const { data: coupon, error } = await admin
    .from("coupons")
    .insert({
      code:         d.code,
      title:        d.title,
      description:  d.description ?? null,
      type:         d.type,
      value:        d.value,
      min_order:    d.minOrder,
      max_uses:     d.maxUses,
      max_per_user: d.maxPerUser,
      store_id:     d.storeId,
      issued_by:    profile.id,
      expires_at:   d.expiresAt ?? null,
      is_active:    true,
    })
    .select("id, code, title")
    .single();

  if (error) return NextResponse.json({ error: "쿠폰 생성에 실패했습니다" }, { status: 500 });

  return NextResponse.json({ ok: true, coupon }, { status: 201 });
}

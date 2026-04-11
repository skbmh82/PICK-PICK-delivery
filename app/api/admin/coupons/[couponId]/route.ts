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
  return { admin };
}

const UpdateCouponSchema = z.object({
  isActive:    z.boolean().optional(),
  title:       z.string().min(2).max(100).optional(),
  description: z.string().max(300).nullable().optional(),
  maxUses:     z.number().int().positive().nullable().optional(),
  expiresAt:   z.string().datetime().nullable().optional(),
});

// PATCH /api/admin/coupons/[couponId] — 쿠폰 수정 (활성화·비활성화 포함)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ couponId: string }> }
) {
  const { couponId } = await params;
  const ctx = await requireAdmin();
  if (!ctx) return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });

  const body   = await request.json().catch(() => null);
  const parsed = UpdateCouponSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "입력값이 올바르지 않습니다" }, { status: 400 });
  }

  const { admin } = ctx;
  const updates: Record<string, unknown> = {};
  if (parsed.data.isActive    !== undefined) updates.is_active   = parsed.data.isActive;
  if (parsed.data.title       !== undefined) updates.title       = parsed.data.title;
  if (parsed.data.description !== undefined) updates.description = parsed.data.description;
  if (parsed.data.maxUses     !== undefined) updates.max_uses    = parsed.data.maxUses;
  if (parsed.data.expiresAt   !== undefined) updates.expires_at  = parsed.data.expiresAt;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: true });
  }

  const { error } = await admin.from("coupons").update(updates).eq("id", couponId);
  if (error) return NextResponse.json({ error: "수정에 실패했습니다" }, { status: 500 });

  return NextResponse.json({ ok: true });
}

// DELETE /api/admin/coupons/[couponId] — 쿠폰 삭제
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ couponId: string }> }
) {
  const { couponId } = await params;
  const ctx = await requireAdmin();
  if (!ctx) return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });

  const { admin } = ctx;
  // 발급된 쿠폰이 있으면 삭제 불가 (비활성화만 허용)
  const { count } = await admin
    .from("user_coupons")
    .select("id", { count: "exact", head: true })
    .eq("coupon_id", couponId);

  if ((count ?? 0) > 0) {
    return NextResponse.json(
      { error: "이미 발급된 쿠폰은 삭제할 수 없습니다. 비활성화를 이용해주세요." },
      { status: 422 }
    );
  }

  const { error } = await admin.from("coupons").delete().eq("id", couponId);
  if (error) return NextResponse.json({ error: "삭제에 실패했습니다" }, { status: 500 });

  return NextResponse.json({ ok: true });
}

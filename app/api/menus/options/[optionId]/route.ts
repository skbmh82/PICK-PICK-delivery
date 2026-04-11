import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

const UpdateOptionSchema = z.object({
  name:       z.string().min(1).max(50).optional(),
  extraPrice: z.number().int().min(0).optional(),
});

async function verifyOptionOwner(optionId: string, authUserId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminSupabaseClient() as any;

  const { data: profile } = await admin
    .from("users").select("id, role").eq("auth_id", authUserId).single();
  if (!profile || !["owner", "admin"].includes(profile.role)) return null;

  // option → group → menu → store → owner
  const { data: option } = await admin
    .from("menu_options")
    .select("id, menu_option_groups(menu_id, menus(stores(owner_id)))")
    .eq("id", optionId)
    .single();

  if (!option) return null;

  const ownerIdPath =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (option.menu_option_groups as any)?.menus?.stores?.owner_id;

  if (profile.role !== "admin" && ownerIdPath !== profile.id) return null;

  return { admin };
}

// PATCH /api/menus/options/[optionId] — 옵션 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ optionId: string }> }
) {
  const { optionId } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });

  const ctx = await verifyOptionOwner(optionId, user.id);
  if (!ctx) return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });

  const body   = await request.json().catch(() => null);
  const parsed = UpdateOptionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.name       !== undefined) updates.name        = parsed.data.name;
  if (parsed.data.extraPrice !== undefined) updates.extra_price = parsed.data.extraPrice;

  if (Object.keys(updates).length === 0) return NextResponse.json({ ok: true });

  const { error } = await ctx.admin
    .from("menu_options").update(updates).eq("id", optionId);

  if (error) return NextResponse.json({ error: "수정에 실패했습니다" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE /api/menus/options/[optionId] — 옵션 삭제
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ optionId: string }> }
) {
  const { optionId } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });

  const ctx = await verifyOptionOwner(optionId, user.id);
  if (!ctx) return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });

  const { error } = await ctx.admin
    .from("menu_options").delete().eq("id", optionId);

  if (error) return NextResponse.json({ error: "삭제에 실패했습니다" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

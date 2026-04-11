import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

const OptionSchema = z.object({
  name:       z.string().min(1, "옵션 이름을 입력해주세요").max(50),
  extraPrice: z.number().int().min(0).optional(),
});

const UpdateGroupSchema = z.object({
  name:       z.string().min(1).max(50).optional(),
  isRequired: z.boolean().optional(),
  maxSelect:  z.number().int().min(1).max(10).optional(),
});

// 그룹 소유 검증
async function verifyGroupOwner(menuId: string, groupId: string, authUserId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminSupabaseClient() as any;

  const { data: profile } = await admin
    .from("users").select("id, role").eq("auth_id", authUserId).single();
  if (!profile || !["owner", "admin"].includes(profile.role)) return null;

  const { data: menu } = await admin
    .from("menus").select("id, stores(owner_id)").eq("id", menuId).single();
  if (!menu) return null;

  if (profile.role !== "admin" && menu.stores?.owner_id !== profile.id) return null;

  const { data: group } = await admin
    .from("menu_option_groups").select("id").eq("id", groupId).eq("menu_id", menuId).single();
  if (!group) return null;

  return { admin };
}

// PATCH /api/menus/[menuId]/option-groups/[groupId] — 그룹 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string; groupId: string }> }
) {
  const { menuId, groupId } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });

  const ctx = await verifyGroupOwner(menuId, groupId, user.id);
  if (!ctx) return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });

  const body   = await request.json().catch(() => null);
  const parsed = UpdateGroupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.name       !== undefined) updates.name        = parsed.data.name;
  if (parsed.data.isRequired !== undefined) updates.is_required = parsed.data.isRequired;
  if (parsed.data.maxSelect  !== undefined) updates.max_select  = parsed.data.maxSelect;

  if (Object.keys(updates).length === 0) return NextResponse.json({ ok: true });

  const { error } = await ctx.admin
    .from("menu_option_groups").update(updates).eq("id", groupId);

  if (error) return NextResponse.json({ error: "수정에 실패했습니다" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// DELETE /api/menus/[menuId]/option-groups/[groupId] — 그룹 삭제 (옵션 cascade)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ menuId: string; groupId: string }> }
) {
  const { menuId, groupId } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });

  const ctx = await verifyGroupOwner(menuId, groupId, user.id);
  if (!ctx) return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });

  const { error } = await ctx.admin
    .from("menu_option_groups").delete().eq("id", groupId);

  if (error) return NextResponse.json({ error: "삭제에 실패했습니다" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// POST /api/menus/[menuId]/option-groups/[groupId] — 그룹에 옵션 추가
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string; groupId: string }> }
) {
  const { menuId, groupId } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });

  const ctx = await verifyGroupOwner(menuId, groupId, user.id);
  if (!ctx) return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });

  const body   = await request.json().catch(() => null);
  const parsed = OptionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다" }, { status: 400 });
  }

  const { name, extraPrice = 0 } = parsed.data;

  const { data: option, error } = await ctx.admin
    .from("menu_options")
    .insert({ option_group_id: groupId, name, extra_price: extraPrice })
    .select("id, name, extra_price")
    .single();

  if (error) return NextResponse.json({ error: "옵션 추가에 실패했습니다" }, { status: 500 });

  return NextResponse.json({
    option: { id: option.id, name: option.name, extraPrice: Number(option.extra_price) },
  }, { status: 201 });
}

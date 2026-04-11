import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

// 메뉴 → 사장님 소유 검증 헬퍼
async function verifyMenuOwner(menuId: string, authUserId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminSupabaseClient() as any;

  const { data: profile } = await admin
    .from("users").select("id, role").eq("auth_id", authUserId).single();
  if (!profile || !["owner", "admin"].includes(profile.role)) return null;

  const { data: menu } = await admin
    .from("menus")
    .select("id, store_id, stores(owner_id)")
    .eq("id", menuId)
    .single();
  if (!menu) return null;

  const storeOwner = menu.stores?.owner_id;
  if (profile.role !== "admin" && storeOwner !== profile.id) return null;

  return { profile, menu, admin };
}

const GroupSchema = z.object({
  name:      z.string().min(1, "그룹 이름을 입력해주세요").max(50),
  isRequired: z.boolean().optional(),
  maxSelect:  z.number().int().min(1).max(10).optional(),
});

// GET /api/menus/[menuId]/option-groups — 옵션 그룹 + 옵션 목록
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ menuId: string }> }
) {
  const { menuId } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const ctx = await verifyMenuOwner(menuId, user.id);
  if (!ctx) return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });

  const { data: groups, error } = await ctx.admin
    .from("menu_option_groups")
    .select("id, name, is_required, max_select, menu_options(id, name, extra_price)")
    .eq("menu_id", menuId)
    .order("id", { ascending: true });

  if (error) return NextResponse.json({ error: "조회에 실패했습니다" }, { status: 500 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = (groups ?? []).map((g: any) => ({
    id:         g.id,
    name:       g.name,
    isRequired: g.is_required,
    maxSelect:  g.max_select,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: (g.menu_options ?? []).map((o: any) => ({
      id:         o.id,
      name:       o.name,
      extraPrice: Number(o.extra_price),
    })),
  }));

  return NextResponse.json({ groups: result });
}

// POST /api/menus/[menuId]/option-groups — 옵션 그룹 추가
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string }> }
) {
  const { menuId } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const ctx = await verifyMenuOwner(menuId, user.id);
  if (!ctx) return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });

  const body   = await request.json().catch(() => null);
  const parsed = GroupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다" }, { status: 400 });
  }

  const { name, isRequired = false, maxSelect = 1 } = parsed.data;

  const { data: group, error } = await ctx.admin
    .from("menu_option_groups")
    .insert({ menu_id: menuId, name, is_required: isRequired, max_select: maxSelect })
    .select("id, name, is_required, max_select")
    .single();

  if (error) return NextResponse.json({ error: "옵션 그룹 추가에 실패했습니다" }, { status: 500 });

  return NextResponse.json({
    group: { id: group.id, name: group.name, isRequired: group.is_required, maxSelect: group.max_select, options: [] },
  }, { status: 201 });
}

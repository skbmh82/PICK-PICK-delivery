import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

// PATCH /api/menus/[menuId] — 메뉴 수정 (이름/가격/설명/품절/인기)
const UpdateMenuSchema = z.object({
  name:         z.string().min(1).max(50).optional(),
  price:        z.number().int().min(0).optional(),
  category:     z.string().min(1).max(30).optional(),
  description:  z.string().max(200).nullable().optional(),
  is_available: z.boolean().optional(),
  is_popular:   z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string }> }
) {
  const { menuId } = await params;
  const supabase   = await createServerSupabaseClient();
  const admin      = getAdminSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (admin as any)
    .from("users").select("id, role").eq("auth_id", user.id).single();

  if (!profile || !["owner", "admin"].includes(profile.role)) {
    return NextResponse.json({ error: "사장님 권한이 필요합니다" }, { status: 403 });
  }

  // 해당 메뉴가 사장님 가게 소속인지 확인
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: menu } = await (admin as any)
    .from("menus")
    .select("id, store_id, stores(owner_id)")
    .eq("id", menuId)
    .single();

  if (!menu) {
    return NextResponse.json({ error: "메뉴를 찾을 수 없습니다" }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const storeOwner = (menu.stores as any)?.owner_id;
  if (profile.role !== "admin" && storeOwner !== profile.id) {
    return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });
  }

  const body   = await request.json().catch(() => null);
  const parsed = UpdateMenuSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "입력값이 올바르지 않습니다" }, { status: 400 });
  }

  // 변경할 필드만 추출
  const updates: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(parsed.data)) {
    if (v !== undefined) updates[k] = v;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "변경할 내용이 없습니다" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: updated, error } = await (admin as any)
    .from("menus")
    .update(updates)
    .eq("id", menuId)
    .select()
    .single();

  if (error) {
    console.error("메뉴 수정 오류:", error.message);
    return NextResponse.json({ error: "메뉴 수정에 실패했습니다" }, { status: 500 });
  }

  return NextResponse.json({ menu: updated });
}

// DELETE /api/menus/[menuId] — 메뉴 삭제
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ menuId: string }> }
) {
  const { menuId } = await params;
  const supabase   = await createServerSupabaseClient();
  const admin      = getAdminSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (admin as any)
    .from("users").select("id, role").eq("auth_id", user.id).single();

  if (!profile || !["owner", "admin"].includes(profile.role)) {
    return NextResponse.json({ error: "사장님 권한이 필요합니다" }, { status: 403 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: menu } = await (admin as any)
    .from("menus")
    .select("id, stores(owner_id)")
    .eq("id", menuId)
    .single();

  if (!menu) {
    return NextResponse.json({ error: "메뉴를 찾을 수 없습니다" }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const storeOwner = (menu.stores as any)?.owner_id;
  if (profile.role !== "admin" && storeOwner !== profile.id) {
    return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (admin as any).from("menus").delete().eq("id", menuId);

  if (error) {
    console.error("메뉴 삭제 오류:", error.message);
    return NextResponse.json({ error: "메뉴 삭제에 실패했습니다" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

// ── 공통: 사장님 + 가게 확인 헬퍼 ──────────────────────
async function getOwnerAndStore() {
  const supabase = await createServerSupabaseClient();
  const admin    = getAdminSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "인증이 필요합니다", status: 401 };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (admin as any)
    .from("users").select("id, role").eq("auth_id", user.id).single();

  if (!profile || !["owner", "admin"].includes(profile.role))
    return { error: "사장님 권한이 필요합니다", status: 403 };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: store } = await (admin as any)
    .from("stores").select("id").eq("owner_id", profile.id).single();

  if (!store) return { error: "가게를 찾을 수 없습니다", status: 404 };

  return { admin, profile, store };
}

// GET /api/stores/my/menus — 내 가게 메뉴 목록
export async function GET() {
  const result = await getOwnerAndStore();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  const { admin, store } = result;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: menus, error } = await (admin as any)
    .from("menus")
    .select("id, name, description, price, category, is_available, is_popular, sort_order, image_url")
    .eq("store_id", store.id)
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: "메뉴 조회에 실패했습니다" }, { status: 500 });
  }

  return NextResponse.json({ menus: menus ?? [] });
}

// POST /api/stores/my/menus — 메뉴 추가
const AddMenuSchema = z.object({
  name:        z.string().min(1).max(50),
  price:       z.number().int().min(0),
  category:    z.string().min(1).max(30),
  description: z.string().max(200).optional(),
  is_popular:  z.boolean().optional(),
  image_url:   z.string().url().nullable().optional(),
});

export async function POST(request: NextRequest) {
  const result = await getOwnerAndStore();
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  const { admin, store } = result;

  const body = await request.json().catch(() => null);
  const parsed = AddMenuSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "입력값이 올바르지 않습니다", details: parsed.error.flatten() }, { status: 400 });
  }

  // sort_order: 현재 마지막 + 1
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count } = await (admin as any)
    .from("menus")
    .select("id", { count: "exact", head: true })
    .eq("store_id", store.id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: menu, error } = await (admin as any)
    .from("menus")
    .insert({
      store_id:    store.id,
      name:        parsed.data.name,
      price:       parsed.data.price,
      category:    parsed.data.category,
      description: parsed.data.description ?? null,
      is_popular:  parsed.data.is_popular  ?? false,
      image_url:   parsed.data.image_url   ?? null,
      is_available: true,
      sort_order:  (count ?? 0) + 1,
    })
    .select()
    .single();

  if (error) {
    console.error("메뉴 추가 오류:", error.message);
    return NextResponse.json({ error: "메뉴 추가에 실패했습니다" }, { status: 500 });
  }

  return NextResponse.json({ menu }, { status: 201 });
}

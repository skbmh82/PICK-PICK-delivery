import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

type Params = { params: Promise<{ storeId: string }> };

// GET /api/favorites/[storeId] — 즐겨찾기 여부 확인
export async function GET(_req: NextRequest, { params }: Params) {
  const { storeId } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ isFavorited: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminSupabaseClient() as any;
  const { data: profile } = await admin
    .from("users").select("id").eq("auth_id", user.id).single();
  if (!profile) return NextResponse.json({ isFavorited: false });

  const { data } = await admin
    .from("favorites")
    .select("id")
    .eq("user_id", profile.id)
    .eq("store_id", storeId)
    .single();

  return NextResponse.json({ isFavorited: !!data });
}

// POST /api/favorites/[storeId] — 즐겨찾기 토글
export async function POST(_req: NextRequest, { params }: Params) {
  const { storeId } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminSupabaseClient() as any;
  const { data: profile } = await admin
    .from("users").select("id").eq("auth_id", user.id).single();
  if (!profile) return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 });

  // 현재 즐겨찾기 여부 확인
  const { data: existing } = await admin
    .from("favorites")
    .select("id")
    .eq("user_id", profile.id)
    .eq("store_id", storeId)
    .single();

  if (existing) {
    // 이미 즐겨찾기 → 삭제
    await admin.from("favorites").delete().eq("id", existing.id);
    return NextResponse.json({ isFavorited: false });
  } else {
    // 즐겨찾기 추가
    await admin.from("favorites").insert({ user_id: profile.id, store_id: storeId });
    return NextResponse.json({ isFavorited: true });
  }
}

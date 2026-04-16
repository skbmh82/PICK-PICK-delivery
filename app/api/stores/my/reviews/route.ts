import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

// GET /api/stores/my/reviews — 사장님 가게 리뷰 목록 (답글 포함)
export async function GET() {
  const supabase = await createServerSupabaseClient();
  const admin    = getAdminSupabaseClient();

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
  const { data: storeList } = await (admin as any)
    .from("stores").select("id").eq("owner_id", profile.id)
    .order("created_at", { ascending: false }).limit(1);
  const store = storeList?.[0] ?? null;

  if (!store) {
    return NextResponse.json({ reviews: [] });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rows, error } = await (admin as any)
    .from("reviews")
    .select(`
      id, rating, content, image_urls, created_at,
      owner_reply, owner_replied_at,
      users ( name )
    `)
    .eq("store_id", store.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: "리뷰 조회에 실패했습니다" }, { status: 500 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reviews = (rows ?? []).map((r: any) => ({
    id:             r.id,
    rating:         r.rating,
    content:        r.content,
    imageUrls:      (r.image_urls as string[] | null) ?? [],
    createdAt:      r.created_at,
    userName:       r.users?.name ?? "익명",
    ownerReply:     r.owner_reply,
    ownerRepliedAt: r.owner_replied_at,
  }));

  return NextResponse.json({ reviews });
}

import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

type Params = { params: Promise<{ storeId: string }> };

// GET /api/reviews/store/[storeId]?offset=0&limit=10 — 가게 리뷰 목록
export async function GET(req: NextRequest, { params }: Params) {
  const { storeId } = await params;
  const { searchParams } = new URL(req.url);
  const offset = Math.max(0, parseInt(searchParams.get("offset") ?? "0", 10));
  const limit  = Math.min(20, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminSupabaseClient() as any;

  const { data: reviews, error } = await admin
    .from("reviews")
    .select("id, rating, content, image_urls, created_at, owner_reply, owner_replied_at, users(name)")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ reviews: [] });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = (reviews ?? []).map((r: any) => ({
    id:             r.id,
    rating:         r.rating,
    content:        r.content,
    imageUrls:      (r.image_urls as string[] | null) ?? [],
    createdAt:      r.created_at,
    userName:       (r.users?.name as string | undefined) ?? "익명",
    ownerReply:     (r.owner_reply as string | null) ?? null,
    ownerRepliedAt: (r.owner_replied_at as string | null) ?? null,
  }));

  return NextResponse.json({ reviews: result, hasMore: result.length === limit });
}

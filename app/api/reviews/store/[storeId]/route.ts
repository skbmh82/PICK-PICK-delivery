import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

type Params = { params: Promise<{ storeId: string }> };

// GET /api/reviews/store/[storeId] — 가게 리뷰 목록
export async function GET(_req: NextRequest, { params }: Params) {
  const { storeId } = await params;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminSupabaseClient() as any;

  const { data: reviews, error } = await admin
    .from("reviews")
    .select("id, rating, content, created_at, pick_reward, users(name)")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ reviews: [] });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = (reviews ?? []).map((r: any) => ({
    id:         r.id,
    rating:     r.rating,
    content:    r.content,
    createdAt:  r.created_at,
    userName:   (r.users?.name as string | undefined) ?? "익명",
  }));

  return NextResponse.json({ reviews: result });
}

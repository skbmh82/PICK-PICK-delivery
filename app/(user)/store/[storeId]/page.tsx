import { notFound } from "next/navigation";
import { fetchStoreById, fetchMenusByStoreId } from "@/lib/supabase/stores";
import { getCategoryEmoji, getMenuEmoji } from "@/lib/utils/categoryEmoji";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import StoreDetailClient, { type StoreDetail, type MenuItem, type ReviewItem } from "./StoreDetailClient";

export default async function StoreDetailPage({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;

  const [storeRow, menuRows] = await Promise.all([
    fetchStoreById(storeId),
    fetchMenusByStoreId(storeId),
  ]);

  // 즐겨찾기 여부 서버에서 확인
  let isFavorited = false;
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const admin = getAdminSupabaseClient() as any;
      const { data: profile } = await admin
        .from("users").select("id").eq("auth_id", user.id).single();
      if (profile) {
        const { data: fav } = await admin
          .from("favorites")
          .select("id")
          .eq("user_id", profile.id)
          .eq("store_id", storeId)
          .single();
        isFavorited = !!fav;
      }
    }
  } catch {
    // 비로그인 상태 등 무시
  }

  if (!storeRow) notFound();

  // 리뷰 목록 (최근 10개)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminForReviews = getAdminSupabaseClient() as any;
  const { data: reviewRows } = await adminForReviews
    .from("reviews")
    .select("id, rating, content, created_at, users(name)")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false })
    .limit(10);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reviews: ReviewItem[] = (reviewRows ?? []).map((r: any) => ({
    id:        r.id as string,
    rating:    r.rating as number,
    content:   r.content as string | null,
    createdAt: r.created_at as string,
    userName:  (r.users?.name as string | undefined) ?? "익명",
  }));

  // DB 데이터를 StoreDetail 형태로 변환
  const store: StoreDetail = {
    id:             storeRow.id,
    name:           storeRow.name,
    category:       storeRow.category,
    emoji:          getCategoryEmoji(storeRow.category),
    rating:         storeRow.rating,
    reviewCount:    storeRow.review_count,
    deliveryTime:   storeRow.delivery_time,
    deliveryFee:    storeRow.delivery_fee,
    minOrderAmount: storeRow.min_order_amount,
    pickRewardRate: storeRow.pick_reward_rate,
    tags:           storeRow.description ? [storeRow.description] : [],
    menus: menuRows.map((m): MenuItem => ({
      id:          m.id,
      name:        m.name,
      description: m.description ?? "",
      price:       m.price,
      image:       getMenuEmoji(m.category, m.name),
      isPopular:   m.is_popular,
      isAvailable: m.is_available,
      category:    m.category,
    })),
  };

  return <StoreDetailClient store={store} isFavorited={isFavorited} reviews={reviews} />;
}

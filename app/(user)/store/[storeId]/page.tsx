import { notFound } from "next/navigation";
import { fetchStoreById, fetchMenusByStoreId } from "@/lib/supabase/stores";
import { getCategoryEmoji, CATEGORY_META, getMenuEmoji } from "@/lib/utils/categoryEmoji";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import StoreDetailClient from "./StoreDetailClient";
import type { MockStore, MockMenu } from "@/lib/mock/stores";

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

  // DB 데이터를 기존 MockStore 형태로 변환 (StoreDetailClient 재사용)
  const store: MockStore = {
    id: storeRow.id,
    name: storeRow.name,
    category: storeRow.category,
    emoji: getCategoryEmoji(storeRow.category),
    rating: storeRow.rating,
    reviewCount: storeRow.review_count,
    deliveryTime: storeRow.delivery_time,
    deliveryFee: storeRow.delivery_fee,
    minOrderAmount: storeRow.min_order_amount,
    pickRewardRate: storeRow.pick_reward_rate,
    tags: storeRow.description ? [storeRow.description] : [],
    menus: menuRows.map((m): MockMenu => ({
      id: m.id,
      name: m.name,
      description: m.description ?? "",
      price: m.price,
      image: getMenuEmoji(m.category, m.name),
      isPopular: m.is_popular,
      isAvailable: m.is_available,
      category: m.category,
    })),
  };

  // 카테고리 레이블도 DB 기반으로 주입
  const categoryInfo = CATEGORY_META[storeRow.category];
  if (categoryInfo) {
    store.tags = storeRow.description
      ? [storeRow.description]
      : [];
  }

  return <StoreDetailClient store={store} isFavorited={isFavorited} />;
}

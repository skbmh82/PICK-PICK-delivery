import { notFound } from "next/navigation";
import { fetchStoreById, fetchMenusByStoreId } from "@/lib/supabase/stores";
import { getCategoryEmoji, getMenuEmoji } from "@/lib/utils/categoryEmoji";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import StoreDetailClient, { type StoreDetail, type MenuItem, type ReviewItem, type OptionGroup, type TodayHours, type WeeklyHour } from "./StoreDetailClient";

export default async function StoreDetailPage({
  params,
  searchParams,
}: {
  params:       Promise<{ storeId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ storeId }, { tab }] = await Promise.all([params, searchParams]);
  const initialTab = (tab === "review" || tab === "info") ? tab : "menu";

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

  // 주간 영업시간 전체 조회 (Asia/Seoul 기준)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminHours = getAdminSupabaseClient() as any;
  const seoulNow   = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
  const todayDow   = seoulNow.getDay(); // 0=일, 6=토
  const nowMinutes = seoulNow.getHours() * 60 + seoulNow.getMinutes();

  let todayHours:  TodayHours   | null = null;
  let weeklyHours: WeeklyHour[] | null = null;
  try {
    const { data: hourRows } = await adminHours
      .from("store_hours")
      .select("day_of_week, open_time, close_time, is_closed")
      .eq("store_id", storeRow.id)
      .order("day_of_week", { ascending: true });

    if (hourRows && hourRows.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      weeklyHours = (hourRows as any[]).map((r) => ({
        dayOfWeek: r.day_of_week as number,
        openTime:  r.open_time  as string,
        closeTime: r.close_time as string,
        isClosed:  r.is_closed  as boolean,
      }));

      // 오늘 행 추출
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const todayRow = (hourRows as any[]).find((r) => r.day_of_week === todayDow);
      if (todayRow) {
        const [oh, om] = (todayRow.open_time  as string).split(":").map(Number);
        const [ch, cm] = (todayRow.close_time as string).split(":").map(Number);
        const openMin  = (oh ?? 0) * 60 + (om ?? 0);
        const closeMin = (ch ?? 22) * 60 + (cm ?? 0);
        todayHours = {
          openTime:  todayRow.open_time  as string,
          closeTime: todayRow.close_time as string,
          isClosed:  todayRow.is_closed  as boolean,
          isCurrentlyOpen: !todayRow.is_closed && nowMinutes >= openMin && nowMinutes <= closeMin,
        };
      }
    }
  } catch {
    // store_hours 없으면 무시
  }

  // 메뉴 옵션 그룹 일괄 조회
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminForOptions = getAdminSupabaseClient() as any;
  const menuIds = menuRows.map((m) => m.id);
  const optionGroupsByMenuId: Record<string, OptionGroup[]> = {};
  if (menuIds.length > 0) {
    const { data: groupRows } = await adminForOptions
      .from("menu_option_groups")
      .select("id, name, is_required, max_select, menu_id, menu_options(id, name, extra_price)")
      .in("menu_id", menuIds);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const g of (groupRows ?? []) as any[]) {
      if (!optionGroupsByMenuId[g.menu_id]) optionGroupsByMenuId[g.menu_id] = [];
      optionGroupsByMenuId[g.menu_id].push({
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
      });
    }
  }

  // 리뷰 목록 (최근 10개)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminForReviews = getAdminSupabaseClient() as any;
  const { data: reviewRows } = await adminForReviews
    .from("reviews")
    .select("id, rating, content, image_urls, created_at, owner_reply, owner_replied_at, users(name)")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false })
    .limit(10);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reviews: ReviewItem[] = (reviewRows ?? []).map((r: any) => ({
    id:             r.id as string,
    rating:         r.rating as number,
    content:        r.content as string | null,
    createdAt:      r.created_at as string,
    userName:       (r.users?.name as string | undefined) ?? "익명",
    imageUrls:      (r.image_urls as string[] | undefined) ?? [],
    ownerReply:     r.owner_reply as string | null,
    ownerRepliedAt: r.owner_replied_at as string | null,
  }));

  // DB 데이터를 StoreDetail 형태로 변환
  const store: StoreDetail = {
    id:             storeRow.id,
    name:           storeRow.name,
    category:       storeRow.category,
    emoji:          getCategoryEmoji(storeRow.category),
    imageUrl:       storeRow.image_url  ?? null,
    bannerUrl:      storeRow.banner_url ?? null,
    rating:         storeRow.rating,
    reviewCount:    storeRow.review_count,
    deliveryTime:   storeRow.delivery_time,
    deliveryFee:    storeRow.delivery_fee,
    minOrderAmount: storeRow.min_order_amount,
    tags:           storeRow.description ? [storeRow.description] : [],
    address:        storeRow.address,
    phone:          (storeRow as unknown as { phone?: string | null }).phone ?? null,
    lat:            storeRow.lat,
    lng:            storeRow.lng,
    menus: menuRows.map((m): MenuItem => ({
      id:           m.id,
      name:         m.name,
      description:  m.description ?? "",
      price:        m.price,
      image:        getMenuEmoji(m.category, m.name),
      imageUrl:     m.image_url ?? null,
      isPopular:    m.is_popular,
      isAvailable:  m.is_available,
      category:     m.category,
      optionGroups: optionGroupsByMenuId[m.id] ?? [],
    })),
  };

  return <StoreDetailClient store={store} isFavorited={isFavorited} reviews={reviews} todayHours={todayHours} weeklyHours={weeklyHours} initialTab={initialTab} />;
}

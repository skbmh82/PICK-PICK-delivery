import { createServerClient } from "./server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

export interface StoreRow {
  id: string;
  name: string;
  category: string;
  description: string | null;
  notice: string | null;
  address: string;
  phone?: string | null;
  lat: number;
  lng: number;
  image_url?: string | null;
  banner_url?: string | null;
  rating: number;
  review_count: number;
  delivery_time: number;
  delivery_fee: number;
  min_order_amount: number;
  is_open: boolean;
}

export interface MenuRow {
  id: string;
  store_id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  is_available: boolean;
  is_popular: boolean;
  sort_order: number;
  image_url: string | null;
}

type SortKey = "rating" | "delivery_fee" | "min_order" | "delivery_time";

const SORT_MAP: Record<SortKey, { col: string; asc: boolean }> = {
  rating:        { col: "rating",           asc: false },
  delivery_fee:  { col: "delivery_fee",     asc: true  },
  min_order:     { col: "min_order_amount", asc: true  },
  delivery_time: { col: "delivery_time",    asc: true  },
};

const STORES_PAGE_SIZE = 12;

// 카테고리별 가게 목록 (페이지네이션)
// lat/lng 있으면 배달 반경 필터(Haversine RPC), 없으면 전체 목록
export async function fetchStoresByCategory(
  category: string,
  sort: SortKey = "rating",
  offset = 0,
  limit  = STORES_PAGE_SIZE,
  openOnly = false,
  lat?: number | null,
  lng?: number | null,
): Promise<{ stores: StoreRow[]; hasMore: boolean }> {
  const supabase = createServerClient();

  // 좌표가 있으면 반경 필터 RPC 사용
  if (lat != null && lng != null) {
    const { data, error } = await supabase.rpc("fetch_stores_by_category_near", {
      p_category:  category,
      p_lat:       lat,
      p_lng:       lng,
      p_sort:      sort,
      p_offset:    offset,
      p_limit:     limit,
      p_open_only: openOnly,
    });

    if (error) {
      console.error("fetch_stores_by_category_near RPC error:", error.message);
      // RPC 실패 시 전체 목록으로 폴백
    } else {
      const stores = (data ?? []) as StoreRow[];
      return { stores, hasMore: stores.length === limit };
    }
  }

  // 좌표 없거나 RPC 실패 시 — 기존 방식 (위치 필터 없음)
  const { col, asc } = SORT_MAP[sort] ?? SORT_MAP.rating;
  let query = supabase
    .from("stores")
    .select("id, name, category, description, address, lat, lng, image_url, banner_url, rating, review_count, delivery_time, delivery_fee, min_order_amount, is_open")
    .eq("category", category)
    .eq("is_approved", true);

  if (openOnly) query = query.eq("is_open", true);

  const { data, error } = await query
    .order(col, { ascending: asc })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("fetchStoresByCategory error:", error.message);
    return { stores: [], hasMore: false };
  }
  const stores = (data ?? []) as StoreRow[];
  return { stores, hasMore: stores.length === limit };
}

// 가게 검색 (가게명 OR 메뉴명) — PostgreSQL 전문검색(GIN) + ilike 하이브리드
export async function searchStores(
  query: string,
  sort:  SortKey  = "rating",
  lat?:  number | null,
  lng?:  number | null,
): Promise<StoreRow[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase.rpc("search_stores", {
    p_query: query,
    p_sort:  sort,
    p_limit: 30,
    p_lat:   lat  ?? null,
    p_lng:   lng  ?? null,
  });

  if (error) {
    console.error("searchStores RPC error:", error.message);
    return [];
  }
  return (data ?? []) as StoreRow[];
}

// 가게 상세 (승인된 가게만 조회)
export async function fetchStoreById(id: string): Promise<StoreRow | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("stores")
    .select("id, name, category, description, notice, address, phone, lat, lng, image_url, banner_url, rating, review_count, delivery_time, delivery_fee, min_order_amount, is_open")
    .eq("id", id)
    .eq("is_approved", true)
    .single();

  if (error) {
    console.error("fetchStoreById error:", error.message);
    return null;
  }
  return data as StoreRow;
}

// 인기 가게 목록 (평점 높은 순, 최대 N개)
export async function fetchTopStores(limit = 8): Promise<StoreRow[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("stores")
    .select("id, name, category, description, address, lat, lng, image_url, banner_url, rating, review_count, delivery_time, delivery_fee, min_order_amount, is_open")
    .eq("is_approved", true)
    .eq("is_open", true)
    .order("rating", { ascending: false })
    .order("review_count", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("fetchTopStores error:", error.message);
    return [];
  }
  return (data ?? []) as StoreRow[];
}

/* ─── 광고 타입 ─── */
export interface AdStore extends StoreRow {
  adId: string;
  adType: "top" | "banner";
  bannerTitle: string | null;
  bannerSub: string | null;
  bannerGradient: string | null;
}

// 현재 활성 광고 가게 목록 (상단 노출용)
export async function fetchSponsoredStores(): Promise<AdStore[]> {
  const admin = getAdminSupabaseClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await admin
    .from("store_ads")
    .select(`
      id,
      type,
      banner_title,
      banner_sub,
      banner_gradient,
      stores (
        id, name, category, description, address, lat, lng,
        rating, review_count, delivery_time, delivery_fee,
        min_order_amount, is_open
      )
    `)
    .eq("status", "active")
    .lte("start_date", today)
    .gte("end_date", today)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.flatMap((row) => {
    const store = (Array.isArray(row.stores) ? row.stores[0] : row.stores) as StoreRow | null;
    if (!store || !store.is_open) return [];
    return [{
      ...store,
      adId:           row.id,
      adType:         row.type as "top" | "banner",
      bannerTitle:    row.banner_title,
      bannerSub:      row.banner_sub,
      bannerGradient: row.banner_gradient,
    }];
  });
}

// 가게 메뉴 목록
export async function fetchMenusByStoreId(storeId: string): Promise<MenuRow[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("menus")
    .select("id, store_id, name, description, price, category, is_available, is_popular, sort_order, image_url")
    .eq("store_id", storeId)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("fetchMenusByStoreId error:", error.message);
    return [];
  }
  return (data ?? []) as MenuRow[];
}

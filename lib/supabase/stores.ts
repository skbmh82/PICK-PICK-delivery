import { createServerClient } from "./server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

export interface StoreRow {
  id: string;
  name: string;
  category: string;
  description: string | null;
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
  pick_reward_rate: number;
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
export async function fetchStoresByCategory(
  category: string,
  sort: SortKey = "rating",
  offset = 0,
  limit  = STORES_PAGE_SIZE,
): Promise<{ stores: StoreRow[]; hasMore: boolean }> {
  const supabase = createServerClient();
  const { col, asc } = SORT_MAP[sort] ?? SORT_MAP.rating;
  const { data, error } = await supabase
    .from("stores")
    .select("id, name, category, description, address, lat, lng, image_url, banner_url, rating, review_count, delivery_time, delivery_fee, min_order_amount, pick_reward_rate, is_open")
    .eq("category", category)
    .eq("is_approved", true)
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
  sort: SortKey = "rating"
): Promise<StoreRow[]> {
  const supabase = createServerClient();

  const { data, error } = await supabase.rpc("search_stores", {
    p_query: query,
    p_sort:  sort,
    p_limit: 30,
  });

  if (error) {
    console.error("searchStores RPC error:", error.message);
    return [];
  }
  return (data ?? []) as StoreRow[];
}

// 가게 상세
export async function fetchStoreById(id: string): Promise<StoreRow | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("stores")
    .select("id, name, category, description, address, phone, lat, lng, image_url, banner_url, rating, review_count, delivery_time, delivery_fee, min_order_amount, pick_reward_rate, is_open")
    .eq("id", id)
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
    .select("id, name, category, description, address, lat, lng, image_url, banner_url, rating, review_count, delivery_time, delivery_fee, min_order_amount, pick_reward_rate, is_open")
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
        min_order_amount, pick_reward_rate, is_open
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

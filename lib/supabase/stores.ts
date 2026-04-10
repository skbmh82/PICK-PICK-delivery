import { createServerClient } from "./server";

export interface StoreRow {
  id: string;
  name: string;
  category: string;
  description: string | null;
  address: string;
  lat: number;
  lng: number;
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

// 카테고리별 가게 목록
export async function fetchStoresByCategory(category: string): Promise<StoreRow[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("stores")
    .select("id, name, category, description, address, lat, lng, rating, review_count, delivery_time, delivery_fee, min_order_amount, pick_reward_rate, is_open")
    .eq("category", category)
    .eq("is_approved", true)
    .eq("is_open", true)
    .order("rating", { ascending: false });

  if (error) {
    console.error("fetchStoresByCategory error:", error.message);
    return [];
  }
  return (data ?? []) as StoreRow[];
}

// 가게 검색 (이름 또는 메뉴명)
export async function searchStores(query: string): Promise<StoreRow[]> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("stores")
    .select("id, name, category, description, address, lat, lng, rating, review_count, delivery_time, delivery_fee, min_order_amount, pick_reward_rate, is_open")
    .eq("is_approved", true)
    .ilike("name", `%${query}%`)
    .order("rating", { ascending: false })
    .limit(30);

  if (error) {
    console.error("searchStores error:", error.message);
    return [];
  }
  return (data ?? []) as StoreRow[];
}

// 가게 상세
export async function fetchStoreById(id: string): Promise<StoreRow | null> {
  const supabase = createServerClient();
  const { data, error } = await supabase
    .from("stores")
    .select("id, name, category, description, address, lat, lng, rating, review_count, delivery_time, delivery_fee, min_order_amount, pick_reward_rate, is_open")
    .eq("id", id)
    .single();

  if (error) {
    console.error("fetchStoreById error:", error.message);
    return null;
  }
  return data as StoreRow;
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

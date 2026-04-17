import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

const SORT_MAP: Record<string, { col: string; asc: boolean }> = {
  rating:        { col: "rating",           asc: false },
  delivery_fee:  { col: "delivery_fee",     asc: true  },
  min_order:     { col: "min_order_amount", asc: true  },
  delivery_time: { col: "delivery_time",    asc: true  },
};

// GET /api/stores?category=X&sort=Y&offset=N&limit=M&lat=Y&lng=X
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? "";
  const sort     = searchParams.get("sort") ?? "rating";
  const offset   = Math.max(0, parseInt(searchParams.get("offset") ?? "0", 10));
  const limit    = Math.min(20, Math.max(1, parseInt(searchParams.get("limit") ?? "12", 10)));
  const openOnly = searchParams.get("open") === "1";
  const latParam = searchParams.get("lat");
  const lngParam = searchParams.get("lng");
  const lat      = latParam ? parseFloat(latParam) : null;
  const lng      = lngParam ? parseFloat(lngParam) : null;

  const supabase = createServerClient();

  // 좌표가 있으면 배달 반경 RPC 사용
  if (lat != null && lng != null && !isNaN(lat) && !isNaN(lng) && category) {
    const { data, error } = await supabase.rpc("fetch_stores_by_category_near", {
      p_category:  category,
      p_lat:       lat,
      p_lng:       lng,
      p_sort:      sort,
      p_offset:    offset,
      p_limit:     limit,
      p_open_only: openOnly,
    });

    if (!error) {
      const stores = data ?? [];
      return NextResponse.json({ stores, hasMore: stores.length === limit });
    }
  }

  // 좌표 없거나 RPC 실패 시 — 기존 방식
  const { col, asc } = SORT_MAP[sort] ?? SORT_MAP.rating;

  let query = supabase
    .from("stores")
    .select("id, name, category, description, address, lat, lng, image_url, banner_url, rating, review_count, delivery_time, delivery_fee, min_order_amount, is_open")
    .eq("is_approved", true)
    .order(col, { ascending: asc })
    .range(offset, offset + limit - 1);

  if (category) query = query.eq("category", category);
  if (openOnly) query = query.eq("is_open", true);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ stores: [], hasMore: false }, { status: 500 });
  }

  const stores = data ?? [];
  return NextResponse.json({ stores, hasMore: stores.length === limit });
}

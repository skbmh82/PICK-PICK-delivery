import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

const SORT_MAP: Record<string, { col: string; asc: boolean }> = {
  rating:        { col: "rating",           asc: false },
  delivery_fee:  { col: "delivery_fee",     asc: true  },
  min_order:     { col: "min_order_amount", asc: true  },
  delivery_time: { col: "delivery_time",    asc: true  },
};

// GET /api/stores?category=X&sort=Y&offset=N&limit=M
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") ?? "";
  const sort     = searchParams.get("sort") ?? "rating";
  const offset   = Math.max(0, parseInt(searchParams.get("offset") ?? "0", 10));
  const limit    = Math.min(20, Math.max(1, parseInt(searchParams.get("limit") ?? "12", 10)));

  const { col, asc } = SORT_MAP[sort] ?? SORT_MAP.rating;
  const supabase = createServerClient();

  let query = supabase
    .from("stores")
    .select("id, name, category, description, address, lat, lng, image_url, banner_url, rating, review_count, delivery_time, delivery_fee, min_order_amount, pick_reward_rate, is_open")
    .eq("is_approved", true)
    .order(col, { ascending: asc })
    .range(offset, offset + limit - 1);

  if (category) query = query.eq("category", category);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ stores: [], hasMore: false }, { status: 500 });
  }

  const stores = data ?? [];
  return NextResponse.json({ stores, hasMore: stores.length === limit });
}

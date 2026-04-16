import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

// GET /api/users/favorites — 내 즐겨찾기 목록 (가게 좌표 포함)
export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminSupabaseClient() as any;

  const { data: profile } = await admin
    .from("users")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!profile) return NextResponse.json({ favorites: [] });

  const { data: favs } = await admin
    .from("favorites")
    .select("store_id, stores(id, name, category, rating, delivery_fee, delivery_time, is_open, lat, lng)")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const favorites = (favs ?? []).map((f: any) => ({
    storeId:      f.store_id,
    name:         f.stores?.name         ?? "",
    category:     f.stores?.category     ?? "",
    rating:       Number(f.stores?.rating       ?? 0),
    deliveryFee:  Number(f.stores?.delivery_fee ?? 0),
    deliveryTime: Number(f.stores?.delivery_time ?? 30),
    isOpen:       f.stores?.is_open      ?? false,
    lat:          f.stores?.lat != null  ? Number(f.stores.lat) : null,
    lng:          f.stores?.lng != null  ? Number(f.stores.lng) : null,
  }));

  return NextResponse.json({ favorites });
}

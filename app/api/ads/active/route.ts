import { NextResponse } from "next/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

/* ─── 현재 활성 광고 목록 (홈 화면용) ─── */
export async function GET() {
  const admin = getAdminSupabaseClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: ads, error } = await admin
    .from("store_ads")
    .select(`
      id,
      type,
      banner_title,
      banner_sub,
      banner_gradient,
      click_count,
      store_id,
      stores (
        id,
        name,
        category,
        rating,
        review_count,
        delivery_fee,
        delivery_time,
        min_order_amount,
        pick_reward_rate,
        description,
        image_url
      )
    `)
    .eq("status", "active")
    .lte("start_date", today)
    .gte("end_date", today)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 노출 수 증가 (비동기 fire-and-forget)
  if (ads && ads.length > 0) {
    const ids = ads.map((a) => a.id);
    admin
      .from("store_ads")
      .update({ impression_count: admin.rpc as unknown as number })
      .in("id", ids)
      .then(() => {});
    // RPC 호출로 impression 증가
    for (const id of ids) {
      admin.rpc("increment_ad_impression", { ad_id: id }).then(() => {});
    }
  }

  const topAds    = ads?.filter((a) => a.type === "top")    ?? [];
  const bannerAds = ads?.filter((a) => a.type === "banner") ?? [];

  return NextResponse.json({ topAds, bannerAds }, {
    headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" },
  });
}

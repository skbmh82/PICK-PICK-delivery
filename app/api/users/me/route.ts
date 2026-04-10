import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

// GET /api/users/me — 내 프로필 + 지갑 통계 + 즐겨찾기
export async function GET() {
  const supabase = await createServerSupabaseClient();
  const admin    = getAdminSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (admin as any)
    .from("users")
    .select("id, name, email, phone, role, profile_image, address_main")
    .eq("auth_id", user.id)
    .single();

  if (!profile) return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 });

  // 지갑 통계
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: wallet } = await (admin as any)
    .from("wallets")
    .select("pick_balance, total_earned")
    .eq("user_id", profile.id)
    .single();

  const totalEarned = Number(wallet?.total_earned ?? 0);
  const pickBalance = Number(wallet?.pick_balance  ?? 0);

  // 등급 계산
  let gradeLabel  = "🌱 SEED";
  let nextThreshold = 1000;
  if      (totalEarned >= 20000) { gradeLabel = "🌲 FOREST"; nextThreshold = 0; }
  else if (totalEarned >=  5000) { gradeLabel = "🌳 TREE";   nextThreshold = 20000; }
  else if (totalEarned >=  1000) { gradeLabel = "🌿 SPROUT"; nextThreshold = 5000; }

  // 즐겨찾기 가게 (최근 5개)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: favs } = await (admin as any)
    .from("favorites")
    .select("store_id, stores(id, name, category, rating, delivery_fee, delivery_time)")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(5);

  // 내 리뷰 (최근 5개)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: reviews } = await (admin as any)
    .from("reviews")
    .select("id, rating, content, created_at, stores(name, category)")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return NextResponse.json({
    profile: {
      id:           profile.id,
      name:         profile.name,
      email:        profile.email,
      phone:        profile.phone,
      role:         profile.role,
      profileImage: profile.profile_image,
      addressMain:  profile.address_main,
    },
    wallet: { pickBalance, totalEarned },
    grade:  { label: gradeLabel, earned: totalEarned, nextThreshold },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    favorites: (favs ?? []).map((f: any) => ({
      storeId:      f.store_id,
      name:         f.stores?.name ?? "",
      category:     f.stores?.category ?? "",
      rating:       Number(f.stores?.rating ?? 0),
      deliveryFee:  Number(f.stores?.delivery_fee ?? 0),
      deliveryTime: Number(f.stores?.delivery_time ?? 30),
    })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reviews: (reviews ?? []).map((r: any) => ({
      id:        r.id,
      rating:    r.rating,
      content:   r.content,
      createdAt: r.created_at,
      storeName: r.stores?.name ?? "",
    })),
  });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

const ReviewSchema = z.object({
  orderId:    z.string().uuid(),
  rating:     z.number().int().min(1).max(5),
  content:    z.string().max(500).optional(),
  imageUrls:  z.array(z.string().url()).max(3).optional(),
});

// GET /api/reviews?orderId= — 해당 주문 리뷰 존재 여부 확인
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.json({ error: "orderId가 필요합니다" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminSupabaseClient() as any;

  const { data: profile } = await admin
    .from("users").select("id").eq("auth_id", user.id).single();
  if (!profile) return NextResponse.json({ exists: false });

  const { data: review } = await admin
    .from("reviews")
    .select("id, rating, content, created_at")
    .eq("order_id", orderId)
    .eq("user_id", profile.id)
    .single();

  return NextResponse.json({ exists: !!review, review: review ?? null });
}

// POST /api/reviews — 리뷰 작성 + PICK 보상 (가게 설정값 연동)
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const body   = await request.json().catch(() => null);
  const parsed = ReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "입력값이 올바르지 않습니다" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminSupabaseClient() as any;

  const { data: profile } = await admin
    .from("users").select("id").eq("auth_id", user.id).single();
  if (!profile) return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 });

  const { orderId, rating, content, imageUrls } = parsed.data;
  const hasPhotos = (imageUrls ?? []).length > 0;

  // 주문 검증: 본인 주문 + 배달 완료 상태
  const { data: order } = await admin
    .from("orders")
    .select("id, status, store_id, user_id")
    .eq("id", orderId)
    .eq("user_id", profile.id)
    .single();

  if (!order) return NextResponse.json({ error: "주문을 찾을 수 없습니다" }, { status: 404 });
  if (order.status !== "delivered") {
    return NextResponse.json({ error: "배달 완료된 주문만 리뷰를 작성할 수 있어요" }, { status: 400 });
  }

  // 중복 리뷰 체크
  const { data: existing } = await admin
    .from("reviews").select("id").eq("order_id", orderId).single();
  if (existing) {
    return NextResponse.json({ error: "이미 리뷰를 작성한 주문이에요" }, { status: 409 });
  }

  // 가게 리뷰 보상 설정 조회 (photo_review_reward_krw, 1 KRW = 1 PICK)
  const { data: store } = await admin
    .from("stores")
    .select("photo_review_reward_krw")
    .eq("id", order.store_id)
    .single();

  // 사진 첨부 시에만 가게 설정 보상 지급, 텍스트만이면 0
  const pickReward = hasPhotos ? Number(store?.photo_review_reward_krw ?? 0) : 0;

  // 리뷰 저장
  const { error: insertError } = await admin.from("reviews").insert({
    order_id:    orderId,
    user_id:     profile.id,
    store_id:    order.store_id,
    rating,
    content:     content ?? null,
    image_urls:  imageUrls ?? [],
    pick_reward: pickReward,
  });

  if (insertError) {
    console.error("리뷰 저장 오류:", insertError.message);
    return NextResponse.json({ error: "리뷰 저장에 실패했습니다" }, { status: 500 });
  }

  // 가게 평점 업데이트
  const { data: storeReviews } = await admin
    .from("reviews")
    .select("rating")
    .eq("store_id", order.store_id);

  if (storeReviews && storeReviews.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const avg = storeReviews.reduce((s: number, r: any) => s + Number(r.rating), 0) / storeReviews.length;
    await admin.from("stores").update({
      rating:       Math.round(avg * 10) / 10,
      review_count: storeReviews.length,
    }).eq("id", order.store_id);
  }

  // PICK 보상 지급 (보상이 있을 때만)
  if (pickReward > 0) {
    const { data: wallet } = await admin
      .from("wallets").select("id, pick_balance, total_earned").eq("user_id", profile.id).single();

    if (wallet) {
      const newBalance     = Number(wallet.pick_balance) + pickReward;
      const newTotalEarned = Number(wallet.total_earned) + pickReward;
      await admin.from("wallets").update({
        pick_balance: newBalance,
        total_earned: newTotalEarned,
        updated_at:   new Date().toISOString(),
      }).eq("id", wallet.id);

      await admin.from("wallet_transactions").insert({
        wallet_id:     wallet.id,
        type:          "reward",
        amount:        pickReward,
        balance_after: newBalance,
        description:   "사진 리뷰 PICK 보상",
      });
    }
  }

  return NextResponse.json({ ok: true, pickReward });
}

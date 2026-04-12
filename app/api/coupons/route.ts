import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

// GET /api/coupons — 내 보유 쿠폰 목록
export async function GET() {
  const supabase = await createServerSupabaseClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminSupabaseClient() as any;

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const { data: profile } = await admin
    .from("users").select("id").eq("auth_id", user.id).single();
  if (!profile) return NextResponse.json({ coupons: [] });

  const { data: rows } = await admin
    .from("user_coupons")
    .select(`
      id, is_used, used_at, created_at,
      coupons(id, code, title, description, type, value, min_order, expires_at, store_id)
    `)
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  const now = new Date();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const coupons = (rows ?? []).map((r: any) => {
    const c = r.coupons;
    const expired = c?.expires_at ? new Date(c.expires_at) < now : false;
    return {
      userCouponId: r.id,
      isUsed:       r.is_used,
      usedAt:       r.used_at,
      receivedAt:   r.created_at,
      coupon: {
        id:          c?.id,
        code:        c?.code,
        title:       c?.title,
        description: c?.description,
        type:        c?.type,
        value:       Number(c?.value ?? 0),
        minOrder:    Number(c?.min_order ?? 0),
        expiresAt:   c?.expires_at,
        storeId:     c?.store_id,
        isExpired:   expired,
      },
    };
  });

  const available = coupons.filter((c: { isUsed: boolean; coupon: { isExpired: boolean } }) => !c.isUsed && !c.coupon.isExpired).length;

  return NextResponse.json({ coupons, available });
}

// POST /api/coupons — 쿠폰 코드 등록
const RegisterSchema = z.object({
  code: z.string().min(1).max(30).toUpperCase(),
});

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminSupabaseClient() as any;

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const body   = await request.json().catch(() => null);
  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "쿠폰 코드를 입력해주세요" }, { status: 400 });
  }

  const { data: profile } = await admin
    .from("users").select("id").eq("auth_id", user.id).single();
  if (!profile) return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 });

  // 쿠폰 조회
  const { data: coupon } = await admin
    .from("coupons")
    .select("id, title, type, value, max_uses, used_count, max_per_user, is_active, expires_at")
    .eq("code", parsed.data.code)
    .single();

  if (!coupon) {
    return NextResponse.json({ error: "존재하지 않는 쿠폰 코드입니다" }, { status: 404 });
  }
  if (!coupon.is_active) {
    return NextResponse.json({ error: "비활성화된 쿠폰입니다" }, { status: 400 });
  }
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return NextResponse.json({ error: "만료된 쿠폰입니다" }, { status: 400 });
  }
  if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
    return NextResponse.json({ error: "발급 한도가 소진된 쿠폰입니다" }, { status: 400 });
  }

  // 중복 등록 확인
  const { data: existing } = await admin
    .from("user_coupons")
    .select("id")
    .eq("user_id", profile.id)
    .eq("coupon_id", coupon.id)
    .single();

  if (existing) {
    return NextResponse.json({ error: "이미 등록한 쿠폰입니다" }, { status: 409 });
  }

  // 쿠폰 지급
  const { error: insertError } = await admin
    .from("user_coupons")
    .insert({ user_id: profile.id, coupon_id: coupon.id });

  if (insertError) {
    return NextResponse.json({ error: "쿠폰 등록에 실패했습니다" }, { status: 500 });
  }

  // used_count 증가
  await admin
    .from("coupons")
    .update({ used_count: (coupon.used_count as number) + 1 })
    .eq("id", coupon.id);

  return NextResponse.json({
    ok: true,
    message: `"${coupon.title}" 쿠폰이 등록됐습니다!`,
    coupon: { title: coupon.title, type: coupon.type, value: Number(coupon.value) },
  });
}

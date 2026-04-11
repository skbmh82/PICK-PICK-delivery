import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

const CATEGORIES = ["한식","중식","일식","치킨","피자","분식","카페·디저트","양식"] as const;

const RegisterStoreSchema = z.object({
  name:            z.string().min(2, "가게 이름은 2자 이상 입력해주세요").max(50),
  category:        z.enum(CATEGORIES, { message: "카테고리를 선택해주세요" }),
  description:     z.string().max(200).optional(),
  phone:           z.string().max(20).optional(),
  address:         z.string().min(5, "주소를 입력해주세요").max(200),
  deliveryFee:     z.number().min(0).max(100000),
  minOrderAmount:  z.number().min(0).max(1000000),
  deliveryTime:    z.number().int().min(5).max(120),
});

// POST /api/stores/my — 가게 등록
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminSupabaseClient() as any;

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const { data: profile } = await admin
    .from("users").select("id, role").eq("auth_id", user.id).single();

  if (!profile || !["owner", "admin"].includes(profile.role)) {
    return NextResponse.json({ error: "사장님 권한이 필요합니다" }, { status: 403 });
  }

  // 이미 가게가 있는지 확인
  const { data: existing } = await admin
    .from("stores").select("id").eq("owner_id", profile.id).single();
  if (existing) {
    return NextResponse.json({ error: "이미 등록된 가게가 있습니다" }, { status: 409 });
  }

  const body   = await request.json().catch(() => null);
  const parsed = RegisterStoreSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다" },
      { status: 400 },
    );
  }

  const { name, category, description, phone, address, deliveryFee, minOrderAmount, deliveryTime } = parsed.data;

  const { data: store, error: insertError } = await admin
    .from("stores")
    .insert({
      owner_id:         profile.id,
      name,
      category,
      description:      description ?? null,
      phone:            phone ?? null,
      address,
      lat:              0,   // 추후 카카오맵 Geocoding으로 자동 변환
      lng:              0,
      delivery_fee:     deliveryFee,
      min_order_amount: minOrderAmount,
      delivery_time:    deliveryTime,
      is_open:          true,
      is_approved:      false,  // 관리자 승인 대기
      pick_reward_rate: 1.0,
    })
    .select("id, name, category")
    .single();

  if (insertError || !store) {
    console.error("가게 등록 오류:", insertError?.message);
    return NextResponse.json({ error: "가게 등록에 실패했습니다" }, { status: 500 });
  }

  return NextResponse.json({ store }, { status: 201 });
}

// GET /api/stores/my — 로그인한 사장님의 가게 정보
export async function GET() {
  const supabase = await createServerSupabaseClient();
  const admin    = getAdminSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const { data: profile } = await admin
    .from("users")
    .select("id, role")
    .eq("auth_id", user.id)
    .single();

  if (!profile || !["owner", "admin"].includes(profile.role)) {
    return NextResponse.json({ error: "사장님 권한이 필요합니다" }, { status: 403 });
  }

  const { data: store } = await admin
    .from("stores")
    .select("id, name, category, is_open, delivery_fee, min_order_amount, pick_reward_rate")
    .eq("owner_id", profile.id)
    .single();

  if (!store) {
    return NextResponse.json({ store: null });
  }

  return NextResponse.json({ store });
}

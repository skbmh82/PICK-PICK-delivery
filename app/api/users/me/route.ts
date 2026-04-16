import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { getGradeInfo } from "@/lib/pick-grade";

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

  // 등급 계산 (lib/pick-grade.ts 공통 함수 사용)
  const gradeInfo   = getGradeInfo(totalEarned);
  const gradeLabel  = `${gradeInfo.emoji} ${gradeInfo.grade}`;
  const nextThreshold = gradeInfo.nextMin ?? 0;

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
    .select("id, rating, content, created_at, store_id, stores(name)")
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
      profileImage: profile.profile_image ?? null,
      addressMain:  profile.address_main,
    },
    wallet: { pickBalance, totalEarned },
    grade:  { label: gradeLabel, earned: totalEarned, nextThreshold, multiplier: gradeInfo.multiplier },
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
      storeId:   r.store_id ?? null,
      storeName: r.stores?.name ?? "",
    })),
  });
}

const UpdateProfileSchema = z.object({
  name:         z.string().min(2).max(50).optional(),
  phone:        z.string().max(20).optional(),
  addressMain:  z.string().max(200).optional(),
  profileImage: z.string().url().nullable().optional(),
});

// PATCH /api/users/me — 프로필 수정
export async function PATCH(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const body   = await request.json().catch(() => null);
  const parsed = UpdateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "입력값이 올바르지 않습니다" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminSupabaseClient() as any;
  const { data: profile } = await admin
    .from("users").select("id").eq("auth_id", user.id).single();
  if (!profile) return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 });

  const updates: Record<string, string | null> = {};
  if (parsed.data.name         !== undefined) updates.name          = parsed.data.name ?? null;
  if (parsed.data.phone        !== undefined) updates.phone         = parsed.data.phone ?? null;
  if (parsed.data.addressMain  !== undefined) updates.address_main  = parsed.data.addressMain ?? null;
  if (parsed.data.profileImage !== undefined) updates.profile_image = parsed.data.profileImage ?? null;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: true });
  }

  updates.updated_at = new Date().toISOString();

  const { error: updateError } = await admin
    .from("users").update(updates).eq("id", profile.id);

  if (updateError) {
    return NextResponse.json({ error: "프로필 수정에 실패했습니다" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// DELETE /api/users/me — 회원탈퇴
export async function DELETE() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminSupabaseClient() as any;

  const { data: profile } = await admin
    .from("users").select("id, role").eq("auth_id", user.id).single();
  if (!profile) return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 });

  // 진행 중인 주문이 있으면 탈퇴 불가
  const ACTIVE = ["pending","confirmed","preparing","ready","picked_up","delivering"];
  const { count } = await admin
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("user_id", profile.id)
    .in("status", ACTIVE);

  if ((count ?? 0) > 0) {
    return NextResponse.json({ error: "진행 중인 주문이 있어 탈퇴할 수 없어요. 주문 완료 후 다시 시도해 주세요." }, { status: 400 });
  }

  // 1. users 테이블 개인정보 익명화 (주문 내역 보존 목적)
  await admin.from("users").update({
    name:          "탈퇴한 사용자",
    email:         null,
    phone:         null,
    profile_image: null,
    address_main:  null,
    updated_at:    new Date().toISOString(),
  }).eq("id", profile.id);

  // 2. FCM 토큰 삭제
  await admin.from("fcm_tokens").delete().eq("user_id", profile.id);

  // 3. Supabase Auth 계정 삭제 (Admin API)
  const authAdmin = getAdminSupabaseClient();
  await authAdmin.auth.admin.deleteUser(user.id);

  return NextResponse.json({ ok: true });
}

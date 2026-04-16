import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

// 라이더 등급 계산 (누적 수익 기준)
function getRiderGrade(totalEarned: number) {
  if (totalEarned >= 1_000_000) return { grade: "다이아",  emoji: "💎", bonus: 10, nextMin: null };
  if (totalEarned >=   500_000) return { grade: "골드",    emoji: "🥇", bonus: 8,  nextMin: 1_000_000 };
  if (totalEarned >=   200_000) return { grade: "실버",    emoji: "🥈", bonus: 5,  nextMin: 500_000 };
  if (totalEarned >=    50_000) return { grade: "브론즈",  emoji: "🥉", bonus: 3,  nextMin: 200_000 };
  return                               { grade: "뉴비",    emoji: "🔰", bonus: 0,  nextMin: 50_000 };
}

// GET /api/rider/profile — 라이더 프로필 + PICK 지갑 + 등급 + 이번 달 실적
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
    .select("id, name, email, phone, role, profile_image, vehicle_type")
    .eq("auth_id", user.id)
    .single();

  if (!profile || !["rider", "admin"].includes(profile.role)) {
    return NextResponse.json({ error: "라이더 권한이 필요합니다" }, { status: 403 });
  }

  // PICK 지갑
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: wallet } = await (admin as any)
    .from("wallets")
    .select("pick_balance, total_earned")
    .eq("user_id", profile.id)
    .single();

  const pickBalance  = Number(wallet?.pick_balance  ?? 0);
  const totalEarned  = Number(wallet?.total_earned  ?? 0);

  // 누적 라이더 수익 (rider_earnings settled 합산)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: earnings } = await (admin as any)
    .from("rider_earnings")
    .select("amount_pick, status, created_at")
    .eq("rider_id", profile.id)
    .order("created_at", { ascending: false });

  const totalRiderEarned = (earnings ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .reduce((sum: number, e: any) => sum + Number(e.amount_pick ?? 0), 0);

  // 이번 달 실적
  const now       = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const thisMonth = (earnings ?? []).filter((e: any) => e.created_at >= monthStart);
  const monthlyEarning = thisMonth
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .reduce((sum: number, e: any) => sum + Number(e.amount_pick ?? 0), 0);
  const monthlyCount   = thisMonth.length;

  // 온라인 상태
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: location } = await (admin as any)
    .from("rider_locations")
    .select("is_active")
    .eq("rider_id", profile.id)
    .single();

  const gradeInfo = getRiderGrade(totalRiderEarned);

  return NextResponse.json({
    profile: {
      id:           profile.id,
      name:         profile.name,
      email:        profile.email,
      phone:        profile.phone,
      profileImage: profile.profile_image ?? null,
      vehicleType:  profile.vehicle_type ?? "motorcycle",
      isOnline:     location?.is_active ?? false,
    },
    wallet: { pickBalance, totalEarned },
    rider: {
      totalEarned:   totalRiderEarned,
      monthlyEarning,
      monthlyCount,
    },
    grade: {
      grade:   gradeInfo.grade,
      emoji:   gradeInfo.emoji,
      bonus:   gradeInfo.bonus,
      nextMin: gradeInfo.nextMin,
      earned:  totalRiderEarned,
    },
  });
}

const UpdateRiderSchema = z.object({
  name:        z.string().min(2).max(50).optional(),
  phone:       z.string().max(20).optional(),
  vehicleType: z.enum(["motorcycle", "bicycle", "kickboard", "walk"]).optional(),
  profileImage: z.string().url().nullable().optional(),
});

// PATCH /api/rider/profile — 라이더 프로필 수정
export async function PATCH(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const body   = await request.json().catch(() => null);
  const parsed = UpdateRiderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "입력값이 올바르지 않습니다" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminSupabaseClient() as any;
  const { data: profile } = await admin
    .from("users").select("id, role").eq("auth_id", user.id).single();

  if (!profile || !["rider", "admin"].includes(profile.role)) {
    return NextResponse.json({ error: "라이더 권한이 필요합니다" }, { status: 403 });
  }

  const updates: Record<string, string | null> = {};
  if (parsed.data.name         !== undefined) updates.name          = parsed.data.name;
  if (parsed.data.phone        !== undefined) updates.phone         = parsed.data.phone;
  if (parsed.data.vehicleType  !== undefined) updates.vehicle_type  = parsed.data.vehicleType;
  if (parsed.data.profileImage !== undefined) updates.profile_image = parsed.data.profileImage ?? null;

  if (Object.keys(updates).length === 0) return NextResponse.json({ ok: true });

  updates.updated_at = new Date().toISOString();
  const { error: updateError } = await admin
    .from("users").update(updates).eq("id", profile.id);

  if (updateError) {
    return NextResponse.json({ error: "프로필 수정에 실패했습니다" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

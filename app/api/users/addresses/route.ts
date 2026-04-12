import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { geocodeAddress } from "@/lib/kakao/geocode";

const LABELS = ["집", "회사", "기타"] as const;
const MAX_ADDRESSES = 5;

const AddressSchema = z.object({
  label:     z.enum(LABELS, { message: "레이블은 집·회사·기타 중 하나여야 합니다" }),
  address:   z.string().min(2, "주소를 입력해주세요").max(200),
  detail:    z.string().max(100).optional(),
  isDefault: z.boolean().optional(),
});

async function getProfile(userId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminSupabaseClient() as any;
  const { data } = await admin
    .from("users")
    .select("id")
    .eq("auth_id", userId)
    .single();
  return data as { id: string } | null;
}

// GET /api/users/addresses — 내 배달 주소 목록
export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const profile = await getProfile(user.id);
  if (!profile) return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminSupabaseClient() as any;
  const { data: rows, error } = await admin
    .from("user_addresses")
    .select("id, label, address, detail, is_default, lat, lng, created_at")
    .eq("user_id", profile.id)
    .order("is_default", { ascending: false })
    .order("created_at",  { ascending: true });

  if (error) {
    return NextResponse.json({ error: "주소 목록 조회에 실패했습니다" }, { status: 500 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addresses = (rows ?? []).map((r: any) => ({
    id:        r.id,
    label:     r.label,
    address:   r.address,
    detail:    r.detail ?? "",
    isDefault: r.is_default,
    lat:       r.lat  != null ? Number(r.lat)  : null,
    lng:       r.lng  != null ? Number(r.lng)  : null,
  }));

  return NextResponse.json({ addresses });
}

// POST /api/users/addresses — 배달 주소 추가 (최대 5개)
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const profile = await getProfile(user.id);
  if (!profile) return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 });

  const body   = await request.json().catch(() => null);
  const parsed = AddressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminSupabaseClient() as any;

  // 개수 제한 확인
  const { count } = await admin
    .from("user_addresses")
    .select("id", { count: "exact", head: true })
    .eq("user_id", profile.id);

  if ((count ?? 0) >= MAX_ADDRESSES) {
    return NextResponse.json({ error: `배달 주소는 최대 ${MAX_ADDRESSES}개까지 저장할 수 있어요` }, { status: 422 });
  }

  const { label, address, detail, isDefault } = parsed.data;
  const makeDefault = isDefault ?? (count === 0); // 첫 번째 주소는 자동으로 기본

  // 기본 주소로 설정하는 경우 기존 기본 주소 해제
  if (makeDefault) {
    await admin
      .from("user_addresses")
      .update({ is_default: false })
      .eq("user_id", profile.id);
  }

  // 주소 → 좌표 변환 (Kakao Local API, 키 없으면 null)
  const coords = await geocodeAddress(address);

  const { data: newAddr, error: insertErr } = await admin
    .from("user_addresses")
    .insert({
      user_id:    profile.id,
      label,
      address,
      detail:     detail ?? null,
      is_default: makeDefault,
      lat:        coords?.lat ?? null,
      lng:        coords?.lng ?? null,
    })
    .select("id, label, address, detail, is_default, lat, lng")
    .single();

  if (insertErr) {
    return NextResponse.json({ error: "주소 추가에 실패했습니다" }, { status: 500 });
  }

  return NextResponse.json({
    address: {
      id:        newAddr.id,
      label:     newAddr.label,
      address:   newAddr.address,
      detail:    newAddr.detail ?? "",
      isDefault: newAddr.is_default,
      lat:       newAddr.lat  != null ? Number(newAddr.lat)  : null,
      lng:       newAddr.lng  != null ? Number(newAddr.lng)  : null,
    },
  }, { status: 201 });
}

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

// GET /api/admin/riders — 라이더 목록 (서류 제출자만)
export async function GET() {
  const supabase = await createServerSupabaseClient();
  const admin    = getAdminSupabaseClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const { data: me } = await admin
    .from("users").select("role").eq("auth_id", user.id).single();
  if (me?.role !== "admin") {
    return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 });
  }

  const { data: riders, error } = await admin
    .from("users")
    .select("id, name, email, phone, vehicle_type, id_image_url, vehicle_reg_image_url, insurance_image_url, rider_is_approved, created_at")
    .eq("role", "rider")
    .not("id_image_url", "is", null)   // 서류 제출한 라이더만
    .order("rider_is_approved", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "라이더 목록 조회에 실패했습니다" }, { status: 500 });
  }

  const result = (riders ?? []).map((r: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
    id:                 r.id,
    name:               r.name,
    email:              r.email,
    phone:              r.phone,
    vehicleType:        r.vehicle_type,
    idImageUrl:         r.id_image_url,
    vehicleRegImageUrl: r.vehicle_reg_image_url,
    insuranceImageUrl:  r.insurance_image_url,
    isApproved:         r.rider_is_approved,          // null=심사중, false=반려, true=승인
    createdAt:          r.created_at,
  }));

  return NextResponse.json({ riders: result });
}

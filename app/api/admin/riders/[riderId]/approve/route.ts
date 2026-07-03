import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

// PATCH /api/admin/riders/[riderId]/approve — 라이더 승인/반려
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ riderId: string }> }
) {
  const { riderId } = await params;
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

  const body = await request.json().catch(() => ({})) as { approved?: boolean };
  if (typeof body.approved !== "boolean") {
    return NextResponse.json({ error: "approved 값이 필요합니다" }, { status: 400 });
  }

  const { error } = await admin
    .from("users")
    .update({ rider_is_approved: body.approved, updated_at: new Date().toISOString() })
    .eq("id", riderId)
    .eq("role", "rider");

  if (error) {
    return NextResponse.json({ error: "승인 처리에 실패했습니다" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

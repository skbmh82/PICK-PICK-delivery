import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createAdminClient } from "@/lib/supabase/server";

const ALL_ROLES = ["user", "owner", "rider", "admin"] as const;

// PATCH /api/admin/users/[id]/role — 관리자가 특정 유저 역할 변경
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: me } = await admin
    .from("users").select("role").eq("auth_id", user.id).single();
  if (me?.role !== "admin") {
    return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 });
  }

  const { id: targetId } = await params;
  const body = await req.json() as { role?: string };
  const newRole = body.role;
  if (!newRole || !ALL_ROLES.includes(newRole as typeof ALL_ROLES[number])) {
    return NextResponse.json({ error: "유효하지 않은 역할입니다" }, { status: 400 });
  }

  const { error } = await admin
    .from("users")
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq("id", targetId);

  if (error) {
    return NextResponse.json({ error: "역할 변경에 실패했습니다" }, { status: 500 });
  }

  return NextResponse.json({ role: newRole });
}

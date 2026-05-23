import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";

const SELF_CHANGEABLE_ROLES = ["user", "owner", "rider"] as const;

// PATCH /api/users/me/role — 본인 역할 변경 (admin 제외)
export async function PATCH(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const body = await req.json() as { role?: string };
  const newRole = body.role;
  if (!newRole || !SELF_CHANGEABLE_ROLES.includes(newRole as typeof SELF_CHANGEABLE_ROLES[number])) {
    return NextResponse.json({ error: "유효하지 않은 역할입니다" }, { status: 400 });
  }

  const admin = createAdminClient();

  // 현재 역할 확인 — admin은 본인이 변경 불가
  const { data: me } = await admin
    .from("users").select("role").eq("auth_id", user.id).single();
  if (me?.role === "admin") {
    return NextResponse.json({ error: "관리자 역할은 직접 변경할 수 없습니다" }, { status: 403 });
  }

  const { error } = await admin
    .from("users")
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq("auth_id", user.id);

  if (error) {
    return NextResponse.json({ error: "역할 변경에 실패했습니다" }, { status: 500 });
  }

  return NextResponse.json({ role: newRole });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

const ReadSchema = z.object({
  id: z.string().uuid().optional(), // 없으면 전체 읽음 처리
});

// PATCH /api/notifications/read — 읽음 처리 (id 없으면 전체)
export async function PATCH(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminSupabaseClient() as any;

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const { data: profile } = await admin
    .from("users").select("id").eq("auth_id", user.id).single();
  if (!profile) return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 });

  const body   = await request.json().catch(() => ({}));
  const parsed = ReadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "입력값이 올바르지 않습니다" }, { status: 400 });
  }

  const { id } = parsed.data;

  let query = admin
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", profile.id);

  if (id) query = query.eq("id", id);

  const { error } = await query;
  if (error) {
    return NextResponse.json({ error: "읽음 처리에 실패했습니다" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/notifications";

const ApproveSchema = z.object({
  approved: z.boolean(),
  reason:   z.string().max(200).optional(),  // 반려 시 사유
});

// PATCH /api/admin/stores/[storeId]/approve — 가게 승인 / 반려
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  const { storeId } = await params;
  const supabase    = await createServerSupabaseClient();
  const admin       = getAdminSupabaseClient() as any; // eslint-disable-line @typescript-eslint/no-explicit-any

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const { data: me } = await admin
    .from("users").select("role").eq("auth_id", user.id).single();
  if (me?.role !== "admin") {
    return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 });
  }

  const body   = await request.json().catch(() => null);
  const parsed = ApproveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "입력값이 올바르지 않습니다" }, { status: 400 });
  }

  const { approved, reason } = parsed.data;

  // 가게 + 사장님 조회
  const { data: store } = await admin
    .from("stores")
    .select("id, name, owner_id")
    .eq("id", storeId)
    .single();

  if (!store) {
    return NextResponse.json({ error: "가게를 찾을 수 없습니다" }, { status: 404 });
  }

  // 승인 상태 업데이트
  const { error: updateErr } = await admin
    .from("stores")
    .update({ is_approved: approved, updated_at: new Date().toISOString() })
    .eq("id", storeId);

  if (updateErr) {
    return NextResponse.json({ error: "상태 변경에 실패했습니다" }, { status: 500 });
  }

  // 사장님에게 알림
  if (store.owner_id) {
    await createNotification({
      userId: store.owner_id,
      type:   "system",
      title:  approved
        ? `${store.name} 가게가 승인됐어요! 🎉`
        : `${store.name} 가게 승인이 반려됐어요`,
      body: approved
        ? "이제 고객에게 노출됩니다. 메뉴를 등록해보세요!"
        : reason ? `반려 사유: ${reason}` : "관리자에게 문의해주세요.",
      data: { storeId, approved },
    });
  }

  return NextResponse.json({ ok: true, approved });
}

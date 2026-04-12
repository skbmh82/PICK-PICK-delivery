import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

const ReplySchema = z.object({
  reply: z.string().min(1, "답글을 입력해주세요").max(500),
});

// POST /api/reviews/[reviewId]/reply — 사장님 리뷰 답글
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  const { reviewId } = await params;
  const supabase = await createServerSupabaseClient();
  const admin    = getAdminSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: profile } = await (admin as any)
    .from("users")
    .select("id, role")
    .eq("auth_id", user.id)
    .single();

  if (!profile || !["owner", "admin"].includes(profile.role)) {
    return NextResponse.json({ error: "사장님 권한이 필요합니다" }, { status: 403 });
  }

  // 리뷰 조회 — 본인 가게 리뷰인지 확인
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: review } = await (admin as any)
    .from("reviews")
    .select("id, store_id")
    .eq("id", reviewId)
    .single();

  if (!review) {
    return NextResponse.json({ error: "리뷰를 찾을 수 없습니다" }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: store } = await (admin as any)
    .from("stores")
    .select("id")
    .eq("owner_id", profile.id)
    .eq("id", review.store_id)
    .single();

  if (!store) {
    return NextResponse.json({ error: "본인 가게의 리뷰만 답글을 달 수 있습니다" }, { status: 403 });
  }

  const body   = await request.json().catch(() => null);
  const parsed = ReplySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다" },
      { status: 400 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await (admin as any)
    .from("reviews")
    .update({
      owner_reply:      parsed.data.reply,
      owner_replied_at: new Date().toISOString(),
    })
    .eq("id", reviewId);

  if (updateError) {
    console.error("리뷰 답글 오류:", updateError.message);
    return NextResponse.json({ error: "답글 저장에 실패했습니다" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// DELETE /api/reviews/[reviewId]/reply — 답글 삭제
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  const { reviewId } = await params;
  const supabase = await createServerSupabaseClient();
  const admin    = getAdminSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin as any)
    .from("reviews")
    .update({ owner_reply: null, owner_replied_at: null })
    .eq("id", reviewId);

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { sendMulticastPush } from "@/lib/firebase/admin";

const PushSchema = z.object({
  title:  z.string().min(1).max(100),
  body:   z.string().min(1).max(500),
  url:    z.string().optional(),
  // 특정 역할만 보내기 (미지정 시 전체)
  roles:  z.array(z.enum(["user", "owner", "rider"])).optional(),
});

// POST /api/admin/push — 관리자 일괄 FCM 푸시 알림 발송
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const adminClient = getAdminSupabaseClient() as any;

  const { data: me } = await adminClient
    .from("users").select("role").eq("auth_id", user.id).single();
  if (me?.role !== "admin") {
    return NextResponse.json({ error: "관리자 권한이 필요합니다" }, { status: 403 });
  }

  const body   = await request.json().catch(() => null);
  const parsed = PushSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "입력값이 올바르지 않습니다", details: parsed.error.flatten() }, { status: 400 });
  }

  const { title, body: msgBody, url, roles } = parsed.data;

  // 대상 user_id 목록 (역할 필터 적용)
  let userQuery = adminClient.from("users").select("id");
  if (roles && roles.length > 0) {
    userQuery = userQuery.in("role", roles);
  }
  const { data: targetUsers, error: usersError } = await userQuery;
  if (usersError) {
    return NextResponse.json({ error: "사용자 목록 조회에 실패했습니다" }, { status: 500 });
  }

  if (!targetUsers || targetUsers.length === 0) {
    return NextResponse.json({ sent: 0, total: 0, message: "대상 사용자가 없습니다" });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userIds = (targetUsers as any[]).map((u) => u.id as string);

  // FCM 토큰 목록 조회
  const { data: tokenRows, error: tokenError } = await adminClient
    .from("user_fcm_tokens")
    .select("token")
    .in("user_id", userIds);

  if (tokenError) {
    return NextResponse.json({ error: "FCM 토큰 조회에 실패했습니다" }, { status: 500 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tokens: string[] = (tokenRows ?? []).map((r: any) => r.token as string).filter(Boolean);

  if (tokens.length === 0) {
    return NextResponse.json({ sent: 0, total: userIds.length, message: "등록된 FCM 토큰이 없습니다" });
  }

  const data: Record<string, string> = {};
  if (url) data.url = url;

  await sendMulticastPush({ tokens, title, body: msgBody, data });

  return NextResponse.json({
    sent:    tokens.length,
    total:   userIds.length,
    message: `${tokens.length}개 기기에 푸시 알림을 발송했습니다`,
  });
}

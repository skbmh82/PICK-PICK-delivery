import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

// GET /api/notifications — 내 알림 목록 + 미읽음 수
export async function GET() {
  const supabase = await createServerSupabaseClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminSupabaseClient() as any;

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const { data: profile } = await admin
    .from("users").select("id").eq("auth_id", user.id).single();
  if (!profile) return NextResponse.json({ notifications: [], unreadCount: 0 });

  const { data: rows, error } = await admin
    .from("notifications")
    .select("id, type, title, body, data, is_read, created_at")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: "알림 조회에 실패했습니다" }, { status: 500 });
  }

  const notifications = (rows ?? []).map((r: {
    id: string; type: string; title: string;
    body: string | null; data: Record<string, unknown>;
    is_read: boolean; created_at: string;
  }) => ({
    id:        r.id,
    type:      r.type,
    title:     r.title,
    body:      r.body,
    data:      r.data,
    isRead:    r.is_read,
    createdAt: r.created_at,
  }));

  const unreadCount = notifications.filter((n: { isRead: boolean }) => !n.isRead).length;

  return NextResponse.json({ notifications, unreadCount });
}

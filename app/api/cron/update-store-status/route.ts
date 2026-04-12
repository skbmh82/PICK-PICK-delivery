import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

/**
 * GET /api/cron/update-store-status
 * Vercel Cron Job — 30분마다 가게 영업 상태를 자동 업데이트합니다.
 * vercel.json의 crons 설정에서 호출됩니다.
 */
export async function GET(request: NextRequest) {
  // Vercel Cron 인증 확인 (프로덕션 보호)
  const authHeader = request.headers.get("authorization");
  if (
    process.env.NODE_ENV === "production" &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const admin = getAdminSupabaseClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (admin as any).rpc("update_store_open_status");

    if (error) {
      console.error("[cron] update_store_open_status 오류:", error.message);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    console.log("[cron] 가게 영업 상태 업데이트 완료:", new Date().toISOString());
    return NextResponse.json({ ok: true, updatedAt: new Date().toISOString() });
  } catch (e) {
    console.error("[cron] 예외:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

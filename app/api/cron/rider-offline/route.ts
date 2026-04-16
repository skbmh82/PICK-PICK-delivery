import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/notifications";

const OFFLINE_AFTER_MINUTES = 10; // 마지막 위치 업데이트 후 N분 경과 시 오프라인 처리

/**
 * GET /api/cron/rider-offline
 * Vercel Cron Job — 매 5분 실행
 * 위치 업데이트가 OFFLINE_AFTER_MINUTES 이상 없는 온라인 라이더를 자동 오프라인 처리
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.NODE_ENV === "production" &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = getAdminSupabaseClient() as any;

    // 기준 시각: 현재 - OFFLINE_AFTER_MINUTES
    const cutoff = new Date(Date.now() - OFFLINE_AFTER_MINUTES * 60 * 1000).toISOString();

    // 온라인 상태이면서 마지막 업데이트가 기준 시각보다 오래된 라이더 조회
    const { data: staleRiders, error } = await admin
      .from("rider_locations")
      .select("rider_id, updated_at")
      .eq("is_active", true)
      .lt("updated_at", cutoff);

    if (error) {
      console.error("[cron] rider-offline 조회 오류:", error.message);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    if (!staleRiders || staleRiders.length === 0) {
      return NextResponse.json({ ok: true, offlined: 0 });
    }

    const riderIds = staleRiders.map((r: { rider_id: string }) => r.rider_id);

    // 일괄 오프라인 처리
    const { error: updateError } = await admin
      .from("rider_locations")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .in("rider_id", riderIds);

    if (updateError) {
      console.error("[cron] rider-offline 업데이트 오류:", updateError.message);
      return NextResponse.json({ ok: false, error: updateError.message }, { status: 500 });
    }

    // 각 라이더에게 알림 전송 (앱이 살아있다면 상태 인지 가능)
    await Promise.allSettled(
      riderIds.map((riderId: string) =>
        createNotification({
          userId: riderId,
          type:   "system",
          title:  "자동 오프라인 전환 안내",
          body:   `${OFFLINE_AFTER_MINUTES}분간 활동이 없어 오프라인으로 전환됐어요. 배달을 재개하려면 온라인으로 전환해 주세요.`,
          data:   { type: "rider_auto_offline" },
        })
      )
    );

    console.log(`[cron] rider-offline 자동 오프라인 처리: ${riderIds.length}명`);
    return NextResponse.json({ ok: true, offlined: riderIds.length, riderIds });
  } catch (e) {
    console.error("[cron] rider-offline 예외:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

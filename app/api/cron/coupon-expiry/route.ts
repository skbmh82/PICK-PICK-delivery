import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { sendPushNotification } from "@/lib/firebase/admin";

/**
 * GET /api/cron/coupon-expiry
 * Vercel Cron Job — 매일 오전 9시 실행
 * 만료 3일 전 쿠폰 보유 사용자에게 FCM 알림 전송
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
    const admin = getAdminSupabaseClient();
    const today = new Date();
    const in3Days = new Date(today);
    in3Days.setDate(today.getDate() + 3);
    const in3DaysStr = in3Days.toISOString().slice(0, 10);
    const todayStr   = today.toISOString().slice(0, 10);

    // 만료 3일 전 ~ 오늘 사이 만료되는 쿠폰 보유 사용자 조회
    const { data: userCoupons, error } = await admin
      .from("user_coupons")
      .select(`
        user_id,
        coupons ( name, expires_at ),
        users ( fcm_tokens )
      `)
      .eq("is_used", false)
      .gte("expires_at", todayStr)
      .lte("expires_at", in3DaysStr);

    if (error) {
      console.error("[cron] coupon-expiry 조회 오류:", error.message);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    let sent = 0;
    for (const row of userCoupons ?? []) {
      const tokens: string[] = (row.users as { fcm_tokens?: string[] } | null)?.fcm_tokens ?? [];
      const couponName = (row.coupons as { name?: string } | null)?.name ?? "쿠폰";
      const expiresAt  = (row.coupons as { expires_at?: string } | null)?.expires_at ?? "";
      const daysLeft   = Math.ceil((new Date(expiresAt).getTime() - today.getTime()) / 86400000);

      for (const token of tokens) {
        const ok = await sendPushNotification({
          token,
          title: "⏰ 쿠폰 만료 임박!",
          body:  `"${couponName}" 쿠폰이 ${daysLeft}일 후 만료돼요. 지금 바로 사용하세요!`,
          data:  { url: "/wallet", type: "coupon_expiry" },
        });
        if (ok) sent++;
      }
    }

    console.log(`[cron] coupon-expiry 알림 전송 완료: ${sent}건`);
    return NextResponse.json({ ok: true, sent });
  } catch (e) {
    console.error("[cron] coupon-expiry 예외:", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

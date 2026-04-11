import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { createNotification, ORDER_STATUS_NOTIFICATION } from "@/lib/notifications";

const VALID_STATUSES = [
  "pending","confirmed","preparing","ready",
  "picked_up","delivering","delivered","cancelled","refunded",
] as const;

const StatusSchema = z.object({
  status:        z.enum(VALID_STATUSES),
  estimatedTime: z.number().int().min(10).max(120).optional(),
});

// PATCH /api/orders/[orderId]/status — 주문 상태 변경 (사장님/라이더/서버)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const supabase = await createServerSupabaseClient();
  const admin    = getAdminSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = StatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "올바른 상태 값이 필요합니다" }, { status: 400 });
  }

  const { status, estimatedTime } = parsed.data;

  // RPC로 상태 변경 (타임스탬프 자동 처리)
  const { error } = await admin.rpc("update_order_status", {
    p_order_id:    orderId,
    p_status:      status,
    p_est_minutes: estimatedTime ?? null,
  });

  if (error) {
    console.error("update_order_status 오류:", error.message);
    return NextResponse.json({ error: "주문 상태 변경에 실패했습니다" }, { status: 500 });
  }

  // 주문 조회 (이후 로직에서 공유)
  const { data: order } = await (admin as ReturnType<typeof getAdminSupabaseClient> & { from: (t: string) => any }) // eslint-disable-line @typescript-eslint/no-explicit-any
    .from("orders")
    .select("user_id, rider_id, pick_reward, delivery_address, stores(name)")
    .eq("id", orderId)
    .single();

  // 상태 변경 알림 (고객에게)
  const notifMsg = ORDER_STATUS_NOTIFICATION[status];
  if (notifMsg && order?.user_id) {
    await createNotification({
      userId: order.user_id,
      type:   "order_update",
      title:  notifMsg.title,
      body:   notifMsg.body,
      data:   { orderId },
    });
  }

  // 조리 완료(ready) → 활성 라이더 전체에게 배달 요청 알림
  if (status === "ready") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: activeRiders } = await (admin as any)
      .from("rider_locations")
      .select("rider_id")
      .eq("is_active", true);

    if (activeRiders && activeRiders.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const storeName = (order?.stores as any)?.name ?? "가게";
      await Promise.all(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        activeRiders.map((r: { rider_id: string }) =>
          createNotification({
            userId: r.rider_id,
            type:   "order_update",
            title:  `새 배달 요청이 있어요 🛵`,
            body:   `${storeName} → ${order?.delivery_address ?? "배달지"}`,
            data:   { orderId, type: "rider_request" },
          })
        )
      );
    }
  }

  // 배달 완료 시 고객 PICK 적립 + 라이더 PICK 지급
  if (status === "delivered") {
    // 고객 PICK 적립
    if (order && Number(order.pick_reward) > 0) {
      await admin.rpc("reward_pick", {
        p_user_id:  order.user_id,
        p_amount:   order.pick_reward,
        p_order_id: orderId,
        p_desc:     "주문 완료 적립",
      }).then(({ error: e }) => {
        if (e) console.error("고객 reward_pick 오류:", e.message);
      });
    }

    // 라이더 PICK 지급 (rider_earnings 참조)
    if (order?.rider_id) {
      const { data: earning } = await admin
        .from("rider_earnings")
        .select("id, amount_pick")
        .eq("order_id", orderId)
        .eq("rider_id", order.rider_id)
        .single();

      if (earning && Number(earning.amount_pick) > 0) {
        await Promise.all([
          admin.rpc("reward_pick", {
            p_user_id:  order.rider_id,
            p_amount:   earning.amount_pick,
            p_order_id: orderId,
            p_desc:     "배달 완료 수익",
          }).then(({ error: e }) => {
            if (e) console.error("라이더 reward_pick 오류:", e.message);
          }),
          admin
            .from("rider_earnings")
            .update({ status: "settled", settled_at: new Date().toISOString() })
            .eq("id", earning.id),
        ]);
      }
    }
  }

  return NextResponse.json({ ok: true, status });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

const VALID_STATUSES = [
  "pending","confirmed","preparing","ready",
  "picked_up","delivering","delivered","cancelled","refunded",
] as const;

const StatusSchema = z.object({
  status: z.enum(VALID_STATUSES),
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

  const { status } = parsed.data;

  // RPC로 상태 변경 (타임스탬프 자동 처리)
  const { error } = await admin.rpc("update_order_status", {
    p_order_id: orderId,
    p_status:   status,
  });

  if (error) {
    console.error("update_order_status 오류:", error.message);
    return NextResponse.json({ error: "주문 상태 변경에 실패했습니다" }, { status: 500 });
  }

  // 배달 완료 시 PICK 적립
  if (status === "delivered") {
    const { data: order } = await admin
      .from("orders")
      .select("user_id, pick_reward")
      .eq("id", orderId)
      .single();

    if (order && Number(order.pick_reward) > 0) {
      await admin.rpc("reward_pick", {
        p_user_id:  order.user_id,
        p_amount:   order.pick_reward,
        p_order_id: orderId,
        p_desc:     "주문 완료 적립",
      }).then(({ error: e }) => {
        if (e) console.error("reward_pick 오류:", e.message);
      });
    }
  }

  return NextResponse.json({ ok: true, status });
}

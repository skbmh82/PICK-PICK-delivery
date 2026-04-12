import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";
import { createNotification } from "@/lib/notifications";

const ConfirmSchema = z.object({
  paymentKey: z.string().min(1),
  orderId:    z.string().min(1),   // toss_order_id (PICK-APP-xxx)
  amount:     z.number().positive(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = ConfirmSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "잘못된 요청입니다" }, { status: 400 });
  }

  const { paymentKey, orderId: tossOrderId, amount } = parsed.data;
  const admin = getAdminSupabaseClient();

  // 1. DB에서 toss_order_id 로 주문 조회
  const { data: order } = await admin
    .from("orders")
    .select("id, status, total_amount, pick_used, pick_reward, store_id, user_id")
    .eq("toss_order_id", tossOrderId)
    .single();

  if (!order) {
    return NextResponse.json({ error: "주문을 찾을 수 없습니다" }, { status: 404 });
  }
  if (order.status !== "pending") {
    return NextResponse.json({ error: "이미 처리된 주문입니다" }, { status: 400 });
  }

  // 2. 금액 검증 (위변조 방지)
  const expectedAmount = Math.round(Number(order.total_amount) * 100) / 100;
  if (Math.abs(amount - expectedAmount) > 1) {
    return NextResponse.json({ error: "결제 금액이 일치하지 않습니다" }, { status: 400 });
  }

  // 3. Toss Payments API 승인 요청
  const secretKey = process.env.TOSS_SECRET_KEY ?? "";
  const encoded   = Buffer.from(`${secretKey}:`).toString("base64");

  const tossRes = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${encoded}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ paymentKey, orderId: tossOrderId, amount }),
  });

  if (!tossRes.ok) {
    const err = await tossRes.json().catch(() => ({}));
    console.error("Toss confirm error:", err);
    return NextResponse.json(
      { error: (err as { message?: string }).message ?? "결제 승인에 실패했습니다" },
      { status: tossRes.status }
    );
  }

  // 4. 주문 상태 업데이트
  await admin.from("orders").update({
    status:           "confirmed",
    toss_payment_key: paymentKey,
    paid_amount:      amount,
    confirmed_at:     new Date().toISOString(),
    updated_at:       new Date().toISOString(),
  }).eq("id", order.id);

  // 5. PICK 리워드 적립
  const pickReward = Number(order.pick_reward);
  if (pickReward > 0) {
    const { data: wallet } = await admin
      .from("wallets")
      .select("id, pick_balance, total_earned")
      .eq("user_id", order.user_id)
      .single();

    if (wallet) {
      const newBalance  = Number(wallet.pick_balance) + pickReward;
      const newEarned   = Number(wallet.total_earned) + pickReward;
      await admin.from("wallets").update({
        pick_balance: newBalance,
        total_earned: newEarned,
        updated_at:   new Date().toISOString(),
      }).eq("user_id", order.user_id);

      await admin.from("wallet_transactions").insert({
        wallet_id:     wallet.id,
        type:          "reward",
        amount:        pickReward,
        balance_after: newBalance,
        ref_order_id:  order.id,
        description:   "주문 PICK 적립 (카드 결제)",
      });
    }
  }

  // 6. 사장님 알림
  const { data: storeOwner } = await admin
    .from("stores")
    .select("owner_id")
    .eq("id", order.store_id)
    .single();

  if (storeOwner?.owner_id) {
    await createNotification({
      userId: storeOwner.owner_id,
      type:   "order_update",
      title:  "새 주문이 결제되었어요! 💳",
      body:   `카드 결제 ${amount.toLocaleString()}원`,
      data:   { orderId: order.id, storeId: order.store_id },
    });
  }

  return NextResponse.json({ orderId: order.id, success: true });
}

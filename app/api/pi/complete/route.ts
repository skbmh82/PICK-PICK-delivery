import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const PI_API_BASE = "https://api.minepi.com";
const PI_TO_PICK  = 300; // 1 Pi = 300 PICK

interface PiPaymentDTO {
  identifier: string;
  user_uid:   string;
  amount:     number;
  status: {
    developer_approved:   boolean;
    transaction_verified: boolean;
    developer_completed:  boolean;
    cancelled:            boolean;
    user_cancelled:       boolean;
  };
  transaction: null | { txid: string; verified: boolean };
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.PI_NETWORK_API_KEY ?? process.env.PI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "PI_NETWORK_API_KEY 환경변수가 설정되지 않았습니다" },
      { status: 500 }
    );
  }

  try {
    const { paymentId, txid } = await req.json() as { paymentId: string; txid?: string };
    if (!paymentId) return NextResponse.json({ error: "paymentId 필요" }, { status: 400 });

    const admin = createAdminClient();

    // 중복 처리 확인 (idempotency)
    const { data: existing } = await admin
      .from("wallet_transactions")
      .select("id")
      .eq("pi_payment_id", paymentId)
      .maybeSingle();

    // Pi API complete 호출 (항상 실행 — Pi 측에도 완료 알려야 함)
    const body: Record<string, string> = {};
    if (txid) body.txid = txid;

    const piRes = await fetch(`${PI_API_BASE}/v2/payments/${paymentId}/complete`, {
      method:  "POST",
      headers: {
        Authorization:  `Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!piRes.ok) {
      const text = await piRes.text();
      return NextResponse.json({ error: `Pi complete 실패: ${text}` }, { status: piRes.status });
    }

    const payment = await piRes.json() as PiPaymentDTO;

    // 이미 PICK 지급된 결제는 중복 지급 없이 종료
    if (existing) {
      return NextResponse.json({ success: true, duplicate: true });
    }

    // Pi UID로 사용자 조회
    const { data: userRow } = await admin
      .from("users")
      .select("id")
      .eq("pi_uid", payment.user_uid)
      .maybeSingle();

    if (!userRow?.id) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 });
    }

    // 지갑 조회
    const { data: wallet } = await admin
      .from("wallets")
      .select("id, pick_balance, total_earned")
      .eq("user_id", userRow.id)
      .single();

    if (!wallet) {
      return NextResponse.json({ error: "지갑을 찾을 수 없습니다" }, { status: 404 });
    }

    const pickAmount = Math.round(payment.amount * PI_TO_PICK);
    const newBalance = Number(wallet.pick_balance) + pickAmount;
    const newEarned  = Number(wallet.total_earned)  + pickAmount;

    await admin
      .from("wallets")
      .update({ pick_balance: newBalance, total_earned: newEarned, updated_at: new Date().toISOString() })
      .eq("id", wallet.id);

    await admin.from("wallet_transactions").insert({
      wallet_id:     wallet.id,
      type:          "charge",
      amount:        pickAmount,
      balance_after: newBalance,
      pi_payment_id: paymentId,
      description:   `Pi ${payment.amount}π → PICK ${pickAmount.toLocaleString()}P 충전`,
    });

    return NextResponse.json({ success: true, pickAmount });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

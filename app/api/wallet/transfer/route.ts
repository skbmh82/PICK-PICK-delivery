import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminSupabaseClient } from "@/lib/supabase/admin";

const TransferSchema = z.object({
  toEmail: z.string().email("올바른 이메일을 입력해주세요"),
  amount:  z.number().int().min(1, "1 PICK 이상 입력해주세요").max(1000000),
  memo:    z.string().max(100).optional(),
});

// POST /api/wallet/transfer — 다른 사용자에게 PICK 전송
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = getAdminSupabaseClient() as any;

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "인증이 필요합니다" }, { status: 401 });
  }

  const body   = await request.json().catch(() => null);
  const parsed = TransferSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다" },
      { status: 400 },
    );
  }

  const { toEmail, amount, memo } = parsed.data;

  // 송신자 프로필
  const { data: sender } = await admin
    .from("users")
    .select("id, name, email")
    .eq("auth_id", user.id)
    .single();
  if (!sender) return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 });

  // 자기 자신에게 전송 방지
  if (sender.email === toEmail) {
    return NextResponse.json({ error: "자신에게는 전송할 수 없습니다" }, { status: 400 });
  }

  // 수신자 조회
  const { data: receiver } = await admin
    .from("users")
    .select("id, name, email")
    .eq("email", toEmail)
    .single();
  if (!receiver) {
    return NextResponse.json({ error: "해당 이메일의 사용자를 찾을 수 없습니다" }, { status: 404 });
  }

  // 송신자 지갑
  const { data: senderWallet } = await admin
    .from("wallets")
    .select("id, pick_balance")
    .eq("user_id", sender.id)
    .single();
  if (!senderWallet) return NextResponse.json({ error: "지갑을 찾을 수 없습니다" }, { status: 404 });

  // 잔액 확인
  const senderBalance = Number(senderWallet.pick_balance);
  if (senderBalance < amount) {
    return NextResponse.json({ error: "잔액이 부족합니다" }, { status: 400 });
  }

  // 수신자 지갑
  const { data: receiverWallet } = await admin
    .from("wallets")
    .select("id, pick_balance")
    .eq("user_id", receiver.id)
    .single();
  if (!receiverWallet) {
    return NextResponse.json({ error: "수신자의 지갑을 찾을 수 없습니다" }, { status: 404 });
  }

  const senderNewBalance   = senderBalance - amount;
  const receiverNewBalance = Number(receiverWallet.pick_balance) + amount;
  const description        = memo ? `${receiver.name}님에게 전송 (${memo})` : `${receiver.name}님에게 전송`;
  const receiveDescription = memo ? `${sender.name}님으로부터 수신 (${memo})` : `${sender.name}님으로부터 수신`;

  // 송신자 잔액 차감
  const { error: senderUpdateErr } = await admin
    .from("wallets")
    .update({ pick_balance: senderNewBalance, updated_at: new Date().toISOString() })
    .eq("id", senderWallet.id);
  if (senderUpdateErr) {
    return NextResponse.json({ error: "전송에 실패했습니다" }, { status: 500 });
  }

  // 수신자 잔액 추가
  const { error: receiverUpdateErr } = await admin
    .from("wallets")
    .update({ pick_balance: receiverNewBalance, updated_at: new Date().toISOString() })
    .eq("id", receiverWallet.id);
  if (receiverUpdateErr) {
    // 롤백: 송신자 잔액 복구
    await admin
      .from("wallets")
      .update({ pick_balance: senderBalance, updated_at: new Date().toISOString() })
      .eq("id", senderWallet.id);
    return NextResponse.json({ error: "전송에 실패했습니다" }, { status: 500 });
  }

  // 거래 내역 기록 (송신/수신 양쪽)
  await admin.from("wallet_transactions").insert([
    {
      wallet_id:     senderWallet.id,
      type:          "transfer",
      amount:        amount,
      balance_after: senderNewBalance,
      description,
    },
    {
      wallet_id:     receiverWallet.id,
      type:          "transfer",
      amount:        amount,
      balance_after: receiverNewBalance,
      description:   receiveDescription,
    },
  ]);

  return NextResponse.json({
    ok:            true,
    newBalance:    senderNewBalance,
    transferred:   amount,
    toName:        receiver.name,
  });
}

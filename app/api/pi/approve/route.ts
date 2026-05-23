import { NextRequest, NextResponse } from "next/server";

const PI_API_BASE = "https://api.minepi.com";

export async function POST(req: NextRequest) {
  const apiKey = process.env.PI_NETWORK_API_KEY ?? process.env.PI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "PI_NETWORK_API_KEY 환경변수가 설정되지 않았습니다" },
      { status: 500 }
    );
  }

  try {
    const { paymentId } = await req.json() as { paymentId: string };
    if (!paymentId) return NextResponse.json({ error: "paymentId 필요" }, { status: 400 });

    const res = await fetch(`${PI_API_BASE}/v2/payments/${paymentId}/approve`, {
      method: "POST",
      headers: { Authorization: `Key ${apiKey}` },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: `Pi approve 실패: ${text}` }, { status: res.status });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

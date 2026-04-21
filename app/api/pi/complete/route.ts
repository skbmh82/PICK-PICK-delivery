import { NextRequest, NextResponse } from "next/server";

const PI_API_KEY = process.env.PI_API_KEY ?? "";
const PI_API_BASE = "https://api.minepi.com";

export async function POST(req: NextRequest) {
  try {
    const { paymentId, txid } = await req.json() as { paymentId: string; txid: string };
    if (!paymentId || !txid) {
      return NextResponse.json({ error: "paymentId, txid 필요" }, { status: 400 });
    }

    const res = await fetch(`${PI_API_BASE}/v2/payments/${paymentId}/complete`, {
      method: "POST",
      headers: {
        Authorization: `Key ${PI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ txid }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: text }, { status: res.status });
    }

    const data = await res.json() as unknown;
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

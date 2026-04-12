"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { useOrderStore } from "@/stores/orderStore";
import { useCartStore } from "@/stores/cartStore";

export default function TossSuccessPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const setLastOrder = useOrderStore((s) => s.setLastOrder);
  const clearCart    = useCartStore((s) => s.clearCart);
  const cart         = useCartStore();
  const calledRef    = useRef(false);

  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [errMsg,  setErrMsg] = useState("");

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const paymentKey = searchParams.get("paymentKey") ?? "";
    const orderId    = searchParams.get("orderId")    ?? "";   // toss_order_id
    const amount     = Number(searchParams.get("amount") ?? "0");
    const appOrderId = searchParams.get("appOrderId") ?? "";

    if (!paymentKey || !orderId || !amount) {
      setErrMsg("결제 정보가 올바르지 않습니다");
      setStatus("error");
      return;
    }

    fetch("/api/payments/toss/confirm", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ paymentKey, orderId, amount }),
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "결제 승인 실패");

        // 주문 완료 상태 저장 (orders/complete 페이지용)
        const now = new Date();
        setLastOrder({
          orderId:         appOrderId || json.orderId,
          storeName:       cart.storeName  || "주문",
          storeEmoji:      cart.storeEmoji || "🍽️",
          items:           cart.items.map((i) => ({
            menuName: i.menuName, quantity: i.quantity, price: i.price,
          })),
          itemsAmount:     amount,
          deliveryFee:     cart.deliveryFee ?? 0,
          pickUsed:        0,
          pickReward:      0,
          totalPaid:       amount,
          deliveryAddress: "",
          estimatedMinutes: 30,
          placedAt: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
        });

        clearCart();
        setStatus("ok");
        setTimeout(() => router.replace("/orders/complete"), 1200);
      })
      .catch((e: Error) => {
        setErrMsg(e.message);
        setStatus("error");
      });
  }, [searchParams, router, setLastOrder, clearCart, cart]);

  return (
    <div className="min-h-screen bg-pick-bg flex flex-col items-center justify-center px-6 gap-5">
      {status === "loading" && (
        <>
          <div className="w-14 h-14 border-4 border-pick-border border-t-pick-purple rounded-full animate-spin" />
          <p className="font-bold text-pick-text">결제 확인 중...</p>
          <p className="text-xs text-pick-text-sub">잠시만 기다려주세요</p>
        </>
      )}
      {status === "ok" && (
        <>
          <CheckCircle2 size={64} className="text-green-500" />
          <p className="font-black text-pick-text text-xl">결제 완료! 🎉</p>
          <p className="text-sm text-pick-text-sub">주문 확인 페이지로 이동합니다</p>
        </>
      )}
      {status === "error" && (
        <>
          <XCircle size={64} className="text-red-400" />
          <p className="font-black text-pick-text text-lg">결제 승인 실패</p>
          <p className="text-sm text-red-500 text-center">{errMsg}</p>
          <button
            onClick={() => router.back()}
            className="mt-2 bg-pick-purple text-white font-black px-8 py-3 rounded-full active:scale-95 transition-all"
          >
            다시 시도
          </button>
        </>
      )}
    </div>
  );
}

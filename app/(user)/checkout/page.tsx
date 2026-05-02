"use client";

import { useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, AlertCircle } from "lucide-react";
import { useOrderStore } from "@/stores/orderStore";
import { useCartStore } from "@/stores/cartStore";

const PI_KRW_RATE = 50000; // 1π ≈ ₩50,000 (테스트넷 기준 placeholder)

function usePiCheckoutPayment(onSuccess: () => void) {
  const [status, setStatus] = useState<"idle" | "auth" | "paying" | "done" | "error">("idle");
  const [error,  setError]  = useState("");

  const hasPi =
    typeof window !== "undefined" &&
    !!window.Pi &&
    /PiBrowser/i.test(navigator.userAgent);

  const pay = useCallback(
    async (piAmount: number, memo: string, metadata: object) => {
      if (typeof window === "undefined" || !window.Pi) {
        setError("Pi Browser에서만 사용 가능합니다");
        return;
      }
      setStatus("auth");
      setError("");
      try {
        window.Pi.init({
          version: "2.0",
          sandbox: process.env.NEXT_PUBLIC_PI_SANDBOX !== "false",
        });

        await window.Pi.authenticate(["payments"], async (incompletePmt) => {
          if (
            incompletePmt.status.developer_approved &&
            !incompletePmt.status.developer_completed &&
            incompletePmt.transaction?.txid
          ) {
            await fetch("/api/pi/complete", {
              method:  "POST",
              headers: { "Content-Type": "application/json" },
              body:    JSON.stringify({
                paymentId: incompletePmt.identifier,
                txid:      incompletePmt.transaction.txid,
              }),
            });
          }
        });

        setStatus("paying");
        window.Pi.createPayment(
          { amount: piAmount, memo, metadata },
          {
            onReadyForServerApproval: async (paymentId) => {
              await fetch("/api/pi/approve", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ paymentId }),
              });
            },
            onReadyForServerCompletion: async (paymentId, txid) => {
              await fetch("/api/pi/complete", {
                method:  "POST",
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({ paymentId, txid }),
              });
              setStatus("done");
              onSuccess();
            },
            onCancel: () => setStatus("idle"),
            onError:  (err) => { setStatus("error"); setError(err.message); },
          }
        );
      } catch (e) {
        setStatus("error");
        setError(e instanceof Error ? e.message : "Pi 인증 실패");
      }
    },
    [onSuccess]
  );

  return { hasPi, status, error, pay };
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const setLastOrder = useOrderStore((s) => s.setLastOrder);
  const clearCart    = useCartStore((s) => s.clearCart);
  const cart         = useCartStore();

  const orderId   = searchParams.get("orderId")   ?? "";
  const amount    = Number(searchParams.get("amount") ?? "0");
  const orderName = searchParams.get("orderName") ?? "PICK PICK 주문";

  const piAmount = Math.max(0.001, Math.round((amount / PI_KRW_RATE) * 1000) / 1000);

  const handleSuccess = useCallback(() => {
    const now = new Date();
    setLastOrder({
      orderId,
      storeName:        cart.storeName  || "주문",
      storeEmoji:       cart.storeEmoji || "🍽️",
      items:            cart.items.map((i) => ({
        menuName: i.menuName,
        quantity: i.quantity,
        price:    i.price,
      })),
      itemsAmount:      amount,
      deliveryFee:      cart.deliveryFee ?? 0,
      pickUsed:         0,
      pickReward:       0,
      totalPaid:        amount,
      deliveryAddress:  "",
      estimatedMinutes: 30,
      placedAt: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
    });
    clearCart();
    router.replace("/orders/complete");
  }, [orderId, amount, cart, setLastOrder, clearCart, router]);

  const { hasPi, status, error, pay } = usePiCheckoutPayment(handleSuccess);

  const isPaying = status === "auth" || status === "paying";

  const handlePay = () => {
    if (!orderId || amount <= 0) return;
    void pay(piAmount, orderName, { orderId, krwAmount: amount });
  };

  return (
    <div className="min-h-screen bg-pick-bg flex flex-col">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white border-b border-pick-border px-4 py-3.5 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-pick-bg border-2 border-pick-border active:scale-95 transition-transform"
        >
          <ArrowLeft size={18} className="text-pick-purple" />
        </button>
        <h1 className="font-black text-pick-text text-base">Pi 코인 결제</h1>
        <div className="ml-auto flex items-center gap-1.5 text-xs text-green-600 font-bold">
          <ShieldCheck size={14} />
          안전결제
        </div>
      </header>

      <div className="flex-1 flex flex-col gap-4 px-4 pt-4 pb-8">
        {/* 주문 금액 요약 */}
        <div className="bg-white rounded-3xl border-2 border-pick-border px-5 py-5">
          <p className="text-xs text-pick-text-sub font-medium mb-1">{orderName}</p>
          <p className="font-black text-pick-text text-2xl">{amount.toLocaleString()}원</p>
          <div className="mt-3 pt-3 border-t border-pick-border flex items-center justify-between">
            <span className="text-sm text-pick-text-sub">Pi 결제 금액</span>
            <span className="font-black text-pick-purple text-xl">π {piAmount.toLocaleString()}</span>
          </div>
          <p className="text-[11px] text-pick-text-sub mt-1 text-right">
            1π ≈ ₩{PI_KRW_RATE.toLocaleString()} 기준 (테스트넷)
          </p>
        </div>

        {/* Pi Browser 안내 */}
        {!hasPi && (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl px-5 py-4 flex gap-3 items-start">
            <AlertCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-800 text-sm">Pi Browser 필요</p>
              <p className="text-xs text-amber-700 mt-1">
                Pi 코인 결제는 Pi Browser 앱에서만 사용 가능합니다.
              </p>
            </div>
          </div>
        )}

        {/* 에러 */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-3xl px-5 py-4">
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* 결제 안내 */}
        <div className="bg-white rounded-3xl border-2 border-pick-border px-5 py-4">
          <p className="font-bold text-pick-text text-sm mb-3">결제 안내</p>
          <ul className="space-y-2 text-xs text-pick-text-sub">
            <li className="flex gap-2">
              <span className="flex-shrink-0">•</span>
              <span>Pi Browser에서 Pi 지갑으로 결제가 진행됩니다</span>
            </li>
            <li className="flex gap-2">
              <span className="flex-shrink-0">•</span>
              <span>현재 테스트넷 환경으로 실제 Pi 코인이 차감되지 않습니다</span>
            </li>
            <li className="flex gap-2">
              <span className="flex-shrink-0">•</span>
              <span>결제 완료 후 가맹점이 주문을 확인하면 조리가 시작됩니다</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 하단 결제 버튼 */}
      <div className="px-4 py-5 bg-white border-t border-pick-border">
        <button
          onClick={handlePay}
          disabled={isPaying || !hasPi || !orderId}
          className="w-full bg-gradient-to-r from-pick-purple to-pick-purple-light text-white font-black py-4 rounded-full shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-60"
        >
          {isPaying ? (
            <>
              <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              {status === "auth" ? "Pi 인증 중..." : "결제 진행 중..."}
            </>
          ) : (
            <>
              <span className="text-lg leading-none">π</span>
              π {piAmount} 결제하기
            </>
          )}
        </button>
        <p className="text-center text-xs text-pick-text-sub mt-3">
          결제 완료 후 주문이 확정됩니다
        </p>
      </div>
    </div>
  );
}

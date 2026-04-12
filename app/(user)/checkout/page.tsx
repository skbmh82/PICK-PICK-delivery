"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { loadPaymentWidget, ANONYMOUS } from "@tosspayments/payment-widget-sdk";
import { ArrowLeft, ShieldCheck, CreditCard } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

type PaymentWidgetInstance = Awaited<ReturnType<typeof loadPaymentWidget>>;

export default function CheckoutPage() {
  const searchParams  = useSearchParams();
  const router        = useRouter();
  const user          = useAuthStore((s) => s.user);

  const orderId     = searchParams.get("orderId")     ?? "";
  const tossOrderId = searchParams.get("tossOrderId") ?? "";
  const amount      = Number(searchParams.get("amount") ?? "0");
  const orderName   = searchParams.get("orderName")   ?? "PICK PICK 주문";

  const widgetRef   = useRef<PaymentWidgetInstance | null>(null);
  const [loading,   setLoading]  = useState(true);
  const [paying,    setPaying]   = useState(false);
  const [error,     setError]    = useState("");

  const initWidget = useCallback(async () => {
    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
    if (!clientKey) {
      setError("결제 모듈 설정이 필요합니다");
      setLoading(false);
      return;
    }
    if (!orderId || !tossOrderId || amount <= 0) {
      setError("잘못된 접근입니다");
      setLoading(false);
      return;
    }

    try {
      const customerKey = user?.id ?? ANONYMOUS;
      const widget = await loadPaymentWidget(clientKey, customerKey);
      widgetRef.current = widget;

      widget.renderPaymentMethods("#payment-method", { value: amount }, { variantKey: "DEFAULT" });
      widget.renderAgreement("#agreement", { variantKey: "AGREEMENT" });
    } catch (e) {
      console.error("위젯 로드 오류:", e);
      setError("결제 위젯을 불러오지 못했습니다");
    } finally {
      setLoading(false);
    }
  }, [orderId, tossOrderId, amount, user]);

  useEffect(() => { initWidget(); }, [initWidget]);

  const handlePay = async () => {
    if (!widgetRef.current || paying) return;
    setPaying(true);
    setError("");

    try {
      await widgetRef.current.requestPayment({
        orderId:    tossOrderId,
        orderName,
        successUrl: `${window.location.origin}/payments/toss/success?appOrderId=${orderId}`,
        failUrl:    `${window.location.origin}/payments/toss/fail?appOrderId=${orderId}`,
        customerName: user?.email ?? "PICK PICK 고객",
      });
    } catch (e: unknown) {
      const err = e as { code?: string; message?: string };
      if (err?.code === "USER_CANCEL") {
        // 사용자가 직접 취소 — 조용히 처리
      } else {
        setError(err?.message ?? "결제 중 오류가 발생했습니다");
      }
      setPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-pick-bg flex flex-col">
      {/* 헤더 */}
      <header className="sticky top-0 z-10 bg-white dark:bg-pick-card border-b border-pick-border px-4 py-3.5 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-pick-bg border-2 border-pick-border active:scale-95 transition-transform"
        >
          <ArrowLeft size={18} className="text-pick-purple" />
        </button>
        <h1 className="font-black text-pick-text text-base">결제</h1>
        <div className="ml-auto flex items-center gap-1.5 text-xs text-green-600 font-bold">
          <ShieldCheck size={14} />
          안전결제
        </div>
      </header>

      {/* 결제 금액 요약 */}
      <div className="bg-white mx-4 mt-4 rounded-3xl border-2 border-pick-border px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-pick-text-sub font-medium">{orderName}</p>
          <p className="font-black text-pick-text text-xl mt-0.5">{amount.toLocaleString()}원</p>
        </div>
        <CreditCard size={28} className="text-pick-purple" />
      </div>

      {/* Toss 위젯 영역 */}
      <div className="flex-1 mt-4 bg-white mx-4 rounded-3xl border-2 border-pick-border overflow-hidden">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-3 border-pick-border border-t-pick-purple rounded-full animate-spin" />
            <p className="text-sm text-pick-text-sub">결제 모듈 로딩 중...</p>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 px-6">
            <p className="text-sm text-red-500 text-center">{error}</p>
            <button
              onClick={() => router.back()}
              className="text-sm font-bold text-pick-purple px-6 py-2.5 rounded-full bg-pick-bg border-2 border-pick-border"
            >
              돌아가기
            </button>
          </div>
        )}

        <div id="payment-method" className={loading || error ? "hidden" : ""} />
        <div id="agreement"      className={loading || error ? "hidden" : ""} />
      </div>

      {/* 결제 버튼 */}
      {!loading && !error && (
        <div className="px-4 py-5">
          <button
            onClick={() => void handlePay()}
            disabled={paying}
            className="w-full bg-gradient-to-r from-pick-purple to-pick-purple-light text-white font-black py-4 rounded-full shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-60"
          >
            {paying ? (
              <><span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />결제 진행 중...</>
            ) : (
              <><CreditCard size={18} />{amount.toLocaleString()}원 결제하기</>
            )}
          </button>
          <p className="text-center text-xs text-pick-text-sub mt-3">
            결제 완료 후 주문이 확정됩니다
          </p>
        </div>
      )}
    </div>
  );
}

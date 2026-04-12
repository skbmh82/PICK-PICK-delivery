"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { XCircle, RefreshCw, Home } from "lucide-react";

const ERROR_MESSAGES: Record<string, string> = {
  PAY_PROCESS_CANCELED:    "결제를 취소했어요",
  PAY_PROCESS_ABORTED:     "결제가 중단되었어요",
  REJECT_CARD_COMPANY:     "카드사에서 결제를 거절했어요",
  EXCEED_MAX_DAILY_PAYMENT_COUNT: "하루 결제 한도를 초과했어요",
  NOT_ENOUGH_STORAGE_BALANCE: "잔액이 부족해요",
};

export default function TossFailPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const code    = searchParams.get("code")    ?? "";
  const message = searchParams.get("message") ?? "결제에 실패했습니다";

  const friendlyMsg = ERROR_MESSAGES[code] ?? message;

  return (
    <div className="min-h-screen bg-pick-bg flex flex-col items-center justify-center px-6 gap-5">
      <XCircle size={64} className="text-red-400" />
      <div className="text-center">
        <p className="font-black text-pick-text text-xl mb-2">결제 실패</p>
        <p className="text-sm text-pick-text-sub">{friendlyMsg}</p>
        {code && <p className="text-xs text-gray-400 mt-1">({code})</p>}
      </div>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={() => router.back()}
          className="w-full flex items-center justify-center gap-2 bg-pick-purple text-white font-black py-4 rounded-full active:scale-95 transition-all"
        >
          <RefreshCw size={17} /> 다시 시도
        </button>
        <button
          onClick={() => router.replace("/home")}
          className="w-full flex items-center justify-center gap-2 bg-white text-pick-text font-bold py-4 rounded-full border-2 border-pick-border active:scale-95 transition-all"
        >
          <Home size={17} /> 홈으로
        </button>
      </div>
    </div>
  );
}

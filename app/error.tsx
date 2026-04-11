"use client";

import { useEffect } from "react";
import { RefreshCw, Home } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="min-h-dvh bg-pick-bg flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[390px] flex flex-col items-center text-center">
        {/* 일러스트 */}
        <div className="relative mb-8">
          <div className="w-36 h-36 rounded-full bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center">
            <span className="text-7xl select-none">😵</span>
          </div>
          <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-pick-yellow/20 flex items-center justify-center">
            <span className="text-2xl">⚡</span>
          </div>
        </div>

        {/* 텍스트 */}
        <p className="font-bold text-pick-text text-xl mb-2">앗, 오류가 발생했어요!</p>
        <p className="text-pick-text-sub text-sm leading-relaxed mb-2">
          일시적인 문제가 생겼어요.<br />
          잠시 후 다시 시도해 주세요.
        </p>

        {error.digest && (
          <p className="text-xs text-pick-text-sub/60 mb-6 font-mono bg-white rounded-2xl px-3 py-1.5 border border-pick-border">
            오류 코드: {error.digest}
          </p>
        )}

        {!error.digest && <div className="mb-6" />}

        {/* 버튼 */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pick-purple to-pick-purple-light text-white font-black py-4 rounded-full text-base active:scale-95 transition-all shadow-lg shadow-pick-purple/25"
          >
            <RefreshCw size={18} />
            다시 시도하기
          </button>
          <a
            href="/home"
            className="w-full flex items-center justify-center gap-2 bg-white border-2 border-pick-border text-pick-text font-bold py-4 rounded-full text-base active:scale-95 transition-all"
          >
            <Home size={18} />
            홈으로 가기
          </a>
        </div>

        {/* 로고 */}
        <p className="mt-10 font-black text-pick-purple/40 text-lg" style={{ fontFamily: "'Jua', 'Noto Sans KR', sans-serif" }}>
          PICK PICK
        </p>
      </div>
    </div>
  );
}

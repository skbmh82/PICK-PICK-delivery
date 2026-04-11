"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-pick-bg flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-[390px] flex flex-col items-center text-center">
        {/* 일러스트 */}
        <div className="relative mb-8">
          <div className="w-36 h-36 rounded-full bg-gradient-to-br from-pick-purple/10 to-pick-purple-light/20 flex items-center justify-center">
            <span className="text-7xl select-none">🍱</span>
          </div>
          <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-pick-yellow/20 flex items-center justify-center">
            <span className="text-2xl">❓</span>
          </div>
        </div>

        {/* 텍스트 */}
        <h1 className="font-black text-pick-text text-5xl mb-2" style={{ fontFamily: "'Jua', 'Noto Sans KR', sans-serif" }}>
          404
        </h1>
        <p className="font-bold text-pick-text text-xl mb-2">페이지를 찾을 수 없어요</p>
        <p className="text-pick-text-sub text-sm leading-relaxed mb-8">
          주소를 잘못 입력했거나<br />
          삭제된 페이지일 수 있어요.
        </p>

        {/* 버튼 */}
        <div className="w-full flex flex-col gap-3">
          <Link
            href="/home"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pick-purple to-pick-purple-light text-white font-black py-4 rounded-full text-base active:scale-95 transition-all shadow-lg shadow-pick-purple/25"
          >
            <Home size={18} />
            홈으로 가기
          </Link>
          <button
            onClick={() => history.back()}
            className="w-full flex items-center justify-center gap-2 bg-white border-2 border-pick-border text-pick-text font-bold py-4 rounded-full text-base active:scale-95 transition-all"
          >
            <ArrowLeft size={18} />
            이전 페이지로
          </button>
        </div>

        {/* 로고 */}
        <p className="mt-10 font-black text-pick-purple/40 text-lg" style={{ fontFamily: "'Jua', 'Noto Sans KR', sans-serif" }}>
          PICK PICK
        </p>
      </div>
    </div>
  );
}

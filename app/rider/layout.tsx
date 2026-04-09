"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Navigation, Bike, Wallet, ChevronLeft } from "lucide-react";
import { useState } from "react";

const RIDER_NAV = [
  { href: "/rider/dashboard", label: "배달현황", Icon: Navigation },
  { href: "/rider/delivery",  label: "배달하기", Icon: Bike },
  { href: "/rider/earnings",  label: "수익내역", Icon: Wallet },
] as const;

export default function RiderLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOnline, setIsOnline] = useState(true);

  return (
    <div id="app-shell">
      {/* 라이더 전용 헤더 */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-sky-600 to-blue-500">
        <div className="flex items-center gap-3">
          <Link
            href="/my-pick"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ChevronLeft size={18} className="text-white" />
          </Link>
          <div>
            <p className="text-white font-black text-base leading-tight">🛵 라이더 모드</p>
            <p className="text-white/75 text-xs">임권 라이더님</p>
          </div>
        </div>

        {/* 온/오프라인 토글 */}
        <button
          onClick={() => setIsOnline((v) => !v)}
          className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 transition-all ${
            isOnline
              ? "bg-white/20 border border-white/30"
              : "bg-white/10 border border-white/10"
          }`}
        >
          <span className={`w-2 h-2 rounded-full transition-all ${
            isOnline ? "bg-green-300 animate-pulse" : "bg-white/40"
          }`} />
          <span className="text-white text-xs font-bold">
            {isOnline ? "온라인" : "오프라인"}
          </span>
        </button>
      </header>

      {/* 콘텐츠 */}
      <main className="pb-20">{children}</main>

      {/* 라이더 전용 하단 탭 */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(14,165,233,0.15)] border-t border-sky-100">
        <ul className="flex items-center px-2 py-1">
          {RIDER_NAV.map(({ href, label, Icon }) => {
            const isActive = pathname === href;
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  className="flex flex-col items-center justify-center gap-1 py-2 transition-colors"
                >
                  <span className={`flex items-center justify-center w-12 h-9 rounded-full transition-all duration-200 ${
                    isActive ? "bg-sky-100" : "bg-transparent"
                  }`}>
                    <Icon
                      size={22}
                      strokeWidth={isActive ? 2.5 : 1.8}
                      className={isActive ? "text-sky-600" : "text-pick-text-sub"}
                    />
                  </span>
                  <span className={`text-[10px] leading-none font-medium ${
                    isActive ? "text-sky-600 font-bold" : "text-pick-text-sub"
                  }`}>
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

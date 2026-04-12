"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  TrendingUp,
  Megaphone,
  ChevronLeft,
} from "lucide-react";

const OWNER_NAV = [
  { href: "/owner/dashboard",   label: "대시보드", Icon: LayoutDashboard },
  { href: "/owner/orders",      label: "주문관리", Icon: ClipboardList },
  { href: "/owner/menu",        label: "메뉴관리", Icon: UtensilsCrossed },
  { href: "/owner/ads",         label: "광고",     Icon: Megaphone },
  { href: "/owner/settlement",  label: "정산/매출", Icon: TrendingUp },
] as const;

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div id="app-shell">
      {/* 사장님 전용 헤더 */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-amber-600 to-orange-500">
        <div className="flex items-center gap-3">
          <Link
            href="/my-pick"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ChevronLeft size={18} className="text-white" />
          </Link>
          <div>
            <p className="text-white font-black text-base leading-tight">🏪 사장님 모드</p>
            <p className="text-white/75 text-xs">바삭대장 치킨</p>
          </div>
        </div>

        {/* 영업 상태 토글 */}
        <div className="flex items-center gap-2 bg-white/20 rounded-full px-3.5 py-1.5">
          <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
          <span className="text-white text-xs font-bold">영업 중</span>
        </div>
      </header>

      {/* 콘텐츠 */}
      <main className="pb-20">{children}</main>

      {/* 사장님 전용 하단 탭 */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(217,119,6,0.15)] border-t border-amber-100">
        <ul className="flex items-center px-2 py-1">
          {OWNER_NAV.map(({ href, label, Icon }) => {
            const isActive = pathname === href;
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  className="flex flex-col items-center justify-center gap-1 py-2 transition-colors"
                >
                  <span
                    className={`flex items-center justify-center w-12 h-9 rounded-full transition-all duration-200 ${
                      isActive ? "bg-amber-100" : "bg-transparent"
                    }`}
                  >
                    <Icon
                      size={22}
                      strokeWidth={isActive ? 2.5 : 1.8}
                      className={isActive ? "text-amber-600" : "text-pick-text-sub"}
                    />
                  </span>
                  <span
                    className={`text-[10px] leading-none font-medium ${
                      isActive ? "text-amber-600 font-bold" : "text-pick-text-sub"
                    }`}
                  >
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

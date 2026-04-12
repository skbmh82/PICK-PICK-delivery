"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  Megaphone,
  Star,
  ChevronLeft,
} from "lucide-react";

const OWNER_NAV = [
  { href: "/owner/dashboard",  label: "대시보드", Icon: LayoutDashboard },
  { href: "/owner/orders",     label: "주문관리", Icon: ClipboardList },
  { href: "/owner/menu",       label: "메뉴관리", Icon: UtensilsCrossed },
  { href: "/owner/reviews",    label: "리뷰",     Icon: Star },
  { href: "/owner/ads",        label: "광고",     Icon: Megaphone },
] as const;

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [storeName, setStoreName] = useState<string | null>(null);
  const [isOpen,    setIsOpen]    = useState<boolean | null>(null);
  const [toggling,  setToggling]  = useState(false);

  useEffect(() => {
    fetch("/api/stores/my")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d?.store) {
          setStoreName(d.store.name);
          setIsOpen(d.store.is_open ?? true);
        }
      })
      .catch(() => {});
  }, []);

  const handleToggle = async () => {
    if (toggling || isOpen === null) return;
    const next = !isOpen;
    setToggling(true);
    setIsOpen(next);
    try {
      await fetch("/api/stores/my/hours", {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          hours: Array.from({ length: 7 }, (_, i) => ({
            day_of_week: i,
            open_time:   "00:00",
            close_time:  "23:59",
            is_closed:   false,
          })),
          is_open_override: next,
        }),
      });
    } finally {
      setToggling(false);
    }
  };

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
            <p className="text-white/75 text-xs">
              {storeName ?? "내 가게"}
            </p>
          </div>
        </div>

        {/* 영업 상태 토글 */}
        <button
          onClick={() => void handleToggle()}
          disabled={toggling || isOpen === null}
          className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 transition-all active:scale-95 disabled:opacity-60 ${
            isOpen ? "bg-white/20" : "bg-black/20"
          }`}
        >
          <span className={`w-2 h-2 rounded-full transition-colors ${
            isOpen ? "bg-green-300 animate-pulse" : "bg-gray-400"
          }`} />
          <span className="text-white text-xs font-bold">
            {isOpen === null ? "로딩 중" : isOpen ? "영업 중" : "영업 종료"}
          </span>
        </button>
      </header>

      {/* 콘텐츠 */}
      <main className="pb-20">{children}</main>

      {/* 사장님 전용 하단 탭 */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bg-white dark:bg-pick-card rounded-t-3xl shadow-[0_-4px_20px_rgba(217,119,6,0.15)] border-t border-amber-100 dark:border-pick-border">
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

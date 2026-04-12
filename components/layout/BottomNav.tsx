"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Wallet, ClipboardList, User } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

const NAV_ITEMS = [
  { href: "/home",    label: "홈",       Icon: Home,         badge: false },
  { href: "/wallet",  label: "지갑",     Icon: Wallet,       badge: false },
  { href: "/orders",  label: "PICK주문", Icon: ClipboardList, badge: true  },
  { href: "/my-pick", label: "MyPICK",   Icon: User,         badge: false },
] as const;

export default function BottomNav() {
  const pathname = usePathname();
  const user     = useAuthStore((s) => s.user);
  const [activeOrderCount, setActiveOrderCount] = useState(0);

  // 진행 중인 주문 수 주기적으로 갱신 (30초마다)
  useEffect(() => {
    if (!user) { setActiveOrderCount(0); return; }

    const fetchActive = async () => {
      try {
        const res = await fetch("/api/orders/my?status=active&limit=1", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json() as { activeCount?: number };
        setActiveOrderCount(data.activeCount ?? 0);
      } catch {
        // 무시
      }
    };

    void fetchActive();
    const id = setInterval(() => void fetchActive(), 30_000);
    return () => clearInterval(id);
  }, [user]);

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bg-white dark:bg-pick-card rounded-t-3xl shadow-[0_-4px_20px_rgba(107,33,168,0.10)] border-t border-pick-border">
      <ul className="flex items-center px-2 py-1">
        {NAV_ITEMS.map(({ href, label, Icon, badge }) => {
          const badgeNum = badge ? activeOrderCount : 0;
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className="flex flex-col items-center justify-center gap-1 py-2 transition-colors"
              >
                {/* 아이콘 + 배지 */}
                <span className="relative">
                  <span
                    className={`flex items-center justify-center w-12 h-9 rounded-full transition-all duration-200 ${
                      isActive ? "bg-pick-purple/10" : "bg-transparent"
                    }`}
                  >
                    <Icon
                      size={22}
                      strokeWidth={isActive ? 2.5 : 1.8}
                      className={isActive ? "text-pick-purple" : "text-pick-text-sub"}
                    />
                  </span>
                  {badge && badgeNum > 0 && (
                    <span className="absolute -top-0.5 right-1 min-w-[16px] h-4 flex items-center justify-center bg-red-500 text-white text-[9px] font-black rounded-full px-1 leading-none">
                      {badgeNum > 9 ? "9+" : badgeNum}
                    </span>
                  )}
                </span>
                <span
                  className={`text-[10px] leading-none font-medium ${
                    isActive ? "text-pick-purple font-bold" : "text-pick-text-sub"
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
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Wallet, ClipboardList, User } from "lucide-react";

const NAV_ITEMS = [
  { href: "/home",    label: "홈",       Icon: Home },
  { href: "/wallet",  label: "지갑",     Icon: Wallet },
  { href: "/orders",  label: "PICK주문", Icon: ClipboardList },
  { href: "/my-pick", label: "MyPICK",   Icon: User },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(107,33,168,0.10)] border-t border-pick-border">
      <ul className="flex items-center px-2 py-1">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className="flex flex-col items-center justify-center gap-1 py-2 transition-colors"
              >
                {/* 활성 탭 pill 배경 */}
                <span
                  className={`flex items-center justify-center w-12 h-9 rounded-full transition-all duration-200 ${
                    isActive
                      ? "bg-pick-purple/10"
                      : "bg-transparent"
                  }`}
                >
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    className={isActive ? "text-pick-purple" : "text-pick-text-sub"}
                  />
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

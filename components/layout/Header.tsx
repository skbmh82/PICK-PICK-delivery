"use client";

import Link from "next/link";
import { Bell } from "lucide-react";

interface HeaderProps {
  pickBalance?: number;
}

export default function Header({ pickBalance = 0 }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-5 py-3.5 bg-pick-purple-dark">
      {/* 로고 */}
      <Link href="/home" className="flex items-center gap-0.5">
        <span
          className="text-3xl text-pick-yellow-light drop-shadow-sm"
          style={{ fontFamily: 'var(--font-logo)' }}
        >
          PICK
        </span>
        <span
          className="text-3xl text-white drop-shadow-sm"
          style={{ fontFamily: 'var(--font-logo)' }}
        >
          PICK
        </span>
        <span className="ml-1.5 text-2xl">🛵</span>
      </Link>

      {/* 우측: PICK 잔액 + 알림 */}
      <div className="flex items-center gap-2.5">
        <Link
          href="/wallet"
          className="flex items-center gap-1.5 bg-white/15 border border-white/20 px-3.5 py-2 rounded-full"
        >
          <span className="text-pick-yellow-light text-sm font-black">P</span>
          <span className="text-white text-sm font-bold">
            {pickBalance.toLocaleString()}
          </span>
        </Link>

        <button
          aria-label="알림"
          className="relative w-9 h-9 flex items-center justify-center rounded-full bg-white/15 border border-white/20 hover:bg-white/25 transition-colors"
        >
          <Bell size={18} className="text-white" />
          {/* 알림 뱃지 */}
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-pick-yellow-light rounded-full border-2 border-pick-purple-dark" />
        </button>
      </div>
    </header>
  );
}

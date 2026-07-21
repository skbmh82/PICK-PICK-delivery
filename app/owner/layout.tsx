"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import FcmProvider from "@/components/pwa/FcmProvider";
import { registerFcmToken } from "@/hooks/useFcmToken";
import { useOrderSound, isOrderSoundArmed } from "@/lib/useOrderSound";
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
  const [storeName,    setStoreName]    = useState<string | null>(null);
  const [isOpen,       setIsOpen]       = useState<boolean | null>(null);
  const [toggling,     setToggling]     = useState(false);
  const [armed,        setArmed]        = useState(false);   // 이번 세션 알림 활성화(오디오 arm) 여부
  const [notifState,   setNotifState]   = useState<"loading" | "default" | "granted" | "denied">("loading");
  const { unlock: unlockSound, stop: stopOrderSound } = useOrderSound();

  // 알림 권한 상태 읽기 — 자동 요청 안 함 (Chrome은 user gesture 없이 팝업 안 뜸)
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    setNotifState(Notification.permission as "default" | "granted" | "denied");
  }, []);

  // 버튼 클릭 시 권한 요청 (user gesture → 팝업 뜸)
  const handleRequestNotif = useCallback(async () => {
    const p = await Notification.requestPermission();
    setNotifState(p as "default" | "granted" | "denied");
    if (p === "granted") await registerFcmToken();
  }, []);

  // 앱 내 재진입(MyPICK 등) 시 실제 오디오 상태로 복원 → '알림 켜기' 오표시 방지
  useEffect(() => {
    if (isOrderSoundArmed()) setArmed(true);
  }, []);

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
    // ⚠️ 영업 시작(오픈) = 알림 arm — 사용자 제스처 안에서 동기 호출 (브라우저 정책)
    if (next) { unlockSound(); setArmed(true); }
    else      stopOrderSound();
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
            className="flex items-center gap-0.5 pl-1.5 pr-3 py-1.5 rounded-full bg-white/25 hover:bg-white/40 active:scale-95 transition-all"
            title="MyPICK으로 돌아가기"
          >
            <ChevronLeft size={16} className="text-white" />
            <span className="text-white text-xs font-black">MyPICK</span>
          </Link>
          <div>
            <p className="text-white font-black text-base leading-tight">🏪 사장님 모드</p>
            <p className="text-white/75 text-xs">
              {storeName ?? "내 가게"}
            </p>
          </div>
        </div>

        {/* 영업 시작/종료 토글 (누르면 영업 + 알림) */}
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
            {isOpen === null ? "로딩 중" : isOpen ? "영업 중" : "영업 시작"}
          </span>
        </button>
      </header>

      {/* 영업 중인데 이번 세션 알림이 꺼진 경우 → 헤더 아래 얇은 띠로 안내 */}
      {isOpen === true && !armed && (
        <button
          onClick={() => { unlockSound(); setArmed(true); }}
          className="w-full flex items-center justify-center gap-1.5 py-2 bg-amber-100 text-amber-800 text-xs font-bold active:bg-amber-200 transition-colors"
        >
          🔔 새 주문 알림이 꺼져 있어요 · <span className="underline underline-offset-2">탭해서 켜기</span>
        </button>
      )}

      {/* 알림 권한 배너 */}
      {notifState === "default" && (
        <div className="mx-4 mt-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-xs text-amber-800 font-bold">🔔 새 주문 알림을 받으려면 알림을 허용해주세요</p>
          <button
            onClick={() => void handleRequestNotif()}
            className="shrink-0 text-xs font-black text-white bg-amber-500 px-3 py-1.5 rounded-full active:scale-95"
          >
            허용하기
          </button>
        </div>
      )}
      {notifState === "denied" && (
        <div className="mx-4 mt-2 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
          <p className="text-xs text-red-700 font-bold">🔕 알림 차단됨 — 브라우저 주소창 자물쇠 아이콘 → 알림 허용으로 변경해주세요</p>
        </div>
      )}

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
      <InstallPrompt />
      <FcmProvider />
    </div>
  );
}

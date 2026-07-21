"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Navigation, Bike, Wallet, ChevronLeft, User } from "lucide-react";
import InstallPrompt from "@/components/pwa/InstallPrompt";
import FcmProvider from "@/components/pwa/FcmProvider";
import { registerFcmToken } from "@/hooks/useFcmToken";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useOrderSound, isOrderSoundArmed } from "@/lib/useOrderSound";

const RIDER_NAV = [
  { href: "/rider/dashboard", label: "배달현황", Icon: Navigation },
  { href: "/rider/delivery",  label: "배달하기", Icon: Bike },
  { href: "/rider/earnings",  label: "수익내역", Icon: Wallet },
  { href: "/rider/profile",   label: "내 정보",   Icon: User },
] as const;

export default function RiderLayout({ children }: { children: React.ReactNode }) {
  const pathname   = usePathname();
  const user       = useAuthStore((s) => s.user);
  const [isOnline,   setIsOnline]   = useState(false);
  const [toggling,   setToggling]   = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [armed,      setArmed]      = useState(false);   // 이번 세션 알림 활성화 여부
  const [notifState, setNotifState] = useState<"loading" | "default" | "granted" | "denied">("loading");
  const { unlock: unlockSound, stop: stopOrderSound } = useOrderSound();

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    setNotifState(Notification.permission as "default" | "granted" | "denied");
  }, []);

  // 앱 내 재진입(MyPICK 등) 시 실제 오디오 상태로 복원 → '알림 켜기' 오표시 방지
  useEffect(() => {
    if (isOrderSoundArmed()) setArmed(true);
  }, []);

  const handleRequestNotif = useCallback(async () => {
    const p = await Notification.requestPermission();
    setNotifState(p as "default" | "granted" | "denied");
    if (p === "granted") await registerFcmToken();
  }, []);
  const lastLatRef = useRef(0);
  const lastLngRef = useRef(0);

  // 최초 진입 시 현재 온라인 상태 + 이름 조회
  useEffect(() => {
    fetch("/api/rider/status")
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.isActive  === "boolean") setIsOnline(d.isActive);
        if (typeof d.isApproved === "boolean") setIsApproved(d.isApproved);
      })
      .catch(() => {/* 비로그인 등 무시 */});
  }, [user]);

  // GPS 위치 가져오기 (실패 시 마지막 저장 좌표 사용)
  const getLocation = (): Promise<{ lat: number; lng: number }> =>
    new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ lat: lastLatRef.current, lng: lastLngRef.current });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          lastLatRef.current = pos.coords.latitude;
          lastLngRef.current = pos.coords.longitude;
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => resolve({ lat: lastLatRef.current, lng: lastLngRef.current }),
        { timeout: 5000, maximumAge: 60000 },
      );
    });

  const sendLocationPatch = async (isActive: boolean) => {
    const { lat, lng } = await getLocation();
    await fetch("/api/rider/location", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ lat, lng, isActive }),
    }).catch(() => {});
  };

  // 온라인 상태일 때 8분마다 heartbeat — Cron 자동 오프라인(10분 기준) 방지
  useEffect(() => {
    if (!isOnline) return;
    const id = setInterval(() => void sendLocationPatch(true), 8 * 60 * 1000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  const handleToggle = async () => {
    if (toggling) return;
    const next = !isOnline;
    // ⚠️ 운행 시작(온라인) = 알림 arm — 사용자 제스처 안에서 알림 arm(확인음)
    if (next) { unlockSound(); setArmed(true); }
    else      stopOrderSound();
    setToggling(true);
    try {
      await sendLocationPatch(next);
      setIsOnline(next);
    } finally {
      setToggling(false);
    }
  };

  return (
    <div id="app-shell">
      {/* 라이더 전용 헤더 */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-sky-600 to-blue-500">
        <Link
          href="/my-pick"
          className="flex items-center gap-0.5 pl-1 pr-2 py-1 rounded-full bg-white/25 hover:bg-white/40 active:scale-95 transition-all z-10"
          title="MyPICK으로 돌아가기"
        >
          <ChevronLeft size={13} className="text-white" />
          <span className="text-white text-[10px] font-black">MyPICK</span>
        </Link>

        {/* 중앙 타이틀 */}
        <p className="absolute left-1/2 -translate-x-1/2 text-white font-black text-xl tracking-tight whitespace-nowrap">
          🛵 라이더 모드
        </p>

        {/* 운행 시작/종료 토글 (누르면 운행 + 알림) */}
        <button
          onClick={() => void handleToggle()}
          disabled={toggling || !isApproved}
          title={!isApproved ? "서류 심사 승인 후 배달 가능합니다" : undefined}
          className={`z-10 flex items-center gap-1.5 rounded-full px-2.5 py-1 transition-all disabled:opacity-50 ${
            isOnline
              ? "bg-white/20 border border-white/30"
              : "bg-white/10 border border-white/10"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full transition-all ${
            isOnline ? "bg-green-300 animate-pulse" : "bg-white/40"
          }`} />
          <span className="text-white text-[10px] font-bold">
            {toggling ? "변경 중..." : isOnline ? "운행 중" : "운행 시작"}
          </span>
        </button>
      </header>

      {/* 운행 중인데 이번 세션 알림이 꺼진 경우 → 헤더 아래 얇은 띠로 안내 */}
      {isOnline && !armed && (
        <button
          onClick={() => { unlockSound(); setArmed(true); }}
          className="w-full flex items-center justify-center gap-1.5 py-2 bg-sky-100 text-sky-800 text-xs font-bold active:bg-sky-200 transition-colors"
        >
          🔔 배달 요청 알림이 꺼져 있어요 · <span className="underline underline-offset-2">탭해서 켜기</span>
        </button>
      )}

      {/* 미승인 배너 */}
      {!isApproved && (
        <div className="mx-4 mt-2 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-xl flex-shrink-0">⏳</span>
          <div>
            <p className="text-xs font-black text-amber-800">서류 심사 대기 중입니다</p>
            <p className="text-[11px] text-amber-700 mt-0.5">승인 완료 후 배달을 시작할 수 있어요.</p>
          </div>
        </div>
      )}

      {/* 알림 권한 배너 */}
      {notifState === "default" && (
        <div className="mx-4 mt-2 bg-sky-50 border border-sky-200 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-xs text-sky-800 font-bold">🔔 배달 요청 알림을 받으려면 알림을 허용해주세요</p>
          <button
            onClick={() => void handleRequestNotif()}
            className="shrink-0 text-xs font-black text-white bg-sky-500 px-3 py-1.5 rounded-full active:scale-95"
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

      {/* 라이더 전용 하단 탭 */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bg-white dark:bg-pick-card rounded-t-3xl shadow-[0_-4px_20px_rgba(14,165,233,0.15)] border-t border-sky-100 dark:border-pick-border">
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
      <InstallPrompt />
      <FcmProvider />
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { X, Download, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * PWA 설치 배너
 * - Android Chrome: beforeinstallprompt 이벤트 활용
 * - iOS Safari: 수동 안내 표시
 * - 이미 설치됐거나 거부한 경우 표시 안 함
 */
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner,     setShowBanner]     = useState(false);
  const [isIOS,          setIsIOS]          = useState(false);
  const [isInstalled,    setIsInstalled]    = useState(false);

  useEffect(() => {
    // 이미 설치된 경우 (standalone 모드)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // localStorage에 거부 기록 확인
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) {
      const dismissedAt = new Date(dismissed);
      const daysSince   = (Date.now() - dismissedAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 14) return; // 14일 내 거부 시 재표시 안 함
    }

    // iOS 감지
    const ua = navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua) && !(window as Window & { MSStream?: unknown }).MSStream;
    if (ios) {
      setIsIOS(true);
      // iOS에서는 5초 후 표시
      const timer = setTimeout(() => setShowBanner(true), 5000);
      return () => clearTimeout(timer);
    }

    // Android / Chrome: beforeinstallprompt 이벤트 대기
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-install-dismissed", new Date().toISOString());
  };

  if (!showBanner || isInstalled) return null;

  return (
    <div className="fixed bottom-[72px] left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[390px] z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white dark:bg-pick-card rounded-3xl border-2 border-pick-border shadow-2xl px-4 py-4">
        <div className="flex items-start gap-3">
          {/* 앱 아이콘 */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pick-purple to-pick-purple-light flex items-center justify-center flex-shrink-0 shadow-md">
            <span className="text-xl">🍱</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-black text-pick-text text-sm leading-tight">PICK PICK 앱 설치</p>
            <p className="text-xs text-pick-text-sub mt-0.5 leading-relaxed">
              {isIOS
                ? "Safari 공유 버튼 → \"홈 화면에 추가\"를 탭하세요"
                : "홈 화면에 추가하면 더 빠르게 이용할 수 있어요!"}
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-pick-bg flex-shrink-0"
          >
            <X size={13} className="text-pick-text-sub" />
          </button>
        </div>

        {!isIOS && deferredPrompt && (
          <button
            onClick={() => void handleInstall()}
            className="mt-3 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pick-purple to-pick-purple-light text-white font-black py-3 rounded-full text-sm active:scale-95 transition-all"
          >
            <Download size={15} />
            홈 화면에 추가
          </button>
        )}

        {isIOS && (
          <div className="mt-3 flex items-center gap-2 bg-pick-bg rounded-2xl px-4 py-2.5">
            <Smartphone size={14} className="text-pick-purple flex-shrink-0" />
            <p className="text-xs text-pick-text-sub">
              <span className="font-bold text-pick-text">공유</span> 버튼을 누른 후{" "}
              <span className="font-bold text-pick-text">&ldquo;홈 화면에 추가&rdquo;</span>를 선택하세요
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

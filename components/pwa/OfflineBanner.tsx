"use client";

import { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";

export default function OfflineBanner() {
  const [offline, setOffline] = useState(false);
  const [show,    setShow]    = useState(false);

  useEffect(() => {
    const handleOffline = () => { setOffline(true);  setShow(true);  };
    const handleOnline  = () => {
      setOffline(false);
      // 재연결 시 2초 후 배너 숨김
      setTimeout(() => setShow(false), 2000);
    };

    // 초기 상태 확인
    if (!navigator.onLine) { setOffline(true); setShow(true); }

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online",  handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online",  handleOnline);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      className={`fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-[100] transition-all duration-300 ${
        show ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <div className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold ${
        offline
          ? "bg-red-500 text-white"
          : "bg-green-500 text-white"
      }`}>
        <WifiOff size={15} className="flex-shrink-0" />
        <span>
          {offline
            ? "오프라인 상태예요 — 저장된 데이터를 표시합니다"
            : "인터넷에 다시 연결됐어요 ✅"}
        </span>
      </div>
    </div>
  );
}

"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    __piReady?: boolean;
    __piAuthPromise?: Promise<{ accessToken: string; user: { uid: string; username: string } }>;
  }
}

function initAndAuth() {
  if (!window.Pi || window.__piReady) return;
  window.Pi.init({ version: "2.0" });
  window.__piReady = true;
  window.__piAuthPromise = window.Pi.authenticate(["username"], async () => {});
}

export default function PiSdkLoader() {
  useEffect(() => {
    // 이미 로드된 경우 바로 실행
    if (window.Pi) {
      initAndAuth();
      return;
    }

    // 스크립트 동적 삽입 — head에 직접 추가해서 afterInteractive보다 빠름
    const script = document.createElement("script");
    script.src = "https://sdk.minepi.com/pi-sdk.js";
    script.async = true;
    script.onload = () => initAndAuth();
    document.head.appendChild(script);
  }, []);

  return null;
}

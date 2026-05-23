"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    __piReady?: boolean;
    __piAuthPromise?: Promise<{ accessToken: string; user: { uid: string; username: string } }>;
  }
}

async function initAndAuth() {
  if (!window.Pi || window.__piReady) return;
  // App Studio 환경에서 Pi.init()은 비동기(Promise)일 수 있으므로 await 필수
  await (window.Pi.init({ version: "2.0" }) as unknown as Promise<void> | void);
  // __piReady 세팅 전에 authenticate Promise를 먼저 저장해야 race condition 방지
  window.__piAuthPromise = window.Pi.authenticate(["username"], async () => {});
  window.__piReady = true;
}

export default function PiSdkLoader() {
  useEffect(() => {
    // 이미 로드된 경우 바로 실행
    if (window.Pi) {
      void initAndAuth();
      return;
    }

    // 스크립트 동적 삽입 — head에 직접 추가해서 afterInteractive보다 빠름
    const script = document.createElement("script");
    script.src = "https://sdk.minepi.com/pi-sdk.js";
    script.async = true;
    script.onload = () => { void initAndAuth(); };
    document.head.appendChild(script);
  }, []);

  return null;
}

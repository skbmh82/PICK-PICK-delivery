"use client";

import Script from "next/script";

declare global {
  interface Window {
    __piReady?: boolean;
  }
}

export default function PiSdkLoader() {
  return (
    <Script
      src="https://sdk.minepi.com/pi-sdk.js"
      strategy="afterInteractive"
      onLoad={() => {
        // 스크립트 완전 로드 후 Pi.init() 호출 — 이 시점의 window.Pi가 authenticate()와 동일한 객체
        window.Pi?.init({ version: "2.0", sandbox: true });
        window.__piReady = true;
      }}
    />
  );
}

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
        if (!window.Pi) return;
        window.Pi.init({ version: "2.0" });
        window.__piReady = true;
        // CDN 로드 즉시 authenticate 호출 — React useEffect를 기다리지 않음
        window.__piAuthPromise = window.Pi.authenticate(["username"], async () => {});
      }}
    />
  );
}

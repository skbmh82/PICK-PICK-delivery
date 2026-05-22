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
        if (window.Pi) {
          window.Pi.init({ version: "2.0" }); // sandbox 파라미터 없음
          window.__piReady = true;
        }
      }}
    />
  );
}

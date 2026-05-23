"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    __piReady?: boolean;
    __piLoginDone?: boolean;
    __piLoginRole?: string;
    __piAuthPromise?: Promise<{ accessToken: string; user: { uid: string; username: string } }>;
  }
}

async function initAndLogin() {
  if (!window.Pi || window.__piReady) return;

  await (window.Pi.init({ version: "2.0" }) as unknown as Promise<void> | void);

  const authPromise = window.Pi.authenticate(
    ["username", "payments"],
    async (incompletePmt) => {
      const txid = incompletePmt.transaction?.txid;
      if (incompletePmt.status.developer_approved && txid) {
        await fetch("/api/pi/complete", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ paymentId: incompletePmt.identifier, txid }),
        });
      }
    }
  );

  window.__piAuthPromise = authPromise;
  window.__piReady = true;

  try {
    const auth = await authPromise;

    // 서버 API 호출 — 서버가 직접 쿠키로 세션 설정
    const res = await fetch("/api/auth/pi-login", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ accessToken: auth.accessToken }),
    });

    if (res.ok) {
      const data = await res.json() as { role: string };
      window.__piLoginDone = true;
      window.__piLoginRole = data.role;

      // 로그인 페이지에 있으면 자동 이동
      if (window.location.pathname.includes("/login")) {
        const dest = data.role === "owner" ? "/owner/dashboard"
                   : data.role === "rider" ? "/rider/dashboard"
                   : "/home";
        window.location.href = dest;
      }
    }
  } catch (e) {
    console.error("[PiSdkLoader] auto-login error:", e);
  } finally {
    window.__piAuthPromise = undefined;
  }
}

export default function PiSdkLoader() {
  useEffect(() => {
    if (window.Pi) {
      void initAndLogin();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://sdk.minepi.com/pi-sdk.js";
    script.async = true;
    script.onload = () => { void initAndLogin(); };
    document.head.appendChild(script);
  }, []);

  return null;
}

"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    __piReady?: boolean;
    __piLoginDone?: boolean;
    __piLoginRole?: string;
    __piSdkLoaded?: boolean;
    __piAuthPromise?: Promise<{ accessToken: string; user: { uid: string; username: string } }>;
  }
}

function hasSessionCookie(): boolean {
  try {
    return document.cookie.includes("supabase.auth.token=");
  } catch {
    return false;
  }
}

async function refreshPiSession() {
  // 스플래시(/)와 로그인(/login) 페이지는 자체 Pi 인증을 처리 — 중복 실행 방지
  const path = window.location.pathname;
  if (path === "/" || path === "/login") return;

  if (!window.Pi || window.__piReady) return;

  if (hasSessionCookie()) {
    window.__piReady = true;
    return;
  }

  await (window.Pi.init({ version: "2.0" }) as unknown as Promise<void> | void);

  const authPromise = window.Pi.authenticate(["username"], async () => {});
  window.__piAuthPromise = authPromise;
  window.__piReady = true;

  try {
    const auth = await authPromise;
    const res = await fetch("/api/auth/pi-login", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ accessToken: auth.accessToken }),
    });
    if (res.ok) {
      const data = await res.json() as { role: string };
      window.__piLoginDone = true;
      window.__piLoginRole = data.role;
    }
  } catch (e) {
    console.error("[PiSdkLoader] session refresh error:", e);
  } finally {
    window.__piAuthPromise = undefined;
  }
}

export function loadPiSdk(): Promise<void> {
  return new Promise((resolve) => {
    if (window.Pi) { resolve(); return; }
    if (window.__piSdkLoaded) {
      // 이미 스크립트 주입됨 — window.Pi 나타날 때까지 폴링
      const poll = setInterval(() => {
        if (window.Pi) { clearInterval(poll); resolve(); }
      }, 100);
      setTimeout(() => { clearInterval(poll); resolve(); }, 5_000);
      return;
    }
    window.__piSdkLoaded = true;
    const script   = document.createElement("script");
    script.src     = "https://sdk.minepi.com/pi-sdk.js";
    script.async   = true;
    script.onload  = () => resolve();
    script.onerror = () => resolve(); // 실패해도 진행
    document.head.appendChild(script);
  });
}

export default function PiSdkLoader() {
  useEffect(() => {
    // SDK 로드 후 session refresh (/ 와 /login은 자체 처리)
    loadPiSdk().then(() => { void refreshPiSession(); });
  }, []);

  return null;
}

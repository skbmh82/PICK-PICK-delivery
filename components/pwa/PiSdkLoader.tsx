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

  // SDK already started or no Pi Browser
  if (!window.Pi || window.__piReady) return;

  // Session cookie already present — no need to re-authenticate
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

export default function PiSdkLoader() {
  useEffect(() => {
    // Pi Browser / Pi Desktop은 window.Pi를 자동 주입 — 없으면 일반 브라우저
    // 스크립트 로드 없이 window.Pi 자체가 있을 때만 session refresh 실행
    if (!window.Pi) return;

    // Pi Browser / Pi Desktop이 window.Pi를 이미 주입한 상태
    void refreshPiSession();
  }, []);

  return null;
}

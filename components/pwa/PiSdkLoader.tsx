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
  // Splash page (/) handles its own auth — don't double-run
  if (window.location.pathname === "/") return;

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
    if (window.Pi) {
      void refreshPiSession();
      return;
    }

    // Avoid duplicate script tags
    if (document.querySelector('script[src="https://sdk.minepi.com/pi-sdk.js"]')) {
      // Script already injected — wait for it
      const poll = setInterval(() => {
        if (window.Pi) {
          clearInterval(poll);
          void refreshPiSession();
        }
      }, 200);
      setTimeout(() => clearInterval(poll), 15_000);
      return;
    }

    const script    = document.createElement("script");
    script.src      = "https://sdk.minepi.com/pi-sdk.js";
    script.async    = true;
    script.onload   = () => { void refreshPiSession(); };
    document.head.appendChild(script);
  }, []);

  return null;
}

"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

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

  // __piReady 세팅 전에 Promise 저장 (login/page.tsx 폴백용 race condition 방지)
  window.__piAuthPromise = authPromise;
  window.__piReady = true;

  // Pi 인증 완료 후 자동 Supabase 로그인 (로그인 페이지 없이 앱 진입)
  try {
    const auth = await authPromise;

    // 이미 세션이 있으면 스킵
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      window.__piLoginDone = true;
      window.__piAuthPromise = undefined;
      return;
    }

    // 백엔드에서 access_token / refresh_token 획득
    const res = await fetch("/api/auth/pi-login", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ accessToken: auth.accessToken }),
    });

    if (res.ok) {
      const data = await res.json() as {
        access_token:  string;
        refresh_token: string;
        role:          string;
      };
      const { error } = await supabase.auth.setSession({
        access_token:  data.access_token,
        refresh_token: data.refresh_token,
      });
      if (!error) {
        window.__piLoginDone = true;
        window.__piLoginRole = data.role;
        // 로그인 페이지에 있으면 자동 이동
        if (window.location.pathname.includes("/login")) {
          const dest = data.role === "owner" ? "/owner/dashboard"
                     : data.role === "rider" ? "/rider/dashboard"
                     : "/home";
          window.location.replace(dest);
        }
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

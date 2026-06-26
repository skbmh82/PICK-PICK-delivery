"use client";

import { useEffect } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { getFirebaseMessaging } from "@/lib/firebase/client";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

let onMessageRegistered = false;

async function initMessagingListener() {
  const messaging = getFirebaseMessaging();
  if (!messaging || onMessageRegistered) return;
  onMessageRegistered = true;
  onMessage(messaging, (payload) => {
    const { title, body } = payload.notification ?? {};
    const data = payload.data ?? {};
    if (title && Notification.permission === "granted") {
      const notif = new Notification(title, {
        body:  body ?? "",
        icon:  "/icons/icon-192.png",
        badge: "/icons/badge-72.png",
        data,
      });
      notif.onclick = () => {
        window.focus();
        if (data.url) window.location.href = data.url as string;
        notif.close();
      };
    }
  });
}

/**
 * FCM 토큰 발급 및 서버 등록.
 * Notification.permission === "granted" 상태일 때만 동작.
 * 권한 요청은 하지 않으므로 버튼 클릭 핸들러 등 user gesture 후 호출할 것.
 */
export async function registerFcmToken(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (!VAPID_KEY || !process.env.NEXT_PUBLIC_FIREBASE_API_KEY) return false;
  if (Notification.permission !== "granted") return false;

  try {
    const swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    const messaging = getFirebaseMessaging();
    if (!messaging) return false;

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swReg,
    });
    if (!token) return false;

    await fetch("/api/fcm/token", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ token }),
    });

    await initMessagingListener();
    return true;
  } catch (e) {
    console.warn("FCM 등록 실패:", e);
    return false;
  }
}

/**
 * 권한이 이미 granted 상태인 경우 자동으로 FCM 토큰 등록.
 * default 상태에서는 아무것도 하지 않음 — 팝업은 반드시 user gesture로만 띄운다.
 */
export function useFcmToken(isLoggedIn: boolean) {
  useEffect(() => {
    if (!isLoggedIn) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    void registerFcmToken();
  }, [isLoggedIn]);
}

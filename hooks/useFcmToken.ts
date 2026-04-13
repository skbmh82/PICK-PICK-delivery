"use client";

import { useEffect, useRef } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { getFirebaseMessaging } from "@/lib/firebase/client";

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

/**
 * FCM 토큰을 취득하고 서버에 등록하는 훅
 * - 로그인 상태일 때만 동작
 * - 알림 권한 요청 → 토큰 발급 → /api/fcm/token 저장
 * - 포그라운드 메시지 수신 시 브라우저 Notification 표시
 */
export function useFcmToken(isLoggedIn: boolean) {
  const registeredRef = useRef(false);

  useEffect(() => {
    if (!isLoggedIn || registeredRef.current) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (!VAPID_KEY || !process.env.NEXT_PUBLIC_FIREBASE_API_KEY) return;

    const register = async () => {
      try {
        // 알림 권한 요청
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        // 서비스 워커 등록 (config는 SW에 직접 하드코딩)
        const swReg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");

        const messaging = getFirebaseMessaging();
        if (!messaging) return;

        // FCM 토큰 발급
        const token = await getToken(messaging, {
          vapidKey:            VAPID_KEY,
          serviceWorkerRegistration: swReg,
        });

        if (!token) return;

        // 서버에 토큰 저장
        await fetch("/api/fcm/token", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ token }),
        });

        registeredRef.current = true;

        // 포그라운드 메시지 수신 → 브라우저 알림 표시
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

      } catch (e) {
        console.warn("FCM 등록 실패:", e);
      }
    };

    void register();
  }, [isLoggedIn]);
}

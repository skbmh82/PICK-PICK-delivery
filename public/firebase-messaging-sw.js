// Firebase Cloud Messaging 서비스 워커
// 백그라운드 푸시 알림을 처리합니다.

importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

// NEXT_PUBLIC_ 값은 공개값이므로 SW에 직접 하드코딩 (메시지 타이밍 문제 방지)
const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyDUEnU6sMKXRE0wfxjJCDvUX8fqaXN3_Os",
  authDomain:        "pickpick-61e41.firebaseapp.com",
  projectId:         "pickpick-61e41",
  storageBucket:     "pickpick-61e41.firebasestorage.app",
  messagingSenderId: "324814684843",
  appId:             "1:324814684843:web:f40e8f2db9e66de39b6dee",
};

firebase.initializeApp(FIREBASE_CONFIG);
const messaging = firebase.messaging();

// 백그라운드 메시지 수신
messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification ?? {};
  const data = payload.data ?? {};

  self.registration.showNotification(title ?? "PICK PICK", {
    body:    body ?? "",
    icon:    "/icons/icon-192.png",
    badge:   "/icons/badge-72.png",
    data:    data,
    vibrate: [200, 100, 200],
    actions: [
      { action: "open",    title: "열기" },
      { action: "dismiss", title: "닫기" },
    ],
  });
});

// 알림 클릭 처리
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url  = event.notification.data?.url ?? "/home";
  const path = event.action === "dismiss" ? null : url;

  if (path) {
    event.waitUntil(
      clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(path);
            return client.focus();
          }
        }
        return clients.openWindow(path);
      })
    );
  }
});

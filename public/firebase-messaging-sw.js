// Firebase Cloud Messaging 서비스 워커
// 백그라운드 푸시 알림을 처리합니다.

importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

// Firebase 설정 — 빌드 시 자동으로 주입되지 않으므로 직접 클라이언트 설정을 복사
// (민감한 키가 아닌 NEXT_PUBLIC_ 값들입니다)
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "FIREBASE_CONFIG") {
    const config = event.data.config;
    firebase.initializeApp(config);

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
  }
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

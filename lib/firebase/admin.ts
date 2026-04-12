/**
 * Firebase Admin SDK 초기화 (서버 전용)
 * FIREBASE_ADMIN_SDK_JSON 환경변수에 서비스 계정 JSON 문자열을 넣어주세요.
 */
import admin from "firebase-admin";

let adminApp: admin.app.App | null = null;

export function getFirebaseAdmin(): admin.app.App | null {
  if (!process.env.FIREBASE_ADMIN_SDK_JSON) return null;

  if (!adminApp) {
    if (admin.apps.length > 0) {
      adminApp = admin.apps[0]!;
    } else {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_JSON) as admin.ServiceAccount;
        adminApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
      } catch (e) {
        console.error("Firebase Admin 초기화 실패:", e);
        return null;
      }
    }
  }
  return adminApp;
}

/**
 * FCM 푸시 알림 전송
 * @param token    수신자 FCM 토큰
 * @param title    알림 제목
 * @param body     알림 본문
 * @param data     추가 데이터 (클릭 시 활용)
 */
export async function sendPushNotification({
  token,
  title,
  body,
  data = {},
}: {
  token: string;
  title: string;
  body:  string;
  data?: Record<string, string>;
}): Promise<boolean> {
  const app = getFirebaseAdmin();
  if (!app) return false;

  try {
    await admin.messaging(app).send({
      token,
      notification: { title, body },
      data,
      webpush: {
        notification: {
          title,
          body,
          icon:  "/icons/icon-192.png",
          badge: "/icons/badge-72.png",
          vibrate: [200, 100, 200],
        },
        fcmOptions: { link: data.url ?? "/home" },
      },
      android: {
        notification: {
          title,
          body,
          icon:  "ic_notification",
          color: "#6B21A8",
          sound: "default",
        },
      },
      apns: {
        payload: {
          aps: {
            alert: { title, body },
            sound: "default",
            badge: 1,
          },
        },
      },
    });
    return true;
  } catch (e) {
    console.error("FCM 전송 실패:", e);
    return false;
  }
}

/**
 * 여러 토큰에 동시 전송 (최대 500개)
 */
export async function sendMulticastPush({
  tokens,
  title,
  body,
  data = {},
}: {
  tokens: string[];
  title:  string;
  body:   string;
  data?:  Record<string, string>;
}): Promise<void> {
  const app = getFirebaseAdmin();
  if (!app || tokens.length === 0) return;

  const chunks: string[][] = [];
  for (let i = 0; i < tokens.length; i += 500) {
    chunks.push(tokens.slice(i, i + 500));
  }

  for (const chunk of chunks) {
    await admin.messaging(app).sendEachForMulticast({
      tokens: chunk,
      notification: { title, body },
      data,
      webpush: {
        notification: {
          title, body,
          icon:  "/icons/icon-192.png",
          badge: "/icons/badge-72.png",
        },
        fcmOptions: { link: data.url ?? "/home" },
      },
    }).catch((e) => console.error("Multicast FCM 오류:", e));
  }
}

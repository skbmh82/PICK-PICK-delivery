"use client";

import { useFcmToken } from "@/hooks/useFcmToken";
import { useAuthStore } from "@/stores/authStore";

/**
 * FCM 토큰 등록 프로바이더
 * 로그인 상태를 감지하고 FCM 토큰을 자동으로 등록합니다.
 */
export default function FcmProvider() {
  const user = useAuthStore((s) => s.user);
  useFcmToken(!!user);
  return null;
}

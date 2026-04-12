import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 프로덕션에서만 활성화
  enabled: process.env.NODE_ENV === "production",

  // 성능 트레이싱 (10% 샘플링)
  tracesSampleRate: 0.1,

  // 에러 샘플링 (100%)
  sampleRate: 1.0,

  // 릴리즈 버전 태깅
  release: process.env.NEXT_PUBLIC_APP_VERSION ?? "0.1.0",

  // 환경 태깅
  environment: process.env.NODE_ENV,

  // 재현 세션 (에러 직전 사용자 행동 기록)
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.05,

  integrations: [
    Sentry.replayIntegration({
      maskAllText:   false,
      blockAllMedia: false,
    }),
  ],

  // 무시할 에러 패턴 (네트워크 오류 등 노이즈 제거)
  ignoreErrors: [
    "ResizeObserver loop limit exceeded",
    "Non-Error exception captured",
    /Network request failed/i,
    /Failed to fetch/i,
    /Load failed/i,
  ],
});

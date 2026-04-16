import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import { withSentryConfig } from "@sentry/nextjs";

const withSerwist = withSerwistInit({
  swSrc:  "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "oiweworjpudeawhefcim.supabase.co" },
    ],
  },
};

const serwistConfig = withSerwist(nextConfig);

export default withSentryConfig(serwistConfig, {
  org:     process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // 소스맵 업로드 (토큰 없으면 건너뜀)
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent:    true,
  // 프로덕션 빌드 시에만 소스맵 업로드
  sourcemaps: {
    disable: process.env.NODE_ENV !== "production",
    deleteSourcemapsAfterUpload: true,
  },
  // 서버 함수 자동 계측
  widenClientFileUpload: true,
});

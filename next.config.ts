import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc:  "app/sw.ts",
  swDest: "public/sw.js",
  // 개발 모드에서는 서비스 워커 비활성화
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // 이미지 최적화
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "oiweworjpudeawhefcim.supabase.co" },
    ],
  },
};

export default withSerwist(nextConfig);

import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope & typeof WorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting:     true,
  clientsClaim:    true,
  navigationPreload: false,
  runtimeCaching: [
    // ── API 응답 — NetworkFirst (오프라인 시 캐시 폴백) ─────
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/stores"),
      handler: new NetworkFirst({
        cacheName:        "api-stores",
        networkTimeoutSeconds: 5,
        plugins: [{ cacheWillUpdate: async ({ response }) =>
          response.status === 200 ? response : null,
        }],
      }),
    },
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/orders/my"),
      handler: new NetworkFirst({
        cacheName:        "api-orders",
        networkTimeoutSeconds: 5,
      }),
    },
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/wallet"),
      handler: new NetworkFirst({
        cacheName:        "api-wallet",
        networkTimeoutSeconds: 5,
      }),
    },

    // ── 정적 이미지 — CacheFirst (자주 바뀌지 않음) ─────────
    {
      matcher: ({ request }) => request.destination === "image",
      handler: new CacheFirst({
        cacheName: "images",
        plugins: [{
          cacheWillUpdate: async ({ response }) =>
            response.status === 200 ? response : null,
        }],
      }),
    },

    // ── 폰트 — CacheFirst ────────────────────────────────────
    {
      matcher: ({ url }) =>
        url.origin === "https://fonts.googleapis.com" ||
        url.origin === "https://fonts.gstatic.com",
      handler: new CacheFirst({ cacheName: "fonts" }),
    },

    // ── Next.js 정적 파일 — StaleWhileRevalidate ────────────
    {
      matcher: ({ url }) => url.pathname.startsWith("/_next/static"),
      handler: new StaleWhileRevalidate({ cacheName: "next-static" }),
    },

    // ── HTML 페이지 — NetworkFirst ───────────────────────────
    {
      matcher: ({ request }) => request.destination === "document",
      handler: new NetworkFirst({
        cacheName:        "pages",
        networkTimeoutSeconds: 5,
      }),
    },
  ],
});

serwist.addEventListeners();

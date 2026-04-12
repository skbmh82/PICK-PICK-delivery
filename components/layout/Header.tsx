"use client";

import Link from "next/link";
import { Bell, X, Package, Gift, Megaphone, ArrowUpRight, Circle } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useEffect, useState, useCallback, useRef } from "react";
import { fetchMyPickBalance } from "@/lib/supabase/wallet";
import { useRouter } from "next/navigation";

// ── 타입 ──────────────────────────────────────────────
interface Notification {
  id:        string;
  type:      string;
  title:     string;
  body:      string | null;
  data:      Record<string, unknown>;
  isRead:    boolean;
  createdAt: string;
}

// ── 알림 유형별 아이콘 ────────────────────────────────
function NotifIcon({ type }: { type: string }) {
  const base = "w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0";
  if (type === "order_update") return <div className={`${base} bg-pick-purple/10`}><Package size={16} className="text-pick-purple" /></div>;
  if (type === "reward")       return <div className={`${base} bg-yellow-50`}><Gift size={16} className="text-yellow-500" /></div>;
  if (type === "transfer")     return <div className={`${base} bg-sky-50`}><ArrowUpRight size={16} className="text-sky-500" /></div>;
  return <div className={`${base} bg-gray-100`}><Megaphone size={16} className="text-gray-400" /></div>;
}

// 알림 타입별 딥링크
function getNotifHref(n: Notification): string | null {
  const orderId = n.data?.orderId as string | undefined;
  if (n.type === "order_update" && orderId) return `/orders/${orderId}`;
  if (n.type === "reward")   return "/wallet";
  if (n.type === "transfer") return "/wallet";
  return null;
}

// ── 알림 드로어 ───────────────────────────────────────
function NotificationDrawer({
  notifications,
  onClose,
  onReadAll,
  onReadOne,
}: {
  notifications: Notification[];
  onClose: () => void;
  onReadAll: () => void;
  onReadOne: (id: string) => void;
}) {
  const router = useRouter();
  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[55]" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-[380px] z-[60] bg-white dark:bg-pick-card shadow-2xl flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-pick-border">
          <div className="flex items-center gap-2">
            <h2 className="font-black text-pick-text text-lg">알림</h2>
            {unread > 0 && (
              <span className="text-xs font-black bg-pick-purple text-white px-2 py-0.5 rounded-full">
                {unread}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unread > 0 && (
              <button
                onClick={onReadAll}
                className="text-xs font-bold text-pick-purple bg-pick-bg border border-pick-border px-3 py-1.5 rounded-full"
              >
                모두 읽음
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100"
            >
              <X size={16} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* 목록 */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-pick-text-sub gap-3">
              <Bell size={40} className="opacity-20" />
              <p className="text-sm font-medium">알림이 없어요</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-pick-border">
              {notifications.map((n) => {
                const href = getNotifHref(n);
                const handleClick = () => {
                  if (!n.isRead) onReadOne(n.id);
                  if (href) { onClose(); router.push(href); }
                };
                return (
                <button
                  key={n.id}
                  onClick={handleClick}
                  className={`w-full flex items-start gap-3 px-5 py-4 text-left transition-colors ${
                    n.isRead ? "bg-white dark:bg-pick-card" : "bg-pick-bg"
                  } ${href ? "active:bg-pick-border/40" : ""}`}
                >
                  <NotifIcon type={n.type} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm leading-snug ${n.isRead ? "font-medium text-pick-text" : "font-black text-pick-text"}`}>
                        {n.title}
                      </p>
                      {!n.isRead && (
                        <Circle size={7} className="text-pick-purple fill-pick-purple flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                    {n.body && (
                      <p className="text-xs text-pick-text-sub mt-0.5 leading-relaxed">{n.body}</p>
                    )}
                    <p className="text-[10px] text-pick-text-sub mt-1">
                      {new Date(n.createdAt).toLocaleDateString("ko-KR", {
                        month: "short", day: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </p>
                  </div>
                </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── 메인 헤더 ─────────────────────────────────────────
export default function Header() {
  const user = useAuthStore((s) => s.user);
  const [balance,       setBalance]       = useState<number>(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [drawerOpen,    setDrawerOpen]    = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    const res = await fetch("/api/notifications").catch(() => null);
    if (!res?.ok) return;
    const json = await res.json();
    setNotifications(json.notifications ?? []);
    setUnreadCount(json.unreadCount ?? 0);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchMyPickBalance(user.id).then(setBalance);
    void fetchNotifications();
    // 30초마다 폴링
    intervalRef.current = setInterval(() => void fetchNotifications(), 30000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [user, fetchNotifications]);

  const handleReadAll = async () => {
    await fetch("/api/notifications/read", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleReadOne = async (id: string) => {
    await fetch("/api/notifications/read", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between px-5 py-3.5 bg-pick-purple-dark">
        {/* 로고 */}
        <Link href="/home" className="flex items-center gap-0.5">
          <span className="text-3xl text-pick-yellow-light drop-shadow-sm" style={{ fontFamily: "var(--font-logo)" }}>
            PICK
          </span>
          <span className="text-3xl text-white drop-shadow-sm" style={{ fontFamily: "var(--font-logo)" }}>
            PICK
          </span>
          <span className="ml-1.5 text-2xl">🛵</span>
        </Link>

        {/* 우측: PICK 잔액 + 알림 */}
        <div className="flex items-center gap-2.5">
          {user ? (
            <Link
              href="/wallet"
              className="flex items-center gap-1.5 bg-white/15 border border-white/20 px-3.5 py-2 rounded-full"
            >
              <span className="text-pick-yellow-light text-sm font-black">P</span>
              <span className="text-white text-sm font-bold">{balance.toLocaleString()}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center bg-pick-yellow-light text-pick-yellow-dark text-xs font-black px-4 py-2 rounded-full active:scale-95 transition-transform"
            >
              로그인
            </Link>
          )}

          <button
            aria-label="알림"
            onClick={() => { setDrawerOpen(true); }}
            className="relative w-9 h-9 flex items-center justify-center rounded-full bg-white/15 border border-white/20 hover:bg-white/25 transition-colors"
          >
            <Bell size={18} className="text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-pick-yellow-light text-pick-yellow-dark text-[9px] font-black rounded-full border-2 border-pick-purple-dark flex items-center justify-center px-0.5">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {drawerOpen && (
        <NotificationDrawer
          notifications={notifications}
          onClose={() => setDrawerOpen(false)}
          onReadAll={handleReadAll}
          onReadOne={handleReadOne}
        />
      )}
    </>
  );
}

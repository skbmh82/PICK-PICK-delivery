"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, BellOff, Package, Coins, Megaphone, ChevronLeft, Check, RefreshCw } from "lucide-react";

interface Notification {
  id:        string;
  type:      string;
  title:     string;
  body:      string | null;
  data:      Record<string, unknown>;
  isRead:    boolean;
  createdAt: string;
}

function typeIcon(type: string) {
  switch (type) {
    case "order_update": return <Package size={18} className="text-pick-purple" />;
    case "reward":       return <Coins   size={18} className="text-amber-500" />;
    case "promotion":    return <Megaphone size={18} className="text-sky-500" />;
    default:             return <Bell    size={18} className="text-pick-text-sub" />;
  }
}

function typeBg(type: string) {
  switch (type) {
    case "order_update": return "bg-purple-50";
    case "reward":       return "bg-amber-50";
    case "promotion":    return "bg-sky-50";
    default:             return "bg-gray-50";
  }
}

function timeAgo(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const sec  = Math.floor(diff / 1000);
    if (sec < 60)   return "방금 전";
    const min = Math.floor(sec / 60);
    if (min < 60)   return `${min}분 전`;
    const hr  = Math.floor(min / 60);
    if (hr  < 24)   return `${hr}시간 전`;
    const day = Math.floor(hr / 24);
    if (day < 7)    return `${day}일 전`;
    return new Date(dateStr).toLocaleDateString("ko-KR", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export default function NotificationsPage() {
  const router  = useRouter();
  const [items, setItems]     = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const json = await res.json();
        setItems(json.notifications ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const markAllRead = async () => {
    setMarking(true);
    try {
      await fetch("/api/notifications/read", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } finally {
      setMarking(false);
    }
  };

  const markOne = async (id: string) => {
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    await fetch("/api/notifications/read", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ id }),
    });
  };

  const handleClick = async (n: Notification) => {
    if (!n.isRead) await markOne(n.id);

    // 주문 상세로 이동
    if (n.data?.orderId) {
      router.push(`/orders/${n.data.orderId}`);
    }
  };

  const unread = items.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-pick-bg pb-24">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-white dark:bg-pick-card border-b border-pick-border">
        <div className="flex items-center gap-3 px-4 py-4">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-pick-bg border border-pick-border active:scale-95 transition-transform"
          >
            <ChevronLeft size={20} className="text-pick-text" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-black text-pick-text">알림</h1>
            {unread > 0 && (
              <p className="text-xs text-pick-purple font-semibold">
                읽지 않은 알림 {unread}개
              </p>
            )}
          </div>
          <button
            onClick={load}
            className="p-2 rounded-full bg-pick-bg border border-pick-border active:scale-95 transition-transform"
          >
            <RefreshCw size={16} className="text-pick-text-sub" />
          </button>
          {unread > 0 && (
            <button
              onClick={markAllRead}
              disabled={marking}
              className="flex items-center gap-1.5 bg-pick-purple text-white text-xs font-bold px-3 py-2 rounded-full active:scale-95 transition-all disabled:opacity-50"
            >
              <Check size={14} />
              전체 읽음
            </button>
          )}
        </div>
      </div>

      {/* 내용 */}
      <div className="px-4 pt-4">
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-pick-card rounded-3xl p-4 shadow-sm animate-pulse">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gray-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-100 rounded-full w-2/3" />
                    <div className="h-2.5 bg-gray-100 rounded-full w-full" />
                    <div className="h-2 bg-gray-100 rounded-full w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-pick-text-sub">
            <BellOff size={52} className="mb-4 opacity-20" />
            <p className="text-base font-bold mb-1">알림이 없어요</p>
            <p className="text-sm opacity-70">주문 상태, 적립 내역 등이 여기에 표시돼요</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((n) => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={`w-full text-left rounded-3xl p-4 shadow-sm border transition-all active:scale-[0.98] ${
                  n.isRead
                    ? "bg-white border-pick-border opacity-70"
                    : "bg-white border-pick-purple/30 ring-1 ring-pick-purple/10"
                }`}
              >
                <div className="flex gap-3 items-start">
                  {/* 아이콘 */}
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${typeBg(n.type)}`}>
                    {typeIcon(n.type)}
                  </div>

                  {/* 텍스트 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className={`text-sm font-bold truncate ${n.isRead ? "text-pick-text-sub" : "text-pick-text"}`}>
                        {n.title}
                      </p>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-pick-purple flex-shrink-0" />
                      )}
                    </div>
                    {n.body && (
                      <p className="text-xs text-pick-text-sub leading-relaxed line-clamp-2">
                        {n.body}
                      </p>
                    )}
                    <p className="text-[10px] text-pick-text-sub/60 mt-1.5">
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

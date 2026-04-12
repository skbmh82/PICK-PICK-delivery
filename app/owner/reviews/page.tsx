"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, MessageSquare, Send, Trash2, RefreshCw, Check } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  content: string | null;
  imageUrls: string[];
  createdAt: string;
  userName: string;
  ownerReply: string | null;
  ownerRepliedAt: string | null;
}

// ── 리뷰 카드 ──────────────────────────────────────────
function ReviewCard({ review, onReplied }: { review: Review; onReplied: (id: string, reply: string | null) => void }) {
  const [editing,  setEditing]  = useState(false);
  const [reply,    setReply]    = useState(review.ownerReply ?? "");
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saved,    setSaved]    = useState(false);

  const handleSave = async () => {
    if (!reply.trim() || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/reviews/${review.id}/reply`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ reply: reply.trim() }),
      });
      if (res.ok) {
        setSaved(true);
        setEditing(false);
        onReplied(review.id, reply.trim());
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/reviews/${review.id}/reply`, { method: "DELETE" });
      if (res.ok) {
        setReply("");
        onReplied(review.id, null);
      }
    } finally {
      setDeleting(false);
    }
  };

  const hasReply = !!review.ownerReply;

  return (
    <div className="bg-white dark:bg-pick-card rounded-3xl border-2 border-pick-border shadow-sm px-4 py-4">
      {/* 리뷰어 정보 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-pick-text text-sm">{review.userName}</span>
          <div className="flex">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} size={12}
                className={s <= review.rating
                  ? "text-pick-yellow fill-pick-yellow"
                  : "text-gray-200 fill-gray-200"} />
            ))}
          </div>
        </div>
        <span className="text-[10px] text-pick-text-sub">
          {new Date(review.createdAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
        </span>
      </div>

      {review.content && (
        <p className="text-sm text-pick-text-sub leading-relaxed mb-3">{review.content}</p>
      )}

      {/* 리뷰 이미지 */}
      {review.imageUrls.length > 0 && (
        <div className="flex gap-2 mb-3">
          {review.imageUrls.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer">
              <img src={url} alt={`리뷰 이미지 ${i + 1}`}
                className="w-20 h-20 rounded-2xl object-cover border border-pick-border" />
            </a>
          ))}
        </div>
      )}

      {/* 기존 답글 표시 */}
      {hasReply && !editing && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-3 py-2.5 mb-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-black text-amber-700">🏪 사장님 답글</p>
            <span className="text-[10px] text-pick-text-sub">
              {review.ownerRepliedAt
                ? new Date(review.ownerRepliedAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
                : ""}
            </span>
          </div>
          <p className="text-xs text-pick-text leading-relaxed">{review.ownerReply}</p>
        </div>
      )}

      {/* 답글 입력 */}
      {editing && (
        <div className="mb-3">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="고객님의 소중한 리뷰에 감사의 마음을 전하세요 💛"
            maxLength={500}
            rows={3}
            className="w-full border-2 border-amber-300 focus:border-amber-500 rounded-2xl px-4 py-3 text-sm text-pick-text bg-white dark:bg-pick-card outline-none resize-none"
          />
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-pick-text-sub">{reply.length}/500</span>
            <div className="flex gap-2">
              <button
                onClick={() => { setEditing(false); setReply(review.ownerReply ?? ""); }}
                className="text-xs font-bold text-pick-text-sub px-3 py-1.5 rounded-full border border-pick-border"
              >
                취소
              </button>
              <button
                onClick={() => void handleSave()}
                disabled={!reply.trim() || saving}
                className="flex items-center gap-1.5 text-xs font-bold text-white bg-amber-500 px-3 py-1.5 rounded-full disabled:opacity-50 active:scale-95 transition-transform"
              >
                {saving
                  ? <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : saved ? <Check size={12} /> : <Send size={12} />
                }
                {saved ? "저장됨" : "답글 등록"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 액션 버튼 */}
      {!editing && (
        <div className="flex gap-2">
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full active:scale-95 transition-transform"
          >
            <MessageSquare size={11} />
            {hasReply ? "답글 수정" : "답글 달기"}
          </button>
          {hasReply && (
            <button
              onClick={() => void handleDelete()}
              disabled={deleting}
              className="flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-50 border border-red-200 px-3 py-1.5 rounded-full active:scale-95 transition-transform disabled:opacity-50"
            >
              <Trash2 size={11} />
              {deleting ? "삭제 중..." : "답글 삭제"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── 평점 요약 ──────────────────────────────────────────
function RatingSummary({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null;
  const avg     = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  const counts  = [5,4,3,2,1].map((s) => ({
    star: s,
    cnt: reviews.filter((r) => r.rating === s).length,
  }));
  const max = Math.max(...counts.map((c) => c.cnt), 1);

  return (
    <div className="mx-4 mb-5 bg-white dark:bg-pick-card rounded-3xl border-2 border-pick-border shadow-sm px-5 py-4">
      <div className="flex items-center gap-4">
        <div className="text-center">
          <p className="text-4xl font-black text-pick-text">{avg.toFixed(1)}</p>
          <div className="flex mt-1">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} size={14}
                className={s <= Math.round(avg)
                  ? "text-pick-yellow fill-pick-yellow"
                  : "text-gray-200 fill-gray-200"} />
            ))}
          </div>
          <p className="text-xs text-pick-text-sub mt-1">총 {reviews.length}개</p>
        </div>
        <div className="flex-1 flex flex-col gap-1.5">
          {counts.map(({ star, cnt }) => (
            <div key={star} className="flex items-center gap-2">
              <span className="text-xs text-pick-text-sub w-4 text-right">{star}</span>
              <Star size={10} className="text-pick-yellow fill-pick-yellow flex-shrink-0" />
              <div className="flex-1 h-2 bg-pick-bg rounded-full overflow-hidden">
                <div
                  className="h-full bg-pick-yellow rounded-full"
                  style={{ width: `${(cnt / max) * 100}%` }}
                />
              </div>
              <span className="text-xs text-pick-text-sub w-4">{cnt}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-pick-border">
        <div className="flex-1 text-center">
          <p className="font-black text-green-600 text-lg">
            {reviews.filter((r) => r.ownerReply).length}
          </p>
          <p className="text-xs text-pick-text-sub">답글 완료</p>
        </div>
        <div className="w-0.5 h-8 bg-pick-border" />
        <div className="flex-1 text-center">
          <p className="font-black text-amber-600 text-lg">
            {reviews.filter((r) => !r.ownerReply).length}
          </p>
          <p className="text-xs text-pick-text-sub">답글 미완료</p>
        </div>
      </div>
    </div>
  );
}

// ── 메인 페이지 ────────────────────────────────────────
export default function OwnerReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState<"all" | "unanswered">("all");

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stores/my/reviews");
      if (res.ok) {
        const { reviews: rows } = await res.json();
        setReviews(rows ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleReplied = (id: string, reply: string | null) => {
    setReviews((prev) => prev.map((r) =>
      r.id === id ? { ...r, ownerReply: reply, ownerRepliedAt: reply ? new Date().toISOString() : null } : r
    ));
  };

  const filtered = filter === "unanswered"
    ? reviews.filter((r) => !r.ownerReply)
    : reviews;

  return (
    <div className="min-h-full py-5">
      {/* 헤더 */}
      <div className="px-4 mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-black text-pick-text text-xl flex items-center gap-2">
            <Star size={22} className="text-amber-500 fill-amber-500" />
            리뷰 관리
          </h1>
          <p className="text-sm text-pick-text-sub mt-0.5">고객 리뷰에 정성껏 답글을 달아보세요</p>
        </div>
        <button onClick={fetchReviews}
          className="p-2 rounded-full bg-pick-bg border border-pick-border text-pick-text-sub">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* 평점 요약 */}
      <RatingSummary reviews={reviews} />

      {/* 필터 탭 */}
      <div className="flex gap-2 px-4 mb-4">
        {([
          { key: "all"        as const, label: `전체 (${reviews.length})` },
          { key: "unanswered" as const, label: `답글 필요 (${reviews.filter((r) => !r.ownerReply).length})` },
        ]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${
              filter === key
                ? "bg-amber-500 text-white shadow-sm"
                : "bg-white dark:bg-pick-card text-pick-text-sub border-2 border-pick-border"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 리뷰 목록 */}
      <div className="px-4 flex flex-col gap-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-3xl border-2 border-pick-border animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-pick-text-sub">
            <Star size={44} className="mb-3 opacity-20" />
            <p className="text-sm font-medium">
              {filter === "unanswered" ? "답글이 필요한 리뷰가 없어요 🎉" : "아직 리뷰가 없어요"}
            </p>
          </div>
        ) : (
          filtered.map((review) => (
            <ReviewCard key={review.id} review={review} onReplied={handleReplied} />
          ))
        )}
      </div>
    </div>
  );
}

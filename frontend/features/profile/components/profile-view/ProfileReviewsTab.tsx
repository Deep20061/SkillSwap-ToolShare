"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { resolveAvatarSrc } from "@/lib/utils";
import { Avatar } from "@/features/profile/components/Avatar";

interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: {
    id: string;
    name: string | null;
    image: string | null;
    profile: { avatarUrl: string | null } | null;
  };
}

interface ReviewsPage {
  reviews: ReviewItem[];
  nextCursor: string | null;
}

function StarDisplay({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <span className="flex items-center gap-0.5" style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= rating ? "text-amber-400" : "text-line"}>
          ★
        </span>
      ))}
    </span>
  );
}

function RatingSummary({
  rating,
  reviewCount,
  distribution,
}: {
  rating: number | null | undefined;
  reviewCount: number;
  distribution: Record<number, number>;
}) {
  const displayRating = rating != null ? rating.toFixed(1) : "—";

  return (
    <aside className="self-start rounded-2xl border border-line bg-surface p-5">
      <div className="text-5xl font-extrabold leading-none text-ink">{displayRating}</div>
      <div className="mt-2">
        <StarDisplay rating={Math.round(rating ?? 0)} size={16} />
      </div>
      <div className="mt-2 text-sm text-ink2">{reviewCount} reviews</div>
      <div className="mt-4 space-y-2">
        {[5, 4, 3, 2, 1].map((n) => {
          const count = distribution[n] ?? 0;
          const pct = reviewCount > 0 ? Math.round((count / reviewCount) * 100) : 0;
          return (
            <div key={n} className="flex items-center gap-2 text-xs">
              <span className="w-3 font-mono text-ink3">{n}</span>
              <span className="text-amber-400" style={{ fontSize: 10 }}>★</span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                <span
                  className="block h-full rounded-full bg-amber-400"
                  style={{ width: `${pct}%` }}
                />
              </span>
              <span className="w-6 text-right font-mono text-ink3">{pct}%</span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

interface ProfileReviewsTabProps {
  userId: string;
  rating: number | null | undefined;
  reviewCount: number;
}

export function ProfileReviewsTab({ userId, rating, reviewCount }: ProfileReviewsTabProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchPage = useCallback(
    async (cursor?: string) => {
      const url = cursor
        ? `api/reviews/user/${userId}?cursor=${encodeURIComponent(cursor)}`
        : `api/reviews/user/${userId}`;
      return api.get(url).json<ReviewsPage>();
    },
    [userId],
  );

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setReviews([]);
    setNextCursor(null);
    fetchPage()
      .then((page) => {
        setReviews(page.reviews);
        setNextCursor(page.nextCursor);
      })
      .catch(() => setReviews([]))
      .finally(() => setIsLoading(false));
  }, [fetchPage, userId]);

  async function loadMore() {
    if (!nextCursor) return;
    setIsLoadingMore(true);
    try {
      const page = await fetchPage(nextCursor);
      setReviews((prev) => [...prev, ...page.reviews]);
      setNextCursor(page.nextCursor);
    } catch {
      // keep existing reviews on error
    } finally {
      setIsLoadingMore(false);
    }
  }

  // Build per-star distribution from loaded reviews as an approximation
  const distribution = reviews.reduce<Record<number, number>>((acc, r) => {
    acc[r.rating] = (acc[r.rating] ?? 0) + 1;
    return acc;
  }, {});

  if (isLoading) {
    return <div className="py-16 text-center text-sm text-ink3">Loading reviews…</div>;
  }

  if (reviews.length === 0) {
    return <div className="py-16 text-center text-sm text-ink3">No reviews yet.</div>;
  }

  return (
    <div className="grid gap-6 md:grid-cols-[260px_minmax(0,1fr)]">
      <RatingSummary rating={rating} reviewCount={reviewCount} distribution={distribution} />

      <div className="space-y-3">
        {reviews.map((review) => {
          const avatarSrc = resolveAvatarSrc(review.reviewer.profile, review.reviewer.image);
          const name = review.reviewer.name ?? "Anonymous";
          const date = new Date(review.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });

          return (
            <div key={review.id} className="rounded-xl border border-line bg-surface p-5">
              <div className="mb-3 flex items-start gap-3">
                <Avatar src={avatarSrc} name={name} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-ink">{name}</span>
                    <span className="font-mono text-[10px] text-ink3">{date}</span>
                  </div>
                </div>
                <StarDisplay rating={review.rating} size={13} />
              </div>
              {review.comment && (
                <p className="text-sm leading-relaxed text-ink2">{review.comment}</p>
              )}
            </div>
          );
        })}

        {nextCursor && (
          <button
            type="button"
            onClick={loadMore}
            disabled={isLoadingMore}
            className="w-full rounded-lg border border-line py-2 text-sm text-ink2 hover:text-ink disabled:opacity-50"
          >
            {isLoadingMore ? "Loading…" : "Load more reviews"}
          </button>
        )}
      </div>
    </div>
  );
}

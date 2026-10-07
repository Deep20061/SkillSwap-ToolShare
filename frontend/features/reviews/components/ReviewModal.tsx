"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { cx } from "@/lib/utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
  revieweeName: string;
  onSuccess?: () => void;
}

export function ReviewModal({ isOpen, onClose, contractId, revieweeName, onSuccess }: Props) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit() {
    if (rating === 0) { setError("Please select a rating"); return; }
    setIsSubmitting(true);
    setError(null);
    try {
      await api.post("api/reviews", {
        json: { contractId, rating, comment: comment.trim() || undefined },
      });
      onSuccess?.();
      onClose();
    } catch {
      setError("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const displayed = hovered || rating;

  const labels: Record<number, string> = {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Great",
    5: "Excellent",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-sm rounded-2xl border border-line bg-surface shadow-2xl">
        {/* Header */}
        <div className="border-b border-line px-5 py-4">
          <h2 className="text-[14px] font-semibold text-ink">Leave a review</h2>
          <p className="mt-0.5 text-[12px] text-ink3">
            How was your exchange with <span className="font-medium text-ink">{revieweeName}</span>?
          </p>
          <p className="mt-1.5 text-[11px] text-ink3">
            Reviews are double-blind: yours stays hidden until {revieweeName} reviews you too —
            then both publish together.
          </p>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Stars */}
          <div>
            <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-ink3">Rating</div>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(star)}
                  className="text-[28px] leading-none transition-transform hover:scale-110 focus:outline-none"
                >
                  <span className={cx(
                    "transition-colors",
                    star <= displayed ? "text-amber-400" : "text-line",
                  )}>
                    ★
                  </span>
                </button>
              ))}
              {displayed > 0 && (
                <span className="ml-1 text-[12px] font-medium text-ink2">
                  {labels[displayed]}
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <div className="text-[11px] font-medium uppercase tracking-wider text-ink3">Comment</div>
              <span className="text-[10px] text-ink3">Optional</span>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="Describe your experience…"
              className="w-full resize-none rounded-lg border border-line bg-sunken px-3 py-2 text-[12.5px] text-ink placeholder-ink3 focus:outline-none focus:ring-1 focus:ring-brand-300"
            />
            <div className="mt-0.5 text-right font-mono text-[9.5px] text-ink3">
              {comment.length}/1000
            </div>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-600">
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="inline-flex h-8 items-center rounded-lg border border-line bg-surface px-4 text-[12px] font-medium text-ink hover:bg-sunken disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
            className={cx(
              "inline-flex h-8 items-center rounded-lg px-4 text-[12px] font-semibold transition-all",
              rating > 0 && !isSubmitting
                ? "bg-brand-600 text-white hover:bg-brand-700"
                : "cursor-not-allowed bg-line text-ink3",
            )}
          >
            {isSubmitting ? "Submitting…" : "Submit review"}
          </button>
        </div>
      </div>
    </div>
  );
}

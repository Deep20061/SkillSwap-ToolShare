"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { api, apiUrl, apiErrorMessage } from "@/lib/api";
import { X, ArrowSwap, Doc, ChevDown } from "@/components/ui/Icons";
import { getSwatch, cx } from "@/lib/utils";
import type { SerializedContract } from "../types";

interface MyListing {
  id: string;
  title: string;
  type: string;
  coverImage?: string | null;
}

function ListingSwatch({ listing }: { listing: MyListing | undefined }) {
  if (!listing) return null;
  if (listing.coverImage) {
    return (
      <Image
        src={`${apiUrl}${listing.coverImage}`}
        alt={listing.title}
        width={28}
        height={28}
        className="h-7 w-7 shrink-0 rounded-md object-cover"
        unoptimized
      />
    );
  }
  const sw = getSwatch(listing.id);
  return <div className={cx("h-7 w-7 shrink-0 rounded-md", sw?.block ?? "bg-sunken")} />;
}

/**
 * Searchable single-select for listings. Shows the selected listing (swatch + title) in the
 * trigger and opens a filterable popover. Everything truncates, so long titles never overflow.
 */
function ListingPicker({
  value,
  options,
  placeholder,
  emptyLabel,
  highlight = false,
  onChange,
}: {
  value: string;
  options: MyListing[];
  placeholder: string;
  emptyLabel: string;
  highlight?: boolean;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.id === value);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const q = query.trim().toLowerCase();
  const filtered = q ? options.filter((o) => o.title.toLowerCase().includes(q)) : options;

  const choose = (id: string) => {
    onChange(id);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cx(
          "flex w-full min-w-0 items-center gap-2 rounded-lg border py-1.5 pl-2.5 pr-2 text-[12px] transition-colors focus:outline-none focus:ring-2 focus:ring-brand-200",
          open ? "border-brand-400 ring-2 ring-brand-200" : "border-line hover:border-line2",
          selected && highlight ? "bg-brand-50" : "bg-surface",
        )}
      >
        {selected && <ListingSwatch listing={selected} />}
        <span
          className={cx(
            "min-w-0 flex-1 truncate text-left",
            selected ? "font-medium text-ink" : "text-ink3",
          )}
        >
          {selected ? selected.title : placeholder}
        </span>
        <ChevDown size={14} className="shrink-0 text-ink3" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 z-20 mt-1 overflow-hidden rounded-lg border border-line bg-surface shadow-pop">
          <div className="border-b border-line p-1.5">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search listings…"
              className="w-full rounded-md border border-line bg-surface px-2 py-1 text-[12px] text-ink placeholder:text-ink3 focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-200"
            />
          </div>
          <div className="max-h-44 overflow-y-auto py-1">
            <button
              type="button"
              onClick={() => choose("")}
              className="flex w-full items-center px-2.5 py-1.5 text-left text-[12px] text-ink3 hover:bg-sunken"
            >
              {emptyLabel}
            </button>
            {filtered.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => choose(o.id)}
                className={cx(
                  "flex w-full min-w-0 items-center gap-2 px-2.5 py-1.5 text-left text-[12px] hover:bg-sunken",
                  o.id === value ? "bg-sunken/60 text-brand-700" : "text-ink",
                )}
              >
                <ListingSwatch listing={o} />
                <span className="min-w-0 flex-1 truncate">{o.title}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="px-2.5 py-2 text-center text-[11px] text-ink3">No matches</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function ProposeModal({
  conversationId,
  otherUserId,
  contextListingId,
  onClose,
  onSuccess,
  suggestedStart,
  suggestedEnd,
}: {
  conversationId: string;
  otherUserId: string;
  /** The conversation's context listing. Pre-filled into "Your offer" if it's mine, else "Their listing". */
  contextListingId?: string | null;
  onClose: () => void;
  onSuccess: (contract: SerializedContract) => void;
  suggestedStart?: string;
  suggestedEnd?: string;
}) {
  const [myListings, setMyListings] = useState<MyListing[]>([]);
  const [theirListings, setTheirListings] = useState<MyListing[]>([]);
  const [listingId, setListingId] = useState("");
  const [counterListingId, setCounterListingId] = useState("");
  const [scheduledStart, setScheduledStart] = useState(suggestedStart ?? "");
  const [scheduledEnd, setScheduledEnd] = useState(suggestedEnd ?? "");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get("api/listings/me/listings").json<{ listings: MyListing[] }>().then((d) => d.listings).catch(() => []),
      api.get(`api/listings?userId=${otherUserId}&limit=50`).json<{ items: MyListing[] }>().then((d) => d.items).catch(() => []),
    ]).then(([mine, theirs]) => {
      setMyListings(mine);
      setTheirListings(theirs);
      // Drop the context listing onto the correct side: if I own it, it's my offer;
      // if the other party owns it, it's their listing. (The owner sees it pre-filled either way.)
      if (!contextListingId) return;
      if (mine.some((l) => l.id === contextListingId)) {
        setListingId((prev) => prev || contextListingId);
      } else if (theirs.some((l) => l.id === contextListingId)) {
        setCounterListingId((prev) => prev || contextListingId);
      }
    });
  }, [otherUserId, contextListingId]);

  const minDatetime = new Date().toISOString().slice(0, 16);
  const isPreFilled = !!(suggestedStart || suggestedEnd);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const now = new Date();
    if (!listingId) { setError("Select your listing"); return; }
    if (scheduledStart && new Date(scheduledStart) <= now) {
      setError("Start date must be in the future"); return;
    }
    if (scheduledEnd && new Date(scheduledEnd) <= now) {
      setError("End date must be in the future"); return;
    }
    if (scheduledStart && scheduledEnd && new Date(scheduledEnd) <= new Date(scheduledStart)) {
      setError("End date must be after start date"); return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const body: Record<string, unknown> = { listingId };
      if (counterListingId) body.counterListingId = counterListingId;
      if (scheduledStart) body.scheduledStart = new Date(scheduledStart).toISOString();
      if (scheduledEnd) body.scheduledEnd = new Date(scheduledEnd).toISOString();
      if (message.trim()) body.message = message.trim();

      const result = await api
        .post(`api/conversations/${conversationId}/contracts`, { json: body })
        .json<SerializedContract>();
      onSuccess(result);
    } catch (err) {
      setError(await apiErrorMessage(err, "Failed to propose contract. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-xl border border-line bg-surface shadow-pop">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-ink">
            <Doc size={14} className="text-brand-600" />
            Propose exchange terms
          </span>
          <button
            onClick={onClose}
            className="inline-flex h-6 w-6 items-center justify-center rounded text-ink3 hover:bg-sunken"
          >
            <X size={13} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          {/* Exchange layout — two searchable listing pickers side by side */}
          <div>
            <div className="mb-2 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
              <span className="font-mono text-[9.5px] uppercase tracking-wider text-ink3">Your offer</span>
              <span />
              <span className="font-mono text-[9.5px] uppercase tracking-wider text-ink3">Their listing</span>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
              <ListingPicker
                value={listingId}
                options={myListings}
                placeholder="Select a listing…"
                emptyLabel="No offer"
                highlight
                onChange={setListingId}
              />
              <div className="flex items-center justify-center text-ink3">
                <ArrowSwap size={16} />
              </div>
              <ListingPicker
                value={counterListingId}
                options={theirListings}
                placeholder="None"
                emptyLabel="None"
                onChange={setCounterListingId}
              />
            </div>
          </div>

          {/* When */}
          <div>
            <label className="mb-1.5 block font-mono text-[9.5px] uppercase tracking-wider text-ink3">
              When <span className="normal-case tracking-normal text-ink3">(optional)</span>
            </label>
            {isPreFilled && (
              <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-md border border-brand-200 bg-brand-50 px-2 py-1 text-[11px] text-brand-700">
                <span>Pre-filled from proposed times</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block font-mono text-[9px] uppercase tracking-wider text-ink3">Start</label>
                <input
                  type="datetime-local"
                  value={scheduledStart}
                  min={minDatetime}
                  onChange={(e) => setScheduledStart(e.target.value)}
                  className="w-full rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[12px] text-ink transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                />
              </div>
              <div>
                <label className="mb-1 block font-mono text-[9px] uppercase tracking-wider text-ink3">End</label>
                <input
                  type="datetime-local"
                  value={scheduledEnd}
                  min={scheduledStart || minDatetime}
                  onChange={(e) => setScheduledEnd(e.target.value)}
                  className="w-full rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[12px] text-ink transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
                />
              </div>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="mb-1 block font-mono text-[9.5px] uppercase tracking-wider text-ink3">
              Message <span className="normal-case tracking-normal text-ink3">(optional)</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="Describe the terms of the exchange…"
              className="w-full resize-none rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[12px] text-ink placeholder:text-ink3 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
            />
          </div>

          {error && (
            <p className="text-[11px] text-rose-500">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 items-center rounded-lg border border-line bg-surface px-3 text-[12px] font-medium text-ink transition-colors hover:bg-sunken"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-8 items-center rounded-lg bg-brand-600 px-3 text-[12px] font-medium text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
            >
              {submitting ? "Proposing…" : "Propose exchange"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function CancelModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-xs rounded-xl border border-line bg-surface shadow-pop">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <span className="text-[13px] font-semibold text-ink">Cancel contract</span>
          <button onClick={onClose} className="inline-flex h-6 w-6 items-center justify-center rounded text-ink3 hover:bg-sunken">
            <X size={13} />
          </button>
        </div>
        <div className="px-4 py-3 space-y-3">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Reason for cancellation (optional)…"
            className="w-full resize-none rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[12px] text-ink placeholder:text-ink3 transition-colors focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="inline-flex h-8 items-center rounded-lg border border-line bg-surface px-3 text-[12px] font-medium text-ink transition-colors hover:bg-sunken">
              Back
            </button>
            <button
              onClick={() => onConfirm(reason)}
              className="inline-flex h-8 items-center rounded-lg bg-rose-600 px-3 text-[12px] font-medium text-white transition-colors hover:bg-rose-700"
            >
              Confirm cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

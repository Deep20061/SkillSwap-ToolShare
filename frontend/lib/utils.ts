import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { apiUrl } from "@/lib/api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── cx — lightweight class joiner (no merging) ───────────────────────────────
// Use `cn` when you need Tailwind conflict-resolution; use `cx` for simple
// conditional joins (cheaper, no clsx/twMerge overhead).
export function cx(...args: (string | boolean | undefined | null)[]): string {
  return args.filter(Boolean).join(" ");
}

// ── Shared input / textarea class strings ────────────────────────────────────

/** Standard single-line input */
export const inputCls =
  "w-full h-10 rounded-lg bg-surface border border-line2 text-sm text-ink px-3 " +
  "focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 " +
  "transition-colors placeholder-ink3";

/** Input variant that highlights validation errors */
export const inputErrCls =
  "w-full h-10 rounded-lg bg-surface border border-rose-400 text-sm text-ink px-3 " +
  "focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400 " +
  "transition-colors placeholder-ink3";

/** Multi-line textarea */
export const textareaCls =
  "w-full rounded-lg bg-surface border border-line2 text-sm text-ink p-3 " +
  "placeholder-ink3 focus:outline-none focus:ring-2 focus:ring-brand-200 " +
  "focus:border-brand-400 resize-y";

// ── Listing card colour swatches ──────────────────────────────────────────────

const SWATCHES = [
  { block: "bg-amber-200", bar: "from-amber-200 to-amber-400" },
  { block: "bg-emerald-200", bar: "from-emerald-200 to-emerald-400" },
  { block: "bg-violet-200", bar: "from-violet-200 to-violet-400" },
  { block: "bg-rose-200", bar: "from-rose-200 to-rose-400" },
  { block: "bg-sky-200", bar: "from-sky-200 to-sky-400" },
  { block: "bg-orange-200", bar: "from-orange-200 to-orange-400" },
  { block: "bg-teal-200", bar: "from-teal-200 to-teal-400" },
  { block: "bg-indigo-200", bar: "from-indigo-200 to-indigo-400" },
];

/** Returns a deterministic swatch pair for a listing id. */
export function getSwatch(id: string): { block: string; bar: string } {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return SWATCHES[hash % SWATCHES.length];
}

// ── Avatar URL resolution ─────────────────────────────────────────────────────

/** Resolves the display avatar URL, preferring the profile's uploaded avatar over the OAuth image. */
export function resolveAvatarSrc(
  profile: { avatarUrl: string | null } | null | undefined,
  image: string | null | undefined,
): string | null {
  if (profile?.avatarUrl) return `${apiUrl}${profile.avatarUrl}`;
  return image ?? null;
}

// ── timeAgo ───────────────────────────────────────────────────────────────────

/** Converts an ISO date string to a human-readable "time ago" label. */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

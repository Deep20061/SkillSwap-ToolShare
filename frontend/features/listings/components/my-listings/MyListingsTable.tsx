"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Hand, Tools, Edit, Pause, Play, Trash } from "@/components/ui/Icons";
import { ListingTypeBadge } from "@/features/listings/components/ListingTypeBadge";
import { api, apiUrl, apiErrorMessage } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";
import { cx, timeAgo } from "@/lib/utils";
import type { MyListing } from "@/features/listings/hooks/useMyListings";

interface MyListingsTableProps {
  listings: MyListing[];
  isLoading: boolean;
  /** Reload the list after a status change or delete. */
  onChanged: () => void | Promise<void>;
}

export function MyListingsTable({ listings, isLoading, onChanged }: MyListingsTableProps) {
  const [busyId, setBusyId] = useState<string | null>(null);

  async function toggleStatus(l: MyListing) {
    const next = l.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
    setBusyId(l.id);
    try {
      await api.patch(`api/listings/${l.id}`, { json: { status: next } });
      await onChanged();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Couldn't update listing",
        description: await apiErrorMessage(err, "Please try again."),
      });
    } finally {
      setBusyId(null);
    }
  }

  async function remove(l: MyListing) {
    if (!window.confirm(`Delete "${l.title}"? This can't be undone.`)) return;
    setBusyId(l.id);
    try {
      await api.delete(`api/listings/${l.id}`);
      await onChanged();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Couldn't delete listing",
        description: await apiErrorMessage(err, "Please try again."),
      });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      {isLoading ? (
        <div className="animate-pulse py-16 text-center font-mono text-sm text-ink3">Loading…</div>
      ) : listings.length === 0 ? (
        <div className="py-16 text-center">
          <p className="mb-3 text-sm text-ink3">No listings found.</p>
          <Link
            href="/listings/new"
            className="text-sm text-brand-600 no-underline hover:underline"
          >
            Post your first listing →
          </Link>
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-sunken">
            <tr className="font-mono text-[11px] uppercase tracking-wider text-ink3">
              <th className="p-3 text-left">Listing</th>
              <th className="hidden p-3 text-left md:table-cell">Status</th>
              <th className="hidden p-3 text-left md:table-cell">Views</th>
              <th className="hidden p-3 text-left md:table-cell">Posted</th>
              <th className="p-3 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {listings.map((l) => {
              const isSkill = l.type === "SKILL_OFFER";
              const thumb = l.media[0];
              const isActive = l.status === "ACTIVE";
              const busy = busyId === l.id;
              return (
                <tr key={l.id} className="hover:bg-sunken/60">
                  <td className="p-3">
                    <Link
                      href={`/listings/${l.id}`}
                      className="flex items-center gap-3 text-left no-underline"
                    >
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border border-line bg-sunken">
                        {thumb ? (
                          <Image
                            src={`${apiUrl}${thumb.path}`}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-ink3">
                            {isSkill ? <Hand size={16} /> : <Tools size={16} />}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="max-w-[280px] truncate text-sm font-medium text-ink">
                          {l.title}
                        </div>
                        <div className="mt-0.5 text-xs text-ink3">
                          <ListingTypeBadge
                            type={l.type}
                            iconSize={9}
                            className="inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium"
                          />
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="hidden p-3 md:table-cell">
                    <span
                      className={cx(
                        "inline-flex rounded-md border px-2 py-0.5 text-[11px]",
                        l.status === "ACTIVE"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : l.status === "PAUSED"
                            ? "border-amber-200 bg-amber-50 text-amber-700"
                            : "border-line bg-sunken text-ink3"
                      )}
                    >
                      {l.status.toLowerCase()}
                    </span>
                  </td>
                  <td className="hidden p-3 text-ink2 md:table-cell">{l.viewCount}</td>
                  <td className="hidden p-3 text-xs text-ink3 md:table-cell">
                    {timeAgo(l.createdAt)}
                  </td>
                  <td className="p-3 text-right">
                    <div className="inline-flex items-center gap-0.5">
                      <Link
                        href={`/listings/${l.id}?edit=1`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink3 no-underline hover:bg-sunken hover:text-ink"
                        title="Edit listing"
                        aria-label="Edit listing"
                      >
                        <Edit size={14} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggleStatus(l)}
                        disabled={busy}
                        title={isActive ? "Pause listing" : "Resume listing"}
                        aria-label={isActive ? "Pause listing" : "Resume listing"}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink3 hover:bg-sunken hover:text-ink disabled:opacity-50"
                      >
                        {isActive ? <Pause size={14} /> : <Play size={14} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(l)}
                        disabled={busy}
                        title="Delete listing"
                        aria-label="Delete listing"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-ink3 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

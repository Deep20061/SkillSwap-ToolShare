"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppFooter } from "@/components/AppFooter";
import { Heart } from "@/components/ui/Icons";
import { PageHeader } from "@/components/ui/PageHeader";
import { api } from "@/lib/api";
import type { Listing, SavedListingsResponse } from "@/features/listings/types";
import { ListingCard } from "@/features/listings/components/ListingCard";

export default function SavedPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("api/listings/saved")
      .json<SavedListingsResponse>()
      .then((d) => setListings(d.listings))
      .catch(() => setError("Failed to load saved listings."))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-full bg-surface">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-6 md:py-8 lg:px-8">
        <PageHeader
          kicker="Saved"
          title="Saved listings"
          desc="Listings you've hearted to come back to."
        />

        {isLoading && (
          <div className="py-20 text-center font-mono text-sm text-ink3 animate-pulse">
            Loading…
          </div>
        )}

        {!isLoading && error && (
          <div className="py-20 text-center text-sm text-ink2">{error}</div>
        )}

        {!isLoading && !error && listings.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-sunken text-ink3">
              <Heart size={24} />
            </div>
            <div>
              <div className="mb-1 font-semibold text-ink">Nothing saved yet</div>
              <p className="max-w-sm text-sm text-ink2">
                Tap the heart icon on any listing to save it here. Great for shortlisting before you
                reach out.
              </p>
            </div>
            <Link
              href="/listings"
              className="inline-flex h-9 items-center rounded-lg bg-ink px-4 text-sm font-medium text-surface no-underline transition-opacity hover:opacity-90"
            >
              Browse listings
            </Link>
          </div>
        )}

        {!isLoading && !error && listings.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
      <AppFooter />
    </div>
  );
}

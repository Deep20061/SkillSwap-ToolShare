"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { Listing } from "@/features/listings/types";
import type { ProfileTab } from "../components/profile-view/constants";

export function useProfileListings(userId: string, tab: ProfileTab) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [listingsLoading, setListingsLoading] = useState(false);

  const fetchListings = useCallback(async () => {
    if (tab !== "listings") return;
    setListingsLoading(true);
    try {
      const res = await api
        .get(`api/listings`, { searchParams: { userId, status: "ACTIVE", limit: "50" } })
        .json<{ items: Listing[] }>();
      setListings(res.items);
    } catch {
      setListings([]);
    } finally {
      setListingsLoading(false);
    }
  }, [userId, tab]);

  useEffect(() => {
    void fetchListings();
  }, [fetchListings]);

  return { listings, listingsLoading };
}

"use client";

import { useState, useCallback, useEffect } from "react";
import { api } from "@/lib/api";

export type MyListing = {
  id: string;
  type: "SKILL_OFFER" | "TOOL_LISTING";
  title: string;
  status: "ACTIVE" | "PAUSED" | "ARCHIVED";
  viewCount: number;
  createdAt: string;
  tags: string[];
  media: { path: string }[];
};

export function useMyListings(view: string) {
  const [myListings, setMyListings] = useState<MyListing[]>([]);
  const [myListingsLoading, setMyListingsLoading] = useState(false);

  const loadMyListings = useCallback(async () => {
    setMyListingsLoading(true);
    try {
      const res = await api.get("api/listings/me/listings").json<{ listings: MyListing[] }>();
      setMyListings(res.listings);
    } catch {
      setMyListings([]);
    } finally {
      setMyListingsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (view === "listings") loadMyListings();
  }, [view, loadMyListings]);

  return { myListings, myListingsLoading, loadMyListings };
}

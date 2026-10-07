"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useDebounce } from "@/lib/useDebounce";
import type { Listing, ListingsResponse, ListingType } from "@/features/listings/types";

export function useListings(opts?: { userLat?: number | null; userLng?: number | null }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const typeParam = searchParams.get("type") as ListingType | null;
  const qParam = searchParams.get("q") ?? "";
  const tagParam = searchParams.get("tag") ?? "";
  const categoryParam = searchParams.get("categoryId") ?? undefined;

  const [listings, setListings] = useState<Listing[]>([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<ListingType | "">(typeParam ?? "");
  const [query, setQuery] = useState(qParam);
  const [selectedTag, setSelectedTag] = useState(tagParam);
  const [tagInput, setTagInput] = useState(tagParam);
  const [page, setPage] = useState(1);
  const tagInputRef = useRef<HTMLInputElement>(null);

  const [categoryId, setCategoryId] = useState<string | undefined>(categoryParam);

  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [superHostOnly, setSuperHostOnly] = useState(false);
  const [minDeposit, setMinDeposit] = useState<string>("");
  const [maxDeposit, setMaxDeposit] = useState<string>("");
  const [distanceKm, setDistanceKm] = useState<number | undefined>(undefined);
  const debouncedQuery = useDebounce(query, 250);
  const debouncedDistanceKm = useDebounce(distanceKm, 400);

  useEffect(() => {
    setSelectedType(typeParam ?? "");
    setPage(1);
  }, [typeParam]);
  useEffect(() => {
    setSelectedTag(tagParam);
    setTagInput(tagParam);
    setPage(1);
  }, [tagParam]);
  useEffect(() => {
    setQuery(qParam);
    setPage(1);
  }, [qParam]);
  useEffect(() => {
    setCategoryId(categoryParam);
    setPage(1);
  }, [categoryParam]);

  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (selectedType) params.set("type", selectedType);
      if (debouncedQuery.trim()) params.set("q", debouncedQuery.trim());
      if (selectedTag.trim()) params.set("tag", selectedTag.trim());
      if (categoryId) params.set("categoryId", categoryId);
      if (verifiedOnly) params.set("verifiedOnly", "true");
      if (superHostOnly) params.set("superHostOnly", "true");
      if (minDeposit.trim()) params.set("minDeposit", minDeposit.trim());
      if (maxDeposit.trim()) params.set("maxDeposit", maxDeposit.trim());
      if (debouncedDistanceKm !== undefined && opts?.userLat != null && opts?.userLng != null) {
        params.set("userLat", String(opts.userLat));
        params.set("userLng", String(opts.userLng));
        params.set("radiusKm", String(debouncedDistanceKm));
      }
      params.set("page", String(page));
      params.set("limit", "20");

      const data = await api.get(`api/listings?${params.toString()}`).json<ListingsResponse>();
      setListings(data.items);
      setPagination({
        page: data.pagination.page,
        pages: data.pagination.pages,
        total: data.pagination.total,
      });
    } catch {
      setError("Failed to load listings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedType,
    debouncedQuery,
    selectedTag,
    categoryId,
    verifiedOnly,
    superHostOnly,
    minDeposit,
    maxDeposit,
    debouncedDistanceKm,
    opts?.userLat,
    opts?.userLng,
    page,
  ]);

  useEffect(() => {
    void fetchListings();
  }, [fetchListings]);

  function handleTypeChange(t: ListingType | "") {
    setSelectedType(t);
    setPage(1);
    const params = new URLSearchParams(searchParams.toString());
    if (t) params.set("type", t);
    else params.delete("type");
    router.push(`/listings?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) params.set("q", query.trim());
    else params.delete("q");
    params.delete("page");
    router.push(`/listings?${params.toString()}`);
  }

  function handleTagSearch(e: React.FormEvent) {
    e.preventDefault();
    setSelectedTag(tagInput.trim());
    setPage(1);
  }

  function clearTag() {
    setSelectedTag("");
    setTagInput("");
    setPage(1);
  }

  function clearAll() {
    setSelectedType("");
    setQuery("");
    setSelectedTag("");
    setTagInput("");
    setCategoryId(undefined);
    setVerifiedOnly(false);
    setSuperHostOnly(false);
    setMinDeposit("");
    setMaxDeposit("");
    setDistanceKm(undefined);
    setPage(1);
    router.push("/listings");
  }

  const hasFilters =
    selectedType !== "" ||
    query.trim() !== "" ||
    selectedTag.trim() !== "" ||
    !!categoryId ||
    verifiedOnly ||
    superHostOnly ||
    minDeposit.trim() !== "" ||
    maxDeposit.trim() !== "" ||
    distanceKm !== undefined;

  return {
    listings,
    pagination,
    isLoading,
    error,
    selectedType,
    query,
    setQuery,
    selectedTag,
    tagInput,
    setTagInput,
    page,
    setPage,
    tagInputRef,
    hasFilters,
    handleTypeChange,
    handleSearch,
    handleTagSearch,
    clearTag,
    clearAll,
    fetchListings,
    categoryId,
    setCategoryId,
    verifiedOnly,
    setVerifiedOnly,
    superHostOnly,
    setSuperHostOnly,
    minDeposit,
    setMinDeposit,
    maxDeposit,
    setMaxDeposit,
    distanceKm,
    setDistanceKm,
  };
}

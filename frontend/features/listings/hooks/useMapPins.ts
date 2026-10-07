"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { useDebounce } from "@/lib/useDebounce";
import type { ListingType } from "@/features/listings/types";

export interface MapPin {
  id: string;
  title: string;
  type: ListingType;
  latitude: number;
  longitude: number;
  locationName: string | null;
  thumbnailPath: string | null;
}

interface MapPinFilters {
  selectedType: ListingType | "";
  query: string;
  selectedTag: string;
  categoryId?: string;
  verifiedOnly: boolean;
  superHostOnly: boolean;
  distanceKm?: number;
  userLat?: number | null;
  userLng?: number | null;
}

function bboxEqual(
  a: { minLat: number; maxLat: number; minLng: number; maxLng: number } | null,
  b: { minLat: number; maxLat: number; minLng: number; maxLng: number } | null
): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.minLat === b.minLat && a.maxLat === b.maxLat && a.minLng === b.minLng && a.maxLng === b.maxLng
  );
}

/**
 * Fetches lightweight pin data for map rendering from GET /api/listings/map.
 * Keeps its own bbox state so it never pollutes the grid view's fetch.
 */
export function useMapPins(filters: MapPinFilters) {
  const [pins, setPins] = useState<MapPin[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedDistanceKm = useDebounce(filters.distanceKm, 400);

  // Bbox lives here — completely isolated from useListings
  const bboxRef = useRef<{ minLat: number; maxLat: number; minLng: number; maxLng: number } | null>(
    null
  );
  const [bboxVersion, setBboxVersion] = useState(0);

  const setBbox = useCallback(
    (next: { minLat: number; maxLat: number; minLng: number; maxLng: number } | null) => {
      if (!bboxEqual(bboxRef.current, next)) {
        bboxRef.current = next;
        setBboxVersion((v) => v + 1);
      }
    },
    []
  );

  const fetchPins = useCallback(async () => {
    const bbox = bboxRef.current;
    // Don't fetch until the map has reported its bounds
    if (!bbox) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.selectedType) params.set("type", filters.selectedType);
      if (filters.query.trim()) params.set("q", filters.query.trim());
      if (filters.selectedTag.trim()) params.set("tag", filters.selectedTag.trim());
      if (filters.categoryId) params.set("categoryId", filters.categoryId);
      if (filters.verifiedOnly) params.set("verifiedOnly", "true");
      if (filters.superHostOnly) params.set("superHostOnly", "true");
      if (debouncedDistanceKm !== undefined && filters.userLat != null && filters.userLng != null) {
        params.set("userLat", String(filters.userLat));
        params.set("userLng", String(filters.userLng));
        params.set("radiusKm", String(debouncedDistanceKm));
      }
      params.set("minLat", String(bbox.minLat));
      params.set("maxLat", String(bbox.maxLat));
      params.set("minLng", String(bbox.minLng));
      params.set("maxLng", String(bbox.maxLng));

      const data = await api
        .get(`api/listings/map?${params.toString()}`)
        .json<{ pins: MapPin[] }>();
      setPins(data.pins);
    } catch {
      // Non-fatal — stale pins are fine
    } finally {
      setIsLoading(false);
    }
    // bboxVersion is the stable reactive trigger; actual value is read from the ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    bboxVersion,
    filters.selectedType,
    filters.query,
    filters.selectedTag,
    filters.categoryId,
    filters.verifiedOnly,
    filters.superHostOnly,
    debouncedDistanceKm,
    filters.userLat,
    filters.userLng,
  ]);

  useEffect(() => {
    void fetchPins();
  }, [fetchPins]);

  return { pins, isLoading, setBbox };
}

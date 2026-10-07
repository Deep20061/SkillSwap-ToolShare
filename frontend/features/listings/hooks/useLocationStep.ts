"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { useGeolocation } from "@/features/listings/hooks/useGeolocation";

async function reverseGeocodeNeighbourhood(lat: number, lng: number): Promise<string | null> {
  try {
    // zoom=10 → Nominatim returns city/neighbourhood level, never a street address
    const data = await api
      .get(`api/geocode?lat=${lat}&lng=${lng}&zoom=10`)
      .json<{ locationName: string | null }>();
    return data.locationName ?? null;
  } catch {
    return null;
  }
}

/**
 * Shared hook for the "Where is it?" step.
 *
 * - Wires geolocation → auto reverse-geocode (neighbourhood only) → location name field
 * - Stores exact coords — the backend fuzzes coordinates server-side for other users.
 * - Always exposes `previewLat`/`previewLng` (exact) so the live map is accurate.
 */
export function useLocationStep(opts: {
  setLatitude: (v: number | null) => void;
  setLongitude: (v: number | null) => void;
  setLocationName: (v: string) => void;
  locationName: string;
}) {
  const geo = useGeolocation();
  const [reverseLoading, setReverseLoading] = useState(false);

  // Exact coords from whichever source set them (geo or map click)
  const [exactLat, setExactLat] = useState<number | null>(null);
  const [exactLng, setExactLng] = useState<number | null>(null);

  // When geo resolves, update exact coords + reverse geocode for the name
  useEffect(() => {
    if (geo.lat === null || geo.lng === null) return;

    setExactLat(geo.lat);
    setExactLng(geo.lng);

    // Only auto-fill the name if the user hasn't typed anything yet
    if (opts.locationName.trim() !== "") return;

    setReverseLoading(true);
    reverseGeocodeNeighbourhood(geo.lat, geo.lng).then((name) => {
      if (name) opts.setLocationName(name);
      setReverseLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo.lat, geo.lng]);

  // Pass exact coords to the form — backend fuzzes on read for other users
  useEffect(() => {
    opts.setLatitude(exactLat);
    opts.setLongitude(exactLng);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exactLat, exactLng]);

  const handleLocationResult = useCallback(
    (lat: number, lng: number, name: string) => {
      setExactLat(lat);
      setExactLng(lng);
      opts.setLocationName(name);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return {
    geo,
    previewLat: exactLat,
    previewLng: exactLng,
    reverseLoading,
    handleLocationResult,
  };
}

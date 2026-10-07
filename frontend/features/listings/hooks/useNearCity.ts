"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

/** Reverse-geocodes user coordinates once to a short city label for browse headers. */
export function useNearCity(lat: number | null, lng: number | null) {
  const [nearCity, setNearCity] = useState<string | null>(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (lat == null || lng == null || fetched.current) return;
    fetched.current = true;
    api
      .get(`api/geocode?lat=${lat}&lng=${lng}&zoom=10`)
      .json<{ locationName: string | null }>()
      .then((response) => {
        if (response.locationName) {
          setNearCity(response.locationName.split(",")[0].trim());
        }
      })
      .catch(() => {});
  }, [lat, lng]);

  return nearCity;
}

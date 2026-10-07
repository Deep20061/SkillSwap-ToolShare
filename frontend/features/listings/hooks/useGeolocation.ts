"use client";
import { useState, useEffect, useCallback } from "react";

const CACHE_KEY = "geo_cache";
const CACHE_TTL = 5 * 60 * 1000;

// Computed once — geolocation support is a static browser capability.
const GEO_SUPPORTED = typeof navigator !== "undefined" && "geolocation" in navigator;

type GeoState = {
  lat: number | null;
  lng: number | null;
  loading: boolean;
  error: string | null;
  supported: boolean;
};

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({
    lat: null,
    lng: null,
    loading: false,
    error: null,
    supported: GEO_SUPPORTED,
  });

  const request = useCallback(() => {
    if (!GEO_SUPPORTED) return;
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw) as { lat: number; lng: number; ts: number };
        if (Date.now() - cached.ts < CACHE_TTL) {
          setState((s) => ({ ...s, lat: cached.lat, lng: cached.lng }));
          return;
        }
      }
    } catch {}

    setState((s) => ({ ...s, loading: true, error: null }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ lat, lng, ts: Date.now() }));
        } catch {}
        setState({ lat, lng, loading: false, error: null, supported: true });
      },
      (err) => {
        const msg =
          err.code === 1
            ? "Location access denied. Enable it in browser settings."
            : "Could not get your location. Try again.";
        setState((s) => ({ ...s, loading: false, error: msg }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  useEffect(() => {
    request();
  }, [request]);

  return { ...state, retry: request };
}

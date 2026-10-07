"use client";

import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";

export interface LocationResult {
  displayName: string;
  lat: number;
  lng: number;
}

export function useLocationSearch(query: string) {
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api
          .get(`api/geocode/search?q=${encodeURIComponent(q)}`)
          .json<{ results: LocationResult[] }>();
        setResults(data.results);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  return { results, loading };
}

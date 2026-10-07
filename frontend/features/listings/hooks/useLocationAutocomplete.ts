"use client";

import { useState, useEffect, useRef } from "react";
import { useLocationSearch } from "@/features/listings/hooks/useLocationSearch";

/**
 * Location name text field + Nominatim suggestions dropdown for the create-listing wizard.
 */
export function useLocationAutocomplete(
  locationName: string,
  setLocationName: (value: string) => void
) {
  const [locationQuery, setLocationQuery] = useState(locationName);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { results: locationResults } = useLocationSearch(showSuggestions ? locationQuery : "");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocationQuery(locationName);
  }, [locationName]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function updateLocationQuery(value: string) {
    setLocationQuery(value);
    setLocationName(value);
    setShowSuggestions(true);
  }

  return {
    locationQuery,
    showSuggestions,
    setShowSuggestions,
    locationResults,
    wrapperRef,
    updateLocationQuery,
    setLocationQuery,
  };
}

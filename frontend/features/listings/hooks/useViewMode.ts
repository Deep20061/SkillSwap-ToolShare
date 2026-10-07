"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

type ViewMode = "grid" | "map";

export function useViewMode() {
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view");

  const [mode, setMode] = useState<ViewMode>(() => {
    // URL param takes priority
    if (viewParam === "map") return "map";
    return "grid";
  });

  // Sync when URL param changes (e.g. nav link)
  useEffect(() => {
    if (viewParam === "map") setMode("map");
  }, [viewParam]);

  function setAndPersist(m: ViewMode) {
    setMode(m);
  }

  return { mode, setMode: setAndPersist };
}

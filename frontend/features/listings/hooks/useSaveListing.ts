"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useSession } from "@/features/auth/hooks/useSession";

interface SaveState {
  isSaved: boolean;
  saveCount: number;
}

export function useSaveListing(listingId: string, initial: { isSaved?: boolean; saveCount: number }) {
  const router = useRouter();
  const { user } = useSession();
  const [isSaved, setIsSaved] = useState(initial.isSaved ?? false);
  const [saveCount, setSaveCount] = useState(initial.saveCount);
  const [isLoading, setIsLoading] = useState(false);

  async function toggle(e?: React.MouseEvent) {
    e?.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }
    if (isLoading) return;

    // Optimistic update
    const prevSaved = isSaved;
    const prevCount = saveCount;
    setIsSaved(!prevSaved);
    setSaveCount((c) => (prevSaved ? c - 1 : c + 1));
    setIsLoading(true);

    try {
      const res = await api.post(`api/listings/${listingId}/save`).json<SaveState>();
      setIsSaved(res.isSaved);
      setSaveCount(res.saveCount);
    } catch {
      setIsSaved(prevSaved);
      setSaveCount(prevCount);
    } finally {
      setIsLoading(false);
    }
  }

  return { isSaved, saveCount, toggle, isLoading };
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

export interface UserSettingsData {
  showLastName: boolean;
  showExactLocation: boolean;
  allowSearchIndexing: boolean;
  notificationPrefs: Record<string, boolean>;
}

export function useSettings() {
  const [settings, setSettings] = useState<UserSettingsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get("api/settings")
      .json<UserSettingsData>()
      .then(setSettings)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Optimistic: flip the toggle immediately, reconcile with the server response.
  const update = useCallback(async (patch: Partial<UserSettingsData>) => {
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            ...patch,
            notificationPrefs: { ...prev.notificationPrefs, ...(patch.notificationPrefs ?? {}) },
          }
        : prev,
    );
    try {
      const saved = await api.patch("api/settings", { json: patch }).json<UserSettingsData>();
      setSettings(saved);
      toast({ title: "Settings saved" });
    } catch {
      toast({ variant: "destructive", title: "Couldn't save settings", description: "Reverted — please try again." });
      // Re-sync — the optimistic state may be wrong now.
      api.get("api/settings").json<UserSettingsData>().then(setSettings).catch(() => {});
    }
  }, []);

  return { settings, isLoading, update };
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { ProfileResponse } from "../types";

export function useProfile() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.get("api/profile/me").json<ProfileResponse>();
      setProfile(data);
    } catch {
      setError("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, setProfile, isLoading, error, refetch: fetchProfile };
}

export async function saveProfile(data: {
  name?: string;
  bio?: string | null;
  timezone?: string | null;
  phone?: string | null;
}): Promise<ProfileResponse> {
  return api.patch("api/profile/me", { json: data }).json<ProfileResponse>();
}

export async function uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
  const body = new FormData();
  body.append("avatar", file);
  return api.post("api/profile/me/avatar", { body }).json<{ avatarUrl: string }>();
}


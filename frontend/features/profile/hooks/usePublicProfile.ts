"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import type { PublicProfileResponse } from "../types";

export function usePublicProfile(userId: string) {
  const [data, setData] = useState<PublicProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setNotFound(false);
    api
      .get(`api/profile/${userId}`)
      .json<PublicProfileResponse>()
      .then(setData)
      .catch((err) => {
        if (err?.response?.status === 404) setNotFound(true);
      })
      .finally(() => setIsLoading(false));
  }, [userId]);

  return { data, isLoading, notFound };
}

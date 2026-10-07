"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../AuthProvider";
import { authApi } from "@/lib/api-client";
import { AuthStatusCard } from "./AuthStatusCard";

type Status = "verifying" | "success" | "error" | "missing";

/**
 * Handles the magic-link the backend emails. Reads ?code from the query, POSTs
 * to /api/auth/magic-link/verify (which signs the user in by setting cookies),
 * then refreshes the session and redirects into the app.
 */
export function MagicLinkForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const code = searchParams.get("code");

  const [status, setStatus] = useState<Status>(!code ? "missing" : "verifying");
  // Guards React 18 StrictMode double-invoke in dev (codes are single-use).
  const ranRef = useRef(false);

  useEffect(() => {
    if (!code) return;
    if (ranRef.current) return;
    ranRef.current = true;

    let timer: ReturnType<typeof setTimeout>;
    (async () => {
      try {
        await authApi.verifyMagicLink({ code });
        await refresh();
        setStatus("success");
        timer = setTimeout(() => {
          router.push("/listings");
          router.refresh();
        }, 1200);
      } catch {
        setStatus("error");
      }
    })();
    return () => clearTimeout(timer);
  }, [code, refresh, router]);

  if (status === "missing") {
    return (
      <AuthStatusCard
        tone="error"
        eyebrow="Invalid link"
        title="Missing sign-in code"
        body="This magic link is incomplete. Please use the most recent link from your email."
        footer={
          <Link href="/login" className="auth-status-link">
            Back to sign in
          </Link>
        }
      />
    );
  }

  if (status === "verifying") {
    return (
      <AuthStatusCard
        tone="neutral"
        eyebrow="One moment"
        title="Signing you in"
        body="Confirming your magic link…"
      />
    );
  }

  if (status === "success") {
    return (
      <AuthStatusCard
        tone="success"
        eyebrow="Signed in"
        title="You're in"
        body="Taking you into SkillSwap & ToolShare now."
        footer={
          <Link href="/listings" className="auth-status-link">
            Continue
          </Link>
        }
      />
    );
  }

  // error
  return (
    <AuthStatusCard
      tone="error"
      eyebrow="Link expired"
      title="Sign-in failed"
      body="This magic link is invalid or has expired. Request a fresh one from the sign-in page."
      footer={
        <Link href="/login" className="auth-status-link">
          Back to sign in
        </Link>
      }
    />
  );
}

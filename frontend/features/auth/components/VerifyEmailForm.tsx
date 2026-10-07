"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../AuthProvider";
import { authApi } from "@/lib/api-client";
import { AuthStatusCard } from "./AuthStatusCard";

type Status = "verifying" | "success" | "error" | "missing";

/**
 * Handles the verify-email link the backend emails. Reads ?email & ?code from
 * the query, POSTs to /api/auth/verify-email (which signs the user in by
 * setting cookies), then refreshes the session and redirects into the app.
 */
export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const email = searchParams.get("email");
  const code = searchParams.get("code");

  const [status, setStatus] = useState<Status>(
    !email || !code ? "missing" : "verifying"
  );
  const [resent, setResent] = useState(false);
  // Guards React 18 StrictMode double-invoke in dev (codes are single-use).
  const ranRef = useRef(false);

  useEffect(() => {
    if (!email || !code) return;
    if (ranRef.current) return;
    ranRef.current = true;

    let timer: ReturnType<typeof setTimeout>;
    (async () => {
      try {
        await authApi.verifyEmail({ email, code });
        // verify-email signs the user in — pick up the new session.
        await refresh();
        setStatus("success");
        timer = setTimeout(() => {
          router.push("/listings");
          router.refresh();
        }, 1500);
      } catch {
        setStatus("error");
      }
    })();
    return () => clearTimeout(timer);
  }, [email, code, refresh, router]);

  async function handleResend() {
    if (!email) return;
    try {
      await authApi.resendVerification({ email });
    } catch {
      // Same message either way — don't leak whether the address exists.
    }
    setResent(true);
  }

  if (status === "missing") {
    return (
      <AuthStatusCard
        tone="error"
        eyebrow="Invalid link"
        title="Missing verification details"
        body="This verification link is incomplete. Please use the most recent link from your email."
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
        title="Verifying your email"
        body="Confirming your verification link…"
      />
    );
  }

  if (status === "success") {
    return (
      <AuthStatusCard
        tone="success"
        eyebrow="Verified"
        title="Email confirmed"
        body="You're all set — taking you into SkillSwap & ToolShare now."
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
      title="Verification failed"
      body="This verification link is invalid or has expired. Request a new one and we'll email it to you."
      footer={
        <>
          {resent ? (
            <>A new verification email is on its way. Check your inbox.</>
          ) : (
            <button type="button" onClick={handleResend} className="auth-status-link">
              Resend verification email
            </button>
          )}
          <br />
          <Link href="/login" className="auth-status-link">
            Back to sign in
          </Link>
        </>
      }
    />
  );
}

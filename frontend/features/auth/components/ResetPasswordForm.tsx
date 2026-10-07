"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "../AuthProvider";
import { authApi, ApiError } from "@/lib/api-client";
import { passwordSchema } from "../lib/password";
import { FormSkeleton } from "./FormSkeleton";

const resetSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetValues = z.infer<typeof resetSchema>;

// ── Success state ─────────────────────────────────────────────────────────────
function PasswordChanged() {
  return (
    <>
      <style>{`
        @keyframes reset-success-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .reset-success { animation: reset-success-in 0.35s ease both; }
        .reset-success-icon {
          width: 44px; height: 44px;
          border: 1px solid hsl(var(--primary));
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1.75rem;
          color: hsl(var(--primary)); font-size: 1.1rem;
        }
        .reset-success-eyebrow {
          font-size: 0.58rem; letter-spacing: 0.22em;
          text-transform: uppercase; color: hsl(var(--primary));
          margin-bottom: 0.6rem;
          font-family: var(--font-dm-mono), 'DM Mono', monospace;
        }
        .reset-success-title {
          font-family: var(--font-libre-baskerville), 'Libre Baskerville', serif;
          font-size: 1.65rem; font-weight: 700; color: hsl(var(--foreground));
          letter-spacing: -0.025em; line-height: 1.2; margin-bottom: 1rem;
        }
        .reset-success-body {
          font-size: 0.7rem; color: hsl(var(--muted-foreground)); line-height: 1.9;
          font-weight: 300; font-family: var(--font-dm-mono), 'DM Mono', monospace;
          margin-bottom: 2rem;
        }
        .reset-success-divider { border: none; border-top: 1px solid hsl(var(--border)); margin-bottom: 1.5rem; }
        .reset-success-hint {
          font-size: 0.62rem; color: hsl(var(--muted-foreground)); line-height: 1.7;
          font-family: var(--font-dm-mono), 'DM Mono', monospace; font-weight: 300;
        }
        .reset-success-link {
          color: hsl(var(--foreground)); font-weight: 500;
          text-decoration: underline; text-underline-offset: 3px;
        }
      `}</style>
      <div className="reset-success">
        <div className="reset-success-icon">✓</div>
        <div className="reset-success-eyebrow">All done</div>
        <h2 className="reset-success-title">Password changed</h2>
        <p className="reset-success-body">
          Your password has been updated. You can now sign in with your new password.
        </p>
        <hr className="reset-success-divider" />
        <p className="reset-success-hint">
          <Link href="/login" className="reset-success-link">
            Go to sign in
          </Link>
        </p>
      </div>
    </>
  );
}

// ── Invalid / expired token state ─────────────────────────────────────────────
function InvalidToken() {
  return (
    <>
      <style>{`
        .reset-invalid { animation: reset-success-in 0.35s ease both; }
        .reset-invalid-icon {
          width: 44px; height: 44px;
          border: 1px solid hsl(var(--destructive));
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1.75rem;
          color: hsl(var(--destructive)); font-size: 1.1rem;
        }
        .reset-invalid-eyebrow {
          font-size: 0.58rem; letter-spacing: 0.22em;
          text-transform: uppercase; color: hsl(var(--destructive));
          margin-bottom: 0.6rem;
          font-family: var(--font-dm-mono), 'DM Mono', monospace;
        }
        .reset-invalid-title {
          font-family: var(--font-libre-baskerville), 'Libre Baskerville', serif;
          font-size: 1.65rem; font-weight: 700; color: hsl(var(--foreground));
          letter-spacing: -0.025em; line-height: 1.2; margin-bottom: 1rem;
        }
        .reset-invalid-body {
          font-size: 0.7rem; color: hsl(var(--muted-foreground)); line-height: 1.9;
          font-weight: 300; font-family: var(--font-dm-mono), 'DM Mono', monospace;
          margin-bottom: 2rem;
        }
        .reset-invalid-divider { border: none; border-top: 1px solid hsl(var(--border)); margin-bottom: 1.5rem; }
        .reset-invalid-hint {
          font-size: 0.62rem; color: hsl(var(--muted-foreground)); line-height: 1.7;
          font-family: var(--font-dm-mono), 'DM Mono', monospace; font-weight: 300;
        }
        .reset-invalid-link {
          color: hsl(var(--foreground)); font-weight: 500;
          text-decoration: underline; text-underline-offset: 3px;
        }
      `}</style>
      <div className="reset-invalid">
        <div className="reset-invalid-icon">✕</div>
        <div className="reset-invalid-eyebrow">Link expired</div>
        <h2 className="reset-invalid-title">Invalid reset link</h2>
        <p className="reset-invalid-body">
          This password reset link is invalid or has expired. Reset links are valid for 1 hour.
        </p>
        <hr className="reset-invalid-divider" />
        <p className="reset-invalid-hint">
          <Link href="/forgot-password" className="reset-invalid-link">
            Request a new link
          </Link>
        </p>
      </div>
    </>
  );
}

// ── Reset form ────────────────────────────────────────────────────────────────
export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // The backend email link carries ?email & ?code.
  const email = searchParams.get("email");
  const code = searchParams.get("code");

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [invalidToken, setInvalidToken] = useState(!email || !code);

  // Redirect already-authenticated users away from the reset password page.
  // This is a UX guard only — real security is enforced server-side.
  const { user, isLoading: isPending } = useAuth();
  useEffect(() => {
    if (user?.emailVerified) router.push("/listings");
  }, [user, router]);

  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => router.push("/login"), 3000);
    return () => clearTimeout(timer);
  }, [success, router]);

  const form = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  async function onSubmit(values: ResetValues) {
    if (!email || !code) {
      setInvalidToken(true);
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword({
        email,
        code,
        newPassword: values.password,
      });
      setSuccess(true);
    } catch (err) {
      // 400/404/410 → the code is invalid or expired.
      if (
        err instanceof ApiError &&
        (err.status === 400 || err.status === 404 || err.status === 410)
      ) {
        setInvalidToken(true);
        return;
      }
      toast({
        variant: "destructive",
        title: "Reset failed",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (isPending) return <FormSkeleton fields={2} />;
  if (invalidToken) return <InvalidToken />;
  if (success) return <PasswordChanged />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="mt-2 w-full" disabled={isLoading}>
          {isLoading ? "Updating..." : "Update password"}
        </Button>
        <p className="mt-2 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </form>
    </Form>
  );
}

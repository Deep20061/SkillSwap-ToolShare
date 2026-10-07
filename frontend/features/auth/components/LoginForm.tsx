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
import { FormSkeleton } from "./FormSkeleton";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

// Validates that a callbackUrl is safe to redirect to — must be a relative
// path starting with / and not a protocol-relative URL (//evil.com).
function getSafeCallbackUrl(raw: string | null): string {
  if (!raw) return "/listings";
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/listings";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: sessionLoading, login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  // Email pending verification — when set, we show a "resend verification" prompt.
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  // Redirect already-authenticated users away from the login page.
  // This is a UX guard only — real security is enforced server-side.
  useEffect(() => {
    if (user?.emailVerified) {
      router.push(getSafeCallbackUrl(searchParams.get("callbackUrl")));
    }
  }, [user, router, searchParams]);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Don't render the form until we know the session state — prevents
  // flashing the form before the redirect fires for logged-in users.
  if (sessionLoading) return <FormSkeleton fields={2} />;

  async function onSubmit(values: LoginValues) {
    setIsLoading(true);
    setUnverifiedEmail(null);
    try {
      // Go through the AuthProvider: it sets the cookies AND refreshes the in-context
      // session, so the navbar (and other consumers) update immediately — no manual reload.
      await login(values.email, values.password);
      router.push(getSafeCallbackUrl(searchParams.get("callbackUrl")));
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) {
        // Email not verified — offer to resend the verification email.
        setUnverifiedEmail(values.email);
        return;
      }
      if (err instanceof ApiError && err.status === 401) {
        toast({
          variant: "destructive",
          title: "Sign in failed",
          description: "Invalid email or password.",
        });
        return;
      }
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    if (!unverifiedEmail) return;
    try {
      await authApi.resendVerification({ email: unverifiedEmail });
    } catch {
      // Don't leak whether the address exists — show the same message either way.
    }
    toast({
      title: "Verification email sent",
      description: `If ${unverifiedEmail} needs verifying, a new link is on its way.`,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {unverifiedEmail && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <p className="font-medium">Please verify your email first</p>
            <p className="mt-1 text-xs text-amber-700">
              We sent a verification link to {unverifiedEmail}. You must confirm it
              before signing in.
            </p>
            <button
              type="button"
              onClick={handleResend}
              className="mt-2 text-xs font-medium text-amber-900 underline underline-offset-2 hover:text-amber-950"
            >
              Resend verification email
            </button>
          </div>
        )}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="mt-2 w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
        <p className="mt-2 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Join SkillSwap & ToolShare
          </Link>
        </p>
      </form>
    </Form>
  );
}

import { Suspense } from "react";
import { AuthPageShell } from "@/features/auth/components/AuthPageShell";
import { VerifyEmailForm } from "@/features/auth/components/VerifyEmailForm";

export default function VerifyEmailPage() {
  return (
    <AuthPageShell
      panelKicker="Almost there"
      panelTitle="Confirm your email &"
      panelTitleEm="join in."
      panelTagline="One click confirms your account and unlocks swapping skills and tools with your community."
      ghost="Verify"
      formEyebrow="Account activation"
      formTitle="Verifying your email"
      formSub="Hang tight while we confirm your verification link."
    >
      {/* Suspense required because VerifyEmailForm uses useSearchParams */}
      <Suspense fallback={null}>
        <VerifyEmailForm />
      </Suspense>
    </AuthPageShell>
  );
}

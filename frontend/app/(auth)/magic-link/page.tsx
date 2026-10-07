import { Suspense } from "react";
import { AuthPageShell } from "@/features/auth/components/AuthPageShell";
import { MagicLinkForm } from "@/features/auth/components/MagicLinkForm";

export default function MagicLinkPage() {
  return (
    <AuthPageShell
      panelKicker="Passwordless"
      panelTitle="Your magic link,"
      panelTitleEm="one tap in."
      panelTagline="No password needed — we'll sign you in securely from the link in your inbox."
      ghost="Magic"
      formEyebrow="Magic sign-in"
      formTitle="Signing you in"
      formSub="Hang tight while we confirm your magic link."
    >
      {/* Suspense required because MagicLinkForm uses useSearchParams */}
      <Suspense fallback={null}>
        <MagicLinkForm />
      </Suspense>
    </AuthPageShell>
  );
}

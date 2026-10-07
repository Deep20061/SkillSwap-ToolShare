import { AppNav } from "@/components/AppNav";

export function ProfileLoadingState() {
  return (
    <div className="min-h-screen bg-surface">
      <AppNav />
      <div className="flex items-center justify-center py-24">
        <div className="animate-pulse font-mono text-sm text-ink3">Loading profile…</div>
      </div>
    </div>
  );
}

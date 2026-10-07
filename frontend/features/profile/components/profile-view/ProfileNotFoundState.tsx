import Link from "next/link";
import { AppNav } from "@/components/AppNav";

export function ProfileNotFoundState() {
  return (
    <div className="min-h-screen bg-surface">
      <AppNav />
      <div className="flex flex-col items-center justify-center gap-3 py-24">
        <h2 className="text-xl font-bold text-ink">User not found</h2>
        <Link href="/listings" className="text-sm text-brand-600 hover:underline">
          ← Back to listings
        </Link>
      </div>
    </div>
  );
}

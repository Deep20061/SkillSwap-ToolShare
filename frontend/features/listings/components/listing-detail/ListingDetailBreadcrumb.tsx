import Link from "next/link";
import { Chev } from "@/components/ui/Icons";
import type { Listing } from "@/features/listings/types";

export interface ListingDetailBreadcrumbProps {
  listing: Listing;
  isSkill: boolean;
}

export function ListingDetailBreadcrumb({ listing, isSkill }: ListingDetailBreadcrumbProps) {
  return (
    <nav className="mb-4 flex items-center gap-1.5 text-xs text-ink3">
      <Link href="/" className="no-underline hover:text-ink">
        Home
      </Link>
      <Chev size={12} />
      <Link href={`/listings?type=${listing.type}`} className="no-underline hover:text-ink">
        {isSkill ? "Skills" : "Tools"}
      </Link>
      <Chev size={12} />
      <span className="max-w-[200px] truncate text-ink2">{listing.title}</span>
    </nav>
  );
}

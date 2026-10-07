"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppFooter } from "@/components/AppFooter";
import { useMyListings } from "@/features/listings/hooks/useMyListings";
import { Plus } from "@/components/ui/Icons";
import { PageHeader } from "@/components/ui/PageHeader";
import { MyListingsStats } from "@/features/listings/components/my-listings/MyListingsStats";
import {
  MyListingsToolbar,
  type MyListingsTab,
} from "@/features/listings/components/my-listings/MyListingsToolbar";
import { MyListingsTable } from "@/features/listings/components/my-listings/MyListingsTable";

export default function MyListingsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<MyListingsTab>("all");
  const [search, setSearch] = useState("");
  const { myListings, myListingsLoading, loadMyListings } = useMyListings("listings");

  const filtered = myListings.filter((l) => {
    if (tab !== "all" && l.status.toLowerCase() !== tab) return false;
    if (search && !l.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const active = myListings.filter((l) => l.status === "ACTIVE").length;
  const totalViews = myListings.reduce((s, l) => s + l.viewCount, 0);

  const stats = [
    { v: myListings.length, l: "Total listings" },
    { v: active, l: "Active" },
    { v: totalViews, l: "Total views" },
    { v: "—", l: "Requests this week" },
  ] as const;

  return (
    <div className="min-h-full bg-surface">
      <div className="mx-auto w-full max-w-[1200px] px-4 py-6 md:px-6 md:py-8 lg:px-8">
        <PageHeader
          kicker="Account"
          title="My listings"
          desc="Everything you've posted to the marketplace."
        >
          <button
            type="button"
            onClick={() => router.push("/listings/new")}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-ink px-4 text-sm font-medium text-surface transition-opacity hover:opacity-90"
          >
            <Plus size={14} /> New listing
          </button>
        </PageHeader>

        <MyListingsStats stats={stats} />
        <MyListingsToolbar
          tab={tab}
          onTabChange={setTab}
          search={search}
          onSearchChange={setSearch}
        />
        <MyListingsTable listings={filtered} isLoading={myListingsLoading} onChanged={loadMyListings} />
      </div>

      <AppFooter />
    </div>
  );
}

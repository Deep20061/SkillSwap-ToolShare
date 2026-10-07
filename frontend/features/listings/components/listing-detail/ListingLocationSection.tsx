import dynamic from "next/dynamic";
import { Pin } from "@/components/ui/Icons";
import { ListingDetailSection } from "@/features/listings/components/listing-detail/DetailLayout";
import type { Listing } from "@/features/listings/types";

const DynamicSinglePinMap = dynamic(
  () =>
    import("@/features/listings/components/map/SinglePinMap").then((module) => ({
      default: module.SinglePinMap,
    })),
  { ssr: false, loading: () => <div className="absolute inset-0 animate-pulse bg-sunken" /> }
);

export interface ListingLocationSectionProps {
  listing: Listing;
}

export function ListingLocationSection({ listing }: ListingLocationSectionProps) {
  const hasCoordinates = listing.latitude != null && listing.longitude != null;

  return (
    <ListingDetailSection
      title="Where it is"
      subtitle="Approximate — exact location shared after agreement"
    >
      <div className="relative aspect-[16/8] overflow-hidden rounded-xl border border-line">
        {hasCoordinates ? (
          <>
            <div className="absolute inset-0">
              <DynamicSinglePinMap
                lat={listing.latitude!}
                lng={listing.longitude!}
                className="h-full w-full"
                showPin={false}
              />
            </div>
            <div className="absolute bottom-3 left-3 z-10">
              <div className="rounded-lg border border-line bg-surface/90 px-3 py-2 backdrop-blur">
                <div className="font-mono text-[10px] uppercase tracking-wider text-ink3">
                  Approx. area
                </div>
                <div className="text-sm font-semibold text-ink">
                  {listing.locationName ?? "Location set"}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="map-grid absolute inset-0 flex items-center justify-center">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="block h-28 w-28 rounded-full border-2 border-dashed border-brand-400/50 bg-brand-600/10" />
              <Pin
                size={22}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-600"
              />
            </div>
            <div className="absolute bottom-3 left-3">
              <div className="rounded-lg border border-line bg-surface/90 px-3 py-2 backdrop-blur">
                <div className="font-mono text-[10px] uppercase tracking-wider text-ink3">
                  Approx. area
                </div>
                <div className="text-sm font-semibold text-ink">
                  {listing.locationName ?? "Location not set"}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ListingDetailSection>
  );
}

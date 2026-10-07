/**
 * SkeletonCard — animated loading placeholder for listing cards.
 * Matches the aspect-ratio and padding of ListingCard.
 */
export function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="aspect-[4/3] bg-sunken" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 rounded bg-sunken" />
        <div className="h-3 w-1/2 rounded bg-sunken" />
        <div className="h-3 w-2/3 rounded bg-sunken" />
      </div>
    </div>
  );
}

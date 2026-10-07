import Image from "next/image";
import { cx, getSwatch } from "@/lib/utils";

export interface ListingThumbnailProps {
  /** Listing id — used to pick a deterministic colour swatch. */
  listingId: string;
  /** Fully-qualified image URL. When omitted only the swatch is shown. */
  mediaSrc?: string | null;
  /** `next/image` sizes attribute for the optional image. */
  imageSizes?: string;
  /** Classes for the thumbnail container (sizing, radius, etc.). */
  className?: string;
  /**
   * Optional content rendered on the swatch, beneath the cover image — matches
   * the original layering where a present image covers placeholder content.
   */
  children?: React.ReactNode;
}

/**
 * Shared listing thumbnail: a deterministic colour swatch with a striped
 * placeholder and gradient overlay, plus an optional cover image on top.
 */
export function ListingThumbnail({
  listingId,
  mediaSrc,
  imageSizes,
  className,
  children,
}: ListingThumbnailProps) {
  const swatch = getSwatch(listingId);
  return (
    <div className={cx("relative overflow-hidden", swatch.block, className)}>
      <div className="stripe-ph absolute inset-0 opacity-40" />
      <div className={cx("absolute inset-0 bg-gradient-to-br opacity-60", swatch.bar)} />
      {children}
      {mediaSrc && <Image src={mediaSrc} alt="" fill className="object-cover" sizes={imageSizes} />}
    </div>
  );
}

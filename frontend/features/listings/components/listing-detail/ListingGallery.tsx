import Image from "next/image";
import { Plus, Upload, X } from "@/components/ui/Icons";
import { ListingThumbnail } from "@/features/listings/components/ListingThumbnail";
import type { Listing } from "@/features/listings/types";
import { cx, getSwatch } from "@/lib/utils";

export interface ListingGalleryProps {
  listing: Listing;
  apiUrl: string;
  editing: boolean;
  isUploading: boolean;
  onUploadClick: () => void;
  onDeleteMedia: (mediaId: string) => void;
}

export function ListingGallery({
  listing,
  apiUrl,
  editing,
  isUploading,
  onUploadClick,
  onDeleteMedia,
}: ListingGalleryProps) {
  const swatch = getSwatch(listing.id);
  const hasSidePhotos = editing ? listing.media.length > 1 || true : listing.media.length > 1;

  return (
    <>
      <div className="mb-6 grid grid-cols-4 gap-2 overflow-hidden rounded-2xl">
        <ListingThumbnail
          listingId={listing.id}
          className={cx(
            "group row-span-2 aspect-[4/3] md:aspect-[5/4]",
            hasSidePhotos ? "col-span-4 md:col-span-3" : "col-span-4"
          )}
        >
          {listing.media[0] && (
            <Image
              src={`${apiUrl}${listing.media[0].path}`}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 75vw"
              priority
            />
          )}
          {editing && (
            <button
              type="button"
              onClick={onUploadClick}
              disabled={isUploading}
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity disabled:cursor-not-allowed group-hover:opacity-100"
            >
              <Upload size={22} className="text-white" />
              <span className="text-sm font-medium text-white">
                {listing.media[0] ? "Change cover" : "Upload cover photo"}
              </span>
            </button>
          )}
        </ListingThumbnail>

        {[1, 2].map((slotIndex) => {
          const media = listing.media[slotIndex];
          if (media) {
            return (
              <ListingThumbnail
                key={slotIndex}
                listingId={listing.id}
                mediaSrc={`${apiUrl}${media.path}`}
                imageSizes="25vw"
                className="group hidden aspect-[5/4] md:block"
              >
                {editing && (
                  <button
                    type="button"
                    onClick={() => onDeleteMedia(media.id)}
                    className="absolute right-1.5 top-1.5 z-10 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
                  >
                    <X size={12} />
                  </button>
                )}
              </ListingThumbnail>
            );
          }
          if (editing) {
            return (
              <button
                key={slotIndex}
                type="button"
                onClick={onUploadClick}
                disabled={isUploading}
                className="hidden aspect-[5/4] flex-col items-center justify-center gap-1.5 rounded border-2 border-dashed border-line2 text-ink3 transition-colors hover:border-brand-400 hover:bg-brand-50/30 hover:text-brand-600 disabled:opacity-50 md:flex"
              >
                <Plus size={18} />
                <span className="text-[10px] font-medium">Add photo</span>
              </button>
            );
          }
          return null;
        })}

        {listing.media.length > 3 && (
          <div className="relative hidden aspect-[5/4] cursor-pointer overflow-hidden md:block">
            <div className={cx("absolute inset-0", swatch.block)} />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-semibold text-white backdrop-blur-sm">
              +{listing.media.length - 3} photos
            </div>
          </div>
        )}
      </div>

      {editing && (
        <button
          type="button"
          onClick={onUploadClick}
          disabled={isUploading}
          className="mb-6 flex h-10 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line2 text-sm text-ink3 transition-colors hover:border-brand-400 hover:bg-brand-50/40 hover:text-brand-600 disabled:opacity-50"
        >
          <Plus size={15} />
          {isUploading ? "Uploading…" : "Add more photos"}
        </button>
      )}
    </>
  );
}

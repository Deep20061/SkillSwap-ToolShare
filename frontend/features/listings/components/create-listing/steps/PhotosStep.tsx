import type { ChangeEvent, Ref } from "react";
import { Image, Info } from "@/components/ui/Icons";
import { cx } from "@/lib/utils";
import { CreateListingStepPanel } from "@/features/listings/components/create-listing/StepPanel";

const PHOTO_SLOT_COUNT = 8;

export interface CreateListingPhotosStepProps {
  photoPreviews: string[];
  photoInputRef: Ref<HTMLInputElement>;
  onPhotoSelect: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: (index: number) => void;
  onAddPhotoClick: () => void;
}

export function CreateListingPhotosStep({
  photoPreviews,
  photoInputRef,
  onPhotoSelect,
  onRemovePhoto,
  onAddPhotoClick,
}: CreateListingPhotosStepProps) {
  return (
    <CreateListingStepPanel
      title="Add photos"
      sub="Listings with 3+ photos get 4× more requests. JPEG/PNG, up to 10 MB each."
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: PHOTO_SLOT_COUNT }).map((_, index) => {
          const preview = photoPreviews[index];
          return (
            <div key={index} className="relative aspect-square">
              {preview ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt=""
                    className="h-full w-full rounded-xl border border-line object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => onRemovePhoto(index)}
                    className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                  >
                    <span className="block text-[9px] leading-none">✕</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={onAddPhotoClick}
                  className={cx(
                    "flex h-full w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed transition-colors",
                    index === 0
                      ? "border-brand-400 bg-brand-50/30 text-brand-700"
                      : "border-line text-ink3 hover:border-line2"
                  )}
                >
                  <Image size={20} />
                  <span className="text-[10px] font-medium">
                    {index === 0 ? "Cover *" : "Add photo"}
                  </span>
                </button>
              )}
            </div>
          );
        })}
      </div>
      <input
        ref={photoInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={onPhotoSelect}
      />
      <div className="mt-4 flex items-center gap-1.5 text-xs text-ink2">
        <Info size={14} /> The first photo is the cover image in search results.
      </div>
    </CreateListingStepPanel>
  );
}

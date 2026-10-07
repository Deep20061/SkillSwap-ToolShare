import type { Ref } from "react";
import dynamic from "next/dynamic";
import { Pin } from "@/components/ui/Icons";
import { CreateListingFormField } from "@/features/listings/components/create-listing/FormField";
import { CreateListingStepPanel } from "@/features/listings/components/create-listing/StepPanel";
import type { LocationResult } from "@/features/listings/hooks/useLocationSearch";
import type { useGeolocation } from "@/features/listings/hooks/useGeolocation";
import { inputCls } from "@/lib/utils";

const SinglePinMap = dynamic(
  () =>
    import("@/features/listings/components/map/SinglePinMap").then((module) => module.SinglePinMap),
  { ssr: false }
);

export interface CreateListingLocationStepProps {
  locationQuery: string;
  showSuggestions: boolean;
  locationResults: LocationResult[];
  wrapperRef: Ref<HTMLDivElement>;
  reverseLoading: boolean;
  previewLat: number | null;
  previewLng: number | null;
  geo: ReturnType<typeof useGeolocation>;
  onLocationQueryChange: (value: string) => void;
  onLocationQueryFocus: () => void;
  onDismissSuggestions: () => void;
  onSelectLocation: (lat: number, lng: number, displayName: string) => void;
}

export function CreateListingLocationStep({
  locationQuery,
  showSuggestions,
  locationResults,
  wrapperRef,
  reverseLoading,
  previewLat,
  previewLng,
  geo,
  onLocationQueryChange,
  onLocationQueryFocus,
  onDismissSuggestions,
  onSelectLocation,
}: CreateListingLocationStepProps) {
  return (
    <CreateListingStepPanel
      title="Where is it?"
      sub="Exact location is only revealed to the person you agree to swap with."
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <CreateListingFormField label="Location name" hint="e.g. Alfama, Lisbon">
            <div className="relative" ref={wrapperRef}>
              <input
                className={inputCls}
                placeholder={reverseLoading ? "Detecting neighbourhood…" : "e.g. Braga city centre"}
                value={locationQuery}
                onChange={(event) => onLocationQueryChange(event.target.value)}
                onFocus={onLocationQueryFocus}
                onKeyDown={(event) => event.key === "Escape" && onDismissSuggestions()}
                maxLength={200}
                autoComplete="off"
              />
              {showSuggestions && locationResults.length > 0 && (
                <ul className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-line bg-surface shadow-pop">
                  {locationResults.map((result, index) => (
                    <li key={index}>
                      <button
                        type="button"
                        className="w-full border-b border-line px-3 py-2.5 text-left text-sm text-ink transition-colors last:border-0 hover:bg-sunken"
                        onClick={() => onSelectLocation(result.lat, result.lng, result.displayName)}
                      >
                        <Pin size={11} className="relative -top-px mr-1.5 inline text-ink3" />
                        <span className="truncate">{result.displayName}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CreateListingFormField>
          {geo.supported && (
            <button
              type="button"
              onClick={geo.retry}
              disabled={geo.loading}
              className="h-9 rounded-lg border border-line px-4 text-sm text-ink2 transition-colors hover:bg-sunken hover:text-ink disabled:opacity-50"
            >
              {geo.loading
                ? "Detecting…"
                : geo.lat !== null
                  ? "✓ Location detected"
                  : "Use my location"}
            </button>
          )}
          {geo.error && <p className="text-xs text-rose-500">{geo.error}</p>}
          {geo.lat !== null && geo.lng !== null && (
            <p className="font-mono text-xs text-emerald-600">
              {geo.lat.toFixed(5)}, {geo.lng.toFixed(5)}
            </p>
          )}
        </div>
        <div className="map-grid relative aspect-square overflow-hidden rounded-xl border border-line">
          {previewLat !== null && previewLng !== null ? (
            <SinglePinMap lat={previewLat} lng={previewLng} />
          ) : (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="block h-32 w-32 rounded-full border-2 border-dashed border-brand-400/50 bg-brand-600/10" />
              <Pin
                size={22}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-600"
              />
            </div>
          )}
        </div>
      </div>
    </CreateListingStepPanel>
  );
}

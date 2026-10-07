import { Grid, MapIcon } from "@/components/ui/Icons";
import { cx } from "@/lib/utils";

export interface BrowseViewModeToggleProps {
  mode: "grid" | "map";
  onGrid: () => void;
  onMap: () => void;
  className?: string;
}

export function BrowseViewModeToggle({
  mode,
  onGrid,
  onMap,
  className,
}: BrowseViewModeToggleProps) {
  return (
    <div
      className={cx(
        "hidden items-center gap-1 rounded-md border border-line bg-surface p-1 md:flex",
        className
      )}
    >
      <button
        type="button"
        onClick={onGrid}
        className={cx(
          "inline-flex h-7 w-7 items-center justify-center rounded",
          mode === "grid" ? "bg-sunken text-ink" : "text-ink3 hover:text-ink"
        )}
      >
        <Grid size={14} />
      </button>
      <button
        type="button"
        onClick={onMap}
        className={cx(
          "inline-flex h-7 w-7 items-center justify-center rounded",
          mode === "map" ? "bg-sunken text-ink" : "text-ink3 hover:text-ink"
        )}
      >
        <MapIcon size={14} />
      </button>
    </div>
  );
}

import { Check, Clock } from "@/components/ui/Icons";

export interface VerifyRowProps {
  label: string;
  desc: string;
  status: "done" | "pending" | "missing" | "soon";
}

export function VerifyRow({ label, desc, status }: VerifyRowProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-line p-3">
      <div className="min-w-0">
        <div className="text-sm font-medium text-ink">{label}</div>
        <div className="break-words text-xs text-ink3">{desc}</div>
      </div>
      {status === "done" ? (
        <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">
          <Check size={10} /> Verified
        </span>
      ) : status === "pending" ? (
        <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] text-amber-700">
          <Clock size={10} /> In review
        </span>
      ) : status === "soon" ? (
        <span className="rounded-full border border-line bg-sunken px-2 py-0.5 text-[10px] text-ink3">
          Soon
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 rounded-md border border-line bg-sunken px-2 py-0.5 text-[11px] text-ink3">
          Missing
        </span>
      )}
    </div>
  );
}

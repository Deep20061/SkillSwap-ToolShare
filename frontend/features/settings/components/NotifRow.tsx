"use client";

import { cx } from "@/lib/utils";

export interface NotifRowProps {
  label: string;
  desc?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/**
 * One notification event row. Only the in-app channel is functional — email
 * and push senders don't exist yet, so those columns render as "Soon".
 */
export function NotifRow({ label, desc, checked, onChange }: NotifRowProps) {
  return (
    <tr>
      <td className="py-3 pr-3">
        <div className="text-ink">{label}</div>
        {desc && <div className="mt-0.5 text-xs text-ink3">{desc}</div>}
      </td>
      <td className="py-3 text-center">
        <button
          onClick={() => onChange(!checked)}
          className={cx(
            "relative inline-block h-5 w-9 rounded-full transition-colors",
            checked ? "bg-brand-600" : "bg-line2"
          )}
        >
          <span
            className={cx(
              "absolute top-0.5 block h-4 w-4 rounded-full bg-white shadow-sm transition-all",
              checked ? "left-4" : "left-0.5"
            )}
          />
        </button>
      </td>
      {[0, 1].map((i) => (
        <td key={i} className="py-3 text-center">
          <span className="rounded-full border border-line bg-sunken px-2 py-0.5 text-[10px] text-ink3">
            Soon
          </span>
        </td>
      ))}
    </tr>
  );
}

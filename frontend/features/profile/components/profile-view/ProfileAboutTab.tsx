import { ShieldCheck, Phone, Star } from "lucide-react";

interface ProfileAboutTabProps {
  bio: string | null | undefined;
  displayEmail?: string;
  joinedDate: string | null;
  isIdentityVerified: boolean;
  phone?: string | null;
  reviewCount: number;
  rating: number | null | undefined;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.16em] text-ink3">{label}</div>
      <div className="text-[15px] leading-relaxed text-ink">{children}</div>
    </div>
  );
}

export function ProfileAboutTab({
  bio,
  displayEmail,
  joinedDate,
  isIdentityVerified,
  phone,
  reviewCount,
  rating,
}: ProfileAboutTabProps) {
  const isSuperHost = reviewCount >= 20 && rating != null && rating >= 4.5;

  const badges = [
    isIdentityVerified
      ? {
          icon: <ShieldCheck size={14} className="text-emerald-600" />,
          title: "Identity verified",
          desc: "Government ID checked",
        }
      : null,
    phone
      ? {
          icon: <Phone size={14} className="text-violet-600" />,
          title: "Phone on file",
          desc: phone.replace(/\d(?=\d{3})/g, "•"),
        }
      : null,
    isSuperHost
      ? {
          icon: <Star size={14} className="text-amber-600" />,
          title: "Super-host",
          desc: `${reviewCount}+ swaps · ${rating?.toFixed(1)}-star`,
        }
      : null,
  ].filter(Boolean) as { icon: React.ReactNode; title: string; desc: string }[];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="space-y-4 rounded-2xl border border-line bg-surface p-5 md:col-span-2">
        <Field label="Bio">
          {bio || <span className="italic text-ink3">No bio yet.</span>}
        </Field>
        {displayEmail && <Field label="Email">{displayEmail}</Field>}
        {joinedDate && <Field label="Joined">{joinedDate}</Field>}
      </div>

      <div className="rounded-2xl border border-line bg-surface p-5">
        <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ink3">
          Trust badges
        </div>
        {badges.length > 0 ? (
          <ul className="space-y-3">
            {badges.map((badge) => (
              <li key={badge.title} className="flex items-start gap-2.5">
                <span className="mt-0.5 shrink-0">{badge.icon}</span>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-ink">{badge.title}</div>
                  <div className="text-[11px] text-ink3">{badge.desc}</div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink3">No verifications yet.</p>
        )}
      </div>
    </div>
  );
}

/**
 * PageHeader — the standard kicker + title + description block used
 * at the top of most app pages.
 *
 * Usage:
 *   <PageHeader kicker="Account" title="My listings" desc="Everything you've posted." />
 */
export function PageHeader({
  kicker,
  title,
  desc,
  children,
}: {
  kicker?: string;
  title: string;
  desc?: string;
  /** Optional slot — rendered to the right of the text block (e.g. a CTA button). */
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        {kicker && (
          <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.18em] text-brand-600">
            {kicker}
          </div>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">{title}</h1>
        {desc && <p className="mt-1 text-sm text-ink2">{desc}</p>}
      </div>
      {children}
    </div>
  );
}

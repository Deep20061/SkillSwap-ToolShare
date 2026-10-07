import { Logo } from "@/components/ui/Icons";

/**
 * The full brand lockup used across the app: the interlocking-rings mark plus
 * the "SkillSwap / & ToolShare" wordmark (serif title + mono subtitle). This is
 * the single source of truth — the navbar and the auth pages both render it so
 * the logo is identical everywhere. Wrap it in a <Link> at the call site.
 */
export function BrandLogo({ iconSize = 24 }: { iconSize?: number }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
      <span
        style={{ width: iconSize, height: iconSize, flexShrink: 0, lineHeight: 0, color: "hsl(217 71% 45%)" }}
      >
        <Logo size={iconSize} />
      </span>
      <span
        style={{
          fontFamily: "var(--font-libre-baskerville), serif",
          fontSize: "0.95rem",
          color: "hsl(var(--foreground))",
          letterSpacing: "-0.01em",
          lineHeight: 1.1,
        }}
      >
        SkillSwap
        <span
          style={{
            display: "block",
            fontSize: "0.52rem",
            fontFamily: "var(--font-dm-mono), monospace",
            color: "hsl(var(--primary))",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            fontStyle: "normal",
            fontWeight: 400,
            marginTop: "1px",
          }}
        >
          &amp; ToolShare
        </span>
      </span>
    </span>
  );
}

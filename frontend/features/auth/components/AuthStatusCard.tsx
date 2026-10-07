"use client";

import type { ReactNode } from "react";

type Tone = "success" | "error" | "neutral";

const ICON: Record<Tone, string> = {
  success: "✓",
  error: "✕",
  neutral: "…",
};

/**
 * Self-contained status card matching the auth pages' visual language. Used by
 * the verify-email and magic-link result screens so they don't depend on CSS
 * classes scoped to another component.
 */
export function AuthStatusCard({
  tone,
  eyebrow,
  title,
  body,
  footer,
}: {
  tone: Tone;
  eyebrow: string;
  title: string;
  body: ReactNode;
  footer?: ReactNode;
}) {
  const color =
    tone === "error" ? "hsl(var(--destructive))" : "hsl(var(--primary))";
  return (
    <>
      <style>{`
        @keyframes auth-status-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .auth-status { animation: auth-status-in 0.35s ease both; }
        .auth-status-icon {
          width: 44px; height: 44px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 1.75rem; font-size: 1.1rem;
        }
        .auth-status-eyebrow {
          font-size: 0.58rem; letter-spacing: 0.22em; text-transform: uppercase;
          margin-bottom: 0.6rem;
          font-family: var(--font-dm-mono), 'DM Mono', monospace;
        }
        .auth-status-title {
          font-family: var(--font-libre-baskerville), 'Libre Baskerville', serif;
          font-size: 1.65rem; font-weight: 700; color: hsl(var(--foreground));
          letter-spacing: -0.025em; line-height: 1.2; margin-bottom: 1rem;
        }
        .auth-status-body {
          font-size: 0.7rem; color: hsl(var(--muted-foreground)); line-height: 1.9;
          font-weight: 300; font-family: var(--font-dm-mono), 'DM Mono', monospace;
          margin-bottom: 2rem;
        }
        .auth-status-divider { border: none; border-top: 1px solid hsl(var(--border)); margin-bottom: 1.5rem; }
        .auth-status-hint {
          font-size: 0.62rem; color: hsl(var(--muted-foreground)); line-height: 1.8;
          font-family: var(--font-dm-mono), 'DM Mono', monospace; font-weight: 300;
        }
        .auth-status-link {
          color: hsl(var(--foreground)); font-weight: 500;
          text-decoration: underline; text-underline-offset: 3px;
          cursor: pointer; background: none; border: none; padding: 0;
          font: inherit;
        }
      `}</style>
      <div className="auth-status">
        <div
          className="auth-status-icon"
          style={{ border: `1px solid ${color}`, color }}
        >
          {ICON[tone]}
        </div>
        <div className="auth-status-eyebrow" style={{ color }}>
          {eyebrow}
        </div>
        <h2 className="auth-status-title">{title}</h2>
        <p className="auth-status-body">{body}</p>
        {footer && (
          <>
            <hr className="auth-status-divider" />
            <p className="auth-status-hint">{footer}</p>
          </>
        )}
      </div>
    </>
  );
}

import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";
import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <>
      <style>{`

        .logi {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh;
          font-family: var(--font-dm-mono), 'DM Mono', monospace;
        }

        .logi-panel {
          background: #f8fafc;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 2.5rem;
          overflow: hidden;
          border-right: 1px solid hsl(var(--border));
        }

        .logi-panel::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px);
          background-size: 48px 48px;
          opacity: 0.5;
          pointer-events: none;
        }

        .logi-panel::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 50% 50% at 50% 50%, rgba(59, 130, 246, 0.05) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .logi-ghost {
          position: absolute;
          bottom: -2rem;
          left: -1rem;
          font-family: var(--font-libre-baskerville), serif;
          font-style: italic;
          font-weight: 700;
          font-size: clamp(5rem, 10vw, 9rem);
          line-height: 1;
          letter-spacing: -0.04em;
          color: transparent;
          -webkit-text-stroke: 1px hsl(var(--border));
          user-select: none;
          pointer-events: none;
          z-index: 0;
          white-space: nowrap;
        }

        .logi-panel-top,
        .logi-panel-bottom,
        .logi-panel-middle {
          position: relative;
          z-index: 1;
        }

        .logi-logo-wrap {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          text-decoration: none;
        }

        .logi-logo-text {
          font-family: var(--font-libre-baskerville), serif;
          font-size: 0.95rem;
          color: hsl(var(--foreground));
          letter-spacing: -0.01em;
          line-height: 1.1;
        }

        .logi-logo-text span {
          display: block;
          font-size: 0.52rem;
          font-family: var(--font-dm-mono), monospace;
          color: hsl(var(--primary));
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-style: normal;
          font-weight: 400;
          margin-top: 1px;
        }

        .logi-value-kicker {
          font-size: 0.56rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: hsl(var(--primary));
          margin-bottom: 1rem;
        }

        .logi-value-title {
          font-family: var(--font-libre-baskerville), serif;
          font-size: clamp(1.6rem, 3vw, 2.5rem);
          font-weight: 700;
          letter-spacing: -0.035em;
          line-height: 1.1;
          color: hsl(var(--foreground));
          margin-bottom: 1.25rem;
        }

        .logi-value-title em {
          font-style: italic;
          font-weight: 400;
          color: hsl(var(--primary));
        }

        .logi-tagline {
          border-left: 2px solid hsl(var(--border));
          padding-left: 1rem;
          margin-bottom: 3rem;
        }

        .logi-tagline-text {
          font-size: 0.7rem;
          color: hsl(var(--muted-foreground));
          line-height: 1.9;
          font-weight: 300;
          max-width: 30ch;
        }

        .logi-back {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.6rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: hsl(var(--muted-foreground));
          text-decoration: none;
          transition: color 0.15s;
        }

        .logi-back:hover { color: hsl(var(--foreground)); }

        .logi-form-side {
          background: hsl(var(--background));
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 2.5rem;
          min-height: 100vh;
        }

        .logi-form-wrap {
          width: 100%;
          max-width: 400px;
          animation: logi-in 0.5s ease both;
        }

        @keyframes logi-in {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .logi-form-header {
          margin-bottom: 2.25rem;
        }

        .logi-form-eyebrow {
          font-size: 0.58rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: hsl(var(--primary));
          margin-bottom: 0.6rem;
        }

        .logi-form-title {
          font-family: var(--font-libre-baskerville), serif;
          font-size: 1.65rem;
          font-weight: 700;
          color: hsl(var(--foreground));
          letter-spacing: -0.025em;
          line-height: 1.2;
          margin-bottom: 0.4rem;
        }

        .logi-form-sub {
          font-size: 0.68rem;
          color: hsl(var(--muted-foreground));
          line-height: 1.7;
          font-weight: 300;
        }

        .logi-form-wrap .rounded-lg {
          border: none !important;
          box-shadow: none !important;
          background: transparent !important;
          padding: 0 !important;
        }

        .logi-form-wrap .p-6 { padding: 0 !important; }

        @media (max-width: 720px) {
          .logi { grid-template-columns: 1fr; }
          .logi-panel { display: none; }
          .logi-form-side { padding: 3rem 1.5rem; }
        }
      `}</style>

      <div className="logi">
        <div className="logi-panel">
          <div className="logi-panel-top">
            <Link href="/" className="logi-logo-wrap">
              <div style={{ width: 24, height: 24, flexShrink: 0 }}>
                <svg
                  viewBox="0 0 28 28"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                >
                  <circle
                    cx="9"
                    cy="9"
                    r="7"
                    stroke="hsl(217 71% 45%)"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <circle
                    cx="19"
                    cy="19"
                    r="7"
                    stroke="hsl(217 71% 60%)"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <path
                    d="M14 6 L20 12"
                    stroke="hsl(217 71% 45%)"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M14 22 L8 16"
                    stroke="hsl(217 71% 60%)"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  <circle cx="14" cy="6" r="1.5" fill="hsl(217 71% 45%)" />
                  <circle cx="14" cy="22" r="1.5" fill="hsl(217 71% 60%)" />
                </svg>
              </div>
              <div className="logi-logo-text">
                SkillSwap
                <span>& ToolShare</span>
              </div>
            </Link>
          </div>

          <div className="logi-panel-middle">
            <div className="logi-value-kicker">Account recovery</div>
            <h2 className="logi-value-title">
              Your swaps
              <br />
              are still <em>waiting.</em>
            </h2>
            <div className="logi-tagline">
              <p className="logi-tagline-text">
                Reset your password and get back to exchanging skills and tools with your community.
              </p>
            </div>
          </div>

          <div className="logi-panel-bottom">
            <Link href="/login" className="logi-back">
              ← Back to sign in
            </Link>
          </div>

          <div className="logi-ghost" aria-hidden="true">
            Reset
          </div>
        </div>

        <div className="logi-form-side">
          <div className="logi-form-wrap">
            <div className="logi-form-header">
              <div className="logi-form-eyebrow">Account recovery</div>
              <h1 className="logi-form-title">Forgot your password?</h1>
              <p className="logi-form-sub">
                Enter your email and we&apos;ll send a reset link. Back in a minute.
              </p>
            </div>
            <ForgotPasswordForm />
          </div>
        </div>
      </div>
    </>
  );
}

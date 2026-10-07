import { RegisterForm } from "@/features/auth/components/RegisterForm";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <>
      <style>{`

        .regi {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 100vh;
          font-family: var(--font-dm-mono), 'DM Mono', monospace;
        }

        .regi-panel {
          background: #f8fafc;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 2.5rem;
          overflow: hidden;
          border-right: 1px solid hsl(var(--border));
        }

        .regi-panel::before {
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

        .regi-panel::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse 60% 60% at 70% 40%, rgba(59, 130, 246, 0.05) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        .regi-ghost {
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

        .regi-panel-top,
        .regi-panel-bottom,
        .regi-panel-middle {
          position: relative;
          z-index: 1;
        }

        .regi-logo-wrap {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          text-decoration: none;
        }

        .regi-logo-text {
          font-family: var(--font-libre-baskerville), serif;
          font-size: 0.95rem;
          color: hsl(var(--foreground));
          letter-spacing: -0.01em;
          line-height: 1.1;
        }

        .regi-logo-text span {
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

        .regi-value-kicker {
          font-size: 0.56rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: hsl(var(--primary));
          margin-bottom: 1rem;
        }

        .regi-value-title {
          font-family: var(--font-libre-baskerville), serif;
          font-size: clamp(1.6rem, 3vw, 2.5rem);
          font-weight: 700;
          letter-spacing: -0.035em;
          line-height: 1.1;
          color: hsl(var(--foreground));
          margin-bottom: 1.25rem;
        }

        .regi-value-title em {
          font-style: italic;
          font-weight: 400;
          color: hsl(var(--primary));
        }

        .regi-tagline {
          border-left: 2px solid hsl(var(--border));
          padding-left: 1rem;
          margin-bottom: 2rem;
        }

        .regi-tagline-text {
          font-size: 0.7rem;
          color: hsl(var(--muted-foreground));
          line-height: 1.9;
          font-weight: 300;
          max-width: 30ch;
        }

        .regi-perks {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 3rem;
        }

        .regi-perk {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          font-size: 0.68rem;
          color: hsl(var(--muted-foreground));
          line-height: 1.6;
          font-weight: 300;
        }

        .regi-perk-check {
          color: hsl(var(--primary));
          flex-shrink: 0;
          margin-top: 0.05rem;
          font-size: 0.7rem;
        }

        .regi-back {
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

        .regi-back:hover { color: hsl(var(--foreground)); }

        /* ── Right form panel ── */
        .regi-form-side {
          background: hsl(var(--background));
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 2.5rem;
          min-height: 100vh;
        }

        .regi-form-wrap {
          width: 100%;
          max-width: 400px;
          animation: regi-in 0.5s ease both;
        }

        @keyframes regi-in {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .regi-form-header {
          margin-bottom: 2.25rem;
        }

        .regi-form-eyebrow {
          font-size: 0.58rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: hsl(var(--primary));
          margin-bottom: 0.6rem;
        }

        .regi-form-title {
          font-family: var(--font-libre-baskerville), serif;
          font-size: 1.65rem;
          font-weight: 700;
          color: hsl(var(--foreground));
          letter-spacing: -0.025em;
          line-height: 1.2;
          margin-bottom: 0.4rem;
        }

        .regi-form-sub {
          font-size: 0.68rem;
          color: hsl(var(--muted-foreground));
          line-height: 1.7;
          font-weight: 300;
        }

        .regi-form-wrap .rounded-lg {
          border: none !important;
          box-shadow: none !important;
          background: transparent !important;
          padding: 0 !important;
        }

        .regi-form-wrap .p-6 { padding: 0 !important; }

        .regi-form-wrap [class*="CardHeader"],
        .regi-form-wrap [class*="CardTitle"],
        .regi-form-wrap [class*="CardDescription"] {
          display: none !important;
        }

        .regi-form-wrap [class*="CardFooter"] {
          padding: 0 !important;
          margin-top: 1.25rem !important;
          justify-content: flex-start !important;
        }

        @media (max-width: 720px) {
          .regi { grid-template-columns: 1fr; }
          .regi-panel { display: none; }
          .regi-form-side { padding: 3rem 1.5rem; }
        }
      `}</style>

      <div className="regi">
        <div className="regi-panel">
          <div className="regi-panel-top">
            <Link href="/" className="regi-logo-wrap">
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
              <div className="regi-logo-text">
                SkillSwap
                <span>& ToolShare</span>
              </div>
            </Link>
          </div>

          <div className="regi-panel-middle">
            <div className="regi-value-kicker">Join the community</div>
            <h2 className="regi-value-title">
              Start swapping
              <br />
              skills & tools <em>today.</em>
            </h2>
            <div className="regi-tagline">
              <p className="regi-tagline-text">
                No fees. No subscription. Your talent and resources are the only currency that
                matters here.
              </p>
            </div>
            <div className="regi-perks">
              <div className="regi-perk">
                <span className="regi-perk-check">✓</span>
                <span>Post skills and tools in minutes — no approval needed</span>
              </div>
              <div className="regi-perk">
                <span className="regi-perk-check">✓</span>
                <span>Find people nearby with map-based discovery</span>
              </div>
              <div className="regi-perk">
                <span className="regi-perk-check">✓</span>
                <span>Sign lightweight digital contracts for every exchange</span>
              </div>
              <div className="regi-perk">
                <span className="regi-perk-check">✓</span>
                <span>Build your reputation through verified reviews</span>
              </div>
              <div className="regi-perk">
                <span className="regi-perk-check">✓</span>
                <span>Identity-verified community — know who you&apos;re swapping with</span>
              </div>
            </div>
          </div>

          <div className="regi-panel-bottom">
            <Link href="/" className="regi-back">
              ← Back to home
            </Link>
          </div>

          <div className="regi-ghost" aria-hidden="true">
            Join
          </div>
        </div>

        <div className="regi-form-side">
          <div className="regi-form-wrap">
            <div className="regi-form-header">
              <div className="regi-form-eyebrow">Free forever</div>
              <h1 className="regi-form-title">Create your account</h1>
              <p className="regi-form-sub">
                Join the community. Start swapping skills and tools today.
              </p>
            </div>
            <RegisterForm />
          </div>
        </div>
      </div>
    </>
  );
}

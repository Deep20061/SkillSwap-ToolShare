import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM as string,
    to,
    subject,
    html,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

/**
 * Escapes user-supplied strings before embedding them in HTML to prevent XSS.
 * The raw value is kept in the DB; sanitize at the rendering layer, not storage.
 */
export function escapeHtml(str: string): string {
  return str.replace(/[<>"'&]/g, (c) => `&#${c.charCodeAt(0)};`);
}

interface ActionEmailOptions {
  /** Uppercase label shown in the top-right of the header (e.g. "Password Reset"). */
  headerLabel: string;
  /** Small accent line above the heading (e.g. "Security notice"). */
  eyebrow: string;
  /** Heading first line (plain). */
  headingTop: string;
  /** Heading second line (italic, accent colour). */
  headingBottom: string;
  /** Recipient's display name — escaped by the caller is not required; done here. */
  recipientName: string;
  /** Body paragraph HTML (may contain <strong>, <br>, etc.). */
  bodyHtml: string;
  /** Call-to-action button label. */
  buttonLabel: string;
  /** Call-to-action URL. */
  url: string;
  /** Small reassurance note shown in the bottom info box. */
  noticeHtml: string;
  /** Footer paragraph explaining why the email was received. */
  footerHtml: string;
}

/**
 * Renders a branded transactional HTML email used for verification and
 * password-reset messages. Centralising the markup here keeps the two
 * call sites in sync and avoids duplicating ~3 KB of inline styling.
 */
export function renderActionEmail(opts: ActionEmailOptions): string {
  const safeName = escapeHtml(opts.recipientName);
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:2.5rem 1rem;"><tr><td align="center"><table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;"><tr><td style="background:#ffffff;padding:1.75rem 2.5rem;border-bottom:3px solid #2563EB;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td><span style="font-family:Georgia,serif;font-size:17px;color:#111827;letter-spacing:-0.01em;">SkillSwap</span><span style="font-family:Arial,Helvetica,sans-serif;font-size:9px;color:#2563EB;letter-spacing:0.14em;text-transform:uppercase;margin-left:8px;">&amp; ToolShare</span></td><td align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:9px;letter-spacing:0.2em;text-transform:uppercase;color:#6b7280;">${opts.headerLabel}</td></tr></table></td></tr><tr><td style="padding:2.5rem 2.5rem 2rem;background:#ffffff;"><p style="font-family:Arial,Helvetica,sans-serif;font-size:9px;letter-spacing:0.22em;text-transform:uppercase;color:#2563EB;margin:0 0 12px;">${opts.eyebrow}</p><h1 style="font-family:Georgia,serif;font-size:26px;font-weight:700;color:#111827;letter-spacing:-0.025em;line-height:1.15;margin:0 0 20px;">${opts.headingTop}<br><span style="font-style:italic;font-weight:400;color:#2563EB;">${opts.headingBottom}</span></h1><div style="height:1px;background:#e5e7eb;margin:24px 0;"></div><p style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#111827;line-height:1.8;margin:0 0 12px;font-weight:400;">Hi ${safeName},</p><p style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#374151;line-height:1.9;font-weight:400;margin:0 0 24px;">${opts.bodyHtml}</p><table cellpadding="0" cellspacing="0" style="margin:0 0 12px;"><tr><td style="background:#2563EB;padding:14px 32px;border-radius:6px;"><a href="${opts.url}" style="font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#ffffff;text-decoration:none;">${opts.buttonLabel} &#8594;</a></td></tr></table><p style="font-family:Arial,Helvetica,sans-serif;font-size:10px;color:#9CA3AF;margin:8px 0 0;">Button not working? Copy this link: <span style="color:#2563EB;font-weight:500;">${opts.url}</span></p><div style="background:#f0f4ff;border-left:3px solid #2563EB;padding:12px 16px;margin:24px 0;"><p style="font-family:Arial,Helvetica,sans-serif;font-size:9px;letter-spacing:0.18em;text-transform:uppercase;color:#9CA3AF;margin:0 0 6px;">${opts.headerLabel} link</p><p style="font-family:Arial,Helvetica,sans-serif;font-size:10px;color:#2563EB;word-break:break-all;margin:0;font-weight:500;">${opts.url}</p></div><table cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;padding:16px 20px;margin:24px 0 0;width:100%;border-radius:4px;"><tr><td width="16" style="color:#2563EB;font-size:11px;font-weight:700;font-family:Arial,Helvetica,sans-serif;vertical-align:top;padding-top:2px;">!</td><td style="font-family:Arial,Helvetica,sans-serif;font-size:10px;color:#374151;line-height:1.75;font-weight:400;padding-left:10px;">${opts.noticeHtml}</td></tr></table></td></tr><tr><td style="background:#f9fafb;padding:24px 40px;border-top:1px solid #e5e7eb;"><table width="100%" cellpadding="0" cellspacing="0" style="border-bottom:1px solid #e5e7eb;padding-bottom:16px;margin-bottom:16px;"><tr><td style="font-family:Georgia,serif;font-size:14px;color:#374151;">SkillSwap <span style="font-family:Arial,Helvetica,sans-serif;font-size:9px;color:#2563EB;letter-spacing:0.1em;">&amp; ToolShare</span></td><td align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:#9CA3AF;">Automated &middot; Do not reply</td></tr></table><p style="font-family:Arial,Helvetica,sans-serif;font-size:9px;color:#9CA3AF;line-height:1.75;font-weight:400;margin:0;">${opts.footerHtml}</p></td></tr></table></td></tr></table></body></html>`;
}

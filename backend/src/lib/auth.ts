import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import prisma from "./prisma";
import { sendEmail, renderActionEmail } from "./email";
import { checkEmailRateLimit } from "../middleware/rateLimiter";
import { auditLog } from "./audit";
import logger from "./logger";

const additionalSecrets = process.env.BETTER_AUTH_SECRETS
  ? process.env.BETTER_AUTH_SECRETS.split(",").filter(Boolean)
  : [];

/**
 * Better Auth configuration.
 *
 * Email/password auth with mandatory email verification.
 * Google OAuth is enabled when GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set.
 *
 * Security decisions:
 * - maxPasswordLength is 72 to match bcrypt's silent truncation limit.
 * - password.validate runs on change/reset only — sign-up validation
 *   is handled by Zod in auth.validation.ts (Express middleware).
 * - trustedOrigins is empty in production if FRONTEND_URL is missing,
 *   rather than falling back to a permissive default.
 * - Cookie sameSite is "strict" — prevents CSRF without a separate token.
 * - secondarySecrets enables zero-downtime secret rotation via BETTER_AUTH_SECRETS.
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await prisma.userProfile
            .create({
              data: { userId: user.id },
            })
            .catch((err) => {
              logger.error("Failed to create user profile after registration:", err);
            });
        },
      },
    },
  },

  // No fallback — BETTER_AUTH_URL is required and validated by Zod at startup.
  baseURL: process.env.BETTER_AUTH_URL as string,
  basePath: "/api/auth",

  secret: process.env.BETTER_AUTH_SECRET,

  ...(additionalSecrets.length > 0 && {
    secondarySecrets: additionalSecrets,
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    // Must match the .max(72) in signUpSchema — bcrypt silently truncates at 72 bytes.
    // Setting this here ensures Better Auth's own routes (changePassword, resetPassword)
    // enforce the same limit rather than the default 128.
    maxPasswordLength: 72,
    sendResetPassword: async ({ user, url }) => {
      const allowed = await checkEmailRateLimit(user.email);
      if (!allowed) {
        logger.warn("Reset password email rate limit exceeded", { email: user.email });
        auditLog("password_reset_rate_limited", { email: user.email });
        return;
      }
      try {
        await sendEmail({
          to: user.email,
          subject: "Reset your SkillSwap & ToolShare password",
          html: renderActionEmail({
            headerLabel: "Password Reset",
            eyebrow: "Security notice",
            headingTop: "Reset your",
            headingBottom: "password.",
            recipientName: user.name,
            bodyHtml:
              "We received a request to reset the password for your SkillSwap &amp; ToolShare account. Click the button below to choose a new password.<br><br>This link expires in <strong style=\"color:#111827;font-weight:600;\">1 hour</strong>. If you didn&#39;t request a reset, no action is needed — your password remains unchanged.",
            buttonLabel: "Reset password",
            url,
            noticeHtml:
              "If you didn&#39;t request a password reset, please ignore this email. Your account is secure and no changes have been made.",
            footerHtml:
              "This is an automated message from SkillSwap &amp; ToolShare. You&#39;re receiving this because a password reset was requested for this email address.",
          }),
        });
        auditLog("password_reset_requested", { email: user.email });
      } catch (err) {
        logger.error("Failed to send password reset email:", err);
      }
    },
    // Note: Better Auth does not expose a password.validate hook in this version.
    // Password rules are enforced via Express middleware in index.ts using signUpSchema.
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const allowed = await checkEmailRateLimit(user.email);
      if (!allowed) {
        logger.warn("Verification email rate limit exceeded", { email: user.email });
        auditLog("verification_email_rate_limited", { email: user.email });
        return;
      }
      try {
        await sendEmail({
          to: user.email,
          subject: "Verify your email — SkillSwap & ToolShare",
          html: renderActionEmail({
            headerLabel: "Account Verification",
            eyebrow: "Action required",
            headingTop: "Verify your",
            headingBottom: "email address.",
            recipientName: user.name,
            bodyHtml:
              "Welcome to SkillSwap &amp; ToolShare — the community where your talent and resources are the currency. To activate your account and start exchanging skills and tools, please verify your email address by clicking the button below.<br><br>This link expires in <strong style=\"color:#111827;font-weight:600;\">24 hours</strong>.",
            buttonLabel: "Verify email &amp; start swapping",
            url,
            noticeHtml:
              "If you didn&#39;t create a SkillSwap &amp; ToolShare account, you can safely ignore this email. Someone may have entered your address by mistake.",
            footerHtml:
              "This is an automated message from SkillSwap &amp; ToolShare. You&#39;re receiving this because someone signed up for an account using this email address.",
          }),
        });
      } catch (err) {
        logger.error("Failed to send verification email:", err);
      }
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh if older than 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },

  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
  },

  // Safe access — FRONTEND_URL is required and validated by Zod at startup.
  // Avoid non-null assertion (!) which would pass `undefined` to Better Auth
  // if the var were missing, silently accepting any origin.
  trustedOrigins:
    process.env.NODE_ENV === "production"
      ? process.env.FRONTEND_URL
        ? [process.env.FRONTEND_URL]
        : []
      : ["http://localhost:3000"],

  advanced: {
    // Namespaces all cookies under "skillswap." (e.g. skillswap.session_token)
    // so they don't collide with other Better Auth apps sharing localhost in dev.
    cookiePrefix: "skillswap",
    cookies: {
      session_token: {
        attributes: {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict" as const,
        },
      },
    },
  },
});

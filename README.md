# SkillSwap & ToolShare

A web platform that unifies the direct exchange of services and the renting of tools — no money changes hands, each user's talent or resource is the currency.

**Backend:** C# / .NET 10 · ASP.NET Core Minimal APIs · EF Core · PostgreSQL · Redis · ASP.NET Core Identity · JWT (httpOnly cookies) · Serilog
**Frontend:** Next.js 16 (App Router) · TypeScript · Tailwind CSS · React-Leaflet · ky · Server-Sent Events

> The previous Node/Express + Prisma + Better Auth backend has been migrated to C#/.NET 10. It is preserved for reference under [`backend-node-legacy/`](backend-node-legacy/) and is **not** built or run.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React, TypeScript, Tailwind CSS |
| Maps | React-Leaflet, Leaflet, OpenStreetMap tiles |
| Geocoding | Nominatim (OpenStreetMap) — proxied through `GET /api/geocode`, Redis-cached |
| Backend | ASP.NET Core Minimal APIs, .NET 10, vertical-slice architecture |
| Auth | JWT access + refresh tokens in httpOnly cookies, CSRF double-submit, ASP.NET Core Identity for password hashing |
| ORM / DB | EF Core 10 + Npgsql, PostgreSQL 17 |
| Cache / Rate limiting / SSE pub-sub | Redis 7 (StackExchange.Redis) |
| Email | Resend |
| Validation | FluentValidation |
| Logging | Serilog |
| API docs (dev) | Scalar — `http://localhost:4000/scalar/v1` |
| Containerisation | Docker + Docker Compose |

---

## Quick Start (Development)

**Prerequisites:** Docker Desktop. (The .NET 10 SDK on the host is only needed if you want to build/test or add migrations outside the container.)

```bash
# 1. Clone and enter the project
git clone <your-repo-url>
cd "SkillSwap & ToolShare"

# 2. Configure backend secrets
cp backend/.env.example backend/.env
# Fill in:
#   Jwt__SigningKey        — any 32+ byte secret (openssl rand -base64 48)
#   MessageEncryption__Key — 32-byte hex (openssl rand -hex 32)
#   Geo__FuzzSecret        — 32-byte hex (openssl rand -hex 32)
#   Email__ResendApiKey    — optional; leave blank to log emails (incl. verification
#                            + magic-link codes) to the backend container console

# 3. Configure frontend environment
cp frontend/.env.local.example frontend/.env.local

# 4. Start the whole stack (db + redis + backend + frontend + pgAdmin)
docker compose -f docker-compose.dev.yml up --build
```

Migrations apply automatically on backend startup in Development, and a rich dev dataset is seeded on first run — no manual migrate/seed step.

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000 |
| API docs (Scalar) | http://localhost:4000/scalar/v1 |
| pgAdmin | http://localhost:5050 |

### Seeded accounts

A pre-verified developer account is always seeded:

| Email | Password |
|-------|----------|
| `dev@skillswap.local` | `Password123!` |

On first run a richer dataset is also seeded — 7 sample users, 12 categories, 10 skills, and 18 listings (8 skill offers + 10 tool listings) across Porto / Lisbon / Braga, with Unsplash cover images (best-effort; skipped if offline):

| Email | Location | Verified |
|-------|----------|----------|
| `ana.silva@example.com` | Bonfim, Porto | ✅ |
| `joao.ferreira@example.com` | Cedofeita, Porto | ✅ |
| `mariana.costa@example.com` | Baixa, Lisboa | — |
| `tiago.mendes@example.com` | Braga Centro | ✅ |
| `sofia.rodrigues@example.com` | Matosinhos | — |
| `admin@example.com` | Porto | ✅ |
| `test@example.com` | Porto | — (password `Password123!`) |

Password for the example users above (except `test@`): `Seedpass123!`.

---

## Environment Variables

`.NET` maps the `__` separator in env var names to a config-section `:`. In dev, `docker-compose.dev.yml` injects `backend/.env` (your secrets) and supplies the infra wiring (`ConnectionStrings__*`, `ASPNETCORE_*`) itself.

### Backend secrets (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `Jwt__SigningKey` | ✅ | HMAC-SHA256 key that signs JWT access tokens — 32+ bytes |
| `MessageEncryption__Key` | ✅ | 32-byte **hex** key for AES-256-GCM message/contract encryption |
| `Geo__FuzzSecret` | ✅ | 32-byte **hex** HMAC secret used to fuzz listing coordinates |
| `Email__ResendApiKey` | ❌ | Resend API key; blank → emails are logged to the console instead of sent |
| `Email__From` | ❌ | Sender address (default `onboarding@resend.dev`) |

### Backend infra config (set by compose in dev; inject yourself in prod)

| Variable | Description |
|----------|-------------|
| `ConnectionStrings__Postgres` | Postgres connection string |
| `ConnectionStrings__Redis` | Redis connection string |
| `ASPNETCORE_ENVIRONMENT` | `Development` / `Production` |
| `ASPNETCORE_URLS` | Listen URL (e.g. `http://+:4000`) |

Other tunables live in `appsettings.json` (token lifetimes, cookie names, rate limits, CORS origins, Nominatim base URL/User-Agent, media path).

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | ✅ | Backend API URL (e.g. `http://localhost:4000`) |
| `NEXT_PUBLIC_APP_URL` | ✅ | Frontend URL (e.g. `http://localhost:3000`) |

---

## Project Structure

Top level:

```
SkillSwap & ToolShare/
├── backend/                     # C#/.NET 10 backend (the live API)
├── backend-node-legacy/         # previous Node/Express + Prisma backend — reference only, not run
├── frontend/                    # Next.js 16 app
├── docs/                        # seeding.md (seed accounts/data reference)
├── e2e/                         # standalone exchange-flow scripts + captured screenshots
├── tests/                       # Playwright end-to-end suite (full-flow.spec.ts)
├── Ui-Concept/                  # original static UI mockups
├── API.md                       # endpoint reference
├── CONTRIBUTING.md
├── CLAUDE.md                    # contributor/agent dev-environment notes
├── README.md
├── docker-compose.dev.yml
└── docker-compose.prod.yml
```

### Backend (`backend/`)

```
backend/
├── SkillSwapToolShare.slnx                      # solution
├── src/SkillSwapToolShare.Api/
│   ├── Program.cs                               # composition root: DI, middleware pipeline, endpoint mapping
│   ├── appsettings.json                         # config defaults (JWT, cookies, rate limits, CORS, media, geo)
│   ├── appsettings.Development.json
│   ├── Common/
│   │   ├── Api/
│   │   │   ├── IEndpoint.cs                      # endpoint module contract
│   │   │   ├── EndpointExtensions.cs             # auto-discovery + mapping of IEndpoint modules
│   │   │   ├── ValidationFilter.cs              # FluentValidation → RFC-7807 ProblemDetails
│   │   │   ├── CsrfProtectionMiddleware.cs       # double-submit CSRF check for cookie-authed mutations
│   │   │   ├── RateLimitOptions.cs
│   │   │   └── RedisFixedWindowRateLimiter.cs    # Redis-backed fixed-window limiter
│   │   ├── AuditLog.cs                           # structured security/audit events
│   │   └── DisplayName.cs
│   ├── Domain/                                  # entities + enums (persistence-ignorant)
│   │   ├── Catalog/        Category.cs, Skill.cs
│   │   ├── Contracts/      ExchangeContract.cs, ContractStatus.cs
│   │   ├── Listings/       Listing.cs, ListingMedia.cs, SavedListing.cs, SkillListingDetail.cs,
│   │   │                   ToolListingDetail.cs, Availability.cs, Enums.cs
│   │   ├── Messaging/      Conversation.cs, ConversationParticipant.cs, Message.cs,
│   │   │                   MessageAttachment.cs, MessageType.cs, ScheduleProposal.cs
│   │   ├── Notifications/  Notification.cs, NotificationType.cs
│   │   ├── Profiles/       UserProfile.cs
│   │   ├── Reviews/        Review.cs
│   │   ├── Settings/       UserSettings.cs
│   │   ├── Users/          AppUser.cs, RefreshToken.cs, MagicLinkToken.cs
│   │   └── Verification/   IdentityDocument.cs, Enums.cs
│   ├── Features/                                # vertical slices — one file per endpoint (+ *Shared helpers)
│   │   ├── Auth/           Register, Login, Logout, Refresh, ChangePassword,
│   │   │                   VerifyEmail, ResendVerification, ForgotPassword, ResetPassword,
│   │   │                   RequestMagicLink, VerifyMagicLink, MagicLinkLanding, PasswordResetLanding
│   │   ├── Listings/       CreateListing, UpdateListing, DeleteListing, GetListing, ListListings,
│   │   │                   ListMapPins, GetMyListings, GetSavedListings, ToggleSaveListing,
│   │   │                   UploadListingMedia, DeleteListingMedia, ListingQuery, ListingsShared
│   │   ├── Conversations/  CreateConversation, GetConversation, ListConversations, GetMessages,
│   │   │                   SendMessage, MarkRead, GetUnreadTotal, GetConversationMedia,
│   │   │                   SendScheduleProposal, ConfirmScheduleSlot, TypingIndicator, ConversationsShared
│   │   ├── Contracts/      ProposeContract, PatchContract, GetConversationContract, ContractsShared
│   │   ├── Reviews/        CreateReview, GetReviewStatus, GetUserReviews
│   │   ├── Profile/        GetMyProfile, UpdateMyProfile, UploadAvatar, GetPublicProfile, ProfileShared
│   │   ├── Catalog/        ListCategories
│   │   ├── Notifications/  ListNotifications, GetUnreadCount, MarkNotificationRead, MarkAllRead, NotificationsShared
│   │   ├── Settings/       GetSettings, UpdateSettings, ExportData, DeleteAccount, SettingsShared
│   │   ├── Geocode/        ReverseGeocode, SearchGeocode      # Nominatim proxy
│   │   ├── Sse/            SseStream, SsePresence             # Server-Sent Events
│   │   └── Users/          GetMe                              # GET /api/users/me
│   ├── Infrastructure/
│   │   ├── Auth/           TokenService, AuthCookieService, AuthCookieOptions, JwtOptions,
│   │   │                   AccessTokenRevocation, OpaqueToken, EmailConfirmationTokenProvider,
│   │   │                   EmailVerificationOptions, MagicLinkOptions, PasswordResetOptions
│   │   ├── Crypto/         MessageCryptoService, MessageCryptoOptions   # AES-256-GCM
│   │   ├── Email/          EmailDispatcher, EmailQueue, EmailSendLimiter, EmailTemplates,
│   │   │                   IEmailSender, ResendEmailSender, LoggingEmailSender, EmailOptions
│   │   ├── Geo/            GeoService, GeoOptions             # Nominatim + coordinate fuzzing
│   │   ├── Media/          MediaService, MediaOptions         # upload validation + local storage
│   │   ├── Notifications/  NotificationService                # persist + SSE push
│   │   ├── Persistence/    AppDbContext, AppDbContextFactory, DbSeeder
│   │   └── Realtime/       SsePublisher, SseConnectionRegistry, SseRedisSubscriber
│   └── Migrations/                              # EF Core migrations (auto-applied on startup in Dev)
│       ├── InitialCreate, MagicLinkTokens, AddUserFields, AddDomainSchema,
│       ├── AddNotifications, AddUserSettings, RemoveProfileLocation
│       └── AppDbContextModelSnapshot.cs
└── tests/SkillSwapToolShare.Api.IntegrationTests/   # xUnit + Testcontainers (Postgres + Redis)
    ├── SkillSwapToolShareApiFactory.cs          # WebApplicationFactory + containers
    ├── AuthFlowTests, VerifyEmailTests, MagicLinkTests, PasswordResetTests, EmailCapTests,
    ├── CsrfTests, RateLimitTests, NotificationsTests, SettingsTests
    └── TestHttp, CapturingEmailSender, TestParallelization      # test helpers
```

### Frontend (`frontend/`)

```
frontend/
├── app/                                  # Next.js App Router
│   ├── layout.tsx                        # root layout (fonts, Toaster, AuthProvider)
│   ├── (auth)/                           # auth route group (no app chrome)
│   │   ├── login/  register/  forgot-password/  reset-password/  magic-link/  verify-email/
│   ├── (app)/                            # authenticated app shell (navbar + footer)
│   │   ├── page.tsx                      # landing / browse
│   │   ├── listings/  listings/[id]/  listings/new/
│   │   ├── map/  messages/  exchanges/  my-listings/  saved/
│   │   ├── notifications/  settings/  how/
│   │   └── profile/  profile/[id]/
│   └── dashboard/
├── components/
│   ├── AppNav.tsx  AppFooter.tsx  BrandLogo.tsx
│   └── ui/                               # shared primitives + Icons (button, toast, form, spinner, …)
├── features/                             # feature modules: components / hooks / lib / types
│   ├── auth/          AuthProvider, useSession, api-client usage, login/register/magic-link/verify forms
│   ├── listings/      browse, create-listing (wizard steps), listing-detail, map, my-listings
│   │                  + hooks (useListings, useListing, useMyListings, useGeolocation, useMapPins, …)
│   ├── conversations/ MessageThread, MessageInput, ProposeModal, DealCard, ConversationList
│   │                  + hooks (useConversation, useConversations, useSSE)
│   ├── notifications/ NotificationRow + useNotifications + types
│   ├── profile/       Avatar, AvatarUpload, ProfileForm, profile-view/*
│   ├── reviews/       ReviewModal
│   └── settings/      SettingsCard, ToggleRow, NotifRow, VerifyRow + useSettings
├── lib/                                  # api.ts (ky client + apiErrorMessage), api-client.ts (auth),
│                                         #   utils, useDebounce, fileValidation, getAppUrl
├── proxy.ts                              # dev edge proxy
├── next.config.ts  tailwind.config.ts  postcss.config.js  eslint.config.mjs  tsconfig.json
└── package.json
```

---

## Backend Development

The .NET 10 SDK is available on the host, so you can build and test directly:

```bash
dotnet build backend/SkillSwapToolShare.slnx
dotnet test  backend/SkillSwapToolShare.slnx    # integration tests use Testcontainers — Docker must be running
```

The dev container bind-mounts `./backend/src` and runs `dotnet watch`, hot-reloading most edits.

> **Windows caveat:** the bind-mount mtimes + persisted `obj`/`bin` anonymous volumes make `dotnet watch`'s incremental build occasionally skip a just-edited file, so the container silently runs stale code. A plain `up --build` does **not** fix this. When a change isn't taking effect, force a clean rebuild:
>
> ```bash
> docker compose -f docker-compose.dev.yml up -d --build --force-recreate --renew-anon-volumes backend
> ```

### Migrations (EF Core)

Migrations are committed to `src/SkillSwapToolShare.Api/Migrations/` and **auto-apply on startup in Development** — collaborators don't need to run anything after pulling. To add a new one:

```bash
dotnet tool restore                                                  # once (installs dotnet-ef)
dotnet ef migrations add <Name> --project backend/src/SkillSwapToolShare.Api
```

### NuGet packages

Add the `<PackageReference>` to `SkillSwapToolShare.Api.csproj`, then `dotnet restore` (or rebuild the container — restore runs during the Docker build).

### Frontend

No local `node_modules` — it runs in Docker. Run the TypeScript check inside the container:

```bash
docker exec skillswaptoolshare-frontend-1 sh -c "cd /app && npx tsc --noEmit 2>&1"
```

After changing frontend source, rebuild the frontend container so the change is reliably picked up:

```bash
docker compose -f docker-compose.dev.yml up --build -d frontend
```

---

## Authentication model

Tokens live in **httpOnly cookies**, never in the response body, so JavaScript can't read them — this neutralises token-stealing XSS. The cost is CSRF exposure, paid back with a double-submit token.

- **`access_token`** — short-lived JWT (15 min), scoped to `/api`, httpOnly.
- **`refresh_token`** — opaque token (30 days), scoped to `/api/auth`, httpOnly, rotated on use with family revocation.
- **`csrf_token`** — readable by JS (root path); the SPA echoes it back in the `X-CSRF-Token` header on every state-changing request. The `CsrfProtectionMiddleware` validates the double-submit. Its presence also lets the client cheaply tell whether a session exists without firing a guaranteed-401 `/users/me` probe.
- Email verification, magic-link sign-in, and password reset are all supported; per-address email sends are rate-limited (Redis-backed).

---

## Domain Design Decisions

### User identity vs. profile

ASP.NET Core Identity owns the `AppUser` table (credentials, email-confirmed flag). Application-level profile data lives in a separate `UserProfile` (1:1, bio, location, avatar, rating, review count). A profile row is created at registration. **Rule:** keep domain fields out of the Identity user table; they belong on `UserProfile`.

### Message & contract encryption

Every message stores `EncryptedContent` (AES-256-GCM ciphertext) + `Iv`, never plain text; encryption/decryption happen in the service layer via `MessageEncryption__Key`. The opening proposal message on an `ExchangeContract` is encrypted with the same key. Decryption failures degrade gracefully to a placeholder rather than throwing.

### Exchange contracts

An `ExchangeContract` is bound to the conversation it came from (`ConversationId`), so the chat thread can surface it inline. Status transitions (`accept` / `decline` / `complete` / `cancel`) are applied with guarded atomic updates so concurrent requests can't clobber each other; `complete` requires both parties to confirm before the contract flips to `COMPLETED`. Confirming a proposed schedule slot syncs the contract's scheduled start/end.

### Reviews

A review can only be left on a `COMPLETED` contract. `UserProfile.Rating` / `ReviewCount` are denormalised for fast reads and recomputed within the same transaction as the review write to prevent drift.

### Categories

Listing categories are a curated, seeded set (not free-form tags), keeping the browse/filter UI predictable. Each listing has an optional category FK (optional at the model level, required by validation for new listings). Add categories via a migration + the seeder, not at runtime.

### Geocoding & location

Listings carry optional `latitude` / `longitude` / `locationName`, set via the in-app picker which calls `GET /api/geocode`. The browser never calls Nominatim directly — requests are proxied so the `User-Agent` stays consistent and results are Redis-cached. Exact coordinates are fuzzed (HMAC-seeded with `Geo__FuzzSecret`) before exposure for privacy. Map browsing fetches by bounding box (`minLat`/`maxLat`/`minLng`/`maxLng`, validated together).

---

## Rate Limits

Redis-backed (so they hold across instances). Defaults in `appsettings.json`:

| Limiter | Scope | Default |
|---------|-------|---------|
| Global | all requests | 1000 / 15 min |
| API | authenticated API routes | 500 / 15 min |
| Auth | sign-in, sign-up, password reset | 20 / 15 min |
| Email | verification / reset / magic-link sends | 20 / 15 min (+ a per-address cap, default 5/hour) |

---

## Production

```bash
# Inject secrets via your platform's secrets manager — do NOT use an env_file in prod.
docker compose -f docker-compose.prod.yml up -d --build
```

The prod compose isolates the database and Redis on a backend-only network (the frontend can't reach them directly) and runs the backend behind `127.0.0.1`. Required environment / secrets:

| Variable | Notes |
|----------|-------|
| `Jwt__SigningKey` | 32+ byte signing secret |
| `MessageEncryption__Key` | 32-byte hex |
| `Geo__FuzzSecret` | 32-byte hex |
| `Email__ResendApiKey`, `Email__From` | Resend key + a verified-domain sender |
| `ConnectionStrings__Postgres` | Managed Postgres recommended |
| `ConnectionStrings__Redis` | Include the password: `host:6379,password=…` |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | used by the `db` service |
| `REDIS_PASSWORD` | used by the `redis` service |
| `FRONTEND_API_URL` | public backend URL baked into the frontend build |

Set `ASPNETCORE_ENVIRONMENT=Production`. Migrations auto-apply on startup; serve over HTTPS (cookies are `Secure` + `SameSite=Strict`).

---

## Troubleshooting

### Location / geolocation blocked

The "Use my location" button calls `navigator.geolocation`. If it does nothing:

1. **Browser-level block (most common on localhost).** Brave Shields, Firefox strict mode, or a remembered "Block" decision can silently deny it. Allow location for `http://localhost:3000` in the site/shield settings.
2. **OS-level (Windows).** Settings → Privacy & security → Location: enable Location services *and* "Let apps access your location" *and* your browser. Restart the browser after changing.
3. **HTTP outside localhost.** `navigator.geolocation` requires a secure context. On a LAN/staging HTTP origin it's blocked with no prompt — use Chrome's `chrome://flags/#unsafely-treat-insecure-origin-as-secure` for dev, or serve over HTTPS.

If geolocation is unavailable, every location field can still be filled via the address search box (which uses `/api/geocode`).

### Images not loading / "resolved to private ip"

In dev, Next.js's image optimizer can't fetch `localhost` (SSRF protection + the optimizer runs inside the frontend container). This is expected and already handled: `next.config.ts` sets `images.unoptimized: true` in development so the browser fetches images directly. In production `NEXT_PUBLIC_API_URL` is a real domain, so full optimization is active.

### Attachments rejected as "not a valid image"

Uploads are validated twice: the declared content-type must be on the allow-list (JPEG/PNG/WebP/GIF for images; + PDF/Word/text for documents), and the file's **magic bytes** must match. A file that claims to be an image but isn't (e.g. an iPhone **HEIC**/AVIF photo, or a renamed/synthetic file) is correctly refused — export it as JPEG or PNG. Chat attachments are capped at 10 MB.
</content>

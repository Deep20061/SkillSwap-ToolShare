# Seeding — Development Reference

Development data is seeded by `backend/src/SkillSwapToolShare.Api/Infrastructure/Persistence/DbSeeder.cs`.
It runs **automatically on backend startup in Development**, right after EF Core migrations are applied
(`Program.cs`: `MigrateAsync()` → `DbSeeder.SeedDevelopmentDataAsync(...)`). There is no manual seed
command — bringing the stack up seeds the database.

```bash
docker compose -f docker-compose.dev.yml up --build      # migrations + seed run on startup
```

## What gets created

Seeding happens in three layers:

1. **Dev account (always).** `dev@skillswap.local` / `Password123!`, pre-verified — created if missing.
2. **Catalog (always, idempotent).** 12 categories + 10 skills.
3. **Rich dataset (once).** 7 sample users with profiles, and 18 listings.

| Entity | Count |
|--------|-------|
| Sample users | 7 |
| Categories | 12 |
| Skills | 10 |
| Skill-offer listings | 8 |
| Tool listings | 10 |

Listing cover images and user avatars are downloaded from Unsplash at seed time into the media volume
(`Media:Path`, default `/app/media` — `listings/` and `avatars/`), served by the backend at `/media`.
Stored paths look like `/media/listings/<timestamp>-<guid>.jpg`, so the frontend prefixes them with
`NEXT_PUBLIC_API_URL`.

**A listing is only created if its cover image downloaded.** If a download fails (e.g. offline), that
listing is skipped rather than seeded without an image — so the seeded marketplace always looks
presentable. Avatar downloads are best-effort; a user is still created without an avatar if theirs fails.

## Idempotency

The rich seed is guarded by the marker account `ana.silva@example.com`. If it exists, the rich-seed step
is a no-op, so restarts never duplicate data. (Categories/skills are checked individually, so they're
safe to re-run too.)

To reseed from scratch, wipe the database and restart the backend:

```bash
docker compose -f docker-compose.dev.yml stop backend
docker compose -f docker-compose.dev.yml exec -T db psql -U postgres -c \
  "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='skillswap_toolshare' AND pid<>pg_backend_pid();"
docker compose -f docker-compose.dev.yml exec -T db psql -U postgres -c "DROP DATABASE skillswap_toolshare;"
docker compose -f docker-compose.dev.yml exec -T db psql -U postgres -c "CREATE DATABASE skillswap_toolshare;"
docker compose -f docker-compose.dev.yml up -d backend      # migrations + seed re-run on startup
```

---

## Seeded accounts

Password for the sample users is **`Seedpass123!`** (except `test@example.com`, which uses
`Password123!`, and the always-seeded `dev@skillswap.local`, also `Password123!`). Emails are confirmed
directly in the DB — no email delivery needed.

| Email | Name | Email verified |
|-------|------|----------------|
| `dev@skillswap.local` | Dev User | ✅ |
| `ana.silva@example.com` | Ana Silva | ✅ |
| `joao.ferreira@example.com` | João Ferreira | ✅ |
| `mariana.costa@example.com` | Mariana Costa | — |
| `tiago.mendes@example.com` | Tiago Mendes | ✅ |
| `sofia.rodrigues@example.com` | Sofia Rodrigues | — |
| `admin@example.com` | Admin User | ✅ |
| `test@example.com` | Test User | — |

> Profiles carry bio + avatar + identity-verified flag. **Location lives on listings, not on profiles.**

---

## Seeded categories

| Slug | Name |
|------|------|
| `home-repair` | Home & Repair |
| `garden-outdoor` | Garden & Outdoor |
| `kitchen` | Kitchen |
| `tech-coding` | Tech & Coding |
| `music` | Music |
| `languages` | Languages |
| `fitness-sport` | Fitness & Sport |
| `art-craft` | Art & Craft |
| `auto-bike` | Auto & Bike |
| `photo-video` | Photo & Video |
| `tutoring` | Tutoring |
| `events-party` | Events & Party |

---

## Seeded listings

### Skill offers

| Title | Owner | Category | Location |
|-------|-------|----------|----------|
| Guitar lessons for beginners | Ana | music | Bonfim, Porto |
| Woodworking & basic carpentry | Ana | home-repair | Bonfim / Campanhã, Porto |
| React & Next.js web development tutoring | João | tech-coding | Cedofeita, Porto |
| Yoga for stress & flexibility — all levels | João | fitness-sport | Jardim da Cordoaria, Porto |
| English conversation & business English | Mariana | languages | Baixa, Lisboa |
| Portrait & street photography workshop | Mariana | photo-video | Alfama, Lisboa |
| Authentic Portuguese cooking — bacalhau & more | Sofia | kitchen | Matosinhos, Porto |
| Drawing & illustration for beginners | Sofia | art-craft | Parque da Cidade, Porto |

### Tool listings

| Title | Owner | Category | Deposit (€) | Max days |
|-------|-------|----------|-------------|----------|
| Bosch cordless drill + bit set (18V) | Tiago | home-repair | 30 | 7 |
| 6m aluminium extension ladder | Tiago | home-repair | 20 | 3 |
| Sony A7III + 35mm f/1.8 lens for rent | Mariana | photo-video | 150 | 5 |
| Portable projector + 100" screen | João | events-party | 50 | 3 |
| KitchenAid stand mixer — baking loans | Sofia | kitchen | 80 | 4 |
| Brother sewing machine — ideal for beginners | Ana | art-craft | 40 | 7 |
| Sit-on-top kayak — single seat | Tiago | fitness-sport | 50 | 3 |
| Celestron telescope — stargazing nights | João | garden-outdoor | 60 | 5 |
| Kärcher K4 pressure washer | Tiago | garden-outdoor | 40 | 2 |
| Vinyl record player (belt-drive, Bluetooth) | Ana | music | 70 | 7 |

> Deposit amounts are stored in **cents** in the database (e.g. 3000 = €30.00). Each listing carries its
> own `latitude`/`longitude`/`locationName`.

# Dev Environment

The stack runs via Docker Compose (`docker-compose.dev.yml`): a C#/.NET 10 backend
(`SkillSwapToolShare.Api`, port 4000), a Next.js frontend (port 3000), Postgres, and Redis.

```bash
docker compose -f docker-compose.dev.yml up --build      # bring the whole stack up
```

Interactive API docs (dev only): http://localhost:4000/scalar/v1

## Backend (C#/.NET 10)

Lives in `backend/` — project `src/SkillSwapToolShare.Api`, tests
`tests/SkillSwapToolShare.Api.IntegrationTests`, solution `backend/SkillSwapToolShare.slnx`.
The .NET 10 SDK is available on the host, so build and test directly:

```bash
dotnet build backend/SkillSwapToolShare.slnx
dotnet test  backend/SkillSwapToolShare.slnx   # integration tests use Testcontainers — Docker must be running
```

The dev container bind-mounts `./backend/src` and runs `dotnet watch`, which hot-reloads most edits.
**Caveat (Windows):** the bind-mount mtimes + the persisted `obj`/`bin` anonymous volumes make
`dotnet watch`'s incremental build occasionally skip a just-edited file, so the container silently
runs stale code. A plain `up --build` does NOT fix this (it reuses the anon volumes). When a change
isn't taking effect, force a clean rebuild that renews the compiled-output volumes:

```bash
docker compose -f docker-compose.dev.yml up -d --build --force-recreate --renew-anon-volumes backend
```

### Migrations (EF Core)

```bash
dotnet tool restore                                                  # once (installs dotnet-ef)
dotnet ef migrations add <Name> --project backend/src/SkillSwapToolShare.Api
```

Migrations auto-apply on startup in Development.

### NuGet packages

Add the `<PackageReference>` to `SkillSwapToolShare.Api.csproj`, then `dotnet restore` (or rebuild
the container — restore runs during the Docker build).

## Frontend (Next.js)

No local `node_modules` — it runs in Docker. Run the TypeScript check inside the container:

```bash
docker exec skillswaptoolshare-frontend-1 sh -c "cd /app && npx tsc --noEmit 2>&1"
```

After changing frontend source, rebuild the frontend container so the change is reliably picked up:

```bash
docker compose -f docker-compose.dev.yml up --build -d frontend
```

## backend-node-legacy/

The previous Node/Express + Prisma backend, kept for reference only. It is not built or run —
ignore it for day-to-day work.

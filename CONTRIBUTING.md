# Contributing to SkillSwap & ToolShare

## Branching

- `main` is protected — **never push directly to main**
- Create a branch for every piece of work:
  - `feat/your-feature-name` — new features
  - `fix/your-fix-name` — bug fixes
  - `chore/description` — config, deps, tooling

## Workflow

1. Pull the latest main before starting:
   ```bash
   git checkout main
   git pull origin main
   ```
2. Create your branch:
   ```bash
   git checkout -b feat/your-feature-name
   ```
3. Make your changes and commit with clear messages:
   ```bash
   git commit -m "feat: add listings page"
   ```
4. Push your branch and open a Pull Request on GitHub:
   ```bash
   git push origin feat/your-feature-name
   ```
5. Request a review from at least one teammate before merging
6. **Squash and merge** — keeps the main history clean

## Pull Request rules

- PRs must target `main`
- Title should be clear and descriptive
- Include a short description of what changed and why
- Do not merge your own PR without at least one approval
- Resolve all comments before merging

## Commit messages

Use the following prefixes:

| Prefix | When to use |
|--------|-------------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `chore:` | Config, deps, tooling |
| `style:` | UI/CSS changes only |
| `refactor:` | Code restructure, no behaviour change |
| `docs:` | Documentation only |

## Local setup

See [README.md](README.md) — only requirement is **Docker Desktop**.

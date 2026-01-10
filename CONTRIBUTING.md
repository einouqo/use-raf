# Contributing

Thank you for your interest in contributing 🙏

## Getting Started

### 1. Fork and Clone

```bash
gh repo fork einouqo/use-raf --clone
cd use-raf
```

### 2. Create a Branch

Use conventional branch prefixes:

- `feature/*` — New functionality
- `fix/*` — Bug fixes
- `chore/*` — Maintenance tasks
- `docs/*` — Documentation updates

```bash
git checkout -b feature/your-feature-name
```

### 3. Make Your Changes

This project uses [devenv](https://devenv.sh/) for reproducible development environments.

**Option A: Manual activation**

```bash
devenv shell
```

**Option B: Automatic activation with direnv** (recommended)

Install [direnv](https://direnv.net/) to automatically activate the environment when entering the directory:

```bash
direnv allow
```

devenv automatically installs dependencies on shell activation. If it doesn't happen or you use an alternative environment setup, run the following command to install them manually:

```bash
pnpm i
```

That's it, you're all set.

### 4. Document Your Changes

This project uses [Changesets][changesets] for changelog generation and package publishing. If your changes affect any packages, create a changeset:

```bash
pnpm changeset
```

Follow the prompts to document your changes. The changeset file will be committed with your code.

### 5. Commit Your Changes

Follow [Conventional Commits][conv-commits] format:

```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve timer bug"
git commit -m "docs: update readme"
```

### 6. Push and Create a PR

```bash
git push origin feature/your-feature-name
gh pr create
```

## 🔒 Automated Checks

Git hooks (via Husky) will automatically:

- **pre-commit** — Run linting and tests (`pnpm run verify`)
- **commit-msg** — Validate conventional commit format

<!--links:start-->
[changesets]: https://github.com/changesets/changesets
[conv-commits]: https://www.conventionalcommits.org/en/v1.0.0/
<!--links:end-->

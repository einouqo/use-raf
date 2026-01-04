# Contributing

Thank you for your interest in contributing 🙏

## Getting Started

### 1. Fork and Clone

```bash
gh repo fork einouqo/use-raf --clone
cd use-raf
bun i
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

Write your code and ensure it follows the project standards.

### 4. Commit Your Changes

Follow [Conventional Commits][convent-commits] format:

```bash
git commit -m "feat: add new feature"
git commit -m "fix: resolve timer bug"
git commit -m "docs: update readme"
```

### 5. Push and Create a PR

```bash
git push origin feature/your-feature-name
gh pr create
```

## 🔒 Automated Checks

Git hooks (via Husky) will automatically:

- **pre-commit** — Run linting and tests (`bun run verify`)
- **commit-msg** — Validate conventional commit format

<!--links:start-->
[convent-commits]: https://www.conventionalcommits.org/en/v1.0.0/
<!--links:end-->

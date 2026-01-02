# 🎞️ use-raf

> Build better UX with frame-synchronized hooks.

A hook collection built over the [requestAnimationFrame window API][mdn-window-raf]

## Contributing

1. **Fork and clone the repository**

   ```bash
   gh repo fork einouqo/use-raf --clone
   cd use-raf
   bun i
   ```

2. **Create a branch** using prefixes: `feature/*`, `fix/*`, `chore/*`, or `docs/*`

   ```bash
   git checkout -b feature/your-feature
   ```

3. **Make your changes** and verify they pass all checks

   ```bash
   bun run verify  # runs lint + test
   ```

4. **Commit** following [Conventional Commits][convent-commits]

   ```bash
   git commit -m "feat: add new feature"
   ```

5. **Push and create a Pull Request**

   ```bash
   git push origin feature/your-feature
   gh pr create
   ```

<!-- links -->
[mdn-window-raf]: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
[convent-commits]: https://www.conventionalcommits.org/en/v1.0.0/

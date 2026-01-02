# 🎞️ use-raf

> Build better UX with frame-synchronized hooks.

[![codecov][codecov-badge]][codecov-lint]
[![CodSpeed Badge][codspeed-badge]][codspeed-link]
[![License][license-badge]][license-link]

A hook collection built over the [requestAnimationFrame window API][mdn-window-raf]

<!-- links -->
[codecov-badge]: https://codecov.io/github/einouqo/use-raf/graph/badge.svg?token=GGLR5U3RXO
[codecov-lint]: https://codecov.io/github/einouqo/use-raf
[codspeed-badge]: https://img.shields.io/endpoint?url=https://codspeed.io/badge.json
[codspeed-link]: https://codspeed.io/einouqo/use-raf
[license-badge]: https://img.shields.io/badge/license-MIT-blue.svg
[license-link]: https://github.com/einouqo/use-raf/blob/main/LICENSE
[mdn-window-raf]: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
<!-- end links -->

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
[convent-commits]: https://www.conventionalcommits.org/en/v1.0.0/
<!-- end links -->

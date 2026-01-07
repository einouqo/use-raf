# 🎞️ use-raf

> Build better UX with frame-synchronized hooks.

[![codecov][codecov-badge]][codecov-link]
[![CodSpeed Badge][codspeed-badge]][codspeed-link]
[![License][license-badge]][license-link]

A hook collection built over the [requestAnimationFrame window API][mdn-window-raf]

- React Hooks:
  - [useRafLoop](./packages/loop/) - controlled, frame-synchronized repetitive callback execution.
  - [useRafTimer](./packages/timer/) - controlled, frame-synchronized timer / countdown.
  - [useRafState](./packages/state/) - reactive state which updates on next repaint (`requestAnimationFrame`)
- [Utilities](./packages/skd/) - frame-synchronized replacement for `setTimeout` and `setInterval` window's methods

<!--links:start-->
[codecov-badge]: https://codecov.io/github/einouqo/use-raf/graph/badge.svg?token=GGLR5U3RXO
[codecov-link]: https://codecov.io/github/einouqo/use-raf
[codspeed-badge]: https://img.shields.io/endpoint?url=https://codspeed.io/badge.json
[codspeed-link]: https://codspeed.io/einouqo/use-raf
[license-badge]: https://img.shields.io/badge/license-MIT-blue.svg
[license-link]: https://github.com/einouqo/use-raf/blob/main/LICENSE
[mdn-window-raf]: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
<!--links:end-->

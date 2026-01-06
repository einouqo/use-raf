# @use-raf/loop

A React hook for creating controlled, frame-rate customizable `requestAnimationFrame` loops.

## Installation

```bash
npm install @use-raf/loop
```

## Usage

```tsx
import { useRafLoop, fps } from '@use-raf/loop'
import { useState } from 'react'

const Demo = () => {
  const [count, setCount] = useState(0)
  const [isActive, setActive] = useState(false)

  const { start, stop } = useRafLoop(
    (timestamp, delta) => {
      setCount(c => c + 1)
    },
    { immediate: false, setActive }
  )

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={isActive ? stop : start}>
        {isActive ? 'Stop' : 'Start'}
      </button>
    </div>
  )
}
```

Throttling example:

```tsx
const Demo = () => {
  useRafLoop(
    (timestamp, delta) => {
      // Runs at 30 FPS
    },
    { throttle: fps(30) }
  )
}
```

## API

### `useRafLoop(callback, options?)`

**Parameters:**

- `callback: (timestamp: number, delta: number) => void` - Function executed on each frame
- `options.immediate?: boolean` - Start loop on mount (default: `true`)
- `options.throttle?: number` - Minimum milliseconds between callbacks (default: `0`)
- `options.setActive?: (active: boolean) => void` - Track loop state

**Returns:**

- `start: () => void` - Start the loop
- `stop: () => void` - Stop the loop

### `fps(frames: number)`

Converts FPS to milliseconds per frame for the `throttle` option.

## Performance

Benchmarked against `react-use` and `@shined/react-use`. While having heavier (~10-15%) mount cost, all hooks show about the same performance without throttling. When throttling is enabled, `@use-raf/loop` uses a combination of `setTimeout` and `requestAnimationFrame` to maintain the target frame rate, showing better performance over `@shined/react-use` with relatively high throttling. Note that `react-use` does not support throttling and was excluded from throttling benchmarks.

### Benchmark Results

| Test | @use-raf/loop | react-use | @shined/react-use | @reactuses/core |
|------|---------------|-----------|-------------------|------------------|
| Mount cost (hz) | 14,088.99 | **16,497.18** | 15,469.66 | 16,188.77 |
| No throttle (hz) | 67.33 | 63.63 | 64.89 | **69.63** |
| 120 FPS throttle (hz) | **61.71** | — | 61.08 | — |
| 60 FPS throttle (hz) | **64.78** | — | 60.83 | — |
| 30 FPS throttle (hz) | **92.21** | — | 61.21 | — |
| 10 FPS throttle (hz) | **222.08** | — | 61.10 | — |

*Higher hz values indicate better performance. Bold values represent the best result for each test.*

**Hardware:** Apple M2 Max (12 cores @ 3.50 GHz), 32 GB RAM

**Running benchmarks:**

```bash
bun run bench
```

**Performance regression tracking:** benchmark results are continuously monitored via [CodSpeed][codecov-link] to detect performance regressions.

<!--links:start-->
[codecov-link]: https://codecov.io/github/einouqo/use-raf
<!--links:end-->

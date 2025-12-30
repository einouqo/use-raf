# @use-raf/loop

A React hook for creating controlled `requestAnimationFrame` loops.

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

Benchmarked against `react-use` and `@shined/react-use`. While having heavier (~10-15%) mount cost, all hooks show about the same performance without throttling. When throttling is enabled, this implementation uses a combination of `setTimeout` and `requestAnimationFrame` to maintain the target frame rate. Note that `react-use` does not support throttling and was excluded from throttling benchmarks.

### Benchmark Results

| Test | @use-raf/loop | react-use | @shined/react-use |
|------|---------------|-----------|-------------------|
| Mount cost (hz) | 14,962.55 | **17,198.80** | 15,360.92 |
| No throttle (hz) | **66.32** | 63.66 | 62.90 |
| 120 FPS throttle (hz) | **63.73** | — | 60.69 |
| 60 FPS throttle (hz) | **62.73** | — | 62.56 |
| 30 FPS throttle (hz) | **84.10** | — | 62.51 |
| 10 FPS throttle (hz) | **200.36** | — | 62.55 |

*Higher hz values indicate better performance. Bold values represent the best result for each test.*

**Hardware:** Apple M2 Max (12 cores @ 3.50 GHz), 32 GB RAM

## License

MIT

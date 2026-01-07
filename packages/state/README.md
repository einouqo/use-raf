# @use-raf/state

A React hook that synchronizes state updates with `requestAnimationFrame` for optimal rendering performance.

## Installation

```bash
npm install @use-raf/state
```

## Usage

```tsx
import { useRafState } from '@use-raf/state'

const Demo = () => {
  const [count, setCount] = useRafState(0)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(prev => prev - 1)}>Decrement</button>
    </div>
  )
}
```

High-frequency updates example:

```tsx
const Demo = () => {
  const [position, setPosition] = useRafState({ x: 0, y: 0 })

  const handleMouseMove = (e: MouseEvent) => {
    // Updates are automatically batched to the next frame
    setPosition({ x: e.clientX, y: e.clientY })
  }

  return (
    <div onMouseMove={handleMouseMove}>
      <p>Position: {position.x}, {position.y}</p>
    </div>
  )
}
```

## API

### `useRafState<S>(initialState?)`

**Parameters:**

- `initialState: S | (() => S)` - Initial state value or lazy initializer function

**Returns:**

- `[state, setState]` - Current state and setter function (identical to `useState` API)

## Performance

Benchmarked against similar hooks from popular libraries. While `react-use` leads in all scenarios, `@use-raf/state` remains competitive with both the best-performing `react-use` and `@shined/react-use`, slightly outperforming the latter across throughput tests.

### Benchmark Results

| Test | @use-raf/state | react-use | @shined/react-use | @reactuses/core |
|------|----------------|-----------|-------------------|-----------------|
| Mount cost (hz) | 14,694.06 | **16,423.23** | 15,427.73 | 16,121.82 |
| Single update/frame (hz) | 168.83 | **174.01** | 154.90 | 48.59 |
| Batched updates (hz) | 480.80 | **516.77** | 499.28 | 282.33 |
| Updater functions (hz) | 164.54 | **170.44** | 148.11 | 48.31 |
| Complex state (hz) | 274.43 | **283.95** | 252.28 | 93.99 |

*Higher hz values indicate better performance. Bold values represent the best result for each test.*

**Hardware:** Apple M2 Max (12 cores @ 3.50 GHz), 32 GB RAM

**Running benchmarks:**

```bash
bun run bench
```

**Performance regression tracking:** benchmark results are continuously monitored via [CodSpeed][codspeed-link] to detect performance regressions.

<!--links:start-->
[codspeed-link]: https://codspeed.io/einouqo/use-raf
<!--links:end-->

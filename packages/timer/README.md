# @use-raf/timer

A React hook for creating frame-synchronized timers using `requestAnimationFrame`.

## Installation

```bash
npm install @use-raf/timer
```

## Usage

```tsx
import { useRafTimer } from '@use-raf/timer'

const Demo = () => {
  const { isActive, elapsed, start, stop, reset } = useRafTimer({
    duration: 5000, // 5 seconds
    onComplete: () => console.log('Timer completed!'),
  })

  return (
    <div>
      <p>Elapsed: {Math.floor(elapsed)}ms</p>
      <p>Status: {isActive ? 'Running' : 'Stopped'}</p>
      <button onClick={start} disabled={isActive}>Start</button>
      <button onClick={stop} disabled={!isActive}>Stop</button>
      <button onClick={reset}>Reset</button>
    </div>
  )
}
```

With throttled updates:

```tsx
const Demo = () => {
  const { elapsed } = useRafTimer({
    duration: 10000,
    throttle: 100, // Update every 100ms
    onUpdate: (elapsed) => {
      console.log(`Elapsed: ${elapsed}ms`)
    },
  })
}
```

## API

### `useRafTimer(options)`

**Parameters:**

- `duration: number` - Timer duration in milliseconds
- `immediate?: boolean` - Start timer on mount (default: `false`)
- `throttle?: number` - Minimum milliseconds between updates (default: `0`)
- `onUpdate?: (elapsed: number) => void` - Called on each frame with elapsed time
- `onComplete?: () => void` - Called when timer completes

**Returns:**

- `isActive: boolean` - Whether the timer is running
- `elapsed: number` - Current elapsed time in milliseconds
- `start: () => void` - Start the timer
- `stop: () => void` - Pause the timer
- `reset: () => void` - Stop and reset elapsed time to 0
- `sink: () => void` - Stop the timer and trigger `onComplete`

## Combining with `useProgress`

The `useProgress` hook calculates normalized progress (0-1) from elapsed time:

```tsx
import { useRafTimer, useProgress } from '@use-raf/timer'

const ProgressDemo = () => {
  const duration = 5000

  const { elapsed, start, stop, reset } = useRafTimer({ duration })
  const { progress } = useProgress({
    elapsed,
    duration,
    precision: 2, // Round to 2 decimal places
  })

  return (
    <div>
      <div style={{ width: `${progress * 100}%`, height: 20, background: 'blue' }} />
      <p>Progress: {(progress * 100).toFixed(0)}%</p>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
      <button onClick={reset}>Reset</button>
    </div>
  )
}
```

### `useProgress(options)`

**Parameters:**

- `elapsed: number` - Current elapsed time in milliseconds
- `duration: number` - Total duration in milliseconds
- `precision?: number` - Number of decimal places to round to (default: `4`)

**Returns:**

- `progress: number` - Progress value between 0 and 1

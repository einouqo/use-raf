# @use-raf/skd

> **skd** is short for **scheduler** and refers to scheduling utilities.\
> Frame-synchronized replacement for `setTimeout` and `setInterval` window's methods

Schedule callbacks to execute on the animation frame.

## Installation

```bash
npm install @use-raf/skd
```

## Usage

### `setFrameTimeout`

A function that combines `setTimeout` and `requestAnimationFrame` to execute a callback after a delay, synchronized with the browser's rendering cycle.

```tsx
import { setFrameTimeout } from '@use-raf/skd'

// Basic usage
const cancel = setFrameTimeout((timestamp) => {
  console.log('Executed at', timestamp)
}, 1000)

// With additional arguments
setFrameTimeout((timestamp, message, count) => {
  console.log(timestamp, message, count)
}, 500, 'Hello', 42)

// Cancel before execution
cancel()
```

### `setFrameInterval`

A function that schedules a handler to be called repeatedly on animation frames at the specified interval, with drift correction.

```tsx
import { setFrameInterval } from '@use-raf/skd'

// Basic usage - execute every second
const cancel = setFrameInterval((timestamp) => {
  console.log('Tick at', timestamp)
}, 1000)

// With additional arguments
setFrameInterval((timestamp, message) => {
  console.log(message, timestamp)
}, 500, 'Update:')

// Stop the interval
cancel()
```

## API

### Types

```tsx
type FrameTimeoutHandler<A extends unknown[] = []> = (timestamp: number, ...args: A) => void
type FrameIntervalHandler<A extends unknown[] = []> = (timestamp: number, ...args: A) => void
type Cancel = () => void
```

### `setFrameTimeout(handler, delay?, ...args)`

- `handler: FrameTimeoutHandler<A>` - Callback to execute
- `delay?: number` - Delay in milliseconds (default: `0`)
- `...args: A` - Arguments passed to the handler
- **Returns:** `Cancel`

### `setFrameInterval(handler, delay?, ...args)`

- `handler: FrameIntervalHandler<A>` - Callback to execute repeatedly
- `delay?: number` - Interval in milliseconds (default: `0`)
- `...args: A` - Arguments passed to the handler
- **Returns:** `Cancel`

Provides drift-corrected interval execution synchronized with the browser's rendering cycle.

## Why use this?

Combines precise timing with `requestAnimationFrame` synchronization:

- **Frame synchronization** - Executes at frame start, preventing layout thrashing and visual jitter
- **Tab visibility** - Pauses when tab is inactive, resumes when user returns
- **Drift correction** (interval) - Maintains accurate intervals over time by compensating for timing drift

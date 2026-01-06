# @use-raf/skd

> **skd** is short for **scheduler** and refers to scheduling utilities.\
> Frame-synchronized replacement for `setTimeout` and `setInterval` window's methods

Schedule callbacks to execute on the animation frame.

## Installation

```bash
npm install @use-raf/skd
```

## Usage

### `setFrame`

A thin wrapper around `requestAnimationFrame` that schedules a handler to be called on the next animation frame.

```tsx
import { setFrame } from '@use-raf/skd'

// Execute on next frame
const cancel = setFrame((timestamp) => {
  console.log('Frame at', timestamp)
})

// Cancel before execution
cancel()
```

### `setTimeoutFrame`

Combines `setTimeout` and `requestAnimationFrame` to execute a callback after a delay, synchronized with the browser's rendering cycle.

```tsx
import { setTimeoutFrame } from '@use-raf/skd'

// Basic usage
const cancel = setTimeoutFrame((timestamp) => {
  console.log('Executed at', timestamp)
}, 1000)

// With additional arguments
setTimeoutFrame((timestamp, message, count) => {
  console.log(timestamp, message, count)
}, 500, 'Hello', 42)

// Cancel before execution
cancel()
```

### `setIntervalFrame`

Schedules a handler to be called repeatedly on animation frames at the specified interval, with drift correction.

```tsx
import { setIntervalFrame } from '@use-raf/skd'

// Execute every second
const cancel = setIntervalFrame((timestamp) => {
  console.log('Tick at', timestamp)
}, 1000)

// With additional arguments
setIntervalFrame((timestamp, message) => {
  console.log(message, timestamp)
}, 500, 'Update:')

// Stop the interval
cancel()
```

## API

### Types

```tsx
type FrameHandler = (timestamp: number) => void
type TimeoutFrameHandler<A extends unknown[] = []> = (timestamp: number, ...args: A) => void
type IntervalFrameHandler<A extends unknown[] = []> = (timestamp: number, ...args: A) => void
type Cancel = () => void
```

### `setFrame(callback)`

- `callback: FrameHandler` - Callback to execute on next frame
- **Returns:** `Cancel`

### `setTimeoutFrame(handler, delay?, ...args)`

- `handler: TimeoutFrameHandler<A>` - Callback to execute
- `delay?: number` - Delay in milliseconds (default: `0`)
- `...args: A` - Arguments passed to the handler
- **Returns:** `Cancel`

### `setIntervalFrame(handler, delay?, ...args)`

- `handler: IntervalFrameHandler<A>` - Callback to execute repeatedly
- `delay?: number` - Interval in milliseconds (default: `0`)
- `...args: A` - Arguments passed to the handler
- **Returns:** `Cancel`

Provides drift-corrected interval execution synchronized with the browser's rendering cycle.

## Why use this?

Combines precise timing with `requestAnimationFrame` synchronization:

- **Frame synchronization** - Executes at frame start, preventing layout thrashing and visual jitter
- **Tab visibility** - Pauses when tab is inactive, resumes when user returns
- **Drift correction** (interval) - Maintains accurate intervals over time by compensating for timing drift

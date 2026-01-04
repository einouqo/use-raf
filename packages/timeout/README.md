# @use-raf/timeout

Schedule callbacks to execute on the next animation frame after a specified delay.

## Installation

```bash
npm install @use-raf/timeout
```

## Usage

### `setFrameTimeout`

A function that combines `setTimeout` and `requestAnimationFrame` to execute a callback after a delay, synchronized with the browser's rendering cycle.

```tsx
import { setFrameTimeout } from '@use-raf/timeout'

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

### `useFrameTimeout`

A React hook wrapper for `setFrameTimeout` that automatically handles cleanup and supports dependency tracking.

```tsx
import { useFrameTimeout } from '@use-raf/timeout'

const Demo = () => {
  const [count, setCount] = useState(0)

  useFrameTimeout((timestamp) => {
    setCount(c => c + 1)
  }, 2000)

  return <p>Count: {count}</p>
}
```

With dependencies:

```tsx
const Demo = () => {
  const [userId, setUserId] = useState(1)

  useFrameTimeout((timestamp) => {
    console.log('Fetching data for user', userId)
    // Fetch user data after delay
  }, 1000, [userId])

  return (
    <div>
      <button onClick={() => setUserId(1)}>User 1</button>
      <button onClick={() => setUserId(2)}>User 2</button>
    </div>
  )
}
```

## API

### `setFrameTimeout(handler, delay?, ...args)`

**Parameters:**

- `handler: (timestamp: number, ...args: A) => void` - Callback function to execute
- `delay?: number` - Delay in milliseconds before scheduling the animation frame (default: `0`)
- `...args: A` - Additional arguments to pass to the handler

**Returns:**

- `() => void` - Cancel function that clears both the timeout and animation frame

### `useFrameTimeout(handler, delay?, deps?)`

**Parameters:**

- `handler: (timestamp: number) => void` - Callback function to execute
- `delay?: number` - Delay in milliseconds before scheduling the animation frame
- `deps?: DependencyList` - Optional dependencies that trigger timeout restart (default: `[]`)

**Returns:**

`void` - The hook automatically handles cleanup on unmount

**Note:** The `delay` parameter is always reactive - changing it will restart the timeout. Use the `deps` array for other dependencies that should trigger a restart.

## Why use this?

Combines `setTimeout` timing with `requestAnimationFrame` precision, providing:

- **Frame synchronization** - Executes callbacks at the start of the render cycle, preventing layout thrashing and visual jitter caused by mid-frame updates.
- **Tab visibility handling** - Defers the callback execution until the tab becomes active. This ensures visual updates occur exactly when the user returns, rather than running invisibly in the background.

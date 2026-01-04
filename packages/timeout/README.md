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

A React hook that returns a memoized schedule function.

```tsx
const Toast = ({ message }) => {
  const [visible, setVisible] = useState(true)
  const cancelRef = useRef<Cancel>()
  const hide = useFrameTimeout(() => setVisible(false), 3000)

  useEffect(() => {
    cancelRef.current = hide()
  }, [hide])

  const handleMouseEnter = () => {
    cancelRef.current?.()
  }

  const handleMouseLeave = () => {
    cancelRef.current = hide()
  }

  if (!visible) return null

  return (
    <div
      className="toast"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {message}
    </div>
  )
}
```

## API

### Types

```tsx
type FrameTimeoutHandler<A extends unknown[] = []> = (timestamp: number, ...args: A) => void
type Cancel = () => void
type Schedule<A extends unknown[] = []> = (...args: A) => Cancel
```

### `setFrameTimeout(handler, delay?, ...args)`

- `handler: FrameTimeoutHandler<A>` - Callback to execute
- `delay?: number` - Delay in milliseconds (default: `0`)
- `...args: A` - Arguments passed to the handler
- **Returns:** `Cancel`

### `useFrameTimeout(handler, delay?)`

- `handler: FrameTimeoutHandler<A>` - Callback to execute
- `delay?: number` - Delay in milliseconds (default: `0`)
- **Returns:** `Schedule<A>`

The handler uses the latest version from each render. The schedule function is memoized by delay.

## Why use this?

Combines `setTimeout` timing with `requestAnimationFrame` precision:

- **Frame synchronization** - Executes at frame start, preventing layout thrashing and visual jitter
- **Tab visibility** - Pauses when tab is inactive, resumes when user returns

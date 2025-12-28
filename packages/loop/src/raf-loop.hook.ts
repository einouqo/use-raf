import { useCallback, useEffect, useRef } from 'react'

/**
 * Callback function that receives the current timestamp and delta time.
 *
 * @param timestamp - The current time in milliseconds from `performance.now()`
 * @param delta - Time elapsed in milliseconds since the last callback invocation
 */
type Callback = (timestamp: number, delta: number) => void

/**
 * Converts frames per second to milliseconds per frame for use with throttle option.
 *
 * @param frames - Target frames per second
 * @returns Milliseconds per frame
 *
 * @example
 * ```tsx
 * // Run at 30 FPS
 * useRafLoop(callback, { throttle: fps(30) })
 *
 * // Run at 15 FPS
 * useRafLoop(callback, { throttle: fps(15) })
 * ```
 */
export const fps = (frames: number) => 1_000 /* 1 second */ / frames

type Options = {
  /**
   * Whether to start the loop immediately on mount.
   * @default true
   */
  immediate?: boolean
  /**
   * Minimum time in milliseconds between callback invocations.
   * Use 0 for no throttling (runs every frame).
   * @default 0
   */
  throttle?: number
  /**
   * Optional callback to track the loop's active state.
   * Called with `true` when the loop starts and `false` when it stops.
   */
  setActive?: (active: boolean) => void
}

type Return = {
  /**
   * Starts the animation frame loop.
   * Safe to call multiple times - will not create duplicate loops.
   */
  start: () => void
  /**
   * Stops the animation frame loop.
   * Safe to call multiple times or when already stopped.
   */
  stop: () => void
}

/**
 * A React hook for creating a controlled `requestAnimationFrame` loop.
 *
 * Provides manual control over a frame-synchronized loop with optional throttling.
 * The callback receives the current timestamp and delta time on each frame.
 *
 * @param callback - Function to execute on each frame, receives timestamp and delta
 * @param options - Configuration options for the loop behavior
 * @returns Object with `start` and `stop` functions to control the loop
 *
 * @example
 * ```tsx
 * const { start, stop } = useRafLoop(
 *   (timestamp, delta) => {
 *     console.log(`Frame at ${timestamp}ms, delta: ${delta}ms`)
 *   },
 *   { immediate: false, throttle: fps(30) }
 * )
 *
 * // Start the loop manually
 * start()
 *
 * // Stop when needed
 * stop()
 * ```
 *
 * @example
 * ```tsx
 * // With state tracking
 * const [isActive, setActive] = useState(false)
 * const { start, stop } = useRafLoop(
 *   (timestamp, delta) => {
 *     // Animation logic
 *   },
 *   { setActive }
 * )
 * ```
 */
export const useRafLoop = (
  callback: Callback,
  { immediate = true, throttle = 0, setActive }: Options = {},
): Return => {
  const callbackRef = useRef(callback)
  const setActiveRef = useRef(setActive)
  useEffect(() => {
    callbackRef.current = callback
    setActiveRef.current = setActive
  })

  const throttleRef = useRef(throttle)
  useEffect(() => {
    throttleRef.current = throttle
  }, [throttle])

  const requestInfoRef = useRef<{
    id: number
    timestamp?: number
  } | null>(null)

  const loop = useCallback((timestamp: number) => {
    if (requestInfoRef.current === null) {
      return
    }

    const last = requestInfoRef.current.timestamp
    const delta = timestamp - (last ?? timestamp)

    // NOTE: the "edge" term is taken from the mdn throttle documentation
    // "The first call ... is known as the leading edge."
    // "After n milliseconds have elapsed from the first call ..., we have reached the trailing edge." (here n ms is a throttle duration)
    // We fire when we cross that edge (start of a new throttle window).
    // Ref: https://developer.mozilla.org/en-US/docs/Glossary/Throttle
    const isBeyondEdge = !last || delta >= throttleRef.current
    if (!isBeyondEdge) {
      requestInfoRef.current.id = requestAnimationFrame(loop)
      return
    }

    callbackRef.current(timestamp, delta)

    // NOTE: post-flight check in case the stop function has been called in the callback
    if (requestInfoRef.current === null) {
      return
    }

    requestInfoRef.current.timestamp = timestamp
    requestInfoRef.current.id = requestAnimationFrame(loop)
  }, [])

  const stop = useCallback(() => {
    if (requestInfoRef.current === null) {
      return
    }
    cancelAnimationFrame(requestInfoRef.current.id)
    requestInfoRef.current = null
    setActiveRef.current?.(false)
  }, [])

  const start = useCallback(() => {
    if (requestInfoRef.current !== null) {
      return
    }
    const id = requestAnimationFrame(loop)
    requestInfoRef.current = { id }
    setActiveRef.current?.(true)
  }, [loop])

  // biome-ignore lint/correctness/useExhaustiveDependencies: lifecycle effect
  useEffect(() => {
    immediate && start()
    return stop
  }, [])

  return { stop, start }
}

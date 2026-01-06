import type { Cancel, FrameHandler, TimeoutFrameHandler } from '@use-raf/skd'
import { setFrame, setTimeoutFrame } from '@use-raf/skd'
import { useCallback, useEffect, useRef } from 'react'

/**
 * Callback function that receives the current timestamp and delta time.
 *
 * @param timestamp - The current time in milliseconds DOMHighResTimeStamp from requestAnimationFrame
 * @param delta - Time elapsed in milliseconds since the last callback invocation
 */
export type RafLoopCallback = (timestamp: number, delta: number) => void

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
 * ```
 */
export const fps = (frames: number) => 1_000 /* 1 second */ / frames

export type RafLoopOptions = {
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

export interface RafLoopReturn {
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

const avg = (first: number, ...rest: number[]) =>
  (first + rest.reduce((sum, num) => sum + num, 0)) / (rest.length + 1)

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
  callback: RafLoopCallback,
  { immediate = true, throttle = 0, setActive }: RafLoopOptions = {},
): RafLoopReturn => {
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

  const frameRef = useRef<{
    cancel: Cancel
    timestamp?: number
    duration?: number
  } | null>(null)

  const loop = useCallback(
    ((timestamp: number) => {
      if (frameRef.current === null) {
        return
      }

      const last = frameRef.current.timestamp
      const delta = timestamp - (last ?? timestamp)

      callbackRef.current(timestamp, delta)

      // NOTE: post-flight check in case stop was triggered during callback execution
      if (frameRef.current === null) {
        return
      }

      const duration = frameRef.current.duration ?? delta
      frameRef.current.duration = avg(duration, duration, delta)
      frameRef.current.timestamp = timestamp

      frameRef.current.cancel =
        throttleRef.current > frameRef.current.duration
          ? setTimeoutFrame(loop, throttleRef.current)
          : setFrame(loop)
    }) satisfies FrameHandler & TimeoutFrameHandler,
    [],
  )

  const stop = useCallback(() => {
    if (frameRef.current === null) {
      return
    }

    frameRef.current.cancel()
    frameRef.current = null

    setActiveRef.current?.(false)
  }, [])

  const start = useCallback(() => {
    if (frameRef.current !== null) {
      return
    }

    const cancel = setFrame(loop)
    frameRef.current = { cancel }

    setActiveRef.current?.(true)
  }, [loop])

  // biome-ignore lint/correctness/useExhaustiveDependencies: lifecycle effect
  useEffect(() => {
    immediate && start()
    return stop
  }, [])

  return { stop, start }
}

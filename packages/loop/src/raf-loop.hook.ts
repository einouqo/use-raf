import { useCallback, useEffect, useRef } from 'react'

/**
 * Callback function that receives the current timestamp and delta time.
 *
 * @param timestamp - The current time in milliseconds from `performance.now()`
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

type LoopCallback = (timestamp: number) => void

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
    id: number
    type: 'raf' | 'timeout'
  } | null>(null)
  const frameTimeRef = useRef<{
    timestamp?: number
    duration?: number
  }>({})

  const request = useCallback((loop: LoopCallback) => {
    if (frameRef.current === null) {
      return
    }
    frameRef.current.id = requestAnimationFrame(loop)
    frameRef.current.type = 'raf'
  }, [])

  const delay = useCallback(
    (loop: LoopCallback, duration: number) => {
      if (frameRef.current === null) {
        return
      }
      frameRef.current.id = setTimeout(() => request(loop), duration)
      frameRef.current.type = 'timeout'
    },
    [request],
  )

  const loop = useCallback<LoopCallback>(
    (timestamp) => {
      if (frameRef.current === null) {
        return
      }

      const last = frameTimeRef.current.timestamp
      const delta = timestamp - (last ?? timestamp)
      callbackRef.current(timestamp, delta)

      const duration = frameTimeRef.current.duration ?? delta
      frameTimeRef.current.duration = avg(duration, duration, delta)
      frameTimeRef.current.timestamp = timestamp

      throttleRef.current > frameTimeRef.current.duration
        ? delay(loop, throttleRef.current)
        : request(loop)
    },
    [delay, request],
  )

  const stop = useCallback(() => {
    if (frameRef.current === null) {
      return
    }
    frameRef.current.type === 'raf'
      ? cancelAnimationFrame(frameRef.current.id)
      : clearTimeout(frameRef.current.id)
    frameRef.current = null
    setActiveRef.current?.(false)
  }, [])

  const start = useCallback(() => {
    if (frameRef.current !== null) {
      return
    }

    const id = requestAnimationFrame(loop)
    frameRef.current = { id, type: 'raf' }
    setActiveRef.current?.(true)

    frameTimeRef.current.timestamp = undefined
    frameTimeRef.current.duration = undefined
  }, [loop])

  // biome-ignore lint/correctness/useExhaustiveDependencies: lifecycle effect
  useEffect(() => {
    immediate && start()
    return stop
  }, [])

  return { stop, start }
}

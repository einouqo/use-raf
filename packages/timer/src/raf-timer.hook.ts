import { useRafLoop } from '@use-raf/loop'
import { useCallback, useEffect, useRef, useState } from 'react'

export interface RafTimerProps {
  /**
   * Timer duration in milliseconds.
   */
  duration: number
  /**
   * Whether to start the timer immediately on mount.
   * @default false
   */
  immediate?: boolean
  /**
   * Minimum time in milliseconds between updates.
   * Use 0 for no throttling (updates every frame).
   * @default 0
   */
  throttle?: number
  /**
   * Optional callback invoked on each frame with elapsed time.
   */
  onUpdate?: (elapsed: number) => void
  /**
   * Optional callback invoked when the timer completes.
   */
  onComplete?: () => void
}

export interface RafTimerReturn {
  /**
   * Whether the timer is currently running.
   */
  isActive: boolean
  /**
   * Current elapsed time in milliseconds.
   */
  elapsed: number
  /**
   * Starts or resumes the timer.
   * Safe to call multiple times.
   */
  start: () => void
  /**
   * Pauses the timer.
   * Safe to call multiple times.
   */
  stop: () => void
  /**
   * Stops the timer and resets elapsed time to 0.
   */
  reset: () => void
  /**
   * Stops the timer and triggers the onComplete callback.
   */
  sink: () => void
}

/**
 * A React hook for creating a frame-synchronized timer.
 *
 * Provides manual control over a timer with optional throttling and completion callbacks.
 * The timer tracks elapsed time and can be started, stopped, or reset at any time.
 *
 * @param options - Configuration options for the timer behavior
 * @returns Object with timer state and control functions
 *
 * @example
 * ```tsx
 * const { isActive, elapsed, start, stop, reset } = useRafTimer({
 *   duration: 5000,
 *   onComplete: () => console.log('Timer completed!')
 * })
 *
 * // Start the timer
 * start()
 *
 * // Stop when needed
 * stop()
 *
 * // Reset to 0
 * reset()
 * ```
 *
 * @example
 * ```tsx
 * // With throttled updates
 * useRafTimer({
 *   duration: 10000,
 *   throttle: 100, // Update every 100ms
 *   onUpdate: (elapsed) => {
 *     console.log(`Elapsed: ${elapsed}ms`)
 *   }
 * })
 * ```
 */
export const useRafTimer = ({
  duration,
  immediate = false,
  throttle = 0,
  onUpdate,
  onComplete,
}: RafTimerProps): RafTimerReturn => {
  const callbacksRef = useRef({ onUpdate, onComplete })
  useEffect(() => {
    callbacksRef.current = { onUpdate, onComplete }
  })

  const elapsedRef = useRef(0)
  const [elapsed, setElapsedState] = useState(elapsedRef.current)
  const setElapsed = useCallback((v: number) => {
    elapsedRef.current = v
    setElapsedState(v)
    callbacksRef.current.onUpdate?.(v)
  }, [])

  const onFrame = useCallback(
    (_, delta) => {
      const elapsed = elapsedRef.current + delta
      setElapsed(elapsed)
    },
    [setElapsed],
  )
  const [isActive, setActive] = useState(false)
  const { stop, start } = useRafLoop(onFrame, { immediate, throttle, setActive })

  const finalize = useCallback(() => {
    stop()
    callbacksRef.current.onComplete?.()
  }, [stop])

  useEffect(() => {
    if (!isActive) {
      return
    }

    const left = duration - elapsedRef.current
    const timeout = setTimeout(() => {
      const elapsed = Math.max(elapsedRef.current, duration)
      setElapsed(elapsed)
      finalize()
    }, left)

    return () => clearTimeout(timeout)
  }, [isActive, duration, finalize, setElapsed])

  const reset = useCallback(() => {
    stop()
    setElapsed(0)
  }, [stop, setElapsed])

  return {
    isActive,
    elapsed,
    start,
    stop,
    reset,
    sink: finalize,
  }
}

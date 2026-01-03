import { useRafLoop } from '@use-raf/loop'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRefState } from './ref-state.hook'

/**
 * Options for configuring the RAF timer.
 */
export interface RafTimerProps {
  /** Timer duration in milliseconds */
  duration: number
  /** Whether to start the timer immediately on mount (default: false) */
  immediate?: boolean
  /** Minimum milliseconds between updates (default: 0) */
  throttle?: number
  /** Callback invoked on each frame with elapsed time */
  onUpdate?: (elapsed: number) => void
  /** Callback invoked when the timer completes */
  onComplete?: () => void
}

/**
 * Return value of the useRafTimer hook.
 */
export interface RafTimerReturn {
  /** Whether the timer is currently running */
  isActive: boolean
  /** Current elapsed time in milliseconds */
  elapsed: number
  /** Start or resume the timer */
  start: () => void
  /** Pause the timer */
  stop: () => void
  /** Stop the timer and reset elapsed time to 0 */
  reset: () => void
  /** Stop the timer and trigger onComplete callback */
  sink: () => void
}

/**
 * A React hook for creating frame-synchronized timers using requestAnimationFrame.
 *
 * @param options - Configuration options for the timer
 * @returns Timer controls and state
 *
 * @example
 * ```tsx
 * const { isActive, elapsed, start, stop, reset } = useRafTimer({
 *   duration: 5000,
 *   onComplete: () => console.log('Done!'),
 * })
 * ```
 *
 * @example
 * With throttled updates:
 * ```tsx
 * useRafTimer({
 *   duration: 10000,
 *   throttle: 100,
 *   onUpdate: (elapsed) => console.log(elapsed),
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
  const [elapsedRef, elapsed, setElapsed] = useRefState(0)
  const updateElapsed = useCallback(
    (v: number) => {
      setElapsed(v)
      onUpdate?.(v)
    },
    [setElapsed, onUpdate],
  )

  const onFrame = useCallback(
    (_, delta) => {
      const elapsed = elapsedRef.current + delta
      updateElapsed(elapsed)
    },
    [elapsedRef, updateElapsed],
  )
  const [isActive, setActive] = useState(false)
  const options = useMemo(() => ({ immediate, throttle, setActive }), [immediate, throttle])
  const { stop, start } = useRafLoop(onFrame, options)

  const finalize = useCallback(() => {
    stop()
    onComplete?.()
  }, [stop, onComplete])

  useEffect(() => {
    if (!isActive) {
      return
    }

    const left = duration - elapsedRef.current
    const timeout = setTimeout(() => {
      const elapsed = Math.max(elapsedRef.current, duration)
      updateElapsed(elapsed)
      finalize()
    }, left)

    return () => clearTimeout(timeout)
  }, [isActive, duration, elapsedRef, finalize, updateElapsed])

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

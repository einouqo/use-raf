import type { TimeoutFrameHandler } from './timeout.func'
import { setTimeoutFrame } from './timeout.func'
import type { Cancel, Optional } from './types'

/**
 * Handler function called repeatedly on animation frames at the specified interval.
 *
 * @template A - Tuple type for additional arguments
 * @param timestamp - The DOMHighResTimeStamp from requestAnimationFrame
 * @param args - Additional arguments passed to setFrameInterval
 */
export type IntervalFrameHandler<A extends unknown[] = []> = (timestamp: number, ...args: A) => void

/**
 * Schedules a handler to be called repeatedly on animation frames at the specified interval.
 *
 * This function provides drift-corrected interval execution synchronized with the browser's
 * rendering cycle. It uses `setTimeoutFrame` internally and compensates for timing drift
 * to maintain accurate intervals over time.
 *
 * @template A - Tuple type for additional arguments passed to the handler
 * @param handler - Callback function to execute repeatedly, receives timestamp and additional args
 * @param delay - Interval in milliseconds between executions (default: 0)
 * @param args - Additional arguments to pass to the handler
 * @returns A cancel function that stops the interval
 *
 * @example
 * ```ts
 * // Execute every second
 * const cancel = setIntervalFrame((timestamp) => {
 *   console.log('Tick at', timestamp)
 * }, 1000)
 *
 * // With arguments
 * setIntervalFrame((timestamp, message) => {
 *   console.log(message, timestamp)
 * }, 500, 'Update:')
 *
 * // Stop the interval
 * cancel()
 * ```
 */
export const setIntervalFrame = <A extends unknown[] = []>(
  handler: IntervalFrameHandler<A>,
  delay: number = 0,
  ...args: A
): Cancel => {
  const started =
    (document?.timeline?.currentTime as number | undefined | null) ?? performance.now()

  const timeout = { cancel: undefined as Optional<Cancel> }
  const tick: TimeoutFrameHandler<A> = (timestamp, ...args) => {
    const elapsed = timestamp - started
    const drift = delay > 0 ? elapsed % delay : 0
    const after = delay - drift

    try {
      handler(timestamp, ...args)
    } finally {
      timeout.cancel = setTimeoutFrame(tick, after, ...args)
    }
  }
  timeout.cancel = setTimeoutFrame(tick, delay, ...args)

  return () => timeout.cancel?.()
}

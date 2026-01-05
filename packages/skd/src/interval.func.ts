import { setFrameTimeout } from './timeout.func'
import type { Cancel } from './types'

/**
 * Handler function called repeatedly on animation frames at the specified interval.
 *
 * @template A - Tuple type for additional arguments
 * @param timestamp - The DOMHighResTimeStamp from requestAnimationFrame
 * @param args - Additional arguments passed to setFrameInterval
 */
export type FrameIntervalHandler<A extends unknown[] = []> = (timestamp: number, ...args: A) => void

/**
 * Schedules a handler to be called repeatedly on animation frames at the specified interval.
 *
 * This function provides drift-corrected interval execution synchronized with the browser's
 * rendering cycle. It uses `setFrameTimeout` internally and compensates for timing drift
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
 * const cancel = setFrameInterval((timestamp) => {
 *   console.log('Tick at', timestamp)
 * }, 1000)
 *
 * // With arguments
 * setFrameInterval((timestamp, message) => {
 *   console.log(message, timestamp)
 * }, 500, 'Update:')
 *
 * // Stop the interval
 * cancel()
 * ```
 */
export const setFrameInterval = <A extends unknown[] = []>(
  handler: FrameIntervalHandler<A>,
  delay: number = 0,
  ...args: A
): Cancel => {
  const started = performance.now()

  const cancel = { current: undefined as Cancel | undefined }
  const schedule = (at: number): Cancel => {
    const elapsed = at - started
    const drift = delay > 0 ? elapsed % delay : 0
    const after = delay - drift

    return setFrameTimeout(
      (timestamp, ...args) => {
        handler(timestamp, ...args)
        cancel.current = schedule(timestamp)
      },
      after,
      ...args,
    )
  }

  cancel.current = schedule(started)

  return () => cancel.current?.()
}

import { setFrame } from './frame.func'
import type { Cancel, Optional } from './types'

/**
 * Handler function called on the next animation frame after the specified delay.
 *
 * @template A - Tuple type for additional arguments
 * @param timestamp - The DOMHighResTimeStamp from requestAnimationFrame
 * @param args - Additional arguments passed to setTimeoutFrame
 */
export type TimeoutFrameHandler<A extends unknown[] = []> = (timestamp: number, ...args: A) => void

/**
 * Schedules a handler to be called on the next animation frame after a specified delay.
 *
 * This function combines `setTimeout` and `requestAnimationFrame` to execute a handler
 * after a delay, synchronized with the browser's rendering cycle. The handler is called
 * with the animation frame timestamp as the first argument, followed by any additional
 * arguments provided.
 *
 * @template A - Tuple type for additional arguments passed to the handler
 * @param handler - Callback function to execute, receives timestamp and additional args
 * @param delay - Delay in milliseconds before scheduling the animation frame (default: 0)
 * @param args - Additional arguments to pass to the handler
 * @returns A cancel function that clears both the timeout and animation frame
 *
 * @example
 * ```ts
 * // Basic usage with delay
 * const cancel = setTimeoutFrame((timestamp) => {
 *   console.log('Executed at', timestamp)
 * }, 1000)
 *
 * // With additional arguments
 * setTimeoutFrame((timestamp, message, count) => {
 *   console.log(timestamp, message, count)
 * }, 500, 'Hello', 42)
 *
 * // Cancel before execution
 * const cancel = setTimeoutFrame(handler, 1000)
 * cancel() // Prevents execution
 * ```
 */
export const setTimeoutFrame = <A extends unknown[] = []>(
  handler: TimeoutFrameHandler<A>,
  delay?: number,
  ...args: A
): Cancel => {
  const frame = { cancel: undefined as Optional<Cancel> }
  const timeout = setTimeout(
    (...args: A) => {
      frame.cancel = setFrame((timestamp) => handler(timestamp, ...args))
    },
    delay,
    ...args,
  )

  return () => {
    clearTimeout(timeout)
    frame.cancel?.()
  }
}

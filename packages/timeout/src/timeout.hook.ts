import { useCallback, useEffect, useRef } from 'react'
import type { Cancel, FrameTimeoutHandler } from './timeout.func'
import { setFrameTimeout } from './timeout.func'

/**
 * Function to schedule a frame timeout.
 *
 * @template A - Tuple type for additional arguments
 * @param args - Arguments to pass to the handler
 * @returns A cancel function to stop the timeout
 */
export type Schedule<A extends unknown[] = []> = (...args: A) => Cancel

/**
 * Hook that returns a function to schedule a frame timeout with a handler.
 *
 * The handler always uses the latest version from the most recent render.
 * The delay is memoized and only changes when explicitly updated.
 *
 * @template A - Tuple type for additional arguments passed to the handler
 * @param handler - Callback function to execute, receives the RAF timestamp and additional args
 * @param delay - Delay in milliseconds before scheduling the animation frame (default: 0)
 * @returns A schedule function that accepts args and returns a cancel function
 *
 * @example
 * Basic usage:
 * ```tsx
 * const schedule = useFrameTimeout((timestamp) => {
 *   console.log('Executed at', timestamp)
 * }, 1000)
 *
 * const cancel = schedule()
 * cancel() // Cancel before execution
 * ```
 *
 * @example
 * With arguments:
 * ```tsx
 * const schedule = useFrameTimeout((timestamp, message: string) => {
 *   console.log(message, timestamp)
 * }, 1000)
 *
 * const cancel = schedule('Started at')
 * ```
 */
export const useFrameTimeout = <A extends unknown[] = []>(
  handler: FrameTimeoutHandler<A>,
  delay?: number,
): Schedule<A> => {
  const handlerRef = useRef(handler)
  useEffect(() => {
    handlerRef.current = handler
  })

  const schedule = useCallback<Schedule<A>>(
    (...args) => setFrameTimeout((...args) => handlerRef.current(...args), delay, ...args),
    [delay],
  )

  return schedule
}

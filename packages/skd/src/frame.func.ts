import type { Cancel } from './types'

/**
 * Handler function called on the next animation frame.
 *
 * @param timestamp - The DOMHighResTimeStamp from requestAnimationFrame
 */
export type FrameHandler = (timestamp: number) => void

/**
 * Schedules a handler to be called on the next animation frame.
 *
 * This is a thin wrapper around `requestAnimationFrame` that returns a cancel function
 * for consistency with other scheduling functions in this package.
 *
 * @param callback - Callback function to execute on the next frame
 * @returns A cancel function that cancels the scheduled animation frame
 *
 * @example
 * ```ts
 * // Execute on next frame
 * const cancel = setFrame((timestamp) => {
 *   console.log('Frame at', timestamp)
 * })
 *
 * // Cancel before execution
 * cancel()
 * ```
 */
export const setFrame = (callback: FrameHandler): Cancel => {
  const id = requestAnimationFrame(callback)
  return () => cancelAnimationFrame(id)
}

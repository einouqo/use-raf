import { useMemo } from 'react'

const [MIN, MAX] = [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]

const clamp =
  (left = MIN, right = MAX) =>
  (x: number) =>
    Math.max(left, Math.min(x, right))
const normalize = clamp(0, 1)

const trim = (x: number, precision = 0) => {
  const p = Math.max(0, precision - (precision % 1))
  const mult = 10 ** p
  return Math.floor(x * mult) / mult
}

/**
 * Options for configuring the progress calculation.
 */
export interface ProgressProps {
  /** Current elapsed time in milliseconds */
  elapsed: number
  /** Total duration in milliseconds */
  duration: number
  /** Number of decimal places to round to (default: 4) */
  precision?: number
}

/**
 * Return value of the useProgress hook.
 */
export interface ProgressReturn {
  /** Progress value between 0 and 1 */
  progress: number
}

/**
 * A React hook that calculates normalized progress (0-1) from elapsed time and duration.
 *
 * @param options - Configuration options for progress calculation
 * @returns Object containing the normalized progress value
 *
 * @example
 * ```tsx
 * const { progress } = useProgress({
 *   elapsed: 2500,
 *   duration: 5000,
 * })
 * // progress === 0.5
 * ```
 *
 * @example
 * With custom precision:
 * ```tsx
 * const { progress } = useProgress({
 *   elapsed: 1234,
 *   duration: 5000,
 *   precision: 2,
 * })
 * // progress === 0.24
 * ```
 */
export const useProgress = ({
  elapsed,
  duration,
  precision = 4,
}: ProgressProps): ProgressReturn => {
  const progress = useMemo(() => {
    if (duration === 0) {
      return 1
    }
    const t = elapsed / duration
    const p = normalize(t)

    return trim(p, precision)
  }, [elapsed, duration, precision])

  return { progress }
}

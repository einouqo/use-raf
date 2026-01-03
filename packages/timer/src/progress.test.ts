import { renderHook } from '@testing-library/react-hooks/dom'
import { describe, expect, it } from 'vitest'
import { useProgress } from './progress.hook'

describe('progress hook', () => {
  it('should return 0 progress when elapsed is 0', () => {
    const { result } = renderHook(() => useProgress({ elapsed: 0, duration: 1000 }))

    expect(result.current.progress).toBe(0)
  })

  it('should return 1 progress when elapsed equals duration', () => {
    const { result } = renderHook(() => useProgress({ elapsed: 1000, duration: 1000 }))

    expect(result.current.progress).toBe(1)
  })

  it('should return 0.5 progress when elapsed is half of duration', () => {
    const { result } = renderHook(() => useProgress({ elapsed: 500, duration: 1000 }))

    expect(result.current.progress).toBe(0.5)
  })

  it('should clamp progress to 1 when elapsed exceeds duration', () => {
    const { result } = renderHook(() => useProgress({ elapsed: 1500, duration: 1000 }))

    expect(result.current.progress).toBe(1)
  })

  it('should clamp progress to 0 when elapsed is negative', () => {
    const { result } = renderHook(() => useProgress({ elapsed: -100, duration: 1000 }))

    expect(result.current.progress).toBe(0)
  })

  it('should return 1 when duration is 0', () => {
    const { result } = renderHook(() => useProgress({ elapsed: 0, duration: 0 }))

    expect(result.current.progress).toBe(1)
  })

  it('should default to precision 4', () => {
    const { result } = renderHook(() => useProgress({ elapsed: 1, duration: 3 }))

    // 1/3 = 0.333333..., trimmed to precision 4 should be 0.3333
    expect(result.current.progress).toBe(0.3333)
  })

  it('should handle precision 1', () => {
    const { result } = renderHook(() => useProgress({ elapsed: 333, duration: 1000, precision: 1 }))

    // 333/1000 = 0.333, trimmed to precision 1 should be 0.3
    expect(result.current.progress).toBe(0.3)
  })

  it('should handle precision 2', () => {
    const { result } = renderHook(() => useProgress({ elapsed: 666, duration: 1000, precision: 2 }))

    // 666/1000 = 0.666, trimmed to precision 2 should be 0.66
    expect(result.current.progress).toBe(0.66)
  })

  it('should handle precision 0', () => {
    const { result } = renderHook(() => useProgress({ elapsed: 999, duration: 1000, precision: 0 }))

    // 999/1000 = 0.999, trimmed to precision 0 should be 0
    expect(result.current.progress).toBe(0)
  })

  it('should handle precision 3', () => {
    const { result } = renderHook(() =>
      useProgress({ elapsed: 12345, duration: 100000, precision: 3 }),
    )

    // 12345/100000 = 0.12345, trimmed to precision 3 should be 0.123
    expect(result.current.progress).toBe(0.123)
  })

  it('should memoize result and only recompute when dependencies change', () => {
    const { result, rerender } = renderHook(
      ({ elapsed, duration, precision }) => useProgress({ elapsed, duration, precision }),
      {
        initialProps: { elapsed: 500, duration: 1000, precision: 2 },
      },
    )

    const firstResult = result.current.progress
    expect(firstResult).toBe(0.5)

    // Rerender with same props - should return same reference
    rerender({ elapsed: 500, duration: 1000, precision: 2 })
    expect(result.current.progress).toBe(firstResult)

    // Rerender with different elapsed
    rerender({ elapsed: 750, duration: 1000, precision: 2 })
    expect(result.current.progress).toBe(0.75)
  })

  it('should recompute when precision changes', () => {
    const { result, rerender } = renderHook(
      ({ elapsed, duration, precision }) => useProgress({ elapsed, duration, precision }),
      {
        initialProps: { elapsed: 333, duration: 1000, precision: 1 },
      },
    )

    expect(result.current.progress).toBe(0.3)

    rerender({ elapsed: 333, duration: 1000, precision: 2 })
    expect(result.current.progress).toBe(0.33)
  })

  it('should handle very small durations correctly', () => {
    const { result } = renderHook(() => useProgress({ elapsed: 0.5, duration: 1 }))

    expect(result.current.progress).toBe(0.5)
  })

  it('should handle very large durations correctly', () => {
    const { result } = renderHook(() =>
      useProgress({ elapsed: 5000000, duration: 10000000, precision: 2 }),
    )

    expect(result.current.progress).toBe(0.5)
  })

  it('should handle edge case where both elapsed and duration are 0', () => {
    const { result } = renderHook(() => useProgress({ elapsed: 0, duration: 0 }))

    expect(result.current.progress).toBe(1)
  })

  it('should handle fractional precision values by flooring them', () => {
    const { result } = renderHook(() =>
      useProgress({ elapsed: 456, duration: 1000, precision: 2.7 }),
    )

    // precision 2.7 should be treated as precision 2
    // 456/1000 = 0.456, trimmed to precision 2 should be 0.45
    expect(result.current.progress).toBe(0.45)
  })

  it('should handle negative precision by treating it as 0', () => {
    const { result } = renderHook(() =>
      useProgress({ elapsed: 750, duration: 1000, precision: -2 }),
    )

    // negative precision should behave as precision 0
    expect(result.current.progress).toBe(0)
  })

  it('should clamp and trim correctly when elapsed exceeds duration', () => {
    const { result } = renderHook(() =>
      useProgress({ elapsed: 1234, duration: 1000, precision: 2 }),
    )

    // 1234/1000 = 1.234, clamped to 1, trimmed to precision 2 should be 1
    expect(result.current.progress).toBe(1)
  })

  it('should handle progress at exact precision boundaries', () => {
    const { result } = renderHook(() => useProgress({ elapsed: 100, duration: 1000, precision: 1 }))

    // 100/1000 = 0.1, trimmed to precision 1 should be 0.1
    expect(result.current.progress).toBe(0.1)
  })
})

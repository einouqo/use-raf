import { act, renderHook } from '@testing-library/react-hooks'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useRafTimer } from './raf-timer.hook'

describe('raf timer hook', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('should initialize correctly and not start automatically', () => {
    const { result } = renderHook(() => useRafTimer({ duration: 1_000 }))

    expect(result.current.isActive).toBe(false)
    expect(result.current.elapsed).toBe(0)
  })

  it('should start ticking when start is called', () => {
    const { result } = renderHook(() => useRafTimer({ duration: 1_000 }))

    act(() => {
      result.current.start()
    })

    expect(result.current.isActive).toBe(true)
  })

  it('should update elapsed time as time passes', async () => {
    const { result } = renderHook(() => useRafTimer({ duration: 1_000 }))

    act(() => {
      result.current.start()
    })

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500)
    })

    expect(result.current.elapsed).toBeGreaterThan(0)
  })

  it('should pause and resume without resetting elapsed time', () => {
    const { result } = renderHook(() => useRafTimer({ duration: 1_000 }))

    act(() => {
      result.current.start()
    })
    act(() => {
      vi.advanceTimersByTime(200)
    })
    const elapsedAtPause = result.current.elapsed

    act(() => {
      result.current.stop()
    })
    expect(result.current.isActive).toBe(false)

    act(() => {
      vi.advanceTimersByTime(500)
    })
    expect(result.current.elapsed).toBe(elapsedAtPause)

    act(() => {
      result.current.start()
    })
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current.elapsed).toBeGreaterThan(elapsedAtPause)
  })

  it('should stop exactly at duration and fire onComplete', () => {
    const duration = 10_000
    const onComplete = vi.fn()
    const { result } = renderHook(() => useRafTimer({ duration, onComplete }))

    act(() => {
      result.current.start()
    })
    act(() => {
      vi.advanceTimersByTime(1.5 * duration)
    })

    expect(result.current.isActive).toBe(false)
    expect(result.current.elapsed).toBeGreaterThanOrEqual(duration)
    expect(result.current.elapsed / duration - 1).toBeCloseTo(0, 2)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('should throttle onUpdate callbacks', () => {
    const onUpdate = vi.fn()
    const { result } = renderHook(() => useRafTimer({ duration: 1_000, throttle: 100, onUpdate }))

    act(() => {
      result.current.start()
    })
    act(() => {
      vi.advanceTimersByTime(50)
    })
    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(onUpdate).toHaveBeenCalledTimes(2)
  })

  it('should stop updates permanently when sink is called', () => {
    const { result } = renderHook(() => useRafTimer({ duration: 1_000 }))

    act(() => {
      result.current.start()
    })
    act(() => {
      vi.advanceTimersByTime(100)
    })
    act(() => {
      result.current.sink()
    })

    const snapshot = result.current.elapsed

    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Should not have moved
    expect(result.current.elapsed).toBe(snapshot)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })
})

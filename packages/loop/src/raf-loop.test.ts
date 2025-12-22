import { renderHook, act } from '@testing-library/react-hooks/dom'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useRafLoop } from './raf-loop.hook'

describe('useRafLoop', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should not run automatically', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useRafLoop(callback))
    const [, , isActive] = result.current

    expect(isActive).toBe(false)

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(callback).not.toHaveBeenCalled()
  })

  it('should loop when started and provide correct delta', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useRafLoop(callback))

    act(() => {
      const [start] = result.current
      start()
    })

    const [, , isActive] = result.current
    expect(isActive).toBe(true)

    act(() => {
      vi.advanceTimersByTime(16)
    })
    act(() => {
      vi.advanceTimersByTime(16)
    })

    expect(callback).toHaveBeenCalled()
    expect(callback.mock.calls.length).toBeGreaterThanOrEqual(2)
    expect(callback.mock.calls.at(-1)?.[1]).toBeGreaterThan(0)
  })

  it('should stop looping when stop is called', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useRafLoop(callback))

    act(() => {
      const [start] = result.current
      start()
      vi.advanceTimersByTime(100)
    })

    const callCountBeforeStop = callback.mock.calls.length

    act(() => {
      const [, stop] = result.current
      stop()
    })

    const [, , isActive] = result.current
    expect(isActive).toBe(false)

    act(() => {
      vi.advanceTimersByTime(100)
    })

    expect(callback.mock.calls.length).toBe(callCountBeforeStop)
  })

  it('should use the latest callback without restarting', () => {
    let value = false
    const { result, rerender } = renderHook(({ cb }) => useRafLoop(cb), {
      initialProps: { cb: () => {} },
    })

    act(() => {
      const [start] = result.current
      start()
    })

    rerender({
      cb: () => {
        value = true
      },
    })

    act(() => {
      vi.advanceTimersByTime(50)
    })

    expect(value).toBe(true)
  })

  it('should respect throttle option', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useRafLoop(callback, { throttle: 50 }))

    act(() => {
      const [start] = result.current
      start()
      vi.advanceTimersToNextFrame()
    })

    expect(callback).toHaveBeenCalledTimes(1)

    act(() => {
      vi.advanceTimersByTime(40)
      vi.advanceTimersToNextFrame()
    })

    expect(callback).toHaveBeenCalledTimes(1)

    act(() => {
      vi.advanceTimersByTime(10)
      vi.advanceTimersToNextFrame()
    })

    expect(callback).toHaveBeenCalledTimes(2)
  })

  it('should accumulate delta across throttled frames', () => {
    const callback = vi.fn()
    const throttle = 1_000
    const { result } = renderHook(() => useRafLoop(callback, { throttle }))

    act(() => {
      const [start] = result.current
      start()
    })

    act(() => {
      vi.advanceTimersByTime(200)
      vi.advanceTimersToNextFrame()
    })
    act(() => {
      vi.advanceTimersByTime(200)
      vi.advanceTimersToNextFrame()
    })
    act(() => {
      vi.advanceTimersByTime(600)
      vi.advanceTimersToNextFrame()
    })

    expect(callback).toHaveBeenCalledTimes(2)

    const delta = callback.mock.calls.at(-1)?.[1]
    expect(delta).toBeGreaterThanOrEqual(throttle)
    expect(delta / throttle - 1).toBeCloseTo(0, 1)
  })
})

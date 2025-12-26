import { renderHook, act } from '@testing-library/react-hooks/dom'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useRafLoop } from './raf-loop.hook'
import { useState } from 'react'

const useActiveRafLoop = (...[callback, opts]: Parameters<typeof useRafLoop>) => {
  const [isActive, setActive] = useState(false)
  const result = useRafLoop(callback, { ...opts, setActive })
  return { ...result, isActive }
}

describe('raf loop hook', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initialization', () => {
    it('should not run automatically', () => {
      const callback = vi.fn()
      const { result } = renderHook(() => useActiveRafLoop(callback, { immediate: false }))

      expect(result.current.isActive).toBe(false)

      act(() => {
        vi.advanceTimersByTime(100)
      })

      expect(callback).not.toHaveBeenCalled()
    })
  })

  describe('basic loop control', () => {
    it('should start loop immediately by default', () => {
      const callback = vi.fn()
      const { result } = renderHook(() => useActiveRafLoop(callback))

      expect(result.current.isActive).toBe(true)

      act(() => {
        vi.advanceTimersByTime(32)
      })

      expect(callback).toHaveBeenCalled()
      expect(callback.mock.calls.length).toBeGreaterThanOrEqual(2)
    })

    it('should provide timestamp and delta to callback', () => {
      const callback = vi.fn()
      renderHook(() => useRafLoop(callback))

      act(() => {
        vi.advanceTimersByTime(32)
      })

      const lastCall = callback.mock.calls.at(-1)
      expect(lastCall?.[0]).toBeGreaterThan(0)
      expect(lastCall?.[1]).toBeGreaterThan(0)
    })

    it('should stop looping when stop is called', () => {
      const callback = vi.fn()
      const { result } = renderHook(() => useActiveRafLoop(callback))

      act(() => {
        vi.advanceTimersByTime(50)
      })

      const callCountBeforeStop = callback.mock.calls.length

      act(() => {
        result.current.stop()
      })

      expect(result.current.isActive).toBe(false)

      act(() => {
        vi.advanceTimersByTime(100)
      })

      expect(callback.mock.calls.length).toBe(callCountBeforeStop)
    })
  })

  describe('callback updates', () => {
    it('should use the latest callback without restarting', () => {
      let value = false
      const { rerender } = renderHook(({ cb }) => useRafLoop(cb), {
        initialProps: { cb: () => {} },
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
  })

  describe('throttling', () => {
    it('should respect throttle option', () => {
      const callback = vi.fn()
      renderHook(() => useRafLoop(callback, { throttle: 50 }))

      act(() => {
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
      renderHook(() => useRafLoop(callback, { throttle }))

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

    it('should handle changing throttle dynamically', () => {
      const callback = vi.fn()
      const { rerender } = renderHook(({ throttle }) => useRafLoop(callback, { throttle }), {
        initialProps: { throttle: 100 },
      })

      act(() => {
        vi.advanceTimersByTime(150)
      })

      const callCountAfterFirst = callback.mock.calls.length
      expect(callCountAfterFirst).toBeGreaterThanOrEqual(2)

      rerender({ throttle: 500 })

      callback.mockClear()

      act(() => {
        vi.advanceTimersByTime(300)
      })

      expect(callback).not.toHaveBeenCalled()

      act(() => {
        vi.advanceTimersByTime(250)
      })

      expect(callback).toHaveBeenCalled()
    })

    it('should handle changing throttle to 0 (no throttle)', () => {
      const callback = vi.fn()
      const { rerender } = renderHook(({ throttle }) => useRafLoop(callback, { throttle }), {
        initialProps: { throttle: 1000 },
      })

      callback.mockClear()

      rerender({ throttle: 0 })

      act(() => {
        vi.advanceTimersByTime(50)
      })

      expect(callback.mock.calls.length).toBeGreaterThan(1)
    })
  })

  describe('edge cases', () => {
    it('should handle calling start() multiple times consecutively', () => {
      const callback = vi.fn()
      const { result } = renderHook(() => useActiveRafLoop(callback, { immediate: false }))

      act(() => {
        result.current.start()
        result.current.start()
        result.current.start()
      })

      expect(result.current.isActive).toBe(true)

      act(() => {
        vi.advanceTimersByTime(50)
      })

      expect(callback.mock.calls.length).toBeGreaterThan(0)

      act(() => {
        result.current.stop()
      })

      expect(result.current.isActive).toBe(false)
    })

    it('should handle calling stop() when already stopped', () => {
      const callback = vi.fn()
      const { result } = renderHook(() => useActiveRafLoop(callback, { immediate: false }))

      act(() => {
        result.current.stop()
        result.current.stop()
        result.current.stop()
      })

      expect(result.current.isActive).toBe(false)

      act(() => {
        result.current.start()
      })

      act(() => {
        vi.advanceTimersByTime(50)
      })

      expect(callback).toHaveBeenCalled()
      expect(result.current.isActive).toBe(true)
    })

    it('should handle calling stop() from within the callback function', () => {
      let stopFn: (() => void) | null = null
      let callCount = 0

      const { result } = renderHook(() =>
        useActiveRafLoop(() => {
          callCount++
          if (callCount >= 3) {
            stopFn?.()
          }
        }),
      )

      stopFn = result.current.stop

      act(() => {
        vi.advanceTimersByTime(100)
      })

      expect(result.current.isActive).toBe(false)
      expect(callCount).toBe(3)

      const callCountAfterStop = callCount
      act(() => {
        vi.advanceTimersByTime(100)
      })
      expect(callCount).toBe(callCountAfterStop)
    })

    it('should handle rapid start/stop cycles', () => {
      const callback = vi.fn()
      const { result } = renderHook(() => useRafLoop(callback, { immediate: false }))

      // Rapidly start and stop multiple times
      for (let i = 0; i < 5; i++) {
        act(() => {
          result.current.start()
        })

        act(() => {
          vi.advanceTimersByTime(10)
        })

        act(() => {
          result.current.stop()
        })
      }

      const callCountAfterCycles = callback.mock.calls.length

      // Start one final time to verify it still works
      act(() => {
        result.current.start()
      })

      expect(callback.mock.calls.length).toBe(callCountAfterCycles)

      act(() => {
        vi.advanceTimersByTime(50)
      })

      expect(callback.mock.calls.length).toBeGreaterThan(callCountAfterCycles)
    })
  })
})

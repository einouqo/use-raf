import { renderHook } from '@testing-library/react-hooks/dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useFrameTimeout } from './timeout.hook'
import { setFrameTimeout } from './timeout.func'

describe('frame timeout', () => {
  describe('function', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should call handler after delay', () => {
      const handler = vi.fn()
      setFrameTimeout(handler, 100)

      vi.advanceTimersByTime(99)
      expect(handler).not.toHaveBeenCalled()

      vi.advanceTimersByTime(1)
      vi.advanceTimersToNextFrame()
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should call handler immediately with no delay', () => {
      const handler = vi.fn()
      setFrameTimeout(handler)

      vi.advanceTimersToNextFrame()
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should call handler with zero delay', () => {
      const handler = vi.fn()
      setFrameTimeout(handler, 0)

      vi.advanceTimersToNextFrame()
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should provide timestamp to handler', () => {
      const handler = vi.fn()
      setFrameTimeout(handler, 100)

      vi.advanceTimersByTime(100)
      vi.advanceTimersToNextFrame()

      expect(handler).toHaveBeenCalled()
      const timestamp = handler.mock.calls[0]?.[0]
      expect(typeof timestamp).toBe('number')
      expect(timestamp).toBeGreaterThan(0)
    })

    it('should pass single argument to handler', () => {
      const handler = vi.fn()
      setFrameTimeout(handler, 50, 'test')

      vi.advanceTimersByTime(50)
      vi.advanceTimersToNextFrame()

      expect(handler).toHaveBeenCalledWith(expect.any(Number), 'test')
    })

    it('should pass multiple arguments to handler', () => {
      const handler = vi.fn()
      setFrameTimeout(handler, 50, 'arg1', 42, true)

      vi.advanceTimersByTime(50)
      vi.advanceTimersToNextFrame()

      expect(handler).toHaveBeenCalledWith(expect.any(Number), 'arg1', 42, true)
    })

    it('should pass complex object arguments', () => {
      const handler = vi.fn()
      const obj = { foo: 'bar', nested: { value: 123 } }
      setFrameTimeout(handler, 50, obj)

      vi.advanceTimersByTime(50)
      vi.advanceTimersToNextFrame()

      expect(handler).toHaveBeenCalledWith(expect.any(Number), obj)
    })

    it('should cancel timeout before execution', () => {
      const handler = vi.fn()
      const cancel = setFrameTimeout(handler, 100)

      vi.advanceTimersByTime(50)
      cancel()

      vi.advanceTimersByTime(100)
      vi.advanceTimersToNextFrame()

      expect(handler).not.toHaveBeenCalled()
    })

    it('should cancel animation frame after timeout fires', () => {
      const handler = vi.fn()
      const cancel = setFrameTimeout(handler, 100)

      vi.advanceTimersByTime(100)
      cancel()

      vi.advanceTimersToNextFrame()

      expect(handler).not.toHaveBeenCalled()
    })

    it('should be safe to call cancel multiple times', () => {
      const handler = vi.fn()
      const cancel = setFrameTimeout(handler, 100)

      cancel()
      cancel()
      cancel()

      vi.advanceTimersByTime(100)
      vi.advanceTimersToNextFrame()

      expect(handler).not.toHaveBeenCalled()
    })

    it('should be safe to call cancel after execution', () => {
      const handler = vi.fn()
      const cancel = setFrameTimeout(handler, 100)

      vi.advanceTimersByTime(100)
      vi.advanceTimersToNextFrame()

      expect(handler).toHaveBeenCalledTimes(1)

      cancel()
      vi.advanceTimersByTime(100)
      vi.advanceTimersToNextFrame()

      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should handle multiple simultaneous timeouts', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      const handler3 = vi.fn()

      setFrameTimeout(handler1, 50)
      setFrameTimeout(handler2, 100)
      setFrameTimeout(handler3, 150)

      vi.advanceTimersByTime(50)
      vi.advanceTimersToNextFrame()
      expect(handler1).toHaveBeenCalledTimes(1)
      expect(handler2).not.toHaveBeenCalled()
      expect(handler3).not.toHaveBeenCalled()

      vi.advanceTimersByTime(50)
      vi.advanceTimersToNextFrame()
      expect(handler2).toHaveBeenCalledTimes(1)
      expect(handler3).not.toHaveBeenCalled()

      vi.advanceTimersByTime(50)
      vi.advanceTimersToNextFrame()
      expect(handler3).toHaveBeenCalledTimes(1)
    })

    it('should handle selective cancellation of multiple timeouts', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      const handler3 = vi.fn()

      const cancel1 = setFrameTimeout(handler1, 100)
      setFrameTimeout(handler2, 100)
      const cancel3 = setFrameTimeout(handler3, 100)

      cancel1()
      cancel3()

      vi.advanceTimersByTime(100)
      vi.advanceTimersToNextFrame()

      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).toHaveBeenCalledTimes(1)
      expect(handler3).not.toHaveBeenCalled()
    })

    it('should handle very long delays', () => {
      const handler = vi.fn()
      setFrameTimeout(handler, 10_000)

      vi.advanceTimersByTime(9_999)
      vi.advanceTimersToNextFrame()
      expect(handler).not.toHaveBeenCalled()

      vi.advanceTimersByTime(1)
      vi.advanceTimersToNextFrame()
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should handle handler that throws error', () => {
      const handler = vi.fn(() => {
        throw new Error('Handler error')
      })

      setFrameTimeout(handler, 50)

      vi.advanceTimersByTime(50)
      expect(() => {
        vi.advanceTimersToNextFrame()
      }).toThrow('Handler error')

      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should execute on the next frame after delay', () => {
      const handler = vi.fn()
      setFrameTimeout(handler, 100)

      vi.advanceTimersByTime(100)
      expect(handler).not.toHaveBeenCalled()

      vi.advanceTimersToNextFrame()
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should not execute before delay completes', () => {
      const handler = vi.fn()
      setFrameTimeout(handler, 100)

      vi.advanceTimersByTime(30)
      vi.advanceTimersToNextFrame()

      expect(handler).not.toHaveBeenCalled()

      vi.advanceTimersByTime(30)
      vi.advanceTimersToNextFrame()

      expect(handler).not.toHaveBeenCalled()

      vi.advanceTimersByTime(40)
      vi.advanceTimersToNextFrame()
      expect(handler).toHaveBeenCalledTimes(1)
    })
  })

  describe('hook', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should call handler after delay', () => {
      const handler = vi.fn()
      renderHook(() => useFrameTimeout(handler, 100))

      vi.advanceTimersByTime(99)
      expect(handler).not.toHaveBeenCalled()

      vi.advanceTimersByTime(1)
      vi.advanceTimersToNextFrame()
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should call handler immediately with zero delay', () => {
      const handler = vi.fn()
      renderHook(() => useFrameTimeout(handler, 0))

      vi.advanceTimersToNextFrame()
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should provide timestamp to handler', () => {
      const handler = vi.fn()
      renderHook(() => useFrameTimeout(handler, 100))

      vi.advanceTimersByTime(100)
      vi.advanceTimersToNextFrame()

      expect(handler).toHaveBeenCalled()
      const timestamp = handler.mock.calls[0]?.[0]
      expect(typeof timestamp).toBe('number')
      expect(timestamp).toBeGreaterThan(0)
    })

    it('should cancel timeout on unmount', () => {
      const handler = vi.fn()
      const { unmount } = renderHook(() => useFrameTimeout(handler, 100))

      vi.advanceTimersByTime(50)
      unmount()

      vi.advanceTimersByTime(100)
      vi.advanceTimersToNextFrame()
      expect(handler).not.toHaveBeenCalled()
    })

    it('should cancel previous timeout when delay changes', () => {
      const handler = vi.fn()
      const { rerender } = renderHook(({ delay }) => useFrameTimeout(handler, delay), {
        initialProps: { delay: 100 },
      })

      vi.advanceTimersByTime(50)

      rerender({ delay: 200 })

      vi.advanceTimersByTime(100)
      vi.advanceTimersToNextFrame()
      expect(handler).not.toHaveBeenCalled()

      vi.advanceTimersByTime(100)
      vi.advanceTimersToNextFrame()
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should use latest handler when timeout fires', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      const { rerender } = renderHook(({ handler }) => useFrameTimeout(handler, 100), {
        initialProps: { handler: handler1 },
      })

      vi.advanceTimersByTime(50)

      // Update handler before timeout fires
      rerender({ handler: handler2 })

      vi.advanceTimersByTime(50)
      vi.advanceTimersToNextFrame()

      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).toHaveBeenCalledTimes(1)
    })

    it('should not restart timeout when handler changes', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      const { rerender } = renderHook(({ handler }) => useFrameTimeout(handler, 100), {
        initialProps: { handler: handler1 },
      })

      vi.advanceTimersByTime(90)

      // Update handler - should not reset timer
      rerender({ handler: handler2 })

      vi.advanceTimersByTime(10) // Total 100ms
      vi.advanceTimersToNextFrame()

      expect(handler2).toHaveBeenCalledTimes(1)
    })

    it('should restart timeout when dependencies change', () => {
      const handler = vi.fn()
      const { rerender } = renderHook(({ dep }) => useFrameTimeout(handler, 100, [dep]), {
        initialProps: { dep: 'a' },
      })

      vi.advanceTimersByTime(50)

      // Change dependency - should restart timeout
      rerender({ dep: 'b' })

      vi.advanceTimersByTime(50) // Total 100ms from initial, but only 50ms from rerender
      vi.advanceTimersToNextFrame()
      expect(handler).not.toHaveBeenCalled()

      vi.advanceTimersByTime(50) // Total 100ms from rerender
      vi.advanceTimersToNextFrame()
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should not restart timeout when dependencies do not change', () => {
      const handler = vi.fn()
      const dep = { value: 'a' }
      const { rerender } = renderHook(() => useFrameTimeout(handler, 100, [dep]))

      vi.advanceTimersByTime(50)

      // Rerender without changing dependency
      rerender()

      vi.advanceTimersByTime(50) // Total 100ms from initial
      vi.advanceTimersToNextFrame()
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should handle multiple dependencies', () => {
      const handler = vi.fn()
      const { rerender } = renderHook(
        ({ dep1, dep2 }) => useFrameTimeout(handler, 100, [dep1, dep2]),
        { initialProps: { dep1: 'a', dep2: 1 } },
      )

      vi.advanceTimersByTime(50)

      // Change one dependency
      rerender({ dep1: 'b', dep2: 1 })

      vi.advanceTimersByTime(50)
      vi.advanceTimersToNextFrame()
      expect(handler).not.toHaveBeenCalled()

      vi.advanceTimersByTime(50)
      vi.advanceTimersToNextFrame()
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should handle no dependencies provided', () => {
      const handler = vi.fn()
      renderHook(() => useFrameTimeout(handler, 100))

      vi.advanceTimersByTime(100)
      vi.advanceTimersToNextFrame()
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should handle empty dependencies array', () => {
      const handler = vi.fn()
      renderHook(() => useFrameTimeout(handler, 100, []))

      vi.advanceTimersByTime(100)
      vi.advanceTimersToNextFrame()
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should handle handler that throws', () => {
      const handler = vi.fn(() => {
        throw new Error('Handler error')
      })

      renderHook(() => useFrameTimeout(handler, 100))

      vi.advanceTimersByTime(100)
      expect(() => {
        vi.advanceTimersToNextFrame()
      }).toThrow('Handler error')

      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should only schedule one timeout per render', () => {
      const handler = vi.fn()
      renderHook(() => useFrameTimeout(handler, 100))

      vi.advanceTimersByTime(100)
      vi.advanceTimersToNextFrame()
      expect(handler).toHaveBeenCalledTimes(1)

      // Advance time further - should not call handler again
      vi.advanceTimersByTime(100)
      vi.advanceTimersToNextFrame()
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should handle multiple hook instances independently', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      renderHook(() => useFrameTimeout(handler1, 100))
      renderHook(() => useFrameTimeout(handler2, 200))

      vi.advanceTimersByTime(100)
      vi.advanceTimersToNextFrame()
      expect(handler1).toHaveBeenCalledTimes(1)
      expect(handler2).not.toHaveBeenCalled()

      vi.advanceTimersByTime(100)
      vi.advanceTimersToNextFrame()
      expect(handler2).toHaveBeenCalledTimes(1)
    })

    it('should handle multiple hook instances with same delay', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()
      const handler3 = vi.fn()

      renderHook(() => useFrameTimeout(handler1, 100))
      renderHook(() => useFrameTimeout(handler2, 100))
      renderHook(() => useFrameTimeout(handler3, 100))

      vi.advanceTimersByTime(100)
      vi.advanceTimersToNextFrame()

      expect(handler1).toHaveBeenCalledTimes(1)
      expect(handler2).toHaveBeenCalledTimes(1)
      expect(handler3).toHaveBeenCalledTimes(1)
    })
  })
})

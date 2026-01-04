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

    it('should pass arguments to handler', () => {
      const handler = vi.fn()
      setFrameTimeout(handler, 50, 'arg1', 42, true)

      vi.advanceTimersByTime(50)
      vi.advanceTimersToNextFrame()

      expect(handler).toHaveBeenCalledWith(expect.any(Number), 'arg1', 42, true)
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

    it('should execute on next frame after delay', () => {
      const handler = vi.fn()
      setFrameTimeout(handler, 100)

      vi.advanceTimersByTime(100)
      expect(handler).not.toHaveBeenCalled()

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

    it('should call handler after delay when scheduled', () => {
      const handler = vi.fn()
      const { result } = renderHook(() => useFrameTimeout(handler, 100))

      result.current()

      vi.advanceTimersByTime(99)
      expect(handler).not.toHaveBeenCalled()

      vi.advanceTimersByTime(1)
      vi.advanceTimersToNextFrame()
      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should memoize schedule by delay, not handler', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      const { result, rerender } = renderHook(
        ({ handler, delay }) => useFrameTimeout(handler, delay),
        { initialProps: { handler: handler1, delay: 100 } },
      )

      const schedule1 = result.current

      // Handler change - same schedule
      rerender({ handler: handler2, delay: 100 })
      expect(result.current).toBe(schedule1)

      // Delay change - new schedule
      rerender({ handler: handler2, delay: 200 })
      expect(result.current).not.toBe(schedule1)
    })

    it('should use latest handler when timeout fires', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      const { result, rerender } = renderHook(({ handler }) => useFrameTimeout(handler, 100), {
        initialProps: { handler: handler1 },
      })

      result.current()

      vi.advanceTimersByTime(50)
      rerender({ handler: handler2 })
      vi.advanceTimersByTime(50)
      vi.advanceTimersToNextFrame()

      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).toHaveBeenCalledTimes(1)
    })

    it('should allow scheduling multiple times', () => {
      const handler = vi.fn()
      const { result } = renderHook(() => useFrameTimeout(handler, 100))

      result.current()
      result.current()

      vi.advanceTimersByTime(100)
      vi.advanceTimersToNextFrame()

      expect(handler).toHaveBeenCalledTimes(2)
    })

    it('should forward arguments to handler', () => {
      const handler = vi.fn()
      const { result } = renderHook(() => useFrameTimeout(handler, 100))

      result.current('first', 1)
      result.current('second', 2)

      vi.advanceTimersByTime(100)
      vi.advanceTimersToNextFrame()

      expect(handler).toHaveBeenCalledTimes(2)
      expect(handler).toHaveBeenNthCalledWith(1, expect.any(Number), 'first', 1)
      expect(handler).toHaveBeenNthCalledWith(2, expect.any(Number), 'second', 2)
    })
  })
})

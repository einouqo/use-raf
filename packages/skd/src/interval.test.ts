import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { setIntervalFrame } from './interval.func'

describe('frame interval', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should call handler repeatedly at specified interval', () => {
    const handler = vi.fn()
    setIntervalFrame(handler, 100)

    vi.advanceTimersByTime(100)
    vi.advanceTimersToNextFrame()
    expect(handler).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(100)
    vi.advanceTimersToNextFrame()
    expect(handler).toHaveBeenCalledTimes(2)

    vi.advanceTimersByTime(100)
    vi.advanceTimersToNextFrame()
    expect(handler).toHaveBeenCalledTimes(3)
  })

  it('should call handler immediately with zero delay', () => {
    const handler = vi.fn()
    setIntervalFrame(handler, 0)

    vi.advanceTimersToNextFrame()
    expect(handler).toHaveBeenCalledTimes(1)

    vi.advanceTimersToNextFrame()
    expect(handler).toHaveBeenCalledTimes(2)
  })

  it('should provide timestamp to handler', () => {
    const handler = vi.fn()
    setIntervalFrame(handler, 100)

    vi.advanceTimersByTime(100)
    vi.advanceTimersToNextFrame()

    expect(handler).toHaveBeenCalled()
    const timestamp = handler.mock.calls[0]?.[0]
    expect(typeof timestamp).toBe('number')
    expect(timestamp).toBeGreaterThan(0)
  })

  it('should pass arguments to handler', () => {
    const handler = vi.fn()
    setIntervalFrame(handler, 100, 'arg1', 42, true)

    vi.advanceTimersByTime(100)
    vi.advanceTimersToNextFrame()

    expect(handler).toHaveBeenCalledWith(expect.any(Number), 'arg1', 42, true)

    vi.advanceTimersByTime(100)
    vi.advanceTimersToNextFrame()

    expect(handler).toHaveBeenCalledTimes(2)
    expect(handler).toHaveBeenNthCalledWith(2, expect.any(Number), 'arg1', 42, true)
  })

  it('should cancel interval', () => {
    const handler = vi.fn()
    const cancel = setIntervalFrame(handler, 100)

    vi.advanceTimersByTime(100)
    vi.advanceTimersToNextFrame()
    expect(handler).toHaveBeenCalledTimes(1)

    cancel()

    vi.advanceTimersByTime(100)
    vi.advanceTimersToNextFrame()
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('should be safe to call cancel multiple times', () => {
    const handler = vi.fn()
    const cancel = setIntervalFrame(handler, 100)

    cancel()
    cancel()
    cancel()

    vi.advanceTimersByTime(100)
    vi.advanceTimersToNextFrame()
    expect(handler).not.toHaveBeenCalled()
  })

  it('should handle multiple simultaneous intervals', () => {
    const handler1 = vi.fn()
    const handler2 = vi.fn()
    const handler3 = vi.fn()

    setIntervalFrame(handler1, 50)
    setIntervalFrame(handler2, 100)
    setIntervalFrame(handler3, 150)

    vi.advanceTimersByTime(50)
    vi.advanceTimersToNextFrame()
    expect(handler1).toHaveBeenCalledTimes(1)
    expect(handler2).not.toHaveBeenCalled()
    expect(handler3).not.toHaveBeenCalled()

    vi.advanceTimersByTime(50)
    vi.advanceTimersToNextFrame()
    expect(handler1).toHaveBeenCalledTimes(2)
    expect(handler2).toHaveBeenCalledTimes(1)
    expect(handler3).not.toHaveBeenCalled()

    vi.advanceTimersByTime(50)
    vi.advanceTimersToNextFrame()
    expect(handler1).toHaveBeenCalledTimes(3)
    expect(handler2).toHaveBeenCalledTimes(1)
    expect(handler3).toHaveBeenCalledTimes(1)
  })

  it('should handle selective cancellation', () => {
    const handler1 = vi.fn()
    const handler2 = vi.fn()
    const handler3 = vi.fn()

    const cancel1 = setIntervalFrame(handler1, 100)
    setIntervalFrame(handler2, 100)
    const cancel3 = setIntervalFrame(handler3, 100)

    cancel1()
    cancel3()

    vi.advanceTimersByTime(100)
    vi.advanceTimersToNextFrame()

    expect(handler1).not.toHaveBeenCalled()
    expect(handler2).toHaveBeenCalledTimes(1)
    expect(handler3).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)
    vi.advanceTimersToNextFrame()

    expect(handler2).toHaveBeenCalledTimes(2)
  })

  it('should handle handler that throws error', () => {
    const handler = vi.fn(() => {
      throw new Error('Handler error')
    })

    setIntervalFrame(handler)

    for (let i = 0; i < 2; i++) {
      expect(() => {
        vi.advanceTimersToNextFrame()
      }).toThrow('Handler error')
    }

    expect(handler).toHaveBeenCalledTimes(2)
  })

  it('should maintain accurate intervals over time', () => {
    const handler = vi.fn()
    const delay = 100
    const ticks = 10
    setIntervalFrame(handler, delay)

    vi.advanceTimersByTime(ticks * delay)
    vi.advanceTimersToNextFrame()

    expect(handler).toHaveBeenCalledTimes(ticks)
  })

  it('should execute on next frame after interval', () => {
    const handler = vi.fn()
    setIntervalFrame(handler, 100)

    vi.advanceTimersByTime(100)
    expect(handler).not.toHaveBeenCalled()

    vi.advanceTimersToNextFrame()
    expect(handler).toHaveBeenCalledTimes(1)
  })
})

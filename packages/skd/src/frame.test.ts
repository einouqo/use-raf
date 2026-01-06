import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { setFrame } from './frame.func'

describe('frame', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should call handler on next frame', () => {
    const handler = vi.fn()
    setFrame(handler)

    expect(handler).not.toHaveBeenCalled()

    vi.advanceTimersToNextFrame()
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('should provide timestamp to handler', () => {
    const handler = vi.fn()
    setFrame(handler)

    vi.advanceTimersToNextFrame()

    expect(handler).toHaveBeenCalled()
    const timestamp = handler.mock.calls[0]?.[0]
    expect(typeof timestamp).toBe('number')
    expect(timestamp).toBeGreaterThan(0)
  })

  it('should cancel frame before execution', () => {
    const handler = vi.fn()
    const cancel = setFrame(handler)

    cancel()

    vi.advanceTimersToNextFrame()
    expect(handler).not.toHaveBeenCalled()
  })

  it('should be safe to call cancel multiple times', () => {
    const handler = vi.fn()
    const cancel = setFrame(handler)

    cancel()
    cancel()
    cancel()

    vi.advanceTimersToNextFrame()
    expect(handler).not.toHaveBeenCalled()
  })

  it('should handle multiple simultaneous frames', () => {
    const handler1 = vi.fn()
    const handler2 = vi.fn()
    const handler3 = vi.fn()

    setFrame(handler1)
    setFrame(handler2)
    setFrame(handler3)

    vi.advanceTimersToNextFrame()
    expect(handler1).toHaveBeenCalledTimes(1)
    expect(handler2).toHaveBeenCalledTimes(1)
    expect(handler3).toHaveBeenCalledTimes(1)
  })

  it('should handle selective cancellation', () => {
    const handler1 = vi.fn()
    const handler2 = vi.fn()
    const handler3 = vi.fn()

    const cancel1 = setFrame(handler1)
    setFrame(handler2)
    const cancel3 = setFrame(handler3)

    cancel1()
    cancel3()

    vi.advanceTimersToNextFrame()
    expect(handler1).not.toHaveBeenCalled()
    expect(handler2).toHaveBeenCalledTimes(1)
    expect(handler3).not.toHaveBeenCalled()
  })

  it('should handle handler that throws error', () => {
    const handler = vi.fn(() => {
      throw new Error('Handler error')
    })

    setFrame(handler)

    expect(() => {
      vi.advanceTimersToNextFrame()
    }).toThrow('Handler error')

    expect(handler).toHaveBeenCalledTimes(1)
  })
})

import { renderHook, act } from '@testing-library/react-hooks/dom'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useRafState } from './state.hook'

describe('useRafState', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('initialization', () => {
    it('should initialize with primitive value', () => {
      const { result } = renderHook(() => useRafState(42))
      expect(result.current[0]).toBe(42)
    })

    it('should initialize with undefined', () => {
      const { result } = renderHook(() => useRafState<number>())
      expect(result.current[0]).toBeUndefined()
    })

    it('should initialize with function', () => {
      const initializer = vi.fn(() => 'initialized')
      const { result } = renderHook(() => useRafState(initializer))
      expect(result.current[0]).toBe('initialized')
      expect(initializer).toHaveBeenCalledTimes(1)
    })

    it('should initialize with object', () => {
      const obj = { count: 0, name: 'test' }
      const { result } = renderHook(() => useRafState(obj))
      expect(result.current[0]).toBe(obj)
    })
  })

  describe('state updates', () => {
    it('should update state on next frame', () => {
      const { result } = renderHook(() => useRafState(0))

      act(() => {
        result.current[1](1)
      })

      // State should not update immediately
      expect(result.current[0]).toBe(0)

      act(() => {
        vi.advanceTimersToNextFrame()
      })

      // State should update after frame
      expect(result.current[0]).toBe(1)
    })

    it('should support updater function', () => {
      const { result } = renderHook(() => useRafState(5))

      act(() => {
        result.current[1]((prev) => prev + 10)
      })

      act(() => {
        vi.advanceTimersToNextFrame()
      })

      expect(result.current[0]).toBe(15)
    })

    it('should update with different types', () => {
      const { result } = renderHook(() => useRafState<string | number>('hello'))

      act(() => {
        result.current[1](42)
      })

      act(() => {
        vi.advanceTimersToNextFrame()
      })

      expect(result.current[0]).toBe(42)
    })

    it('should handle null and undefined updates', () => {
      const { result } = renderHook(() => useRafState<number | null | undefined>(10))

      act(() => {
        result.current[1](null)
      })

      act(() => {
        vi.advanceTimersToNextFrame()
      })

      expect(result.current[0]).toBeNull()

      act(() => {
        result.current[1](undefined)
      })

      act(() => {
        vi.advanceTimersToNextFrame()
      })

      expect(result.current[0]).toBeUndefined()
    })
  })

  describe('batching behavior', () => {
    it('should batch multiple rapid updates', () => {
      const { result } = renderHook(() => useRafState(0))

      act(() => {
        result.current[1](1)
        result.current[1](2)
        result.current[1](3)
      })

      // State should still be initial value
      expect(result.current[0]).toBe(0)

      act(() => {
        vi.advanceTimersToNextFrame()
      })

      // Only the last update should apply
      expect(result.current[0]).toBe(3)
    })

    it('should batch updater functions correctly', () => {
      const { result } = renderHook(() => useRafState(0))

      act(() => {
        result.current[1]((prev) => prev + 1)
        result.current[1]((prev) => prev + 1)
        result.current[1]((prev) => prev + 1)
      })

      act(() => {
        vi.advanceTimersToNextFrame()
      })

      // Last updater function should receive the initial state
      // because frames were cancelled and only the last one executes
      expect(result.current[0]).toBe(1)
    })

    it('should handle sequential frame updates', () => {
      const { result } = renderHook(() => useRafState(0))

      act(() => {
        result.current[1](1)
      })

      act(() => {
        vi.advanceTimersToNextFrame()
      })

      expect(result.current[0]).toBe(1)

      act(() => {
        result.current[1](2)
      })

      act(() => {
        vi.advanceTimersToNextFrame()
      })

      expect(result.current[0]).toBe(2)
    })
  })

  describe('cleanup', () => {
    it('should cancel pending update on unmount', () => {
      const { result, unmount } = renderHook(() => useRafState(0))

      act(() => {
        result.current[1](1)
      })

      unmount()

      act(() => {
        vi.advanceTimersToNextFrame()
      })

      // State should not have updated
      expect(result.current[0]).toBe(0)
    })

    it('should not cause memory leaks with multiple updates', () => {
      const { result, unmount } = renderHook(() => useRafState(0))

      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current[1](i)
        }
      })

      // Should only schedule one frame
      unmount()

      act(() => {
        vi.advanceTimersToNextFrame()
      })

      expect(result.current[0]).toBe(0)
    })
  })

  describe('complex state types', () => {
    it('should work with arrays', () => {
      const { result } = renderHook(() => useRafState<number[]>([1, 2, 3]))

      act(() => {
        result.current[1]([4, 5, 6])
      })

      act(() => {
        vi.advanceTimersToNextFrame()
      })

      expect(result.current[0]).toEqual([4, 5, 6])
    })

    it('should work with objects', () => {
      interface State {
        count: number
        name: string
      }

      const { result } = renderHook(() => useRafState<State>({ count: 0, name: 'initial' }))

      act(() => {
        result.current[1]({ count: 1, name: 'updated' })
      })

      act(() => {
        vi.advanceTimersToNextFrame()
      })

      expect(result.current[0]).toEqual({ count: 1, name: 'updated' })
    })

    it('should work with nested objects', () => {
      interface State {
        user: {
          id: number
          profile: {
            name: string
          }
        }
      }

      const { result } = renderHook(() =>
        useRafState<State>({
          user: {
            id: 1,
            profile: { name: 'John' },
          },
        }),
      )

      act(() => {
        result.current[1]((prev) => ({
          user: {
            ...prev.user,
            profile: { name: 'Jane' },
          },
        }))
      })

      act(() => {
        vi.advanceTimersToNextFrame()
      })

      expect(result.current[0].user.profile.name).toBe('Jane')
    })
  })

  describe('setter stability', () => {
    it('should maintain stable setter reference', () => {
      const { result, rerender } = renderHook(() => useRafState(0))

      const firstSetter = result.current[1]

      act(() => {
        result.current[1](1)
      })

      act(() => {
        vi.advanceTimersToNextFrame()
      })

      rerender()

      const secondSetter = result.current[1]

      expect(firstSetter).toBe(secondSetter)
    })
  })

  describe('edge cases', () => {
    it('should handle setting state to same value', () => {
      const { result } = renderHook(() => useRafState(42))

      act(() => {
        result.current[1](42)
      })

      act(() => {
        vi.advanceTimersToNextFrame()
      })

      expect(result.current[0]).toBe(42)
    })

    it('should handle boolean state', () => {
      const { result } = renderHook(() => useRafState(false))

      act(() => {
        result.current[1](true)
      })

      act(() => {
        vi.advanceTimersToNextFrame()
      })

      expect(result.current[0]).toBe(true)

      act(() => {
        result.current[1]((prev) => !prev)
      })

      act(() => {
        vi.advanceTimersToNextFrame()
      })

      expect(result.current[0]).toBe(false)
    })

    it('should handle function as state value', () => {
      const fn = () => 'hello'
      const { result } = renderHook(() => useRafState<() => string>(() => fn))

      expect(result.current[0]).toBe(fn)

      const newFn = () => 'world'
      act(() => {
        result.current[1](() => newFn)
      })

      act(() => {
        vi.advanceTimersToNextFrame()
      })

      expect(result.current[0]).toBe(newFn)
    })
  })
})

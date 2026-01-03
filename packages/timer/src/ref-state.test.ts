import { renderHook, act } from '@testing-library/react-hooks/dom'
import { describe, it, expect } from 'vitest'
import { useRefState } from './ref-state.hook'

describe('useRefState', () => {
  it('should initialize correctly with a value', () => {
    const { result } = renderHook(() => useRefState(0))
    const [ref, state] = result.current

    expect(state).toBe(0)
    expect(ref.current).toBe(0)
  })

  it('should initialize correctly with a lazy function', () => {
    const { result } = renderHook(() => useRefState(() => 10))
    const [ref, state] = result.current

    expect(state).toBe(10)
    expect(ref.current).toBe(10)
  })

  it('should update both ref (sync) and state (async)', () => {
    const { result } = renderHook(() => useRefState(0))

    act(() => {
      const [, , setState] = result.current
      setState(5)

      const [ref] = result.current
      expect(ref.current).toBe(5)
    })

    const [, state] = result.current
    expect(state).toBe(5)
  })

  it('should handle functional updates', () => {
    const { result } = renderHook(() => useRefState(10))

    act(() => {
      const [, , setState] = result.current
      setState((prev) => prev + 5)
    })

    const [ref, state] = result.current
    expect(ref.current).toBe(15)
    expect(state).toBe(15)
  })
})

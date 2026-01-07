import { renderHook } from '@testing-library/react-hooks/dom'
import ReactUse from 'react-use'
import * as ReactUses from '@reactuses/core'
import * as ShinedUse from '@shined/react-use'
import type { BenchOptions } from 'vitest'
import { describe, bench, vi } from 'vitest'
import { useRafState } from './state.hook'
import type { Dispatch, SetStateAction } from 'react'

type Hook<T = unknown> = () => readonly [T, Dispatch<SetStateAction<T>>]

describe('raf state hook', () => {
  describe('mount cost', () => {
    const scenario = (...args: Parameters<typeof renderHook>) => {
      const { unmount } = renderHook(...args)
      unmount()
    }

    bench('@use-raf/state #regress mount cost', () => scenario(() => useRafState(0)))
    bench('@shined/react-use', () => scenario(() => ShinedUse.useRafState(0)))
    bench('react-use', () => scenario(() => ReactUse.useRafState(0)))
    bench('@reactuses/core', () => scenario(() => ReactUses.useRafState(0)))
  })

  describe('throughput', () => {
    const options: BenchOptions = {
      iterations: 100,
    }

    describe('single update per frame', () => {
      const UPDATES = 1_000

      const scenario = (hook: Hook<number>) => {
        const { result, unmount } = renderHook(hook)
        vi.useFakeTimers()
        for (let i = 0; i < UPDATES; i++) {
          result.current[1](i)
          vi.advanceTimersToNextFrame()
        }
        vi.useRealTimers()
        unmount()
      }

      bench(
        '@use-raf/state #regress throughput single update',
        () => scenario(() => useRafState(0)),
        options,
      )
      bench('@shined/react-use', () => scenario(() => ShinedUse.useRafState(0)), options)
      bench('react-use', () => scenario(() => ReactUse.useRafState(0)), options)
      bench('@reactuses/core', () => scenario(() => ReactUses.useRafState(0)), options)
    })

    describe('batched updates', () => {
      const BATCHES = 100
      const UPDATES_PER_BATCH = 10

      const scenario = (hook: Hook<number>) => {
        const { result, unmount } = renderHook(hook)
        vi.useFakeTimers()
        for (let batch = 0; batch < BATCHES; batch++) {
          for (let i = 0; i < UPDATES_PER_BATCH; i++) {
            result.current[1](batch * UPDATES_PER_BATCH + i)
          }
          vi.advanceTimersToNextFrame()
        }
        vi.useRealTimers()
        unmount()
      }

      bench(
        '@use-raf/state #regress throughput batched updates',
        () => scenario(() => useRafState(0)),
        options,
      )
      bench('@shined/react-use', () => scenario(() => ShinedUse.useRafState(0)), options)
      bench('react-use', () => scenario(() => ReactUse.useRafState(0)), options)
      bench('@reactuses/core', () => scenario(() => ReactUses.useRafState(0)), options)
    })

    describe('updater functions', () => {
      const UPDATES = 1_000

      const scenario = (hook: Hook<number>) => {
        const { result, unmount } = renderHook(hook)
        vi.useFakeTimers()
        for (let i = 0; i < UPDATES; i++) {
          result.current[1]((prev: number) => prev + 1)
          vi.advanceTimersToNextFrame()
        }
        vi.useRealTimers()
        unmount()
      }

      bench(
        '@use-raf/state #regress throughput updater functions',
        () => scenario(() => useRafState(0)),
        options,
      )
      bench('@shined/react-use', () => scenario(() => ShinedUse.useRafState(0)), options)
      bench('react-use', () => scenario(() => ReactUse.useRafState(0)), options)
      bench('@reactuses/core', () => scenario(() => ReactUses.useRafState(0)), options)
    })

    describe('complex state', () => {
      const UPDATES = 500
      interface State {
        count: number
        items: number[]
        metadata: { timestamp: number }
      }

      const initialState: State = { count: 0, items: [], metadata: { timestamp: 0 } }

      const scenario = (hook: Hook<State>) => {
        const { result, unmount } = renderHook(hook)
        vi.useFakeTimers()
        for (let i = 0; i < UPDATES; i++) {
          result.current[1]((prev: State) => ({
            count: prev.count + 1,
            items: [...prev.items, i],
            metadata: { timestamp: i },
          }))
          vi.advanceTimersToNextFrame()
        }
        vi.useRealTimers()
        unmount()
      }

      bench(
        '@use-raf/state #regress throughput complex state',
        () => scenario(() => useRafState(initialState)),
        options,
      )
      bench('@shined/react-use', () => scenario(() => ShinedUse.useRafState(initialState)), options)
      bench('react-use', () => scenario(() => ReactUse.useRafState(initialState)), options)
      bench('@reactuses/core', () => scenario(() => ReactUses.useRafState(initialState)), options)
    })
  })
})

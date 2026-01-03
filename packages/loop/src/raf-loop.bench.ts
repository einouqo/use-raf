import { renderHook } from '@testing-library/react-hooks'
import ReactUse from 'react-use'
import * as ShinedUse from '@shined/react-use'
import type { BenchOptions } from 'vitest'
import { describe, bench, vi } from 'vitest'
import { fps, useRafLoop as useLoop } from './raf-loop.hook'
import { useCallback, useRef } from 'react'

type HookControl = ReturnType<typeof useLoop>

// NOTE: we bench the hook to make comparison more fair as other implementations expose ref or ref-alike activity flag
const useRafLoop = (...[callback, opts]: Parameters<typeof useLoop>): HookControl => {
  const isActiveRef = useRef(false)
  const setActive = useCallback((active: boolean) => {
    isActiveRef.current = active
  }, [])
  const control = useLoop(callback, { ...opts, setActive })
  return control
}

const useReactUseRafLoop = (...args: Parameters<typeof ReactUse.useRafLoop>): HookControl => {
  const [stop, start] = ReactUse.useRafLoop(...args)
  return { stop, start }
}

const useShinedRafLoop = (...args: Parameters<typeof ShinedUse.useRafLoop>): HookControl => {
  const { pause, resume } = ShinedUse.useRafLoop(...args)
  return { stop: pause, start: resume }
}

const noop = () => {}

describe('raf loop hook', () => {
  describe('mount cost', () => {
    const scenario = (...args: Parameters<typeof renderHook>) => {
      const { unmount } = renderHook(...args)
      unmount()
    }

    bench('@use-raf/loop #regress mount cost', () =>
      scenario(() => useRafLoop(noop, { immediate: false })),
    )
    bench('react-use', () => scenario(() => useReactUseRafLoop(noop, false)))
    bench('@shined/react-use', () => scenario(() => useShinedRafLoop(noop, { immediate: false })))
  })

  describe('throughput', () => {
    const scenario = (ctrl: HookControl, frames: number) => {
      vi.useFakeTimers()
      ctrl.start()
      vi.advanceTimersByTime(frames * 16)
      ctrl.stop()
      vi.useRealTimers()
    }

    const FRAMES = 10_000
    const options: BenchOptions = {
      iterations: 100,
    }

    describe('no throttle', () => {
      const raf = renderHook(() => useRafLoop(noop, { immediate: false }))
      const react = renderHook(() => useReactUseRafLoop(noop, false))
      const shined = renderHook(() => useShinedRafLoop(noop, { immediate: false }))

      bench(
        '@use-raf/loop #regress throughput no throttle',
        () => scenario(raf.result.current, FRAMES),
        options,
      )
      bench('react-use', () => scenario(react.result.current, FRAMES), options)
      bench('@shined/react-use', () => scenario(shined.result.current, FRAMES), options)
    })

    describe('throttle', () => {
      for (const limit of [120, 60, 30, 10]) {
        describe(`${limit}fps`, () => {
          const raf = renderHook(() => useRafLoop(noop, { immediate: false, throttle: fps(limit) }))
          const shined = renderHook(() =>
            useShinedRafLoop(noop, { immediate: false, fpsLimit: limit }),
          )

          bench(
            `@use-raf/loop #regress throughput ${limit}fps throttle`,
            () => scenario(raf.result.current, FRAMES),
            options,
          )
          bench('@shined/react-use', () => scenario(shined.result.current, FRAMES), options)
        })
      }
    })
  })
})

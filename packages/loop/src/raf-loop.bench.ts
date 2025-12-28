import { renderHook, act } from '@testing-library/react-hooks/dom'
import ReactUse from 'react-use'
import * as ShinedUse from '@shined/react-use'
import { describe, bench, vi } from 'vitest'
import { useRafLoop as useLoop } from './raf-loop.hook'
import { useCallback, useRef } from 'react'

const flush = setupRafBenchmark()

// NOTE: we bench the hook to make comparison more fair as other implementations expose ref or ref-alike activity flag
const useRafLoop = (...[callback, opts]: Parameters<typeof useLoop>) => {
  const isActiveRef = useRef(false)
  const setActive = useCallback((active: boolean) => {
    isActiveRef.current = active
  }, [])
  const control = useLoop(callback, { ...opts, setActive })
  return { ...control, isActiveRef }
}

describe('raf loop hook', () => {
  describe('@regression', () => {
    const callback = () => {}

    bench('hook initialization overhead', () => {
      const { unmount } = renderHook(() => useRafLoop(callback))
      unmount()
    })

    bench('start/stop cycle performance', () => {
      const n = 3
      const { result, unmount } = renderHook(() => useRafLoop(callback, { immediate: false }))
      for (let i = 0; i < n; i++) {
        act(() => {
          result.current.start()
        })
        flush(100)
        act(() => {
          result.current.stop()
        })
      }
      unmount()
    })

    bench('callback execution with no throttle', () => {
      const { unmount } = renderHook(() => useRafLoop(callback))
      flush(10_000)
      unmount()
    })

    bench('callback execution with throttle', () => {
      const { unmount } = renderHook(() => useRafLoop(callback, { throttle: 32 }))
      flush(10_000)
      unmount()
    })
  })

  describe('@comparison', () => {
    describe('hook initialization overhead', () => {
      const callback = () => {}

      bench('@use-raf/loop', () => {
        const { unmount } = renderHook(() => useRafLoop(callback))
        unmount()
      })

      bench('react-use', () => {
        const { unmount } = renderHook(() => ReactUse.useRafLoop(callback))
        unmount()
      })

      bench('@shined/react-use', () => {
        const { unmount } = renderHook(() => ShinedUse.useRafLoop(callback))
        unmount()
      })
    })

    describe('start/stop cycle performance', () => {
      const n = 3
      const callback = () => {}

      bench('@use-raf/loop', () => {
        const { result, unmount } = renderHook(() => useRafLoop(callback, { immediate: false }))
        for (let i = 0; i < n; i++) {
          act(() => {
            result.current.start()
          })
          flush(100)
          act(() => {
            result.current.stop()
          })
        }
        unmount()
      })

      bench('react-use', () => {
        const { result, unmount } = renderHook(() => ReactUse.useRafLoop(callback, false))
        for (let i = 0; i < n; i++) {
          act(() => {
            const [, start] = result.current
            start()
          })
          flush(100)
          act(() => {
            const [stop] = result.current
            stop()
          })
        }
        unmount()
      })

      bench('@shined/react-use', () => {
        const { result, unmount } = renderHook(() => ShinedUse.useRafLoop(callback))
        for (let i = 0; i < n; i++) {
          act(() => {
            const { resume } = result.current
            resume()
          })
          flush(100)
          act(() => {
            const { pause } = result.current
            pause()
          })
        }
        unmount()
      })
    })

    describe('callback execution with no throttle', () => {
      const callback = () => {}

      bench('@use-raf/loop', () => {
        const { unmount } = renderHook(() => useRafLoop(callback))
        flush(10_000)
        unmount()
      })

      bench('react-use', () => {
        const { unmount } = renderHook(() => ReactUse.useRafLoop(callback))
        flush(10_000)
        unmount()
      })

      bench('@shined/react-use', () => {
        const { unmount } = renderHook(() => ShinedUse.useRafLoop(callback))
        flush(10_000)
        unmount()
      })
    })

    describe('callback execution with throttle', () => {
      const callback = () => {}

      bench('@use-raf/loop', () => {
        const { unmount } = renderHook(() => useRafLoop(callback, { throttle: 32 }))
        flush(10_000)
        unmount()
      })

      bench('@shined/react-use', () => {
        const { unmount } = renderHook(() =>
          ShinedUse.useRafLoop(callback, { fpsLimit: 1000 / 32 }),
        )
        flush(10_000)
        unmount()
      })
    })
  })
})

/**
 * HOSTILE ENVIRONMENT POLYFILL
 * Manually mocking requestAnimationFrame making the vitest's benchmark runner valid.
 */
export function setupRafBenchmark() {
  let queue: FrameRequestCallback[] = []

  if (typeof window !== 'undefined') {
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      queue.push(cb)
      return 1
    })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {})
  }

  return (frames: number) => {
    // REMOVED: queue = []
    // Do not clear the queue here; we need to process what was scheduled by start()!

    for (let i = 0; i < frames; i++) {
      if (queue.length === 0) {
        break
      }

      // Take current callbacks out of queue
      const current = queue
      // clear queue for the NEXT frame (this part is correct)
      queue = []

      const now = performance.now()
      current.forEach((cb) => {
        cb(now)
      })
    }
  }
}

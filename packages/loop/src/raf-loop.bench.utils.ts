import { vi } from 'vitest'

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

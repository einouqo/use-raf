import { useCallback, useEffect, useRef } from 'react'

type Callback = (timestamp: number, delta: number) => void

type Options = {
  immediate?: boolean
  throttle?: number
  setActive?: (active: boolean) => void
}

type Return = {
  start: () => void
  stop: () => void
}

export const useRafLoop = (
  callback: Callback,
  { immediate = true, throttle = 0, setActive }: Options = {},
): Return => {
  const callbackRef = useRef(callback)
  const setActiveRef = useRef(setActive)
  useEffect(() => {
    callbackRef.current = callback
    setActiveRef.current = setActive
  })

  const throttleRef = useRef(throttle)
  useEffect(() => {
    throttleRef.current = throttle
  }, [throttle])

  const requestInfoRef = useRef<{
    id: number
    timestamp?: number
  } | null>(null)

  const loop = useCallback((timestamp: number) => {
    if (requestInfoRef.current === null) {
      return
    }

    const last = requestInfoRef.current.timestamp
    const delta = timestamp - (last ?? timestamp)

    // NOTE: the "edge" term is taken from the mdn throttle documentation
    // "The first call ... is known as the leading edge."
    // "After n milliseconds have elapsed from the first call ..., we have reached the trailing edge." (here n ms is a throttle duration)
    // We fire when we cross that edge (start of a new throttle window).
    // Ref: https://developer.mozilla.org/en-US/docs/Glossary/Throttle
    const isBeyondEdge = !last || delta >= throttleRef.current
    if (!isBeyondEdge) {
      requestInfoRef.current.id = requestAnimationFrame(loop)
      return
    }

    callbackRef.current(timestamp, delta)

    // NOTE: post-flight check in case the stop function has been called in the callback
    if (requestInfoRef.current === null) {
      return
    }

    requestInfoRef.current.timestamp = timestamp
    requestInfoRef.current.id = requestAnimationFrame(loop)
  }, [])

  const stop = useCallback(() => {
    if (requestInfoRef.current === null) {
      return
    }
    cancelAnimationFrame(requestInfoRef.current.id)
    requestInfoRef.current = null
    setActiveRef.current?.(false)
  }, [])

  const start = useCallback(() => {
    if (requestInfoRef.current !== null) {
      return
    }
    const id = requestAnimationFrame(loop)
    requestInfoRef.current = { id }
    setActiveRef.current?.(true)
  }, [loop])

  // biome-ignore lint/correctness/useExhaustiveDependencies: lifecycle effect
  useEffect(() => {
    immediate && start()
    return stop
  }, [])

  return { stop, start }
}

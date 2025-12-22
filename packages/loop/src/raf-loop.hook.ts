import { useCallback, useEffect, useRef, useState } from 'react'

type Callback = (timestamp: number, delta: number) => void

type Options = {
  throttle?: number
}

type Return = [() => void, () => void, boolean]

export const useRafLoop = (callback: Callback, { throttle = 0 }: Options = {}): Return => {
  const callbackRef = useRef(callback)
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const throttleRef = useRef(throttle)
  useEffect(() => {
    throttleRef.current = throttle
  }, [throttle])

  const [isActive, setIsActive] = useState(false)
  const requestInfoRef = useRef<{
    id: number
    timestamp?: number
  } | null>(null)

  const loop = useCallback((timestamp: number) => {
    if (requestInfoRef.current === null) {
      return
    }

    const last = requestInfoRef.current?.timestamp
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
    setIsActive(false)
  }, [])

  const start = useCallback(() => {
    if (requestInfoRef.current !== null) {
      return
    }
    const id = requestAnimationFrame(loop)
    requestInfoRef.current = { id }
    setIsActive(true)
  }, [loop])

  useEffect(() => stop, [stop])

  return [start, stop, isActive]
}

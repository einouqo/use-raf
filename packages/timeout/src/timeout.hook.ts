import type { DependencyList } from 'react'
import { useEffect, useRef } from 'react'
import type { FrameTimeoutHandler } from './timeout.func'
import { setFrameTimeout } from './timeout.func'

export const useFrameTimeout = (
  handler: FrameTimeoutHandler,
  delay?: number,
  deps: DependencyList = [],
) => {
  const handlerRef = useRef(handler)
  useEffect(() => {
    handlerRef.current = handler
  })

  useEffect(
    () => setFrameTimeout((...args) => handlerRef.current(...args), delay),
    [delay, ...deps],
  )
}

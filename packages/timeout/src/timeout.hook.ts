import type { DependencyList } from 'react'
import { useEffect, useRef } from 'react'
import type { FrameTimoutHander } from './timeout.func'
import { setFrameTimeout } from './timeout.func'

export const useFrameTimeout = (
  handler: FrameTimoutHander,
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

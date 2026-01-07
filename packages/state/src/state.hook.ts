import type { Cancel } from '@use-raf/skd'
import { setFrame } from '@use-raf/skd'
import { useCallback, useEffect, useRef, useState } from 'react'

export const useRafState: typeof useState = <S>(initialState?: S | (() => S)) => {
  const [state, setState] = useState(initialState)
  const cancelRef = useRef<Cancel>()

  const set = useCallback<typeof setState>((v) => {
    cancelRef.current?.()
    cancelRef.current = setFrame(() => setState(v))
  }, [])

  useEffect(() => () => cancelRef.current?.(), [])

  return [state, set]
}

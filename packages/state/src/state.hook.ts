import type { Cancel } from '@use-raf/skd'
import { setFrame } from '@use-raf/skd'
import { useCallback, useEffect, useRef, useState } from 'react'

export const useRafState: typeof useState = <S>(initialState?: S | (() => S)) => {
  const [state, setState] = useState(initialState)
  const stateRef = useRef(state)

  const cancelRef = useRef<Cancel>()

  const set = useCallback<typeof setState>((value) => {
    const next = value instanceof Function ? (value as (prev?: S) => S)(stateRef.current) : value

    stateRef.current = next

    cancelRef.current?.()
    cancelRef.current = setFrame(() => setState(() => next))
  }, [])

  useEffect(() => () => cancelRef.current?.(), [])

  return [state, set]
}

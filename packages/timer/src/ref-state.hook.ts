import type { MutableRefObject, Dispatch, SetStateAction } from 'react'
import { useRef, useState, useCallback } from 'react'

type Return<S> = [MutableRefObject<S>, S, Dispatch<SetStateAction<S>>]

export const useRefState = <S>(initialState: S | (() => S)): Return<S> => {
  const [state, setState] = useState(initialState)
  const ref = useRef(state)

  const set = useCallback<typeof setState>((act) => {
    const v = typeof act === 'function' ? (act as (prev: S) => S)(ref.current) : act
    ref.current = v
    setState(v)
  }, [])

  return [ref, state, set]
}

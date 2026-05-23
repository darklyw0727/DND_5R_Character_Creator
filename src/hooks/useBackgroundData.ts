import { useState, useEffect } from 'react'
import { loadJson } from '../services/dataLoader'
import { parseBackgroundFile } from '../services/backgroundParser'
import type { ParsedBackground } from '../services/backgroundParser'
import type { RawBackgroundFile } from '../types/5etools'

interface State {
  data: ParsedBackground[]
  loading: boolean
  error: string | null
}

let cached: ParsedBackground[] | null = null

export function useBackgroundData() {
  const [state, setState] = useState<State>({
    data: cached ?? [],
    loading: !cached,
    error: null,
  })

  useEffect(() => {
    if (cached) return
    loadJson<RawBackgroundFile>('backgrounds.json')
      .then(raw => {
        const data = parseBackgroundFile(raw)
        cached = data
        setState({ data, loading: false, error: null })
      })
      .catch(err => setState(s => ({ ...s, loading: false, error: err.message })))
  }, [])

  return state
}

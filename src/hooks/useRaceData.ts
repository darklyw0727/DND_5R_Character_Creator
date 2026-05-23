import { useState, useEffect } from 'react'
import { loadJson } from '../services/dataLoader'
import { parseRaceFile } from '../services/raceParser'
import type { ParsedRace } from '../services/raceParser'
import type { RawRaceFile } from '../types/5etools'

interface State {
  data: ParsedRace[]
  loading: boolean
  error: string | null
}

let cached: ParsedRace[] | null = null

export function useRaceData() {
  const [state, setState] = useState<State>({
    data: cached ?? [],
    loading: !cached,
    error: null,
  })

  useEffect(() => {
    if (cached) return
    loadJson<RawRaceFile>('races.json')
      .then(raw => {
        const data = parseRaceFile(raw)
        cached = data
        setState({ data, loading: false, error: null })
      })
      .catch(err => setState(s => ({ ...s, loading: false, error: err.message })))
  }, [])

  return state
}

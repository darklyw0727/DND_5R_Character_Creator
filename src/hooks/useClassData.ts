import { useState, useEffect } from 'react'
import { loadJson, CLASS_FILES } from '../services/dataLoader'
import { parseClassFile } from '../services/classParser'
import type { ParsedClassFile } from '../services/classParser'
import type { RawClassFile } from '../types/5etools'

interface State {
  data: Map<string, ParsedClassFile>
  loading: boolean
  error: string | null
}

let cachedData: Map<string, ParsedClassFile> | null = null

export function useClassData() {
  const [state, setState] = useState<State>({
    data: cachedData ?? new Map(),
    loading: !cachedData,
    error: null,
  })

  useEffect(() => {
    if (cachedData) return

    Promise.all(CLASS_FILES.map(f => loadJson<RawClassFile>(f)))
      .then(files => {
        const map = new Map<string, ParsedClassFile>()
        for (const raw of files) {
          const parsed = parseClassFile(raw)
          if (parsed) map.set(parsed.summary.name, parsed)
        }
        cachedData = map
        setState({ data: map, loading: false, error: null })
      })
      .catch(err => setState(s => ({
        ...s, loading: false, error: err.message,
      })))
  }, [])

  return state
}

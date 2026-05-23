import { useState, useEffect } from 'react'
import { loadJson } from '../services/dataLoader'
import { parseSpellFile } from '../services/spellParser'
import type { ParsedSpell } from '../services/spellParser'
import type { RawSpellFile } from '../types/5etools'

interface State {
  data: ParsedSpell[]
  loading: boolean
  error: string | null
}

let cached: ParsedSpell[] | null = null

export function useSpellData() {
  const [state, setState] = useState<State>({
    data: cached ?? [],
    loading: !cached,
    error: null,
  })

  useEffect(() => {
    if (cached) return
    loadJson<RawSpellFile>('spells-xphb.json')
      .then(raw => {
        const data = parseSpellFile(raw)
        cached = data
        setState({ data, loading: false, error: null })
      })
      .catch(err => setState(s => ({ ...s, loading: false, error: err.message })))
  }, [])

  return state
}

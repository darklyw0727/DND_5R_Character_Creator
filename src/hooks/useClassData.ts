import { useState, useEffect } from 'react'
import { loadJson, CLASS_FILES } from '../services/dataLoader'
import { parseClassFile } from '../services/classParser'
import type { ParsedClassFile } from '../services/classParser'
import type { RawClassFile, Entry } from '../types/5etools'

interface ZhOverlay {
  classFeature?: Record<string, Entry[]>
  subclassFeature?: Record<string, Entry[]>
}

async function tryLoadZhOverlay(className: string): Promise<ZhOverlay | null> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/zh/class-${className.toLowerCase()}-zh.json`)
    if (!res.ok) return null
    return res.json() as Promise<ZhOverlay>
  } catch {
    return null
  }
}

function applyZhOverlay(parsed: ParsedClassFile, overlay: ZhOverlay): ParsedClassFile {
  const features = new Map(parsed.features)
  for (const [key, entries] of Object.entries(overlay.classFeature ?? {})) {
    const existing = features.get(key)
    if (existing) features.set(key, { ...existing, entries })
  }
  const subclassFeatures = new Map(parsed.subclassFeatures)
  for (const [key, entries] of Object.entries(overlay.subclassFeature ?? {})) {
    const existing = subclassFeatures.get(key)
    if (existing) subclassFeatures.set(key, { ...existing, entries })
  }
  return { ...parsed, features, subclassFeatures }
}

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
    if (cachedData && !import.meta.env.DEV) return

    Promise.all(CLASS_FILES.map(f => loadJson<RawClassFile>(f)))
      .then(async files => {
        const map = new Map<string, ParsedClassFile>()
        for (const raw of files) {
          let parsed = parseClassFile(raw)
          if (!parsed) continue
          const overlay = await tryLoadZhOverlay(parsed.summary.name)
          if (overlay) parsed = applyZhOverlay(parsed, overlay)
          map.set(parsed.summary.name, parsed)
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

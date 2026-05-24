import { useState, useEffect } from 'react'
import { loadJson } from '../services/dataLoader'
import type { RawFeatFile, RawFeat } from '../types/5etools'

// 以小寫名稱為 key 的 XPHB 專長 Map
let cached: Map<string, RawFeat> | null = null

export function useFeatData() {
  const [data, setData] = useState<Map<string, RawFeat>>(cached ?? new Map())
  const [loading, setLoading] = useState(!cached)

  useEffect(() => {
    if (cached) return
    loadJson<RawFeatFile>('feats.json')
      .then(raw => {
        const map = new Map<string, RawFeat>()
        for (const feat of raw.feat) {
          if (feat.source === 'XPHB') {
            map.set(feat.name.toLowerCase(), feat)
          }
        }
        cached = map
        setData(map)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return { data, loading }
}

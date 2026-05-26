import { useState, useEffect } from 'react'
import { loadJson } from '../services/dataLoader'
import { parseRaceFile } from '../services/raceParser'
import type { ParsedRace } from '../services/raceParser'
import type { RawRaceFile, Entry } from '../types/5etools'
import { RACE_FEATURE_NAME_ZH } from '../data/zhTranslations'

interface ZhRaceData {
  overview?: string[]
  raceFeature?: Record<string, Entry[]>
}

async function tryLoadZhOverlay(): Promise<Record<string, ZhRaceData> | null> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/zh/races-zh.json`)
    if (!res.ok) return null
    return res.json() as Promise<Record<string, ZhRaceData>>
  } catch {
    return null
  }
}

// 對應 "Race; Descriptor" 格式的亞種名稱到 raceFeature 查詢用的 suffix
const VARIANT_FEATURE_SUFFIX: Record<string, string> = {
  'Elf; Drow Lineage':              'Drow',
  'Elf; High Elf Lineage':          'High Elf',
  'Elf; Wood Elf Lineage':          'Wood Elf',
  'Gnome; Forest Gnome Lineage':    'Forest Gnome',
  'Gnome; Rock Gnome Lineage':      'Rock Gnome',
  'Goliath; Cloud Giant Ancestry':  'Cloud',
  'Goliath; Fire Giant Ancestry':   'Fire',
  'Goliath; Frost Giant Ancestry':  'Frost',
  'Goliath; Hill Giant Ancestry':   'Hill',
  'Goliath; Stone Giant Ancestry':  'Stone',
  'Goliath; Storm Giant Ancestry':  'Storm',
  'Tiefling; Abyssal Legacy':       'Abyssal',
  'Tiefling; Chthonic Legacy':      'Chthonic',
  'Tiefling; Infernal Legacy':      'Infernal',
}

function getVariantFeatureSuffix(variantName: string): string | undefined {
  if (VARIANT_FEATURE_SUFFIX[variantName]) return VARIANT_FEATURE_SUFFIX[variantName]
  return variantName.match(/\(([^)]+)\)$/)?.[1]
}

type NamedEntry = { name?: string; entries?: Entry[] }

function translateNamedEntry(entry: Entry, featureMap: Record<string, Entry[]>, variantSuffix?: string): Entry {
  if (typeof entry === 'string') return entry
  const e = entry as NamedEntry
  if (!e.name) return entry
  const specificKey = variantSuffix ? `${e.name} (${variantSuffix})` : null
  const zhEntries = (specificKey && featureMap[specificKey]) ?? featureMap[e.name]
  if (!zhEntries) return entry
  const nameKey = specificKey ?? e.name
  return {
    ...entry,
    name: RACE_FEATURE_NAME_ZH[nameKey] ?? RACE_FEATURE_NAME_ZH[e.name] ?? e.name,
    entries: zhEntries,
  } as Entry
}

function applyZhToRace(race: ParsedRace, zhData: ZhRaceData): ParsedRace {
  const featureMap = zhData.raceFeature ?? {}
  const overview = zhData.overview ?? []
  let overviewIdx = 0

  const newEntries = race.entries.map((entry): Entry => {
    if (typeof entry === 'string') return overview[overviewIdx++] ?? entry
    return translateNamedEntry(entry, featureMap)
  })

  const newVariants = race.variants?.map(v => {
    const suffix = getVariantFeatureSuffix(v.name)
    return {
      ...v,
      entries: v.entries.map(entry => translateNamedEntry(entry, featureMap, suffix)),
    }
  })

  return { ...race, entries: newEntries, variants: newVariants }
}

function applyZhOverlay(races: ParsedRace[], overlay: Record<string, ZhRaceData>): ParsedRace[] {
  return races.map(race => {
    const zhData = overlay[race.name]
    return zhData ? applyZhToRace(race, zhData) : race
  })
}

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
    Promise.all([
      loadJson<RawRaceFile>('races.json'),
      tryLoadZhOverlay(),
    ])
      .then(([raw, overlay]) => {
        let data = parseRaceFile(raw)
        if (overlay) data = applyZhOverlay(data, overlay)
        cached = data
        setState({ data, loading: false, error: null })
      })
      .catch(err => setState(s => ({ ...s, loading: false, error: err.message })))
  }, [])

  return state
}

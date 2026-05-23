import type { RawRaceFile, RawRace, RaceVersion, Entry } from '../types/5etools'

export interface ParsedRace {
  name: string
  source: string
  size: string
  walkSpeed: number
  flySpeed?: number
  darkvision?: number
  creatureTypes: string[]
  entries: Entry[]
  variants?: RaceVariant[]  // 若有 _versions，展開為亞種選項
  rawRace: RawRace
}

export interface RaceVariant {
  name: string
  entries: Entry[]
  darkvision?: number
  additionalSpells?: unknown[]
}

function getWalkSpeed(raw: RawRace): number {
  if (typeof raw.speed === 'number') return raw.speed
  return raw.speed.walk ?? 30
}

function getFlySpeed(raw: RawRace): number | undefined {
  if (typeof raw.speed === 'number') return undefined
  return raw.speed.fly
}

function applyVersionMod(baseEntries: Entry[], version: RaceVersion): Entry[] {
  const mod = version._mod
  if (!mod?.entries) return [...baseEntries]

  const ops = Array.isArray(mod.entries) ? mod.entries : [mod.entries]
  let entries = [...baseEntries]

  for (const op of ops) {
    if (op.mode === 'replaceArr' && op.replace) {
      const idx = entries.findIndex(e =>
        typeof e === 'object' && 'name' in e && (e as { name?: string }).name === op.replace
      )
      if (idx !== -1 && op.items !== undefined) {
        entries[idx] = op.items as Entry
      }
    }
  }
  return entries
}

export function parseRaceFile(raw: RawRaceFile): ParsedRace[] {
  const xphbRaces = raw.race.filter(r => r.source === 'XPHB' && !r._copy)

  return xphbRaces.map(race => {
    const variants: RaceVariant[] | undefined = race._versions?.map(v => ({
      name: v.name,
      entries: v.entries ? (Array.isArray(v.entries) ? v.entries : [v.entries]) : applyVersionMod(race.entries, v),
      darkvision: v.darkvision,
      additionalSpells: v.additionalSpells,
    }))

    return {
      name: race.name,
      source: race.source,
      size: race.size?.[0] ?? 'M',
      walkSpeed: getWalkSpeed(race),
      flySpeed: getFlySpeed(race),
      darkvision: race.darkvision,
      creatureTypes: race.creatureTypes ?? ['humanoid'],
      entries: race.entries,
      variants: variants?.length ? variants : undefined,
      rawRace: race,
    }
  })
}

export const SIZE_LABEL: Record<string, string> = {
  T: '微型', S: '小型', M: '中型', L: '大型', H: '巨型', G: '龐然大物',
}

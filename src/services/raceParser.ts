import type { RawRaceFile, RawRace, RaceVersion, Entry, RaceVersionMod } from '../types/5etools'
import { RACE_NAME_ZH } from '../data/zhTranslations'

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

function substituteVars(str: string, vars: Record<string, string>): string {
  return str.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? `{{${key}}}`)
}

function applyMod(baseEntries: Entry[], mod: RaceVersionMod, vars?: Record<string, string>): Entry[] {
  if (!mod.entries) return [...baseEntries]

  const ops = Array.isArray(mod.entries) ? mod.entries : [mod.entries]
  let entries = [...baseEntries]

  for (const op of ops) {
    if (op.mode === 'removeArr' && op.names) {
      const namesToRemove = Array.isArray(op.names) ? op.names : [op.names]
      entries = entries.filter(e =>
        !(typeof e === 'object' && 'name' in e && namesToRemove.includes((e as { name?: string }).name ?? ''))
      )
    } else if (op.mode === 'replaceArr' && op.replace) {
      const idx = entries.findIndex(e =>
        typeof e === 'object' && 'name' in e && (e as { name?: string }).name === op.replace
      )
      if (idx !== -1 && op.items !== undefined) {
        let item: Entry = op.items as Entry
        if (vars) {
          item = JSON.parse(substituteVars(JSON.stringify(item), vars)) as Entry
        }
        entries[idx] = item
      }
    }
  }
  return entries
}

function applyVersionMod(baseEntries: Entry[], version: RaceVersion): Entry[] {
  if (!version._mod) return [...baseEntries]
  return applyMod(baseEntries, version._mod)
}

function expandVersions(race: RawRace): RaceVariant[] | undefined {
  if (!race._versions) return undefined
  const variants: RaceVariant[] = []

  for (const v of race._versions) {
    if (v._abstract && v._implementations) {
      for (const impl of v._implementations) {
        const vars = impl._variables
        const name = substituteVars(v._abstract.name, vars)
        const entries = v._abstract._mod
          ? applyMod(race.entries, v._abstract._mod, vars)
          : [...race.entries]
        variants.push({ name, entries, darkvision: impl.darkvision, additionalSpells: impl.additionalSpells })
      }
    } else if (v.name) {
      const entries = v.entries
        ? (Array.isArray(v.entries) ? v.entries : [v.entries])
        : applyVersionMod(race.entries, v)
      variants.push({ name: v.name, entries, darkvision: v.darkvision, additionalSpells: v.additionalSpells })
    }
  }
  return variants.length ? variants : undefined
}

export function parseRaceFile(raw: RawRaceFile): ParsedRace[] {
  const xphbRaces = raw.race.filter(r => r.source === 'XPHB' && !r._copy)

  return xphbRaces.map(race => {
    const variants = expandVersions(race)

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

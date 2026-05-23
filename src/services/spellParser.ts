import type { RawSpellFile, RawSpell } from '../types/5etools'
import { CLASS_SPELL_LISTS } from '../data/spellClassMap'

export interface ParsedSpell {
  name: string
  source: string
  level: number
  school: string
  schoolLabel: string
  castingTime: string
  range: string
  components: string
  isRitual: boolean
  concentration: boolean
  duration: string
  description: RawSpell['entries']
  higherLevel?: RawSpell['entriesHigherLevel']
  rawSpell: RawSpell
}

const SCHOOL_LABEL: Record<string, string> = {
  A: 'Abjuration', C: 'Conjuration', D: 'Divination',
  E: 'Enchantment', I: 'Illusion', N: 'Necromancy',
  T: 'Transmutation', V: 'Evocation',
}

function parseCastingTime(spell: RawSpell): string {
  if (!spell.time?.length) return '—'
  const t = spell.time[0]
  return `${t.number} ${t.unit}${t.condition ? ` (${t.condition})` : ''}`
}

function parseRange(spell: RawSpell): string {
  const r = spell.range
  if (r.type === 'special') return 'Special'
  if (r.type === 'point') {
    if (!r.distance) return 'Touch'
    if (r.distance.type === 'self') return 'Self'
    if (r.distance.type === 'touch') return 'Touch'
    return `${r.distance.amount} ${r.distance.type}`
  }
  if (r.type === 'radius' && r.distance) {
    return `Self (${r.distance.amount}-ft. radius)`
  }
  return r.type
}

function parseComponents(spell: RawSpell): string {
  const c = spell.components
  const parts: string[] = []
  if (c.v) parts.push('V')
  if (c.s) parts.push('S')
  if (c.m) {
    const mText = typeof c.m === 'string' ? c.m : c.m.text
    parts.push(`M (${mText})`)
  }
  return parts.join(', ')
}

function parseDuration(spell: RawSpell): string {
  if (!spell.duration?.length) return '—'
  const d = spell.duration[0]
  if (d.type === 'instant') return 'Instantaneous'
  if (d.type === 'permanent') return 'Until dispelled'
  if (d.type === 'special') return 'Special'
  if (d.duration) {
    const prefix = d.concentration ? 'Concentration, up to ' : ''
    return `${prefix}${d.duration.amount} ${d.duration.type}`
  }
  return d.type
}

export function parseSpellFile(raw: RawSpellFile): ParsedSpell[] {
  return raw.spell.map(s => ({
    name: s.name,
    source: s.source,
    level: s.level,
    school: s.school,
    schoolLabel: SCHOOL_LABEL[s.school] ?? s.school,
    castingTime: parseCastingTime(s),
    range: parseRange(s),
    components: parseComponents(s),
    isRitual: s.meta?.ritual ?? false,
    concentration: s.duration?.some(d => d.concentration) ?? false,
    duration: parseDuration(s),
    description: s.entries,
    higherLevel: s.entriesHigherLevel,
    rawSpell: s,
  }))
}

export function getSpellsForClass(
  className: string,
  allSpells: ParsedSpell[],
  maxSpellLevel: number,
): ParsedSpell[] {
  const classSpellNames = CLASS_SPELL_LISTS[className]
  if (!classSpellNames) return []
  const nameSet = new Set(classSpellNames.map(n => n.toLowerCase()))
  return allSpells.filter(
    s => nameSet.has(s.name.toLowerCase()) && s.level <= maxSpellLevel
  )
}

export { SCHOOL_LABEL }

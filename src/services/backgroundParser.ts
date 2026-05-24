import type { RawBackgroundFile, RawBackground, StartingEquipmentData } from '../types/5etools'
import { BACKGROUND_NAME_ZH } from '../data/zhTranslations'

export interface ParsedBackground {
  name: string
  source: string
  skillProficiencies: string[]
  toolProficiencies: string[]
  languages: string
  abilityDescription: string
  featNames: string[]
  equipmentOptions: StartingEquipmentData[]
  entries: RawBackground['entries']
  rawBackground: RawBackground
}

function parseSkillProficiencies(raw: RawBackground): string[] {
  if (!raw.skillProficiencies) return []
  const result: string[] = []
  for (const obj of raw.skillProficiencies) {
    for (const [key, val] of Object.entries(obj)) {
      if (val === true) result.push(SKILL_LABEL[key] ?? key)
    }
  }
  return result
}

function parseToolProficiencies(raw: RawBackground): string[] {
  if (!raw.toolProficiencies) return []
  const result: string[] = []
  for (const obj of raw.toolProficiencies) {
    for (const [key, val] of Object.entries(obj)) {
      if (val === true) result.push(key)
    }
  }
  return result
}

function parseLanguages(raw: RawBackground): string {
  if (!raw.languageProficiencies) return ''
  const parts: string[] = []
  for (const obj of raw.languageProficiencies) {
    const count = obj['anyStandard'] ?? obj['any']
    if (typeof count === 'number') parts.push(`任意 ${count} 種語言`)
    for (const [key, val] of Object.entries(obj)) {
      if (val === true && key !== 'anyStandard' && key !== 'any') {
        parts.push(key)
      }
    }
  }
  return parts.join('、')
}

function parseAbilityDescription(raw: RawBackground): string {
  if (!raw.ability?.length) return ''
  // XPHB 背景格式：weighted choose
  const first = raw.ability[0]
  if ('choose' in first && first.choose?.weighted) {
    const { from, weights } = first.choose.weighted
    const names = from.map(a => ABILITY_LABEL[a] ?? a).join('、')
    const vals = [...new Set(weights)].sort((a, b) => b - a).join('/+')
    return `從 ${names} 中分配 +${vals}`
  }
  return ''
}

function parseFeatNames(raw: RawBackground): string[] {
  if (!raw.feats?.length) return []
  return raw.feats.flatMap(obj => Object.keys(obj).map(k => k.split('|')[0]))
}

export function parseBackgroundFile(raw: RawBackgroundFile): ParsedBackground[] {
  const xphbBgs = raw.background.filter(b => b.source === 'XPHB')

  return xphbBgs.map(bg => ({
    name: bg.name,
    source: bg.source,
    skillProficiencies: parseSkillProficiencies(bg),
    toolProficiencies: parseToolProficiencies(bg),
    languages: parseLanguages(bg),
    abilityDescription: parseAbilityDescription(bg),
    featNames: parseFeatNames(bg),
    equipmentOptions: bg.startingEquipment ?? [],
    entries: bg.entries,
    rawBackground: bg,
  }))
}

const SKILL_LABEL: Record<string, string> = {
  acrobatics: '體操', animalHandling: '馴獸',
  arcana: '奧秘', athletics: '運動', deception: '欺瞞',
  history: '歷史', insight: '洞悉', intimidation: '威嚇',
  investigation: '調查', medicine: '醫療', nature: '自然',
  perception: '察覺', performance: '表演', persuasion: '遊說',
  religion: '宗教', sleightOfHand: '巧手', stealth: '隱匿',
  survival: '求生',
}

const ABILITY_LABEL: Record<string, string> = {
  str: '力量', dex: '敏捷', con: '體質',
  int: '智力', wis: '感知', cha: '魅力',
}

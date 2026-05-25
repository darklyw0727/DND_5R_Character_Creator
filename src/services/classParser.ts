import type {
  RawClassFile, RawClass, RawClassFeature, RawSubclass,
  RawSubclassFeature, ClassFeatureEntry,
} from '../types/5etools'

// 解析後的職業摘要（用於 Step 1 展示）
export interface ClassSummary {
  name: string
  source: string
  hd: number
  primaryAbilities: string[]
  spellcastingAbility?: string
  casterProgression?: string
  cantripProgression?: number[]
  spellsKnownProgression?: number[]
  spellsKnownProgressionFixed?: number[]
  preparedSpellsProgression?: number[]
  startingProficiencies: RawClass['startingProficiencies']
  startingEquipment?: RawClass['startingEquipment']
  multiclassing?: RawClass['multiclassing']
  classTableGroups?: RawClass['classTableGroups']
  featProgression?: RawClass['featProgression']
  // 按等級分組的特性名稱（1-20）
  featuresByLevel: Map<number, string[]>
  subclassTitle: string
  rawClass: RawClass
}

export interface ParsedClassFile {
  summary: ClassSummary
  overview?: string[]
  features: Map<string, RawClassFeature>         // key: "name|className|XPHB|level" (lowercase)
  subclasses: RawSubclass[]                       // XPHB 子職業
  subclassFeatures: Map<string, RawSubclassFeature> // key: "name|className|XPHB|shortName|XPHB|level" (lowercase)
}

const ABILITY_LABEL: Record<string, string> = {
  str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA',
}

function parsePrimaryAbilities(raw: RawClass): string[] {
  if (!raw.primaryAbility) return []
  return raw.primaryAbility.flatMap(obj =>
    Object.entries(obj)
      .filter(([, v]) => v === true)
      .map(([k]) => ABILITY_LABEL[k] ?? k.toUpperCase())
  )
}

function parseFeaturesByLevel(raw: RawClass, featureMap: Map<string, RawClassFeature>): Map<number, string[]> {
  const result = new Map<number, string[]>()
  for (const entry of raw.classFeatures) {
    let ref: string
    let isSubclass = false
    if (typeof entry === 'string') {
      ref = entry
    } else {
      ref = entry.classFeature
      isSubclass = entry.gainSubclassFeature ?? false
    }
    const parts = ref.split('|')
    const name = parts[0]
    const level = parseInt(parts[3] ?? parts[parts.length - 1], 10)
    if (isNaN(level)) continue

    const displayName = isSubclass ? `${name} ★` : name
    if (!result.has(level)) result.set(level, [])
    result.get(level)!.push(displayName)

    // 同步確認 feature 存在於 map（僅供 UI 顯示，不影響解析）
    void featureMap
  }
  return result
}

export function parseClassFile(raw: RawClassFile): ParsedClassFile | null {
  // 找 XPHB 版本職業
  const xphbClass = raw.class.find(c => c.source === 'XPHB' && c.edition === 'one')
  if (!xphbClass) return null

  // 建立 classFeature 索引（僅 XPHB）
  const features = new Map<string, RawClassFeature>()
  for (const f of raw.classFeature ?? []) {
    if (f.classSource === 'XPHB') {
      const key = `${f.name}|${f.className}|${f.classSource}|${f.level}`.toLowerCase()
      features.set(key, f)
    }
  }

  // 建立 subclassFeature 索引（XPHB）
  const subclassFeatures = new Map<string, RawSubclassFeature>()
  for (const f of raw.subclassFeature ?? []) {
    if (f.classSource === 'XPHB' && f.subclassSource === 'XPHB') {
      const key = `${f.name}|${f.className}|${f.classSource}|${f.subclassShortName}|${f.subclassSource}|${f.level}`.toLowerCase()
      subclassFeatures.set(key, f)
    }
  }

  // 純 XPHB 子職業（非 _copy）
  const subclasses = (raw.subclass ?? []).filter(
    sc => sc.source === 'XPHB' && sc.classSource === 'XPHB' && !sc._copy
  )

  const featuresByLevel = parseFeaturesByLevel(xphbClass, features)

  const summary: ClassSummary = {
    name: xphbClass.name,
    source: xphbClass.source,
    hd: xphbClass.hd.faces,
    primaryAbilities: parsePrimaryAbilities(xphbClass),
    spellcastingAbility: xphbClass.spellcastingAbility,
    casterProgression: xphbClass.casterProgression,
    cantripProgression: xphbClass.cantripProgression,
    spellsKnownProgression: xphbClass.spellsKnownProgression,
    spellsKnownProgressionFixed: xphbClass.spellsKnownProgressionFixed,
    preparedSpellsProgression: xphbClass.preparedSpellsProgression,
    startingProficiencies: xphbClass.startingProficiencies,
    startingEquipment: xphbClass.startingEquipment,
    multiclassing: xphbClass.multiclassing,
    classTableGroups: xphbClass.classTableGroups,
    featProgression: xphbClass.featProgression,
    featuresByLevel,
    subclassTitle: xphbClass.subclassTitle ?? 'Subclass',
    rawClass: xphbClass,
  }

  return { summary, features, subclasses, subclassFeatures }
}

export function lookupClassFeature(
  features: Map<string, RawClassFeature>,
  ref: ClassFeatureEntry,
): RawClassFeature | undefined {
  const refStr = typeof ref === 'string' ? ref : ref.classFeature
  return features.get(refStr.toLowerCase())
}

export function lookupSubclassFeature(
  features: Map<string, RawSubclassFeature>,
  ref: string,
): RawSubclassFeature | undefined {
  return features.get(ref.toLowerCase())
}

// 從 classFeatures 陣列取出指定等級（含以下）的所有特性參照
export function getFeaturesUpToLevel(raw: RawClass, level: number): ClassFeatureEntry[] {
  return raw.classFeatures.filter(entry => {
    const refStr = typeof entry === 'string' ? entry : entry.classFeature
    const parts = refStr.split('|')
    const lvl = parseInt(parts[3] ?? parts[parts.length - 1], 10)
    return !isNaN(lvl) && lvl <= level
  })
}

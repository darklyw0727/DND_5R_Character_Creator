// 5etools JSON 原始格式型別定義

// ─── Entry 物件樹 ───────────────────────────────────────────────
export type Entry =
  | string
  | EntryEntries
  | EntryList
  | EntryTable
  | EntryOptions
  | EntryItem
  | EntryInset
  | EntryQuote
  | EntryAbilityDc
  | EntryAbilityAttackMod
  | EntryRefClassFeature
  | EntryRefSubclassFeature

export interface EntryEntries {
  type: 'entries'
  name?: string
  entries: Entry[]
}

export interface EntryList {
  type: 'list'
  style?: string
  items: (string | EntryItem | Entry)[]
}

export interface EntryTable {
  type: 'table'
  caption?: string
  colLabels: string[]
  colStyles?: string[]
  rows: (string | number | { type: string; value: number } | null)[][]
}

export interface EntryOptions {
  type: 'options'
  count?: number
  entries: Entry[]
}

export interface EntryItem {
  type: 'item'
  name: string
  entry?: string
  entries?: Entry[]
}

export interface EntryInset {
  type: 'inset'
  name?: string
  entries: Entry[]
}

export interface EntryQuote {
  type: 'quote'
  entries: string[]
  by?: string
}

export interface EntryAbilityDc {
  type: 'abilityDc'
  name: string
  attributes: string[]
}

export interface EntryAbilityAttackMod {
  type: 'abilityAttackMod'
  name: string
  attributes: string[]
}

export interface EntryRefClassFeature {
  type: 'refClassFeature'
  classFeature: string
}

export interface EntryRefSubclassFeature {
  type: 'refSubclassFeature'
  subclassFeature: string
}

// ─── 職業相關 ────────────────────────────────────────────────────
export interface ClassFeatureRef {
  classFeature: string
  gainSubclassFeature?: boolean
  isClassFeatureVariant?: boolean
}

export type ClassFeatureEntry = string | ClassFeatureRef

export interface ClassTableGroup {
  title?: string
  colLabels: string[]
  rows: (string | { type: string; value: number })[][]
}

export interface EquipmentItem {
  item?: string
  quantity?: number
  displayName?: string
  value?: number
  equipmentType?: string
  special?: string
}

export interface StartingEquipmentData {
  A?: (string | EquipmentItem)[]
  B?: (string | EquipmentItem)[]
  a?: (string | EquipmentItem)[]
  b?: (string | EquipmentItem)[]
  _?: (string | EquipmentItem)[]
}

export interface StartingEquipment {
  additionalFromBackground?: boolean
  default?: string[]
  defaultData?: StartingEquipmentData[]
  entries?: string[]
}

export interface RawClass {
  name: string
  source: string
  edition?: 'one' | 'classic'
  basicRules2024?: boolean
  srd52?: boolean
  hd: { number: number; faces: number }
  proficiency: string[]
  primaryAbility?: Record<string, boolean>[]
  spellcastingAbility?: string
  casterProgression?: 'full' | '1/2' | '1/3' | 'pact' | 'artificer'
  preparedSpellsProgression?: number[]
  cantripProgression?: number[]
  spellsKnownProgression?: number[]
  spellsKnownProgressionFixed?: number[]
  spellsKnownProgressionFixedAllowLowerLevel?: boolean
  startingProficiencies: {
    armor?: string[]
    weapons?: string[]
    tools?: string[]
    skills?: { choose: { from: string[]; count: number } }[]
  }
  startingEquipment?: StartingEquipment
  multiclassing?: {
    requirements?: Record<string, number>
    proficienciesGained?: { armor?: string[]; weapons?: string[]; tools?: string[] }
  }
  classTableGroups?: ClassTableGroup[]
  classFeatures: ClassFeatureEntry[]
  subclassTitle?: string
  featProgression?: { name: string; category: string[]; progression: Record<string, number> }[]
  additionalSpells?: unknown[]
  hasFluff?: boolean
  hasFluffImages?: boolean
}

export interface RawClassFeature {
  name: string
  source: string
  className: string
  classSource: string
  level: number
  entries: Entry[]
  isClassFeatureVariant?: boolean
  basicRules2024?: boolean
  srd52?: boolean
  header?: number
}

export interface RawSubclass {
  name: string
  shortName: string
  source: string
  className: string
  classSource: string
  page?: number
  edition?: 'one' | 'classic'
  subclassFeatures: string[]
  additionalSpells?: unknown[]
  spellcastingAbility?: string
  _copy?: {
    name: string
    source: string
    shortName: string
    className: string
    classSource: string
    _preserve?: Record<string, boolean>
  }
  hasFluffImages?: boolean
}

export interface RawSubclassFeature {
  name: string
  source: string
  className: string
  classSource: string
  subclassShortName: string
  subclassSource: string
  level: number
  header?: number
  entries: Entry[]
  basicRules2024?: boolean
}

export interface RawClassFile {
  _meta?: { internalCopies?: string[] }
  class: RawClass[]
  subclass: RawSubclass[]
  classFeature: RawClassFeature[]
  subclassFeature: RawSubclassFeature[]
}

// ─── 種族相關 ────────────────────────────────────────────────────
export interface RaceVersionModOp {
  mode: string
  replace?: string
  names?: string | string[]
  items?: Entry | Entry[]
}

export interface RaceVersionMod {
  entries?: RaceVersionModOp | RaceVersionModOp[]
}

export interface RaceVersionAbstract {
  name: string
  source?: string
  _mod?: RaceVersionMod
}

export interface RaceVersionImplementation {
  _variables: Record<string, string>
  resist?: (string | { choose: { from: string[] } })[]
  darkvision?: number
  speed?: number | { walk?: number; fly?: number }
  additionalSpells?: unknown[]
}

export interface RaceVersion {
  name?: string
  source?: string
  _mod?: RaceVersionMod
  darkvision?: number
  speed?: number | { walk?: number; fly?: number }
  additionalSpells?: unknown[]
  entries?: Entry[]
  traitTags?: string[]
  // Template form (e.g. Dragonborn XPHB)
  _abstract?: RaceVersionAbstract
  _implementations?: RaceVersionImplementation[]
}

export interface RawRace {
  name: string
  source: string
  edition?: 'one' | 'classic'
  basicRules2024?: boolean
  srd52?: boolean
  creatureTypes?: string[]
  size: string[]
  speed: number | { walk?: number; fly?: number; swim?: number; climb?: number }
  darkvision?: number
  ability?: Record<string, number | { choose: unknown }>[]
  skillProficiencies?: Record<string, boolean | { choose: unknown }>[]
  languageProficiencies?: Record<string, boolean | number>[]
  toolProficiencies?: Record<string, boolean>[]
  resist?: string[]
  immune?: string[]
  traitTags?: string[]
  additionalSpells?: unknown[]
  entries: Entry[]
  hasFluff?: boolean
  hasFluffImages?: boolean
  _versions?: RaceVersion[]
  _copy?: unknown
}

export interface RawRaceFile {
  _meta?: { internalCopies?: string[] }
  race: RawRace[]
  subrace?: RawRace[]
}

// ─── 背景相關 ────────────────────────────────────────────────────
export interface RawBackground {
  name: string
  source: string
  edition?: 'one' | 'classic'
  basicRules2024?: boolean
  srd52?: boolean
  ability?: { choose: { weighted: { from: string[]; weights: number[] } } }[]
  feats?: Record<string, boolean>[]
  skillProficiencies?: Record<string, boolean | { choose: unknown }>[]
  languageProficiencies?: Record<string, boolean | number>[]
  toolProficiencies?: Record<string, boolean>[]
  startingEquipment?: StartingEquipmentData[]
  entries: Entry[]
  hasFluff?: boolean
}

export interface RawBackgroundFile {
  background: RawBackground[]
}

// ─── 法術相關 ────────────────────────────────────────────────────
export interface RawSpell {
  name: string
  source: string
  page?: number
  level: number
  school: string
  time: { number: number; unit: string; condition?: string }[]
  range: {
    type: string
    distance?: { type: string; amount?: number }
  }
  components: {
    v?: boolean
    s?: boolean
    m?: string | { text: string; cost?: number; consume?: boolean }
  }
  duration: {
    type: string
    duration?: { type: string; amount: number }
    concentration?: boolean
  }[]
  meta?: { ritual?: boolean; technomagic?: boolean }
  entries: Entry[]
  entriesHigherLevel?: Entry[]
  classes?: { fromClassList?: { name: string; source: string }[] }
  damageInflict?: string[]
  healingInflict?: string[]
  savingThrow?: string[]
  conditionInflict?: string[]
  areaTags?: string[]
  miscTags?: string[]
  scalingLevelDice?: unknown
  basicRules2024?: boolean
  srd52?: boolean
}

export interface RawSpellFile {
  spell: RawSpell[]
}

// ─── 專長相關 ────────────────────────────────────────────────────
export interface RawFeat {
  name: string
  source: string
  category?: string
  prerequisite?: unknown[]
  ability?: Record<string, number | { choose: unknown }>[]
  entries: Entry[]
  basicRules2024?: boolean
  srd52?: boolean
}

export interface RawFeatFile {
  feat: RawFeat[]
}

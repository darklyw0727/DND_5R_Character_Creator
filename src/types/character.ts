// 角色狀態型別定義

export type AbilityKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha'

export interface AbilityScores {
  str: number
  dex: number
  con: number
  int: number
  wis: number
  cha: number
}

export interface ClassChoice {
  className: string
  level: number
  subclassShortName?: string
  subclassSource?: string
}

export type AbilityScoreMethod = 'standard_array' | 'point_buy' | 'manual'

export interface ASIChoice {
  classIndex: number
  featureLevel: number
  choice: 'asi' | 'feat'
  // ASI 選項
  increments?: Partial<AbilityScores>
  // Feat 選項
  featName?: string
  featSource?: string
}

export interface FeatureChoice {
  classIndex: number
  featureName: string
  level: number
  selectedOptions: string[]
}

export interface EquipmentChoice {
  source: 'class' | 'background'
  classIndex?: number
  set: 'A' | 'B' | '_'
}

export interface SpellSelection {
  classIndex: number
  spellName: string
  spellSource: string
  spellLevel: number
}

export interface CharacterState {
  // Step 1
  classes: ClassChoice[]

  // Step 2
  raceName?: string
  raceSource?: string
  raceVariant?: string
  raceSize?: string

  // Step 3
  backgroundName?: string
  backgroundSource?: string
  backgroundEquipmentSet?: 'A' | 'B'

  // Step 4
  abilityScoreMethod?: AbilityScoreMethod
  baseAbilityScores: AbilityScores
  backgroundAbilityChoices?: Partial<AbilityScores>
  standardArrayAssignment?: Partial<Record<AbilityKey, number>>

  // Step 5
  asiChoices: ASIChoice[]
  featureChoices: FeatureChoice[]
  classEquipmentSets: Record<number, 'A' | 'B'>

  // Step 6
  spellSelections: SpellSelection[]

  // Step 7
  characterName: string

  // Navigation
  currentStep: number
}

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  CharacterState, ClassChoice, AbilityScores, AbilityScoreMethod,
  AbilityKey, ASIChoice, FeatureChoice, SpellSelection,
} from '../types/character'
import { ABILITY_KEYS } from '../data/abilityScoreData'

const defaultAbilityScores: AbilityScores = {
  str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8,
}

const initialState: CharacterState = {
  classes: [],
  raceName: undefined,
  raceSource: undefined,
  raceVariant: undefined,
  backgroundName: undefined,
  backgroundSource: undefined,
  backgroundEquipmentSet: undefined,
  abilityScoreMethod: undefined,
  baseAbilityScores: { ...defaultAbilityScores },
  backgroundAbilityChoices: undefined,
  standardArrayAssignment: undefined,
  asiChoices: [],
  featureChoices: [],
  classEquipmentSets: {},
  spellSelections: [],
  characterName: '',
  currentStep: 1,
}

interface CharacterActions {
  // Step 1
  addClass: (className: string) => void
  removeClass: (index: number) => void
  setClassLevel: (index: number, level: number) => void
  setSubclass: (index: number, shortName: string, source: string) => void

  // Step 2
  setRace: (name: string, source: string, variant?: string) => void

  // Step 3
  setBackground: (name: string, source: string) => void
  setBackgroundEquipmentSet: (set: 'A' | 'B') => void

  // Step 4
  setAbilityScoreMethod: (method: AbilityScoreMethod) => void
  setAbilityScore: (key: AbilityKey, value: number) => void
  setStandardArrayAssignment: (assignment: Partial<Record<AbilityKey, number>>) => void
  setBackgroundAbilityChoices: (choices: Partial<AbilityScores>) => void

  // Step 5
  setASIChoice: (choice: ASIChoice) => void
  setFeatureChoice: (choice: FeatureChoice) => void
  setClassEquipmentSet: (classIndex: number, set: 'A' | 'B') => void

  // Step 6
  toggleSpell: (spell: SpellSelection) => void
  clearSpellsForClass: (classIndex: number) => void

  // Step 7
  setCharacterName: (name: string) => void

  // Navigation
  setStep: (step: number) => void
  nextStep: () => void
  prevStep: () => void

  // Reset
  reset: () => void

  // Computed selectors
  getTotalLevel: () => number
  getIsCaster: () => boolean
}

type Store = CharacterState & CharacterActions

export const useCharacterStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ── Step 1 ──────────────────────────────────────────
      addClass: (className) => set(s => ({
        classes: [...s.classes, { className, level: 1 }],
      })),

      removeClass: (index) => set(s => {
        const classes = s.classes.filter((_, i) => i !== index)
        // clean up equipment sets
        const classEquipmentSets: Record<number, 'A' | 'B'> = {}
        Object.entries(s.classEquipmentSets).forEach(([k, v]) => {
          const ki = parseInt(k)
          if (ki < index) classEquipmentSets[ki] = v
          else if (ki > index) classEquipmentSets[ki - 1] = v
        })
        const spellSelections = s.spellSelections
          .filter(sp => sp.classIndex !== index)
          .map(sp => sp.classIndex > index ? { ...sp, classIndex: sp.classIndex - 1 } : sp)
        return { classes, classEquipmentSets, spellSelections }
      }),

      setClassLevel: (index, level) => set(s => ({
        classes: s.classes.map((c, i) => i === index ? { ...c, level } : c),
      })),

      setSubclass: (index, shortName, source) => set(s => ({
        classes: s.classes.map((c, i) =>
          i === index ? { ...c, subclassShortName: shortName, subclassSource: source } : c
        ),
      })),

      // ── Step 2 ──────────────────────────────────────────
      setRace: (name, source, variant) => set({
        raceName: name, raceSource: source, raceVariant: variant,
      }),

      // ── Step 3 ──────────────────────────────────────────
      setBackground: (name, source) => set({
        backgroundName: name, backgroundSource: source,
      }),

      setBackgroundEquipmentSet: (set_) => set({ backgroundEquipmentSet: set_ }),

      // ── Step 4 ──────────────────────────────────────────
      setAbilityScoreMethod: (method) => set({ abilityScoreMethod: method }),

      setAbilityScore: (key, value) => set(s => ({
        baseAbilityScores: { ...s.baseAbilityScores, [key]: value },
      })),

      setStandardArrayAssignment: (assignment) => {
        // Rebuild baseAbilityScores from standard array assignment
        const scores = { ...defaultAbilityScores }
        for (const [key, val] of Object.entries(assignment)) {
          if (val !== undefined) scores[key as AbilityKey] = val
        }
        set({ standardArrayAssignment: assignment, baseAbilityScores: scores })
      },

      setBackgroundAbilityChoices: (choices) => set({ backgroundAbilityChoices: choices }),

      // ── Step 5 ──────────────────────────────────────────
      setASIChoice: (choice) => set(s => {
        const existing = s.asiChoices.findIndex(
          a => a.classIndex === choice.classIndex && a.featureLevel === choice.featureLevel
        )
        const asiChoices = [...s.asiChoices]
        if (existing >= 0) asiChoices[existing] = choice
        else asiChoices.push(choice)
        return { asiChoices }
      }),

      setFeatureChoice: (choice) => set(s => {
        const existing = s.featureChoices.findIndex(
          f => f.classIndex === choice.classIndex &&
               f.featureName === choice.featureName &&
               f.level === choice.level
        )
        const featureChoices = [...s.featureChoices]
        if (existing >= 0) featureChoices[existing] = choice
        else featureChoices.push(choice)
        return { featureChoices }
      }),

      setClassEquipmentSet: (classIndex, set_) => set(s => ({
        classEquipmentSets: { ...s.classEquipmentSets, [classIndex]: set_ },
      })),

      // ── Step 6 ──────────────────────────────────────────
      toggleSpell: (spell) => set(s => {
        const idx = s.spellSelections.findIndex(
          sp => sp.classIndex === spell.classIndex && sp.spellName === spell.spellName
        )
        if (idx >= 0) {
          return { spellSelections: s.spellSelections.filter((_, i) => i !== idx) }
        }
        return { spellSelections: [...s.spellSelections, spell] }
      }),

      clearSpellsForClass: (classIndex) => set(s => ({
        spellSelections: s.spellSelections.filter(sp => sp.classIndex !== classIndex),
      })),

      // ── Step 7 ──────────────────────────────────────────
      setCharacterName: (name) => set({ characterName: name }),

      // ── Navigation ──────────────────────────────────────
      setStep: (step) => set({ currentStep: step }),
      nextStep: () => set(s => ({ currentStep: Math.min(s.currentStep + 1, 7) })),
      prevStep: () => set(s => ({ currentStep: Math.max(s.currentStep - 1, 1) })),

      // ── Reset ───────────────────────────────────────────
      reset: () => set({ ...initialState }),

      // ── Computed ────────────────────────────────────────
      getTotalLevel: () => get().classes.reduce((sum, c) => sum + c.level, 0),

      getIsCaster: () => {
        const CASTERS = new Set(['Bard','Cleric','Druid','Paladin','Ranger','Sorcerer','Warlock','Wizard'])
        return get().classes.some(c => CASTERS.has(c.className))
      },
    }),
    {
      name: 'dnd5r-character',
      version: 1,
    }
  )
)

// ── 工具 selector（純函數，在元件中使用） ──────────────────
export function selectFinalAbilityScores(state: CharacterState): AbilityScores {
  const base = { ...state.baseAbilityScores }
  const bg = state.backgroundAbilityChoices ?? {}
  const result = { ...base }
  for (const key of ABILITY_KEYS) {
    result[key] = (result[key] ?? 8) + (bg[key] ?? 0)
  }
  return result
}

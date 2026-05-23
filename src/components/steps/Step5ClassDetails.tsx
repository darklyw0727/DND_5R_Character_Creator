import { useState } from 'react'
import { useCharacterStore } from '../../store/characterStore'
import { useClassData } from '../../hooks/useClassData'
import { CLASS_NAME_ZH, CLASS_COLOR } from '../../data/classConstants'
import { ABILITY_LABELS, ABILITY_KEYS } from '../../data/abilityScoreData'
import EntryRenderer from '../shared/EntryRenderer'
import { getFeaturesUpToLevel } from '../../services/classParser'
import { resolveText } from '../../services/entryResolver'
import type { RawClassFeature, RawSubclassFeature } from '../../types/5etools'
import type { AbilityKey } from '../../types/character'

export default function Step5ClassDetails() {
  const store = useCharacterStore()
  const { classes, setSubclass, setASIChoice, setClassEquipmentSet, setBackgroundAbilityChoices } = store
  const { data: classMap, loading, error } = useClassData()
  const [activeClassTab, setActiveClassTab] = useState(0)

  if (classes.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        請先在步驟一選擇職業。
      </div>
    )
  }

  if (loading) return <Loading />
  if (error) return <ErrorState message={error} />

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-dnd-gold mb-1 font-serif">
          步驟五：職業細節
        </h2>
        <p className="text-gray-400 text-sm">
          配置你的職業特性、子職業選擇、能力值提升，以及起始裝備。
        </p>
      </div>

      {/* 背景能力值加成配置 */}
      <BackgroundAbilityConfig />

      {/* 多職業 tab */}
      {classes.length > 1 && (
        <div className="flex gap-2 mb-6 border-b border-dnd-border pb-2">
          {classes.map((cls, i) => {
            const color = CLASS_COLOR[cls.className] ?? '#888'
            return (
              <button
                key={i}
                onClick={() => setActiveClassTab(i)}
                className={`px-4 py-2 rounded-t text-sm font-semibold transition-colors ${
                  activeClassTab === i
                    ? 'text-dnd-darker'
                    : 'bg-dnd-border text-gray-400 hover:text-gray-200'
                }`}
                style={activeClassTab === i ? { backgroundColor: color } : undefined}
              >
                {CLASS_NAME_ZH[cls.className] ?? cls.className} Lv{cls.level}
              </button>
            )
          })}
        </div>
      )}

      {/* 當前職業詳情 */}
      {classes.map((cls, i) => {
        if (classes.length > 1 && i !== activeClassTab) return null
        const parsed = classMap.get(cls.className)
        if (!parsed) return <div key={i} className="text-gray-500">找不到 {cls.className} 資料</div>

        const featuresInRange = getFeaturesUpToLevel(parsed.summary.rawClass, cls.level)
        const color = CLASS_COLOR[cls.className] ?? '#888'

        return (
          <div key={i}>
            {/* 職業初始裝備 */}
            {parsed.summary.startingEquipment && (
              <StartingEquipmentSection
                className={cls.className}
                equipment={parsed.summary.startingEquipment}
                selected={store.classEquipmentSets[i]}
                onSelect={set => setClassEquipmentSet(i, set)}
              />
            )}

            {/* 特性列表 */}
            <div className="space-y-4">
              {featuresInRange.map((ref, fi) => {
                const refStr = typeof ref === 'string' ? ref : ref.classFeature
                const isSubclassMarker = typeof ref !== 'string' && ref.gainSubclassFeature
                const parts = refStr.split('|')
                const featName = parts[0]
                const featLevel = parseInt(parts[3] ?? parts[parts.length - 1], 10)
                const featureKey = refStr.toLowerCase()
                const featureData = parsed.features.get(featureKey)

                // 子職業選擇點
                if (isSubclassMarker) {
                  return (
                    <SubclassSelector
                      key={fi}
                      classIndex={i}
                      className={cls.className}
                      classLevel={cls.level}
                      subclasses={parsed.subclasses}
                      selectedShortName={cls.subclassShortName}
                      subclassFeatures={parsed.subclassFeatures}
                      color={color}
                      onSelect={(shortName, source) => setSubclass(i, shortName, source)}
                    />
                  )
                }

                // 能力值提升
                if (featName === 'Ability Score Improvement' || featName === 'Epic Boon') {
                  return (
                    <ASIFeature
                      key={fi}
                      classIndex={i}
                      featureLevel={featLevel}
                      isEpicBoon={featName === 'Epic Boon'}
                      current={store.asiChoices.find(a => a.classIndex === i && a.featureLevel === featLevel)}
                      onSet={choice => setASIChoice({ classIndex: i, featureLevel: featLevel, ...choice })}
                    />
                  )
                }

                // 一般特性
                if (!featureData) {
                  return (
                    <FeatureCard key={fi} name={featName} level={featLevel} color={color}>
                      <p className="text-gray-500 text-sm italic">（描述資料待補充）</p>
                    </FeatureCard>
                  )
                }

                return (
                  <FeatureCard key={fi} name={featName} level={featLevel} color={color}>
                    <EntryRenderer entries={featureData.entries} />
                  </FeatureCard>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// 職業初始裝備
function StartingEquipmentSection({
  className, equipment, selected, onSelect,
}: {
  className: string
  equipment: NonNullable<ReturnType<typeof import('../../services/classParser').parseClassFile>>['summary']['startingEquipment']
  selected?: 'A' | 'B'
  onSelect: (set: 'A' | 'B') => void
}) {
  if (!equipment?.defaultData?.length && !equipment?.entries?.length) return null
  const options = equipment.defaultData ?? []

  return (
    <div className="card mb-6">
      <h3 className="section-title">
        {CLASS_NAME_ZH[className] ?? className} 起始裝備
      </h3>
      {equipment.entries?.map((entry, i) => (
        <p key={i} className="text-sm text-gray-300 mb-3">{resolveText(entry)}</p>
      ))}
      {options.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {(['A', 'B'] as const).filter(set => options[0]?.[set]).map(set => {
            const items = options[0][set] ?? []
            return (
              <button
                key={set}
                onClick={() => onSelect(set)}
                className={`p-3 rounded border text-sm text-left transition-colors
                  ${selected === set
                    ? 'border-dnd-gold bg-dnd-gold/10 text-dnd-gold'
                    : 'border-dnd-border hover:border-gray-500 text-gray-300'
                  }`}
              >
                <div className="font-bold mb-1">選項 {set}</div>
                <div className="text-xs">
                  {items.map(item => {
                    if (typeof item === 'string') return item
                    if (typeof item === 'object') {
                      if ('item' in item && item.item) return `${(item.quantity ?? 1) > 1 ? item.quantity + '× ' : ''}${(item.item as string).split('|')[0]}`
                      if ('value' in item && item.value) return `${(item.value as number) / 100} GP`
                      if ('equipmentType' in item && item.equipmentType) return `[${item.equipmentType}]`
                    }
                    return ''
                  }).filter(Boolean).join('、')}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// 特性卡片
function FeatureCard({
  name, level, color, children
}: {
  name: string; level: number; color: string; children: React.ReactNode
}) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="card">
      <button
        className="w-full flex items-center gap-3 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <span
          className="text-xs font-bold px-2 py-0.5 rounded text-dnd-darker flex-shrink-0"
          style={{ backgroundColor: color }}
        >
          Lv{level}
        </span>
        <span className="font-semibold text-gray-100 flex-1">{name}</span>
        <span className="text-gray-500 text-sm">{expanded ? '▲' : '▼'}</span>
      </button>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-dnd-border">
          {children}
        </div>
      )}
    </div>
  )
}

// 子職業選擇器
function SubclassSelector({
  classIndex, className, classLevel, subclasses, selectedShortName,
  subclassFeatures, color, onSelect,
}: {
  classIndex: number
  className: string
  classLevel: number
  subclasses: import('../../services/classParser').ParsedClassFile['subclasses']
  selectedShortName?: string
  subclassFeatures: Map<string, RawSubclassFeature>
  color: string
  onSelect: (shortName: string, source: string) => void
}) {
  const [showFeatures, setShowFeatures] = useState(false)
  const selectedSC = subclasses.find(sc => sc.shortName === selectedShortName)

  return (
    <div className="card border-dnd-gold/50">
      <div className="flex items-center gap-3 mb-3">
        <span
          className="text-xs font-bold px-2 py-0.5 rounded text-dnd-darker flex-shrink-0"
          style={{ backgroundColor: color }}
        >
          Lv3 ★
        </span>
        <span className="font-semibold text-dnd-gold">選擇子職業</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {subclasses.map(sc => (
          <button
            key={sc.shortName}
            onClick={() => onSelect(sc.shortName, sc.source)}
            className={`p-2 rounded border text-sm text-left transition-colors
              ${selectedShortName === sc.shortName
                ? 'border-dnd-gold bg-dnd-gold/10 text-dnd-gold'
                : 'border-dnd-border hover:border-gray-500 text-gray-300'
              }`}
          >
            <div className="font-semibold">{sc.shortName}</div>
            <div className="text-xs text-gray-500 mt-0.5">{sc.name}</div>
          </button>
        ))}
      </div>

      {selectedSC && classLevel >= 3 && (
        <button
          className="mt-3 text-xs text-dnd-gold hover:underline"
          onClick={() => setShowFeatures(!showFeatures)}
        >
          {showFeatures ? '收起子職業特性 ▲' : '展開子職業特性 ▼'}
        </button>
      )}

      {showFeatures && selectedSC && (
        <div className="mt-3 pt-3 border-t border-dnd-border space-y-3">
          {selectedSC.subclassFeatures.map((ref, i) => {
            const parts = ref.split('|')
            const name = parts[0]
            const level = parseInt(parts[5] ?? parts[parts.length - 1], 10)
            if (isNaN(level) || level > classLevel) return null

            const featureKey = ref.toLowerCase()
            const featureData = subclassFeatures.get(featureKey)

            return (
              <div key={i} className="text-sm">
                <div className="font-semibold text-parchment-300 mb-1">
                  {name} <span className="text-xs text-gray-500">(Lv{level})</span>
                </div>
                {featureData
                  ? <EntryRenderer entries={featureData.entries} />
                  : <p className="text-gray-500 italic">（描述待補充）</p>
                }
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// 能力值提升選擇
function ASIFeature({
  classIndex, featureLevel, isEpicBoon, current, onSet,
}: {
  classIndex: number
  featureLevel: number
  isEpicBoon: boolean
  current?: { choice: 'asi' | 'feat'; increments?: Record<string, number>; featName?: string }
  onSet: (data: { choice: 'asi' | 'feat'; increments?: Record<string, number>; featName?: string }) => void
}) {
  const choice = current?.choice ?? null

  return (
    <div className="card border-dnd-gold/30">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-xs font-bold px-2 py-0.5 rounded bg-dnd-gold/20 text-dnd-gold">
          Lv{featureLevel}
        </span>
        <span className="font-semibold text-gray-100">
          {isEpicBoon ? 'Epic Boon' : 'Ability Score Improvement'}
        </span>
      </div>

      {!isEpicBoon && (
        <div className="flex gap-3 mb-3">
          <button
            onClick={() => onSet({ choice: 'asi' })}
            className={`px-3 py-1.5 rounded border text-sm transition-colors
              ${choice === 'asi'
                ? 'border-dnd-gold bg-dnd-gold/10 text-dnd-gold'
                : 'border-dnd-border hover:border-gray-500 text-gray-400'
              }`}
          >
            +2 能力值 or +1/+1
          </button>
          <button
            onClick={() => onSet({ choice: 'feat' })}
            className={`px-3 py-1.5 rounded border text-sm transition-colors
              ${choice === 'feat'
                ? 'border-dnd-gold bg-dnd-gold/10 text-dnd-gold'
                : 'border-dnd-border hover:border-gray-500 text-gray-400'
              }`}
          >
            選擇 Feat
          </button>
        </div>
      )}

      {choice === 'asi' && !isEpicBoon && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {ABILITY_KEYS.map(key => {
            const val = (current?.increments?.[key] ?? 0) as number
            const total = Object.values(current?.increments ?? {}).reduce((s: number, v) => s + (v as number), 0)
            return (
              <div key={key} className="text-center">
                <div className="text-xs text-gray-500">{ABILITY_LABELS[key].short}</div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <button
                    className="w-5 h-5 text-xs rounded bg-dnd-border hover:bg-gray-600"
                    onClick={() => {
                      const newInc = { ...current?.increments, [key]: Math.max(0, val - 1) }
                      onSet({ choice: 'asi', increments: newInc })
                    }}
                    disabled={val <= 0}
                  >−</button>
                  <span className="text-sm font-bold">{val > 0 ? `+${val}` : '0'}</span>
                  <button
                    className="w-5 h-5 text-xs rounded bg-dnd-border hover:bg-gray-600"
                    onClick={() => {
                      if (total >= 2) return
                      const newInc = { ...current?.increments, [key]: val + 1 }
                      onSet({ choice: 'asi', increments: newInc })
                    }}
                    disabled={total >= 2}
                  >+</button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {(choice === 'feat' || isEpicBoon) && (
        <div>
          <p className="text-sm text-gray-400">
            {isEpicBoon ? 'Epic Boon Feat（等級19）' : '選擇一個 General Feat'}
          </p>
          <input
            placeholder="輸入 Feat 名稱…"
            value={current?.featName ?? ''}
            onChange={e => onSet({ choice: 'feat', featName: e.target.value })}
            className="input-field mt-2 text-sm"
          />
        </div>
      )}
    </div>
  )
}

// 背景能力值加成配置（placeholder，已在 Step4 說明）
function BackgroundAbilityConfig() {
  const { backgroundName } = useCharacterStore()
  if (!backgroundName) return null
  return null
}

function Loading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-spin">⚙</div>
        <p className="text-gray-400">載入職業特性資料中…</p>
      </div>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="card border-red-800 text-center py-8">
      <p className="text-red-400">載入失敗：{message}</p>
    </div>
  )
}

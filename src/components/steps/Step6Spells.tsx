import { useState } from 'react'
import { useCharacterStore } from '../../store/characterStore'
import { useSpellData } from '../../hooks/useSpellData'
import { getSpellsForClass, SCHOOL_LABEL } from '../../services/spellParser'
import { CLASS_NAME_ZH, CASTING_CLASSES } from '../../data/classConstants'
import {
  FULL_CASTER_SLOTS, HALF_CASTER_SLOTS, WARLOCK_PACT_SLOTS,
} from '../../data/abilityScoreData'
import { SPELL_NAME_ZH } from '../../data/zhTranslations'
import EntryRenderer from '../shared/EntryRenderer'
import type { ParsedSpell } from '../../services/spellParser'

const SCHOOL_ZH: Record<string, string> = {
  Abjuration: '防護', Conjuration: '咒法', Divination: '預言',
  Enchantment: '惑控', Evocation: '塑能', Illusion: '幻術',
  Necromancy: '死靈', Transmutation: '變化',
}

export default function Step6Spells() {
  const store = useCharacterStore()
  const { classes, spellSelections, toggleSpell, getIsCaster } = store
  const { data: allSpells, loading, error } = useSpellData()

  const [activeClassIdx, setActiveClassIdx] = useState(0)
  const [filterLevel, setFilterLevel] = useState<number | null>(null)
  const [filterSchool, setFilterSchool] = useState<string>('')
  const [search, setSearch] = useState('')
  const [expandedSpell, setExpandedSpell] = useState<string | null>(null)

  const casterClasses = classes.filter(c => CASTING_CLASSES.has(c.className))

  if (!getIsCaster()) {
    return (
      <div className="text-center py-16">
        <div className="text-5xl mb-4">⚔</div>
        <h2 className="text-xl font-bold text-gray-300 mb-2">無需選擇法術</h2>
        <p className="text-gray-500">你目前選擇的職業沒有施法能力，可直接跳到下一步。</p>
      </div>
    )
  }

  if (loading) return <Loading />
  if (error) return <ErrorState message={error} />

  const activeCasterClass = casterClasses[activeClassIdx]
  const activeClassOrigIdx = classes.findIndex(c => c.className === activeCasterClass?.className)
  if (!activeCasterClass) return null

  // 計算最高可用法術等級
  const maxSlotLevel = getMaxSpellLevel(activeCasterClass.className, activeCasterClass.level)

  // 取得該職業可用法術
  const classSpells = getSpellsForClass(activeCasterClass.className, allSpells, maxSlotLevel)

  // 過濾
  const filteredSpells = classSpells.filter(s => {
    if (filterLevel !== null && s.level !== filterLevel) return false
    if (filterSchool && s.schoolLabel !== filterSchool) return false
    if (search) {
      const zhName = SPELL_NAME_ZH[s.name] ?? ''
      if (!s.name.toLowerCase().includes(search.toLowerCase()) && !zhName.includes(search)) return false
    }
    return true
  })

  // 已選法術
  const selectedNames = new Set(
    spellSelections
      .filter(sp => sp.classIndex === activeClassOrigIdx)
      .map(sp => sp.spellName)
  )

  // 法術槽位
  const slots = getSpellSlots(activeCasterClass.className, activeCasterClass.level)

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-dnd-gold mb-1 font-serif">
          步驟六：選擇法術
        </h2>
        <p className="text-gray-400 text-sm">
          為你的施法職業選擇法術。已選法術數量顯示在右側。
        </p>
      </div>

      {/* 施法職業 Tabs */}
      {casterClasses.length > 1 && (
        <div className="flex gap-2 mb-4">
          {casterClasses.map((cls, i) => (
            <button
              key={i}
              onClick={() => setActiveClassIdx(i)}
              className={`px-3 py-1.5 rounded text-sm font-semibold transition-colors
                ${activeClassIdx === i
                  ? 'bg-dnd-gold text-dnd-darker'
                  : 'bg-dnd-border text-gray-400 hover:text-gray-200'
                }`}
            >
              {CLASS_NAME_ZH[cls.className] ?? cls.className} Lv{cls.level}
            </button>
          ))}
        </div>
      )}

      {/* 法術槽位表 */}
      <SpellSlotTable
        className={activeCasterClass.className}
        level={activeCasterClass.level}
        slots={slots}
      />

      {/* 已選法術摘要 */}
      <div className="mb-4">
        <div className="flex gap-2 items-center">
          <span className="text-sm text-gray-400">已選法術：</span>
          <span className="tag-gold">{selectedNames.size} 個</span>
          {selectedNames.size > 0 && (
            <button
              className="text-xs text-gray-500 hover:text-red-400"
              onClick={() => spellSelections
                .filter(sp => sp.classIndex === activeClassOrigIdx)
                .forEach(sp => toggleSpell(sp))
              }
            >
              清除全部
            </button>
          )}
        </div>
      </div>

      {/* 過濾器 */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          placeholder="搜尋法術名稱…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field flex-1 min-w-40 text-sm"
        />
        <select
          value={filterLevel ?? ''}
          onChange={e => setFilterLevel(e.target.value === '' ? null : parseInt(e.target.value))}
          className="select-field w-32 text-sm"
        >
          <option value="">全部等級</option>
          <option value="0">戲法 (0)</option>
          {Array.from({ length: maxSlotLevel }, (_, i) => i + 1).map(l => (
            <option key={l} value={l}>{l} 環</option>
          ))}
        </select>
        <select
          value={filterSchool}
          onChange={e => setFilterSchool(e.target.value)}
          className="select-field w-36 text-sm"
        >
          <option value="">全部學派</option>
          {Object.keys(SCHOOL_ZH).map(s => (
            <option key={s} value={s}>{SCHOOL_ZH[s]}（{s}）</option>
          ))}
        </select>
      </div>

      {/* 法術列表 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[50vh] overflow-y-auto pr-1">
        {filteredSpells.length === 0 ? (
          <div className="col-span-2 text-center text-gray-500 py-8">
            找不到符合條件的法術
          </div>
        ) : (
          filteredSpells.map(spell => {
            const isSelected = selectedNames.has(spell.name)
            const isExpanded = expandedSpell === spell.name

            return (
              <div
                key={spell.name}
                className={`card transition-all ${isSelected ? 'card-selected border-dnd-gold' : ''}`}
              >
                <div className="flex items-start gap-2">
                  <button
                    onClick={() => toggleSpell({
                      classIndex: activeClassOrigIdx,
                      spellName: spell.name,
                      spellSource: spell.source,
                      spellLevel: spell.level,
                    })}
                    className={`w-5 h-5 rounded flex-shrink-0 mt-0.5 border transition-colors
                      ${isSelected
                        ? 'bg-dnd-gold border-dnd-gold text-dnd-darker flex items-center justify-center text-xs font-bold'
                        : 'border-dnd-border hover:border-dnd-gold'
                      }`}
                  >
                    {isSelected && '✓'}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-100">{SPELL_NAME_ZH[spell.name] ?? spell.name}</span>
                      <span className="tag text-xs">
                        {spell.level === 0 ? '戲法' : `${spell.level}環`}
                      </span>
                      <span className="tag text-xs">{SCHOOL_ZH[spell.schoolLabel] ?? spell.schoolLabel}</span>
                      {spell.isRitual && <span className="tag-gold text-xs">儀式</span>}
                      {spell.concentration && <span className="tag text-xs">專注</span>}
                    </div>
                    <div className="flex gap-3 mt-1 text-xs text-gray-500 flex-wrap">
                      <span>施法時間：{spell.castingTime}</span>
                      <span>範圍：{spell.range}</span>
                    </div>
                  </div>
                  <button
                    className="text-xs text-gray-500 hover:text-dnd-gold flex-shrink-0"
                    onClick={() => setExpandedSpell(isExpanded ? null : spell.name)}
                  >
                    {isExpanded ? '▲' : '▼'}
                  </button>
                </div>

                {/* 展開描述 */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-dnd-border">
                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                      <div><span className="text-gray-500">成分：</span>{spell.components}</div>
                      <div><span className="text-gray-500">持續：</span>{spell.duration}</div>
                    </div>
                    <EntryRenderer entries={spell.description} />
                    {spell.higherLevel && spell.higherLevel.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-dnd-border/50">
                        <EntryRenderer entries={spell.higherLevel} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// 法術槽位表
function SpellSlotTable({
  className, level, slots
}: {
  className: string
  level: number
  slots: number[] | [number, number]
}) {
  if (className === 'Warlock') {
    const [count, slotLevel] = slots as [number, number]
    return (
      <div className="card mb-4">
        <p className="text-xs text-gray-500 mb-1">魔契者法術槽（{level} 級）</p>
        <p className="text-sm text-gray-200">
          {count} 個 {slotLevel} 環法術槽
          <span className="text-xs text-gray-500 ml-2">（長休後恢復）</span>
        </p>
      </div>
    )
  }

  const slotArr = slots as number[]
  const hasSlots = slotArr.some(v => v > 0)
  if (!hasSlots) return null

  return (
    <div className="card mb-4 overflow-x-auto">
      <p className="text-xs text-gray-500 mb-2">{CLASS_NAME_ZH[className] ?? className} 法術槽（{level} 級）</p>
      <div className="flex gap-4">
        {slotArr.map((count, i) => {
          if (count === 0) return null
          return (
            <div key={i} className="text-center">
              <div className="text-xs text-gray-500">{i + 1} 環</div>
              <div className="text-lg font-bold text-dnd-gold">{count}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function getMaxSpellLevel(className: string, level: number): number {
  if (className === 'Warlock') {
    return WARLOCK_PACT_SLOTS[level]?.[1] ?? 1
  }
  const isHalf = className === 'Paladin' || className === 'Ranger'
  const slots = isHalf ? HALF_CASTER_SLOTS[level] : FULL_CASTER_SLOTS[level]
  if (!slots) return 0
  for (let i = slots.length - 1; i >= 0; i--) {
    if (slots[i] > 0) return i + 1
  }
  return 0
}

function getSpellSlots(className: string, level: number): number[] | [number, number] {
  if (className === 'Warlock') {
    return WARLOCK_PACT_SLOTS[level] ?? [0, 1]
  }
  const isHalf = className === 'Paladin' || className === 'Ranger'
  return (isHalf ? HALF_CASTER_SLOTS[level] : FULL_CASTER_SLOTS[level]) ?? Array(9).fill(0)
}

function Loading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-spin">⚙</div>
        <p className="text-gray-400">載入法術資料中…</p>
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

import { useState } from 'react'
import { useCharacterStore } from '../../store/characterStore'
import { useBackgroundData } from '../../hooks/useBackgroundData'
import EntryRenderer from '../shared/EntryRenderer'
import type { ParsedBackground } from '../../services/backgroundParser'
import type { StartingEquipmentData } from '../../types/5etools'

export default function Step3Background() {
  const { backgroundName, backgroundEquipmentSet, setBackground, setBackgroundEquipmentSet } = useCharacterStore()
  const { data: backgrounds, loading, error } = useBackgroundData()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<ParsedBackground | null>(
    backgrounds.find(b => b.name === backgroundName) ?? null
  )

  if (loading) return <Loading />
  if (error) return <ErrorState message={error} />

  const filtered = search
    ? backgrounds.filter(b =>
        b.name.toLowerCase().includes(search.toLowerCase()) ||
        b.skillProficiencies.some(s => s.toLowerCase().includes(search.toLowerCase()))
      )
    : backgrounds

  function select(bg: ParsedBackground) {
    setSelected(bg)
    setBackground(bg.name, bg.source)
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-dnd-gold mb-1 font-serif">
          步驟三：選擇背景
        </h2>
        <p className="text-gray-400 text-sm">
          背景定義了你的角色過去，並提供技能熟練、工具熟練、語言，以及起始裝備。
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 左側：背景列表 */}
        <div>
          <input
            type="text"
            placeholder="搜尋背景…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field mb-3"
          />

          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {filtered.map(bg => {
              const isSel = selected?.name === bg.name
              return (
                <div
                  key={bg.name}
                  className={`card-hover ${isSel ? 'card-selected' : ''}`}
                  onClick={() => select(bg)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-gray-100">{bg.name}</div>
                      {bg.skillProficiencies.length > 0 && (
                        <div className="text-xs text-gray-400 mt-1">
                          技能：{bg.skillProficiencies.join('、')}
                        </div>
                      )}
                      {bg.abilityDescription && (
                        <div className="text-xs text-parchment-400 mt-0.5">
                          能力值：{bg.abilityDescription}
                        </div>
                      )}
                    </div>
                    {isSel && <span className="text-dnd-gold text-xl">✓</span>}
                  </div>
                  {bg.featNames.length > 0 && (
                    <div className="mt-1 flex gap-1 flex-wrap">
                      {bg.featNames.map(f => (
                        <span key={f} className="tag-gold text-xs">{f}</span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* 右側：詳情 */}
        <div>
          {selected ? (
            <div className="card">
              <h3 className="text-lg font-bold text-dnd-gold mb-3">{selected.name}</h3>

              {/* 熟練與語言 */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {selected.skillProficiencies.length > 0 && (
                  <InfoBlock label="技能熟練" items={selected.skillProficiencies} />
                )}
                {selected.toolProficiencies.length > 0 && (
                  <InfoBlock label="工具熟練" items={selected.toolProficiencies} />
                )}
                {selected.languages && (
                  <InfoBlock label="語言" items={[selected.languages]} />
                )}
                {selected.abilityDescription && (
                  <InfoBlock label="能力值加成" items={[selected.abilityDescription]} />
                )}
                {selected.featNames.length > 0 && (
                  <InfoBlock label="Feat" items={selected.featNames} />
                )}
              </div>

              {/* 起始裝備 */}
              {selected.equipmentOptions.length > 0 && (
                <EquipmentChoice
                  options={selected.equipmentOptions[0]}
                  selected={backgroundEquipmentSet}
                  onChange={setBackgroundEquipmentSet}
                />
              )}

              {/* 描述 */}
              <div className="mt-4 max-h-64 overflow-y-auto border-t border-dnd-border pt-3">
                <EntryRenderer entries={selected.entries} />
              </div>
            </div>
          ) : (
            <div className="card flex items-center justify-center py-12 text-gray-500">
              點選左側背景查看詳情
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoBlock({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="bg-dnd-dark rounded p-2">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      {items.map((item, i) => (
        <div key={i} className="text-sm text-gray-200">{item}</div>
      ))}
    </div>
  )
}

function EquipmentChoice({
  options,
  selected,
  onChange,
}: {
  options: StartingEquipmentData
  selected?: 'A' | 'B'
  onChange: (set: 'A' | 'B') => void
}) {
  const sets: ('A' | 'B')[] = []
  if (options.A) sets.push('A')
  if (options.B) sets.push('B')
  if (!sets.length) return null

  function describeItems(items: (string | { item?: string; quantity?: number; value?: number; equipmentType?: string; special?: string })[]) {
    return items.map(item => {
      if (typeof item === 'string') return item
      if (item.item) return `${item.quantity ? item.quantity + '× ' : ''}${item.item.split('|')[0]}`
      if (item.value) return `${item.value / 100} GP`
      if (item.equipmentType) return `（${item.equipmentType}）`
      if (item.special) return item.special
      return JSON.stringify(item)
    }).join('、')
  }

  return (
    <div className="mt-3">
      <p className="text-sm font-semibold text-dnd-gold mb-2">起始裝備</p>
      <div className="grid grid-cols-2 gap-2">
        {sets.map(set => {
          const items = (options[set] ?? []) as (string | { item?: string; quantity?: number; value?: number; equipmentType?: string; special?: string })[]
          return (
            <button
              key={set}
              onClick={() => onChange(set)}
              className={`p-3 rounded border text-sm text-left transition-colors
                ${selected === set
                  ? 'border-dnd-gold bg-dnd-gold/10 text-dnd-gold'
                  : 'border-dnd-border hover:border-gray-500 text-gray-300'
                }`}
            >
              <div className="font-bold mb-1">選項 {set}</div>
              <div className="text-xs">{describeItems(items)}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function Loading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-spin">⚙</div>
        <p className="text-gray-400">載入背景資料中…</p>
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

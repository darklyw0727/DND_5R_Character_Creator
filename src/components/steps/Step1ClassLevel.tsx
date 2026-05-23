import { useState } from 'react'
import { useCharacterStore } from '../../store/characterStore'
import { useClassData } from '../../hooks/useClassData'
import { CLASS_NAME_ZH, CLASS_COLOR, SKILL_LABEL_ZH } from '../../data/classConstants'
import EntryRenderer from '../shared/EntryRenderer'
import type { ClassTableGroup } from '../../types/5etools'

export default function Step1ClassLevel() {
  const { classes, addClass, removeClass, setClassLevel } = useCharacterStore()
  const { data: classMap, loading, error } = useClassData()
  const [expandedClass, setExpandedClass] = useState<string | null>(null)

  const totalLevel = classes.reduce((s, c) => s + c.level, 0)
  const allClasses = [...classMap.values()].sort((a, b) => a.summary.name.localeCompare(b.summary.name))

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} />

  function isSelected(name: string) {
    return classes.some(c => c.className === name)
  }

  function toggleClass(name: string) {
    if (isSelected(name)) {
      const idx = classes.findIndex(c => c.className === name)
      if (idx >= 0) removeClass(idx)
    } else {
      if (totalLevel >= 20) {
        alert('角色等級總合不能超過 20 級。')
        return
      }
      addClass(name)
    }
  }

  function getClassIndex(name: string) {
    return classes.findIndex(c => c.className === name)
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-dnd-gold mb-1 font-serif">
          步驟一：選擇職業與等級
        </h2>
        <p className="text-gray-400 text-sm">
          選擇一個或多個職業（多職業），設定各職業等級。總等級不得超過 20。
        </p>
        {totalLevel > 0 && (
          <p className="mt-2 text-parchment-300 font-semibold">
            目前總等級：{totalLevel} / 20
          </p>
        )}
      </div>

      {/* 已選職業列表 */}
      {classes.length > 0 && (
        <div className="mb-6 space-y-3">
          <h3 className="section-title">已選職業</h3>
          {classes.map((cls, i) => {
            const parsed = classMap.get(cls.className)
            const color = CLASS_COLOR[cls.className] ?? '#888'
            return (
              <div
                key={i}
                className="card flex items-center gap-4 flex-wrap"
                style={{ borderLeftColor: color, borderLeftWidth: 3 }}
              >
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-gray-100">
                    {CLASS_NAME_ZH[cls.className] ?? cls.className}
                    <span className="text-gray-400 font-normal ml-2">({cls.className})</span>
                  </span>
                  {parsed && (
                    <span className="ml-2 text-xs text-gray-500">
                      d{parsed.summary.hd} · {parsed.summary.primaryAbilities.join('/')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm text-gray-400">等級</label>
                  <input
                    type="number"
                    min={1}
                    max={Math.min(20, 20 - totalLevel + cls.level)}
                    value={cls.level}
                    onChange={e => setClassLevel(i, parseInt(e.target.value) || 1)}
                    className="input-field w-16 text-center"
                  />
                  <button
                    onClick={() => removeClass(i)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    移除
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 職業卡片格狀佈局 */}
      <h3 className="section-title">選擇職業</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {allClasses.map(({ summary }) => {
          const selected = isSelected(summary.name)
          const color = CLASS_COLOR[summary.name] ?? '#888'
          const isExpanded = expandedClass === summary.name

          return (
            <div key={summary.name}>
              <div
                className={`card-hover relative transition-all ${selected ? 'card-selected' : ''}`}
                style={selected ? { borderColor: color } : undefined}
                onClick={() => toggleClass(summary.name)}
              >
                {selected && (
                  <div
                    className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-xs text-white font-bold"
                    style={{ backgroundColor: color }}
                  >
                    ✓
                  </div>
                )}
                <div
                  className="w-2 h-2 rounded-full mb-2"
                  style={{ backgroundColor: color }}
                />
                <div className="font-bold text-gray-100">
                  {CLASS_NAME_ZH[summary.name] ?? summary.name}
                </div>
                <div className="text-xs text-gray-400">{summary.name}</div>
                <div className="mt-2 flex gap-2 text-xs">
                  <span className="tag">d{summary.hd}</span>
                  {summary.primaryAbilities.map(a => (
                    <span key={a} className="tag-gold">{a}</span>
                  ))}
                </div>

                {/* 展開詳情按鈕 */}
                <button
                  className="mt-2 text-xs text-dnd-gold hover:underline"
                  onClick={e => {
                    e.stopPropagation()
                    setExpandedClass(isExpanded ? null : summary.name)
                  }}
                >
                  {isExpanded ? '收起 ▲' : '詳情 ▼'}
                </button>
              </div>

              {/* 展開詳情 */}
              {isExpanded && (
                <ClassDetail summary={summary} featuresByLevel={summary.featuresByLevel} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ClassDetail({ summary, featuresByLevel }: {
  summary: import('../../services/classParser').ClassSummary
  featuresByLevel: Map<number, string[]>
}) {
  const color = CLASS_COLOR[summary.name] ?? '#888'

  return (
    <div className="mt-1 card border-t-0 rounded-t-none text-sm space-y-3">
      {/* 基本資訊 */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-gray-500">HD：</span>
          <span className="text-gray-200">d{summary.hd}</span>
        </div>
        <div>
          <span className="text-gray-500">主要屬性：</span>
          <span className="text-gray-200">{summary.primaryAbilities.join(', ') || '—'}</span>
        </div>
        {summary.spellcastingAbility && (
          <div>
            <span className="text-gray-500">施法能力：</span>
            <span className="text-gray-200">{summary.spellcastingAbility.toUpperCase()}</span>
          </div>
        )}
        <div>
          <span className="text-gray-500">子職業：</span>
          <span className="text-gray-200">{summary.subclassTitle}</span>
        </div>
      </div>

      {/* 技能熟練選擇 */}
      {summary.startingProficiencies.skills?.map((skill, i) => (
        <div key={i} className="text-xs">
          <span className="text-gray-500">技能（選 {skill.choose.count}）：</span>
          <span className="text-gray-300">
            {skill.choose.from.map(s => SKILL_LABEL_ZH[s] ?? s).join('、')}
          </span>
        </div>
      ))}

      {/* 等級特性預覽 */}
      <div>
        <p className="text-xs text-gray-500 mb-2">等級特性預覽：</p>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {Array.from({ length: 5 }, (_, i) => i + 1).map(lvl => {
            const feats = featuresByLevel.get(lvl)
            if (!feats?.length) return null
            return (
              <div key={lvl} className="flex gap-2 text-xs">
                <span
                  className="w-6 h-5 flex items-center justify-center rounded text-dnd-darker font-bold text-xs flex-shrink-0"
                  style={{ backgroundColor: color }}
                >
                  {lvl}
                </span>
                <span className="text-gray-300">{feats.join('、')}</span>
              </div>
            )
          })}
          <p className="text-xs text-gray-500 mt-1">（選擇職業並設定等級後，在步驟五查看完整特性）</p>
        </div>
      </div>

      {/* 職業進度表（前兩行） */}
      {summary.classTableGroups?.slice(0, 1).map((group, gi) => (
        <ClassTablePreview key={gi} group={group} />
      ))}
    </div>
  )
}

function ClassTablePreview({ group }: { group: ClassTableGroup }) {
  return (
    <div className="overflow-x-auto">
      <table className="text-xs w-full">
        <thead>
          <tr>
            <th className="text-left text-gray-500 pr-2">Lv</th>
            {group.colLabels.map((col, i) => (
              <th key={i} className="text-left text-gray-500 pr-2">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {group.rows.slice(0, 5).map((row, ri) => (
            <tr key={ri}>
              <td className="text-gray-400 pr-2">{ri + 1}</td>
              {row.map((cell, ci) => (
                <td key={ci} className="text-gray-300 pr-2">
                  {typeof cell === 'object' && cell && 'value' in cell
                    ? `+${(cell as { value: number }).value}`
                    : String(cell ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-spin">⚙</div>
        <p className="text-gray-400">載入職業資料中…</p>
      </div>
    </div>
  )
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="card border-red-800 text-center py-8">
      <p className="text-red-400 mb-2">載入失敗</p>
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  )
}

import { useState } from 'react'
import { useCharacterStore } from '../../store/characterStore'
import { useRaceData } from '../../hooks/useRaceData'
import { SIZE_LABEL } from '../../services/raceParser'
import { RACE_NAME_ZH, RACE_VARIANT_NAME_ZH } from '../../data/zhTranslations'
import EntryRenderer from '../shared/EntryRenderer'
import type { ParsedRace } from '../../services/raceParser'

export default function Step2Race() {
  const { raceName, raceVariant, raceSize, raceSkillChoices, setRace, setRaceSize, setRaceSkillChoices } = useCharacterStore()
  const { data: races, loading, error } = useRaceData()
  const [selected, setSelected] = useState<ParsedRace | null>(
    races.find(r => r.name === raceName) ?? null
  )

  if (loading) return <Loading />
  if (error) return <ErrorState message={error} />

  function select(race: ParsedRace, variant?: string) {
    setSelected(race)
    const size = race.sizes.length === 1 ? race.sizes[0] : undefined
    setRace(race.name, race.source, variant, size)
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-dnd-gold mb-1 font-serif">
          步驟二：選擇種族
        </h2>
        <p className="text-gray-400 text-sm">
          選擇你的角色種族。若種族有亞種，請進一步選擇。
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 左側：種族列表 */}
        <div className="space-y-2">
          {races.map(race => {
            const isSel = selected?.name === race.name
            return (
              <div
                key={race.name}
                className={`card-hover ${isSel ? 'card-selected' : ''}`}
                onClick={() => select(race)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <div className="font-bold text-gray-100">{RACE_NAME_ZH[race.name] ?? race.name}</div>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <span className="tag">{race.sizes.map(s => SIZE_LABEL[s] ?? s).join('/')}</span>
                      <span className="tag">速度 {race.walkSpeed}呎</span>
                      {race.flySpeed && <span className="tag-gold">飛行 {race.flySpeed}呎</span>}
                      {race.darkvision && <span className="tag">暗視 {race.darkvision}呎</span>}
                      {race.variants && <span className="tag-gold">{race.variants.length} 個亞種</span>}
                    </div>
                  </div>
                  {isSel && <span className="text-dnd-gold text-xl">✓</span>}
                </div>

                {/* 亞種選擇 */}
                {isSel && race.variants && (
                  <div className="mt-3 space-y-2" onClick={e => e.stopPropagation()}>
                    <p className="text-xs text-dnd-gold">選擇亞種：</p>
                    {race.variants.map(v => (
                      <button
                        key={v.name}
                        onClick={() => select(race, v.name)}
                        className={`w-full text-left px-3 py-2 rounded text-sm border transition-colors
                          ${raceVariant === v.name
                            ? 'border-dnd-gold bg-dnd-gold/10 text-dnd-gold'
                            : 'border-dnd-border hover:border-gray-500 text-gray-300'
                          }`}
                      >
                        {RACE_VARIANT_NAME_ZH[v.name] ?? v.name}
                      </button>
                    ))}
                  </div>
                )}

                {/* 體型選擇（多體型時） */}
                {isSel && race.sizes.length > 1 && (
                  <div className="mt-3 space-y-2" onClick={e => e.stopPropagation()}>
                    <p className="text-xs text-dnd-gold">選擇體型：</p>
                    <div className="flex gap-2 flex-wrap">
                      {race.sizes.map(s => (
                        <button
                          key={s}
                          onClick={() => setRaceSize(s)}
                          className={`px-3 py-1.5 rounded text-sm border transition-colors
                            ${raceSize === s
                              ? 'border-dnd-gold bg-dnd-gold/10 text-dnd-gold'
                              : 'border-dnd-border hover:border-gray-500 text-gray-300'
                            }`}
                        >
                          {SIZE_LABEL[s] ?? s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 技能熟練選擇（種族特質如敏銳感官） */}
                {isSel && race.skillChoices && (
                  <div className="mt-3 space-y-2" onClick={e => e.stopPropagation()}>
                    <p className="text-xs text-dnd-gold">
                      選擇技能熟練（選 {race.skillChoices.count} 項）：
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {race.skillChoices.from.map(skill => {
                        const chosen = raceSkillChoices ?? []
                        const isChosen = chosen.includes(skill)
                        const maxReached = chosen.length >= race.skillChoices!.count
                        return (
                          <button
                            key={skill}
                            onClick={() => {
                              if (isChosen) {
                                setRaceSkillChoices(chosen.filter(s => s !== skill))
                              } else if (!maxReached) {
                                setRaceSkillChoices([...chosen, skill])
                              }
                            }}
                            className={`px-3 py-1.5 rounded text-sm border transition-colors
                              ${isChosen
                                ? 'border-dnd-gold bg-dnd-gold/10 text-dnd-gold'
                                : maxReached
                                  ? 'border-dnd-border text-gray-600 cursor-not-allowed'
                                  : 'border-dnd-border hover:border-gray-500 text-gray-300'
                              }`}
                          >
                            {skill}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* 右側：詳情 */}
        <div>
          {selected ? (
            <div className="card sticky top-4">
              <h3 className="text-lg font-bold text-dnd-gold mb-1">{RACE_NAME_ZH[selected.name] ?? selected.name}</h3>
              {raceVariant && <p className="text-parchment-300 text-sm mb-2">亞種：{RACE_VARIANT_NAME_ZH[raceVariant] ?? raceVariant}</p>}

              <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
                <InfoItem
                  label="體型"
                  value={raceSize
                    ? (SIZE_LABEL[raceSize] ?? raceSize)
                    : selected.sizes.map(s => SIZE_LABEL[s] ?? s).join('/')}
                />
                <InfoItem label="移動速度" value={`${selected.walkSpeed} 呎`} />
                {selected.darkvision && <InfoItem label="暗視" value={`${selected.darkvision} 呎`} />}
                {selected.flySpeed && <InfoItem label="飛行速度" value={`${selected.flySpeed} 呎`} />}
                <InfoItem label="生物類型" value={selected.creatureTypes.join('、')} />
              </div>

              <div className="max-h-96 overflow-y-auto">
                {/* 若選了亞種，顯示亞種描述；否則顯示種族描述 */}
                {raceVariant && selected.variants ? (
                  <EntryRenderer
                    entries={selected.variants.find(v => v.name === raceVariant)?.entries ?? selected.entries}
                  />
                ) : (
                  <EntryRenderer entries={selected.entries} />
                )}
              </div>
            </div>
          ) : (
            <div className="card flex items-center justify-center py-12 text-gray-500">
              點選左側種族查看詳情
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-dnd-dark rounded p-2">
      <div className="text-gray-500">{label}</div>
      <div className="text-gray-200 font-semibold">{value}</div>
    </div>
  )
}

function Loading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-spin">⚙</div>
        <p className="text-gray-400">載入種族資料中…</p>
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

import { useCharacterStore, selectFinalAbilityScores } from '../../store/characterStore'
import { CLASS_NAME_ZH, CLASS_COLOR } from '../../data/classConstants'
import { ABILITY_LABELS, ABILITY_KEYS, getModifier, formatModifier, getProficiencyBonus } from '../../data/abilityScoreData'

const RANDOM_NAMES = [
  'Aelindra', 'Brom', 'Caelindrel', 'Dorin', 'Erevos', 'Faelar',
  'Gorion', 'Hadwyn', 'Irindael', 'Jorvald', 'Kira', 'Lyria',
  'Malcon', 'Nessa', 'Orin', 'Praxis', 'Quillan', 'Riven',
  'Seraph', 'Theron', 'Ursa', 'Vex', 'Wren', 'Xander', 'Yelena', 'Zorn',
]

export default function Step7Naming() {
  const store = useCharacterStore()
  const {
    characterName, setCharacterName, classes, raceName, raceVariant,
    backgroundName, spellSelections,
  } = store

  const finalScores = selectFinalAbilityScores(store)
  const totalLevel = classes.reduce((s, c) => s + c.level, 0)
  const profBonus = getProficiencyBonus(totalLevel)

  function randomName() {
    const name = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)]
    setCharacterName(name)
  }

  function exportCharacter() {
    const data = {
      name: characterName,
      race: raceVariant ? `${raceName} (${raceVariant})` : raceName,
      background: backgroundName,
      classes: classes.map(c => ({
        class: c.className,
        level: c.level,
        subclass: c.subclassShortName,
      })),
      totalLevel,
      abilityScores: finalScores,
      spells: spellSelections.map(sp => sp.spellName),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${characterName || 'character'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-dnd-gold mb-1 font-serif">
          步驟七：命名你的角色
        </h2>
        <p className="text-gray-400 text-sm">
          為你的角色取一個名字，然後查看完整的角色資訊。
        </p>
      </div>

      {/* 名稱輸入 */}
      <div className="card mb-6">
        <label className="block text-sm text-gray-400 mb-2">角色名稱</label>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="輸入角色名稱…"
            value={characterName}
            onChange={e => setCharacterName(e.target.value)}
            className="input-field flex-1 text-lg"
            autoFocus
          />
          <button
            onClick={randomName}
            className="btn-secondary flex-shrink-0"
            title="隨機名稱"
          >
            🎲
          </button>
        </div>
      </div>

      {/* 角色總覽 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* 左：基本資訊 */}
        <div className="space-y-4">
          {/* 角色卡片 */}
          <div className="card">
            <h3 className="section-title">角色資訊</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-gray-500">名稱</dt>
              <dd className="text-gray-100 font-semibold">{characterName || '（未設定）'}</dd>

              <dt className="text-gray-500">種族</dt>
              <dd className="text-gray-100">
                {raceName ? (raceVariant ? `${raceName}（${raceVariant}）` : raceName) : '（未選擇）'}
              </dd>

              <dt className="text-gray-500">背景</dt>
              <dd className="text-gray-100">{backgroundName ?? '（未選擇）'}</dd>

              <dt className="text-gray-500">總等級</dt>
              <dd className="text-dnd-gold font-bold">{totalLevel}</dd>

              <dt className="text-gray-500">熟練加值</dt>
              <dd className="text-dnd-gold font-bold">+{profBonus}</dd>
            </dl>

            {/* 職業 */}
            <div className="mt-3 pt-3 border-t border-dnd-border">
              <div className="text-xs text-gray-500 mb-2">職業</div>
              <div className="flex gap-2 flex-wrap">
                {classes.length > 0 ? classes.map((cls, i) => {
                  const color = CLASS_COLOR[cls.className] ?? '#888'
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold text-dnd-darker"
                      style={{ backgroundColor: color }}
                    >
                      {CLASS_NAME_ZH[cls.className] ?? cls.className}
                      <span className="opacity-70">Lv{cls.level}</span>
                      {cls.subclassShortName && (
                        <span className="opacity-60">（{cls.subclassShortName}）</span>
                      )}
                    </div>
                  )
                }) : <span className="text-gray-500">（未選擇）</span>}
              </div>
            </div>
          </div>

          {/* 能力值 */}
          <div className="card">
            <h3 className="section-title">能力值</h3>
            <div className="grid grid-cols-3 gap-3">
              {ABILITY_KEYS.map(key => {
                const score = finalScores[key]
                const mod = getModifier(score)
                return (
                  <div key={key} className="text-center bg-dnd-dark rounded p-2">
                    <div className="text-xs text-gray-500">{ABILITY_LABELS[key].zh}</div>
                    <div className="text-xs text-gray-600">{ABILITY_LABELS[key].short}</div>
                    <div className="text-2xl font-bold text-gray-100 my-1">{score}</div>
                    <div className={`text-sm font-semibold ${mod >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {formatModifier(score)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* 右：法術與匯出 */}
        <div className="space-y-4">
          {/* 法術列表 */}
          {spellSelections.length > 0 && (
            <div className="card">
              <h3 className="section-title">已選法術（{spellSelections.length} 個）</h3>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {classes.map((cls, i) => {
                  const spells = spellSelections.filter(sp => sp.classIndex === i)
                  if (!spells.length) return null
                  return (
                    <div key={i}>
                      <div className="text-xs text-gray-500 mb-1">
                        {CLASS_NAME_ZH[cls.className] ?? cls.className}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {spells.map(sp => (
                          <span key={sp.spellName} className="tag text-xs">
                            {sp.spellName}
                            {sp.spellLevel === 0 && ' ★'}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 匯出 */}
          <div className="card">
            <h3 className="section-title">匯出角色</h3>
            <p className="text-sm text-gray-400 mb-4">
              將角色資訊儲存為 JSON 檔案，可日後使用或分享。
            </p>
            <div className="flex gap-3">
              <button
                onClick={exportCharacter}
                className="btn-gold flex-1"
              >
                ⬇ 下載 JSON
              </button>
              <button
                onClick={() => window.print()}
                className="btn-secondary flex-1"
              >
                🖨 列印
              </button>
            </div>
          </div>

          {/* 完成提示 */}
          {characterName && classes.length > 0 && (
            <div className="card border-dnd-gold/50 bg-dnd-gold/5 text-center py-4">
              <div className="text-3xl mb-2">🎉</div>
              <p className="text-dnd-gold font-bold">
                {characterName} 已就緒！
              </p>
              <p className="text-gray-400 text-sm mt-1">
                願你的冒險充滿傳奇！
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

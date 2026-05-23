import { useCharacterStore, selectFinalAbilityScores } from '../../store/characterStore'
import {
  STANDARD_ARRAY, POINT_BUY_COST, POINT_BUY_TOTAL, POINT_BUY_MIN, POINT_BUY_MAX,
  getModifier, formatModifier, ABILITY_LABELS, ABILITY_KEYS,
} from '../../data/abilityScoreData'
import type { AbilityKey } from '../../types/character'

export default function Step4AbilityScores() {
  const store = useCharacterStore()
  const {
    abilityScoreMethod, baseAbilityScores, standardArrayAssignment,
    setAbilityScoreMethod, setAbilityScore, setStandardArrayAssignment,
  } = store

  const finalScores = selectFinalAbilityScores(store)

  // 計算剩餘點數（Point Buy）
  const usedPoints = ABILITY_KEYS.reduce((sum, key) => {
    return sum + (POINT_BUY_COST[baseAbilityScores[key]] ?? 0)
  }, 0)
  const remainingPoints = POINT_BUY_TOTAL - usedPoints

  // 標準陣列：已分配的值
  const assigned = standardArrayAssignment ?? {}
  const usedValues = new Set(Object.values(assigned).filter(v => v !== undefined))
  const availableValues = STANDARD_ARRAY.filter(v => !usedValues.has(v))

  function assignStandardArray(key: AbilityKey, value: number | undefined) {
    const newAssignment = { ...assigned }
    // 移除舊的
    for (const k of ABILITY_KEYS) {
      if (newAssignment[k] === value) delete newAssignment[k]
    }
    if (value !== undefined) {
      newAssignment[key] = value
    } else {
      delete newAssignment[key]
    }
    setStandardArrayAssignment(newAssignment)
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-dnd-gold mb-1 font-serif">
          步驟四：配置能力值
        </h2>
        <p className="text-gray-400 text-sm">
          選擇分配方式，決定你角色的六項能力值。
        </p>
      </div>

      {/* 方法選擇 */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {(
          [
            { key: 'standard_array', label: '標準陣列', desc: '15/14/13/12/10/8' },
            { key: 'point_buy', label: '點數購買', desc: '27 點自由分配' },
            { key: 'manual', label: '手動輸入', desc: '自行填寫數值' },
          ] as const
        ).map(m => (
          <button
            key={m.key}
            onClick={() => setAbilityScoreMethod(m.key)}
            className={`p-3 rounded border text-sm transition-colors
              ${abilityScoreMethod === m.key
                ? 'border-dnd-gold bg-dnd-gold/10 text-dnd-gold'
                : 'border-dnd-border hover:border-gray-500 text-gray-300'
              }`}
          >
            <div className="font-bold">{m.label}</div>
            <div className="text-xs mt-0.5 opacity-70">{m.desc}</div>
          </button>
        ))}
      </div>

      {/* 點數購買剩餘提示 */}
      {abilityScoreMethod === 'point_buy' && (
        <div className={`mb-4 px-4 py-2 rounded text-sm font-semibold ${remainingPoints >= 0 ? 'bg-dnd-dark text-dnd-gold' : 'bg-red-900/40 text-red-400'}`}>
          剩餘點數：{remainingPoints} / {POINT_BUY_TOTAL}
        </div>
      )}

      {/* 能力值配置 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {ABILITY_KEYS.map(key => {
          const info = ABILITY_LABELS[key]
          const base = baseAbilityScores[key]
          const final = finalScores[key]
          const mod = getModifier(final)

          return (
            <div key={key} className="card text-center">
              <div className="text-xs text-gray-500 mb-1">{info.zh}（{info.short}）</div>

              {/* 輸入控制 */}
              {abilityScoreMethod === 'standard_array' ? (
                <select
                  value={assigned[key] ?? ''}
                  onChange={e => assignStandardArray(key, e.target.value ? parseInt(e.target.value) : undefined)}
                  className="select-field text-center mb-2"
                >
                  <option value="">—</option>
                  {STANDARD_ARRAY.map(v => (
                    <option
                      key={v}
                      value={v}
                      disabled={usedValues.has(v) && assigned[key] !== v}
                    >
                      {v}
                    </option>
                  ))}
                </select>
              ) : abilityScoreMethod === 'point_buy' ? (
                <div className="flex items-center justify-center gap-2 mb-2">
                  <button
                    className="w-7 h-7 rounded bg-dnd-border hover:bg-gray-600 font-bold"
                    onClick={() => {
                      const newVal = Math.max(POINT_BUY_MIN, base - 1)
                      setAbilityScore(key, newVal)
                    }}
                    disabled={base <= POINT_BUY_MIN}
                  >−</button>
                  <span className="text-xl font-bold w-8 text-center">{base}</span>
                  <button
                    className="w-7 h-7 rounded bg-dnd-border hover:bg-gray-600 font-bold"
                    onClick={() => {
                      const newVal = Math.min(POINT_BUY_MAX, base + 1)
                      const newCost = POINT_BUY_COST[newVal] - POINT_BUY_COST[base]
                      if (remainingPoints >= newCost) setAbilityScore(key, newVal)
                    }}
                    disabled={base >= POINT_BUY_MAX || remainingPoints < (POINT_BUY_COST[Math.min(POINT_BUY_MAX, base + 1)] - POINT_BUY_COST[base])}
                  >+</button>
                </div>
              ) : (
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={base}
                  onChange={e => setAbilityScore(key, parseInt(e.target.value) || 8)}
                  className="input-field text-center text-xl font-bold mb-2 h-10"
                />
              )}

              {/* 最終值與修正值 */}
              <div className="flex justify-center items-center gap-2">
                {final !== base && (
                  <span className="text-xs text-gray-500 line-through">{base}</span>
                )}
                <span className="text-2xl font-bold text-gray-100">{final}</span>
                <span className={`text-sm font-semibold ${mod >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatModifier(final)}
                </span>
              </div>

              {/* 購買費用顯示 */}
              {abilityScoreMethod === 'point_buy' && (
                <div className="text-xs text-gray-600 mt-1">
                  花費 {POINT_BUY_COST[base] ?? '?'} 點
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* 標準陣列剩餘值 */}
      {abilityScoreMethod === 'standard_array' && (
        <div className="mt-4 flex gap-2 flex-wrap">
          <span className="text-sm text-gray-500">尚未分配：</span>
          {availableValues.map(v => (
            <span key={v} className="tag text-sm">{v}</span>
          ))}
          {availableValues.length === 0 && (
            <span className="text-dnd-gold text-sm">全部分配完畢 ✓</span>
          )}
        </div>
      )}

      {/* 背景加成提示 */}
      <div className="mt-6 card bg-dnd-dark/50">
        <p className="text-xs text-gray-500 mb-1">背景能力值加成</p>
        <p className="text-sm text-gray-300">
          {store.backgroundAbilityChoices
            ? ABILITY_KEYS
                .filter(k => (store.backgroundAbilityChoices?.[k] ?? 0) > 0)
                .map(k => `${ABILITY_LABELS[k].short} +${store.backgroundAbilityChoices?.[k]}`)
                .join('、') || '尚未設定'
            : '請在步驟五中確認背景能力值加成'}
        </p>
        {!store.backgroundAbilityChoices && store.backgroundName && (
          <BackgroundAbilitySelector />
        )}
      </div>
    </div>
  )
}

// 背景能力值選擇提示（完整實作見 Step5ClassDetails）
function BackgroundAbilitySelector() {
  return (
    <div className="mt-3">
      <p className="text-xs text-gray-500">
        背景能力值加成將在「步驟五：職業細節」中配置。
      </p>
    </div>
  )
}

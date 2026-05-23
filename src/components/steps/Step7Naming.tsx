import { useCharacterStore, selectFinalAbilityScores } from '../../store/characterStore'
import { CLASS_NAME_ZH, CLASS_COLOR } from '../../data/classConstants'
import {
  ABILITY_LABELS, ABILITY_KEYS, getModifier, formatModifier, getProficiencyBonus,
  FULL_CASTER_SLOTS, HALF_CASTER_SLOTS, WARLOCK_PACT_SLOTS, MULTICLASS_SPELL_SLOTS,
} from '../../data/abilityScoreData'
import { useClassData } from '../../hooks/useClassData'
import { useRaceData } from '../../hooks/useRaceData'
import { useBackgroundData } from '../../hooks/useBackgroundData'
import { SIZE_LABEL } from '../../services/raceParser'
import type { AbilityKey } from '../../types/character'

// ── 常數 ────────────────────────────────────────────────────────────────────

const RANDOM_NAMES = [
  'Aelindra', 'Brom', 'Caelindrel', 'Dorin', 'Erevos', 'Faelar',
  'Gorion', 'Hadwyn', 'Irindael', 'Jorvald', 'Kira', 'Lyria',
  'Malcon', 'Nessa', 'Orin', 'Praxis', 'Quillan', 'Riven',
  'Seraph', 'Theron', 'Ursa', 'Vex', 'Wren', 'Xander', 'Yelena', 'Zorn',
]

const SKILL_MAP: Array<{ en: string; zh: string; ability: AbilityKey }> = [
  { en: 'Athletics',       zh: '運動', ability: 'str' },
  { en: 'Acrobatics',      zh: '體操', ability: 'dex' },
  { en: 'Sleight of Hand', zh: '巧手', ability: 'dex' },
  { en: 'Stealth',         zh: '隱匿', ability: 'dex' },
  { en: 'Arcana',          zh: '奧秘', ability: 'int' },
  { en: 'History',         zh: '歷史', ability: 'int' },
  { en: 'Investigation',   zh: '調查', ability: 'int' },
  { en: 'Nature',          zh: '自然', ability: 'int' },
  { en: 'Religion',        zh: '宗教', ability: 'int' },
  { en: 'Animal Handling', zh: '馴獸', ability: 'wis' },
  { en: 'Insight',         zh: '洞悉', ability: 'wis' },
  { en: 'Medicine',        zh: '醫療', ability: 'wis' },
  { en: 'Perception',      zh: '察覺', ability: 'wis' },
  { en: 'Survival',        zh: '求生', ability: 'wis' },
  { en: 'Deception',       zh: '欺瞞', ability: 'cha' },
  { en: 'Intimidation',    zh: '威嚇', ability: 'cha' },
  { en: 'Performance',     zh: '表演', ability: 'cha' },
  { en: 'Persuasion',      zh: '遊說', ability: 'cha' },
]

const SKILL_ZH: Record<string, string> = {
  acrobatics: '體操', 'animal handling': '馴獸', arcana: '奧秘',
  athletics: '運動', deception: '欺瞞', history: '歷史',
  insight: '洞悉', intimidation: '威嚇', investigation: '調查',
  medicine: '醫療', nature: '自然', perception: '察覺',
  performance: '表演', persuasion: '遊說', religion: '宗教',
  'sleight of hand': '巧手', stealth: '隱匿', survival: '求生',
}

const SPELL_RING_ZH = ['一環', '二環', '三環', '四環', '五環', '六環', '七環', '八環', '九環']

const FULL_CASTERS_SET  = new Set(['Bard', 'Cleric', 'Druid', 'Sorcerer', 'Wizard'])
const HALF_CASTERS_SET  = new Set(['Paladin', 'Ranger'])

// ── 輔助函式 ─────────────────────────────────────────────────────────────────

function fmtMod(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`
}

function isThirdCaster(className: string, sub?: string): boolean {
  return (className === 'Fighter' && sub === 'Eldritch Knight') ||
         (className === 'Rogue'   && sub === 'Arcane Trickster')
}

// ── 元件主體 ─────────────────────────────────────────────────────────────────

export default function Step7Naming() {
  const store = useCharacterStore()
  const {
    characterName, setCharacterName, classes, raceName, raceVariant,
    backgroundName, spellSelections, asiChoices,
  } = store

  const finalScores = selectFinalAbilityScores(store)
  const totalLevel   = classes.reduce((s, c) => s + c.level, 0)
  const profBonus    = getProficiencyBonus(totalLevel)

  const { data: classDataMap } = useClassData()
  const { data: raceDataList  } = useRaceData()
  const { data: bgDataList    } = useBackgroundData()

  const conMod = getModifier(finalScores.con)
  const dexMod = getModifier(finalScores.dex)
  const wisMod = getModifier(finalScores.wis)

  // ── HP ────────────────────────────────────────────────────────────────────
  // HP = Σ(每職業: 等級*(hd/2+1+conMod)) + (主職業hd/2 - 1)
  let hp: number | null = null
  if (classes.length > 0 && classDataMap.size > 0) {
    const primaryHD = classDataMap.get(classes[0].className)?.summary.hd ?? 8
    let total = Math.floor(primaryHD / 2) - 1
    for (const cls of classes) {
      const hd = classDataMap.get(cls.className)?.summary.hd ?? 8
      total += cls.level * (Math.floor(hd / 2) + 1 + conMod)
    }
    hp = total
  }

  const ac         = 10 + dexMod
  const initiative = dexMod

  const hitDiceList = classes.map(cls => ({
    count: cls.level,
    die: classDataMap.get(cls.className)?.summary.hd ?? 8,
    className: cls.className,
  }))

  // ── 種族 ──────────────────────────────────────────────────────────────────
  const currentRace = raceDataList.find(r => r.name === raceName)
  const walkSpeed   = currentRace?.walkSpeed ?? 30
  const flySpeed    = currentRace?.flySpeed
  const size        = currentRace?.size ?? 'M'

  // ── 背景與熟練 ────────────────────────────────────────────────────────────
  const bgData    = bgDataList.find(b => b.name === backgroundName)
  const bgSkills: string[] = bgData?.skillProficiencies ?? []
  const bgFeats:  string[] = bgData?.featNames ?? []

  const primarySaves: string[] = classes.length > 0
    ? (classDataMap.get(classes[0].className)?.summary.rawClass.proficiency ?? [])
    : []

  const hasPerceptionProf = bgSkills.some(s => s.toLowerCase() === 'perception')
  const passivePerception  = 10 + wisMod + (hasPerceptionProf ? profBonus : 0)

  const primarySkillEntry = classes.length > 0
    ? classDataMap.get(classes[0].className)?.summary.rawClass.startingProficiencies.skills?.[0]
    : undefined

  // ── 專長 ──────────────────────────────────────────────────────────────────
  const asiFeats  = asiChoices.filter(a => a.choice === 'feat' && a.featName).map(a => a.featName!)
  const allFeats  = [...bgFeats, ...asiFeats]

  // ── 職業特性 ──────────────────────────────────────────────────────────────
  const classFeaturesList = classes.map(cls => {
    const data = classDataMap.get(cls.className)
    if (!data) return { cls, features: [] as string[] }
    const features: string[] = []
    for (let lvl = 1; lvl <= cls.level; lvl++) {
      features.push(...(data.summary.featuresByLevel.get(lvl) ?? []))
    }
    return { cls, features }
  })

  // ── 施法職業分類 ──────────────────────────────────────────────────────────
  const nonWarlockCasters = classes.filter(cls =>
    FULL_CASTERS_SET.has(cls.className) ||
    HALF_CASTERS_SET.has(cls.className) ||
    isThirdCaster(cls.className, cls.subclassShortName)
  )
  const warlockList = classes.filter(cls => cls.className === 'Warlock')
  const allCasters  = [...nonWarlockCasters, ...warlockList]

  // ── 角色法術環位 ──────────────────────────────────────────────────────────
  let characterSlots: number[] | null = null

  if (nonWarlockCasters.length === 1) {
    const cls = nonWarlockCasters[0]
    if (FULL_CASTERS_SET.has(cls.className)) {
      characterSlots = FULL_CASTER_SLOTS[cls.level] ?? null
    } else if (HALF_CASTERS_SET.has(cls.className)) {
      characterSlots = HALF_CASTER_SLOTS[cls.level] ?? null
    } else {
      // 三分之一施法者
      const cl = Math.floor(cls.level / 3)
      characterSlots = cl > 0 ? (MULTICLASS_SPELL_SLOTS[cl] ?? null) : null
    }
  } else if (nonWarlockCasters.length > 1) {
    let casterLevel = 0
    for (const cls of nonWarlockCasters) {
      if (FULL_CASTERS_SET.has(cls.className))        casterLevel += cls.level
      else if (HALF_CASTERS_SET.has(cls.className))   casterLevel += Math.floor(cls.level / 2)
      else                                             casterLevel += Math.floor(cls.level / 3)
    }
    characterSlots = casterLevel > 0 ? (MULTICLASS_SPELL_SLOTS[Math.min(casterLevel, 20)] ?? null) : null
  }

  // 魔契師環位（獨立）
  let warlockPactSlots: [number, number] | null = null
  if (warlockList.length > 0) {
    const wlvl = Math.min(warlockList.reduce((s, c) => s + c.level, 0), 20)
    warlockPactSlots = WARLOCK_PACT_SLOTS[wlvl] ?? null
  }

  const hasAnySlots = characterSlots !== null || warlockPactSlots !== null

  // ── 準備法術上限 ──────────────────────────────────────────────────────────
  function getMaxPrepared(className: string, level: number): number | null {
    const wis = getModifier(finalScores.wis)
    const int = getModifier(finalScores.int)
    const cha = getModifier(finalScores.cha)
    switch (className) {
      case 'Cleric':  return Math.max(1, wis + level)
      case 'Druid':   return Math.max(1, wis + level)
      case 'Wizard':  return Math.max(1, int + level)
      case 'Paladin': return Math.max(1, cha + Math.floor(level / 2))
      case 'Ranger':  return Math.max(1, wis + Math.floor(level / 2))
      default: return null
    }
  }

  // ── 匯出 ──────────────────────────────────────────────────────────────────
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
        class: c.className, level: c.level, subclass: c.subclassShortName,
      })),
      totalLevel,
      abilityScores: finalScores,
      spells: spellSelections.map(sp => sp.spellName),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url
    a.download = `${characterName || 'character'}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ── JSX ───────────────────────────────────────────────────────────────────

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-dnd-gold mb-1 font-serif">步驟七：命名你的角色</h2>
        <p className="text-gray-400 text-sm">為你的角色取一個名字，然後查看完整的角色資訊。</p>
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
          <button onClick={randomName} className="btn-secondary flex-shrink-0" title="隨機名稱">🎲</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* ── 左欄：角色資訊 + 能力值（含熟練） ─────────────────────────── */}
        <div className="space-y-4">

          {/* 角色資訊 */}
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
            <div className="mt-3 pt-3 border-t border-dnd-border">
              <div className="text-xs text-gray-500 mb-2">職業</div>
              <div className="flex gap-2 flex-wrap">
                {classes.length > 0 ? classes.map((cls, i) => {
                  const color = CLASS_COLOR[cls.className] ?? '#888'
                  return (
                    <div key={i}
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

          {/* 能力值（含豁免與技能熟練） */}
          <div className="card">
            <h3 className="section-title">能力值</h3>
            <div className="divide-y divide-dnd-border">
              {ABILITY_KEYS.map(key => {
                const score = finalScores[key]
                const mod   = getModifier(score)
                const saveProficient = primarySaves.includes(key)
                const saveMod = mod + (saveProficient ? profBonus : 0)
                const skills = SKILL_MAP.filter(s => s.ability === key)

                return (
                  <div key={key} className="flex gap-3 py-2">
                    <div className="w-[4.5rem] flex-shrink-0 text-center bg-dnd-dark rounded py-1.5">
                      <div className="text-[10px] text-gray-500 leading-none">{ABILITY_LABELS[key].zh}</div>
                      <div className="text-[10px] text-gray-600 leading-none mt-0.5">{ABILITY_LABELS[key].short}</div>
                      <div className="text-xl font-bold text-gray-100 my-0.5">{score}</div>
                      <div className={`text-xs font-semibold ${mod >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatModifier(score)}
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-center gap-0.5 min-w-0">
                      {/* 豁免 */}
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className={saveProficient ? 'text-dnd-gold' : 'text-gray-600'}>
                          {saveProficient ? '●' : '○'}
                        </span>
                        <span className={`w-7 text-right font-mono text-[11px] ${saveProficient ? 'text-dnd-gold font-bold' : 'text-gray-400'}`}>
                          {fmtMod(saveMod)}
                        </span>
                        <span className={saveProficient ? 'text-gray-300' : 'text-gray-500'}>豁免</span>
                      </div>
                      {/* 技能 */}
                      {skills.map(skill => {
                        const proficient = bgSkills.some(s => s.toLowerCase() === skill.en.toLowerCase())
                        const skillMod   = mod + (proficient ? profBonus : 0)
                        return (
                          <div key={skill.en} className="flex items-center gap-1.5 text-xs">
                            <span className={proficient ? 'text-dnd-gold' : 'text-gray-600'}>
                              {proficient ? '●' : '○'}
                            </span>
                            <span className={`w-7 text-right font-mono text-[11px] ${proficient ? 'text-dnd-gold font-bold' : 'text-gray-400'}`}>
                              {fmtMod(skillMod)}
                            </span>
                            <span className={proficient ? 'text-gray-200' : 'text-gray-400'}>{skill.zh}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
            {/* 職業技能待選說明 */}
            {primarySkillEntry && (
              <div className="mt-3 pt-3 border-t border-dnd-border text-xs text-gray-500">
                <span>職業技能待選（{CLASS_NAME_ZH[classes[0]?.className ?? ''] ?? classes[0]?.className ?? ''}）：</span>
                {'choose' in primarySkillEntry ? (
                  <span>任選 <span className="text-dnd-gold">{primarySkillEntry.choose.count}</span> 項自：{primarySkillEntry.choose.from.map(s => SKILL_ZH[s] ?? s).join('、')}</span>
                ) : (
                  <span>任選 <span className="text-dnd-gold">{(primarySkillEntry as { any: number }).any}</span> 項（任意技能）</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── 右欄：戰鬥屬性、特性、法術 ───────────────────────────────── */}
        <div className="space-y-4">

          {/* 戰鬥屬性 */}
          <div className="card">
            <h3 className="section-title">戰鬥屬性</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-gray-500">生命值（HP）</dt>
              <dd className="text-green-400 font-bold text-base">{hp !== null ? hp : '—'}</dd>
              <dt className="text-gray-500">護甲等級（AC）</dt>
              <dd className="text-gray-100 font-semibold">
                {ac}<span className="text-xs text-gray-500 ml-1">（無護甲）</span>
              </dd>
              <dt className="text-gray-500">先攻</dt>
              <dd className={`font-semibold ${initiative >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {fmtMod(initiative)}
              </dd>
              <dt className="text-gray-500">速度</dt>
              <dd className="text-gray-100">
                步行 {walkSpeed} 呎
                {flySpeed !== undefined && <span className="text-blue-400 ml-2">飛行 {flySpeed} 呎</span>}
              </dd>
              <dt className="text-gray-500">體型</dt>
              <dd className="text-gray-100">{SIZE_LABEL[size] ?? size}</dd>
              <dt className="text-gray-500">被動察覺</dt>
              <dd className="text-gray-100 font-semibold">
                {passivePerception}
                {hasPerceptionProf && <span className="text-xs text-dnd-gold ml-1">（含熟練）</span>}
              </dd>
            </dl>
            {hitDiceList.length > 0 && (
              <div className="mt-3 pt-3 border-t border-dnd-border">
                <div className="text-xs text-gray-500 mb-1.5">生命骰</div>
                <div className="flex flex-wrap gap-2">
                  {hitDiceList.map((hd, i) => (
                    <span key={i} className="tag text-sm font-mono">
                      {hd.count}d{hd.die}
                      <span className="text-xs opacity-60 ml-1">（{CLASS_NAME_ZH[hd.className] ?? hd.className}）</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 專長 */}
          {allFeats.length > 0 && (
            <div className="card">
              <h3 className="section-title">專長</h3>
              <div className="flex flex-wrap gap-2">
                {allFeats.map((feat, i) => (
                  <span key={i} className="tag text-sm">{feat}</span>
                ))}
              </div>
            </div>
          )}

          {/* 職業特性 */}
          {classFeaturesList.some(c => c.features.length > 0) && (
            <div className="card">
              <h3 className="section-title">職業特性</h3>
              <div className="space-y-3">
                {classFeaturesList.map(({ cls, features }, i) => {
                  if (!features.length) return null
                  const color = CLASS_COLOR[cls.className] ?? '#888'
                  return (
                    <div key={i}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded-full text-dnd-darker"
                          style={{ backgroundColor: color }}
                        >
                          {CLASS_NAME_ZH[cls.className] ?? cls.className} Lv{cls.level}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                        {features.map((feat, fi) => (
                          <span
                            key={fi}
                            className={`tag text-xs ${feat.endsWith('★') ? 'border-dnd-gold/40 text-dnd-gold/80' : ''}`}
                          >
                            {feat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 角色法術環位 */}
          {hasAnySlots && (
            <div className="card">
              <h3 className="section-title">角色法術環位</h3>

              {characterSlots && (
                <div className={warlockPactSlots ? 'mb-3' : ''}>
                  {nonWarlockCasters.length > 1 && (
                    <div className="text-xs text-gray-500 mb-1.5">
                      混合施法等級：
                      {nonWarlockCasters.map(c => {
                        const contrib = FULL_CASTERS_SET.has(c.className)
                          ? c.level
                          : HALF_CASTERS_SET.has(c.className)
                            ? Math.floor(c.level / 2)
                            : Math.floor(c.level / 3)
                        return `${CLASS_NAME_ZH[c.className] ?? c.className}(${contrib})`
                      }).join(' + ')}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {characterSlots.map((count, i) =>
                      count > 0 ? (
                        <div key={i} className="text-center bg-dnd-dark rounded px-3 py-1.5 min-w-[3rem]">
                          <div className="text-[10px] text-gray-500">{SPELL_RING_ZH[i]}</div>
                          <div className="text-dnd-gold font-bold text-lg leading-none mt-0.5">{count}</div>
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              )}

              {warlockPactSlots && (
                <div>
                  {characterSlots && <div className="border-t border-dnd-border mt-2 pt-2" />}
                  <div className="text-xs text-gray-500 mb-1.5">魔契師契約環位（獨立）</div>
                  <div className="flex flex-wrap gap-2">
                    <div className="text-center bg-dnd-dark rounded px-3 py-1.5 min-w-[3rem]">
                      <div className="text-[10px] text-gray-500">環位</div>
                      <div className="text-purple-400 font-bold text-lg leading-none mt-0.5">
                        {SPELL_RING_ZH[warlockPactSlots[1] - 1]}
                      </div>
                    </div>
                    <div className="text-center bg-dnd-dark rounded px-3 py-1.5 min-w-[3rem]">
                      <div className="text-[10px] text-gray-500">數量</div>
                      <div className="text-purple-400 font-bold text-lg leading-none mt-0.5">
                        {warlockPactSlots[0]}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 準備法術 */}
          {allCasters.length > 0 && (
            <div className="card">
              <h3 className="section-title">準備法術</h3>
              <div className="space-y-3">
                {allCasters.map((cls, ci) => {
                  const classIdx    = classes.indexOf(cls)
                  const maxPrepared = getMaxPrepared(cls.className, cls.level)
                  const classData   = classDataMap.get(cls.className)
                  const knownCount  = classData?.summary.spellsKnownProgression?.[cls.level - 1]
                  const prepared    = spellSelections.filter(sp => sp.classIndex === classIdx && sp.spellLevel > 0)
                  const cantrips    = spellSelections.filter(sp => sp.classIndex === classIdx && sp.spellLevel === 0)

                  return (
                    <div key={ci}>
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-xs font-semibold text-gray-200">
                          {CLASS_NAME_ZH[cls.className] ?? cls.className}
                        </span>
                        {maxPrepared !== null ? (
                          <span className="text-xs text-dnd-gold">準備上限 {maxPrepared}</span>
                        ) : knownCount !== undefined ? (
                          <span className="text-xs text-dnd-gold">已知 {knownCount} 個</span>
                        ) : null}
                        {cantrips.length > 0 && (
                          <span className="text-xs text-gray-500">戲法 {cantrips.length}</span>
                        )}
                      </div>
                      {prepared.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-1">
                          {prepared.map(sp => (
                            <span key={sp.spellName} className="tag text-xs">{sp.spellName}</span>
                          ))}
                        </div>
                      )}
                      {cantrips.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {cantrips.map(sp => (
                            <span key={sp.spellName} className="tag text-xs opacity-60">
                              {sp.spellName} ★
                            </span>
                          ))}
                        </div>
                      )}
                      {prepared.length === 0 && cantrips.length === 0 && (
                        <div className="text-xs text-gray-600">（尚未選擇法術）</div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 匯出 */}
          <div className="card">
            <h3 className="section-title">匯出角色</h3>
            <p className="text-sm text-gray-400 mb-4">將角色資訊儲存為 JSON 檔案，可日後使用或分享。</p>
            <div className="flex gap-3">
              <button onClick={exportCharacter} className="btn-gold flex-1">⬇ 下載 JSON</button>
              <button onClick={() => window.print()} className="btn-secondary flex-1">🖨 列印</button>
            </div>
          </div>

          {/* 完成提示 */}
          {characterName && classes.length > 0 && (
            <div className="card border-dnd-gold/50 bg-dnd-gold/5 text-center py-4">
              <div className="text-3xl mb-2">🎉</div>
              <p className="text-dnd-gold font-bold">{characterName} 已就緒！</p>
              <p className="text-gray-400 text-sm mt-1">願你的冒險充滿傳奇！</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

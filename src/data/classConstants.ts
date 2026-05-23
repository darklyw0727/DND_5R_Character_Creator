// 職業相關常數

// XPHB 中文職業名稱對應
export const CLASS_NAME_ZH: Record<string, string> = {
  Barbarian: '野蠻人',
  Bard:      '吟遊詩人',
  Cleric:    '牧師',
  Druid:     '德魯伊',
  Fighter:   '戰士',
  Monk:      '武僧',
  Paladin:   '聖武士',
  Ranger:    '遊俠',
  Rogue:     '盜賊',
  Sorcerer:  '術士',
  Warlock:   '魔契者',
  Wizard:    '法師',
}

// 施法職業（有 casterProgression）
export const CASTING_CLASSES = new Set([
  'Bard', 'Cleric', 'Druid', 'Paladin', 'Ranger',
  'Sorcerer', 'Warlock', 'Wizard',
])

// 部分施法（透過子職業）
export const PARTIAL_CASTING_SUBCLASSES = new Set([
  'Eldritch Knight',   // Fighter
  'Arcane Trickster',  // Rogue
])

// 職業縮寫（用於 Badge）
export const CLASS_ABBREVIATION: Record<string, string> = {
  Barbarian: 'BBN', Bard: 'BRD', Cleric: 'CLR', Druid: 'DRU',
  Fighter: 'FTR', Monk: 'MNK', Paladin: 'PAL', Ranger: 'RNG',
  Rogue: 'ROG', Sorcerer: 'SOR', Warlock: 'WLK', Wizard: 'WIZ',
}

// 職業主色（用於視覺區分）
export const CLASS_COLOR: Record<string, string> = {
  Barbarian: '#c0392b', Bard:    '#8e44ad', Cleric:  '#e67e22',
  Druid:     '#27ae60', Fighter: '#2980b9', Monk:    '#16a085',
  Paladin:   '#f1c40f', Ranger:  '#1abc9c', Rogue:   '#2c3e50',
  Sorcerer:  '#e74c3c', Warlock: '#6c3483', Wizard:  '#2471a3',
}

// 職業檔案名稱對應（用於 dataLoader）
export const CLASS_FILE: Record<string, string> = {
  Barbarian: 'class-barbarian.json', Bard:    'class-bard.json',
  Cleric:    'class-cleric.json',    Druid:   'class-druid.json',
  Fighter:   'class-fighter.json',   Monk:    'class-monk.json',
  Paladin:   'class-paladin.json',   Ranger:  'class-ranger.json',
  Rogue:     'class-rogue.json',     Sorcerer:'class-sorcerer.json',
  Warlock:   'class-warlock.json',   Wizard:  'class-wizard.json',
}

export const ALL_CLASSES = Object.keys(CLASS_NAME_ZH)

// 技能中文標籤
export const SKILL_LABEL_ZH: Record<string, string> = {
  acrobatics:      'Acrobatics（特技）',
  animalHandling:  'Animal Handling（馴獸）',
  arcana:          'Arcana（奧秘）',
  athletics:       'Athletics（運動）',
  deception:       'Deception（欺瞞）',
  history:         'History（歷史）',
  insight:         'Insight（看破）',
  intimidation:    'Intimidation（威嚇）',
  investigation:   'Investigation（調查）',
  medicine:        'Medicine（醫療）',
  nature:          'Nature（自然）',
  perception:      'Perception（察覺）',
  performance:     'Performance（表演）',
  persuasion:      'Persuasion（說服）',
  religion:        'Religion（宗教）',
  sleightOfHand:   'Sleight of Hand（手法）',
  'sleight of hand': 'Sleight of Hand（手法）',
  stealth:         'Stealth（隱匿）',
  survival:        'Survival（求生）',
}

// 資料載入服務：按需 fetch JSON，以 Map 快取避免重複請求

const BASE = import.meta.env.BASE_URL

const cache = new Map<string, Promise<unknown>>()

export function loadJson<T>(path: string): Promise<T> {
  const url = `${BASE}data/${path}`
  if (!cache.has(url)) {
    cache.set(url, fetch(url).then(r => {
      if (!r.ok) throw new Error(`Failed to load ${url}: ${r.statusText}`)
      return r.json()
    }))
  }
  return cache.get(url) as Promise<T>
}

export const CLASS_FILES = [
  'class-barbarian.json',
  'class-bard.json',
  'class-cleric.json',
  'class-druid.json',
  'class-fighter.json',
  'class-monk.json',
  'class-paladin.json',
  'class-ranger.json',
  'class-rogue.json',
  'class-sorcerer.json',
  'class-warlock.json',
  'class-wizard.json',
]

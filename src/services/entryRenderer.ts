// 清除 5etools 行內標記，回傳純文字
// 格式：{@tag content|source|display} → 取最後欄位或第一欄位
export function stripMarkup(text: string): string {
  return text
    .replace(/\{@(\w+) ([^}]*)\}/g, (_full, tag: string, content: string) => {
      const parts = content.split('|')
      switch (tag) {
        // 文字格式標記 — 直接回傳內容
        case 'b': case 'bold':
        case 'i': case 'italic':
        case 'u': case 's': case 'strike':
        case 'sup': case 'sub':
        case 'highlight': case 'note':
        case 'color': case 'style': case 'indented':
          return parts[0]
        // 連結/參考 — 回傳第一欄位
        case 'filter':
        case 'link':
        case 'book':
        case 'footnote':
          return parts[0]
        // 骰子 — 回傳骰式
        case 'dice': case 'damage':
        case 'scaledice': case 'scaledamage':
          return parts[0]
        // 特殊標記
        case 'h':       return 'Hit: '
        case 'hit':     return parseInt(parts[0]) >= 0 ? `+${parts[0]}` : parts[0]
        case 'dc':      return `DC ${parts[0]}`
        case 'chance':  return `${parts[0]}%`
        case 'recharge':
          return parts[0] ? `（充能 ${parts[0]}–6）` : '（充能 6）'
        case 'atk':     return ''  // 跳過攻擊類型圖示
        // 一般 tag：name|source[|display] — 優先顯示最後欄位
        default:
          return parts.length >= 3 ? parts[2] : parts[0]
      }
    })
    .trim()
}

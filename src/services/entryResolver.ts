// 解析 5etools {@tag ...} inline 格式為純文字

const TAG_RE = /\{@(\w+)\s+([^}]*)\}/g

// 5etools entity ref format: name|source|display-text
// display is parts[2] if present, else parts[0] (never parts[1] which is the source)
function entityDisplay(parts: string[]): string {
  return (parts.length >= 3 ? parts[2] : parts[0]) ?? ''
}

export function resolveInlineTag(tag: string, content: string): string {
  const parts = content.split('|')

  switch (tag) {
    case 'b':
    case 'bold':
      return parts[0]
    case 'i':
    case 'italic':
      return parts[0]
    case 'damage':
    case 'dice':
    case 'scaledice':
    case 'scaledamage':
      return parts[0]
    case 'dc':
      return `DC ${parts[0]}`
    case 'condition':
    case 'status':
    case 'spell':
    case 'item':
    case 'feat':
    case 'action':
    case 'variantrule':
    case 'sense':
    case 'skill':
    case 'creature':
    case 'race':
    case 'class':
    case 'background':
    case 'table':
    case 'adventure':
    case 'book':
      return entityDisplay(parts)
    case 'filter':
      return parts[0]
    case 'atk':
      return parts[0]
    case 'h':
      return ''
    case '5etools':
      return parts[0]
    case 'note':
      return `[${parts[0]}]`
    case 'recharge':
      return `(Recharge ${parts[0] ?? '5–6'})`
    case 'coinflip':
      return '[coin flip]'
    default:
      return entityDisplay(parts)
  }
}

export function resolveText(text: string): string {
  return text.replace(TAG_RE, (_, tag, content) => resolveInlineTag(tag, content))
}

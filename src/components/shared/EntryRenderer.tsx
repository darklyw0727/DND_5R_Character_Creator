import type { Entry, EntryList, EntryTable, EntryOptions } from '../../types/5etools'
import { resolveText } from '../../services/entryResolver'

interface Props {
  entries: Entry[]
  mode?: 'display' | 'interactive'
  depth?: number
  onOptionSelected?: (featureName: string, selected: string) => void
  className?: string
}

export default function EntryRenderer({ entries, mode = 'display', depth = 0, className }: Props) {
  return (
    <div className={className}>
      {entries.map((entry, i) => (
        <RenderEntry key={i} entry={entry} mode={mode} depth={depth} />
      ))}
    </div>
  )
}

function RenderEntry({ entry, mode, depth }: { entry: Entry; mode: string; depth: number }) {
  if (typeof entry === 'string') {
    return <p className="mb-2 leading-relaxed text-gray-300">{renderText(entry)}</p>
  }

  if (!entry || typeof entry !== 'object') return null

  const e = entry as unknown as Record<string, unknown>

  switch (e.type) {
    case 'entries': {
      const name = e.name as string | undefined
      const subEntries = (e.entries as Entry[]) ?? []
      const HeadingTag = (['h3','h4','h5'] as const)[Math.min(depth, 2)]
      return (
        <div className="mb-3">
          {name && (
            <HeadingTag className="font-bold text-parchment-300 mb-1">
              {name}
            </HeadingTag>
          )}
          {subEntries.map((sub, i) => (
            <RenderEntry key={i} entry={sub} mode={mode} depth={depth + 1} />
          ))}
        </div>
      )
    }

    case 'list': {
      const list = entry as EntryList
      return (
        <ul className="list-disc list-inside mb-3 space-y-1 text-gray-300 ml-2">
          {list.items.map((item, i) => (
            <li key={i}>
              {typeof item === 'string'
                ? renderText(item)
                : 'name' in (item as object)
                  ? <><strong className="text-gray-200">{(item as {name: string}).name}:</strong>{' '}
                    {renderText((item as {entry?: string}).entry ?? '')}</>
                  : <RenderEntry entry={item as Entry} mode={mode} depth={depth} />
              }
            </li>
          ))}
        </ul>
      )
    }

    case 'table': {
      const tbl = entry as EntryTable
      return (
        <div className="mb-3 overflow-x-auto">
          {tbl.caption && <p className="text-sm font-semibold text-dnd-gold mb-1">{tbl.caption}</p>}
          <table className="text-sm w-full border-collapse">
            <thead>
              <tr className="bg-dnd-dark">
                {tbl.colLabels.map((col, i) => (
                  <th key={i} className="border border-dnd-border px-2 py-1 text-left text-parchment-300">
                    {renderText(col)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tbl.rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? 'bg-dnd-card' : 'bg-dnd-dark'}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="border border-dnd-border px-2 py-1 text-gray-300">
                      {typeof cell === 'string'
                        ? renderText(cell)
                        : typeof cell === 'number'
                          ? cell
                          : cell && typeof cell === 'object' && 'value' in cell
                            ? `+${(cell as {value: number}).value}`
                            : '—'
                      }
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    case 'options': {
      const opts = entry as EntryOptions
      return (
        <div className="mb-3 pl-3 border-l-2 border-dnd-gold/40">
          <p className="text-sm text-dnd-gold mb-2">
            選擇 {opts.count ?? 1} 個選項：
          </p>
          {opts.entries.map((opt, i) => (
            <div key={i} className="mb-2">
              <RenderEntry entry={opt} mode={mode} depth={depth + 1} />
            </div>
          ))}
        </div>
      )
    }

    case 'item': {
      const name = e.name as string
      const entryText = (e.entry as string) ?? ''
      const subEntries = (e.entries as Entry[]) ?? []
      return (
        <div className="mb-2 text-gray-300">
          <strong className="text-gray-200">{name}. </strong>
          {entryText ? renderText(entryText) : null}
          {subEntries.map((sub, i) => (
            <RenderEntry key={i} entry={sub} mode={mode} depth={depth + 1} />
          ))}
        </div>
      )
    }

    case 'inset': {
      const name = e.name as string | undefined
      const subEntries = (e.entries as Entry[]) ?? []
      return (
        <div className="mb-3 p-3 border border-dnd-gold/30 rounded bg-dnd-dark/50">
          {name && <p className="font-bold text-dnd-gold mb-1">{name}</p>}
          {subEntries.map((sub, i) => (
            <RenderEntry key={i} entry={sub} mode={mode} depth={depth + 1} />
          ))}
        </div>
      )
    }

    case 'quote': {
      const lines = (e.entries as string[]) ?? []
      const by = e.by as string | undefined
      return (
        <blockquote className="mb-3 pl-3 border-l-2 border-gray-500 italic text-gray-400">
          {lines.map((line, i) => <p key={i}>{line}</p>)}
          {by && <footer className="text-xs text-gray-500 mt-1">— {by}</footer>}
        </blockquote>
      )
    }

    case 'abilityDc':
    case 'abilityAttackMod': {
      const name = e.name as string
      const attrs = (e.attributes as string[]) ?? []
      return (
        <p className="mb-2 text-gray-300">
          <strong className="text-gray-200">{name}: </strong>
          {attrs.map(a => a.toUpperCase()).join(' or ')} modifier
        </p>
      )
    }

    default:
      return null
  }
}

// 行內文字渲染（解析 {@tag}）
function renderText(text: string): React.ReactNode {
  const resolved = resolveText(text)
  // 簡單樸素：直接返回解析後文字
  // 若需要更豐富的行內標記，這裡可以擴充為 JSX
  return resolved
}

import type { Entry, EntryItem } from '../../types/5etools'
import { stripMarkup } from '../../services/entryRenderer'

// ── 遞迴 Entry 渲染器 ───────────────────────────────────────────────────────

export function EntryBlock({ entries }: { entries: Entry[] }) {
  return (
    <div className="space-y-1.5">
      {entries.map((entry, i) => <EntryNode key={i} entry={entry} />)}
    </div>
  )
}

function EntryNode({ entry }: { entry: Entry }) {
  // ── 純文字 ──────────────────────────────────────────────────────────────
  if (typeof entry === 'string') {
    const text = stripMarkup(entry)
    if (!text) return null
    return <p className="text-gray-300 text-xs leading-relaxed">{text}</p>
  }

  // ── entries / inset ────────────────────────────────────────────────────
  if (entry.type === 'entries' || entry.type === 'inset') {
    return (
      <div className={entry.type === 'inset' ? 'pl-2 border-l border-dnd-border' : ''}>
        {entry.name && (
          <div className="text-[11px] font-semibold text-gray-200 mt-1.5 mb-0.5">
            {entry.name}
          </div>
        )}
        <EntryBlock entries={entry.entries} />
      </div>
    )
  }

  // ── options ────────────────────────────────────────────────────────────
  if (entry.type === 'options') {
    return (
      <div>
        {entry.count !== undefined && (
          <div className="text-[11px] text-gray-500 mb-0.5">選擇 {entry.count} 項：</div>
        )}
        <EntryBlock entries={entry.entries} />
      </div>
    )
  }

  // ── list ───────────────────────────────────────────────────────────────
  if (entry.type === 'list') {
    return (
      <ul className="space-y-0.5 text-xs text-gray-300">
        {(entry.items as (string | EntryItem | Entry)[]).map((item, i) => {
          if (typeof item === 'string') {
            return (
              <li key={i} className="flex gap-1.5">
                <span className="text-gray-600 flex-shrink-0 mt-0.5">•</span>
                <span>{stripMarkup(item)}</span>
              </li>
            )
          }
          if (typeof item === 'object' && (item as { type?: string }).type === 'item') {
            const it = item as EntryItem
            return (
              <li key={i} className="flex gap-1.5">
                <span className="text-gray-600 flex-shrink-0 mt-0.5">•</span>
                <span>
                  {it.name && (
                    <span className="font-semibold text-gray-200">{it.name}. </span>
                  )}
                  {it.entry
                    ? stripMarkup(it.entry)
                    : it.entries
                      ? <EntryBlock entries={it.entries} />
                      : null}
                </span>
              </li>
            )
          }
          // 其他巢狀 entry
          return (
            <li key={i} className="flex gap-1.5">
              <span className="text-gray-600 flex-shrink-0 mt-0.5">•</span>
              <span><EntryNode entry={item as Entry} /></span>
            </li>
          )
        })}
      </ul>
    )
  }

  // ── quote ──────────────────────────────────────────────────────────────
  if (entry.type === 'quote') {
    return (
      <blockquote className="pl-2 border-l-2 border-dnd-gold/30 text-xs text-gray-500 italic">
        {entry.entries.map((e, i) => <p key={i}>{stripMarkup(e)}</p>)}
        {entry.by && <footer className="mt-0.5 not-italic text-gray-600">— {entry.by}</footer>}
      </blockquote>
    )
  }

  // ── abilityDc ──────────────────────────────────────────────────────────
  if (entry.type === 'abilityDc') {
    const attrs = entry.attributes.map(a => a.toUpperCase()).join(' / ')
    return (
      <p className="text-xs text-gray-300">
        <span className="font-semibold text-gray-200">{entry.name} DC</span>
        {' '}= 8 + 熟練加值 + {attrs} 調整值
      </p>
    )
  }

  // ── abilityAttackMod ───────────────────────────────────────────────────
  if (entry.type === 'abilityAttackMod') {
    const attrs = entry.attributes.map(a => a.toUpperCase()).join(' / ')
    return (
      <p className="text-xs text-gray-300">
        <span className="font-semibold text-gray-200">{entry.name}攻擊加值</span>
        {' '}= 熟練加值 + {attrs} 調整值
      </p>
    )
  }

  // ── table ──────────────────────────────────────────────────────────────
  if (entry.type === 'table') {
    return (
      <div className="overflow-x-auto my-1">
        {entry.caption && (
          <div className="text-[11px] text-gray-400 mb-1">{entry.caption}</div>
        )}
        <table className="text-xs text-gray-300 border-collapse w-full">
          <thead>
            <tr>
              {entry.colLabels.map((label, i) => (
                <th key={i} className="text-left px-2 py-0.5 text-gray-400 border-b border-dnd-border whitespace-nowrap">
                  {stripMarkup(label)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entry.rows.map((row, ri) => (
              <tr key={ri} className="odd:bg-dnd-dark/20">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-2 py-0.5 border-b border-dnd-border/30">
                    {typeof cell === 'string'
                      ? stripMarkup(cell)
                      : typeof cell === 'number'
                        ? cell
                        : cell !== null && typeof cell === 'object' && 'value' in cell
                          ? (cell as { value: number }).value
                          : '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  // refClassFeature / refSubclassFeature 為參考型別，略過
  return null
}

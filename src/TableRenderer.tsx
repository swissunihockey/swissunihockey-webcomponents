import type { SwissCell, SwissDropdownEntry, SwissRow, SwissTableResponse } from './types'

function normalizeText(value: unknown): string {
  if (Array.isArray(value)) return value.map(String).join(' ')
  if (value === undefined || value === null) return ''
  return String(value)
}

function cellText(cell: SwissCell): string {
  return normalizeText(cell.text ?? cell.value ?? '')
}

function cellHref(cell: SwissCell): string | undefined {
  return cell.url || cell.link?.url || cell.link?.href
}

const GAME_LINK_BASE = 'https://myapp.swissunihockey.ch/link/game/'

function extractGameId(value: unknown, seen = new WeakSet<object>()): string | undefined {
  if (!value) return undefined

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = extractGameId(item, seen)
      if (found) return found
    }
    return undefined
  }

  if (typeof value !== 'object') return undefined
  if (seen.has(value)) return undefined
  seen.add(value)

  const item = value as Record<string, unknown>

  const directGameId = item.game_id ?? item.gameId ?? item.gameID
  if (directGameId !== undefined && directGameId !== null) {
    return String(directGameId)
  }

  const link = item.link as Record<string, unknown> | undefined
  if (link) {
    const page = String(link.page ?? '')
    const resource = String(link.resource ?? '')
    const ids = link.ids

    if (
        (page.includes('game') || resource.includes('/games')) &&
        Array.isArray(ids) &&
        ids.length > 0
    ) {
      return String(ids[0])
    }
  }

  for (const child of Object.values(item)) {
    const nested = extractGameId(child, seen)
    if (nested) return nested
  }

  return undefined
}

function isGameLinkCell(cell: SwissCell): boolean {
  const text = cellText(cell)

  return (
      /\d{1,2}\.\d{1,2}\.\d{2,4}/.test(text) ||
      /\d{1,2}:\d{2}/.test(text) ||
      /\d+\s*[:–-]\s*\d+/.test(text)
  )
}

function normalizeImageUrl(value: unknown): string | undefined {
  const url = Array.isArray(value) ? value[0] : value
  if (typeof url !== 'string' || !url) return undefined

  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('//')) return `https:${url}`
  if (url.startsWith('/')) return `https://api-v2.swissunihockey.ch${url}`

  return `https://api-v2.swissunihockey.ch/${url}`
}

function cellImage(cell: SwissCell): string | undefined {
  const anyCell = cell as any

  if (typeof anyCell.image?.url === 'string') {
    return anyCell.image.url
  }

  if (typeof anyCell.image === 'string') {
    return anyCell.image
  }

  return undefined
}

function renderCell(cell: SwissCell, index: number, gameId?: string) {
  const text = cellText(cell)
  const href = isGameLinkCell(cell) && gameId
      ? `${GAME_LINK_BASE}${gameId}`
      : cellHref(cell)
  const image = cellImage(cell)

  const content = image ? (
      <span className="su-logo-cell">
    <img
        className="su-club-logo"
        src={image}
        alt=""
        loading="lazy"
    />
  </span>
  ) : (
      text
  )
  if (image) {
    console.log('LOGO FOUND', image)
  }
  return (
      <td
          key={index}
          className={cell.highlight ? 'is-highlight' : undefined}
          style={{ textAlign: cell.align as never }}
      >
        {href ? (
            <a href={href} target="_blank" rel="noreferrer">
              {content}
            </a>
        ) : (
            content
        )}
      </td>
  )
}

function renderRows(rows: SwissRow[] = []) {
  return rows.map((row, index) => {
    const gameId = extractGameId(row)

    return (
        <tr key={index} className={row.highlight ? 'is-highlight' : undefined}>
          {row.cells?.map((cell, cellIndex) => renderCell(cell, cellIndex, gameId))}
        </tr>
    )
  })
}

function DropdownEntry({ entry, level = 0 }: { entry: SwissDropdownEntry; level?: number }) {
  return (
      <li className={entry.highlight ? 'is-highlight' : undefined} style={{ paddingLeft: `${level * 14}px` }}>
        <span>{entry.text}</span>
        {entry.set_in_context && <code>{JSON.stringify(entry.set_in_context)}</code>}
        {entry.set_in_content && <code>{JSON.stringify(entry.set_in_content)}</code>}
        {!!entry.entries?.length && (
            <ul>
              {entry.entries.map((child, index) => (
                  <DropdownEntry key={index} entry={child} level={level + 1} />
              ))}
            </ul>
        )}
      </li>
  )
}

function renderAttributeValue(value: unknown) {
  const image = normalizeImageUrl(value)

  if (
      image &&
      image.match(/\.(png|jpg|jpeg|webp|gif|svg)(\?.*)?$/i)
  ) {
    return <img className="su-attribute-image" src={image} alt="" loading="lazy" />
  }

  if (typeof value === 'string' && value.startsWith('http')) {
    return <a href={value} target="_blank" rel="noreferrer">{value}</a>
  }

  if (Array.isArray(value)) {
    return value.map(String).join(' ')
  }

  if (typeof value === 'object' && value !== null) {
    const objectValue = value as Record<string, unknown>
    const nestedImage = normalizeImageUrl(
        objectValue.image ??
        objectValue.picture ??
        objectValue.photo ??
        objectValue.portrait ??
        objectValue.url ??
        objectValue.src,
    )

    if (nestedImage) {
      return <img className="su-attribute-image" src={nestedImage} alt="" loading="lazy" />
    }

    return <code>{JSON.stringify(value)}</code>
  }

  return String(value ?? '')
}

function AttributeList({ data }: { data: SwissTableResponse }) {
  const ignored = new Set(['type', 'subtype', 'title', 'subtitle'])
  const entries = Object.entries(data).filter(
      ([key, value]) => !ignored.has(key) && value !== undefined && value !== null && value !== '',
  )

  return (
      <dl className="su-attributes">
        {entries.map(([key, value]) => (
            <div key={key}>
              <dt>{key.replaceAll('_', ' ')}</dt>
              <dd>{renderAttributeValue(value)}</dd>
            </div>
        ))}
      </dl>
  )
}

export function TableRenderer({
                                data,
                                emptyText = 'Keine Daten gefunden.',
                                showTitle = true,
                              }: {
  data?: SwissTableResponse
  emptyText?: string
  showTitle?: boolean
}) {
  if (!data) return <p className="su-empty">{emptyText}</p>

  const regions = data.regions?.length ? data.regions : data.rows?.length ? [{ rows: data.rows }] : []
  const isDropdown = data.type === 'dropdown' || !!data.entries?.length
  const isAttributeList = data.subtype === 'attribute_list'

  return (
      <section className="su-card">
        {showTitle && (data.title || data.text) && <h3>{String(data.title || data.text)}</h3>}
        {data.subtitle && <p className="su-subtitle">{data.subtitle}</p>}

        {isDropdown && (
            <ul className="su-dropdown-list">
              {data.entries?.map((entry, index) => <DropdownEntry key={index} entry={entry} />)}
            </ul>
        )}

        {isAttributeList && <AttributeList data={data} />}

        {!isDropdown && !isAttributeList && regions.map((region, regionIndex) => (
            <div className="su-region" key={regionIndex}>
              {(region.title || region.text) && <h4>{region.title || region.text}</h4>}
              <div className="su-table-wrap">
                <table>
                  {!!data.headers?.length && (
                      <thead>
                      <tr>
                        {data.headers.map((header, index) => (
                            <th key={index} style={{ textAlign: header.align as never, width: header.width }}>
                              {header.text}
                            </th>
                        ))}
                      </tr>
                      </thead>
                  )}
                  <tbody>{renderRows(region.rows)}</tbody>
                </table>
              </div>
            </div>
        ))}

        {!isDropdown && !isAttributeList && !regions.length && <p className="su-empty">{emptyText}</p>}
      </section>
  )
}
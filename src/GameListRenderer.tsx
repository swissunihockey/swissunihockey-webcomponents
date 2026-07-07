import { useMemo, useState } from 'react'
import { TableRenderer } from './TableRenderer'
import type { SwissRow, SwissTableResponse } from './types'

function getCellText(row: SwissRow): string {
    return row.cells
        ?.map((cell) => String(cell.text ?? cell.value ?? ''))
        .join(' ') ?? ''
}

function getCellValue(cell: any): string {
    if (!cell) return ''

    return String(
        cell.text ??
        cell.value ??
        cell.long ??
        cell.short ??
        ''
    ).trim()
}

function getGameDate(row: SwissRow): Date | undefined {
    const text = getCellText(row)

    const swissDate = text.match(/(\d{1,2})\.(\d{1,2})\.(\d{2,4})/)
    if (swissDate) {
        const day = Number(swissDate[1])
        const month = Number(swissDate[2])
        let year = Number(swissDate[3])
        if (year < 100) year += 2000
        return new Date(year, month - 1, day)
    }

    const isoDate = text.match(/(\d{4})-(\d{2})-(\d{2})/)
    if (isoDate) {
        return new Date(Number(isoDate[1]), Number(isoDate[2]) - 1, Number(isoDate[3]))
    }

    return undefined
}

function startOfWeek(date: Date) {
    const copy = new Date(date)
    copy.setHours(0, 0, 0, 0)

    const day = copy.getDay()
    const diff = day === 0 ? -6 : 1 - day
    copy.setDate(copy.getDate() + diff)

    return copy
}

function addDays(date: Date, days: number) {
    const copy = new Date(date)
    copy.setDate(copy.getDate() + days)
    return copy
}

function formatDate(date: Date) {
    return date.toLocaleDateString('de-CH', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    })
}

function flattenRows(data?: SwissTableResponse) {
    if (!data) return []

    const rows =
        data.rows?.length
            ? data.rows
            : data.regions?.flatMap((region) => region.rows ?? []) ?? []

    return rows.filter((row) => {
        const text = getCellText(row).toLowerCase()
        return !text.includes('abgesagt')
    })
}

function cloneTableWithRows(data: SwissTableResponse, rows: SwissRow[], title?: string): SwissTableResponse {
    return {
        ...data,
        title: title ?? data.title,
        regions: [
            {
                title: undefined,
                rows,
            },
        ],
        rows: undefined,
    }
}

function sortRowsByDate(rows: SwissRow[]) {
    return [...rows].sort((a, b) => {
        const dateA = getGameDate(a)?.getTime() ?? 0
        const dateB = getGameDate(b)?.getTime() ?? 0
        return dateA - dateB
    })
}

function withoutHighlights(row: SwissRow): SwissRow {
    return {
        ...row,
        highlight: false,
        cells: row.cells?.map((cell) => ({ ...cell, highlight: false })),
    }
}

export function ClubGamesWeekRenderer({ data }: { data?: SwissTableResponse }) {
    const [weekOffset, setWeekOffset] = useState(0)

    const weekStart = useMemo(() => {
        const currentWeek = startOfWeek(new Date())
        return addDays(currentWeek, weekOffset * 7)
    }, [weekOffset])

    const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart])

    const rows = useMemo(() => {
        return sortRowsByDate(flattenRows(data)).filter((row) => {
            const date = getGameDate(row)
            if (!date) return false

            const normalized = new Date(date)
            normalized.setHours(0, 0, 0, 0)

            return normalized >= weekStart && normalized <= weekEnd
        })
    }, [data, weekStart, weekEnd])

    const tableData = useMemo(() => {
        if (!data) return undefined

        return cloneTableWithRows(
            data,
            rows.map(withoutHighlights),
            data.title ?? 'Clubspiele',
        )
    }, [data, rows, weekStart, weekEnd])

    return (
        <div>
            <div className="su-controls">
                <button type="button" onClick={() => setWeekOffset((value) => value - 1)}>
                    ← Letzte Woche
                </button>

                <span>
          {formatDate(weekStart)} – {formatDate(weekEnd)}
        </span>

                <button type="button" onClick={() => setWeekOffset((value) => value + 1)}>
                    Nächste Woche →
                </button>
            </div>

            <TableRenderer data={tableData} emptyText="Keine Spiele in dieser Woche gefunden." />
        </div>
    )
}

export function TeamGamesPagerRenderer({
                                           data,
                                           pageSize = 10,
                                           showTitle = true,
                                       }: {
    data?: SwissTableResponse
    pageSize?: number
    showTitle?: boolean
}) {
    const sortedRows = useMemo(() => sortRowsByDate(flattenRows(data)), [data])

    const initialStart = useMemo(() => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const nextGameIndex = sortedRows.findIndex((row) => {
            const date = getGameDate(row)
            if (!date) return false

            date.setHours(0, 0, 0, 0)
            return date >= today
        })

        if (nextGameIndex === -1) {
            return Math.max(0, sortedRows.length - pageSize)
        }

        return Math.max(0, nextGameIndex - Math.floor(pageSize / 2))
    }, [sortedRows, pageSize])

    const [pageStart, setPageStart] = useState(initialStart)

    const safePageStart = Math.min(Math.max(pageStart, 0), Math.max(0, sortedRows.length - pageSize))
    const visibleRows = sortedRows.slice(safePageStart, safePageStart + pageSize)

    const tableData = useMemo(() => {
        if (!data) return undefined

        return cloneTableWithRows(
            data,
            visibleRows.map(withoutHighlights),
            data.title ?? 'Teamspiele',
        )
    }, [data, visibleRows, safePageStart, pageSize, sortedRows.length])

    return (
        <div>
            <div className="su-controls">
                <button
                    type="button"
                    disabled={safePageStart <= 0}
                    onClick={() => setPageStart((value) => Math.max(0, value - pageSize))}
                >
                    ← Frühere Spiele
                </button>

                <span>
          {sortedRows.length ? `${safePageStart + 1}–${Math.min(safePageStart + pageSize, sortedRows.length)}` : '0'}
                    {' '}von {sortedRows.length}
        </span>

                <button
                    type="button"
                    disabled={safePageStart + pageSize >= sortedRows.length}
                    onClick={() => setPageStart((value) => Math.min(sortedRows.length - pageSize, value + pageSize))}
                >
                    Weitere Spiele →
                </button>
            </div>

            <TableRenderer
                data={tableData}
                emptyText="Keine Teamspiele gefunden."
                showTitle={showTitle}
            />
        </div>
    )
}

function findHeaderIndex(data: SwissTableResponse | undefined, names: string[]) {
    if (!data?.headers?.length) return -1

    return data.headers.findIndex((header) => {
        const text = String(header.text ?? '').toLowerCase()
        return names.some((name) => text.includes(name))
    })
}

type PlayoffPairGroup = {
    key: string
    title: string
    rows: SwissRow[]
}

function buildPlayoffPairGroups(data?: SwissTableResponse): PlayoffPairGroup[] {
    const rows = sortRowsByDate(flattenRows(data))
    const homeIndex = findHeaderIndex(data, ['heimteam', 'heim'])
    const awayIndex = findHeaderIndex(data, ['gastteam', 'gast'])

    if (homeIndex < 0 || awayIndex < 0) return []

    const groups = new Map<string, PlayoffPairGroup>()

    rows.forEach((row) => {
        const homeTeam = getCellValue(row.cells?.[homeIndex])
        const awayTeam = getCellValue(row.cells?.[awayIndex])

        if (!homeTeam || !awayTeam) return

        const normalized = [homeTeam, awayTeam]
            .sort((a, b) => a.localeCompare(b, 'de-CH'))
            .join('::')

        const existing = groups.get(normalized)

        if (existing) {
            existing.rows.push(row)
            return
        }

        groups.set(normalized, {
            key: normalized,
            title: `${homeTeam} – ${awayTeam}`,
            rows: [row],
        })
    })

    return [...groups.values()].filter((group) => group.rows.length > 1)
}

export function PlayoffGamesAccordionRenderer({
                                                  data,
                                              }: {
    data?: SwissTableResponse
}) {
    const groups = useMemo(() => buildPlayoffPairGroups(data), [data])

    if (!data || groups.length === 0) {
        return (
            <TableRenderer
                data={data}
                emptyText="Keine Spiele gefunden."
            />
        )
    }

    return (
        <section className="su-card su-playoff-card">
            {data.title && <h3>{data.title}</h3>}
            {data.subtitle && <p className="su-subtitle">{data.subtitle}</p>}

            <div className="su-playoff-groups">
                {groups.map((group, index) => (
                    <details className="su-playoff-group" key={group.key} open={index === 0}>
                        <summary>
                            <span>{group.title}</span>
                            <small>{group.rows.length} Spiele</small>
                        </summary>

                        <TableRenderer
                            data={cloneTableWithRows(data, group.rows.map(withoutHighlights), undefined)}
                            emptyText="Keine Spiele gefunden."
                            showTitle={false}
                        />
                    </details>
                ))}
            </div>
        </section>
    )
}
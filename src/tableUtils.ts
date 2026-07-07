import type { SwissRow, SwissTableResponse } from './types'

export function getRows(data?: SwissTableResponse): SwissRow[] {
    if (!data) return []
    if (data.rows?.length) return data.rows
    return data.regions?.flatMap((region) => region.rows ?? []) ?? []
}

export function mergeTablePages(pages: SwissTableResponse[]): SwissTableResponse | undefined {
    if (!pages.length) return undefined

    const first = pages[0]
    const allRows = pages.flatMap((page) => getRows(page))

    return {
        ...first,
        regions: [
            {
                title: undefined,
                rows: allRows,
            },
        ],
        rows: undefined,
    }
}
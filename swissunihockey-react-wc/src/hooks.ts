import { useEffect, useState } from 'react'
import { type QueryValue } from './api'
import type { SwissTableResponse } from './types'
import { getRows, mergeTablePages } from './tableUtils'
//const SWISSUNIHOCKEY_API_BASE = '/wp-json/swissunihockey/v1/proxy'
const SWISSUNIHOCKEY_API_BASE = 'https://wc.swissunihockey.ch'
function buildSwissApiUrl(endpoint: string, params: Record<string, QueryValue>) {
  const cleanEndpoint = endpoint.replace(/^\/+/, '')
  const url = new URL(`${SWISSUNIHOCKEY_API_BASE}/${cleanEndpoint}`)

  Object.entries(params).forEach(([name, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(name, String(value))
    }
  })

  return url
}

export function useSwissData<T>(
    endpoint: string,
    params: Record<string, QueryValue>,
    enabled = true,
) {
  const [data, setData] = useState<T>()
  const [error, setError] = useState<string>()
  const key = JSON.stringify([endpoint, params, enabled])

  useEffect(() => {
    if (!enabled) {
      //setData(undefined)
      //setError(undefined)
      return
    }

    const controller = new AbortController()
    //setData(undefined)
    //setError(undefined)

    const url = buildSwissApiUrl(endpoint, params)

    fetch(url.toString(), {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Swiss Unihockey API Fehler ${response.status}`)
          }

          return response.json()
        })
        .then((json) => {
          setData((json.data ?? json) as T)
        })
        .catch((err: Error) => {
          if (err.name !== 'AbortError') {
            setError(err.message)
          }
        })

    return () => controller.abort()
  }, [key])

  return { data, error }
}

function getText(value: unknown): string {
  if (!value || typeof value !== 'object') return ''
  const item = value as Record<string, unknown>

  return String(
      item.text ??
      item.label ??
      item.title ??
      item.name ??
      '',
  ).toLowerCase()
}

function getParamsFromCandidate(value: unknown): Record<string, QueryValue> | undefined {
  if (!value || typeof value !== 'object') return undefined

  const item = value as Record<string, unknown>

  const direct =
      item.set_in_context ??
      item.set_in_content ??
      item.params ??
      item.parameters ??
      item.context

  if (direct && typeof direct === 'object') {
    return direct as Record<string, QueryValue>
  }

  const link = item.link
  if (link && typeof link === 'object') {
    return getParamsFromCandidate(link)
  }

  return undefined
}

function findNextParamsRecursive(value: unknown): Record<string, QueryValue> | undefined {
  if (!value || typeof value !== 'object') return undefined

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findNextParamsRecursive(item)
      if (found) return found
    }

    return undefined
  }

  const item = value as Record<string, unknown>
  const text = getText(item)

  const isNext =
      text.includes('next') ||
      text.includes('weiter') ||
      text.includes('näch') ||
      text.includes('>') ||
      text.includes('»')

  if (isNext) {
    const params = getParamsFromCandidate(item)
    if (params) return params
  }

  for (const child of Object.values(item)) {
    const found = findNextParamsRecursive(child)
    if (found) return found
  }

  return undefined
}

function extractNextParams(rawJson: unknown, pageData: SwissTableResponse): Record<string, QueryValue> | undefined {
  return (
      findNextParamsRecursive(pageData.slider) ??
      findNextParamsRecursive(pageData) ??
      findNextParamsRecursive(rawJson)
  )
}

export function useSwissPaginatedTable(
    endpoint: string,
    params: Record<string, QueryValue>,
    enabled = true,
) {
  const [data, setData] = useState<SwissTableResponse>()
  const [error, setError] = useState<string>()
  const key = JSON.stringify([endpoint, params, enabled])

  useEffect(() => {
    if (!enabled) return

    const controller = new AbortController()

    async function fetchContext(extraParams: Record<string, QueryValue> = {}) {
      const url = buildSwissApiUrl(endpoint, {
        ...params,
        ...extraParams,
      })

      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      })

      if (!response.ok) {
        throw new Error(`Swiss Unihockey API Fehler ${response.status}`)
      }

      const json = await response.json()
      return (json.data ?? json) as SwissTableResponse
    }

    function getSliderParams(
        pageData: SwissTableResponse,
        direction: 'prev' | 'next',
    ): Record<string, QueryValue> | undefined {
      const slider = pageData.slider as any
      const params = slider?.[direction]?.set_in_context

      if (!params || typeof params !== 'object') {
        return undefined
      }

      return params as Record<string, QueryValue>
    }

    async function loadAllPages() {
      setData(undefined)
      setError(undefined)

      const pages: SwissTableResponse[] = []
      const seen = new Set<string>()

      const firstPage = await fetchContext()
      pages.push(firstPage)

      async function loadDirection(
          startParams: Record<string, QueryValue> | undefined,
          direction: 'prev' | 'next',
      ) {
        let currentParams = startParams

        for (let i = 0; i < 50; i++) {
          if (!currentParams) break

          const seenKey = JSON.stringify(currentParams)
          if (seen.has(seenKey)) break
          seen.add(seenKey)

          const pageData = await fetchContext(currentParams)
          const rows = getRows(pageData)

          if (!rows.length) break

          if (direction === 'prev') {
            pages.unshift(pageData)
          } else {
            pages.push(pageData)
          }

          currentParams = getSliderParams(pageData, direction)
        }
      }

      await loadDirection(getSliderParams(firstPage, 'prev'), 'prev')
      await loadDirection(getSliderParams(firstPage, 'next'), 'next')

      setData(mergeTablePages(pages))
    }

    loadAllPages().catch((err: Error) => {
      if (err.name !== 'AbortError') {
        setError(err.message)
      }
    })

    return () => controller.abort()
  }, [key])

  return { data, error }
}
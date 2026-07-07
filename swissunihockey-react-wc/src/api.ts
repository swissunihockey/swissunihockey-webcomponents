export const API_BASE = 'https://wc.swissunihockey.ch/'

export type QueryValue = string | number | boolean | undefined | null

export async function fetchSwissUnihockey<T>(
  endpoint: string,
  params: Record<string, QueryValue> = {},
): Promise<T> {
  const url = new URL(`${API_BASE}${endpoint}`)

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value))
    }
  })

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Swiss Unihockey API Fehler ${response.status}`)
  }

  return response.json() as Promise<T>
}

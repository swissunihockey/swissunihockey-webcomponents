export type SwissCell = {
  text?: string | number
  value?: string | number
  image?: string
  url?: string
  link?: {
    url?: string
    href?: string
    type?: string
    page?: string
    ids?: Array<string | number>
  }
  align?: string
  width?: string | number
  highlight?: boolean
}

export type SwissRow = {
  cells?: SwissCell[]
  highlight?: boolean
}

export type SwissHeader = {
  text?: string
  align?: string
  width?: string | number
}

export type SwissRegion = {
  title?: string
  text?: string
  rows?: SwissRow[]
}

export type SwissTableResponse = {
  type?: string
  subtype?: string
  title?: string
  subtitle?: string
  headers?: SwissHeader[]
  regions?: SwissRegion[]
  rows?: SwissRow[]
  entries?: SwissDropdownEntry[]
  text?: string
  attributes?: Record<string, unknown>
  [key: string]: unknown
  slider?: {
    next?: {
      set_in_context?: {
        page?: number
      }
    }
    prev?: {
      set_in_context?: {
        page?: number
      }
    }
  }
}

export type SwissDropdownEntry = {
  text?: string
  highlight?: boolean
  set_in_context?: Record<string, string | number | boolean>
  set_in_content?: Record<string, string | number | boolean>
  entries?: SwissDropdownEntry[]
}

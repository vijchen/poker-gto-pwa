import type { HandAction } from '@/types/poker'

export type RangeMap = Record<string, Record<string, HandAction>>

type RangeModule = {
  default: unknown
}

function createRangeLoader(loader: () => Promise<RangeModule>) {
  let cachedData: RangeMap | null = null
  let cachedPromise: Promise<RangeMap> | null = null

  return async function load(): Promise<RangeMap> {
    if (cachedData) return cachedData

    if (!cachedPromise) {
      cachedPromise = loader().then((module) => {
        cachedData = module.default as RangeMap
        return cachedData
      })
    }

    return cachedPromise
  }
}

export const loadOpenRanges = createRangeLoader(() => import('./open.json'))
export const loadVs3betRanges = createRangeLoader(() => import('./vs-3bet.json'))
export const loadVsOpenRanges = createRangeLoader(() => import('./vs-open.json'))

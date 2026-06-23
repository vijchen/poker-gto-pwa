import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

const STORAGE_KEY = 'poker-gto-profit-log'

export type ProfitEntryType = 'income' | 'expense'
export type ProfitEntryMode = 'cashflow' | 'session'
export type TrendMode = 'day' | 'month' | 'year'

interface BaseEntry {
  id: string
  date: string
  note: string
  createdAt: string
}

export interface CashflowEntry extends BaseEntry {
  mode: 'cashflow'
  type: ProfitEntryType
  amount: number
}

export interface SessionEntry extends BaseEntry {
  mode: 'session'
  result: number
}

export type ProfitEntry = CashflowEntry | SessionEntry

interface LegacyProfitEntry {
  id?: string
  date?: string
  type?: ProfitEntryType
  amount?: number
  note?: string
  createdAt?: string
}

interface ProfitStats {
  netProfit: number
  currentYearNet: number
  currentMonthNet: number
  recent7DaysNet: number
  recordCount: number
  positiveCount: number
  negativeCount: number
  averagePerRecord: number
}

export interface TrendPoint {
  label: string
  value: number
}

export interface YearlySummary {
  year: string
  netProfit: number
  recordCount: number
  averagePerRecord: number
  positiveCount: number
  negativeCount: number
}

export type YearFilter = 'all' | string

function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatMonth(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function getEntryNet(entry: ProfitEntry): number {
  if (entry.mode === 'session') return entry.result
  return entry.type === 'income' ? entry.amount : -entry.amount
}

function normalizeEntry(raw: unknown): ProfitEntry | null {
  if (!raw || typeof raw !== 'object') return null

  const data = raw as Partial<ProfitEntry & LegacyProfitEntry>
  const createdAt = typeof data.createdAt === 'string' ? data.createdAt : new Date().toISOString()
  const date = typeof data.date === 'string' ? data.date : formatLocalDate(new Date())
  const note = typeof data.note === 'string' ? data.note : ''
  const id = typeof data.id === 'string' ? data.id : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  if (data.mode === 'session' && isFiniteNumber(data.result)) {
    return {
      id,
      date,
      note,
      createdAt,
      mode: 'session',
      result: Math.round(data.result * 100) / 100
    }
  }

  if ((data.mode === 'cashflow' || !data.mode) && (data.type === 'income' || data.type === 'expense') && isFiniteNumber(data.amount)) {
    return {
      id,
      date,
      note,
      createdAt,
      mode: 'cashflow',
      type: data.type,
      amount: Math.round(data.amount * 100) / 100
    }
  }

  return null
}

export const useProfitStore = defineStore('profit', () => {
  const entries = ref<ProfitEntry[]>([])

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return
      entries.value = parsed.map(normalizeEntry).filter((item): item is ProfitEntry => item !== null)
    } catch {
      entries.value = []
    }
  }

  function save() {
    if (entries.value.length === 0) {
      localStorage.removeItem(STORAGE_KEY)
      return
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.value))
  }

  load()
  watch(entries, save, { deep: true })

  const sortedEntries = computed(() => [...entries.value].sort((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date)
    return b.createdAt.localeCompare(a.createdAt)
  }))

  const availableYears = computed(() => {
    const years = new Set(entries.value.map(entry => entry.date.slice(0, 4)))
    return [...years].sort((a, b) => b.localeCompare(a))
  })

  const yearlySummaries = computed<YearlySummary[]>(() => {
    const summaryMap = new Map<string, YearlySummary>()

    for (const entry of entries.value) {
      const year = entry.date.slice(0, 4)
      const delta = getEntryNet(entry)
      const summary = summaryMap.get(year) || {
        year,
        netProfit: 0,
        recordCount: 0,
        averagePerRecord: 0,
        positiveCount: 0,
        negativeCount: 0
      }

      summary.netProfit += delta
      summary.recordCount += 1
      if (delta > 0) summary.positiveCount += 1
      if (delta < 0) summary.negativeCount += 1
      summaryMap.set(year, summary)
    }

    return [...summaryMap.values()]
      .map((summary) => ({
        ...summary,
        netProfit: Math.round(summary.netProfit * 100) / 100,
        averagePerRecord: summary.recordCount === 0 ? 0 : Math.round((summary.netProfit / summary.recordCount) * 100) / 100
      }))
      .sort((a, b) => b.year.localeCompare(a.year))
  })

  const stats = computed<ProfitStats>(() => {
    const currentYear = String(new Date().getFullYear())
    const currentMonth = formatMonth(new Date())
    const today = new Date()
    const earliestRecentDate = startOfDay(today)
    earliestRecentDate.setDate(today.getDate() - 6)

    const summary = entries.value.reduce<ProfitStats>((acc, entry) => {
      const delta = getEntryNet(entry)
      const entryDate = parseLocalDate(entry.date)

      acc.netProfit += delta
      acc.recordCount += 1

      if (delta > 0) acc.positiveCount += 1
      if (delta < 0) acc.negativeCount += 1

      if (entry.date.startsWith(currentYear)) {
        acc.currentYearNet += delta
      }

      if (entry.date.slice(0, 7) === currentMonth) {
        acc.currentMonthNet += delta
      }

      if (entryDate >= earliestRecentDate) {
        acc.recent7DaysNet += delta
      }

      return acc
    }, {
      netProfit: 0,
      currentYearNet: 0,
      currentMonthNet: 0,
      recent7DaysNet: 0,
      recordCount: 0,
      positiveCount: 0,
      negativeCount: 0,
      averagePerRecord: 0
    })

    summary.averagePerRecord = summary.recordCount === 0 ? 0 : Math.round((summary.netProfit / summary.recordCount) * 100) / 100
    return summary
  })

  function buildTrend(mode: TrendMode, yearFilter: YearFilter = 'all'): TrendPoint[] {
    if (entries.value.length === 0) return []

    const sortedAsc = [...entries.value].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date)
      return a.createdAt.localeCompare(b.createdAt)
    })

    if (mode === 'day') {
      const scopedEntries = yearFilter === 'all'
        ? sortedAsc
        : sortedAsc.filter(entry => entry.date.startsWith(yearFilter))
      if (scopedEntries.length === 0) return []

      const limit = 14
      const endDate = parseLocalDate(scopedEntries[scopedEntries.length - 1].date)
      const start = startOfDay(endDate)
      start.setDate(start.getDate() - (limit - 1))
      if (yearFilter !== 'all') {
        const yearStart = new Date(Number(yearFilter), 0, 1)
        if (start < yearStart) {
          start.setTime(yearStart.getTime())
        }
      }

      let runningTotal = scopedEntries
        .filter(entry => parseLocalDate(entry.date) < start)
        .reduce((sum, entry) => sum + getEntryNet(entry), 0)

      const dayTotals = new Map<string, number>()
      for (const entry of scopedEntries) {
        const key = entry.date
        dayTotals.set(key, (dayTotals.get(key) || 0) + getEntryNet(entry))
      }

      const points: TrendPoint[] = []
      for (let i = 0; i < limit; i++) {
        const current = new Date(start)
        current.setDate(start.getDate() + i)
        const key = formatLocalDate(current)
        runningTotal += dayTotals.get(key) || 0
        points.push({
          label: key.slice(5),
          value: Math.round(runningTotal * 100) / 100
        })
      }
      return points
    }

    if (mode === 'month') {
      if (yearFilter !== 'all') {
        const yearEntries = sortedAsc.filter(entry => entry.date.startsWith(yearFilter))
        if (yearEntries.length === 0) return []

        const selectedYear = Number(yearFilter)
        const currentDate = new Date()
        const maxMonthIndex = selectedYear === currentDate.getFullYear() ? currentDate.getMonth() : 11
        const monthTotals = new Map<string, number>()

        for (const entry of yearEntries) {
          const monthKey = entry.date.slice(0, 7)
          monthTotals.set(monthKey, (monthTotals.get(monthKey) || 0) + getEntryNet(entry))
        }

        let runningTotal = 0
        const points: TrendPoint[] = []
        for (let monthIndex = 0; monthIndex <= maxMonthIndex; monthIndex++) {
          const current = new Date(selectedYear, monthIndex, 1)
          const key = formatMonth(current)
          runningTotal += monthTotals.get(key) || 0
          points.push({
            label: key.slice(5),
            value: Math.round(runningTotal * 100) / 100
          })
        }
        return points
      }

      const limit = 6
      const currentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      const startMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - (limit - 1), 1)

      let runningTotal = sortedAsc
        .filter(entry => parseLocalDate(entry.date) < startMonth)
        .reduce((sum, entry) => sum + getEntryNet(entry), 0)

      const monthTotals = new Map<string, number>()
      for (const entry of sortedAsc) {
        const monthKey = entry.date.slice(0, 7)
        monthTotals.set(monthKey, (monthTotals.get(monthKey) || 0) + getEntryNet(entry))
      }

      const points: TrendPoint[] = []
      for (let i = 0; i < limit; i++) {
        const current = new Date(startMonth.getFullYear(), startMonth.getMonth() + i, 1)
        const key = formatMonth(current)
        runningTotal += monthTotals.get(key) || 0
        points.push({
          label: key.slice(2).replace('-', '/'),
          value: Math.round(runningTotal * 100) / 100
        })
      }
      return points
    }

    const limit = 5
    const endYear = yearFilter === 'all' ? new Date().getFullYear() : Number(yearFilter)
    const startYear = endYear - (limit - 1)

    let runningTotal = sortedAsc
      .filter(entry => parseLocalDate(entry.date).getFullYear() < startYear)
      .reduce((sum, entry) => sum + getEntryNet(entry), 0)

    const yearTotals = new Map<number, number>()
    for (const entry of sortedAsc) {
      const yearKey = parseLocalDate(entry.date).getFullYear()
      yearTotals.set(yearKey, (yearTotals.get(yearKey) || 0) + getEntryNet(entry))
    }

    const points: TrendPoint[] = []
    for (let year = startYear; year <= endYear; year++) {
      runningTotal += yearTotals.get(year) || 0
      points.push({
        label: String(year),
        value: Math.round(runningTotal * 100) / 100
      })
    }
    return points
  }

  function addCashflowEntry(input: { date: string; type: ProfitEntryType; amount: number; note?: string }) {
    const amount = Number(input.amount)
    if (!input.date) throw new Error('请选择日期')
    if (!Number.isFinite(amount) || amount <= 0) throw new Error('金额必须大于 0')

    entries.value.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: input.date,
      note: (input.note || '').trim(),
      createdAt: new Date().toISOString(),
      mode: 'cashflow',
      type: input.type,
      amount: Math.round(amount * 100) / 100
    })
  }

  function addSessionEntry(input: { date: string; result: number; note?: string }) {
    const result = Number(input.result)
    if (!input.date) throw new Error('请选择日期')
    if (!Number.isFinite(result) || result === 0) throw new Error('场次净输赢不能为 0')

    entries.value.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      date: input.date,
      note: (input.note || '').trim(),
      createdAt: new Date().toISOString(),
      mode: 'session',
      result: Math.round(result * 100) / 100
    })
  }

  function updateEntry(id: string, input: { date: string; amount: number; note?: string }) {
    const amount = Number(input.amount)
    if (!input.date) throw new Error('请选择日期')
    if (!Number.isFinite(amount) || amount === 0) throw new Error('净输赢不能为 0')

    entries.value = entries.value.map((entry) => {
      if (entry.id !== id) return entry

      if (entry.mode === 'session') {
        return {
          ...entry,
          date: input.date,
          note: (input.note || '').trim(),
          result: Math.round(amount * 100) / 100
        }
      }

      return {
        ...entry,
        date: input.date,
        note: (input.note || '').trim(),
        type: amount >= 0 ? 'income' : 'expense',
        amount: Math.round(Math.abs(amount) * 100) / 100
      }
    })
  }

  function removeEntry(id: string) {
    entries.value = entries.value.filter(entry => entry.id !== id)
  }

  function reset() {
    entries.value = []
    localStorage.removeItem(STORAGE_KEY)
  }

  function getToday() {
    return formatLocalDate(new Date())
  }

  return {
    entries,
    sortedEntries,
    availableYears,
    yearlySummaries,
    stats,
    buildTrend,
    addCashflowEntry,
    addSessionEntry,
    updateEntry,
    removeEntry,
    reset,
    getToday
  }
})

import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'poker-gto-progress'
const MAX_RECORDS = 90

interface DailyRecord { date: string; preflopCount: number; postflopCount: number; oddsCount: number; quizCount: number; correctCount: number }
interface ProgressStats { totalQuestions: number; totalCorrect: number; streak: number; bestStreak: number; daysActive: number; preflopTotal: number; postflopTotal: number }
interface Achievement { id: string; name: string; icon: string; desc: string; condition: (s: ProgressStats) => boolean }
interface ArchivedStats { totalQuestions: number; totalCorrect: number; daysActive: number; preflopTotal: number; postflopTotal: number }

export const useProgressStore = defineStore('progress', () => {
  const records = ref<DailyRecord[]>([])
  const currentStreak = ref(0)
  const bestStreak = ref(0)
  const archivedStats = ref<ArchivedStats>({ totalQuestions: 0, totalCorrect: 0, daysActive: 0, preflopTotal: 0, postflopTotal: 0 })

  function summarizeRecords(items: DailyRecord[]): ArchivedStats {
    return items.reduce((summary, record) => ({
      totalQuestions: summary.totalQuestions + record.preflopCount + record.postflopCount + record.oddsCount + record.quizCount,
      totalCorrect: summary.totalCorrect + record.correctCount,
      daysActive: summary.daysActive + 1,
      preflopTotal: summary.preflopTotal + record.preflopCount,
      postflopTotal: summary.postflopTotal + record.postflopCount
    }), { totalQuestions: 0, totalCorrect: 0, daysActive: 0, preflopTotal: 0, postflopTotal: 0 })
  }

  function mergeArchivedStats(base: ArchivedStats, extra: ArchivedStats): ArchivedStats {
    return {
      totalQuestions: base.totalQuestions + extra.totalQuestions,
      totalCorrect: base.totalCorrect + extra.totalCorrect,
      daysActive: base.daysActive + extra.daysActive,
      preflopTotal: base.preflopTotal + extra.preflopTotal,
      postflopTotal: base.postflopTotal + extra.postflopTotal
    }
  }

  function parseLocalDate(dateString: string): Date {
    const [year, month, day] = dateString.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  function load() {
    try {
      const r = localStorage.getItem(STORAGE_KEY)
      if (r) {
        const d = JSON.parse(r)
        records.value = d.records || []
        currentStreak.value = d.currentStreak || 0
        bestStreak.value = d.bestStreak || 0
        archivedStats.value = d.archivedStats || archivedStats.value
      }
    } catch {}
  }
  load()
  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify({ records: records.value, currentStreak: currentStreak.value, bestStreak: bestStreak.value, archivedStats: archivedStats.value })) }
  watch([records, currentStreak, bestStreak], save, { deep: true })

  function formatLocalDate(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  function today(): string { return formatLocalDate(new Date()) }

  function pruneRecords() {
    if (records.value.length <= MAX_RECORDS) return
    const overflow = records.value.splice(MAX_RECORDS)
    archivedStats.value = mergeArchivedStats(archivedStats.value, summarizeRecords(overflow))
  }

  function calculateStreakFrom(anchorDate: string): number {
    const recordDates = new Set(records.value.map(record => record.date))
    let streak = 0
    let cursor = parseLocalDate(anchorDate)

    while (recordDates.has(formatLocalDate(cursor))) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    }

    return streak
  }

  function syncStreak() {
    if (records.value.length === 0) {
      currentStreak.value = 0
      return
    }

    const todayStr = today()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = formatLocalDate(yesterday)
    const recordDates = new Set(records.value.map(record => record.date))

    if (recordDates.has(todayStr)) {
      currentStreak.value = calculateStreakFrom(todayStr)
      return
    }

    if (recordDates.has(yesterdayStr)) {
      currentStreak.value = calculateStreakFrom(yesterdayStr)
      return
    }

    currentStreak.value = 0
  }

  function initialize() {
    pruneRecords()
    syncStreak()
    if (currentStreak.value > bestStreak.value) bestStreak.value = currentStreak.value
    save()
  }

  function getTodayRecord(): DailyRecord {
    const d = today()
    let rec = records.value.find(r => r.date === d)
    if (!rec) {
      rec = { date: d, preflopCount: 0, postflopCount: 0, oddsCount: 0, quizCount: 0, correctCount: 0 }
      records.value.unshift(rec)
      pruneRecords()
      syncStreak()
      if (currentStreak.value > bestStreak.value) bestStreak.value = currentStreak.value
    }
    return rec
  }

  function recordAnswer(type: 'preflop' | 'postflop' | 'odds' | 'quiz', correct: boolean) {
    const rec = getTodayRecord()
    if (type === 'preflop') rec.preflopCount++
    else if (type === 'postflop') rec.postflopCount++
    else if (type === 'odds') rec.oddsCount++
    else rec.quizCount++
    if (correct) rec.correctCount++
  }

  const stats = computed<ProgressStats>(() => {
    const currentTotals = summarizeRecords(records.value)
    return {
      totalQuestions: archivedStats.value.totalQuestions + currentTotals.totalQuestions,
      totalCorrect: archivedStats.value.totalCorrect + currentTotals.totalCorrect,
      streak: currentStreak.value,
      bestStreak: bestStreak.value,
      daysActive: archivedStats.value.daysActive + currentTotals.daysActive,
      preflopTotal: archivedStats.value.preflopTotal + currentTotals.preflopTotal,
      postflopTotal: archivedStats.value.postflopTotal + currentTotals.postflopTotal
    }
  })

  const achievements: Achievement[] = [
    { id: 'first', name: '初出茅庐', icon: '🌟', desc: '完成第一道题', condition: s => s.totalQuestions >= 1 },
    { id: '10q', name: '小试牛刀', icon: '💪', desc: '完成10道题', condition: s => s.totalQuestions >= 10 },
    { id: '50q', name: '勤学苦练', icon: '🔥', desc: '完成50道题', condition: s => s.totalQuestions >= 50 },
    { id: '100q', name: '百炼成钢', icon: '🏆', desc: '完成100道题', condition: s => s.totalQuestions >= 100 },
    { id: '3day', name: '三日不辍', icon: '📅', desc: '连续3天练习', condition: s => s.streak >= 3 },
    { id: '7day', name: '一周坚持', icon: '🗓️', desc: '连续7天练习', condition: s => s.streak >= 7 },
    { id: '80pct', name: '高准确率', icon: '🎯', desc: '正确率>80%', condition: s => s.totalQuestions >= 20 && (s.totalCorrect / s.totalQuestions) > 0.8 },
    { id: 'pf50', name: '翻前达人', icon: '🃏', desc: '翻前训练50题', condition: s => s.preflopTotal >= 50 },
    { id: 'pp20', name: '翻后思考者', icon: '🧠', desc: '翻后训练20题', condition: s => s.postflopTotal >= 20 }
  ]

  const unlockedAchievements = computed(() => achievements.filter(a => a.condition(stats.value)))

  return { records, stats, achievements, unlockedAchievements, recordAnswer, initialize }
})

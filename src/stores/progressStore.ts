import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

const STORAGE_KEY = 'poker-gto-progress'

interface DailyRecord { date: string; preflopCount: number; postflopCount: number; oddsCount: number; quizCount: number; correctCount: number }
interface ProgressStats { totalQuestions: number; totalCorrect: number; streak: number; bestStreak: number; daysActive: number; preflopTotal: number; postflopTotal: number }
interface Achievement { id: string; name: string; icon: string; desc: string; condition: (s: ProgressStats) => boolean }

export const useProgressStore = defineStore('progress', () => {
  const records = ref<DailyRecord[]>([])
  const currentStreak = ref(0)
  const bestStreak = ref(0)

  function load() { try { const r = localStorage.getItem(STORAGE_KEY); if (r) { const d = JSON.parse(r); records.value = d.records || []; currentStreak.value = d.currentStreak || 0; bestStreak.value = d.bestStreak || 0 } } catch {} }
  load()
  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify({ records: records.value, currentStreak: currentStreak.value, bestStreak: bestStreak.value })) }
  watch([records, currentStreak, bestStreak], save, { deep: true })

  function today(): string { return new Date().toISOString().split('T')[0] }

  function getTodayRecord(): DailyRecord {
    const d = today()
    let rec = records.value.find(r => r.date === d)
    if (!rec) {
      rec = { date: d, preflopCount: 0, postflopCount: 0, oddsCount: 0, quizCount: 0, correctCount: 0 }
      records.value.unshift(rec)
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
      const yd = yesterday.toISOString().split('T')[0]
      currentStreak.value = records.value.some(r => r.date === yd) ? currentStreak.value + 1 : 1
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
    const tq = records.value.reduce((s, r) => s + r.preflopCount + r.postflopCount + r.oddsCount + r.quizCount, 0)
    const tc = records.value.reduce((s, r) => s + r.correctCount, 0)
    return { totalQuestions: tq, totalCorrect: tc, streak: currentStreak.value, bestStreak: bestStreak.value, daysActive: records.value.length, preflopTotal: records.value.reduce((s, r) => s + r.preflopCount, 0), postflopTotal: records.value.reduce((s, r) => s + r.postflopCount, 0) }
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

  return { records, stats, achievements, unlockedAchievements, recordAnswer }
})

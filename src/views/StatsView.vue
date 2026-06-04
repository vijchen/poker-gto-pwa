<template>
  <div class="stats-page">
    <h2 class="page-title">📈 我的进度</h2>
    <div class="stat-grid">
      <div class="stat-card"><span class="stat-num">{{ stats.totalQuestions }}</span><span class="stat-lbl">总题数</span></div>
      <div class="stat-card"><span class="stat-num green">{{ accuracy }}%</span><span class="stat-lbl">正确率</span></div>
      <div class="stat-card"><span class="stat-num gold">{{ stats.streak }}</span><span class="stat-lbl">连续天数</span></div>
      <div class="stat-card"><span class="stat-num">{{ stats.daysActive }}</span><span class="stat-lbl">活跃天数</span></div>
    </div>
    <h3 class="section-title">🏅 成就 ({{ unlockedAchievements.length }}/{{ achievements.length }})</h3>
    <div class="achievements">
      <div v-for="a in achievements" :key="a.id" :class="['ach-card', { unlocked: isUnlocked(a.id) }]">
        <span class="ach-icon">{{ a.icon }}</span>
        <div class="ach-info"><span class="ach-name">{{ a.name }}</span><span class="ach-desc">{{ a.desc }}</span></div>
        <span v-if="isUnlocked(a.id)" class="ach-check">✓</span><span v-else class="ach-lock">🔒</span>
      </div>
    </div>
    <h3 class="section-title">📊 最近7天</h3>
    <div class="recent">
      <div v-for="r in recentRecords" :key="r.date" class="day-row">
        <span class="day-date">{{ r.date.slice(5) }}</span>
        <div class="day-bar"><div class="day-fill" :style="{ width: Math.min((r.preflopCount+r.postflopCount+r.oddsCount+r.quizCount)*5,100)+'%' }"></div></div>
        <span class="day-count">{{ r.preflopCount+r.postflopCount+r.oddsCount+r.quizCount }}题</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProgressStore } from '@/stores/progressStore'
const ps = useProgressStore()
const stats = computed(() => ps.stats)
const achievements = ps.achievements
const unlockedAchievements = computed(() => ps.unlockedAchievements)
const accuracy = computed(() => stats.value.totalQuestions === 0 ? 0 : Math.round((stats.value.totalCorrect / stats.value.totalQuestions) * 100))
const recentRecords = computed(() => ps.records.slice(0, 7))
function isUnlocked(id: string) { return unlockedAchievements.value.some(a => a.id === id) }
</script>

<style scoped>
.stats-page{padding:16px;padding-bottom:80px}.page-title{font-family:var(--font-display);font-size:20px;font-weight:800;margin-bottom:14px}.section-title{font-size:14px;font-weight:700;margin:18px 0 10px}
.stat-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:10px}.stat-card{background:var(--bg-card);border:1px solid var(--border-subtle);border-radius:var(--radius-md);padding:14px;text-align:center}
.stat-num{display:block;font-family:var(--font-display);font-size:24px;font-weight:900}.stat-num.green{color:var(--accent-green)}.stat-num.gold{color:var(--accent-gold)}.stat-lbl{font-size:11px;color:var(--text-muted)}
.achievements{display:flex;flex-direction:column;gap:8px}.ach-card{display:flex;align-items:center;gap:10px;padding:12px;border-radius:var(--radius-md);background:var(--bg-card);border:1px solid var(--border-subtle);opacity:0.5}
.ach-card.unlocked{opacity:1;border-color:var(--border-active)}.ach-icon{font-size:22px}.ach-info{flex:1}.ach-name{display:block;font-size:13px;font-weight:700}.ach-desc{font-size:11px;color:var(--text-muted)}
.ach-check{color:var(--accent-green);font-weight:800}.ach-lock{font-size:14px}
.recent{display:flex;flex-direction:column;gap:6px}.day-row{display:flex;align-items:center;gap:8px}.day-date{font-size:11px;color:var(--text-muted);min-width:40px}
.day-bar{flex:1;height:6px;background:rgba(255,255,255,0.05);border-radius:3px;overflow:hidden}.day-fill{height:100%;background:var(--accent-green);border-radius:3px}.day-count{font-size:11px;color:var(--text-secondary);min-width:30px;text-align:right}
</style>

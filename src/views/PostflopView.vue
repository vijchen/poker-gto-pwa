<template>
  <div class="postflop-page">
    <h2 class="page-title">翻后训练</h2>
    <div class="difficulty-bar">
      <button v-for="d in difficulties" :key="d" :class="['diff-btn', { active: activeDifficulty === d }]" @click="switchDifficulty(d)">{{ d }}</button>
    </div>
    <div class="progress-bar">
      <span>第 {{ currentIndex + 1 }} / {{ filteredScenarios.length }} 题</span>
      <span>正确率 {{ accuracy }}%</span>
    </div>
    <div v-if="currentScenario" class="scenario-card">
      <div class="scenario-header">
        <span class="scenario-cat">{{ currentScenario.category }}</span>
        <span :class="['scenario-diff', currentScenario.difficulty]">{{ currentScenario.difficulty }}</span>
      </div>
      <h3 class="scenario-title">{{ currentScenario.title }}</h3>
      <div class="cards-display">
        <div class="cards-group"><span class="cards-label">你的牌</span><div class="cards-row"><span v-for="c in currentScenario.heroCards" :key="c" :class="['mini-card', suitClass(c)]">{{ formatCard(c) }}</span></div></div>
        <div class="cards-group"><span class="cards-label">公共牌</span><div class="cards-row"><span v-for="c in currentScenario.board" :key="c" :class="['mini-card', suitClass(c)]">{{ formatCard(c) }}</span></div></div>
      </div>
      <p class="situation-text">{{ currentScenario.situation }}</p>
      <div v-if="!answered" class="options">
        <button v-for="opt in currentScenario.options" :key="opt.action" class="option-btn" @click="answer(opt.action)">{{ opt.label }}</button>
      </div>
      <div v-else class="answer-result">
        <div :class="['result-badge', isCorrect ? 'correct' : 'wrong']">{{ isCorrect ? '✓ 正确' : '✗ 错误' }}</div>
        <div class="explanation"><strong>GTO解析：</strong>{{ currentScenario.explanation }}</div>
        <button class="btn-next" @click="nextScenario">下一题 →</button>
      </div>
    </div>
    <div v-else class="complete-state">
      <p>🎉 本组题目全部完成</p>
      <p>正确率: {{ accuracy }}%</p>
      <button class="btn-next" @click="resetProgress">重新开始</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { scenarios } from '@/data/postflop-scenarios'

const activeDifficulty = ref('全部')
const currentIndex = ref(0)
const answered = ref(false)
const isCorrect = ref(false)
const totalCorrect = ref(0)
const totalAnswered = ref(0)
const difficulties = ['全部', '入门', '进阶', '困难']

const filteredScenarios = computed(() => {
  if (activeDifficulty.value === '全部') return scenarios
  return scenarios.filter(s => s.difficulty === activeDifficulty.value)
})
const currentScenario = computed(() => filteredScenarios.value[currentIndex.value] || null)
const accuracy = computed(() => {
  if (totalAnswered.value === 0) return 0
  return Math.round((totalCorrect.value / totalAnswered.value) * 100)
})

const SUITS_DISPLAY: Record<string, { symbol: string; cls: string }> = {
  s: { symbol: '♠', cls: 'suit-spade' }, h: { symbol: '♥', cls: 'suit-heart' },
  d: { symbol: '♦', cls: 'suit-diamond' }, c: { symbol: '♣', cls: 'suit-club' }
}
function formatCard(card: string): string { return card[0] + SUITS_DISPLAY[card[1]].symbol }
function suitClass(card: string): string { return SUITS_DISPLAY[card[1]].cls }

function answer(action: string) {
  if (!currentScenario.value) return
  isCorrect.value = action === currentScenario.value.correctAction
  totalAnswered.value++
  if (isCorrect.value) totalCorrect.value++
  answered.value = true
}
function nextScenario() { currentIndex.value++; answered.value = false }
function switchDifficulty(d: string) { activeDifficulty.value = d; currentIndex.value = 0; answered.value = false }
function resetProgress() { currentIndex.value = 0; totalCorrect.value = 0; totalAnswered.value = 0; answered.value = false }
</script>

<style scoped>
.postflop-page { padding: 16px; padding-bottom: 80px; }
.page-title { font-size: 20px; font-weight: 700; margin-bottom: 10px; }
.difficulty-bar { display: flex; gap: 6px; margin-bottom: 10px; }
.diff-btn { padding: 6px 12px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.15); background: transparent; color: rgba(255,255,255,0.6); font-size: 12px; font-weight: 600; cursor: pointer; }
.diff-btn.active { background: rgba(74,222,128,0.1); border-color: #4ade80; color: #4ade80; }
.progress-bar { display: flex; justify-content: space-between; font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 14px; }
.scenario-card { background: rgba(255,255,255,0.04); border-radius: 14px; padding: 16px; border: 1px solid rgba(255,255,255,0.06); }
.scenario-header { display: flex; gap: 8px; margin-bottom: 8px; }
.scenario-cat { font-size: 11px; padding: 2px 8px; background: rgba(59,130,246,0.15); color: #60a5fa; border-radius: 8px; }
.scenario-diff { font-size: 11px; padding: 2px 8px; border-radius: 8px; }
.scenario-diff.入门 { background: rgba(34,197,94,0.15); color: #4ade80; }
.scenario-diff.进阶 { background: rgba(234,179,8,0.15); color: #eab308; }
.scenario-diff.困难 { background: rgba(239,68,68,0.15); color: #ef4444; }
.scenario-title { font-size: 16px; font-weight: 700; margin-bottom: 12px; }
.cards-display { display: flex; gap: 16px; margin-bottom: 12px; }
.cards-group { display: flex; flex-direction: column; gap: 4px; }
.cards-label { font-size: 10px; color: rgba(255,255,255,0.4); }
.cards-row { display: flex; gap: 4px; }
.mini-card { padding: 4px 8px; border-radius: 6px; background: #fff; font-size: 14px; font-weight: 800; }
.suit-spade { color: #1a1a2e; }
.suit-heart { color: #ef4444; }
.suit-diamond { color: #3b82f6; }
.suit-club { color: #22c55e; }
.situation-text { font-size: 13px; color: rgba(255,255,255,0.8); line-height: 1.6; margin-bottom: 16px; }
.options { display: flex; flex-direction: column; gap: 8px; }
.option-btn { padding: 14px; border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; background: transparent; color: #eee; font-size: 14px; font-weight: 600; text-align: left; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.option-btn:active { background: rgba(255,255,255,0.08); }
.answer-result { display: flex; flex-direction: column; gap: 12px; }
.result-badge { padding: 8px 16px; border-radius: 10px; font-size: 16px; font-weight: 700; text-align: center; }
.result-badge.correct { background: rgba(34,197,94,0.15); color: #22c55e; }
.result-badge.wrong { background: rgba(239,68,68,0.15); color: #ef4444; }
.explanation { font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.6; background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px; }
.explanation strong { color: #eab308; }
.btn-next { padding: 12px; border: none; border-radius: 10px; background: rgba(255,255,255,0.1); color: #eee; font-size: 14px; font-weight: 600; cursor: pointer; text-align: center; }
.complete-state { text-align: center; padding: 40px 0; color: rgba(255,255,255,0.7); }
.complete-state p { margin-bottom: 12px; }
</style>

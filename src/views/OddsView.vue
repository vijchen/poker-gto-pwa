<template>
  <div class="odds-page">
    <h2 class="page-title">底池赔率</h2>

    <div class="input-section">
      <div class="input-group">
        <label>底池大小</label>
        <div class="input-row">
          <button class="adj-btn" @click="adjustPot(-1)">-</button>
          <span class="input-value">{{ pot }} BB</span>
          <button class="adj-btn" @click="adjustPot(1)">+</button>
        </div>
      </div>
      <div class="input-group">
        <label>需要跟注</label>
        <div class="input-row">
          <button class="adj-btn" @click="adjustBet(-0.5)">-</button>
          <span class="input-value">{{ bet }} BB</span>
          <button class="adj-btn" @click="adjustBet(0.5)">+</button>
        </div>
      </div>
      <div class="input-group">
        <label>补牌数 (Outs)</label>
        <div class="input-row">
          <button class="adj-btn" @click="adjustOuts(-1)">-</button>
          <span class="input-value">{{ outs }}</span>
          <button class="adj-btn" @click="adjustOuts(1)">+</button>
        </div>
      </div>
    </div>

    <div class="results">
      <div class="result-card">
        <span class="result-label">底池赔率</span>
        <span class="result-value">{{ potOdds }}%</span>
        <span class="result-desc">需要 {{ potOdds }}% 胜率才能跟注</span>
      </div>
      <div class="result-card">
        <span class="result-label">你的胜率 (2-4法则)</span>
        <span class="result-value">{{ equity }}%</span>
        <span class="result-desc">Turn: {{ outs * 2 }}% · River: {{ outs * 2 }}% · 两街: {{ Math.min(outs * 4, 100) }}%</span>
      </div>
      <div :class="['decision-card', canCall ? 'positive' : 'negative']">
        <span class="decision-icon">{{ canCall ? '✓' : '✗' }}</span>
        <span class="decision-text">{{ canCall ? '可以跟注 (正EV)' : '应该弃牌 (负EV)' }}</span>
      </div>
    </div>

    <div class="outs-reference">
      <h3>常见补牌数</h3>
      <div class="outs-grid">
        <div class="outs-item" v-for="item in outsRef" :key="item.name" @click="outs = item.outs">
          <span class="outs-num">{{ item.outs }}</span>
          <span class="outs-name">{{ item.name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const pot = ref(6)
const bet = ref(2)
const outs = ref(9)

const potOdds = computed(() => {
  const total = pot.value + bet.value
  if (total === 0) return 0
  return Math.round((bet.value / total) * 100)
})
const equity = computed(() => Math.min(outs.value * 4, 100))
const canCall = computed(() => equity.value >= potOdds.value)

const outsRef = [
  { name: '同花听牌', outs: 9 },
  { name: '两头顺听', outs: 8 },
  { name: '卡顺听牌', outs: 4 },
  { name: '两高张', outs: 6 },
  { name: '同花+顺', outs: 15 },
  { name: '一对变三条', outs: 2 }
]

function adjustPot(delta: number) { pot.value = Math.max(0, pot.value + delta) }
function adjustBet(delta: number) { bet.value = Math.max(0.5, bet.value + delta) }
function adjustOuts(delta: number) { outs.value = Math.max(0, Math.min(20, outs.value + delta)) }
</script>

<style scoped>
.odds-page { padding: 16px; padding-bottom: 80px; }
.page-title { font-size: 20px; font-weight: 700; margin-bottom: 16px; }
.input-section { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
.input-group label { font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 4px; display: block; }
.input-row { display: flex; align-items: center; gap: 12px; }
.adj-btn {
  width: 36px; height: 36px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.2);
  background: transparent; color: #eee; font-size: 18px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
}
.input-value { font-size: 20px; font-weight: 700; min-width: 80px; text-align: center; }
.results { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
.result-card { background: rgba(255,255,255,0.05); border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 2px; }
.result-label { font-size: 12px; color: rgba(255,255,255,0.5); }
.result-value { font-size: 24px; font-weight: 800; color: #4ade80; }
.result-desc { font-size: 11px; color: rgba(255,255,255,0.4); }
.decision-card { padding: 16px; border-radius: 12px; display: flex; align-items: center; gap: 10px; }
.decision-card.positive { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); }
.decision-card.negative { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); }
.decision-icon { font-size: 20px; }
.decision-text { font-size: 15px; font-weight: 600; }
.positive .decision-text { color: #22c55e; }
.negative .decision-text { color: #ef4444; }
.outs-reference h3 { font-size: 14px; font-weight: 600; margin-bottom: 8px; }
.outs-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.outs-item { background: rgba(255,255,255,0.05); border-radius: 8px; padding: 10px; text-align: center; cursor: pointer; display: flex; flex-direction: column; gap: 2px; }
.outs-item:active { background: rgba(255,255,255,0.1); }
.outs-num { font-size: 18px; font-weight: 800; color: #eab308; }
.outs-name { font-size: 10px; color: rgba(255,255,255,0.5); }
</style>

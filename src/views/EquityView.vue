<template>
  <div class="equity-page">
    <h2 class="page-title">胜率计算</h2>

    <CardPicker title="我的手牌" :selected="heroCards" :max-cards="2"
      :disabled="villainCards.concat(boardCards)" @update="heroCards = $event" />

    <CardPicker title="对手手牌" :selected="villainCards" :max-cards="2"
      :disabled="heroCards.concat(boardCards)" @update="villainCards = $event" />

    <CardPicker title="公共牌（可选）" :selected="boardCards" :max-cards="5"
      :disabled="heroCards.concat(villainCards)" @update="boardCards = $event" />

    <div class="action-area">
      <button class="calc-btn" :disabled="heroCards.length !== 2 || villainCards.length !== 2 || isCalculating"
        @click="handleCalc">
        {{ isCalculating ? '计算中...' : '计算胜率' }}
      </button>
      <button class="reset-btn" @click="handleReset">重置</button>
    </div>

    <div v-if="result" class="result-card">
      <div class="result-row">
        <span class="result-label">我的胜率</span>
        <span class="result-value hero">{{ result.heroEquity }}%</span>
      </div>
      <div class="result-row">
        <span class="result-label">对手胜率</span>
        <span class="result-value villain">{{ result.villainEquity }}%</span>
      </div>
      <div class="result-row">
        <span class="result-label">平局</span>
        <span class="result-value tie">{{ result.tie }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CardPicker from '@/components/CardPicker.vue'
import { useEquity } from '@/composables/useEquity'

// State
const heroCards = ref<string[]>([])
const villainCards = ref<string[]>([])
const boardCards = ref<string[]>([])

const { isCalculating, result, calculate, reset } = useEquity()

// Methods
function handleCalc() {
  calculate(heroCards.value, villainCards.value, boardCards.value)
}

function handleReset() {
  heroCards.value = []
  villainCards.value = []
  boardCards.value = []
  reset()
}
</script>

<style scoped>
.equity-page { padding: 16px; padding-bottom: 80px; }
.page-title { font-size: 20px; font-weight: 700; margin-bottom: 12px; }
.action-area { display: flex; gap: 10px; padding: 16px 0; }
.calc-btn {
  flex: 1; padding: 14px; border: none; border-radius: 12px;
  background: #22c55e; color: #052e16; font-size: 16px; font-weight: 700; cursor: pointer;
}
.calc-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.reset-btn {
  padding: 14px 20px; border: 1px solid rgba(255,255,255,0.2); border-radius: 12px;
  background: transparent; color: rgba(255,255,255,0.7); font-size: 14px; cursor: pointer;
}
.result-card {
  background: rgba(255,255,255,0.05); border-radius: 16px; padding: 20px;
  display: flex; flex-direction: column; gap: 14px;
}
.result-row { display: flex; justify-content: space-between; align-items: center; }
.result-label { font-size: 15px; color: rgba(255,255,255,0.7); }
.result-value { font-size: 22px; font-weight: 800; }
.result-value.hero { color: #22c55e; }
.result-value.villain { color: #ef4444; }
.result-value.tie { color: #eab308; }
</style>

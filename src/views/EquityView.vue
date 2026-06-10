<template>
  <div class="equity-page">
    <h2 class="page-title">胜率计算</h2>

    <div class="mode-tabs">
      <button :class="['mode-btn', { active: mode === 'range' }]" @click="mode = 'range'">手牌 vs 范围</button>
      <button :class="['mode-btn', { active: mode === 'hand' }]" @click="mode = 'hand'">手牌 vs 手牌</button>
    </div>

    <CardPicker title="我的手牌" :selected="heroCards" :max-cards="2"
      :disabled="mode === 'hand' ? villainCards.concat(boardCards) : boardCards" @update="heroCards = $event" />

    <template v-if="mode === 'hand'">
      <CardPicker title="对手手牌（复盘用）" :selected="villainCards" :max-cards="2"
        :disabled="heroCards.concat(boardCards)" @update="villainCards = $event" />
    </template>

    <template v-if="mode === 'range'">
      <div class="range-select">
        <label>对手范围（选择对手位置的 Open 范围）</label>
        <div class="range-options">
          <button v-for="r in rangePresets" :key="r.key"
            :class="['range-btn', { active: selectedRange === r.key }]"
            @click="selectedRange = r.key">{{ r.label }}</button>
        </div>
      </div>
    </template>

    <CardPicker title="公共牌（可选）" :selected="boardCards" :max-cards="5"
      :disabled="mode === 'hand' ? heroCards.concat(villainCards) : heroCards" @update="boardCards = $event" />

    <div class="action-area">
      <button class="calc-btn" :disabled="!canCalc || isCalculating" @click="handleCalc">
        {{ isCalculating ? '计算中...' : '计算胜率' }}
      </button>
      <button class="reset-btn" @click="handleReset">重置</button>
    </div>

    <div v-if="result" class="result-card">
      <div class="result-row"><span class="result-label">我的胜率</span><span class="result-value hero">{{ result.heroEquity }}%</span></div>
      <div class="result-row"><span class="result-label">对手胜率</span><span class="result-value villain">{{ result.villainEquity }}%</span></div>
      <div class="result-row"><span class="result-label">平局</span><span class="result-value tie">{{ result.tie }}%</span></div>
    </div>

    <div v-if="error" class="error-card">
      <p>⚠️ {{ error }}</p>
    </div>

    <div v-if="mode === 'range'" class="range-info">
      <p>💡 从对手位置的 open 范围中随机抽取手牌模拟，结果为对抗该范围的近似胜率。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import CardPicker from '@/components/CardPicker.vue'
import { useEquity } from '@/composables/useEquity'
import openData from '@/data/ranges/open.json'

const mode = ref<'hand' | 'range'>('range')
const heroCards = ref<string[]>([])
const villainCards = ref<string[]>([])
const boardCards = ref<string[]>([])
const selectedRange = ref('CO')

const rangePresets = [
  { key: 'UTG', label: 'UTG 12%' },
  { key: 'UTG1', label: 'UTG1 14%' },
  { key: 'MP', label: 'MP 17%' },
  { key: 'HJ', label: 'HJ 21%' },
  { key: 'CO', label: 'CO 27%' },
  { key: 'BTN', label: 'BTN 42%' },
  { key: 'SB', label: 'SB 35%' }
]

const { isCalculating, result, error, calculate, reset } = useEquity()

const canCalc = computed(() => {
  if (heroCards.value.length !== 2) return false
  if (mode.value === 'hand' && villainCards.value.length !== 2) return false
  return true
})

function handNameToCards(name: string, exclude: string[]): [string, string] | null {
  const suits = ['s', 'h', 'd', 'c']
  if (name.length === 2) {
    const r = name[0]
    const avail = suits.filter(s => !exclude.includes(r + s))
    if (avail.length < 2) return null
    const i = Math.floor(Math.random() * avail.length)
    let j = Math.floor(Math.random() * (avail.length - 1)); if (j >= i) j++
    return [r + avail[i], r + avail[j]]
  }
  const r1 = name[0], r2 = name[1], suited = name[2] === 's'
  if (suited) {
    const avail = suits.filter(s => !exclude.includes(r1 + s) && !exclude.includes(r2 + s))
    if (avail.length === 0) return null
    const s = avail[Math.floor(Math.random() * avail.length)]
    return [r1 + s, r2 + s]
  } else {
    const a1 = suits.filter(s => !exclude.includes(r1 + s))
    if (a1.length === 0) return null
    const s1 = a1[Math.floor(Math.random() * a1.length)]
    const a2 = suits.filter(s => s !== s1 && !exclude.includes(r2 + s))
    if (a2.length === 0) return null
    const s2 = a2[Math.floor(Math.random() * a2.length)]
    return [r1 + s1, r2 + s2]
  }
}

function handleCalc() {
  if (mode.value === 'hand') {
    calculate(heroCards.value, villainCards.value, boardCards.value)
  } else {
    const posData = (openData as any)[selectedRange.value]
    if (!posData) return
    const playable = Object.entries(posData).filter(([_, v]: any) => v.action === 'raise' || v.action === 'mixed').map(([k]) => k)
    if (playable.length === 0) return
    const exclude = [...heroCards.value, ...boardCards.value]
    const handName = playable[Math.floor(Math.random() * playable.length)]
    const vCards = handNameToCards(handName, exclude)
    if (!vCards) {
      const h2 = playable[Math.floor(Math.random() * playable.length)]
      const v2 = handNameToCards(h2, exclude)
      if (!v2) return
      calculate(heroCards.value, v2, boardCards.value)
      return
    }
    calculate(heroCards.value, vCards, boardCards.value)
  }
}

function handleReset() {
  heroCards.value = []; villainCards.value = []; boardCards.value = []; selectedRange.value = 'CO'; reset()
}
</script>

<style scoped>
.equity-page { padding: 16px; padding-bottom: 80px; }
.page-title { font-size: 20px; font-weight: 700; margin-bottom: 12px; }
.mode-tabs { display: flex; gap: 6px; margin-bottom: 12px; }
.mode-btn { flex: 1; padding: 8px; border-radius: 10px; border: 1px solid var(--border-subtle); background: transparent; color: var(--text-secondary); font-size: 12px; font-weight: 700; cursor: pointer; }
.mode-btn.active { background: var(--accent-green-dim); border-color: var(--border-active); color: var(--accent-green); }
.range-select { padding: 12px 0; }
.range-select label { font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 8px; }
.range-options { display: flex; flex-wrap: wrap; gap: 6px; }
.range-btn { padding: 6px 10px; border-radius: 8px; border: 1px solid var(--border-subtle); background: transparent; color: var(--text-secondary); font-size: 11px; font-weight: 600; cursor: pointer; }
.range-btn.active { background: var(--accent-green-dim); border-color: var(--border-active); color: var(--accent-green); }
.action-area { display: flex; gap: 10px; padding: 16px 0; }
.calc-btn { flex: 1; padding: 14px; border: none; border-radius: 12px; background: var(--accent-green); color: #000; font-size: 16px; font-weight: 700; cursor: pointer; }
.calc-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.reset-btn { padding: 14px 20px; border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; background: transparent; color: rgba(255,255,255,0.7); font-size: 14px; cursor: pointer; }
.result-card { background: rgba(255,255,255,0.05); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 14px; }
.result-row { display: flex; justify-content: space-between; align-items: center; }
.result-label { font-size: 15px; color: rgba(255,255,255,0.7); }
.result-value { font-size: 22px; font-weight: 800; }
.result-value.hero { color: var(--accent-green); }
.result-value.villain { color: var(--accent-red); }
.result-value.tie { color: var(--accent-gold); }
.range-info { margin-top: 12px; padding: 10px; background: rgba(255,255,255,0.03); border-radius: 8px; }
.range-info p { font-size: 11px; color: var(--text-muted); line-height: 1.5; }
.error-card { margin-top: 12px; padding: 14px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 12px; }
.error-card p { font-size: 13px; color: #f87171; }
</style>

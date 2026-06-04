<template>
  <div class="ranges-page">
    <h2 class="page-title">自定义范围</h2>
    <p class="page-desc">点击格子循环切换：Raise → Call → Fold → Mixed</p>

    <div class="position-row">
      <button v-for="pos in positions" :key="pos"
        :class="['pos-btn', { active: currentPos === pos }]" @click="currentPos = pos">{{ pos }}</button>
    </div>

    <div class="scenario-row">
      <button v-for="s in scenarios" :key="s.key"
        :class="['scenario-btn', { active: currentScenario === s.key }]" @click="currentScenario = s.key">{{ s.label }}</button>
    </div>

    <div class="matrix">
      <div v-for="(_, row) in 13" :key="row" class="matrix-row">
        <div v-for="(_, col) in 13" :key="col"
          :class="['cell', getCellClass(row, col)]" @click="handleCellClick(row, col)">
          <span class="cell-text">{{ getHandNameFn(row, col) }}</span>
        </div>
      </div>
    </div>

    <div class="actions">
      <button class="clear-btn" @click="handleClear">清除当前位置</button>
      <button class="clear-all-btn" @click="handleClearAll">清除全部</button>
    </div>

    <div class="legend">
      <span class="legend-item"><span class="dot raise"></span>Raise</span>
      <span class="legend-item"><span class="dot call"></span>Call</span>
      <span class="legend-item"><span class="dot fold"></span>Fold</span>
      <span class="legend-item"><span class="dot mixed"></span>Mixed</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Position, Scenario, HandAction } from '@/types/poker'
import { POSITIONS, getHandName } from '@/types/poker'
import { useRangeStore } from '@/stores/rangeStore'

const rangeStore = useRangeStore()
const currentPos = ref<Position>('BTN')
const currentScenario = ref<Scenario>('open')
const positions = POSITIONS
const scenarios: { key: Scenario; label: string }[] = [
  { key: 'open', label: 'Open' },
  { key: 'vs3bet', label: 'vs 3Bet' },
  { key: 'vsOpen', label: 'vs Open' }
]

const getHandNameFn = getHandName

function getAction(row: number, col: number): HandAction {
  const handName = getHandName(row, col)
  const custom = rangeStore.getCustomRange(currentPos.value, currentScenario.value)
  if (custom && custom[handName]) return custom[handName]
  return { action: 'fold' }
}

function getCellClass(row: number, col: number): string {
  const action = getAction(row, col)
  switch (action.action) {
    case 'raise': return 'cell-raise'
    case 'call': return 'cell-call'
    case 'fold': return 'cell-fold'
    case 'mixed': return 'cell-mixed'
    default: return 'cell-fold'
  }
}

function handleCellClick(row: number, col: number) {
  const handName = getHandName(row, col)
  const current = getAction(row, col)
  rangeStore.cycleHandAction(currentPos.value, currentScenario.value, handName, current)
}

function handleClear() { rangeStore.clearCustomRange(currentPos.value, currentScenario.value) }
function handleClearAll() { rangeStore.clearAll() }
</script>

<style scoped>
.ranges-page { padding: 16px; padding-bottom: 80px; }
.page-title { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
.page-desc { font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 12px; }
.position-row, .scenario-row { display: flex; gap: 6px; margin-bottom: 8px; overflow-x: auto; scrollbar-width: none; }
.position-row::-webkit-scrollbar, .scenario-row::-webkit-scrollbar { display: none; }
.pos-btn, .scenario-btn {
  flex-shrink: 0; padding: 6px 12px; border: 1px solid rgba(255,255,255,0.2); border-radius: 16px;
  background: transparent; color: rgba(255,255,255,0.6); font-size: 12px; font-weight: 600; cursor: pointer;
}
.pos-btn.active { background: #4ade80; color: #1a1a2e; border-color: #4ade80; }
.scenario-btn.active { background: rgba(74,222,128,0.1); border-color: #4ade80; color: #4ade80; }
.matrix { display: grid; grid-template-rows: repeat(13, 1fr); gap: 1px; aspect-ratio: 1; margin: 8px 0; }
.matrix-row { display: grid; grid-template-columns: repeat(13, 1fr); gap: 1px; }
.cell {
  display: flex; align-items: center; justify-content: center; aspect-ratio: 1;
  border-radius: 3px; cursor: pointer; -webkit-tap-highlight-color: transparent;
}
.cell:active { transform: scale(0.9); }
.cell-text { font-size: clamp(7px, 2.2vw, 11px); font-weight: 600; }
.cell-raise { background: #22c55e; color: #052e16; }
.cell-call { background: #3b82f6; color: #eff6ff; }
.cell-fold { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.3); }
.cell-mixed { background: linear-gradient(135deg, #22c55e 0%, #eab308 100%); color: #1a1a2e; }
.actions { display: flex; gap: 10px; margin: 12px 0; }
.clear-btn, .clear-all-btn {
  flex: 1; padding: 10px; border: 1px solid rgba(255,255,255,0.15); border-radius: 10px;
  background: transparent; color: rgba(255,255,255,0.6); font-size: 13px; cursor: pointer;
}
.clear-all-btn { border-color: #ef4444; color: #ef4444; }
.legend { display: flex; gap: 14px; justify-content: center; }
.legend-item { display: flex; align-items: center; gap: 4px; font-size: 11px; color: rgba(255,255,255,0.6); }
.dot { width: 10px; height: 10px; border-radius: 50%; }
.dot.raise { background: #22c55e; }
.dot.call { background: #3b82f6; }
.dot.fold { background: rgba(255,255,255,0.15); }
.dot.mixed { background: linear-gradient(135deg, #22c55e, #eab308); }
</style>

<script setup lang="ts">
import { RANKS, getHandName } from '@/types/poker'
import type { HandAction } from '@/types/poker'

const props = defineProps<{ getAction: (row: number, col: number) => HandAction }>()
const emit = defineEmits<{ select: [handName: string, row: number, col: number] }>()

function cellColor(action: HandAction): string {
  switch (action.action) {
    case 'raise': return 'cell-raise'
    case 'call': return 'cell-call'
    case 'fold': return 'cell-fold'
    case 'mixed': return 'cell-mixed'
    default: return 'cell-fold'
  }
}
function handleClick(row: number, col: number) { emit('select', getHandName(row, col), row, col) }
</script>

<template>
  <div class="matrix-container">
    <div class="matrix">
      <div v-for="(_, row) in RANKS.length" :key="row" class="matrix-row">
        <div v-for="(_, col) in RANKS.length" :key="col"
          :class="['cell', cellColor(getAction(row, col))]" @click="handleClick(row, col)">
          <span class="cell-text">{{ getHandName(row, col) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.matrix-container { padding: 10px; flex: 1; display: flex; align-items: center; }
.matrix {
  display: grid; grid-template-rows: repeat(13, 1fr); gap: 2px; width: 100%; aspect-ratio: 1;
  max-width: 100vw; background: var(--bg-secondary); border-radius: var(--radius-lg);
  padding: 4px; border: 1px solid var(--border-subtle);
}
.matrix-row { display: grid; grid-template-columns: repeat(13, 1fr); gap: 2px; }
.cell {
  display: flex; align-items: center; justify-content: center; aspect-ratio: 1; border-radius: 3px;
  cursor: pointer; transition: transform 0.1s; -webkit-tap-highlight-color: transparent;
}
.cell:active { transform: scale(0.85); }
.cell-text {
  font-family: var(--font-display); font-size: clamp(6px, 2vw, 10px);
  font-weight: 700; line-height: 1; letter-spacing: -0.02em;
}
.cell-raise {
  background: linear-gradient(135deg, #059669 0%, #34d399 100%); color: #022c22;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.15);
}
.cell-call {
  background: linear-gradient(135deg, #1d4ed8 0%, #60a5fa 100%); color: #eff6ff;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.15);
}
.cell-fold { background: rgba(255, 255, 255, 0.03); color: var(--text-muted); }
.cell-mixed {
  background: linear-gradient(135deg, #059669 0%, #ca8a04 50%, #d97706 100%); color: #1a1a2e;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.2);
}
</style>

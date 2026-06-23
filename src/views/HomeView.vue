<template>
  <div class="home">
    <header class="app-header">
      <h1 class="app-logo">♠ GTO<span class="logo-accent">Lab</span></h1>
    </header>

    <PositionBar />

    <!-- 牌桌可视化 -->
    <div class="table-visual">
      <div class="table-felt">
        <div v-for="pos in tablePositions" :key="pos.name"
          :class="['table-pos', { active: currentPosition === pos.name }]"
          :style="pos.style"
          @click="setPositionDirect(pos.name)">
          {{ pos.name }}
        </div>
        <div class="table-center">{{ openPctLabel }}</div>
      </div>
    </div>

    <div class="scenario-tabs">
      <button v-for="s in scenarios" :key="s.key"
        :class="['tab-btn', { active: currentScenario === s.key }]" @click="currentScenario = s.key">{{ s.label }}</button>
    </div>

    <div v-if="currentScenario === 'vsOpen'" class="opener-select">
      <span class="opener-label">对手位置:</span>
      <button v-for="pos in validOpeners" :key="pos"
        :class="['opener-btn', { active: openerPosition === pos }]" @click="setOpenerPosition(pos)">{{ pos }}</button>
    </div>

    <div v-if="rangeError" class="load-state error">{{ rangeError }}</div>
    <div v-else-if="isRangeLoading" class="load-state">正在加载范围数据...</div>
    <HandMatrix v-else :get-action="getAction" @select="handleSelect" />

    <!-- 颜色图例 -->
    <div class="legend">
      <span class="legend-item"><span class="dot dot-raise"></span>Raise/4Bet</span>
      <span class="legend-item"><span class="dot dot-call"></span>Call</span>
      <span class="legend-item"><span class="dot dot-mixed"></span>Mixed</span>
      <span class="legend-item"><span class="dot dot-fold"></span>Fold</span>
    </div>

    <p class="data-source">数据适用于线下朋友局 / 低抽水休闲局（8人桌 100BB），范围比严格 GTO 略宽以适应被动对手环境。</p>

    <StrategyPopup :visible="popupVisible" :hand-name="selectedHand" :position="currentPosition"
      :scenario="currentScenario" :action="selectedAction" @close="popupVisible = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { Scenario, HandAction, Position } from '@/types/poker'
import { usePosition } from '@/composables/usePosition'
import { useRange } from '@/composables/useRange'
import { loadOpenRanges, type RangeMap } from '@/data/ranges/loaders'
import PositionBar from '@/components/PositionBar.vue'
import HandMatrix from '@/components/HandMatrix.vue'
import StrategyPopup from '@/components/StrategyPopup.vue'

const { currentPosition, setPosition } = usePosition()
const currentScenario = ref<Scenario>('open')

const tablePositions = [
  { name: 'UTG' as Position, style: 'top: 15%; left: 20%' },
  { name: 'UTG1' as Position, style: 'top: 15%; left: 42%' },
  { name: 'MP' as Position, style: 'top: 15%; left: 64%' },
  { name: 'HJ' as Position, style: 'top: 15%; right: 12%' },
  { name: 'CO' as Position, style: 'bottom: 15%; right: 12%' },
  { name: 'BTN' as Position, style: 'bottom: 15%; left: 64%' },
  { name: 'SB' as Position, style: 'bottom: 15%; left: 42%' },
  { name: 'BB' as Position, style: 'bottom: 15%; left: 20%' }
]

const openRanges = ref<RangeMap | null>(null)
const openDataError = ref('')

function countHandCombos(handName: string): number {
  if (handName.length === 2) return 6
  return handName.endsWith('s') ? 4 : 12
}

function getActionWeight(action: HandAction): number {
  if (action.action === 'raise' || action.action === 'call') return 1
  if (action.action === 'mixed' && action.frequency) {
    return (action.frequency.raise || 0) + (action.frequency.call || 0)
  }
  return 0
}

function getOpenPct(position: Position): number {
  const range = openRanges.value?.[position]
  if (!range) return 0

  const combos = Object.entries(range).reduce((sum, [handName, action]) => {
    return sum + countHandCombos(handName) * getActionWeight(action)
  }, 0)

  return Math.round((combos / 1326) * 100)
}

const openPct = computed(() => getOpenPct(currentPosition.value))
const openPctLabel = computed(() => (openRanges.value ? `${openPct.value}%` : '...'))

function setPositionDirect(pos: Position) { setPosition(pos) }
const scenarios: { key: Scenario; label: string }[] = [
  { key: 'open', label: 'Open' },
  { key: 'vs3bet', label: 'vs 3Bet' },
  { key: 'vsOpen', label: 'vs Open' }
]

const { getAction, openerPosition, setOpenerPosition, getValidOpeners, isLoading: isScenarioLoading, error: scenarioError } = useRange(
  () => currentPosition.value, () => currentScenario.value
)
const validOpeners = computed(() => getValidOpeners(currentPosition.value))
const isRangeLoading = computed(() => !openRanges.value || isScenarioLoading.value)
const rangeError = computed(() => openDataError.value || scenarioError.value)

onMounted(async () => {
  try {
    openRanges.value = await loadOpenRanges()
  } catch {
    openDataError.value = '范围数据加载失败，请刷新后重试。'
  }
})

watch([() => currentPosition.value, () => currentScenario.value], () => {
  if (currentScenario.value === 'vsOpen') {
    const valid = getValidOpeners(currentPosition.value)
    if (valid.length > 0 && !valid.includes(openerPosition.value as any)) {
      setOpenerPosition(valid[0])
    }
  }
}, { immediate: true })

const popupVisible = ref(false)
const selectedHand = ref('')
const selectedAction = ref<HandAction>({ action: 'fold' })

function handleSelect(handName: string, row: number, col: number) {
  if (isRangeLoading.value) return
  selectedHand.value = handName
  selectedAction.value = getAction(row, col)
  popupVisible.value = true
}
</script>

<style scoped>
.home { min-height: 100vh; display: flex; flex-direction: column; }
.app-header { padding: calc(env(safe-area-inset-top) + 12px) 20px 8px; }
.app-logo { font-family: var(--font-display); font-size: 22px; font-weight: 900; letter-spacing: -0.02em; }
.logo-accent { color: var(--accent-green); margin-left: 2px; }
.scenario-tabs { display: flex; gap: 8px; padding: 8px 16px; }
.tab-btn {
  flex: 1; padding: 10px 8px; border: 1px solid var(--border-subtle); border-radius: var(--radius-md);
  background: var(--bg-glass); color: var(--text-secondary); font-family: var(--font-body);
  font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; -webkit-tap-highlight-color: transparent;
}
.tab-btn.active {
  background: var(--accent-green-dim); border-color: var(--border-active); color: var(--accent-green);
  box-shadow: 0 0 20px rgba(52, 211, 153, 0.08);
}
.opener-select { display: flex; align-items: center; gap: 6px; padding: 6px 16px; overflow-x: auto; scrollbar-width: none; }
.opener-select::-webkit-scrollbar { display: none; }
.opener-label { font-size: 11px; color: var(--text-muted); flex-shrink: 0; }
.opener-btn {
  flex-shrink: 0; padding: 5px 10px; border: 1px solid var(--border-subtle); border-radius: 14px;
  background: transparent; color: var(--text-secondary); font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.opener-btn.active { background: rgba(251,146,60,0.12); border-color: rgba(251,146,60,0.4); color: #fb923c; }

.legend { display: flex; gap: 12px; justify-content: center; padding: 8px 16px; flex-wrap: wrap; }
.legend-item { display: flex; align-items: center; gap: 4px; font-size: 10px; color: var(--text-secondary); }
.dot { width: 10px; height: 10px; border-radius: 2px; }
.dot-raise { background: linear-gradient(135deg, #059669, #34d399); }
.dot-call { background: linear-gradient(135deg, #1d4ed8, #60a5fa); }
.dot-mixed { background: linear-gradient(135deg, #059669, #d97706); }
.dot-fold { background: rgba(255,255,255,0.08); }

.table-visual { padding: 0 16px; margin-bottom: 8px; }
.table-felt {
  position: relative; width: 100%; aspect-ratio: 2.2; border-radius: 50%/46%;
  background: radial-gradient(ellipse at center, #0d4a2c 0%, #072a18 100%);
  border: 3px solid #8B6914; box-shadow: inset 0 0 30px rgba(0,0,0,0.4);
}
.table-pos {
  position: absolute; transform: translate(-50%, -50%);
  padding: 4px 8px; border-radius: 12px; font-size: 9px; font-weight: 800;
  background: rgba(0,0,0,0.6); color: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.15);
  cursor: pointer; transition: all 0.25s; z-index: 2;
}
.table-pos.active {
  background: var(--accent-green); color: #000; border-color: var(--accent-green);
  box-shadow: 0 0 12px rgba(52,211,153,0.4); transform: translate(-50%, -50%) scale(1.15);
}
.table-center {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  font-family: var(--font-display); font-size: 20px; font-weight: 900; color: var(--accent-gold);
}
.load-state {
  margin: 8px 16px;
  padding: 12px;
  border-radius: var(--radius-md);
  background: rgba(255,255,255,0.04);
  color: var(--text-secondary);
  text-align: center;
  font-size: 12px;
}
.load-state.error {
  background: rgba(239,68,68,0.1);
  border: 1px solid rgba(239,68,68,0.25);
  color: #fca5a5;
}
.data-source {
  padding: 8px 16px; margin: 4px 0 60px; font-size: 9px; color: rgba(255,255,255,0.3);
  text-align: center; line-height: 1.5;
}
</style>

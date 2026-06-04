<template>
  <div class="home">
    <header class="app-header">
      <h1 class="app-logo">♠ GTO<span class="logo-accent">Lab</span></h1>
    </header>

    <PositionBar />

    <div class="scenario-tabs">
      <button v-for="s in scenarios" :key="s.key"
        :class="['tab-btn', { active: currentScenario === s.key }]" @click="currentScenario = s.key">{{ s.label }}</button>
    </div>

    <div v-if="currentScenario === 'vsOpen'" class="opener-select">
      <span class="opener-label">对手位置:</span>
      <button v-for="pos in validOpeners" :key="pos"
        :class="['opener-btn', { active: openerPosition === pos }]" @click="setOpenerPosition(pos)">{{ pos }}</button>
    </div>

    <HandMatrix :get-action="getAction" @select="handleSelect" />

    <StrategyPopup :visible="popupVisible" :hand-name="selectedHand" :position="currentPosition"
      :scenario="currentScenario" :action="selectedAction" @close="popupVisible = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Scenario, HandAction } from '@/types/poker'
import { usePosition } from '@/composables/usePosition'
import { useRange } from '@/composables/useRange'
import PositionBar from '@/components/PositionBar.vue'
import HandMatrix from '@/components/HandMatrix.vue'
import StrategyPopup from '@/components/StrategyPopup.vue'

const { currentPosition } = usePosition()
const currentScenario = ref<Scenario>('open')
const scenarios: { key: Scenario; label: string }[] = [
  { key: 'open', label: 'Open' },
  { key: 'vs3bet', label: 'vs 3Bet' },
  { key: 'vsOpen', label: 'vs Open' }
]

const { getAction, openerPosition, setOpenerPosition, getValidOpeners } = useRange(
  () => currentPosition.value, () => currentScenario.value
)
const validOpeners = computed(() => getValidOpeners(currentPosition.value))

const popupVisible = ref(false)
const selectedHand = ref('')
const selectedAction = ref<HandAction>({ action: 'fold' })

function handleSelect(handName: string, row: number, col: number) {
  selectedHand.value = handName
  selectedAction.value = getAction(row, col)
  popupVisible.value = true
}
</script>

<style scoped>
.home { min-height: 100vh; display: flex; flex-direction: column; }
.app-header { padding: 16px 20px 8px; }
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
</style>

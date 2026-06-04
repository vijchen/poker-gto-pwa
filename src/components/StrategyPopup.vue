<script setup lang="ts">
import type { HandAction, Position, Scenario } from '@/types/poker'

const props = defineProps<{
  visible: boolean
  handName: string
  position: Position
  scenario: Scenario
  action: HandAction
}>()

const emit = defineEmits<{
  close: []
}>()

function actionLabel(action: HandAction): string {
  switch (action.action) {
    case 'raise': return `RAISE ${action.raiseSize || ''}`
    case 'call': return 'CALL'
    case 'fold': return 'FOLD'
    case 'mixed': return 'MIXED'
    default: return '-'
  }
}

function actionColor(type: string): string {
  switch (type) {
    case 'raise': return '#22c55e'
    case 'call': return '#3b82f6'
    case 'fold': return '#6b7280'
    default: return '#eab308'
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="popup">
      <div v-if="visible" class="popup-overlay" @click.self="emit('close')">
        <div class="popup-sheet">
          <div class="popup-handle"></div>

          <div class="popup-header">
            <h2 class="hand-name">{{ handName }}</h2>
            <span class="position-badge">{{ position }}</span>
          </div>

          <div class="popup-body">
            <div class="action-main" :style="{ borderColor: actionColor(action.action) }">
              <span class="action-label" :style="{ color: actionColor(action.action) }">
                {{ actionLabel(action) }}
              </span>
              <span v-if="action.action !== 'mixed'" class="action-freq">100%</span>
            </div>

            <div v-if="action.action === 'mixed' && action.frequency" class="freq-breakdown">
              <div v-if="action.frequency.raise > 0" class="freq-item">
                <span class="freq-dot" style="background: #22c55e"></span>
                <span>Raise</span>
                <span class="freq-pct">{{ (action.frequency.raise * 100).toFixed(0) }}%</span>
              </div>
              <div v-if="action.frequency.call > 0" class="freq-item">
                <span class="freq-dot" style="background: #3b82f6"></span>
                <span>Call</span>
                <span class="freq-pct">{{ (action.frequency.call * 100).toFixed(0) }}%</span>
              </div>
              <div v-if="action.frequency.fold > 0" class="freq-item">
                <span class="freq-dot" style="background: #6b7280"></span>
                <span>Fold</span>
                <span class="freq-pct">{{ (action.frequency.fold * 100).toFixed(0) }}%</span>
              </div>
            </div>
          </div>

          <button class="close-btn" @click="emit('close')">关闭</button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.popup-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.popup-sheet {
  width: 100%;
  background: #16213e;
  border-radius: 20px 20px 0 0;
  padding: 16px 24px 32px;
  max-height: 60vh;
}

.popup-handle {
  width: 40px;
  height: 4px;
  background: rgba(255,255,255,0.2);
  border-radius: 2px;
  margin: 0 auto 16px;
}

.popup-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.hand-name { font-size: 28px; font-weight: 800; }

.position-badge {
  padding: 4px 10px;
  background: rgba(74, 222, 128, 0.15);
  color: #4ade80;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.action-main {
  padding: 16px;
  border: 2px solid;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.action-label { font-size: 20px; font-weight: 700; }
.action-freq { font-size: 16px; color: rgba(255,255,255,0.6); }

.freq-breakdown { display: flex; flex-direction: column; gap: 10px; }

.freq-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
}

.freq-dot { width: 10px; height: 10px; border-radius: 50%; }
.freq-pct { margin-left: auto; font-weight: 600; }

.close-btn {
  width: 100%;
  margin-top: 20px;
  padding: 14px;
  border: none;
  border-radius: 12px;
  background: rgba(255,255,255,0.1);
  color: #eee;
  font-size: 16px;
  cursor: pointer;
}

.popup-enter-active, .popup-leave-active { transition: all 0.3s ease; }
.popup-enter-from .popup-sheet, .popup-leave-to .popup-sheet { transform: translateY(100%); }
.popup-enter-from, .popup-leave-to { opacity: 0; }
</style>

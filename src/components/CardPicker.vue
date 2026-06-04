<template>
  <div class="card-picker">
    <div class="picker-header">
      <span class="picker-title">{{ title }}</span>
      <span class="picker-count">{{ selected.length }}/{{ maxCards }}</span>
    </div>
    <div class="suits-grid">
      <div v-for="(suit, sIdx) in suits" :key="suit.symbol" class="suit-row">
        <span class="suit-icon" :style="{ color: suit.color }">{{ suit.symbol }}</span>
        <button
          v-for="rank in ranks"
          :key="rank + suit.key"
          :class="['card-btn', { selected: isSelected(rank, suit.key), disabled: isDisabled(rank, suit.key) }]"
          :style="isSelected(rank, suit.key) ? { background: suit.color, color: '#fff' } : {}"
          :disabled="isDisabled(rank, suit.key)"
          @click="toggleCard(rank, suit.key)"
        >
          {{ rank }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  title?: string
  selected: string[]
  maxCards?: number
  disabled?: string[]
}>(), {
  title: '选择牌',
  maxCards: 2,
  disabled: () => []
})

const emit = defineEmits<{
  update: [cards: string[]]
}>()

const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2']
const suits = [
  { key: 's', symbol: '♠', color: '#1a1a2e' },
  { key: 'h', symbol: '♥', color: '#ef4444' },
  { key: 'd', symbol: '♦', color: '#3b82f6' },
  { key: 'c', symbol: '♣', color: '#22c55e' }
]

function isSelected(rank: string, suit: string): boolean {
  return props.selected.includes(rank + suit)
}

function isDisabled(rank: string, suit: string): boolean {
  const card = rank + suit
  if (props.disabled.includes(card)) return true
  if (!isSelected(rank, suit) && props.selected.length >= props.maxCards) return true
  return false
}

function toggleCard(rank: string, suit: string) {
  const card = rank + suit
  const current = [...props.selected]
  const idx = current.indexOf(card)
  if (idx >= 0) {
    current.splice(idx, 1)
  } else if (current.length < props.maxCards) {
    current.push(card)
  }
  emit('update', current)
}
</script>

<style scoped>
.card-picker { padding: 12px; }
.picker-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.picker-title { font-size: 14px; font-weight: 600; }
.picker-count { font-size: 12px; color: rgba(255,255,255,0.5); }
.suits-grid { display: flex; flex-direction: column; gap: 4px; }
.suit-row { display: flex; align-items: center; gap: 3px; }
.suit-icon { width: 20px; font-size: 16px; text-align: center; flex-shrink: 0; }
.card-btn {
  flex: 1; padding: 6px 2px; border: 1px solid rgba(255,255,255,0.15); border-radius: 4px;
  background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.8); font-size: 11px;
  font-weight: 600; cursor: pointer; -webkit-tap-highlight-color: transparent; transition: all 0.15s;
}
.card-btn.selected { border-color: transparent; transform: scale(1.05); }
.card-btn.disabled { opacity: 0.2; cursor: not-allowed; }
</style>

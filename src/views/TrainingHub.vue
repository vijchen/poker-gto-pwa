<template>
  <div class="hub-page">
    <div class="hub-tabs">
      <button v-for="t in tabs" :key="t.key" :class="['hub-tab', { active: activeTab === t.key }]" @click="activeTab = t.key">{{ t.icon }} {{ t.label }}</button>
    </div>
    <TrainView v-if="activeTab === 'preflop'" />
    <PostflopView v-if="activeTab === 'postflop'" />
    <OddsView v-if="activeTab === 'odds'" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TrainView from './TrainView.vue'
import PostflopView from './PostflopView.vue'
import OddsView from './OddsView.vue'

const activeTab = ref('preflop')
const tabs = [
  { key: 'preflop', icon: '🏋️', label: '翻前' },
  { key: 'postflop', icon: '🏆', label: '翻后' },
  { key: 'odds', icon: '🧮', label: '赔率' }
]
</script>

<style scoped>
.hub-page { padding-top: calc(env(safe-area-inset-top) + 16px); }
.hub-tabs { display: flex; gap: 6px; padding: 0 16px 8px; overflow-x: auto; scrollbar-width: none; }
.hub-tabs::-webkit-scrollbar { display: none; }
.hub-tab { padding: 8px 14px; border-radius: 20px; border: 1px solid var(--border-subtle); background: transparent; color: var(--text-secondary); font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap; flex-shrink: 0; }
.hub-tab.active { background: var(--accent-green-dim); border-color: var(--border-active); color: var(--accent-green); }
</style>

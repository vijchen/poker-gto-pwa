<template>
  <div class="hub-page">
    <div class="hub-tabs">
      <button v-for="t in tabs" :key="t.key" :class="['hub-tab', { active: activeTab === t.key }]" @click="activeTab = t.key">{{ t.icon }} {{ t.label }}</button>
    </div>
    <EquityView v-if="activeTab === 'equity'" />
    <RangesView v-if="activeTab === 'ranges'" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import EquityView from './EquityView.vue'
import RangesView from './RangesView.vue'

const activeTab = ref('equity')
const tabs = [
  { key: 'equity', icon: '📊', label: '胜率' },
  { key: 'ranges', icon: '✏️', label: '范围' }
]
</script>

<style scoped>
.hub-page { padding-top: calc(env(safe-area-inset-top) + 16px); }
.hub-tabs { display: flex; gap: 6px; padding: 0 16px 8px; }
.hub-tab { padding: 8px 14px; border-radius: 20px; border: 1px solid var(--border-subtle); background: transparent; color: var(--text-secondary); font-size: 12px; font-weight: 700; cursor: pointer; }
.hub-tab.active { background: var(--accent-green-dim); border-color: var(--border-active); color: var(--accent-green); }
</style>

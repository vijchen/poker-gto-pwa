<template>
  <div class="hub-page">
    <div class="hub-tabs">
      <button v-for="t in tabs" :key="t.key" :class="['hub-tab', { active: activeTab === t.key }]" @click="activeTab = t.key">{{ t.icon }} {{ t.label }}</button>
    </div>
    <GuideView v-if="activeTab === 'guide'" />
    <GlossaryView v-if="activeTab === 'glossary'" />
    <QuizView v-if="activeTab === 'quiz'" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import GuideView from './GuideView.vue'
import GlossaryView from './GlossaryView.vue'
import QuizView from './QuizView.vue'

const activeTab = ref('guide')
const tabs = [
  { key: 'guide', icon: '🌱', label: '入门' },
  { key: 'glossary', icon: '📖', label: '词典' },
  { key: 'quiz', icon: '🧠', label: '测验' }
]
</script>

<style scoped>
.hub-page { padding-top: 8px; }
.hub-tabs { display: flex; gap: 6px; padding: 0 16px 8px; }
.hub-tab { padding: 8px 14px; border-radius: 20px; border: 1px solid var(--border-subtle); background: transparent; color: var(--text-secondary); font-size: 12px; font-weight: 700; cursor: pointer; }
.hub-tab.active { background: var(--accent-green-dim); border-color: var(--border-active); color: var(--accent-green); }
</style>

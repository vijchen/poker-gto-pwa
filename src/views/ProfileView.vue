<template>
  <div class="hub-page">
    <div class="hub-tabs">
      <button v-for="t in tabs" :key="t.key" :class="['hub-tab', { active: activeTab === t.key }]" @click="activeTab = t.key">{{ t.icon }} {{ t.label }}</button>
    </div>
    <StatsView v-if="activeTab === 'stats'" />
    <HandLogView v-if="activeTab === 'handlog'" />
    <div v-if="activeTab === 'settings'" class="settings-section">
      <h3 class="settings-title">设置</h3>
      <div class="setting-item">
        <div class="setting-info">
          <span class="setting-name">清除缓存</span>
          <span class="setting-desc">清除 PWA 缓存和 Service Worker，获取最新版本</span>
        </div>
        <button class="setting-btn danger" @click="clearCache">清除</button>
      </div>
      <div class="setting-item">
        <div class="setting-info">
          <span class="setting-name">重置训练数据</span>
          <span class="setting-desc">清除所有训练进度、成就和记录</span>
        </div>
        <button class="setting-btn warn" @click="resetProgress">重置</button>
      </div>
      <p v-if="cacheMsg" class="cache-msg">{{ cacheMsg }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import StatsView from './StatsView.vue'
import HandLogView from './HandLogView.vue'

const activeTab = ref('stats')
const tabs = [
  { key: 'stats', icon: '📈', label: '进度' },
  { key: 'handlog', icon: '📝', label: '记牌' },
  { key: 'settings', icon: '⚙️', label: '设置' }
]

const cacheMsg = ref('')

async function clearCache() {
  try {
    const registrations = await navigator.serviceWorker.getRegistrations()
    for (const reg of registrations) {
      await reg.unregister()
    }
    const keys = await caches.keys()
    for (const key of keys) {
      await caches.delete(key)
    }
    cacheMsg.value = '✅ 缓存已清除，将自动刷新...'
    setTimeout(() => window.location.reload(), 1500)
  } catch (e) {
    cacheMsg.value = '❌ 清除失败: ' + (e as Error).message
  }
}

function resetProgress() {
  if (confirm('确定要清除所有训练进度吗？此操作不可撤销。')) {
    localStorage.clear()
    cacheMsg.value = '✅ 数据已重置，将自动刷新...'
    setTimeout(() => window.location.reload(), 1500)
  }
}
</script>

<style scoped>
.hub-page { padding-top: calc(env(safe-area-inset-top) + 16px); }
.hub-tabs { display: flex; gap: 6px; padding: 0 16px 8px; }
.hub-tab { padding: 8px 14px; border-radius: 20px; border: 1px solid var(--border-subtle); background: transparent; color: var(--text-secondary); font-size: 12px; font-weight: 700; cursor: pointer; }
.hub-tab.active { background: var(--accent-green-dim); border-color: var(--border-active); color: var(--accent-green); }
.settings-section { padding: 16px; }
.settings-title { font-size: 18px; font-weight: 700; margin-bottom: 16px; }
.setting-item { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid var(--border-subtle); }
.setting-info { display: flex; flex-direction: column; gap: 4px; }
.setting-name { font-size: 14px; font-weight: 600; }
.setting-desc { font-size: 11px; color: var(--text-muted); }
.setting-btn { padding: 8px 16px; border: none; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; }
.setting-btn.danger { background: rgba(239,68,68,0.15); color: #f87171; }
.setting-btn.warn { background: rgba(234,179,8,0.15); color: #eab308; }
.cache-msg { margin-top: 16px; padding: 12px; border-radius: 8px; background: rgba(255,255,255,0.05); font-size: 13px; text-align: center; }
</style>

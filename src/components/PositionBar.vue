<script setup lang="ts">
import { usePosition } from '@/composables/usePosition'
const { currentPosition, positions, setPosition } = usePosition()
</script>

<template>
  <div class="position-bar">
    <button v-for="pos in positions" :key="pos"
      :class="['pos-btn', { active: currentPosition === pos }]" @click="setPosition(pos)">{{ pos }}</button>
  </div>
</template>

<style scoped>
.position-bar {
  display: flex; gap: 6px; padding: 10px 16px;
  overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none;
}
.position-bar::-webkit-scrollbar { display: none; }
.pos-btn {
  flex-shrink: 0; padding: 8px 14px; border: 1px solid var(--border-subtle); border-radius: 20px;
  background: var(--bg-glass); color: var(--text-secondary); font-family: var(--font-display);
  font-size: 13px; font-weight: 700; cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); -webkit-tap-highlight-color: transparent;
}
.pos-btn.active {
  background: var(--accent-green); color: var(--bg-primary); border-color: var(--accent-green);
  box-shadow: 0 4px 16px rgba(52, 211, 153, 0.25), 0 0 0 1px rgba(52, 211, 153, 0.3);
  transform: scale(1.05);
}
</style>

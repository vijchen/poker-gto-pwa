<template>
  <div class="app-container">
    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
    <nav class="tab-bar">
      <RouterLink to="/" class="tab-item" active-class="active" exact>
        <span class="tab-icon">🌱</span>
        <span class="tab-label">入门</span>
      </RouterLink>
      <RouterLink to="/stats" class="tab-item" active-class="active">
        <span class="tab-icon">📈</span>
        <span class="tab-label">进度</span>
      </RouterLink>
      <RouterLink to="/strategy" class="tab-item" active-class="active">
        <span class="tab-icon">🎯</span>
        <span class="tab-label">策略</span>
      </RouterLink>
      <RouterLink to="/train" class="tab-item" active-class="active">
        <span class="tab-icon">🏋️</span>
        <span class="tab-label">翻前</span>
      </RouterLink>
      <RouterLink to="/postflop" class="tab-item" active-class="active">
        <span class="tab-icon">🏆</span>
        <span class="tab-label">翻后</span>
      </RouterLink>
      <RouterLink to="/equity" class="tab-item" active-class="active">
        <span class="tab-icon">📊</span>
        <span class="tab-label">胜率</span>
      </RouterLink>
      <RouterLink to="/odds" class="tab-item" active-class="active">
        <span class="tab-icon">🧮</span>
        <span class="tab-label">赔率</span>
      </RouterLink>
      <RouterLink to="/glossary" class="tab-item" active-class="active">
        <span class="tab-icon">📖</span>
        <span class="tab-label">词典</span>
      </RouterLink>
      <RouterLink to="/quiz" class="tab-item" active-class="active">
        <span class="tab-icon">🧠</span>
        <span class="tab-label">测验</span>
      </RouterLink>
      <RouterLink to="/handlog" class="tab-item" active-class="active">
        <span class="tab-icon">📝</span>
        <span class="tab-label">记牌</span>
      </RouterLink>
      <RouterLink to="/ranges" class="tab-item" active-class="active">
        <span class="tab-icon">✏️</span>
        <span class="tab-label">范围</span>
      </RouterLink>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { RouterView, RouterLink } from 'vue-router'
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');

:root {
  --bg-primary: #0a0e1a;
  --bg-secondary: #111827;
  --bg-card: rgba(17, 24, 39, 0.7);
  --bg-glass: rgba(255, 255, 255, 0.03);
  --border-subtle: rgba(255, 255, 255, 0.06);
  --border-active: rgba(52, 211, 153, 0.4);
  --accent-green: #34d399;
  --accent-green-dim: rgba(52, 211, 153, 0.15);
  --accent-gold: #fbbf24;
  --accent-red: #f87171;
  --accent-blue: #60a5fa;
  --text-primary: #f1f5f9;
  --text-secondary: rgba(241, 245, 249, 0.6);
  --text-muted: rgba(241, 245, 249, 0.35);
  --font-display: 'Outfit', sans-serif;
  --font-body: 'DM Sans', sans-serif;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: var(--font-body);
  background: var(--bg-primary);
  color: var(--text-primary);
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.02'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 9999;
}

body::after {
  content: '';
  position: fixed;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(ellipse at 30% 20%, rgba(52, 211, 153, 0.03) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 80%, rgba(96, 165, 250, 0.02) 0%, transparent 50%);
  pointer-events: none;
  z-index: -1;
}
</style>

<style scoped>
.app-container {
  min-height: 100vh;
  min-height: 100dvh;
  padding-bottom: 70px;
}

.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background: rgba(10, 14, 26, 0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid var(--border-subtle);
  padding: 6px 4px;
  padding-bottom: calc(6px + env(safe-area-inset-bottom));
  z-index: 100;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  text-decoration: none;
  color: var(--text-muted);
  font-size: 9px;
  font-weight: 600;
  transition: all 0.2s ease;
  padding: 4px 0;
  border-radius: var(--radius-sm);
}

.tab-item.active {
  color: var(--accent-green);
  background: var(--accent-green-dim);
}

.tab-icon { font-size: 18px; line-height: 1; }
.tab-label { font-family: var(--font-body); letter-spacing: 0.02em; }

.page-enter-active, .page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.page-enter-from { opacity: 0; transform: translateY(8px); }
.page-leave-to { opacity: 0; transform: translateY(-4px); }
</style>

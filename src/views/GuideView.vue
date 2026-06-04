<template>
  <div class="guide-page">
    <header class="guide-header">
      <h1 class="guide-title">🌱 新手入门</h1>
      <p class="guide-desc">零基础学德州扑克 · 规则、流程、术语一站掌握</p>
    </header>
    <div class="modules">
      <div v-for="(mod, idx) in modules" :key="mod.title" class="module-card" @click="toggle(idx)">
        <div class="module-header">
          <span class="module-icon">{{ mod.icon }}</span>
          <span class="module-title">{{ mod.title }}</span>
          <span class="module-badge">{{ mod.badge }}</span>
          <span class="module-arrow" :class="{ open: openIdx === idx }">▼</span>
        </div>
        <div v-if="openIdx === idx" class="module-body">
          <div v-for="item in mod.items" :key="item.title" class="item">
            <h4 class="item-title">{{ item.title }}</h4>
            <p class="item-desc">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const openIdx = ref<number | null>(null)
function toggle(idx: number) { openIdx.value = openIdx.value === idx ? null : idx }

const modules = [
  { icon: '🎴', title: '游戏基础', badge: '核心规则', items: [
    { title: '目标', desc: '用 2 张手牌 + 5 张公共牌组成最强的 5 张牌组合，赢取底池。' },
    { title: '牌桌人数', desc: '通常 2-9 人，最常见 6 人桌和 9 人桌。我们针对 7-8 人桌优化。' },
    { title: '筹码', desc: '用筹码代替现金下注。买入通常是 100 个大盲注（100BB）。' },
    { title: '盲注', desc: '每手牌强制下注：小盲（SB）= 0.5BB，大盲（BB）= 1BB。确保每手都有底池争夺。' },
    { title: '无限注（No-Limit）', desc: '最流行的格式。任何时候可以全押所有筹码。下注最少是大盲或前一个下注的两倍，但上不封顶。' },
    { title: '胜利条件', desc: '两种赢法：① 摊牌时牌型最大；② 下注让所有人弃牌。这意味着不一定需要好牌——诈唬是游戏重要组成部分。' },
    { title: '庄家按钮', desc: 'BTN 标记决定位置顺序，每手牌顺时针轮转。' }
  ]},
  { icon: '🔄', title: '一手牌的流程', badge: '7个阶段', items: [
    { title: '1. 发底牌', desc: '每人发 2 张面朝下的底牌，只有自己能看。' },
    { title: '2. 翻前下注（Preflop）', desc: '从 UTG 开始顺时针行动：弃牌、跟注或加注。SB 和 BB 已投盲注。' },
    { title: '3. 翻牌（Flop）', desc: '烧一张牌，翻出 3 张公共牌。现在能看到 5 张（2 底牌 + 3 公共）。新一轮下注。' },
    { title: '4. 转牌（Turn）', desc: '再烧一张，翻出第 4 张公共牌。下注通常变大，决策更关键。' },
    { title: '5. 河牌（River）', desc: '烧一张，翻出第 5 张最后公共牌。最后一轮下注。' },
    { title: '6. 摊牌（Showdown）', desc: '≥2 人亮牌比大小。最佳 5 张组合最大的赢全部底池。' },
    { title: '7. 下一手', desc: '庄家按钮顺时针移一位，盲注轮换。每手独立。' }
  ]},
  { icon: '🏆', title: '牌型大小排名', badge: '10种牌型', items: [
    { title: '1. 皇家同花顺', desc: 'A♠K♠Q♠J♠T♠ — 同花色 AKQJT，概率 0.000154%。极其罕见。' },
    { title: '2. 同花顺', desc: '9♥8♥7♥6♥5♥ — 五张连续且同花色，概率 0.00139%。' },
    { title: '3. 四条', desc: 'K♠K♥K♦K♣7♠ — 四张相同面值，概率 0.024%。' },
    { title: '4. 葫芦', desc: 'A♠A♥A♦K♠K♥ — 三条+一对，概率 0.144%。' },
    { title: '5. 同花', desc: 'A♣J♣8♣5♣2♣ — 五张相同花色，概率 0.197%。' },
    { title: '6. 顺子', desc: 'T♠9♥8♦7♣6♠ — 五张连续，概率 0.392%。' },
    { title: '7. 三条', desc: 'Q♠Q♥Q♦7♠3♣ — 三张相同面值，概率 2.11%。' },
    { title: '8. 两对', desc: 'J♠J♥5♦5♣K♠ — 两组对子，概率 4.75%。' },
    { title: '9. 一对', desc: 'T♠T♥A♦8♣4♠ — 两张相同面值，概率 42.3%。' },
    { title: '10. 高牌', desc: 'A♠J♥8♦5♣2♠ — 无任何组合，比最大单张，概率 50.1%。' }
  ]},
  { icon: '📍', title: '位置详解', badge: '8个位置', items: [
    { title: 'UTG（枪口）', desc: '翻前第一个行动，范围最紧。开池约 12%。' },
    { title: 'UTG+1', desc: '第二个行动，略宽于 UTG。开池约 14%。' },
    { title: 'MP（中位）', desc: '中间位置，范围适中。开池约 17%。' },
    { title: 'HJ（劫持位）', desc: '开始进入后位区域。开池约 21%。' },
    { title: 'CO（关煞位）', desc: 'BTN 左边，好的偷盲位置。开池约 27%。' },
    { title: 'BTN（按钮位）', desc: '最佳位置！翻后最后行动。开池约 42%。' },
    { title: 'SB（小盲）', desc: '翻后第一个行动，位置不利。' },
    { title: 'BB（大盲）', desc: '翻前最后行动有利，翻后位置差。' }
  ]},
  { icon: '💡', title: '新手黄金建议', badge: '10条建议', items: [
    { title: '1. 打紧一点', desc: '新手最大错误是玩太多牌。只玩前 15-20% 的牌。' },
    { title: '2. 位置很重要', desc: '同一手牌在 BTN 可以开池，在 UTG 必须弃牌。' },
    { title: '3. 不要跛入', desc: '翻前要么加注要么弃牌，不要只跟注大盲。' },
    { title: '4. 学会弃牌', desc: '好的玩家弃牌比跟注多得多。' },
    { title: '5. 注意底池赔率', desc: '跟注前算赔率，确保有正期望值。' },
    { title: '6. 不要追逐听牌', desc: '除非赔率合适，否则不要追同花或顺子。' },
    { title: '7. 控制情绪', desc: '输了不要上头（tilt），坚持 GTO 策略。' },
    { title: '8. 观察对手', desc: '注意对手的下注模式和频率。' },
    { title: '9. 资金管理', desc: '不要用超过总资金 5% 的钱玩单场。' },
    { title: '10. 持续学习', desc: '每天用这个 App 练习 10 分钟比盲目打 100 手有用。' }
  ]}
]
</script>

<style scoped>
.guide-page { padding: 16px; padding-bottom: 80px; }
.guide-header { margin-bottom: 16px; }
.guide-title { font-family: var(--font-display); font-size: 22px; font-weight: 800; }
.guide-desc { font-size: 12px; color: var(--text-secondary); margin-top: 4px; }
.modules { display: flex; flex-direction: column; gap: 10px; }
.module-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); overflow: hidden; cursor: pointer; }
.module-header { display: flex; align-items: center; gap: 10px; padding: 14px 16px; }
.module-icon { font-size: 20px; }
.module-title { font-size: 15px; font-weight: 700; flex: 1; }
.module-badge { font-size: 11px; padding: 2px 8px; background: var(--accent-green-dim); color: var(--accent-green); border-radius: 10px; font-weight: 600; }
.module-arrow { font-size: 10px; color: var(--text-muted); transition: transform 0.3s; }
.module-arrow.open { transform: rotate(180deg); }
.module-body { padding: 0 16px 14px; }
.item { padding: 10px 0; border-bottom: 1px solid var(--border-subtle); }
.item:last-child { border-bottom: none; }
.item-title { font-size: 13px; font-weight: 700; margin-bottom: 3px; color: var(--accent-gold); }
.item-desc { font-size: 12px; color: var(--text-secondary); line-height: 1.5; }
</style>

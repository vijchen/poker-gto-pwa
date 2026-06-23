<template>
  <div class="train-page">
    <h2 class="page-title">翻前训练</h2>

    <div class="train-mode">
      <button :class="['mode-btn', { active: trainMode === 'basic' }]" @click="switchToBasic">开池训练</button>
      <button :class="['mode-btn', { active: trainMode === 'advanced' }]" @click="trainMode = 'advanced'; advIdx = 0; advAnswered = false">进阶场景</button>
    </div>

    <div class="stats-bar">
      <span class="stat">正确率 <strong>{{ accuracy }}%</strong></span>
      <span class="stat">连胜 <strong>{{ streak }}</strong></span>
      <span class="stat">已练 <strong>{{ totalPlayed }}</strong></span>
    </div>

    <template v-if="trainMode === 'basic'">
    <div v-if="isRangeLoading" class="load-card">正在加载训练范围...</div>
    <div v-else-if="rangeLoadError" class="load-card error">{{ rangeLoadError }}</div>
    <template v-else>

    <div class="hand-display">
      <div class="card-visual" :class="suitClass(currentHand[0])">{{ formatCard(currentHand[0]) }}</div>
      <div class="card-visual" :class="suitClass(currentHand[1])">{{ formatCard(currentHand[1]) }}</div>
    </div>

    <div class="position-indicator">
      <span class="pos-label">你的位置</span>
      <span class="pos-value">{{ currentPosition }}</span>
    </div>

    <div v-if="!showResult" class="decision-area">
      <button class="btn-raise" @click="decide('raise')">RAISE</button>
      <button class="btn-fold" @click="decide('fold')">FOLD</button>
    </div>

    <div v-else class="result-area">
      <div :class="['result-badge', isCorrect ? 'correct' : 'wrong']">
        {{ isCorrect ? '✓ 正确' : '✗ 错误' }}
      </div>
      <div class="gto-answer">
        <span>GTO建议: </span>
        <strong :class="gtoAction === 'raise' ? 'text-green' : gtoAction === 'fold' ? 'text-gray' : 'text-yellow'">
          {{ gtoActionLabel }}
        </strong>
      </div>
      <div v-if="!isCorrect" class="ev-loss">
        <span class="ev-icon">⚠️</span>
        <span>EV 损失估算: <strong>-{{ evLoss }} BB/手</strong></span>
      </div>
      <button class="btn-next" @click="nextHand">下一手 →</button>
    </div>
    </template>
    </template>

    <!-- 进阶场景 -->
    <template v-if="trainMode === 'advanced'">
      <div v-if="currentAdv" class="adv-card">
        <div class="adv-header"><span class="adv-hand">{{ currentAdv.hand }}</span><span class="adv-pos">{{ currentAdv.position }}</span><span :class="['adv-diff', currentAdv.difficulty]">{{ currentAdv.difficulty }}</span></div>
        <p class="adv-situation">{{ currentAdv.situation }}</p>
        <p class="adv-question">{{ currentAdv.question }}</p>
        <div v-if="!advAnswered" class="adv-options">
          <button v-for="(opt, idx) in currentAdv.options" :key="idx" class="adv-opt" @click="answerAdv(idx)">{{ opt }}</button>
        </div>
        <div v-else class="adv-result">
          <div :class="['result-badge', advCorrect ? 'correct' : 'wrong']">{{ advCorrect ? '✓ 正确' : '✗ 错误' }}</div>
          <div class="adv-explain">{{ currentAdv.explain }}</div>
          <button class="btn-next" @click="nextAdv">下一题 →</button>
        </div>
      </div>
      <div v-else class="complete">🎉 全部完成！<button class="btn-next" @click="resetAdv">重来</button></div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Position, HandAction } from '@/types/poker'
import { POSITIONS, RANKS } from '@/types/poker'
import { loadOpenRanges, type RangeMap } from '@/data/ranges/loaders'
import { advancedScenarios } from '@/data/preflop-advanced'
import { useProgressStore } from '@/stores/progressStore'

const trainMode = ref<'basic' | 'advanced'>('basic')
const progressStore = useProgressStore()
const openRanges = ref<RangeMap | null>(null)
const isRangeLoading = ref(true)
const rangeLoadError = ref('')

// State
const currentHand = ref<[string, string]>(['As', 'Kh'])
const currentPosition = ref<Position>('BTN')
const showResult = ref(false)
const isCorrect = ref(false)
const gtoAction = ref<string>('fold')
const totalPlayed = ref(0)
const totalCorrect = ref(0)
const streak = ref(0)
const isRangeReady = computed(() => !!openRanges.value && !isRangeLoading.value)

const accuracy = computed(() => {
  if (totalPlayed.value === 0) return 0
  return Math.round((totalCorrect.value / totalPlayed.value) * 100)
})

const SUITS_DISPLAY: Record<string, { symbol: string; cls: string }> = {
  s: { symbol: '♠', cls: 'suit-spade' },
  h: { symbol: '♥', cls: 'suit-heart' },
  d: { symbol: '♦', cls: 'suit-diamond' },
  c: { symbol: '♣', cls: 'suit-club' }
}

function formatCard(card: string): string {
  return card[0] + SUITS_DISPLAY[card[1]].symbol
}

function suitClass(card: string): string {
  return SUITS_DISPLAY[card[1]].cls
}

function randomHand(): { cards: [string, string]; handName: string; position: Position } {
  const suits = ['s', 'h', 'd', 'c']
  const validPositions = POSITIONS.filter(p => p !== 'BB')
  const position = validPositions[Math.floor(Math.random() * validPositions.length)]

  const allCards: string[] = []
  for (const r of RANKS) for (const s of suits) allCards.push(r + s)

  const idx1 = Math.floor(Math.random() * allCards.length)
  let idx2 = Math.floor(Math.random() * (allCards.length - 1))
  if (idx2 >= idx1) idx2++

  const card1 = allCards[idx1]
  const card2 = allCards[idx2]

  const r1 = RANKS.indexOf(card1[0] as any)
  const r2 = RANKS.indexOf(card2[0] as any)
  let handName: string
  if (card1[0] === card2[0]) {
    handName = card1[0] + card2[0]
  } else if (card1[1] === card2[1]) {
    handName = r1 < r2 ? card1[0] + card2[0] + 's' : card2[0] + card1[0] + 's'
  } else {
    handName = r1 < r2 ? card1[0] + card2[0] + 'o' : card2[0] + card1[0] + 'o'
  }

  return { cards: [card1, card2], handName, position }
}

function getGtoAction(handName: string, position: Position): HandAction {
  const posData = openRanges.value?.[position]
  if (!posData) return { action: 'fold' }
  return posData[handName] || { action: 'fold' }
}

const gtoActionLabel = computed(() => {
  switch (gtoAction.value) {
    case 'raise': return 'RAISE'
    case 'fold': return 'FOLD'
    case 'mixed': return 'MIXED (可raise可fold)'
    default: return gtoAction.value.toUpperCase()
  }
})

const evLoss = computed(() => {
  if (isCorrect.value) return '0'
  if (gtoAction.value === 'raise') return '1.5'
  if (gtoAction.value === 'fold') return '2.5'
  return '0.5'
})

let currentHandName = ''

function switchToBasic() {
  trainMode.value = 'basic'
  if (isRangeReady.value) nextHand()
}

function nextHand() {
  if (!isRangeReady.value) return
  const { cards, handName, position } = randomHand()
  currentHand.value = cards
  currentPosition.value = position
  currentHandName = handName
  showResult.value = false
}

function decide(userAction: 'raise' | 'fold') {
  if (!isRangeReady.value) return
  const gto = getGtoAction(currentHandName, currentPosition.value)
  gtoAction.value = gto.action

  if (gto.action === 'mixed') {
    isCorrect.value = true
  } else {
    isCorrect.value = userAction === gto.action
  }

  totalPlayed.value++
  if (isCorrect.value) { totalCorrect.value++; streak.value++ }
  else { streak.value = 0 }
  progressStore.recordAnswer('preflop', isCorrect.value)
  showResult.value = true
}

onMounted(async () => {
  try {
    openRanges.value = await loadOpenRanges()
    isRangeLoading.value = false
    if (trainMode.value === 'basic') nextHand()
  } catch {
    rangeLoadError.value = '训练范围加载失败，请刷新后重试。'
  } finally {
    isRangeLoading.value = false
  }
})

// === Advanced mode ===
const advIdx = ref(0)
const advAnswered = ref(false)
const advCorrect = ref(false)
const currentAdv = computed(() => advancedScenarios[advIdx.value] || null)
function answerAdv(idx: number) { advCorrect.value = idx === currentAdv.value!.correctIdx; advAnswered.value = true; progressStore.recordAnswer('preflop', advCorrect.value) }
function nextAdv() { advIdx.value++; advAnswered.value = false }
function resetAdv() { advIdx.value = 0; advAnswered.value = false }
</script>

<style scoped>
.train-page { padding: 16px; padding-bottom: 80px; display: flex; flex-direction: column; align-items: center; }
.page-title { font-size: 20px; font-weight: 700; margin-bottom: 12px; align-self: flex-start; }
.stats-bar { display: flex; gap: 16px; margin-bottom: 24px; }
.stat { font-size: 13px; color: rgba(255,255,255,0.6); }
.stat strong { color: #4ade80; font-size: 15px; }
.hand-display { display: flex; gap: 12px; margin-bottom: 20px; }
.card-visual {
  width: 80px; height: 110px; border-radius: 12px; background: #fff;
  display: flex; align-items: center; justify-content: center;
  font-size: 28px; font-weight: 800; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
}
.suit-spade { color: #1a1a2e; }
.suit-heart { color: #ef4444; }
.suit-diamond { color: #3b82f6; }
.suit-club { color: #22c55e; }
.position-indicator { margin-bottom: 28px; text-align: center; }
.pos-label { font-size: 12px; color: rgba(255,255,255,0.5); display: block; }
.pos-value { font-size: 24px; font-weight: 800; color: #4ade80; }
.decision-area { display: flex; gap: 16px; width: 100%; }
.btn-raise, .btn-fold {
  flex: 1; padding: 18px; border: none; border-radius: 14px;
  font-size: 18px; font-weight: 800; cursor: pointer; -webkit-tap-highlight-color: transparent;
}
.btn-raise { background: #22c55e; color: #052e16; }
.btn-fold { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.2); }
.result-area { display: flex; flex-direction: column; align-items: center; gap: 14px; width: 100%; }
.result-badge { padding: 10px 24px; border-radius: 20px; font-size: 18px; font-weight: 700; }
.result-badge.correct { background: rgba(34,197,94,0.15); color: #22c55e; }
.result-badge.wrong { background: rgba(239,68,68,0.15); color: #ef4444; }
.gto-answer { font-size: 15px; color: rgba(255,255,255,0.7); }
.text-green { color: #22c55e; }
.text-gray { color: #6b7280; }
.text-yellow { color: #eab308; }
.btn-next {
  margin-top: 8px; padding: 14px 40px; border: none; border-radius: 12px;
  background: rgba(255,255,255,0.1); color: #eee; font-size: 16px; font-weight: 600; cursor: pointer;
}
.ev-loss {
  display: flex; align-items: center; gap: 6px; padding: 10px 14px;
  background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
  border-radius: 10px; font-size: 13px; color: rgba(255,255,255,0.7);
}
.ev-loss strong { color: #f87171; }
.ev-icon { font-size: 16px; }
.train-mode { display: flex; gap: 6px; margin-bottom: 14px; width: 100%; }
.mode-btn { flex: 1; padding: 8px; border-radius: 10px; border: 1px solid var(--border-subtle); background: transparent; color: var(--text-secondary); font-size: 12px; font-weight: 700; cursor: pointer; }
.mode-btn.active { background: var(--accent-green-dim); border-color: var(--border-active); color: var(--accent-green); }
.load-card {
  width: 100%;
  padding: 16px;
  border-radius: var(--radius-md);
  background: rgba(255,255,255,0.04);
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: 18px;
}
.load-card.error {
  background: rgba(239,68,68,0.1);
  border: 1px solid rgba(239,68,68,0.25);
  color: #fca5a5;
}
.adv-card { background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: var(--radius-lg); padding: 18px; width: 100%; }
.adv-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.adv-hand { font-family: var(--font-display); font-size: 20px; font-weight: 900; }
.adv-pos { font-size: 10px; padding: 2px 8px; background: var(--accent-green-dim); color: var(--accent-green); border-radius: 8px; font-weight: 700; }
.adv-diff { font-size: 9px; padding: 2px 6px; border-radius: 8px; font-weight: 700; }
.adv-diff.入门 { background: rgba(34,197,94,0.15); color: #4ade80; }
.adv-diff.进阶 { background: rgba(234,179,8,0.15); color: #eab308; }
.adv-diff.困难 { background: rgba(239,68,68,0.15); color: #ef4444; }
.adv-situation { font-size: 12px; color: var(--text-secondary); margin-bottom: 8px; }
.adv-question { font-size: 15px; font-weight: 700; margin-bottom: 12px; }
.adv-options { display: flex; flex-direction: column; gap: 8px; }
.adv-opt { padding: 12px; border: 1px solid var(--border-subtle); border-radius: 10px; background: transparent; color: var(--text-primary); font-size: 14px; font-weight: 600; text-align: left; cursor: pointer; }
.adv-result { display: flex; flex-direction: column; gap: 10px; }
.adv-explain { font-size: 12px; color: var(--text-secondary); background: rgba(255,255,255,0.03); padding: 10px; border-radius: 8px; }
.complete { text-align: center; padding: 30px 0; color: var(--text-secondary); width: 100%; }
</style>

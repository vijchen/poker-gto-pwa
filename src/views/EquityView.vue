<template>
  <div class="equity-page">
    <h2 class="page-title">胜率计算</h2>

    <div class="mode-tabs">
      <button :class="['mode-btn', { active: mode === 'range' }]" @click="mode = 'range'">手牌 vs 范围</button>
      <button :class="['mode-btn', { active: mode === 'hand' }]" @click="mode = 'hand'">手牌 vs 手牌</button>
    </div>

    <CardPicker title="我的手牌" :selected="heroCards" :max-cards="2"
      :disabled="mode === 'hand' ? villainCards.concat(boardCards) : boardCards" @update="heroCards = $event" />

    <template v-if="mode === 'hand'">
      <CardPicker title="对手手牌（复盘用）" :selected="villainCards" :max-cards="2"
        :disabled="heroCards.concat(boardCards)" @update="villainCards = $event" />
    </template>

    <template v-if="mode === 'range'">
      <div class="range-select">
        <label>对手范围（选择对手位置的 Open 范围）</label>
        <div class="range-options">
          <button v-for="r in rangePresets" :key="r.key"
            :class="['range-btn', { active: selectedRange === r.key }]"
            @click="selectedRange = r.key">{{ r.label }}</button>
        </div>
        <p v-if="isRangeLoading" class="helper-text">正在加载范围数据...</p>
        <p v-else-if="heroCards.length === 2 && rangeAvailability.count === 0" class="helper-text">
          当前手牌和公共牌已把这个范围全部阻塞，暂时没有可模拟的对手组合。
        </p>
      </div>

      <div class="precision-select">
        <label>计算精度</label>
        <div class="precision-options">
          <button
            v-for="option in precisionOptions"
            :key="option.key"
            :class="['precision-btn', { active: selectedPrecision === option.key }]"
            @click="selectedPrecision = option.key"
          >
            <span>{{ option.label }}</span>
            <small>{{ option.simulations }} 次</small>
          </button>
        </div>
        <p class="helper-text">{{ precisionHint }}</p>
      </div>
    </template>

    <CardPicker title="公共牌（可选）" :selected="boardCards" :max-cards="5"
      :disabled="mode === 'hand' ? heroCards.concat(villainCards) : heroCards" @update="boardCards = $event" />

    <div class="action-area">
      <button class="calc-btn" :disabled="!canCalc || isCalculating" @click="handleCalc">
        {{ isCalculating ? '计算中...' : '计算胜率' }}
      </button>
      <button class="reset-btn" @click="handleReset">重置</button>
    </div>

    <div v-if="result" class="result-card">
      <div class="result-row"><span class="result-label">我的胜率</span><span class="result-value hero">{{ result.heroEquity }}%</span></div>
      <div class="result-row"><span class="result-label">对手胜率</span><span class="result-value villain">{{ result.villainEquity }}%</span></div>
      <div class="result-row"><span class="result-label">平局</span><span class="result-value tie">{{ result.tie }}%</span></div>
    </div>

    <div v-if="error" class="error-card">
      <p>⚠️ {{ error }}</p>
    </div>

    <div v-if="rangeLoadError" class="error-card">
      <p>⚠️ {{ rangeLoadError }}</p>
    </div>

    <div v-if="mode === 'range'" class="range-info">
      <p>💡 按对手位置范围中的全部合法组合做加权平均；翻牌后和转牌后会走精确枚举，结果更稳定。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { HandAction, Position } from '@/types/poker'
import CardPicker from '@/components/CardPicker.vue'
import { useEquity } from '@/composables/useEquity'
import { loadOpenRanges, type RangeMap } from '@/data/ranges/loaders'

type ConcreteHand = [string, string]

interface RangeCandidate {
  cards: ConcreteHand
  weight: number
  mask: bigint
}

type RangePrecision = 'speed' | 'balanced' | 'precise'

interface PrecisionOption {
  key: RangePrecision
  label: string
  simulations: number
  description: string
}

const SUITS = ['s', 'h', 'd', 'c'] as const
const RANK_ORDER = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'] as const
const HAND_NAME_RE = /^(?:[2-9TJQKA]{2}|[2-9TJQKA]{2}[so])$/
const CARD_BIT_MAP = Object.fromEntries(
  RANK_ORDER.flatMap((rank, rankIdx) =>
    SUITS.map((suit, suitIdx) => {
      const card = rank + suit
      const cardIdx = rankIdx * SUITS.length + suitIdx
      return [card, 1n << BigInt(cardIdx)]
    })
  )
) as Record<string, bigint>
const handComboCache = new Map<string, Array<{ cards: ConcreteHand; mask: bigint }>>()

const mode = ref<'hand' | 'range'>('range')
const heroCards = ref<string[]>([])
const villainCards = ref<string[]>([])
const boardCards = ref<string[]>([])
const selectedRange = ref<Position>('CO')
const selectedPrecision = ref<RangePrecision>('balanced')
const openRanges = ref<RangeMap | null>(null)
const rangeCandidateCache = ref<Partial<Record<Position, RangeCandidate[]>>>({})
const isRangeLoading = ref(true)
const rangeLoadError = ref('')
const precisionOptions: PrecisionOption[] = [
  { key: 'speed', label: '速度', simulations: 600, description: '更快出结果，适合粗略判断。' },
  { key: 'balanced', label: '平衡', simulations: 1500, description: '默认推荐，速度和稳定性更均衡。' },
  { key: 'precise', label: '精准', simulations: 4000, description: '更稳一些，但等待时间会更长。' }
]

function countHandCombos(handName: string): number {
  if (handName.length === 2) return 6
  return handName.endsWith('s') ? 4 : 12
}

function getActionWeight(action: HandAction): number {
  if (action.action === 'raise' || action.action === 'call') return 1
  if (action.action === 'mixed' && action.frequency) {
    return (action.frequency.raise || 0) + (action.frequency.call || 0)
  }
  return 0
}

function getOpenPct(position: Position): number {
  const range = openRanges.value?.[position]
  if (!range) return 0

  const combos = Object.entries(range).reduce((sum, [handName, action]) => {
    return sum + countHandCombos(handName) * getActionWeight(action)
  }, 0)

  return Math.round((combos / 1326) * 100)
}

const rangePositions: Position[] = ['UTG', 'UTG1', 'MP', 'HJ', 'CO', 'BTN', 'SB']
const rangePresets = computed(() => rangePositions.map((position) => ({
  key: position,
  label: openRanges.value ? `${position} ${getOpenPct(position)}%` : position
})))

function getCardBit(card: string): bigint {
  return CARD_BIT_MAP[card] ?? 0n
}

function getHandMask(cards: readonly string[]): bigint {
  let mask = 0n
  for (const card of cards) {
    mask |= getCardBit(card)
  }
  return mask
}

function getCombosForHand(name: string): Array<{ cards: ConcreteHand; mask: bigint }> {
  const cached = handComboCache.get(name)
  if (cached) return cached
  if (!HAND_NAME_RE.test(name)) return []

  const combos: ConcreteHand[] = []

  if (name.length === 2) {
    const rank = name[0]
    for (let i = 0; i < SUITS.length; i++) {
      for (let j = i + 1; j < SUITS.length; j++) {
        const first = rank + SUITS[i]
        const second = rank + SUITS[j]
        combos.push([first, second])
      }
    }
  } else {
    const firstRank = name[0]
    const secondRank = name[1]
    const isSuited = name[2] === 's'

    for (const firstSuit of SUITS) {
      for (const secondSuit of SUITS) {
        if (isSuited && firstSuit !== secondSuit) continue
        if (!isSuited && firstSuit === secondSuit) continue

        const first = firstRank + firstSuit
        const second = secondRank + secondSuit
        combos.push([first, second])
      }
    }
  }

  const comboEntries = combos.map((cards) => ({
    cards,
    mask: getHandMask(cards)
  }))

  handComboCache.set(name, comboEntries)
  return comboEntries
}

function buildRangeCandidateCache(rangeMap: RangeMap): Partial<Record<Position, RangeCandidate[]>> {
  const cache: Partial<Record<Position, RangeCandidate[]>> = {}

  for (const position of rangePositions) {
    const posData = rangeMap[position]
    if (!posData) continue

    const candidates: RangeCandidate[] = []
    for (const [handName, action] of Object.entries(posData)) {
      const weight = getActionWeight(action)
      if (weight <= 0) continue

      const combos = getCombosForHand(handName)
      for (const combo of combos) {
        candidates.push({
          cards: combo.cards,
          weight,
          mask: combo.mask
        })
      }
    }

    cache[position] = candidates
  }

  return cache
}

const blockedMask = computed(() => getHandMask([...heroCards.value, ...boardCards.value]))

const availableRangeCandidates = computed(() => {
  const candidates = rangeCandidateCache.value[selectedRange.value] ?? []
  const mask = blockedMask.value

  return candidates.filter((candidate) => (candidate.mask & mask) === 0n)
})

const rangeAvailability = computed(() => {
  let totalWeight = 0
  for (const candidate of availableRangeCandidates.value) {
    totalWeight += candidate.weight
  }

  return {
    count: availableRangeCandidates.value.length,
    totalWeight
  }
})

const rangeWorkerPayload = computed(() =>
  availableRangeCandidates.value.map(({ cards, weight }) => ({ cards, weight }))
)

const selectedPrecisionOption = computed(
  () => precisionOptions.find((option) => option.key === selectedPrecision.value) ?? precisionOptions[1]
)

const precisionHint = computed(() => {
  const street = boardCards.value.length
  if (street >= 4) {
    return '当前已进入后街，系统会自动走精确枚举；这个档位主要影响翻牌前和翻牌圈。'
  }

  return `${selectedPrecisionOption.value.label}：${selectedPrecisionOption.value.description}`
})

const { isCalculating, result, error, calculate, calculateRange, reset } = useEquity()

onMounted(async () => {
  try {
    openRanges.value = await loadOpenRanges()
    rangeCandidateCache.value = buildRangeCandidateCache(openRanges.value)
  } catch {
    rangeLoadError.value = '范围数据加载失败，请稍后重试。'
  } finally {
    isRangeLoading.value = false
  }
})

const canCalc = computed(() => {
  if (heroCards.value.length !== 2) return false
  if (mode.value === 'hand' && villainCards.value.length !== 2) return false
  if (mode.value === 'range' && (!openRanges.value || isRangeLoading.value || rangeAvailability.value.count === 0)) return false
  return true
})

function handleCalc() {
  if (mode.value === 'hand') {
    calculate(heroCards.value, villainCards.value, boardCards.value)
  } else {
    if (rangeWorkerPayload.value.length === 0) return
    calculateRange(
      heroCards.value,
      rangeWorkerPayload.value,
      boardCards.value,
      selectedPrecisionOption.value.simulations
    )
  }
}

function handleReset() {
  heroCards.value = []
  villainCards.value = []
  boardCards.value = []
  selectedRange.value = 'CO'
  selectedPrecision.value = 'balanced'
  reset()
}
</script>

<style scoped>
.equity-page { padding: 16px; padding-bottom: 80px; }
.page-title { font-size: 20px; font-weight: 700; margin-bottom: 12px; }
.mode-tabs { display: flex; gap: 6px; margin-bottom: 12px; }
.mode-btn { flex: 1; padding: 8px; border-radius: 10px; border: 1px solid var(--border-subtle); background: transparent; color: var(--text-secondary); font-size: 12px; font-weight: 700; cursor: pointer; }
.mode-btn.active { background: var(--accent-green-dim); border-color: var(--border-active); color: var(--accent-green); }
.range-select { padding: 12px 0; }
.range-select label { font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 8px; }
.range-options { display: flex; flex-wrap: wrap; gap: 6px; }
.precision-select { padding-bottom: 12px; }
.precision-select label { font-size: 12px; color: var(--text-muted); display: block; margin-bottom: 8px; }
.precision-options { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.helper-text { margin-top: 8px; font-size: 11px; color: var(--text-muted); }
.range-btn { padding: 6px 10px; border-radius: 8px; border: 1px solid var(--border-subtle); background: transparent; color: var(--text-secondary); font-size: 11px; font-weight: 600; cursor: pointer; }
.range-btn.active { background: var(--accent-green-dim); border-color: var(--border-active); color: var(--accent-green); }
.precision-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid var(--border-subtle);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}
.precision-btn span { font-size: 12px; font-weight: 700; }
.precision-btn small { font-size: 10px; color: var(--text-muted); }
.precision-btn.active {
  background: var(--accent-green-dim);
  border-color: var(--border-active);
  color: var(--accent-green);
}
.precision-btn.active small { color: var(--accent-green); opacity: 0.85; }
.action-area { display: flex; gap: 10px; padding: 16px 0; }
.calc-btn { flex: 1; padding: 14px; border: none; border-radius: 12px; background: var(--accent-green); color: #000; font-size: 16px; font-weight: 700; cursor: pointer; }
.calc-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.reset-btn { padding: 14px 20px; border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; background: transparent; color: rgba(255,255,255,0.7); font-size: 14px; cursor: pointer; }
.result-card { background: rgba(255,255,255,0.05); border-radius: 16px; padding: 20px; display: flex; flex-direction: column; gap: 14px; }
.result-row { display: flex; justify-content: space-between; align-items: center; }
.result-label { font-size: 15px; color: rgba(255,255,255,0.7); }
.result-value { font-size: 22px; font-weight: 800; }
.result-value.hero { color: var(--accent-green); }
.result-value.villain { color: var(--accent-red); }
.result-value.tie { color: var(--accent-gold); }
.range-info { margin-top: 12px; padding: 10px; background: rgba(255,255,255,0.03); border-radius: 8px; }
.range-info p { font-size: 11px; color: var(--text-muted); line-height: 1.5; }
.error-card { margin-top: 12px; padding: 14px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 12px; }
.error-card p { font-size: 13px; color: #f87171; }

@media (max-width: 420px) {
  .precision-options { grid-template-columns: 1fr; }
}
</style>

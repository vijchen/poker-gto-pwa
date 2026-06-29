import { ref } from 'vue'

interface EquityResult {
  heroEquity: number
  villainEquity: number
  tie: number
}

interface EquityWorkerError {
  error: string
}

interface EquityWorkerProgress {
  kind: 'progress'
  completed: number
  total: number
}

interface RangeHandInput {
  cards: [string, string]
  weight: number
  mask?: bigint
}

type ExactWorkerInput = {
  mode: 'exact'
  heroCards: [string, string]
  villainCards: [string, string]
  board: string[]
  simulations: number
}

type RangeWorkerInput = {
  mode: 'range'
  heroCards: [string, string]
  villainRange: RangeHandInput[]
  board: string[]
  simulations: number
}

type WorkerInput = ExactWorkerInput | RangeWorkerInput

const DEFAULT_TIMEOUT_MS = 10_000
const MAX_TIMEOUT_MS = 22_000

const isCalculating = ref(false)
const result = ref<EquityResult | null>(null)
const error = ref('')
let worker: Worker | null = null
let timeoutId: ReturnType<typeof setTimeout> | null = null
let activeTimeoutMs = DEFAULT_TIMEOUT_MS

function clearPendingTimeout() {
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
}

function armTimeout() {
  clearPendingTimeout()
  timeoutId = setTimeout(() => {
    isCalculating.value = false
    error.value = '计算超时，请重试'
    terminateWorker()
  }, activeTimeoutMs)
}

function terminateWorker() {
  worker?.terminate()
  worker = null
}

function ensureWorker() {
  if (worker) return worker

  worker = new Worker(new URL('../workers/equity-worker.ts', import.meta.url), { type: 'module' })

  worker.onmessage = (e: MessageEvent<EquityResult | EquityWorkerError | EquityWorkerProgress>) => {
    if ('kind' in e.data && e.data.kind === 'progress') {
      armTimeout()
      return
    }

    clearPendingTimeout()

    if ('error' in e.data) {
      error.value = e.data.error
      isCalculating.value = false
      return
    }

    result.value = e.data as EquityResult
    isCalculating.value = false
  }

  worker.onerror = (ev) => {
    clearPendingTimeout()
    isCalculating.value = false
    error.value = 'Worker 出错: ' + (ev.message || '未知错误')
    terminateWorker()
  }

  return worker
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function getTimeoutMs(payload: WorkerInput): number {
  if (payload.mode === 'exact') {
    const streetBoost = payload.board.length >= 3 ? 2_000 : 0
    return DEFAULT_TIMEOUT_MS + streetBoost
  }

  const matchupCount = payload.villainRange.length * payload.simulations
  const streetFactor = payload.board.length === 2 ? 1.15 : payload.board.length === 1 ? 1.08 : 1
  const estimatedExtraMs = Math.ceil((matchupCount * streetFactor) / 28)

  return clamp(DEFAULT_TIMEOUT_MS + estimatedExtraMs, DEFAULT_TIMEOUT_MS, MAX_TIMEOUT_MS)
}

function cloneExactPayload(payload: ExactWorkerInput): ExactWorkerInput {
  return {
    ...payload,
    heroCards: [payload.heroCards[0], payload.heroCards[1]],
    villainCards: [payload.villainCards[0], payload.villainCards[1]],
    board: [...payload.board]
  }
}

function cloneRangePayload(payload: RangeWorkerInput): RangeWorkerInput {
  return {
    ...payload,
    heroCards: [payload.heroCards[0], payload.heroCards[1]],
    board: [...payload.board],
    villainRange: payload.villainRange.map((hand) => ({
      cards: [hand.cards[0], hand.cards[1]],
      weight: hand.weight
    }))
  }
}

function toWorkerPayload(payload: WorkerInput): WorkerInput {
  return payload.mode === 'range'
    ? cloneRangePayload(payload)
    : cloneExactPayload(payload)
}

export function useEquity() {
  function runCalculation(payload: WorkerInput) {
    if (isCalculating.value) return

    isCalculating.value = true
    result.value = null
    error.value = ''

    try {
      ensureWorker()
    } catch {
      isCalculating.value = false
      error.value = 'Worker 加载失败'
      return
    }

    clearPendingTimeout()
    activeTimeoutMs = getTimeoutMs(payload)
    armTimeout()

    worker?.postMessage(toWorkerPayload(payload))
  }

  function calculate(heroCards: string[], villainCards: string[], board: string[], simulations = 10000) {
    if (heroCards.length !== 2 || villainCards.length !== 2) return

    runCalculation({
      mode: 'exact',
      heroCards: heroCards as [string, string],
      villainCards: villainCards as [string, string],
      board,
      simulations
    })
  }

  function calculateRange(
    heroCards: string[],
    villainRange: RangeHandInput[],
    board: string[],
    simulations = 1500
  ) {
    if (heroCards.length !== 2 || villainRange.length === 0) return

    runCalculation({
      mode: 'range',
      heroCards: heroCards as [string, string],
      villainRange,
      board,
      simulations
    })
  }

  function reset() {
    result.value = null
    error.value = ''
    isCalculating.value = false
    clearPendingTimeout()
    terminateWorker()
  }

  return { isCalculating, result, error, calculate, calculateRange, reset }
}

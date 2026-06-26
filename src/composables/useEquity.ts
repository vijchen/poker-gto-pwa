import { ref } from 'vue'

interface EquityResult {
  heroEquity: number
  villainEquity: number
  tie: number
}

interface EquityWorkerError {
  error: string
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

const isCalculating = ref(false)
const result = ref<EquityResult | null>(null)
const error = ref('')
let worker: Worker | null = null
let timeoutId: ReturnType<typeof setTimeout> | null = null

function clearPendingTimeout() {
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
}

function terminateWorker() {
  worker?.terminate()
  worker = null
}

function ensureWorker() {
  if (worker) return worker

  worker = new Worker(new URL('../workers/equity-worker.ts', import.meta.url))

  worker.onmessage = (e: MessageEvent<EquityResult | EquityWorkerError>) => {
    clearPendingTimeout()

    if ('error' in e.data) {
      error.value = e.data.error
      isCalculating.value = false
      return
    }

    result.value = e.data
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
    timeoutId = setTimeout(() => {
      isCalculating.value = false
      error.value = '计算超时，请重试'
      terminateWorker()
    }, 10000)

    worker?.postMessage(payload)
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

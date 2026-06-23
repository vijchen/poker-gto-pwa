import { ref } from 'vue'

interface EquityResult {
  heroEquity: number
  villainEquity: number
  tie: number
}

interface EquityWorkerError {
  error: string
}

const isCalculating = ref(false)
const result = ref<EquityResult | null>(null)
const error = ref('')

export function useEquity() {
  let worker: Worker | null = null

  function calculate(heroCards: string[], villainCards: string[], board: string[], simulations = 10000) {
    if (heroCards.length !== 2 || villainCards.length !== 2) return

    isCalculating.value = true
    result.value = null
    error.value = ''

    try {
      worker = new Worker(new URL('../workers/equity-worker.ts', import.meta.url))
    } catch (e) {
      isCalculating.value = false
      error.value = 'Worker 加载失败'
      return
    }

    const timeout = setTimeout(() => {
      isCalculating.value = false
      error.value = '计算超时，请重试'
      worker?.terminate()
      worker = null
    }, 10000)

    worker.onmessage = (e: MessageEvent<EquityResult | EquityWorkerError>) => {
      clearTimeout(timeout)
      if ('error' in e.data) {
        error.value = e.data.error
        isCalculating.value = false
        worker?.terminate()
        worker = null
        return
      }

      result.value = e.data
      isCalculating.value = false
      worker?.terminate()
      worker = null
    }

    worker.onerror = (ev) => {
      clearTimeout(timeout)
      isCalculating.value = false
      error.value = 'Worker 出错: ' + (ev.message || '未知错误')
      worker?.terminate()
      worker = null
    }

    worker.postMessage({ heroCards, villainCards, board, simulations })
  }

  function reset() {
    result.value = null
    error.value = ''
    isCalculating.value = false
    worker?.terminate()
    worker = null
  }

  return { isCalculating, result, error, calculate, reset }
}

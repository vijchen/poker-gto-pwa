import { ref } from 'vue'

interface EquityResult {
  heroEquity: number
  villainEquity: number
  tie: number
}

const isCalculating = ref(false)
const result = ref<EquityResult | null>(null)

export function useEquity() {
  let worker: Worker | null = null

  function calculate(heroCards: string[], villainCards: string[], board: string[], simulations = 10000) {
    if (heroCards.length !== 2 || villainCards.length !== 2) return

    isCalculating.value = true
    result.value = null

    worker = new Worker(new URL('../workers/equity-worker.ts', import.meta.url))

    const timeout = setTimeout(() => {
      isCalculating.value = false
      worker?.terminate()
      worker = null
    }, 8000)

    worker.onmessage = (e: MessageEvent<EquityResult>) => {
      clearTimeout(timeout)
      result.value = e.data
      isCalculating.value = false
      worker?.terminate()
      worker = null
    }

    worker.onerror = () => {
      clearTimeout(timeout)
      isCalculating.value = false
      worker?.terminate()
      worker = null
    }

    worker.postMessage({ heroCards, villainCards, board, simulations })
  }

  function reset() {
    result.value = null
    isCalculating.value = false
    worker?.terminate()
    worker = null
  }

  return { isCalculating, result, calculate, reset }
}

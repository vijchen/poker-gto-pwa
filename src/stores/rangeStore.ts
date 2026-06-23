import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Position, Scenario, HandAction } from '@/types/poker'

type CustomRanges = Record<string, Record<string, HandAction>>

const STORAGE_KEY = 'poker-gto-custom-ranges'

function loadFromStorage(): CustomRanges {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return {}
}

function saveToStorage(data: CustomRanges) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export const useRangeStore = defineStore('range', () => {
  const customRanges = ref<CustomRanges>(loadFromStorage())

  watch(customRanges, (val) => saveToStorage(val), { deep: true })

  function getCustomRange(position: Position, scenario: Scenario): Record<string, HandAction> | null {
    const key = `${scenario}_${position}`
    return customRanges.value[key] || null
  }

  function setHandAction(position: Position, scenario: Scenario, handName: string, action: HandAction) {
    const key = `${scenario}_${position}`
    if (!customRanges.value[key]) customRanges.value[key] = {}
    customRanges.value[key][handName] = action
  }

  function cycleHandAction(position: Position, scenario: Scenario, handName: string, currentAction: HandAction): HandAction {
    const cycle: HandAction[] = [
      { action: 'raise', raiseSize: '2.5BB' },
      { action: 'call' },
      { action: 'fold' },
      { action: 'mixed', frequency: { raise: 0.5, call: 0.3, fold: 0.2 } }
    ]
    const existing = getCustomRange(position, scenario)?.[handName]
    const currentIdx = existing
      ? cycle.findIndex(c => c.action === currentAction.action)
      : -1
    const nextIdx = (currentIdx + 1) % cycle.length
    const nextAction = cycle[nextIdx]
    setHandAction(position, scenario, handName, nextAction)
    return nextAction
  }

  function clearCustomRange(position: Position, scenario: Scenario) {
    const key = `${scenario}_${position}`
    delete customRanges.value[key]
  }

  function clearAll() {
    customRanges.value = {}
  }

  function hasCustomData(): boolean {
    return Object.keys(customRanges.value).length > 0
  }

  return { customRanges, getCustomRange, setHandAction, cycleHandAction, clearCustomRange, clearAll, hasCustomData }
})

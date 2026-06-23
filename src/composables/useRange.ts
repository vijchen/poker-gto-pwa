import { computed, ref, watch } from 'vue'
import type { Position, Scenario, HandAction } from '@/types/poker'
import { getHandName, POSITIONS } from '@/types/poker'
import { loadOpenRanges, loadVs3betRanges, loadVsOpenRanges, type RangeMap } from '@/data/ranges/loaders'

/** 当前对手位置（vs Open 场景使用） */
const openerPosition = ref<Position>('UTG')

export function useRange(position: () => Position, scenario: () => Scenario) {
  const rangeData = ref<RangeMap>({})
  const isLoading = ref(false)
  const error = ref('')
  let requestId = 0

  async function loadScenarioData(currentScenario: Scenario) {
    const currentRequestId = ++requestId
    isLoading.value = true
    error.value = ''

    try {
      const data =
        currentScenario === 'open'
          ? await loadOpenRanges()
          : currentScenario === 'vs3bet'
            ? await loadVs3betRanges()
            : await loadVsOpenRanges()

      if (currentRequestId === requestId) {
        rangeData.value = data
      }
    } catch {
      if (currentRequestId === requestId) {
        rangeData.value = {}
        error.value = '范围数据加载失败，请稍后重试。'
      }
    } finally {
      if (currentRequestId === requestId) {
        isLoading.value = false
      }
    }
  }

  watch(
    () => scenario(),
    (currentScenario) => {
      void loadScenarioData(currentScenario)
    },
    { immediate: true }
  )

  const currentRange = computed(() => {
    const s = scenario()
    const data = rangeData.value

    if (s === 'vsOpen') {
      const key = `${openerPosition.value}_${position()}`
      return data[key] || {}
    }

    return data[position()] || {}
  })

  function getAction(row: number, col: number): HandAction {
    const handName = getHandName(row, col)
    return currentRange.value[handName] || { action: 'fold' }
  }

  function setOpenerPosition(pos: Position) {
    openerPosition.value = pos
  }

  function getValidOpeners(myPosition: Position): Position[] {
    const myIdx = POSITIONS.indexOf(myPosition)
    return POSITIONS.filter((_, idx) => idx < myIdx && POSITIONS[idx] !== 'BB')
  }

  return { currentRange, getAction, openerPosition, setOpenerPosition, getValidOpeners, isLoading, error }
}

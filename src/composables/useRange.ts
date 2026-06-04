import { computed, ref } from 'vue'
import type { Position, Scenario, HandAction } from '@/types/poker'
import { getHandName, POSITIONS } from '@/types/poker'
import openData from '@/data/ranges/open.json'
import vs3betData from '@/data/ranges/vs-3bet.json'
import vsOpenData from '@/data/ranges/vs-open.json'

type RangeMap = Record<string, Record<string, HandAction>>

const rangeDataMap: Record<Scenario, RangeMap> = {
  open: openData as unknown as RangeMap,
  vs3bet: vs3betData as unknown as RangeMap,
  vsOpen: vsOpenData as unknown as RangeMap
}

/** 当前对手位置（vs Open 场景使用） */
const openerPosition = ref<Position>('UTG')

export function useRange(position: () => Position, scenario: () => Scenario) {
  const currentRange = computed(() => {
    const s = scenario()
    const data = rangeDataMap[s]

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

  return { currentRange, getAction, openerPosition, setOpenerPosition, getValidOpeners }
}

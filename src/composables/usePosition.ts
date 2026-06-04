import { ref } from 'vue'
import type { Position } from '@/types/poker'
import { POSITIONS } from '@/types/poker'

const currentPosition = ref<Position>('BTN')

export function usePosition() {
  function setPosition(pos: Position) {
    currentPosition.value = pos
  }

  return {
    currentPosition,
    positions: POSITIONS,
    setPosition
  }
}

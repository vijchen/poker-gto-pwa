// === 基础类型 ===

export type Suit = 'spade' | 'heart' | 'diamond' | 'club'
export type Rank = 'A' | 'K' | 'Q' | 'J' | 'T' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2'

export interface Card {
  rank: Rank
  suit: Suit
}

// === 位置 ===

export type Position = 'UTG' | 'UTG1' | 'MP' | 'HJ' | 'CO' | 'BTN' | 'SB' | 'BB'

export const POSITIONS: Position[] = ['UTG', 'UTG1', 'MP', 'HJ', 'CO', 'BTN', 'SB', 'BB']

// === 场景 ===

export type Scenario = 'open' | 'vs3bet' | 'vsOpen'

// === 手牌动作 ===

export type ActionType = 'raise' | 'call' | 'fold' | 'mixed'

export interface HandAction {
  action: ActionType
  frequency?: {
    raise: number
    call: number
    fold: number
  }
  raiseSize?: string
}

// === 范围数据 ===

export interface PositionRange {
  position: Position
  scenario: Scenario
  hands: Record<string, HandAction>
}

// === 手牌矩阵 ===

export const RANKS: Rank[] = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2']

export type HandName = string // "AKs", "QJo", "TT"

/**
 * 根据矩阵行列生成手牌名称
 * 对角线: pair (AA, KK, ...)
 * 左上三角: suited (AKs, AQs, ...)
 * 右下三角: offsuit (AKo, AQo, ...)
 */
export function getHandName(row: number, col: number): HandName {
  const r1 = RANKS[row]
  const r2 = RANKS[col]
  if (row === col) return `${r1}${r2}` // pair
  if (row < col) return `${r1}${r2}s`  // suited (左上)
  return `${r2}${r1}o`                  // offsuit (右下)
}

// === 胜率计算 ===

export interface EquityInput {
  heroHand: [Card, Card]
  villain:
    | { type: 'exact'; cards: [Card, Card] }
    | { type: 'range'; hands: HandName[] }
  board?: Card[]
  simulations?: number
}

export interface EquityResult {
  heroEquity: number
  villainEquity: number
  tie: number
}

/**
 * 简化牌力评估器
 * 使用数值映射快速比较牌力大小
 */

const RANK_VALUES: Record<string, number> = {
  '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
  '9': 9, 'T': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
}

const HAND_RANKS = {
  HIGH_CARD: 0,
  ONE_PAIR: 1,
  TWO_PAIR: 2,
  THREE_OF_A_KIND: 3,
  STRAIGHT: 4,
  FLUSH: 5,
  FULL_HOUSE: 6,
  FOUR_OF_A_KIND: 7,
  STRAIGHT_FLUSH: 8
}

export interface CardNum {
  rank: number
  suit: number
}

export function parseCard(rankChar: string, suitIdx: number): CardNum {
  return { rank: RANK_VALUES[rankChar], suit: suitIdx }
}

export function evaluateHand(cards: CardNum[]): number {
  if (cards.length < 5) return 0
  let bestScore = 0
  const combos = combinations(cards, 5)
  for (const combo of combos) {
    const score = evaluate5(combo)
    if (score > bestScore) bestScore = score
  }
  return bestScore
}

function evaluate5(cards: CardNum[]): number {
  const ranks = cards.map(c => c.rank).sort((a, b) => b - a)
  const suits = cards.map(c => c.suit)
  const isFlush = suits.every(s => s === suits[0])
  const isStraight = checkStraight(ranks)

  const freq: Record<number, number> = {}
  for (const r of ranks) freq[r] = (freq[r] || 0) + 1
  const counts = Object.values(freq).sort((a, b) => b - a)
  const uniqueRanks = Object.keys(freq).map(Number).sort((a, b) => (freq[b] - freq[a]) || (b - a))

  let handRank: number
  let kickers: number[]

  if (isFlush && isStraight) { handRank = HAND_RANKS.STRAIGHT_FLUSH; kickers = [getStraightHigh(ranks)] }
  else if (counts[0] === 4) { handRank = HAND_RANKS.FOUR_OF_A_KIND; kickers = uniqueRanks }
  else if (counts[0] === 3 && counts[1] === 2) { handRank = HAND_RANKS.FULL_HOUSE; kickers = uniqueRanks }
  else if (isFlush) { handRank = HAND_RANKS.FLUSH; kickers = ranks }
  else if (isStraight) { handRank = HAND_RANKS.STRAIGHT; kickers = [getStraightHigh(ranks)] }
  else if (counts[0] === 3) { handRank = HAND_RANKS.THREE_OF_A_KIND; kickers = uniqueRanks }
  else if (counts[0] === 2 && counts[1] === 2) { handRank = HAND_RANKS.TWO_PAIR; kickers = uniqueRanks }
  else if (counts[0] === 2) { handRank = HAND_RANKS.ONE_PAIR; kickers = uniqueRanks }
  else { handRank = HAND_RANKS.HIGH_CARD; kickers = ranks }

  let score = handRank * 10000000
  for (let i = 0; i < kickers.length && i < 5; i++) {
    score += kickers[i] * Math.pow(15, 4 - i)
  }
  return score
}

function checkStraight(sortedRanks: number[]): boolean {
  if (sortedRanks[0] - sortedRanks[4] === 4 && new Set(sortedRanks).size === 5) return true
  if (sortedRanks[0] === 14 && sortedRanks[1] === 5 && sortedRanks[2] === 4 && sortedRanks[3] === 3 && sortedRanks[4] === 2) return true
  return false
}

function getStraightHigh(sortedRanks: number[]): number {
  if (sortedRanks[0] === 14 && sortedRanks[1] === 5) return 5
  return sortedRanks[0]
}

function combinations<T>(arr: T[], k: number): T[][] {
  const result: T[][] = []
  const n = arr.length
  const indices = Array.from({ length: k }, (_, i) => i)

  while (true) {
    result.push(indices.map(i => arr[i]))
    let i = k - 1
    while (i >= 0 && indices[i] === n - k + i) i--
    if (i < 0) break
    indices[i]++
    for (let j = i + 1; j < k; j++) indices[j] = indices[j - 1] + 1
  }
  return result
}

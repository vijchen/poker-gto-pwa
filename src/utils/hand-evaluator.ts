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

const KICKER_MULTIPLIERS = [50625, 3375, 225, 15, 1]
const rankScratch = new Uint8Array(5)
const rankCountsScratch = new Uint8Array(15)

export interface CardNum {
  rank: number
  suit: number
}

export function parseCard(rankChar: string, suitIdx: number): CardNum {
  const rank = RANK_VALUES[rankChar]
  if (!rank || suitIdx < 0 || suitIdx > 3) {
    throw new Error(`无效牌面: ${rankChar}`)
  }
  return { rank, suit: suitIdx }
}

export function evaluateHand(cards: CardNum[]): number {
  if (cards.length < 5) return 0
  if (cards.length === 5) return evaluate5(cards)
  if (cards.length === 6) return evaluate6(cards)
  if (cards.length === 7) return evaluate7(cards)

  let bestScore = 0

  const combo = new Array<CardNum>(5)

  function visit(start: number, depth: number) {
    if (depth === 5) {
      const score = evaluate5(combo)
      if (score > bestScore) bestScore = score
      return
    }

    for (let i = start; i <= cards.length - (5 - depth); i++) {
      combo[depth] = cards[i]
      visit(i + 1, depth + 1)
    }
  }

  visit(0, 0)
  return bestScore
}

function evaluate5(cards: CardNum[]): number {
  return evaluate5Cards(cards[0], cards[1], cards[2], cards[3], cards[4])
}

function evaluate6(cards: CardNum[]): number {
  let bestScore = 0

  for (let a = 0; a < 2; a++) {
    for (let b = a + 1; b < 3; b++) {
      for (let c = b + 1; c < 4; c++) {
        for (let d = c + 1; d < 5; d++) {
          for (let e = d + 1; e < 6; e++) {
            const score = evaluate5Cards(cards[a], cards[b], cards[c], cards[d], cards[e])
            if (score > bestScore) bestScore = score
          }
        }
      }
    }
  }

  return bestScore
}

function evaluate7(cards: CardNum[]): number {
  let bestScore = 0

  for (let a = 0; a < 3; a++) {
    for (let b = a + 1; b < 4; b++) {
      for (let c = b + 1; c < 5; c++) {
        for (let d = c + 1; d < 6; d++) {
          for (let e = d + 1; e < 7; e++) {
            const score = evaluate5Cards(cards[a], cards[b], cards[c], cards[d], cards[e])
            if (score > bestScore) bestScore = score
          }
        }
      }
    }
  }

  return bestScore
}

function evaluate5Cards(card0: CardNum, card1: CardNum, card2: CardNum, card3: CardNum, card4: CardNum): number {
  const ranks = rankScratch
  ranks[0] = card0.rank
  ranks[1] = card1.rank
  ranks[2] = card2.rank
  ranks[3] = card3.rank
  ranks[4] = card4.rank

  for (let i = 1; i < 5; i++) {
    const value = ranks[i]
    let j = i - 1
    while (j >= 0 && ranks[j] < value) {
      ranks[j + 1] = ranks[j]
      j--
    }
    ranks[j + 1] = value
  }

  const isFlush =
    card0.suit === card1.suit &&
    card0.suit === card2.suit &&
    card0.suit === card3.suit &&
    card0.suit === card4.suit

  const straightHigh = getStraightHigh(ranks[0], ranks[1], ranks[2], ranks[3], ranks[4])
  const counts = rankCountsScratch

  counts[ranks[0]]++
  counts[ranks[1]]++
  counts[ranks[2]]++
  counts[ranks[3]]++
  counts[ranks[4]]++

  let fourRank = 0
  let threeRank = 0
  let pairHigh = 0
  let pairLow = 0
  let kicker1 = 0
  let kicker2 = 0
  let kicker3 = 0
  let kickerCount = 0

  for (let rank = 14; rank >= 2; rank--) {
    const count = counts[rank]
    if (count === 0) continue

    if (count === 4) {
      fourRank = rank
    } else if (count === 3) {
      threeRank = rank
    } else if (count === 2) {
      if (!pairHigh) pairHigh = rank
      else pairLow = rank
    } else if (kickerCount === 0) {
      kicker1 = rank
      kickerCount = 1
    } else if (kickerCount === 1) {
      kicker2 = rank
      kickerCount = 2
    } else {
      kicker3 = rank
      kickerCount = 3
    }
  }

  counts[ranks[0]] = 0
  counts[ranks[1]] = 0
  counts[ranks[2]] = 0
  counts[ranks[3]] = 0
  counts[ranks[4]] = 0

  if (isFlush && straightHigh) return makeScore(HAND_RANKS.STRAIGHT_FLUSH, straightHigh)
  if (fourRank) return makeScore(HAND_RANKS.FOUR_OF_A_KIND, fourRank, kicker1)
  if (threeRank && pairHigh) return makeScore(HAND_RANKS.FULL_HOUSE, threeRank, pairHigh)
  if (isFlush) return makeScore(HAND_RANKS.FLUSH, ranks[0], ranks[1], ranks[2], ranks[3], ranks[4])
  if (straightHigh) return makeScore(HAND_RANKS.STRAIGHT, straightHigh)
  if (threeRank) return makeScore(HAND_RANKS.THREE_OF_A_KIND, threeRank, kicker1, kicker2)
  if (pairHigh && pairLow) return makeScore(HAND_RANKS.TWO_PAIR, pairHigh, pairLow, kicker1)
  if (pairHigh) return makeScore(HAND_RANKS.ONE_PAIR, pairHigh, kicker1, kicker2, kicker3)
  return makeScore(HAND_RANKS.HIGH_CARD, ranks[0], ranks[1], ranks[2], ranks[3], ranks[4])
}

function getStraightHigh(r0: number, r1: number, r2: number, r3: number, r4: number): number {
  if (r0 !== r1 && r1 !== r2 && r2 !== r3 && r3 !== r4) {
    if (r0 - r4 === 4) return r0
    if (r0 === 14 && r1 === 5 && r2 === 4 && r3 === 3 && r4 === 2) return 5
  }

  return 0
}

function makeScore(handRank: number, ...kickers: number[]): number {
  let score = handRank * 10000000
  for (let i = 0; i < kickers.length && i < 5; i++) {
    score += kickers[i] * KICKER_MULTIPLIERS[i]
  }
  return score
}

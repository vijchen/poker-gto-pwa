/**
 * 胜率计算 Web Worker
 * 单手牌对抗支持后街精确枚举；范围模式按全部合法组合做加权平均
 */

import { evaluateHand, parseCard } from '../utils/hand-evaluator'
import type { CardNum } from '../utils/hand-evaluator'

interface RangeHandInput {
  cards: [string, string]
  weight: number
  mask?: bigint
}

interface ExactWorkerInput {
  mode: 'exact'
  heroCards: [string, string]
  villainCards: [string, string]
  board: string[]
  simulations: number
}

interface RangeWorkerInput {
  mode: 'range'
  heroCards: [string, string]
  villainRange: RangeHandInput[]
  board: string[]
  simulations: number
}

type WorkerInput = ExactWorkerInput | RangeWorkerInput

interface WorkerOutput {
  heroEquity: number
  villainEquity: number
  tie: number
}

interface WorkerErrorOutput {
  error: string
}

interface DeckEntry {
  num: CardNum
  maskLo: number
  maskHi: number
}

interface RangeData {
  firstNums: CardNum[]
  secondNums: CardNum[]
  maskLo: number[]
  maskHi: number[]
  weights: number[]
  length: number
}

const SUITS = ['s', 'h', 'd', 'c']
const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2']
const CARD_RE = /^[2-9TJQKA][shdc]$/

function cardToNum(card: string): CardNum {
  if (!CARD_RE.test(card)) {
    throw new Error(`无效牌面: ${card}`)
  }

  const rank = card[0]
  const suit = SUITS.indexOf(card[1])
  return parseCard(rank, suit)
}

function cardToIndex(card: string): number {
  if (!CARD_RE.test(card)) {
    throw new Error(`无效牌面: ${card}`)
  }

  const rankIdx = RANKS.indexOf(card[0])
  const suitIdx = SUITS.indexOf(card[1])
  return rankIdx * SUITS.length + suitIdx
}

function cardIndexToMasks(cardIdx: number): [number, number] {
  if (cardIdx < 32) {
    return [((1 << cardIdx) >>> 0), 0]
  }

  return [0, ((1 << (cardIdx - 32)) >>> 0)]
}

function buildDeckEntries(exclude: Set<string>): DeckEntry[] {
  const deck: DeckEntry[] = []

  for (let rankIdx = 0; rankIdx < RANKS.length; rankIdx++) {
    const rank = RANKS[rankIdx]

    for (let suitIdx = 0; suitIdx < SUITS.length; suitIdx++) {
      const suit = SUITS[suitIdx]
      const card = rank + suit
      if (exclude.has(card)) continue

      const [maskLo, maskHi] = cardIndexToMasks(rankIdx * SUITS.length + suitIdx)
      deck.push({
        num: parseCard(rank, suitIdx),
        maskLo,
        maskHi
      })
    }
  }

  return deck
}

function compareScores(heroScore: number, villainScore: number): number {
  if (heroScore > villainScore) return 1
  if (villainScore > heroScore) return -1
  return 0
}

function fillRandomRunout(
  deck: DeckEntry[],
  count: number,
  heroNums: CardNum[],
  villainNums: CardNum[],
  drawnStart: number,
  runoutMask: Uint32Array
): void {
  let filled = 0
  runoutMask[0] = 0
  runoutMask[1] = 0

  while (filled < count) {
    const candidate = deck[Math.floor(Math.random() * deck.length)]
    if (((runoutMask[0] & candidate.maskLo) !== 0) || ((runoutMask[1] & candidate.maskHi) !== 0)) continue

    const idx = drawnStart + filled
    heroNums[idx] = candidate.num
    villainNums[idx] = candidate.num
    runoutMask[0] = (runoutMask[0] | candidate.maskLo) >>> 0
    runoutMask[1] = (runoutMask[1] | candidate.maskHi) >>> 0
    filled++
  }
}

function setSharedRunoutCard(
  entry: DeckEntry,
  heroNums: CardNum[],
  villainNums: CardNum[],
  idx: number
): void {
  heroNums[idx] = entry.num
  villainNums[idx] = entry.num
}

function createSharedHandBuffers(heroCards: [string, string], board: string[]) {
  const heroBaseNums = heroCards.map(cardToNum) as [CardNum, CardNum]
  const boardBaseNums = board.map(cardToNum)
  const heroNums = new Array<CardNum>(7)
  const villainNums = new Array<CardNum>(7)
  const boardStart = 2
  const drawnStart = boardStart + boardBaseNums.length

  heroNums[0] = heroBaseNums[0]
  heroNums[1] = heroBaseNums[1]

  for (let i = 0; i < boardBaseNums.length; i++) {
    const card = boardBaseNums[i]
    const idx = boardStart + i
    heroNums[idx] = card
    villainNums[idx] = card
  }

  return { heroNums, villainNums, drawnStart }
}

function validateCommonInput(heroCards: [string, string], board: string[], simulations: number): void {
  if (heroCards.length !== 2) {
    throw new Error('我的手牌必须选 2 张')
  }
  if (board.length > 5) {
    throw new Error('公共牌不能超过 5 张')
  }
  if (!Number.isFinite(simulations) || simulations <= 0) {
    throw new Error('模拟次数无效')
  }

  const allCards = [...heroCards, ...board]
  if (new Set(allCards).size !== allCards.length) {
    throw new Error('牌面重复，请重新选择')
  }
}

function validateExactInput(input: ExactWorkerInput): void {
  validateCommonInput(input.heroCards, input.board, input.simulations)

  if (input.villainCards.length !== 2) {
    throw new Error('对手手牌必须选 2 张')
  }

  const allCards = [...input.heroCards, ...input.villainCards, ...input.board]
  if (new Set(allCards).size !== allCards.length) {
    throw new Error('牌面重复，请重新选择')
  }
}

function normalizeRangeHands(input: RangeWorkerInput): RangeData {
  validateCommonInput(input.heroCards, input.board, input.simulations)

  const blocked = new Set([...input.heroCards, ...input.board])
  const firstNums: CardNum[] = []
  const secondNums: CardNum[] = []
  const maskLo: number[] = []
  const maskHi: number[] = []
  const weights: number[] = []

  for (const candidate of input.villainRange) {
    if (!Number.isFinite(candidate.weight) || candidate.weight <= 0) continue

    const [first, second] = candidate.cards
    if (!first || !second || first === second) continue
    if (blocked.has(first) || blocked.has(second)) continue

    const [firstMaskLo, firstMaskHi] = cardIndexToMasks(cardToIndex(first))
    const [secondMaskLo, secondMaskHi] = cardIndexToMasks(cardToIndex(second))

    firstNums.push(cardToNum(first))
    secondNums.push(cardToNum(second))
    maskLo.push((firstMaskLo | secondMaskLo) >>> 0)
    maskHi.push((firstMaskHi | secondMaskHi) >>> 0)
    weights.push(candidate.weight)
  }

  if (weights.length === 0) {
    throw new Error('范围内没有合法对手组合')
  }

  return {
    firstNums,
    secondNums,
    maskLo,
    maskHi,
    weights,
    length: weights.length
  }
}

function runExactSimulation(input: ExactWorkerInput): WorkerOutput {
  validateExactInput(input)

  const { heroCards, villainCards, board, simulations } = input
  const excluded = new Set([...heroCards, ...villainCards, ...board])
  const deck = buildDeckEntries(excluded)
  const cardsNeeded = 5 - board.length

  if (deck.length < cardsNeeded) {
    throw new Error('剩余牌数不足，无法完成模拟')
  }

  const villainBaseNums = villainCards.map(cardToNum) as [CardNum, CardNum]
  const { heroNums, villainNums, drawnStart } = createSharedHandBuffers(heroCards, board)
  const runoutMask = new Uint32Array(2)

  villainNums[0] = villainBaseNums[0]
  villainNums[1] = villainBaseNums[1]

  let heroWins = 0
  let villainWins = 0
  let ties = 0

  function applyExactResult(): void {
    const result = compareScores(evaluateHand(heroNums), evaluateHand(villainNums))
    if (result > 0) heroWins++
    else if (result < 0) villainWins++
    else ties++
  }

  if (cardsNeeded === 0) {
    applyExactResult()
  } else if (cardsNeeded === 1) {
    for (const river of deck) {
      setSharedRunoutCard(river, heroNums, villainNums, drawnStart)
      applyExactResult()
    }
  } else if (cardsNeeded === 2) {
    for (let i = 0; i < deck.length - 1; i++) {
      for (let j = i + 1; j < deck.length; j++) {
        setSharedRunoutCard(deck[i], heroNums, villainNums, drawnStart)
        setSharedRunoutCard(deck[j], heroNums, villainNums, drawnStart + 1)
        applyExactResult()
      }
    }
  } else {
    for (let i = 0; i < simulations; i++) {
      fillRandomRunout(deck, cardsNeeded, heroNums, villainNums, drawnStart, runoutMask)
      applyExactResult()
    }
  }

  const total = heroWins + villainWins + ties
  return {
    heroEquity: Math.round((heroWins / total) * 1000) / 10,
    villainEquity: Math.round((villainWins / total) * 1000) / 10,
    tie: Math.round((ties / total) * 1000) / 10
  }
}

function runRangeSimulation(input: RangeWorkerInput): WorkerOutput {
  const rangeData = normalizeRangeHands(input)
  const { heroCards, board, simulations } = input
  const excluded = new Set([...heroCards, ...board])
  const deck = buildDeckEntries(excluded)
  const cardsNeeded = 5 - board.length

  if (deck.length < cardsNeeded) {
    throw new Error('剩余牌数不足，无法完成模拟')
  }

  const { heroNums, villainNums, drawnStart } = createSharedHandBuffers(heroCards, board)
  const runoutMask = new Uint32Array(2)

  let heroUnits = 0
  let villainUnits = 0
  let tieUnits = 0
  let totalUnits = 0

  function applyRangeRunout(runoutMaskLo: number, runoutMaskHi: number): void {
    const heroScore = evaluateHand(heroNums)

    for (let i = 0; i < rangeData.length; i++) {
      if (((rangeData.maskLo[i] & runoutMaskLo) !== 0) || ((rangeData.maskHi[i] & runoutMaskHi) !== 0)) continue

      villainNums[0] = rangeData.firstNums[i]
      villainNums[1] = rangeData.secondNums[i]

      const villainScore = evaluateHand(villainNums)
      totalUnits += rangeData.weights[i]

      const result = compareScores(heroScore, villainScore)
      if (result > 0) heroUnits += rangeData.weights[i]
      else if (result < 0) villainUnits += rangeData.weights[i]
      else tieUnits += rangeData.weights[i]
    }
  }

  if (cardsNeeded === 0) {
    applyRangeRunout(0, 0)
  } else if (cardsNeeded === 1) {
    for (const river of deck) {
      setSharedRunoutCard(river, heroNums, villainNums, drawnStart)
      applyRangeRunout(river.maskLo, river.maskHi)
    }
  } else if (cardsNeeded === 2) {
    for (let i = 0; i < deck.length - 1; i++) {
      for (let j = i + 1; j < deck.length; j++) {
        setSharedRunoutCard(deck[i], heroNums, villainNums, drawnStart)
        setSharedRunoutCard(deck[j], heroNums, villainNums, drawnStart + 1)
        applyRangeRunout(
          (deck[i].maskLo | deck[j].maskLo) >>> 0,
          (deck[i].maskHi | deck[j].maskHi) >>> 0
        )
      }
    }
  } else {
    for (let i = 0; i < simulations; i++) {
      fillRandomRunout(deck, cardsNeeded, heroNums, villainNums, drawnStart, runoutMask)
      applyRangeRunout(runoutMask[0], runoutMask[1])
    }
  }

  if (totalUnits <= 0) {
    throw new Error('范围内没有合法对手组合')
  }

  return {
    heroEquity: Math.round((heroUnits / totalUnits) * 1000) / 10,
    villainEquity: Math.round((villainUnits / totalUnits) * 1000) / 10,
    tie: Math.round((tieUnits / totalUnits) * 1000) / 10
  }
}

self.onmessage = (e: MessageEvent<WorkerInput>) => {
  try {
    const result = e.data.mode === 'range'
      ? runRangeSimulation(e.data)
      : runExactSimulation(e.data)

    self.postMessage(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : '未知错误'
    const failure: WorkerErrorOutput = { error: `计算失败: ${message}` }
    self.postMessage(failure)
  }
}

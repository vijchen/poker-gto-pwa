/**
 * 胜率计算 Web Worker
 * 蒙特卡洛模拟：随机发剩余公共牌，统计胜率
 */

import { evaluateHand, parseCard } from '../utils/hand-evaluator'
import type { CardNum } from '../utils/hand-evaluator'

interface WorkerInput {
  heroCards: [string, string]
  villainCards: [string, string]
  board: string[]
  simulations: number
}

interface WorkerOutput {
  heroEquity: number
  villainEquity: number
  tie: number
}

const SUITS = ['s', 'h', 'd', 'c']
const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2']

function cardToNum(card: string): CardNum {
  const rank = card[0]
  const suit = SUITS.indexOf(card[1])
  return parseCard(rank, suit)
}

function buildDeck(exclude: string[]): string[] {
  const deck: string[] = []
  for (const r of RANKS) {
    for (const s of SUITS) {
      const card = r + s
      if (!exclude.includes(card)) deck.push(card)
    }
  }
  return deck
}

function shuffle(arr: string[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
}

function runSimulation(input: WorkerInput): WorkerOutput {
  const { heroCards, villainCards, board, simulations } = input
  const excluded = [...heroCards, ...villainCards, ...board]
  const deck = buildDeck(excluded)
  const cardsNeeded = 5 - board.length

  let heroWins = 0
  let villainWins = 0
  let ties = 0

  for (let i = 0; i < simulations; i++) {
    shuffle(deck)
    const communityCards = [...board, ...deck.slice(0, cardsNeeded)]

    const heroNums: CardNum[] = [
      ...heroCards.map(cardToNum),
      ...communityCards.map(cardToNum)
    ]
    const villainNums: CardNum[] = [
      ...villainCards.map(cardToNum),
      ...communityCards.map(cardToNum)
    ]

    const heroScore = evaluateHand(heroNums)
    const villainScore = evaluateHand(villainNums)

    if (heroScore > villainScore) heroWins++
    else if (villainScore > heroScore) villainWins++
    else ties++
  }

  const total = simulations
  return {
    heroEquity: Math.round((heroWins / total) * 1000) / 10,
    villainEquity: Math.round((villainWins / total) * 1000) / 10,
    tie: Math.round((ties / total) * 1000) / 10
  }
}

self.onmessage = (e: MessageEvent<WorkerInput>) => {
  const result = runSimulation(e.data)
  self.postMessage(result)
}

import { create } from 'zustand'
import { Card } from '../types/Card'

export type CombatPhase =
  | 'setup'
  | 'player_select'
  | 'ai_select'
  | 'reveal'
  | 'resolution'
  | 'round_end'
  | 'combat_end'

export interface CombatState {
  // Decks
  playerDeck: Card[]
  playerHand: Card[]
  playerDiscard: Card[]
  aiDeck: Card[]
  aiHand: Card[]
  aiDiscard: Card[]

  // Current round
  playerPlayedCard: Card | null
  aiPlayedCard: Card | null
  playerSacrificed: Card[]
  aiSacrificed: Card[]

  // Score
  playerDragons: number
  aiDragons: number
  totalCardsPlayed: number
  dragonsToWin: number

  // State
  phase: CombatPhase
  roundNumber: number

  // Actions
  initCombat: (playerDeck: Card[], aiDeck: Card[]) => void
  setupRound: () => void
  playCard: (card: Card, sacrifices: Card[]) => void
  aiPlay: () => void
  resolveRound: () => void
  awardDragon: (winner: 'player' | 'ai') => void
  drawCard: (player: 'player' | 'ai') => void
  reset: () => void
}

const shuffle = <T,>(array: T[]): T[] => {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

export const useCombatStore = create<CombatState>((set, get) => ({
  // Initial state
  playerDeck: [],
  playerHand: [],
  playerDiscard: [],
  aiDeck: [],
  aiHand: [],
  aiDiscard: [],

  playerPlayedCard: null,
  aiPlayedCard: null,
  playerSacrificed: [],
  aiSacrificed: [],

  playerDragons: 0,
  aiDragons: 0,
  totalCardsPlayed: 0,
  dragonsToWin: 3,

  phase: 'setup',
  roundNumber: 0,

  initCombat: (playerDeck, aiDeck) => {
    set({
      playerDeck: shuffle(playerDeck),
      playerHand: [],
      playerDiscard: [],
      aiDeck: shuffle(aiDeck),
      aiHand: [],
      aiDiscard: [],
      playerDragons: 0,
      aiDragons: 0,
      totalCardsPlayed: 0,
      dragonsToWin: 3,
      phase: 'setup',
      roundNumber: 0,
      playerPlayedCard: null,
      aiPlayedCard: null,
      playerSacrificed: [],
      aiSacrificed: [],
    })
  },

  setupRound: () => {
    const state = get()
    let newPlayerDeck = [...state.playerDeck]
    let newPlayerHand = [...state.playerHand]
    let newAiDeck = [...state.aiDeck]
    let newAiHand = [...state.aiHand]

    // Draw 5 cards for player if hand is empty (first round)
    if (newPlayerHand.length === 0) {
      const drawn = newPlayerDeck.splice(0, 5)
      newPlayerHand = drawn
    }

    // Draw 5 cards for AI if hand is empty
    if (newAiHand.length === 0) {
      const drawn = newAiDeck.splice(0, 5)
      newAiHand = drawn
    }

    set({
      playerDeck: newPlayerDeck,
      playerHand: newPlayerHand,
      aiDeck: newAiDeck,
      aiHand: newAiHand,
      phase: 'player_select',
      roundNumber: state.roundNumber + 1,
      playerPlayedCard: null,
      aiPlayedCard: null,
      playerSacrificed: [],
      aiSacrificed: [],
    })
  },

  playCard: (card, sacrifices) => {
    const state = get()
    const newHand = state.playerHand.filter(c =>
      c.id !== card.id && !sacrifices.find(s => s.id === c.id)
    )

    set({
      playerPlayedCard: card,
      playerSacrificed: sacrifices,
      playerHand: newHand,
      phase: 'ai_select',
    })
  },

  aiPlay: () => {
    const state = get()
    if (state.aiHand.length === 0) return

    // Simple AI: play random card, no sacrifices for MVP
    const randomIndex = Math.floor(Math.random() * state.aiHand.length)
    const card = state.aiHand[randomIndex]
    const newHand = state.aiHand.filter(c => c.id !== card.id)

    set({
      aiPlayedCard: card,
      aiSacrificed: [],
      aiHand: newHand,
      phase: 'reveal',
    })
  },

  resolveRound: () => {
    const state = get()
    if (!state.playerPlayedCard || !state.aiPlayedCard) return

    // Calculate powers
    const playerPower = state.playerPlayedCard.getEffectivePower() +
      state.playerSacrificed.reduce((sum, c) => sum + Math.floor(c.getEffectivePower() / 2), 0)

    const aiPower = state.aiPlayedCard.getEffectivePower() +
      state.aiSacrificed.reduce((sum, c) => sum + Math.floor(c.getEffectivePower() / 2), 0)

    // Determine winner
    let winner: 'player' | 'ai' | 'tie' = 'tie'
    if (playerPower > aiPower) winner = 'player'
    else if (aiPower > playerPower) winner = 'ai'

    // Award dragon
    if (winner !== 'tie') {
      get().awardDragon(winner)
    }

    // Move cards to discard
    const newPlayerDiscard = [
      ...state.playerDiscard,
      state.playerPlayedCard,
      ...state.playerSacrificed
    ]
    const newAiDiscard = [
      ...state.aiDiscard,
      state.aiPlayedCard,
      ...state.aiSacrificed
    ]

    const totalPlayed = state.totalCardsPlayed +
      1 + state.playerSacrificed.length +
      1 + state.aiSacrificed.length

    // Update dragons to win based on total cards played
    const dragonsToWin = totalPlayed >= 6 ? 2 : 3

    set({
      playerDiscard: newPlayerDiscard,
      aiDiscard: newAiDiscard,
      totalCardsPlayed: totalPlayed,
      dragonsToWin,
      phase: 'round_end',
    })
  },

  awardDragon: (winner) => {
    set((state) => ({
      playerDragons: winner === 'player' ? state.playerDragons + 1 : state.playerDragons,
      aiDragons: winner === 'ai' ? state.aiDragons + 1 : state.aiDragons,
    }))
  },

  drawCard: (player) => {
    const state = get()
    if (player === 'player') {
      if (state.playerDeck.length === 0) return
      const card = state.playerDeck[0]
      set({
        playerDeck: state.playerDeck.slice(1),
        playerHand: [...state.playerHand, card],
      })
    } else {
      if (state.aiDeck.length === 0) return
      const card = state.aiDeck[0]
      set({
        aiDeck: state.aiDeck.slice(1),
        aiHand: [...state.aiHand, card],
      })
    }
  },

  reset: () => {
    set({
      playerDeck: [],
      playerHand: [],
      playerDiscard: [],
      aiDeck: [],
      aiHand: [],
      aiDiscard: [],
      playerPlayedCard: null,
      aiPlayedCard: null,
      playerSacrificed: [],
      aiSacrificed: [],
      playerDragons: 0,
      aiDragons: 0,
      totalCardsPlayed: 0,
      dragonsToWin: 3,
      phase: 'setup',
      roundNumber: 0,
    })
  },
}))

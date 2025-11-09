import { describe, it, expect, beforeEach } from 'vitest'
import { useCombatStore } from './combatStore'
import { createCard } from '../types/Card'

describe('Combat Store', () => {
  beforeEach(() => {
    useCombatStore.getState().reset()
  })

  it('should initialize combat with player and AI decks', () => {
    const playerDeck = [
      createCard({ id: 'p1', type: 'unit', power: 5, rarity: 'common' }),
      createCard({ id: 'p2', type: 'unit', power: 3, rarity: 'common' }),
    ]

    const aiDeck = [
      createCard({ id: 'ai1', type: 'unit', power: 4, rarity: 'common' }),
      createCard({ id: 'ai2', type: 'unit', power: 6, rarity: 'common' }),
    ]

    useCombatStore.getState().initCombat(playerDeck, aiDeck)

    const state = useCombatStore.getState()
    expect(state.playerDeck.length).toBe(2)
    expect(state.aiDeck.length).toBe(2)
    expect(state.playerHand.length).toBe(0) // Will draw in setup
    expect(state.phase).toBe('setup')
  })

  it('should setup round by drawing cards', () => {
    const playerDeck = Array.from({ length: 10 }, (_, i) =>
      createCard({ id: `p${i}`, type: 'unit', power: 3, rarity: 'common' })
    )

    const aiDeck = Array.from({ length: 10 }, (_, i) =>
      createCard({ id: `ai${i}`, type: 'unit', power: 3, rarity: 'common' })
    )

    const store = useCombatStore.getState()
    store.initCombat(playerDeck, aiDeck)
    store.setupRound()

    const state = useCombatStore.getState()
    expect(state.playerHand.length).toBe(5)
    expect(state.playerDeck.length).toBe(5)
    expect(state.phase).toBe('player_select')
  })

  it('should track dragons correctly', () => {
    let state = useCombatStore.getState()
    expect(state.playerDragons).toBe(0)
    expect(state.aiDragons).toBe(0)

    state.awardDragon('player')
    state = useCombatStore.getState()
    expect(state.playerDragons).toBe(1)

    state.awardDragon('ai')
    state = useCombatStore.getState()
    expect(state.aiDragons).toBe(1)
  })
})

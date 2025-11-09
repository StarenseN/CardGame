import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CombatArena } from './CombatArena'
import { useCombatStore } from '../stores/combatStore'
import { createCard } from '../types/Card'

describe('CombatArena', () => {
  beforeEach(() => {
    useCombatStore.getState().reset()
  })

  it('should display player and AI dragons', () => {
    const store = useCombatStore.getState()
    store.awardDragon('player')
    store.awardDragon('player')
    store.awardDragon('ai')

    render(<CombatArena />)

    expect(screen.getByText(/Player Dragons: 2/i)).toBeInTheDocument()
    expect(screen.getByText(/AI Dragons: 1/i)).toBeInTheDocument()
  })

  it('should display player hand', () => {
    const playerDeck = [
      createCard({ id: 'p1', type: 'unit', power: 5, rarity: 'common', name: 'Dwarf 1' }),
      createCard({ id: 'p2', type: 'unit', power: 3, rarity: 'common', name: 'Dwarf 2' }),
    ]

    const store = useCombatStore.getState()
    store.initCombat(playerDeck, [])
    store.setupRound()

    render(<CombatArena />)

    expect(screen.getByText('Dwarf 1')).toBeInTheDocument()
    expect(screen.getByText('Dwarf 2')).toBeInTheDocument()
  })
})

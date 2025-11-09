import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CardComponent } from './Card'
import { createCard } from '../types/Card'

describe('CardComponent', () => {
  it('should render card power', () => {
    const card = createCard({
      id: 'test-1',
      type: 'unit',
      power: 7,
      rarity: 'rare',
      name: 'Test Dwarf'
    })

    render(<CardComponent card={card} />)
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('Test Dwarf')).toBeInTheDocument()
  })

  it('should show reduced power when fatigued', () => {
    const card = createCard({
      id: 'test-2',
      type: 'unit',
      power: 8,
      rarity: 'common'
    })
    card.fatigued = true

    render(<CardComponent card={card} />)
    expect(screen.getByText('7')).toBeInTheDocument() // 8 - 1
  })

  it('should apply rarity styling', () => {
    const card = createCard({
      id: 'test-3',
      type: 'unit',
      power: 5,
      rarity: 'legendary'
    })

    const { container } = render(<CardComponent card={card} />)
    const cardElement = container.querySelector('.border-yellow-500')
    expect(cardElement).toBeInTheDocument()
  })
})

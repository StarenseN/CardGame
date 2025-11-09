import { describe, it, expect } from 'vitest'
import { createCard } from './Card'

describe('Card', () => {
  it('should create a basic unit card', () => {
    const card = createCard({
      id: 'test-1',
      type: 'unit',
      power: 5,
      rarity: 'common'
    })

    expect(card.id).toBe('test-1')
    expect(card.type).toBe('unit')
    expect(card.power).toBe(5)
    expect(card.rarity).toBe('common')
    expect(card.fatigued).toBe(false)
  })

  it('should calculate effective power with fatigue', () => {
    const card = createCard({
      id: 'test-2',
      type: 'unit',
      power: 8,
      rarity: 'rare'
    })

    expect(card.getEffectivePower()).toBe(8)

    card.fatigued = true
    expect(card.getEffectivePower()).toBe(7)
  })

  it('should preserve templateId when cloning', () => {
    const card = createCard({
      id: 'test-3',
      templateId: 'warrior-basic-1',
      type: 'unit',
      power: 5,
      rarity: 'common'
    })

    const cloned = card.clone()

    expect(cloned.templateId).toBe('warrior-basic-1')
    expect(cloned.id).toBe(card.id)
    expect(cloned.power).toBe(card.power)
  })
})

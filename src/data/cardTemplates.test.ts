import { describe, it, expect } from 'vitest'
import { CARD_TEMPLATES, generateCardFromTemplate } from './cardTemplates'

describe('Card Templates', () => {
  it('should have at least 20 card templates', () => {
    expect(CARD_TEMPLATES.length).toBeGreaterThanOrEqual(20)
  })

  it('should generate a card from template', () => {
    const template = CARD_TEMPLATES[0]
    const card = generateCardFromTemplate(template, 'card-1')

    expect(card.id).toBe('card-1')
    expect(card.type).toBe(template.type)
    expect(card.power).toBe(template.power)
    expect(card.rarity).toBe(template.rarity)
  })

  it('should have variety of rarities', () => {
    const rarities = new Set(CARD_TEMPLATES.map(t => t.rarity))
    expect(rarities.has('common')).toBe(true)
    expect(rarities.has('rare')).toBe(true)
  })
})

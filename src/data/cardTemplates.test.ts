import { describe, it, expect } from 'vitest'
import { CARD_POOL, getCardById, generateCardFromTemplate } from './cardTemplates'

describe('Balanced Card Pool', () => {
  it('should have exactly 40 cards', () => {
    expect(CARD_POOL.length).toBe(40)
  })

  it('should have no card with power > 6', () => {
    const maxPower = Math.max(...CARD_POOL.map(c => c.power))
    expect(maxPower).toBeLessThanOrEqual(6)
  })

  it('should have balanced type distribution', () => {
    const warriors = CARD_POOL.filter(c => c.unitType === 'warrior').length
    const mages = CARD_POOL.filter(c => c.unitType === 'mage').length
    const creatures = CARD_POOL.filter(c => c.unitType === 'creature').length

    // Each type should have 10-15 cards
    expect(warriors).toBeGreaterThanOrEqual(10)
    expect(warriors).toBeLessThanOrEqual(15)
    expect(mages).toBeGreaterThanOrEqual(10)
    expect(mages).toBeLessThanOrEqual(15)
    expect(creatures).toBeGreaterThanOrEqual(10)
    expect(creatures).toBeLessThanOrEqual(15)
  })

  it('should have starter cards (unlocked by default)', () => {
    const starters = CARD_POOL.filter(c => c.starterCard)
    expect(starters.length).toBe(15)
  })

  it('should retrieve card by ID', () => {
    const card = getCardById('warrior-basic-1')
    expect(card).toBeDefined()
    expect(card?.id).toBe('warrior-basic-1')
  })

  it('should set templateId when generating card from template', () => {
    const template = getCardById('warrior-basic-1')!
    const card = generateCardFromTemplate(template, 'test-instance-123')

    expect(card.templateId).toBe('warrior-basic-1')
    expect(card.id).toBe('test-instance-123')
    expect(card.name).toBe(template.name)
  })
})

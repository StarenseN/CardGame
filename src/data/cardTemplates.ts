import { Card, type CardType, type CardRarity, type CardEffect } from '../types/Card'

export interface CardTemplate {
  type: CardType
  power: number
  rarity: CardRarity
  name: string
  effects?: CardEffect[]
}

export const CARD_TEMPLATES: CardTemplate[] = [
  // COMMON UNITS (power 2-4, 60% of pool)
  { type: 'unit', power: 2, rarity: 'common', name: 'Apprentice Miner' },
  { type: 'unit', power: 2, rarity: 'common', name: 'Young Hauler' },
  { type: 'unit', power: 3, rarity: 'common', name: 'Mason' },
  { type: 'unit', power: 3, rarity: 'common', name: 'Woodcutter' },
  { type: 'unit', power: 3, rarity: 'common', name: 'Fisherdwarf' },
  { type: 'unit', power: 4, rarity: 'common', name: 'Axedwarf' },
  { type: 'unit', power: 4, rarity: 'common', name: 'Speardwarf' },
  { type: 'unit', power: 4, rarity: 'common', name: 'Marksdwarf' },
  { type: 'unit', power: 2, rarity: 'common', name: 'Herbalist' },
  { type: 'unit', power: 3, rarity: 'common', name: 'Craftsdwarf' },
  { type: 'unit', power: 3, rarity: 'common', name: 'Brewer' },
  { type: 'unit', power: 4, rarity: 'common', name: 'Engraver' },

  // RARE UNITS (power 4-6, with simple effects, 30%)
  {
    type: 'unit',
    power: 4,
    rarity: 'rare',
    name: 'Veteran Miner',
    effects: [{ type: 'draw', description: 'Draw 1 card when played' }]
  },
  {
    type: 'unit',
    power: 5,
    rarity: 'rare',
    name: 'Elite Axedwarf',
    effects: [{ type: 'power_boost', value: 2, description: 'When sacrificed, grants +2 power instead of normal' }]
  },
  { type: 'unit', power: 5, rarity: 'rare', name: 'Champion' },
  {
    type: 'unit',
    power: 6,
    rarity: 'rare',
    name: 'Hammerdwarf Captain',
    effects: [{ type: 'draw', description: 'Draw 1 card when played' }]
  },
  { type: 'unit', power: 5, rarity: 'rare', name: 'Siege Engineer' },
  { type: 'unit', power: 6, rarity: 'rare', name: 'Legendary Miner' },

  // EPIC UNITS (power 6-8, strong effects + drawbacks, 8%)
  {
    type: 'unit',
    power: 7,
    rarity: 'epic',
    name: 'Berserker',
    effects: [
      { type: 'power_boost', value: 3, description: '+3 power in combat' },
      { type: 'draw', value: -1, description: 'Drawback: -1 card draw at start of next round' }
    ]
  },
  {
    type: 'unit',
    power: 8,
    rarity: 'epic',
    name: 'Ancient Defender',
    effects: [
      { type: 'recursive', description: 'Returns to hand if sacrificed' }
    ]
  },

  // LEGENDARY (power 8-10, very strong + major drawbacks, 2%)
  {
    type: 'unit',
    power: 10,
    rarity: 'legendary',
    name: 'Armok\'s Chosen',
    effects: [
      { type: 'power_boost', value: 5, description: '+5 power in combat' },
      { type: 'draw', value: -2, description: 'Drawback: -2 max hand size for this combat' }
    ]
  },
]

export function generateCardFromTemplate(template: CardTemplate, id: string): Card {
  return new Card({
    id,
    type: template.type,
    power: template.power,
    rarity: template.rarity,
    name: template.name,
    effects: template.effects ? [...template.effects] : undefined
  })
}

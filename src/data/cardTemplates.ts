import { Card, type CardType, type CardRarity, type CardEffect } from '../types/Card'
import { type UnitType } from '../types/CardType'

export interface CardTemplate {
  id: string // Unique ID for unlocking/crafting
  type: CardType
  unitType?: UnitType // For units only
  power: number
  rarity: CardRarity
  name: string
  effects?: CardEffect[]
  starterCard: boolean // Unlocked by default?
  unlockCost: number // Fragments needed to unlock
}

export const CARD_POOL: CardTemplate[] = [
  // === STARTER CARDS (15 basic cards, free) ===

  // Warriors (5 starters)
  {
    id: 'warrior-basic-1',
    type: 'unit',
    unitType: 'warrior',
    power: 3,
    rarity: 'common',
    name: 'Axe Recruit',
    starterCard: true,
    unlockCost: 0
  },
  {
    id: 'warrior-basic-2',
    type: 'unit',
    unitType: 'warrior',
    power: 3,
    rarity: 'common',
    name: 'Spear Guard',
    starterCard: true,
    unlockCost: 0
  },
  {
    id: 'warrior-basic-3',
    type: 'unit',
    unitType: 'warrior',
    power: 4,
    rarity: 'common',
    name: 'Hammer Dwarf',
    starterCard: true,
    unlockCost: 0
  },
  {
    id: 'warrior-basic-4',
    type: 'unit',
    unitType: 'warrior',
    power: 4,
    rarity: 'common',
    name: 'Shield Bearer',
    starterCard: true,
    unlockCost: 0
  },
  {
    id: 'warrior-basic-5',
    type: 'unit',
    unitType: 'warrior',
    power: 2,
    rarity: 'common',
    name: 'Scout',
    starterCard: true,
    unlockCost: 0
  },

  // Mages (5 starters)
  {
    id: 'mage-basic-1',
    type: 'unit',
    unitType: 'mage',
    power: 3,
    rarity: 'common',
    name: 'Apprentice Runesmith',
    starterCard: true,
    unlockCost: 0
  },
  {
    id: 'mage-basic-2',
    type: 'unit',
    unitType: 'mage',
    power: 3,
    rarity: 'common',
    name: 'Crystal Mage',
    starterCard: true,
    unlockCost: 0
  },
  {
    id: 'mage-basic-3',
    type: 'unit',
    unitType: 'mage',
    power: 4,
    rarity: 'common',
    name: 'Fire Caster',
    starterCard: true,
    unlockCost: 0
  },
  {
    id: 'mage-basic-4',
    type: 'unit',
    unitType: 'mage',
    power: 2,
    rarity: 'common',
    name: 'Herbalist',
    starterCard: true,
    unlockCost: 0
  },
  {
    id: 'mage-basic-5',
    type: 'unit',
    unitType: 'mage',
    power: 4,
    rarity: 'common',
    name: 'Stone Shaper',
    starterCard: true,
    unlockCost: 0
  },

  // Creatures (5 starters)
  {
    id: 'creature-basic-1',
    type: 'unit',
    unitType: 'creature',
    power: 3,
    rarity: 'common',
    name: 'Cave Troll',
    starterCard: true,
    unlockCost: 0
  },
  {
    id: 'creature-basic-2',
    type: 'unit',
    unitType: 'creature',
    power: 3,
    rarity: 'common',
    name: 'Giant Bat',
    starterCard: true,
    unlockCost: 0
  },
  {
    id: 'creature-basic-3',
    type: 'unit',
    unitType: 'creature',
    power: 4,
    rarity: 'common',
    name: 'Underground Beast',
    starterCard: true,
    unlockCost: 0
  },
  {
    id: 'creature-basic-4',
    type: 'unit',
    unitType: 'creature',
    power: 2,
    rarity: 'common',
    name: 'Forgotten One',
    starterCard: true,
    unlockCost: 0
  },
  {
    id: 'creature-basic-5',
    type: 'unit',
    unitType: 'creature',
    power: 4,
    rarity: 'common',
    name: 'Magma Worm',
    starterCard: true,
    unlockCost: 0
  },

  // === UNLOCKABLE WARRIORS (8 cards) ===
  {
    id: 'warrior-veteran-1',
    type: 'unit',
    unitType: 'warrior',
    power: 5,
    rarity: 'rare',
    name: 'Veteran Hammerer',
    effects: [{ type: 'draw', description: 'Draw 1 when played' }],
    starterCard: false,
    unlockCost: 50
  },
  {
    id: 'warrior-veteran-2',
    type: 'unit',
    unitType: 'warrior',
    power: 5,
    rarity: 'rare',
    name: 'Elite Axedwarf',
    starterCard: false,
    unlockCost: 50
  },
  {
    id: 'warrior-champion',
    type: 'unit',
    unitType: 'warrior',
    power: 6,
    rarity: 'epic',
    name: 'Champion',
    starterCard: false,
    unlockCost: 150
  },
  {
    id: 'warrior-counter',
    type: 'unit',
    unitType: 'warrior',
    power: 4,
    rarity: 'rare',
    name: 'Shield Master',
    effects: [{ type: 'power_boost', value: 3, description: 'Negate opponent\'s highest effect' }],
    starterCard: false,
    unlockCost: 80
  },
  {
    id: 'warrior-berserker',
    type: 'unit',
    unitType: 'warrior',
    power: 5,
    rarity: 'epic',
    name: 'Berserker',
    effects: [
      { type: 'power_boost', value: 2, description: '+2 vs creatures' }
    ],
    starterCard: false,
    unlockCost: 120
  },
  {
    id: 'warrior-legendary',
    type: 'unit',
    unitType: 'warrior',
    power: 6,
    rarity: 'legendary',
    name: 'Armok\'s Chosen',
    effects: [
      { type: 'power_boost', value: 2, description: '+2 power' },
      { type: 'draw', value: -1, description: 'Drawback: -1 draw next round' }
    ],
    starterCard: false,
    unlockCost: 300
  },
  {
    id: 'warrior-support-1',
    type: 'unit',
    unitType: 'warrior',
    power: 3,
    rarity: 'common',
    name: 'War Drummer',
    effects: [{ type: 'power_boost', value: 1, description: 'Other warriors +1' }],
    starterCard: false,
    unlockCost: 40
  },
  {
    id: 'warrior-support-2',
    type: 'unit',
    unitType: 'warrior',
    power: 4,
    rarity: 'rare',
    name: 'Siege Master',
    starterCard: false,
    unlockCost: 60
  },

  // === UNLOCKABLE MAGES (8 cards) ===
  {
    id: 'mage-adept-1',
    type: 'unit',
    unitType: 'mage',
    power: 5,
    rarity: 'rare',
    name: 'Runemaster',
    effects: [{ type: 'draw', description: 'Draw 1 when played' }],
    starterCard: false,
    unlockCost: 50
  },
  {
    id: 'mage-adept-2',
    type: 'unit',
    unitType: 'mage',
    power: 5,
    rarity: 'rare',
    name: 'Lightning Caller',
    starterCard: false,
    unlockCost: 50
  },
  {
    id: 'mage-master',
    type: 'unit',
    unitType: 'mage',
    power: 6,
    rarity: 'epic',
    name: 'Arch-Mage',
    starterCard: false,
    unlockCost: 150
  },
  {
    id: 'mage-counter',
    type: 'unit',
    unitType: 'mage',
    power: 4,
    rarity: 'rare',
    name: 'Dispeller',
    effects: [{ type: 'power_boost', value: 3, description: 'Cancel all opponent effects this round' }],
    starterCard: false,
    unlockCost: 80
  },
  {
    id: 'mage-time',
    type: 'unit',
    unitType: 'mage',
    power: 5,
    rarity: 'epic',
    name: 'Time Bender',
    effects: [
      { type: 'draw', value: 2, description: 'Draw 2 cards' },
      { type: 'power_boost', value: -2, description: 'Drawback: -2 power' }
    ],
    starterCard: false,
    unlockCost: 120
  },
  {
    id: 'mage-legendary',
    type: 'unit',
    unitType: 'mage',
    power: 6,
    rarity: 'legendary',
    name: 'Ancient Sorcerer',
    effects: [
      { type: 'recursive', description: 'Return to hand when played' }
    ],
    starterCard: false,
    unlockCost: 300
  },
  {
    id: 'mage-support-1',
    type: 'unit',
    unitType: 'mage',
    power: 3,
    rarity: 'common',
    name: 'Crystal Bearer',
    effects: [{ type: 'draw', description: 'Draw 1 when played' }],
    starterCard: false,
    unlockCost: 40
  },
  {
    id: 'mage-support-2',
    type: 'unit',
    unitType: 'mage',
    power: 4,
    rarity: 'rare',
    name: 'Enchanter',
    starterCard: false,
    unlockCost: 60
  },

  // === UNLOCKABLE CREATURES (9 cards) ===
  {
    id: 'creature-strong-1',
    type: 'unit',
    unitType: 'creature',
    power: 5,
    rarity: 'rare',
    name: 'Ancient Beast',
    starterCard: false,
    unlockCost: 50
  },
  {
    id: 'creature-strong-2',
    type: 'unit',
    unitType: 'creature',
    power: 5,
    rarity: 'rare',
    name: 'Cave Dragon',
    starterCard: false,
    unlockCost: 50
  },
  {
    id: 'creature-titan',
    type: 'unit',
    unitType: 'creature',
    power: 6,
    rarity: 'epic',
    name: 'Forgotten Titan',
    starterCard: false,
    unlockCost: 150
  },
  {
    id: 'creature-counter',
    type: 'unit',
    unitType: 'creature',
    power: 4,
    rarity: 'rare',
    name: 'Armored Behemoth',
    effects: [{ type: 'power_boost', value: 2, description: 'Cannot be targeted by effects' }],
    starterCard: false,
    unlockCost: 80
  },
  {
    id: 'creature-swarm',
    type: 'unit',
    unitType: 'creature',
    power: 3,
    rarity: 'epic',
    name: 'Swarm Mother',
    effects: [
      { type: 'power_boost', value: 4, description: '+1 for each creature you played' }
    ],
    starterCard: false,
    unlockCost: 120
  },
  {
    id: 'creature-legendary',
    type: 'unit',
    unitType: 'creature',
    power: 6,
    rarity: 'legendary',
    name: 'Primordial Horror',
    effects: [
      { type: 'power_boost', value: 3, description: '+3 power' }
    ],
    starterCard: false,
    unlockCost: 300
  },
  {
    id: 'creature-support-1',
    type: 'unit',
    unitType: 'creature',
    power: 3,
    rarity: 'common',
    name: 'Pack Leader',
    effects: [{ type: 'power_boost', value: 1, description: 'Other creatures +1' }],
    starterCard: false,
    unlockCost: 40
  },
  {
    id: 'creature-support-2',
    type: 'unit',
    unitType: 'creature',
    power: 4,
    rarity: 'rare',
    name: 'Nest Guardian',
    starterCard: false,
    unlockCost: 60
  },
  {
    id: 'creature-utility',
    type: 'unit',
    unitType: 'creature',
    power: 2,
    rarity: 'rare',
    name: 'Scavenger Beast',
    effects: [{ type: 'draw', value: 2, description: 'Draw 2 when played' }],
    starterCard: false,
    unlockCost: 70
  },
]

export function getCardById(id: string): CardTemplate | undefined {
  return CARD_POOL.find(card => card.id === id)
}

export function getStarterCards(): CardTemplate[] {
  return CARD_POOL.filter(card => card.starterCard)
}

export function getUnlockableCards(): CardTemplate[] {
  return CARD_POOL.filter(card => !card.starterCard)
}

export function generateCardFromTemplate(template: CardTemplate, instanceId: string): Card {
  return new Card({
    id: instanceId,
    templateId: template.id,
    type: template.type,
    unitType: template.unitType,
    power: template.power,
    rarity: template.rarity,
    name: template.name,
    effects: template.effects ? [...template.effects] : undefined
  })
}

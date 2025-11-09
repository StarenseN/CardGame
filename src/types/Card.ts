import { type UnitType } from './CardType'

export type CardType = 'unit' | 'consumable'
export type CardRarity = 'common' | 'rare' | 'epic' | 'legendary'

export interface CardEffect {
  type: 'draw' | 'power_boost' | 'recursive' | 'battle_fury' | 'second_wind' | 'feint' | 'fortify'
  value?: number
  description: string
}

export interface CardBase {
  id: string
  templateId?: string
  type: CardType
  unitType?: UnitType // For rock-paper-scissors
  power: number
  rarity: CardRarity
  name?: string
  effects?: CardEffect[]
  fatigued: boolean
}

export class Card implements CardBase {
  id: string
  templateId?: string
  type: CardType
  unitType?: UnitType
  power: number
  rarity: CardRarity
  name?: string
  effects?: CardEffect[]
  fatigued: boolean

  constructor(data: Omit<CardBase, 'fatigued'> & { fatigued?: boolean }) {
    this.id = data.id
    this.templateId = data.templateId
    this.type = data.type
    this.unitType = data.unitType
    this.power = data.power
    this.rarity = data.rarity
    this.name = data.name
    this.effects = data.effects || []
    this.fatigued = data.fatigued || false
  }

  getEffectivePower(): number {
    return this.fatigued ? this.power - 1 : this.power
  }

  clone(): Card {
    return new Card({
      id: this.id,
      templateId: this.templateId,
      type: this.type,
      unitType: this.unitType,
      power: this.power,
      rarity: this.rarity,
      name: this.name,
      effects: this.effects ? [...this.effects] : undefined,
      fatigued: this.fatigued
    })
  }
}

export function createCard(data: Omit<CardBase, 'fatigued'> & { fatigued?: boolean }): Card {
  return new Card(data)
}

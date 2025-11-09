export type UnitType = 'warrior' | 'mage' | 'creature'

export interface TypeAdvantage {
  strongAgainst: UnitType
  weakAgainst: UnitType
}

export const TYPE_CHART: Record<UnitType, TypeAdvantage> = {
  warrior: { strongAgainst: 'creature', weakAgainst: 'mage' },
  mage: { strongAgainst: 'warrior', weakAgainst: 'creature' },
  creature: { strongAgainst: 'mage', weakAgainst: 'warrior' },
}

export function calculateTypeBonus(attacker: UnitType, defender: UnitType): number {
  if (TYPE_CHART[attacker].strongAgainst === defender) return 2
  if (TYPE_CHART[attacker].weakAgainst === defender) return -1
  return 0
}

# Extraction Meta-Progression System - Balanced Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a complete extraction card game with Tarkov-style risk/reward, meta-progression through card unlocking, and carefully balanced fixed card pool.

**Architecture:** Fixed pool of 40 balanced cards, procedural zone generation (not card generation), unlock/craft system, persistent stash, Scav/PMC runs with real risk.

**Tech Stack:** React + TypeScript + Zustand + localStorage persistence

---

## Design Philosophy

**BALANCED over RANDOM:**
- 40 fixed cards (power 2-6 max)
- Rock-paper-scissors type system (Warrior/Mage/Creature)
- No procedural card generation (too risky for balance)
- Procedural ZONES, not cards

**PROGRESSION over POWER:**
- Start with 15 basic cards unlocked
- Unlock remaining 25 through gameplay
- Satisfaction = collection completion, not random OP drops

**RISK over SAFETY:**
- Scav: safe, low rewards, keep deck if win
- PMC: risky, high rewards, lose deck if die
- Tarkov-style tension

---

## PHASE 1: Card Pool Redesign (Balanced)

### Task 1: Replace Procedural Cards with Fixed Balanced Pool

**Files:**
- Modify: `src/data/cardTemplates.ts`
- Modify: `src/data/cardTemplates.test.ts`
- Create: `src/types/CardType.ts`

**Step 1: Define card types system**

Create `src/types/CardType.ts`:
```typescript
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
```

**Step 2: Write test for balanced card pool**

Update `src/data/cardTemplates.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { CARD_POOL, getCardById } from './cardTemplates'

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
})
```

**Step 3: Run test to verify it fails**

Run: `npm test -- --run cardTemplates.test.ts`
Expected: FAIL

**Step 4: Implement balanced 40-card pool**

Update `src/data/cardTemplates.ts`:
```typescript
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
    type: template.type,
    power: template.power,
    rarity: template.rarity,
    name: template.name,
    effects: template.effects ? [...template.effects] : undefined
  })
}
```

**Step 5: Update Card type to include unitType**

In `src/types/Card.ts`, update CardBase:
```typescript
import { type UnitType } from './CardType'

export interface CardBase {
  id: string
  type: CardType
  unitType?: UnitType // For rock-paper-scissors
  power: number
  rarity: CardRarity
  name?: string
  effects?: CardEffect[]
  fatigued: boolean
}

export class Card implements CardBase {
  // ... existing fields ...
  unitType?: UnitType

  constructor(data: Omit<CardBase, 'fatigued'> & { fatigued?: boolean }) {
    // ... existing assignments ...
    this.unitType = data.unitType
  }

  clone(): Card {
    return new Card({
      // ... existing props ...
      unitType: this.unitType,
    })
  }
}
```

**Step 6: Run tests**

Run: `npm test -- --run cardTemplates.test.ts Card.test.ts`
Expected: PASS

**Step 7: Commit**

```bash
git add src/data/cardTemplates.ts src/types/Card.ts src/types/CardType.ts
git commit -m "feat: replace procedural cards with balanced 40-card fixed pool

- 40 carefully balanced cards (power 2-6 max)
- Rock-paper-scissors type system (Warrior/Mage/Creature)
- 15 starter cards (unlocked by default)
- 25 unlockable cards (progression system)
- No random OP cards - all hand-crafted for balance"
```

---

## PHASE 2: Unlock/Collection System

### Task 2: Collection State Management

**Files:**
- Create: `src/stores/collectionStore.ts`
- Create: `src/stores/collectionStore.test.ts`

**Step 1: Write failing test**

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { useCollectionStore } from './collectionStore'

describe('Collection Store', () => {
  beforeEach(() => {
    useCollectionStore.getState().reset()
  })

  it('should start with 15 starter cards unlocked', () => {
    const store = useCollectionStore.getState()
    expect(store.unlockedCards.length).toBe(15)
  })

  it('should unlock a card when enough fragments', () => {
    const store = useCollectionStore.getState()
    store.addFragments(50)

    const unlockableCard = 'warrior-veteran-1' // costs 50
    const result = store.unlockCard(unlockableCard)

    expect(result).toBe(true)
    expect(store.fragments).toBe(0)
    expect(store.unlockedCards).toContain(unlockableCard)
  })

  it('should not unlock without enough fragments', () => {
    const store = useCollectionStore.getState()
    store.addFragments(30)

    const result = store.unlockCard('warrior-veteran-1') // costs 50

    expect(result).toBe(false)
    expect(store.fragments).toBe(30)
  })

  it('should track owned card instances', () => {
    const store = useCollectionStore.getState()

    store.addCardInstance('warrior-basic-1', 'instance-1')
    store.addCardInstance('warrior-basic-1', 'instance-2')

    expect(store.ownedInstances.length).toBe(2)
    expect(store.getCardCount('warrior-basic-1')).toBe(2)
  })
})
```

**Step 2: Implement collection store**

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getStarterCards, getCardById } from '../data/cardTemplates'

export interface CardInstance {
  templateId: string // References CARD_POOL
  instanceId: string // Unique instance
  acquiredDate: number
}

export interface CollectionState {
  // Unlocks
  unlockedCards: string[] // Array of card IDs from CARD_POOL
  fragments: number

  // Owned instances (for PMC runs)
  ownedInstances: CardInstance[]

  // Actions
  unlockCard: (cardId: string) => boolean
  addFragments: (amount: number) => void
  addCardInstance: (templateId: string, instanceId: string) => void
  removeCardInstance: (instanceId: string) => void
  getCardCount: (templateId: string) => number
  reset: () => void
}

export const useCollectionStore = create<CollectionState>()(
  persist(
    (set, get) => ({
      unlockedCards: getStarterCards().map(c => c.id),
      fragments: 0,
      ownedInstances: [],

      unlockCard: (cardId: string) => {
        const state = get()
        const card = getCardById(cardId)

        if (!card) return false
        if (state.unlockedCards.includes(cardId)) return false
        if (state.fragments < card.unlockCost) return false

        set({
          unlockedCards: [...state.unlockedCards, cardId],
          fragments: state.fragments - card.unlockCost,
        })

        return true
      },

      addFragments: (amount: number) => {
        set((state) => ({
          fragments: state.fragments + amount,
        }))
      },

      addCardInstance: (templateId: string, instanceId: string) => {
        set((state) => ({
          ownedInstances: [
            ...state.ownedInstances,
            { templateId, instanceId, acquiredDate: Date.now() }
          ],
        }))
      },

      removeCardInstance: (instanceId: string) => {
        set((state) => ({
          ownedInstances: state.ownedInstances.filter(i => i.instanceId !== instanceId),
        }))
      },

      getCardCount: (templateId: string) => {
        return get().ownedInstances.filter(i => i.templateId === templateId).length
      },

      reset: () => {
        set({
          unlockedCards: getStarterCards().map(c => c.id),
          fragments: 0,
          ownedInstances: [],
        })
      },
    }),
    {
      name: 'collection-storage',
    }
  )
)
```

**Step 3: Run tests**

Run: `npm test -- --run collectionStore.test.ts`
Expected: PASS

**Step 4: Commit**

```bash
git add src/stores/collectionStore.*
git commit -m "feat: add collection system with unlock and instance tracking"
```

---

## PHASE 3: Scav/PMC Run System

### Task 3: Run State with Scav/PMC Logic

**Files:**
- Modify: `src/stores/runStore.ts`
- Modify: `src/stores/runStore.test.ts`

**Step 1: Update run store tests**

Add to existing tests:
```typescript
it('should generate scav deck from unlocked cards only', () => {
  const collection = useCollectionStore.getState()
  collection.reset() // Start with 15 starters

  const run = useRunStore.getState()
  run.startRun('scav')

  // All cards should be from starter pool
  const allFromStarters = run.currentDeck.every(card =>
    getStarterCards().find(s => s.name === card.name)
  )

  expect(allFromStarters).toBe(true)
  expect(run.currentDeck.length).toBe(12)
})

it('should allow PMC run with custom deck from owned instances', () => {
  const collection = useCollectionStore.getState()

  // Add some owned instances
  for (let i = 0; i < 20; i++) {
    collection.addCardInstance('warrior-basic-1', `instance-${i}`)
  }

  const run = useRunStore.getState()
  const ownedCards = collection.ownedInstances.slice(0, 20)

  run.startRun('pmc', ownedCards.map(inst => inst.instanceId))

  expect(run.currentDeck.length).toBe(20)
  expect(run.runType).toBe('pmc')
})
```

**Step 2: Refactor runStore to use collection**

In `src/stores/runStore.ts`:
```typescript
import { useCollectionStore } from './collectionStore'
import { getCardById, generateCardFromTemplate } from '../data/cardTemplates'

const generateScavDeck = (): Card[] => {
  const collection = useCollectionStore.getState()
  const unlockedTemplates = collection.unlockedCards
    .map(id => getCardById(id))
    .filter(t => t !== undefined)

  // Pick 12 random cards from unlocked pool
  const deck: Card[] = []
  for (let i = 0; i < 12; i++) {
    const template = unlockedTemplates[Math.floor(Math.random() * unlockedTemplates.length)]
    const card = generateCardFromTemplate(template, `scav-${Date.now()}-${i}`)
    deck.push(card)
  }

  return deck
}

const generatePMCDeck = (instanceIds: string[]): Card[] => {
  const collection = useCollectionStore.getState()

  return instanceIds.map(instId => {
    const instance = collection.ownedInstances.find(i => i.instanceId === instId)
    if (!instance) throw new Error(`Instance ${instId} not found`)

    const template = getCardById(instance.templateId)
    if (!template) throw new Error(`Template ${instance.templateId} not found`)

    return generateCardFromTemplate(template, instId)
  })
}

export interface RunState {
  // ... existing fields ...
  deckInstanceIds: string[] // For PMC, track which instances are in use

  startRun: (type: RunType, instanceIds?: string[]) => void
  // ... rest
}

export const useRunStore = create<RunState>()(
  persist(
    (set, get) => ({
      // ... existing state ...
      deckInstanceIds: [],

      startRun: (type, instanceIds) => {
        let deck: Card[]
        let deckInsts: string[] = []

        if (type === 'scav') {
          deck = generateScavDeck()
        } else {
          if (!instanceIds || instanceIds.length === 0) {
            throw new Error('PMC run requires instance IDs')
          }
          deck = generatePMCDeck(instanceIds)
          deckInsts = instanceIds
        }

        set({
          isRunActive: true,
          runType: type,
          currentDeck: deck,
          deckInstanceIds: deckInsts,
          encountersCompleted: 0,
          lootMaterials: 0,
        })
      },

      extract: () => {
        const state = get()
        const collection = useCollectionStore.getState()

        // Add fragments to collection
        collection.addFragments(state.lootMaterials)

        // If scav run, add deck cards as owned instances
        if (state.runType === 'scav') {
          state.currentDeck.forEach(card => {
            // Extract template ID from card (need to track this)
            // For now, assume we stored it somewhere or infer from name
            const template = CARD_POOL.find(t => t.name === card.name)
            if (template) {
              collection.addCardInstance(template.id, card.id)
            }
          })
        }

        set({
          isRunActive: false,
          currentDeck: [],
          deckInstanceIds: [],
          lootMaterials: 0,
        })
      },

      death: () => {
        const state = get()
        const collection = useCollectionStore.getState()

        // If PMC, remove instances from collection (lost!)
        if (state.runType === 'pmc') {
          state.deckInstanceIds.forEach(instId => {
            collection.removeCardInstance(instId)
          })
        }

        set({
          isRunActive: false,
          currentDeck: [],
          deckInstanceIds: [],
          lootMaterials: 0,
        })
      },

      // ... rest
    }),
    // ... persist config
  )
)
```

**Step 3: Run tests**

Run: `npm test -- --run runStore.test.ts`
Expected: PASS

**Step 4: Commit**

```bash
git add src/stores/runStore.ts src/stores/runStore.test.ts
git commit -m "feat: integrate Scav/PMC runs with collection system

- Scav: random deck from unlocked cards
- PMC: custom deck from owned instances
- Extract: scav deck → owned instances
- Death: PMC instances lost forever"
```

---

## PHASE 4: Main Menu & Collection UI

### Task 4: Main Menu with Collection View

**Files:**
- Create: `src/components/MainMenu.tsx`
- Create: `src/components/CollectionView.tsx`

**Step 1: Create collection view**

```typescript
// src/components/CollectionView.tsx
import { useCollectionStore } from '../stores/collectionStore'
import { CARD_POOL } from '../data/cardTemplates'
import { CardComponent } from './Card'
import { generateCardFromTemplate } from '../data/cardTemplates'

export function CollectionView() {
  const { unlockedCards, fragments, unlockCard, getCardCount } = useCollectionStore()

  const handleUnlock = (cardId: string) => {
    const success = unlockCard(cardId)
    if (!success) {
      alert('Not enough fragments!')
    }
  }

  return (
    <div className="p-4 bg-gray-900 text-white min-h-screen">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">Collection</h2>
        <p className="text-xl">Fragments: <span className="text-yellow-400">{fragments}</span></p>
        <p className="text-sm text-gray-400">
          Unlocked: {unlockedCards.length} / {CARD_POOL.length}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {CARD_POOL.map((template) => {
          const isUnlocked = unlockedCards.includes(template.id)
          const ownedCount = getCardCount(template.id)
          const previewCard = generateCardFromTemplate(template, 'preview')

          return (
            <div key={template.id} className="relative">
              <CardComponent
                card={previewCard}
                disabled={!isUnlocked}
              />

              {!isUnlocked && (
                <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center rounded-lg">
                  <p className="text-xs text-yellow-400 mb-2">
                    Cost: {template.unlockCost}
                  </p>
                  <button
                    onClick={() => handleUnlock(template.id)}
                    disabled={fragments < template.unlockCost}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs font-bold disabled:opacity-30"
                  >
                    Unlock
                  </button>
                </div>
              )}

              {isUnlocked && ownedCount > 0 && (
                <div className="absolute top-1 right-1 bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  {ownedCount}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

**Step 2: Create main menu**

```typescript
// src/components/MainMenu.tsx
import { useState } from 'react'
import { useCollectionStore } from '../stores/collectionStore'
import { CollectionView } from './CollectionView'

interface MainMenuProps {
  onStartRun: (type: 'scav' | 'pmc', instanceIds?: string[]) => void
}

export function MainMenu({ onStartRun }: MainMenuProps) {
  const [view, setView] = useState<'menu' | 'collection'>('menu')
  const { fragments, ownedInstances } = useCollectionStore()

  if (view === 'collection') {
    return (
      <div>
        <button
          onClick={() => setView('menu')}
          className="absolute top-4 left-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
        >
          ← Back
        </button>
        <CollectionView />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="max-w-2xl w-full p-8">
        <h1 className="text-5xl font-bold text-center mb-8">Dwarf Extraction</h1>

        <div className="bg-gray-800 rounded p-6 mb-8">
          <h2 className="text-2xl mb-4">Resources</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400">Fragments</p>
              <p className="text-3xl font-bold text-yellow-400">{fragments}</p>
            </div>
            <div>
              <p className="text-gray-400">Owned Cards</p>
              <p className="text-3xl font-bold">{ownedInstances.length}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-800 rounded p-6">
            <h3 className="text-xl font-bold mb-2 text-green-400">Scav Run</h3>
            <p className="text-sm text-gray-400 mb-4">
              Random deck from unlocked cards. No risk - keep deck if you extract. Lower fragments.
            </p>
            <button
              onClick={() => onStartRun('scav')}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-bold"
            >
              Start Scav Run
            </button>
          </div>

          <div className="bg-gray-800 rounded p-6">
            <h3 className="text-xl font-bold mb-2 text-red-400">PMC Run</h3>
            <p className="text-sm text-gray-400 mb-4">
              Custom deck (20 cards). Lose deck if you die. Higher fragments.
            </p>
            <button
              onClick={() => {
                // TODO: Deck builder UI
                alert('PMC deck builder coming soon!')
              }}
              disabled={ownedInstances.length < 20}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-bold disabled:opacity-50"
            >
              {ownedInstances.length >= 20 ? 'Start PMC Run' : `Need ${20 - ownedInstances.length} more cards`}
            </button>
          </div>
        </div>

        <button
          onClick={() => setView('collection')}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-bold"
        >
          View Collection
        </button>
      </div>
    </div>
  )
}
```

**Step 3: Integrate into App**

Update `src/App.tsx`:
```typescript
import { useState } from 'react'
import { MainMenu } from './components/MainMenu'
import { CombatArena } from './components/CombatArena'
import { useRunStore } from './stores/runStore'
import { useCombatStore } from './stores/combatStore'

type GameScreen = 'menu' | 'combat'

function App() {
  const [screen, setScreen] = useState<GameScreen>('menu')
  const { startRun, currentDeck } = useRunStore()
  const { initCombat, setupRound } = useCombatStore()

  const handleStartRun = (type: 'scav' | 'pmc', instanceIds?: string[]) => {
    startRun(type, instanceIds)
    setScreen('combat')

    // Init combat after state update
    setTimeout(() => {
      const deck = useRunStore.getState().currentDeck
      const aiDeck = [...deck].sort(() => Math.random() - 0.5)
      initCombat(deck, aiDeck)
      setupRound()
    }, 0)
  }

  if (screen === 'menu') {
    return <MainMenu onStartRun={handleStartRun} />
  }

  return <CombatArena />
}

export default App
```

**Step 4: Test manually**

Run: `npm run dev`

Test:
1. See fragments count
2. Click "View Collection"
3. See 15 unlocked starters
4. See locked cards with unlock costs
5. Start scav run
6. Win combat → extract → fragments increase
7. Back to collection → unlock a card

**Step 5: Commit**

```bash
git add src/components/MainMenu.tsx src/components/CollectionView.tsx src/App.tsx
git commit -m "feat: add main menu and collection view UI

- Collection grid showing all 40 cards
- Unlock interface with fragment costs
- Scav/PMC run selection
- Integration with App navigation"
```

---

## Summary

This plan delivers:

✅ **40 balanced cards** (no OP random generation)
✅ **Rock-paper-scissors** type system
✅ **Unlock progression** (15 starters + 25 unlockable)
✅ **Scav/PMC runs** with real risk
✅ **Collection system** with persistence
✅ **Fragment economy** for unlocks
✅ **Main menu** with collection view

**Next steps:**
- Task 5: Procedural zone generation
- Task 6: Encounter selection (Easy/Medium/Hard)
- Task 7: Victory conditions and extraction points
- Task 8: PMC deck builder UI

This creates a complete extraction game loop without the balance nightmare of procedural card generation!

# Dwarf Fortress Extraction Card Game - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a roguelike extraction deck-builder with Blue Moon combat mechanics, Tarkov-style risk/reward, and procedural generation.

**Architecture:** Browser-based single-player game with React frontend, procedural run generation, Blue Moon-inspired combat system with dragon scoring and card sacrifice mechanics, meta-progression with persistent stash and crafting system.

**Tech Stack:** React 18 + TypeScript, Vite, TailwindCSS, Zustand (state management), Vitest + React Testing Library

---

## PHASE 1: MVP - Core Combat Loop (Foundation)

### Task 1: Project Setup

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `.gitignore`

**Step 1: Initialize project**

```bash
npm create vite@latest . -- --template react-ts
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install zustand
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

**Step 2: Configure Tailwind**

Edit `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Edit `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Step 3: Configure Vitest**

Edit `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
```

Create `src/test/setup.ts`:
```typescript
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

afterEach(() => {
  cleanup()
})
```

**Step 4: Update package.json scripts**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

**Step 5: Create basic App structure**

Edit `src/App.tsx`:
```typescript
function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="p-4">
        <h1 className="text-3xl font-bold text-center">Dwarf Extraction</h1>
      </header>
      <main className="container mx-auto p-4">
        <p className="text-center">Game starting soon...</p>
      </main>
    </div>
  )
}

export default App
```

**Step 6: Verify setup**

Run: `npm run dev`
Expected: Dev server starts on http://localhost:5173, shows "Dwarf Extraction" title

Run: `npm test`
Expected: Vitest runs (no tests yet)

**Step 7: Update .gitignore**

```
node_modules
dist
.DS_Store
*.log
.env
coverage
```

**Step 8: Initial commit**

```bash
git add .
git commit -m "feat: initial project setup with React, TypeScript, Tailwind, Vitest"
```

---

### Task 2: Card Type Definitions

**Files:**
- Create: `src/types/Card.ts`
- Create: `src/types/Card.test.ts`

**Step 1: Write failing test for Card type**

Create `src/types/Card.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { Card, createCard } from './Card'

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
})
```

**Step 2: Run test to verify it fails**

Run: `npm test Card.test.ts`
Expected: FAIL - "Cannot find module './Card'"

**Step 3: Implement Card types**

Create `src/types/Card.ts`:
```typescript
export type CardType = 'unit' | 'consumable'
export type CardRarity = 'common' | 'rare' | 'epic' | 'legendary'

export interface CardEffect {
  type: 'draw' | 'power_boost' | 'recursive' | 'battle_fury' | 'second_wind' | 'feint' | 'fortify'
  value?: number
  description: string
}

export interface CardBase {
  id: string
  type: CardType
  power: number
  rarity: CardRarity
  name?: string
  effects?: CardEffect[]
  fatigued: boolean
}

export class Card implements CardBase {
  id: string
  type: CardType
  power: number
  rarity: CardRarity
  name?: string
  effects?: CardEffect[]
  fatigued: boolean

  constructor(data: Omit<CardBase, 'fatigued'> & { fatigued?: boolean }) {
    this.id = data.id
    this.type = data.type
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
      type: this.type,
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
```

**Step 4: Run test to verify it passes**

Run: `npm test Card.test.ts`
Expected: PASS - All tests green

**Step 5: Commit**

```bash
git add src/types/
git commit -m "feat: add Card type definitions and factory"
```

---

### Task 3: Card Pool (Fixed Templates for MVP)

**Files:**
- Create: `src/data/cardTemplates.ts`
- Create: `src/data/cardTemplates.test.ts`

**Step 1: Write failing test for card pool**

Create `src/data/cardTemplates.test.ts`:
```typescript
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
```

**Step 2: Run test to verify it fails**

Run: `npm test cardTemplates.test.ts`
Expected: FAIL - "Cannot find module './cardTemplates'"

**Step 3: Implement card templates**

Create `src/data/cardTemplates.ts`:
```typescript
import { Card, CardType, CardRarity, CardEffect } from '../types/Card'

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
```

**Step 4: Run test to verify it passes**

Run: `npm test cardTemplates.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/data/
git commit -m "feat: add 20 card templates with rarity distribution"
```

---

### Task 4: Combat State Management

**Files:**
- Create: `src/stores/combatStore.ts`
- Create: `src/stores/combatStore.test.ts`

**Step 1: Write failing test for combat store**

Create `src/stores/combatStore.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { useCombatStore } from './combatStore'
import { createCard } from '../types/Card'

describe('Combat Store', () => {
  beforeEach(() => {
    useCombatStore.getState().reset()
  })

  it('should initialize combat with player and AI decks', () => {
    const playerDeck = [
      createCard({ id: 'p1', type: 'unit', power: 5, rarity: 'common' }),
      createCard({ id: 'p2', type: 'unit', power: 3, rarity: 'common' }),
    ]

    const aiDeck = [
      createCard({ id: 'ai1', type: 'unit', power: 4, rarity: 'common' }),
      createCard({ id: 'ai2', type: 'unit', power: 6, rarity: 'common' }),
    ]

    useCombatStore.getState().initCombat(playerDeck, aiDeck)

    const state = useCombatStore.getState()
    expect(state.playerDeck.length).toBe(2)
    expect(state.aiDeck.length).toBe(2)
    expect(state.playerHand.length).toBe(0) // Will draw in setup
    expect(state.phase).toBe('setup')
  })

  it('should setup round by drawing cards', () => {
    const playerDeck = Array.from({ length: 10 }, (_, i) =>
      createCard({ id: `p${i}`, type: 'unit', power: 3, rarity: 'common' })
    )

    const aiDeck = Array.from({ length: 10 }, (_, i) =>
      createCard({ id: `ai${i}`, type: 'unit', power: 3, rarity: 'common' })
    )

    const store = useCombatStore.getState()
    store.initCombat(playerDeck, aiDeck)
    store.setupRound()

    const state = useCombatStore.getState()
    expect(state.playerHand.length).toBe(5)
    expect(state.playerDeck.length).toBe(5)
    expect(state.phase).toBe('player_select')
  })

  it('should track dragons correctly', () => {
    const state = useCombatStore.getState()
    expect(state.playerDragons).toBe(0)
    expect(state.aiDragons).toBe(0)

    state.awardDragon('player')
    expect(state.playerDragons).toBe(1)

    state.awardDragon('ai')
    expect(state.aiDragons).toBe(1)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test combatStore.test.ts`
Expected: FAIL - "Cannot find module './combatStore'"

**Step 3: Implement combat store**

Create `src/stores/combatStore.ts`:
```typescript
import { create } from 'zustand'
import { Card } from '../types/Card'

export type CombatPhase =
  | 'setup'
  | 'player_select'
  | 'ai_select'
  | 'reveal'
  | 'resolution'
  | 'round_end'
  | 'combat_end'

export interface CombatState {
  // Decks
  playerDeck: Card[]
  playerHand: Card[]
  playerDiscard: Card[]
  aiDeck: Card[]
  aiHand: Card[]
  aiDiscard: Card[]

  // Current round
  playerPlayedCard: Card | null
  aiPlayedCard: Card | null
  playerSacrificed: Card[]
  aiSacrificed: Card[]

  // Score
  playerDragons: number
  aiDragons: number
  totalCardsPlayed: number
  dragonsToWin: number

  // State
  phase: CombatPhase
  roundNumber: number

  // Actions
  initCombat: (playerDeck: Card[], aiDeck: Card[]) => void
  setupRound: () => void
  playCard: (card: Card, sacrifices: Card[]) => void
  aiPlay: () => void
  resolveRound: () => void
  awardDragon: (winner: 'player' | 'ai') => void
  drawCard: (player: 'player' | 'ai') => void
  reset: () => void
}

const shuffle = <T,>(array: T[]): T[] => {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

export const useCombatStore = create<CombatState>((set, get) => ({
  // Initial state
  playerDeck: [],
  playerHand: [],
  playerDiscard: [],
  aiDeck: [],
  aiHand: [],
  aiDiscard: [],

  playerPlayedCard: null,
  aiPlayedCard: null,
  playerSacrificed: [],
  aiSacrificed: [],

  playerDragons: 0,
  aiDragons: 0,
  totalCardsPlayed: 0,
  dragonsToWin: 3,

  phase: 'setup',
  roundNumber: 0,

  initCombat: (playerDeck, aiDeck) => {
    set({
      playerDeck: shuffle(playerDeck),
      playerHand: [],
      playerDiscard: [],
      aiDeck: shuffle(aiDeck),
      aiHand: [],
      aiDiscard: [],
      playerDragons: 0,
      aiDragons: 0,
      totalCardsPlayed: 0,
      dragonsToWin: 3,
      phase: 'setup',
      roundNumber: 0,
      playerPlayedCard: null,
      aiPlayedCard: null,
      playerSacrificed: [],
      aiSacrificed: [],
    })
  },

  setupRound: () => {
    const state = get()
    let newPlayerDeck = [...state.playerDeck]
    let newPlayerHand = [...state.playerHand]
    let newAiDeck = [...state.aiDeck]
    let newAiHand = [...state.aiHand]

    // Draw 5 cards for player if hand is empty (first round)
    if (newPlayerHand.length === 0) {
      const drawn = newPlayerDeck.splice(0, 5)
      newPlayerHand = drawn
    }

    // Draw 5 cards for AI if hand is empty
    if (newAiHand.length === 0) {
      const drawn = newAiDeck.splice(0, 5)
      newAiHand = drawn
    }

    set({
      playerDeck: newPlayerDeck,
      playerHand: newPlayerHand,
      aiDeck: newAiDeck,
      aiHand: newAiHand,
      phase: 'player_select',
      roundNumber: state.roundNumber + 1,
      playerPlayedCard: null,
      aiPlayedCard: null,
      playerSacrificed: [],
      aiSacrificed: [],
    })
  },

  playCard: (card, sacrifices) => {
    const state = get()
    const newHand = state.playerHand.filter(c =>
      c.id !== card.id && !sacrifices.find(s => s.id === c.id)
    )

    set({
      playerPlayedCard: card,
      playerSacrificed: sacrifices,
      playerHand: newHand,
      phase: 'ai_select',
    })
  },

  aiPlay: () => {
    const state = get()
    if (state.aiHand.length === 0) return

    // Simple AI: play random card, no sacrifices for MVP
    const randomIndex = Math.floor(Math.random() * state.aiHand.length)
    const card = state.aiHand[randomIndex]
    const newHand = state.aiHand.filter(c => c.id !== card.id)

    set({
      aiPlayedCard: card,
      aiSacrificed: [],
      aiHand: newHand,
      phase: 'reveal',
    })
  },

  resolveRound: () => {
    const state = get()
    if (!state.playerPlayedCard || !state.aiPlayedCard) return

    // Calculate powers
    const playerPower = state.playerPlayedCard.getEffectivePower() +
      state.playerSacrificed.reduce((sum, c) => sum + Math.floor(c.getEffectivePower() / 2), 0)

    const aiPower = state.aiPlayedCard.getEffectivePower() +
      state.aiSacrificed.reduce((sum, c) => sum + Math.floor(c.getEffectivePower() / 2), 0)

    // Determine winner
    let winner: 'player' | 'ai' | 'tie' = 'tie'
    if (playerPower > aiPower) winner = 'player'
    else if (aiPower > playerPower) winner = 'ai'

    // Award dragon
    if (winner !== 'tie') {
      get().awardDragon(winner)
    }

    // Move cards to discard
    const newPlayerDiscard = [
      ...state.playerDiscard,
      state.playerPlayedCard,
      ...state.playerSacrificed
    ]
    const newAiDiscard = [
      ...state.aiDiscard,
      state.aiPlayedCard,
      ...state.aiSacrificed
    ]

    const totalPlayed = state.totalCardsPlayed +
      1 + state.playerSacrificed.length +
      1 + state.aiSacrificed.length

    // Update dragons to win based on total cards played
    const dragonsToWin = totalPlayed >= 6 ? 2 : 3

    set({
      playerDiscard: newPlayerDiscard,
      aiDiscard: newAiDiscard,
      totalCardsPlayed: totalPlayed,
      dragonsToWin,
      phase: 'round_end',
    })
  },

  awardDragon: (winner) => {
    set((state) => ({
      playerDragons: winner === 'player' ? state.playerDragons + 1 : state.playerDragons,
      aiDragons: winner === 'ai' ? state.aiDragons + 1 : state.aiDragons,
    }))
  },

  drawCard: (player) => {
    const state = get()
    if (player === 'player') {
      if (state.playerDeck.length === 0) return
      const card = state.playerDeck[0]
      set({
        playerDeck: state.playerDeck.slice(1),
        playerHand: [...state.playerHand, card],
      })
    } else {
      if (state.aiDeck.length === 0) return
      const card = state.aiDeck[0]
      set({
        aiDeck: state.aiDeck.slice(1),
        aiHand: [...state.aiHand, card],
      })
    }
  },

  reset: () => {
    set({
      playerDeck: [],
      playerHand: [],
      playerDiscard: [],
      aiDeck: [],
      aiHand: [],
      aiDiscard: [],
      playerPlayedCard: null,
      aiPlayedCard: null,
      playerSacrificed: [],
      aiSacrificed: [],
      playerDragons: 0,
      aiDragons: 0,
      totalCardsPlayed: 0,
      dragonsToWin: 3,
      phase: 'setup',
      roundNumber: 0,
    })
  },
}))
```

**Step 4: Run test to verify it passes**

Run: `npm test combatStore.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/stores/
git commit -m "feat: add combat state management with Zustand"
```

---

### Task 5: Card Component (UI)

**Files:**
- Create: `src/components/Card.tsx`
- Create: `src/components/Card.test.tsx`

**Step 1: Write failing test for Card component**

Create `src/components/Card.test.tsx`:
```typescript
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
```

**Step 2: Run test to verify it fails**

Run: `npm test Card.test.tsx`
Expected: FAIL - "Cannot find module './Card'"

**Step 3: Implement Card component**

Create `src/components/Card.tsx`:
```typescript
import { Card } from '../types/Card'

interface CardComponentProps {
  card: Card
  onClick?: () => void
  selected?: boolean
  disabled?: boolean
}

const rarityColors = {
  common: 'border-gray-400 bg-gray-800',
  rare: 'border-blue-400 bg-blue-900',
  epic: 'border-purple-400 bg-purple-900',
  legendary: 'border-yellow-500 bg-yellow-900',
}

export function CardComponent({ card, onClick, selected, disabled }: CardComponentProps) {
  const effectivePower = card.getEffectivePower()
  const borderColor = rarityColors[card.rarity]

  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`
        relative w-24 h-32 rounded-lg border-2 p-2
        ${borderColor}
        ${selected ? 'ring-2 ring-green-500' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
        ${card.fatigued ? 'opacity-75' : ''}
        transition-all duration-200
      `}
    >
      {/* Power - Top */}
      <div className="absolute top-1 left-1 w-8 h-8 rounded-full bg-red-600 flex items-center justify-center font-bold text-white">
        {effectivePower}
      </div>

      {/* Fatigue indicator */}
      {card.fatigued && (
        <div className="absolute top-1 right-1 w-6 h-6 rounded-full bg-yellow-600 flex items-center justify-center text-xs">
          !
        </div>
      )}

      {/* Name */}
      <div className="absolute bottom-2 left-2 right-2 text-center text-xs font-semibold text-white">
        {card.name || `Unit ${card.id}`}
      </div>

      {/* Effects (if any) */}
      {card.effects && card.effects.length > 0 && (
        <div className="absolute bottom-8 left-1 right-1 text-center text-[8px] text-gray-300">
          {card.effects[0].type}
        </div>
      )}
    </div>
  )
}
```

**Step 4: Run test to verify it passes**

Run: `npm test Card.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/Card.*
git commit -m "feat: add Card UI component with rarity styling"
```

---

### Task 6: Combat Arena Component

**Files:**
- Create: `src/components/CombatArena.tsx`
- Create: `src/components/CombatArena.test.tsx`

**Step 1: Write failing test**

Create `src/components/CombatArena.test.tsx`:
```typescript
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
```

**Step 2: Run test to verify it fails**

Run: `npm test CombatArena.test.tsx`
Expected: FAIL

**Step 3: Implement CombatArena component**

Create `src/components/CombatArena.tsx`:
```typescript
import { useState } from 'react'
import { useCombatStore } from '../stores/combatStore'
import { CardComponent } from './Card'
import { Card } from '../types/Card'

export function CombatArena() {
  const {
    playerHand,
    playerDragons,
    aiDragons,
    dragonsToWin,
    phase,
    playerPlayedCard,
    aiPlayedCard,
    playCard,
    aiPlay,
    resolveRound,
    setupRound,
    drawCard,
  } = useCombatStore()

  const [selectedCard, setSelectedCard] = useState<Card | null>(null)
  const [selectedSacrifices, setSelectedSacrifices] = useState<Card[]>([])

  const handleCardClick = (card: Card) => {
    if (phase !== 'player_select') return

    if (selectedCard?.id === card.id) {
      setSelectedCard(null)
    } else {
      setSelectedCard(card)
    }
  }

  const handleSacrificeClick = (card: Card) => {
    if (phase !== 'player_select') return
    if (card.id === selectedCard?.id) return

    const isSelected = selectedSacrifices.find(c => c.id === card.id)
    if (isSelected) {
      setSelectedSacrifices(selectedSacrifices.filter(c => c.id !== card.id))
    } else {
      setSelectedSacrifices([...selectedSacrifices, card])
    }
  }

  const handlePlayCard = () => {
    if (!selectedCard) return
    playCard(selectedCard, selectedSacrifices)
    setSelectedCard(null)
    setSelectedSacrifices([])

    // AI plays immediately
    setTimeout(() => {
      aiPlay()
    }, 500)
  }

  const handleReveal = () => {
    resolveRound()
  }

  const handleNextRound = () => {
    // Draw cards
    drawCard('player')
    drawCard('ai')

    // Check for winner
    if (playerDragons >= dragonsToWin || aiDragons >= dragonsToWin) {
      // Combat end handled in phase
      return
    }

    setupRound()
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white p-4">
      {/* Score */}
      <div className="flex justify-between items-center mb-4 bg-gray-800 p-4 rounded">
        <div>
          <span className="text-xl">Player Dragons: {playerDragons} / {dragonsToWin}</span>
        </div>
        <div>
          <span className="text-xl">AI Dragons: {aiDragons} / {dragonsToWin}</span>
        </div>
      </div>

      {/* Battle Area */}
      <div className="flex-1 flex flex-col justify-center items-center gap-8">
        {/* AI Card */}
        <div className="h-32">
          {aiPlayedCard && (
            <CardComponent card={aiPlayedCard} />
          )}
        </div>

        {/* VS */}
        <div className="text-4xl font-bold">VS</div>

        {/* Player Card */}
        <div className="h-32">
          {playerPlayedCard && (
            <CardComponent card={playerPlayedCard} />
          )}
        </div>
      </div>

      {/* Player Hand */}
      <div className="bg-gray-800 p-4 rounded">
        <div className="mb-2 text-sm text-gray-400">
          {phase === 'player_select' && selectedCard && (
            <span>Selected to play: {selectedCard.name}. Click other cards to sacrifice, then Play Card.</span>
          )}
          {phase === 'player_select' && !selectedCard && (
            <span>Select a card to play</span>
          )}
          {phase === 'reveal' && <span>Click Reveal to see results</span>}
          {phase === 'round_end' && <span>Click Next Round</span>}
        </div>

        <div className="flex gap-2 justify-center flex-wrap">
          {playerHand.map((card) => (
            <div key={card.id} onClick={() => {
              if (!selectedCard) {
                handleCardClick(card)
              } else {
                handleSacrificeClick(card)
              }
            }}>
              <CardComponent
                card={card}
                selected={selectedCard?.id === card.id || selectedSacrifices.find(c => c.id === card.id) !== undefined}
                disabled={phase !== 'player_select'}
              />
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2 justify-center">
          {phase === 'player_select' && selectedCard && (
            <button
              onClick={handlePlayCard}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded font-bold"
            >
              Play Card {selectedSacrifices.length > 0 && `(+${selectedSacrifices.length} sacrifices)`}
            </button>
          )}
          {phase === 'reveal' && (
            <button
              onClick={handleReveal}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded font-bold"
            >
              Reveal
            </button>
          )}
          {phase === 'round_end' && (
            <button
              onClick={handleNextRound}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded font-bold"
            >
              Next Round
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
```

**Step 4: Run test to verify it passes**

Run: `npm test CombatArena.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/CombatArena.*
git commit -m "feat: add CombatArena UI with card selection and sacrifice"
```

---

### Task 7: Wire Up MVP - Playable Combat

**Files:**
- Modify: `src/App.tsx`

**Step 1: Update App.tsx to use CombatArena**

Edit `src/App.tsx`:
```typescript
import { useEffect } from 'react'
import { CombatArena } from './components/CombatArena'
import { useCombatStore } from './stores/combatStore'
import { generateCardFromTemplate, CARD_TEMPLATES } from './data/cardTemplates'

function App() {
  const initCombat = useCombatStore(state => state.initCombat)
  const setupRound = useCombatStore(state => state.setupRound)

  useEffect(() => {
    // Generate test decks
    const playerDeck = Array.from({ length: 20 }, (_, i) => {
      const template = CARD_TEMPLATES[i % CARD_TEMPLATES.length]
      return generateCardFromTemplate(template, `player-${i}`)
    })

    const aiDeck = Array.from({ length: 20 }, (_, i) => {
      const template = CARD_TEMPLATES[i % CARD_TEMPLATES.length]
      return generateCardFromTemplate(template, `ai-${i}`)
    })

    initCombat(playerDeck, aiDeck)
    setupRound()
  }, [initCombat, setupRound])

  return (
    <div className="min-h-screen bg-gray-900">
      <CombatArena />
    </div>
  )
}

export default App
```

**Step 2: Test the game manually**

Run: `npm run dev`
Expected:
- Combat arena loads
- Player sees 5 cards in hand
- Can select a card to play
- Can select other cards as sacrifices
- Can play card and see AI response
- Reveal shows winner
- Dragons are awarded
- Can continue to next round

**Step 3: Verify all tests pass**

Run: `npm test`
Expected: All tests GREEN

**Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire up MVP combat - playable Blue Moon combat"
```

---

## PHASE 1 COMPLETE! ✅

At this point you have:
- ✅ Playable Blue Moon-style combat
- ✅ Card selection and sacrifice mechanics
- ✅ Dragon scoring system (2 or 3 dragons based on cards played)
- ✅ Round-by-round gameplay
- ✅ Basic AI opponent
- ✅ 20 card templates with rarities

**Next steps would be Phase 2 (Extraction & Risk system), but for MVP validation, test this first!**

---

## PHASE 2: EXTRACTION & RISK SYSTEM

### Task 8: Run State Management

**Files:**
- Create: `src/stores/runStore.ts`
- Create: `src/stores/runStore.test.ts`

**Step 1: Write failing test**

Create `src/stores/runStore.test.ts`:
```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { useRunStore } from './runStore'

describe('Run Store', () => {
  beforeEach(() => {
    useRunStore.getState().reset()
  })

  it('should initialize a scav run', () => {
    const store = useRunStore.getState()
    store.startRun('scav')

    expect(store.runType).toBe('scav')
    expect(store.currentDeck.length).toBeGreaterThan(0)
    expect(store.encountersCompleted).toBe(0)
  })

  it('should track fatigue after rest', () => {
    const store = useRunStore.getState()
    store.startRun('scav')

    const initialDeck = [...store.currentDeck]
    const fatigueCount = initialDeck.filter(c => c.fatigued).length

    store.restBetweenCombats()

    const newFatigueCount = store.currentDeck.filter(c => c.fatigued).length
    expect(newFatigueCount).toBe(fatigueCount + 2)
  })

  it('should allow extraction', () => {
    const store = useRunStore.getState()
    store.startRun('scav')
    store.lootMaterials = 100

    store.extract()

    expect(store.isRunActive).toBe(false)
    expect(store.totalMaterials).toBe(100)
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test runStore.test.ts`
Expected: FAIL

**Step 3: Implement run store**

Create `src/stores/runStore.ts`:
```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Card } from '../types/Card'
import { CARD_TEMPLATES, generateCardFromTemplate } from '../data/cardTemplates'

export type RunType = 'scav' | 'pmc'

export interface RunState {
  // Run state
  isRunActive: boolean
  runType: RunType | null
  currentDeck: Card[]
  encountersCompleted: number
  lootMaterials: number

  // Meta progression
  totalMaterials: number
  stash: Card[]

  // Actions
  startRun: (type: RunType, customDeck?: Card[]) => void
  restBetweenCombats: () => void
  extract: () => void
  death: () => void
  addLoot: (materials: number) => void
  reset: () => void
}

const generateScavDeck = (): Card[] => {
  // 12 random cards, common/rare only, power 2-5
  const scavTemplates = CARD_TEMPLATES.filter(
    t => (t.rarity === 'common' || t.rarity === 'rare') && t.power >= 2 && t.power <= 5
  )

  return Array.from({ length: 12 }, (_, i) => {
    const template = scavTemplates[Math.floor(Math.random() * scavTemplates.length)]
    return generateCardFromTemplate(template, `scav-${Date.now()}-${i}`)
  })
}

export const useRunStore = create<RunState>()(
  persist(
    (set, get) => ({
      isRunActive: false,
      runType: null,
      currentDeck: [],
      encountersCompleted: 0,
      lootMaterials: 0,

      totalMaterials: 0,
      stash: [],

      startRun: (type, customDeck) => {
        let deck: Card[]

        if (type === 'scav') {
          deck = generateScavDeck()
        } else {
          // PMC with custom deck from stash
          deck = customDeck || []
        }

        set({
          isRunActive: true,
          runType: type,
          currentDeck: deck,
          encountersCompleted: 0,
          lootMaterials: 0,
        })
      },

      restBetweenCombats: () => {
        const state = get()
        const newDeck = [...state.currentDeck]

        // Randomly fatigue 2 cards
        const nonFatiguedIndices = newDeck
          .map((card, index) => ({ card, index }))
          .filter(({ card }) => !card.fatigued)
          .map(({ index }) => index)

        const toFatigue = Math.min(2, nonFatiguedIndices.length)

        for (let i = 0; i < toFatigue; i++) {
          const randomIndex = Math.floor(Math.random() * nonFatiguedIndices.length)
          const cardIndex = nonFatiguedIndices.splice(randomIndex, 1)[0]
          newDeck[cardIndex].fatigued = true
        }

        set({ currentDeck: newDeck })
      },

      extract: () => {
        const state = get()
        const newStash = [...state.stash]

        // If scav run, add the deck to stash
        if (state.runType === 'scav') {
          newStash.push(...state.currentDeck)
        }

        set({
          isRunActive: false,
          totalMaterials: state.totalMaterials + state.lootMaterials,
          stash: newStash,
          currentDeck: [],
          lootMaterials: 0,
        })
      },

      death: () => {
        // Lose everything - deck and loot
        set({
          isRunActive: false,
          currentDeck: [],
          lootMaterials: 0,
        })
      },

      addLoot: (materials) => {
        set((state) => ({
          lootMaterials: state.lootMaterials + materials,
        }))
      },

      reset: () => {
        set({
          isRunActive: false,
          runType: null,
          currentDeck: [],
          encountersCompleted: 0,
          lootMaterials: 0,
          totalMaterials: 0,
          stash: [],
        })
      },
    }),
    {
      name: 'run-storage',
      partialize: (state) => ({
        totalMaterials: state.totalMaterials,
        stash: state.stash,
      }),
    }
  )
)
```

**Step 4: Install zustand persist middleware**

```bash
npm install zustand
```

**Step 5: Run test to verify it passes**

Run: `npm test runStore.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add src/stores/runStore.*
git commit -m "feat: add run state with fatigue, extraction, and meta progression"
```

---

### Task 9: Main Menu & Run Selection

**Files:**
- Create: `src/components/MainMenu.tsx`
- Create: `src/components/MainMenu.test.tsx`

**Step 1: Write test**

Create `src/components/MainMenu.test.tsx`:
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MainMenu } from './MainMenu'

describe('MainMenu', () => {
  it('should show scav and pmc run options', () => {
    render(<MainMenu onStartRun={() => {}} />)

    expect(screen.getByText(/Scav Run/i)).toBeInTheDocument()
    expect(screen.getByText(/PMC Run/i)).toBeInTheDocument()
  })

  it('should call onStartRun with scav when scav button clicked', () => {
    let runType = ''
    render(<MainMenu onStartRun={(type) => { runType = type }} />)

    fireEvent.click(screen.getByText(/Start Scav Run/i))
    expect(runType).toBe('scav')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test MainMenu.test.tsx`
Expected: FAIL

**Step 3: Implement MainMenu**

Create `src/components/MainMenu.tsx`:
```typescript
import { useRunStore } from '../stores/runStore'
import { RunType } from '../stores/runStore'

interface MainMenuProps {
  onStartRun: (type: RunType) => void
}

export function MainMenu({ onStartRun }: MainMenuProps) {
  const { totalMaterials, stash } = useRunStore()

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="max-w-2xl w-full p-8">
        <h1 className="text-5xl font-bold text-center mb-8">Dwarf Extraction</h1>

        {/* Stats */}
        <div className="bg-gray-800 rounded p-6 mb-8">
          <h2 className="text-2xl mb-4">Your Fortress</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400">Materials</p>
              <p className="text-3xl font-bold">{totalMaterials}</p>
            </div>
            <div>
              <p className="text-gray-400">Stash</p>
              <p className="text-3xl font-bold">{stash.length} cards</p>
            </div>
          </div>
        </div>

        {/* Run Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Scav Run */}
          <div className="bg-gray-800 rounded p-6">
            <h3 className="text-xl font-bold mb-2 text-green-400">Scav Run</h3>
            <p className="text-sm text-gray-400 mb-4">
              Random deck (12 cards). No risk - keep everything if you extract. Lower loot.
            </p>
            <button
              onClick={() => onStartRun('scav')}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-bold"
            >
              Start Scav Run
            </button>
          </div>

          {/* PMC Run */}
          <div className="bg-gray-800 rounded p-6">
            <h3 className="text-xl font-bold mb-2 text-red-400">PMC Run</h3>
            <p className="text-sm text-gray-400 mb-4">
              Use your stash cards (20 cards). Lose deck if you die. Higher loot.
            </p>
            <button
              onClick={() => onStartRun('pmc')}
              disabled={stash.length < 20}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {stash.length >= 20 ? 'Start PMC Run' : `Need ${20 - stash.length} more cards`}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

**Step 4: Run test**

Run: `npm test MainMenu.test.tsx`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/MainMenu.*
git commit -m "feat: add main menu with scav/pmc run selection"
```

---

### Task 10: Integration - Full Game Loop

**Files:**
- Modify: `src/App.tsx`

**Step 1: Update App.tsx to integrate menu and combat**

Edit `src/App.tsx`:
```typescript
import { useState, useEffect } from 'react'
import { MainMenu } from './components/MainMenu'
import { CombatArena } from './components/CombatArena'
import { useRunStore } from './stores/runStore'
import { useCombatStore } from './stores/combatStore'
import { RunType } from './stores/runStore'

type GameScreen = 'menu' | 'combat' | 'extraction'

function App() {
  const [screen, setScreen] = useState<GameScreen>('menu')
  const { startRun, currentDeck, isRunActive } = useRunStore()
  const { initCombat, setupRound, playerDragons, aiDragons, dragonsToWin } = useCombatStore()

  const handleStartRun = (type: RunType) => {
    startRun(type)
    setScreen('combat')
  }

  useEffect(() => {
    if (screen === 'combat' && currentDeck.length > 0) {
      // Generate AI deck
      const aiDeck = [...currentDeck].sort(() => Math.random() - 0.5)

      initCombat(currentDeck, aiDeck)
      setupRound()
    }
  }, [screen, currentDeck, initCombat, setupRound])

  // Check for combat end
  useEffect(() => {
    if (screen === 'combat') {
      if (playerDragons >= dragonsToWin) {
        // Player won combat
        setScreen('extraction')
      } else if (aiDragons >= dragonsToWin) {
        // Player lost - death
        useRunStore.getState().death()
        setScreen('menu')
      }
    }
  }, [playerDragons, aiDragons, dragonsToWin, screen])

  if (screen === 'menu') {
    return <MainMenu onStartRun={handleStartRun} />
  }

  if (screen === 'combat') {
    return <CombatArena />
  }

  if (screen === 'extraction') {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="max-w-md p-8 bg-gray-800 rounded">
          <h2 className="text-3xl font-bold mb-4 text-green-400">Victory!</h2>
          <p className="mb-6">You won the combat. Extract now or continue?</p>

          <div className="flex gap-4">
            <button
              onClick={() => {
                useRunStore.getState().extract()
                setScreen('menu')
              }}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-bold"
            >
              Extract
            </button>
            <button
              onClick={() => {
                // Continue to next combat (Phase 3 feature)
                alert('Next encounter coming in Phase 3!')
              }}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded font-bold"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default App
```

**Step 2: Test full game loop manually**

Run: `npm run dev`

Test:
1. Start scav run from menu
2. Play combat, win
3. Extract and verify materials saved
4. Start another scav run
5. Lose combat and verify deck lost
6. Check stash accumulation after scav wins

Expected: Full loop works, persistence via localStorage

**Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: integrate full game loop - menu, combat, extraction, death"
```

---

## PHASE 2 COMPLETE! ✅

You now have:
- ✅ Scav/PMC run types
- ✅ Fatigue system (coming in next refinement)
- ✅ Extraction vs death
- ✅ Meta progression (materials, stash)
- ✅ Full game loop

**Remaining for Phase 2: Add fatigue choice UI between combats (quick addition)**

---

## PHASE 3: PROCEDURAL ZONES & OBJECTIVES

This would add:
- Zone generation with multiple encounters
- Encounter choice (Easy/Medium/Hard)
- Objective completion
- Run modifiers (Day/Night, Rarity)

## PHASE 4: POLISH & META

This would add:
- Consumables
- Crafting system
- Quests
- Better AI

## PHASE 5: ADVANCED GENERATION

This would add:
- True procedural card generation
- Component system
- AI balancing

---

# SUMMARY

This plan gives you a **fully playable extraction card game** after Phase 1 + 2.

**Core implemented:**
- Blue Moon combat with dragon scoring
- Card sacrifice mechanics
- Tarkov-style risk (scav/pmc)
- Meta progression (stash, materials)
- Persistence

**Tech choices:**
- React + TypeScript (type safety)
- Zustand (simple state)
- Vitest (fast tests)
- Tailwind (rapid styling)

**Follow:** DRY, YAGNI, TDD principles throughout.

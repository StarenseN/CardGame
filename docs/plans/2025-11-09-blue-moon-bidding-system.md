# Blue Moon Bidding System - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the combat from "random card throw" into authentic Blue Moon bidding with progressive raises, fold mechanics, and strategic tension.

**Architecture:** Refactor combat store to support turn-based bidding within rounds. Add bid/raise/fold actions. Implement visible bid history. Create tension through revealed information and decision points.

**Tech Stack:** Existing React + TypeScript + Zustand stack, refactor combat phases for bidding turns

---

## Current State Analysis

**What works:**
- Basic round structure (setup → play → resolve)
- Dragon scoring system (2-3 dragons)
- Card sacrifice mechanics
- Hand management

**What's broken (not Blue Moon):**
- Simultaneous blind play (no bidding!)
- No fold option (can't cut losses)
- No progressive raises (all-in every time)
- No visible tension (can't see opponent's commitment)
- No strategic hand management across rounds

**Goal:** Transform into real Blue Moon where each round is a mini-poker game.

---

## PHASE 1: Bidding State Machine

### Task 1: Refactor Combat Phases for Bidding

**Files:**
- Modify: `src/stores/combatStore.ts`
- Test: `src/stores/combatStore.test.ts`

**Concept:**
Current: `player_select → ai_select → reveal`
New: `bidding_p1 → bidding_p2 → bidding_p1 → ... → reveal`

Rounds become turn-based bidding where players alternate adding cards until someone folds or both pass.

**Step 1: Write failing test for bidding turns**

Add to `src/stores/combatStore.test.ts`:
```typescript
describe('Bidding System', () => {
  it('should alternate turns during bidding', () => {
    const playerDeck = Array.from({ length: 10 }, (_, i) =>
      createCard({ id: `p${i}`, type: 'unit', power: 3, rarity: 'common' })
    )
    const aiDeck = Array.from({ length: 10 }, (_, i) =>
      createCard({ id: `ai${i}`, type: 'unit', power: 3, rarity: 'common' })
    )

    const store = useCombatStore.getState()
    store.initCombat(playerDeck, aiDeck)
    store.setupRound()

    // Player opens bid
    const card = store.playerHand[0]
    store.openBid(card)

    expect(store.currentBid.player).toEqual([card])
    expect(store.currentBid.ai).toEqual([])
    expect(store.phase).toBe('bidding_ai')
    expect(store.currentTurn).toBe('ai')
  })

  it('should allow fold to end bidding', () => {
    const store = useCombatStore.getState()
    // Setup a bid
    store.openBid(store.playerHand[0])

    // AI folds
    store.fold('ai')

    expect(store.phase).toBe('round_end')
    expect(store.playerDragons).toBe(1) // Player wins by fold
  })

  it('should allow raise to continue bidding', () => {
    const store = useCombatStore.getState()
    store.openBid(store.playerHand[0])

    // AI raises
    const aiCard = store.aiHand[0]
    store.raise('ai', [aiCard])

    expect(store.currentBid.ai).toEqual([aiCard])
    expect(store.phase).toBe('bidding_player')
    expect(store.currentTurn).toBe('player')
  })

  it('should resolve when both players pass', () => {
    const store = useCombatStore.getState()
    store.openBid(store.playerHand[0])
    store.raise('ai', [store.aiHand[0]])

    // Both pass
    store.pass('player')
    store.pass('ai')

    expect(store.phase).toBe('reveal')
  })
})
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --run combatStore.test.ts`
Expected: FAIL - methods don't exist

**Step 3: Add bidding state to CombatState**

In `src/stores/combatStore.ts`, update the interface:
```typescript
export type CombatPhase =
  | 'setup'
  | 'bidding_player'
  | 'bidding_ai'
  | 'reveal'
  | 'round_end'
  | 'combat_end'

export type PlayerSide = 'player' | 'ai'

export interface BidState {
  player: Card[]
  ai: Card[]
  playerPassed: boolean
  aiPassed: boolean
}

export interface CombatState {
  // ... existing fields ...

  // Bidding state
  currentBid: BidState
  currentTurn: PlayerSide
  bidHistory: Array<{ player: PlayerSide; cards: Card[]; action: 'open' | 'raise' | 'pass' | 'fold' }>

  // Actions
  openBid: (card: Card) => void
  raise: (player: PlayerSide, cards: Card[]) => void
  pass: (player: PlayerSide) => void
  fold: (player: PlayerSide) => void
  // ... existing actions ...
}
```

**Step 4: Implement bidding actions**

In `src/stores/combatStore.ts`:
```typescript
export const useCombatStore = create<CombatState>((set, get) => ({
  // ... existing state ...

  currentBid: { player: [], ai: [], playerPassed: false, aiPassed: false },
  currentTurn: 'player',
  bidHistory: [],

  setupRound: () => {
    const state = get()
    // ... existing draw logic ...

    set({
      // ... existing sets ...
      phase: 'bidding_player',
      currentTurn: 'player',
      currentBid: { player: [], ai: [], playerPassed: false, aiPassed: false },
      bidHistory: [],
    })
  },

  openBid: (card: Card) => {
    const state = get()
    const newHand = state.playerHand.filter(c => c.id !== card.id)

    set({
      currentBid: {
        player: [card],
        ai: [],
        playerPassed: false,
        aiPassed: false,
      },
      playerHand: newHand,
      phase: 'bidding_ai',
      currentTurn: 'ai',
      bidHistory: [{ player: 'player', cards: [card], action: 'open' }],
    })
  },

  raise: (player: PlayerSide, cards: Card[]) => {
    const state = get()
    const newBid = { ...state.currentBid }

    if (player === 'player') {
      newBid.player = [...newBid.player, ...cards]
      newBid.playerPassed = false
      const newHand = state.playerHand.filter(c => !cards.find(card => card.id === c.id))
      set({
        currentBid: newBid,
        playerHand: newHand,
        phase: 'bidding_ai',
        currentTurn: 'ai',
        bidHistory: [...state.bidHistory, { player, cards, action: 'raise' }],
      })
    } else {
      newBid.ai = [...newBid.ai, ...cards]
      newBid.aiPassed = false
      const newHand = state.aiHand.filter(c => !cards.find(card => card.id === c.id))
      set({
        currentBid: newBid,
        aiHand: newHand,
        phase: 'bidding_player',
        currentTurn: 'player',
        bidHistory: [...state.bidHistory, { player, cards, action: 'raise' }],
      })
    }
  },

  pass: (player: PlayerSide) => {
    const state = get()
    const newBid = { ...state.currentBid }

    if (player === 'player') {
      newBid.playerPassed = true
    } else {
      newBid.aiPassed = true
    }

    // If both passed, go to reveal
    if (newBid.playerPassed && newBid.aiPassed) {
      set({
        currentBid: newBid,
        phase: 'reveal',
        bidHistory: [...state.bidHistory, { player, cards: [], action: 'pass' }],
      })
    } else {
      // Switch turns
      const nextPhase = player === 'player' ? 'bidding_ai' : 'bidding_player'
      const nextTurn = player === 'player' ? 'ai' : 'player'
      set({
        currentBid: newBid,
        phase: nextPhase,
        currentTurn: nextTurn,
        bidHistory: [...state.bidHistory, { player, cards: [], action: 'pass' }],
      })
    }
  },

  fold: (player: PlayerSide) => {
    const state = get()
    const winner = player === 'player' ? 'ai' : 'player'

    get().awardDragon(winner)

    // Move all bid cards to discard
    const playerDiscard = [...state.playerDiscard, ...state.currentBid.player]
    const aiDiscard = [...state.aiDiscard, ...state.currentBid.ai]

    set({
      playerDiscard,
      aiDiscard,
      phase: 'round_end',
      bidHistory: [...state.bidHistory, { player, cards: [], action: 'fold' }],
    })
  },

  resolveRound: () => {
    const state = get()

    // Calculate total power from all bid cards
    const playerPower = state.currentBid.player.reduce(
      (sum, c) => sum + c.getEffectivePower(), 0
    )
    const aiPower = state.currentBid.ai.reduce(
      (sum, c) => sum + c.getEffectivePower(), 0
    )

    // Determine winner
    let winner: 'player' | 'ai' | 'tie' = 'tie'
    if (playerPower > aiPower) winner = 'player'
    else if (aiPower > playerPower) winner = 'ai'

    if (winner !== 'tie') {
      get().awardDragon(winner)
    }

    // Move cards to discard
    const newPlayerDiscard = [...state.playerDiscard, ...state.currentBid.player]
    const newAiDiscard = [...state.aiDiscard, ...state.currentBid.ai]

    const totalPlayed = state.totalCardsPlayed +
      state.currentBid.player.length + state.currentBid.ai.length

    const dragonsToWin = totalPlayed >= 6 ? 2 : 3

    set({
      playerDiscard: newPlayerDiscard,
      aiDiscard: newAiDiscard,
      totalCardsPlayed: totalPlayed,
      dragonsToWin,
      phase: 'round_end',
    })
  },

  // ... rest of existing methods ...
}))
```

**Step 5: Run test to verify it passes**

Run: `npm test -- --run combatStore.test.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add src/stores/combatStore.ts src/stores/combatStore.test.ts
git commit -m "feat: implement Blue Moon bidding state machine with raise/fold/pass"
```

---

### Task 2: Update CombatArena UI for Bidding

**Files:**
- Modify: `src/components/CombatArena.tsx`

**Step 1: Remove old UI, add bidding interface**

Replace the current card selection logic with bidding actions:

```typescript
export function CombatArena() {
  const {
    playerHand,
    playerDragons,
    aiDragons,
    dragonsToWin,
    phase,
    currentBid,
    currentTurn,
    bidHistory,
    openBid,
    raise,
    pass,
    fold,
    resolveRound,
    setupRound,
    drawCard,
  } = useCombatStore()

  const [selectedCards, setSelectedCards] = useState<Card[]>([])

  const handleCardClick = (card: Card) => {
    if (phase !== 'bidding_player' || currentTurn !== 'player') return

    const isSelected = selectedCards.find(c => c.id === card.id)
    if (isSelected) {
      setSelectedCards(selectedCards.filter(c => c.id !== card.id))
    } else {
      setSelectedCards([...selectedCards, card])
    }
  }

  const handleOpenBid = () => {
    if (selectedCards.length !== 1) return
    openBid(selectedCards[0])
    setSelectedCards([])
  }

  const handleRaise = () => {
    if (selectedCards.length === 0) return
    raise('player', selectedCards)
    setSelectedCards([])
  }

  const handlePass = () => {
    pass('player')
  }

  const handleFold = () => {
    fold('player')
  }

  // AI logic
  useEffect(() => {
    if (phase === 'bidding_ai' && currentTurn === 'ai') {
      setTimeout(() => {
        // Simple AI: 50% raise with 1 card, 30% pass, 20% fold
        const action = Math.random()

        if (action < 0.5 && aiHand.length > 0) {
          // Raise with one card
          const card = aiHand[Math.floor(Math.random() * aiHand.length)]
          raise('ai', [card])
        } else if (action < 0.8) {
          // Pass
          pass('ai')
        } else {
          // Fold
          fold('ai')
        }
      }, 1000)
    }
  }, [phase, currentTurn])

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

      {/* Current Bids */}
      <div className="flex-1 flex flex-col justify-center items-center gap-8">
        {/* AI Bid */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm text-gray-400">AI Bid ({currentBid.ai.length} cards)</span>
          <div className="flex gap-2">
            {currentBid.ai.map((card) => (
              <CardComponent key={card.id} card={card} />
            ))}
          </div>
          <span className="text-xs text-gray-500">
            Total Power: {currentBid.ai.reduce((sum, c) => sum + c.getEffectivePower(), 0)}
          </span>
        </div>

        {/* VS */}
        <div className="text-4xl font-bold">VS</div>

        {/* Player Bid */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm text-gray-400">Your Bid ({currentBid.player.length} cards)</span>
          <div className="flex gap-2">
            {currentBid.player.map((card) => (
              <CardComponent key={card.id} card={card} />
            ))}
          </div>
          <span className="text-xs text-gray-500">
            Total Power: {currentBid.player.reduce((sum, c) => sum + c.getEffectivePower(), 0)}
          </span>
        </div>
      </div>

      {/* Bid History */}
      <div className="mb-4 h-20 overflow-y-auto bg-gray-800 p-2 rounded text-xs">
        {bidHistory.map((entry, i) => (
          <div key={i} className="text-gray-400">
            {entry.player.toUpperCase()}: {entry.action.toUpperCase()}
            {entry.cards.length > 0 && ` (${entry.cards.length} cards)`}
          </div>
        ))}
      </div>

      {/* Player Hand */}
      <div className="bg-gray-800 p-4 rounded">
        <div className="mb-2 text-sm text-gray-400">
          {phase === 'bidding_player' && currentTurn === 'player' && (
            <>
              {currentBid.player.length === 0 ? (
                <span>Select 1 card to open the bid</span>
              ) : (
                <span>Select cards to raise, or Pass/Fold</span>
              )}
            </>
          )}
          {phase === 'bidding_ai' && <span>AI is thinking...</span>}
          {phase === 'reveal' && <span>Click Reveal to see results</span>}
          {phase === 'round_end' && <span>Click Next Round</span>}
        </div>

        <div className="flex gap-2 justify-center flex-wrap mb-4">
          {playerHand.map((card) => (
            <div key={card.id} onClick={() => handleCardClick(card)}>
              <CardComponent
                card={card}
                selected={selectedCards.find(c => c.id === card.id) !== undefined}
                disabled={phase !== 'bidding_player' || currentTurn !== 'player'}
              />
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-center">
          {phase === 'bidding_player' && currentTurn === 'player' && (
            <>
              {currentBid.player.length === 0 ? (
                <button
                  onClick={handleOpenBid}
                  disabled={selectedCards.length !== 1}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Open Bid (1 card)
                </button>
              ) : (
                <>
                  <button
                    onClick={handleRaise}
                    disabled={selectedCards.length === 0}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded font-bold disabled:opacity-50"
                  >
                    Raise (+{selectedCards.length})
                  </button>
                  <button
                    onClick={handlePass}
                    className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 rounded font-bold"
                  >
                    Pass
                  </button>
                  <button
                    onClick={handleFold}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded font-bold"
                  >
                    Fold (Lose Round)
                  </button>
                </>
              )}
            </>
          )}
          {phase === 'reveal' && (
            <button
              onClick={resolveRound}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded font-bold"
            >
              Reveal
            </button>
          )}
          {phase === 'round_end' && (
            <button
              onClick={() => {
                drawCard('player')
                drawCard('ai')
                if (playerDragons >= dragonsToWin || aiDragons >= dragonsToWin) {
                  return
                }
                setupRound()
              }}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded font-bold"
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

**Step 2: Test manually**

Run: `npm run dev`

Test:
1. Select 1 card → Click "Open Bid"
2. AI should respond (raise/pass/fold)
3. You can raise (select cards), pass, or fold
4. Both pass → reveal → see winner
5. Next round

Expected: Full bidding flow works

**Step 3: Commit**

```bash
git add src/components/CombatArena.tsx
git commit -m "feat: add Blue Moon bidding UI with raise/pass/fold actions"
```

---

## PHASE 2: Enhanced AI & Balance

### Task 3: Smart AI Bidding Logic

**Files:**
- Create: `src/ai/biddingAI.ts`
- Test: `src/ai/biddingAI.test.ts`

**Step 1: Write AI decision tests**

```typescript
import { describe, it, expect } from 'vitest'
import { decideBiddingAction } from './biddingAI'
import { createCard } from '../types/Card'

describe('Bidding AI', () => {
  it('should open with strongest card', () => {
    const hand = [
      createCard({ id: '1', type: 'unit', power: 2, rarity: 'common' }),
      createCard({ id: '2', type: 'unit', power: 5, rarity: 'rare' }),
      createCard({ id: '3', type: 'unit', power: 3, rarity: 'common' }),
    ]

    const action = decideBiddingAction({
      hand,
      myBid: [],
      opponentBid: [],
      myDragons: 0,
      opponentDragons: 0,
      dragonsToWin: 3,
    })

    expect(action.type).toBe('open')
    expect(action.cards[0].id).toBe('2') // Strongest card
  })

  it('should fold when behind and weak hand', () => {
    const hand = [
      createCard({ id: '1', type: 'unit', power: 2, rarity: 'common' }),
    ]

    const opponentBid = [
      createCard({ id: 'o1', type: 'unit', power: 8, rarity: 'epic' }),
    ]

    const action = decideBiddingAction({
      hand,
      myBid: [],
      opponentBid,
      myDragons: 0,
      opponentDragons: 2,
      dragonsToWin: 3,
    })

    expect(action.type).toBe('fold')
  })

  it('should raise when can win', () => {
    const hand = [
      createCard({ id: '1', type: 'unit', power: 6, rarity: 'rare' }),
    ]

    const myBid = [
      createCard({ id: 'm1', type: 'unit', power: 4, rarity: 'common' }),
    ]

    const opponentBid = [
      createCard({ id: 'o1', type: 'unit', power: 5, rarity: 'common' }),
    ]

    const action = decideBiddingAction({
      hand,
      myBid,
      opponentBid,
      myDragons: 1,
      opponentDragons: 1,
      dragonsToWin: 3,
    })

    expect(action.type).toBe('raise')
    expect(action.cards.length).toBeGreaterThan(0)
  })
})
```

**Step 2: Implement AI logic**

```typescript
import { Card } from '../types/Card'

interface BiddingContext {
  hand: Card[]
  myBid: Card[]
  opponentBid: Card[]
  myDragons: number
  opponentDragons: number
  dragonsToWin: number
}

interface BiddingAction {
  type: 'open' | 'raise' | 'pass' | 'fold'
  cards: Card[]
}

export function decideBiddingAction(context: BiddingContext): BiddingAction {
  const {
    hand,
    myBid,
    opponentBid,
    myDragons,
    opponentDragons,
    dragonsToWin,
  } = context

  // Calculate current power
  const myPower = myBid.reduce((sum, c) => sum + c.getEffectivePower(), 0)
  const opponentPower = opponentBid.reduce((sum, c) => sum + c.getEffectivePower(), 0)

  // Opening bid - play strongest card
  if (myBid.length === 0 && opponentBid.length === 0) {
    const strongest = [...hand].sort((a, b) =>
      b.getEffectivePower() - a.getEffectivePower()
    )[0]
    return { type: 'open', cards: [strongest] }
  }

  // Calculate if we're desperate (opponent 1 dragon away from winning)
  const desperate = opponentDragons >= dragonsToWin - 1

  // Calculate hand strength
  const handPower = hand.reduce((sum, c) => sum + c.getEffectivePower(), 0)
  const averageCardPower = handPower / hand.length

  // Decision tree

  // If we're losing badly and hand is weak, fold
  if (myPower < opponentPower - 5 && averageCardPower < 4) {
    return { type: 'fold', cards: [] }
  }

  // If we're winning, try to pass
  if (myPower > opponentPower) {
    return { type: 'pass', cards: [] }
  }

  // If opponent passed, we can pass too (go to reveal)
  if (opponentBid.length > 0 && myBid.length > 0) {
    // Estimate if we need to raise
    if (myPower >= opponentPower - 2) {
      return { type: 'pass', cards: [] }
    }
  }

  // Try to raise with best cards
  const cardsNeeded = Math.ceil((opponentPower - myPower) / averageCardPower) + 1
  const cardsToPlay = Math.min(cardsNeeded, hand.length, desperate ? hand.length : 2)

  if (cardsToPlay > 0) {
    const bestCards = [...hand]
      .sort((a, b) => b.getEffectivePower() - a.getEffectivePower())
      .slice(0, cardsToPlay)

    return { type: 'raise', cards: bestCards }
  }

  // Default: fold if nothing else works
  return { type: 'fold', cards: [] }
}
```

**Step 3: Integrate AI into CombatArena**

Update the AI useEffect in `CombatArena.tsx`:
```typescript
import { decideBiddingAction } from '../ai/biddingAI'

// Inside CombatArena component:
useEffect(() => {
  if (phase.startsWith('bidding_ai') && currentTurn === 'ai') {
    setTimeout(() => {
      const action = decideBiddingAction({
        hand: aiHand,
        myBid: currentBid.ai,
        opponentBid: currentBid.player,
        myDragons: aiDragons,
        opponentDragons: playerDragons,
        dragonsToWin,
      })

      switch (action.type) {
        case 'open':
          openBid(action.cards[0])
          break
        case 'raise':
          raise('ai', action.cards)
          break
        case 'pass':
          pass('ai')
          break
        case 'fold':
          fold('ai')
          break
      }
    }, 1200) // Slightly longer delay for "thinking"
  }
}, [phase, currentTurn])
```

**Step 4: Test and commit**

Run: `npm test -- --run biddingAI.test.ts`
Expected: PASS

```bash
git add src/ai/
git add src/components/CombatArena.tsx
git commit -m "feat: add strategic AI bidding logic with risk assessment"
```

---

## Summary

This plan transforms the combat from "throw random card" into authentic Blue Moon:

**What you get:**
✅ Progressive bidding (raise, raise, raise...)
✅ Fold option (cut losses strategically)
✅ Visible tension (see opponent's commitment)
✅ Strategic decisions (invest more or save for next round?)
✅ Smart AI (calculates risk, knows when to fold)

**Gameplay feel:**
- "Do I have enough to beat their bid?"
- "Should I fold now or invest another card?"
- "They're raising again... are they bluffing?"
- "I need to save cards for the next dragon"

**Next steps after this:**
- Phase 2: Extraction & Meta Progression
- Polish: Better AI personalities, card effects
- Juice: Animations, sound effects

This is the foundation for the real game loop!

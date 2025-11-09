import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Card } from '../types/Card'
import { useCollectionStore } from './collectionStore'
import { getCardById, generateCardFromTemplate } from '../data/cardTemplates'

export type RunType = 'scav' | 'pmc'

const generateScavDeck = (): Card[] => {
  const collection = useCollectionStore.getState()
  const unlockedTemplates = collection.unlockedCards
    .map(id => getCardById(id))
    .filter(t => t !== undefined)

  if (unlockedTemplates.length === 0) {
    throw new Error('No unlocked cards available for Scav run')
  }

  // Pick 12 random cards from unlocked pool
  const deck: Card[] = []
  for (let i = 0; i < 12; i++) {
    const template = unlockedTemplates[Math.floor(Math.random() * unlockedTemplates.length)]
    const card = generateCardFromTemplate(template!, `scav-${Date.now()}-${i}-${Math.random()}`)
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
  // Run status
  isRunActive: boolean
  runType: RunType | null

  // Deck tracking
  currentDeck: Card[]
  deckInstanceIds: string[] // For PMC, track which instances are in use

  // Progress tracking
  encountersCompleted: number
  lootMaterials: number // Fragments collected during run

  // Actions
  startRun: (type: RunType, instanceIds?: string[]) => void
  extract: () => void // Success - keep loot and (for scav) deck
  death: () => void // Failure - lose everything
  addLoot: (amount: number) => void
  completeEncounter: () => void
  reset: () => void
}

export const useRunStore = create<RunState>()(
  persist(
    (set, get) => ({
      isRunActive: false,
      runType: null,
      currentDeck: [],
      deckInstanceIds: [],
      encountersCompleted: 0,
      lootMaterials: 0,

      startRun: (type, instanceIds) => {
        let deck: Card[]
        let deckInsts: string[] = []

        if (type === 'scav') {
          deck = generateScavDeck()
        } else {
          // PMC
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
            // Use templateId from card for reliable tracking
            if (!card.templateId) {
              console.error(`Card ${card.id} (${card.name}) missing templateId, skipping`)
              return
            }
            collection.addCardInstance(card.templateId, card.id)
          })
        }
        // PMC: cards are already in collection, no need to add

        set({
          isRunActive: false,
          runType: null,
          currentDeck: [],
          deckInstanceIds: [],
          lootMaterials: 0,
          encountersCompleted: 0,
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
        // Scav: lose deck (don't add to collection)
        // No fragments awarded

        set({
          isRunActive: false,
          runType: null,
          currentDeck: [],
          deckInstanceIds: [],
          lootMaterials: 0,
          encountersCompleted: 0,
        })
      },

      addLoot: (amount: number) => {
        set(state => ({
          lootMaterials: state.lootMaterials + amount,
        }))
      },

      completeEncounter: () => {
        set(state => ({
          encountersCompleted: state.encountersCompleted + 1,
        }))
      },

      reset: () => {
        set({
          isRunActive: false,
          runType: null,
          currentDeck: [],
          deckInstanceIds: [],
          encountersCompleted: 0,
          lootMaterials: 0,
        })
      },
    }),
    {
      name: 'run-storage',
    }
  )
)

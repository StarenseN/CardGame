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

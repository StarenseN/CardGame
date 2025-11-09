import { describe, it, expect, beforeEach } from 'vitest'
import { useRunStore } from './runStore'
import { useCollectionStore } from './collectionStore'
import { getStarterCards } from '../data/cardTemplates'

describe('Run Store - Scav/PMC Logic', () => {
  beforeEach(() => {
    useCollectionStore.getState().reset()
    useRunStore.getState().reset()
  })

  describe('Scav Runs', () => {
    it('should generate scav deck from unlocked cards only', () => {
      useCollectionStore.getState().reset() // Start with 15 starters

      const run = useRunStore.getState()
      run.startRun('scav')

      // Refetch state after mutation
      const updatedRun = useRunStore.getState()

      // All cards should be from starter pool
      const starterCards = getStarterCards()
      const allFromStarters = updatedRun.currentDeck.every(card =>
        starterCards.find(s => s.name === card.name)
      )

      expect(allFromStarters).toBe(true)
      expect(updatedRun.currentDeck.length).toBe(12)
      expect(updatedRun.runType).toBe('scav')
      expect(updatedRun.isRunActive).toBe(true)
    })

    it('should generate different decks for different scav runs', () => {
      useRunStore.getState().startRun('scav')
      const deck1 = useRunStore.getState().currentDeck.map(c => c.id)

      useRunStore.getState().reset()

      useRunStore.getState().startRun('scav')
      const deck2 = useRunStore.getState().currentDeck.map(c => c.id)

      // Should have different instance IDs
      expect(deck1).not.toEqual(deck2)
    })

    it('should not track deck instance IDs for scav runs', () => {
      useRunStore.getState().startRun('scav')

      expect(useRunStore.getState().deckInstanceIds.length).toBe(0)
    })
  })

  describe('PMC Runs', () => {
    it('should allow PMC run with custom deck from owned instances', () => {
      // Add some owned instances
      for (let i = 0; i < 20; i++) {
        useCollectionStore.getState().addCardInstance('warrior-basic-1', `instance-${i}`)
      }

      const ownedCards = useCollectionStore.getState().ownedInstances.slice(0, 20)
      useRunStore.getState().startRun('pmc', ownedCards.map(inst => inst.instanceId))

      const run = useRunStore.getState()
      expect(run.currentDeck.length).toBe(20)
      expect(run.runType).toBe('pmc')
      expect(run.isRunActive).toBe(true)
      expect(run.deckInstanceIds.length).toBe(20)
    })

    it('should throw error if PMC run started without instance IDs', () => {
      const run = useRunStore.getState()

      expect(() => run.startRun('pmc')).toThrow('PMC run requires instance IDs')
    })

    it('should throw error if instance not found in collection', () => {
      const run = useRunStore.getState()

      expect(() => run.startRun('pmc', ['non-existent-instance'])).toThrow('Instance non-existent-instance not found')
    })

    it('should use exact instances provided for PMC deck', () => {
      // Add mixed instances
      useCollectionStore.getState().addCardInstance('warrior-basic-1', 'inst-1')
      useCollectionStore.getState().addCardInstance('warrior-basic-2', 'inst-2')
      useCollectionStore.getState().addCardInstance('mage-basic-1', 'inst-3')

      useRunStore.getState().startRun('pmc', ['inst-1', 'inst-2', 'inst-3'])

      const run = useRunStore.getState()
      expect(run.currentDeck.length).toBe(3)
      expect(run.currentDeck[0].id).toBe('inst-1')
      expect(run.currentDeck[1].id).toBe('inst-2')
      expect(run.currentDeck[2].id).toBe('inst-3')
    })
  })

  describe('Extract (Success)', () => {
    it('should add fragments to collection on extract', () => {
      const fragmentsBefore = useCollectionStore.getState().fragments

      useRunStore.getState().startRun('scav')
      useRunStore.getState().addLoot(100) // Add some fragments
      useRunStore.getState().extract()

      expect(useCollectionStore.getState().fragments).toBe(fragmentsBefore + 100)
    })

    it('should add scav deck cards to collection on extract', () => {
      const instancesBefore = useCollectionStore.getState().ownedInstances.length

      useRunStore.getState().startRun('scav')
      const deckSize = useRunStore.getState().currentDeck.length
      useRunStore.getState().extract()

      expect(useCollectionStore.getState().ownedInstances.length).toBe(instancesBefore + deckSize)
    })

    it('should not add PMC deck cards to collection on extract (already owned)', () => {
      // Add 20 instances
      for (let i = 0; i < 20; i++) {
        useCollectionStore.getState().addCardInstance('warrior-basic-1', `inst-${i}`)
      }

      const instancesBefore = useCollectionStore.getState().ownedInstances.length
      const instanceIds = useCollectionStore.getState().ownedInstances.map(i => i.instanceId)

      useRunStore.getState().startRun('pmc', instanceIds)
      useRunStore.getState().extract()

      // No new instances added
      expect(useCollectionStore.getState().ownedInstances.length).toBe(instancesBefore)
    })

    it('should end run on extract', () => {
      useRunStore.getState().startRun('scav')
      useRunStore.getState().extract()

      const run = useRunStore.getState()
      expect(run.isRunActive).toBe(false)
      expect(run.currentDeck.length).toBe(0)
      expect(run.deckInstanceIds.length).toBe(0)
    })
  })

  describe('Death (Failure)', () => {
    it('should not award fragments on death', () => {
      const fragmentsBefore = useCollectionStore.getState().fragments

      useRunStore.getState().startRun('scav')
      useRunStore.getState().addLoot(100)
      useRunStore.getState().death()

      expect(useCollectionStore.getState().fragments).toBe(fragmentsBefore) // No change
    })

    it('should not add scav deck to collection on death', () => {
      const instancesBefore = useCollectionStore.getState().ownedInstances.length

      useRunStore.getState().startRun('scav')
      useRunStore.getState().death()

      expect(useCollectionStore.getState().ownedInstances.length).toBe(instancesBefore) // No change
    })

    it('should remove PMC deck instances from collection on death', () => {
      // Add 20 instances
      for (let i = 0; i < 20; i++) {
        useCollectionStore.getState().addCardInstance('warrior-basic-1', `inst-${i}`)
      }

      const instanceIds = useCollectionStore.getState().ownedInstances.map(i => i.instanceId).slice(0, 20)

      useRunStore.getState().startRun('pmc', instanceIds)
      useRunStore.getState().death()

      // All 20 instances should be removed
      instanceIds.forEach(id => {
        expect(useCollectionStore.getState().ownedInstances.find(i => i.instanceId === id)).toBeUndefined()
      })
    })

    it('should end run on death', () => {
      useRunStore.getState().startRun('scav')
      useRunStore.getState().death()

      const run = useRunStore.getState()
      expect(run.isRunActive).toBe(false)
      expect(run.currentDeck.length).toBe(0)
      expect(run.deckInstanceIds.length).toBe(0)
    })
  })

  describe('Run State Tracking', () => {
    it('should track loot materials', () => {
      useRunStore.getState().startRun('scav')

      useRunStore.getState().addLoot(50)
      expect(useRunStore.getState().lootMaterials).toBe(50)

      useRunStore.getState().addLoot(30)
      expect(useRunStore.getState().lootMaterials).toBe(80)
    })

    it('should track encounters completed', () => {
      useRunStore.getState().startRun('scav')

      useRunStore.getState().completeEncounter()
      expect(useRunStore.getState().encountersCompleted).toBe(1)

      useRunStore.getState().completeEncounter()
      expect(useRunStore.getState().encountersCompleted).toBe(2)
    })

    it('should reset loot and encounters on new run', () => {
      useRunStore.getState().startRun('scav')
      useRunStore.getState().addLoot(100)
      useRunStore.getState().completeEncounter()

      useRunStore.getState().reset()
      useRunStore.getState().startRun('scav')

      const run = useRunStore.getState()
      expect(run.lootMaterials).toBe(0)
      expect(run.encountersCompleted).toBe(0)
    })
  })
})

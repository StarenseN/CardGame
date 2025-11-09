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
    expect(useCollectionStore.getState().fragments).toBe(0)
    expect(useCollectionStore.getState().unlockedCards).toContain(unlockableCard)
  })

  it('should not unlock without enough fragments', () => {
    const store = useCollectionStore.getState()
    store.addFragments(30)

    const result = store.unlockCard('warrior-veteran-1') // costs 50

    expect(result).toBe(false)
    expect(useCollectionStore.getState().fragments).toBe(30)
  })

  it('should track owned card instances', () => {
    const store = useCollectionStore.getState()

    store.addCardInstance('warrior-basic-1', 'instance-1')
    store.addCardInstance('warrior-basic-1', 'instance-2')

    expect(useCollectionStore.getState().ownedInstances.length).toBe(2)
    expect(useCollectionStore.getState().getCardCount('warrior-basic-1')).toBe(2)
  })
})

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

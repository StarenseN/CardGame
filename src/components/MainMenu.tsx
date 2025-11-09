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
          className="absolute top-4 left-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded z-10"
        >
          Back
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

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

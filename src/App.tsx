import { useEffect } from 'react'
import { CombatArena } from './components/CombatArena'
import { useCombatStore } from './stores/combatStore'
import { generateCardFromTemplate, CARD_POOL } from './data/cardTemplates'

function App() {
  const initCombat = useCombatStore(state => state.initCombat)
  const setupRound = useCombatStore(state => state.setupRound)

  useEffect(() => {
    // Generate test decks
    const playerDeck = Array.from({ length: 20 }, (_, i) => {
      const template = CARD_POOL[i % CARD_POOL.length]
      return generateCardFromTemplate(template, `player-${i}`)
    })

    const aiDeck = Array.from({ length: 20 }, (_, i) => {
      const template = CARD_POOL[i % CARD_POOL.length]
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

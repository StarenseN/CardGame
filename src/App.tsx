import { useState } from 'react'
import { MainMenu } from './components/MainMenu'
import { CombatArena } from './components/CombatArena'
import { useRunStore } from './stores/runStore'
import { useCombatStore } from './stores/combatStore'
import { generateCardFromTemplate, CARD_POOL } from './data/cardTemplates'

type GameScreen = 'menu' | 'combat'

function App() {
  const [screen, setScreen] = useState<GameScreen>('menu')
  const { startRun } = useRunStore()
  const { initCombat, setupRound } = useCombatStore()

  const handleStartRun = (type: 'scav' | 'pmc', instanceIds?: string[]) => {
    startRun(type, instanceIds)
    setScreen('combat')

    // Init combat after state update
    setTimeout(() => {
      const deck = useRunStore.getState().currentDeck
      // Generate AI deck from random cards
      const aiDeck = Array.from({ length: 12 }, (_, i) => {
        const template = CARD_POOL[Math.floor(Math.random() * CARD_POOL.length)]
        return generateCardFromTemplate(template, `ai-${i}`)
      })
      initCombat(deck, aiDeck)
      setupRound()
    }, 0)
  }

  if (screen === 'menu') {
    return <MainMenu onStartRun={handleStartRun} />
  }

  return <CombatArena />
}

export default App

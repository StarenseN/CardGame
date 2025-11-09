import { Card } from '../types/Card'

interface CardComponentProps {
  card: Card
  onClick?: () => void
  selected?: boolean
  disabled?: boolean
}

const rarityColors = {
  common: 'border-gray-400 bg-gray-800',
  rare: 'border-blue-400 bg-blue-900',
  epic: 'border-purple-400 bg-purple-900',
  legendary: 'border-yellow-500 bg-yellow-900',
}

export function CardComponent({ card, onClick, selected, disabled }: CardComponentProps) {
  const effectivePower = card.getEffectivePower()
  const borderColor = rarityColors[card.rarity]

  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`
        relative w-24 h-32 rounded-lg border-2 p-2
        ${borderColor}
        ${selected ? 'ring-2 ring-green-500' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
        ${card.fatigued ? 'opacity-75' : ''}
        transition-all duration-200
      `}
    >
      {/* Power - Top */}
      <div className="absolute top-1 left-1 w-8 h-8 rounded-full bg-red-600 flex items-center justify-center font-bold text-white">
        {effectivePower}
      </div>

      {/* Fatigue indicator */}
      {card.fatigued && (
        <div className="absolute top-1 right-1 w-6 h-6 rounded-full bg-yellow-600 flex items-center justify-center text-xs">
          !
        </div>
      )}

      {/* Name */}
      <div className="absolute bottom-2 left-2 right-2 text-center text-xs font-semibold text-white">
        {card.name || `Unit ${card.id}`}
      </div>

      {/* Effects (if any) */}
      {card.effects && card.effects.length > 0 && (
        <div className="absolute bottom-8 left-1 right-1 text-center text-[8px] text-gray-300">
          {card.effects[0].type}
        </div>
      )}
    </div>
  )
}

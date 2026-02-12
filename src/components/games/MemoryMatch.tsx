import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, RotateCcw, Clock } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'
import type { GameDifficulty, MemoryCard } from '../../types/games'
import { FINANCIAL_TERMS } from '../../data/financialTerms'

interface MemoryMatchProps {
  onBack: () => void
  onScoreUpdate: (score: number, difficulty: GameDifficulty) => void
  highScores: {
    easy: number
    medium: number
    hard: number
  }
}

const DIFFICULTY_CONFIG = {
  easy: { pairs: 6, timeLimit: 90 },
  medium: { pairs: 8, timeLimit: 120 },
  hard: { pairs: 10, timeLimit: 150 },
}

export function MemoryMatch({ onBack, onScoreUpdate, highScores }: MemoryMatchProps) {
  const { t } = useTranslation()
  const [difficulty, setDifficulty] = useState<GameDifficulty>('medium')
  const [cards, setCards] = useState<MemoryCard[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [matchedPairs, setMatchedPairs] = useState(0)
  const [moves, setMoves] = useState(0)
  const [timer, setTimer] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [isGameStarted, setIsGameStarted] = useState(false)

  const initializeCards = useCallback(() => {
    const config = DIFFICULTY_CONFIG[difficulty]
    const shuffledTerms = [...FINANCIAL_TERMS].sort(() => Math.random() - 0.5).slice(0, config.pairs)
    
    const gameCards: MemoryCard[] = []
    shuffledTerms.forEach((term, index) => {
      gameCards.push({
        id: index * 2,
        term: term.term,
        definition: term.definition,
        icon: term.icon,
        isFlipped: false,
        isMatched: false,
      })
      gameCards.push({
        id: index * 2 + 1,
        term: term.term,
        definition: term.definition,
        icon: term.icon,
        isFlipped: false,
        isMatched: false,
      })
    })

    const shuffledCards = gameCards.sort(() => Math.random() - 0.5)
    setCards(shuffledCards)
    setFlippedCards([])
    setMatchedPairs(0)
    setMoves(0)
    setTimer(config.timeLimit)
    setIsComplete(false)
    setIsGameStarted(false)
  }, [difficulty])

  useEffect(() => {
    initializeCards()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isGameStarted || isComplete) return

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setIsComplete(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isGameStarted, isComplete])

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards
      const firstCard = cards[first]
      const secondCard = cards[second]

      if (firstCard.term === secondCard.term && firstCard.id !== secondCard.id) {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card, index) =>
              index === first || index === second ? { ...card, isMatched: true } : card
            )
          )
          setMatchedPairs((prev) => prev + 1)
          setFlippedCards([])
        }, 500)
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card, index) =>
              index === first || index === second ? { ...card, isFlipped: false } : card
            )
          )
          setFlippedCards([])
        }, 1000)
      }
    }
  }, [flippedCards, cards])

  useEffect(() => {
    const config = DIFFICULTY_CONFIG[difficulty]
    if (matchedPairs === config.pairs && isGameStarted) {
      setIsComplete(true)
      const timeBonus = timer * 10
      const moveBonus = Math.max(0, 100 - moves) * 5
      const totalScore = timeBonus + moveBonus
      onScoreUpdate(totalScore, difficulty)
    }
  }, [matchedPairs, difficulty, timer, moves, isGameStarted, onScoreUpdate])

  const handleCardClick = (index: number) => {
    if (!isGameStarted) {
      setIsGameStarted(true)
    }

    if (
      flippedCards.length >= 2 ||
      cards[index].isFlipped ||
      cards[index].isMatched ||
      isComplete
    ) {
      return
    }

    setCards((prev) =>
      prev.map((card, i) => (i === index ? { ...card, isFlipped: true } : card))
    )
    setFlippedCards((prev) => {
      const newFlipped = [...prev, index]
      if (newFlipped.length === 2) {
        setMoves((m) => m + 1)
      }
      return newFlipped
    })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getGridCols = () => {
    switch (difficulty) {
      case 'easy':
        return 'grid-cols-4'
      case 'medium':
        return 'grid-cols-4'
      case 'hard':
        return 'grid-cols-5'
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('backToGames')}
        </button>
        <div className="flex items-center gap-4">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as GameDifficulty)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={isGameStarted}
          >
            <option value="easy">{t('easy')} (6 {t('memory_pairs')})</option>
            <option value="medium">{t('medium')} (8 {t('memory_pairs')})</option>
            <option value="hard">{t('hard')} (10 {t('memory_pairs')})</option>
          </select>

          <div className="flex items-center gap-2 text-purple-600">
            <Clock className="w-5 h-5" />
            <span className="text-xl font-bold">{formatTime(timer)}</span>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-600">{t('memory_moves')}</div>
            <div className="text-xl font-bold text-purple-600">{moves}</div>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-600">{t('best')} ({t(difficulty)})</div>
            <div className="text-xl font-bold text-purple-600">{highScores[difficulty]}</div>
          </div>
        </div>
      </div>

      {isComplete && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 text-center">
          <div className="text-5xl mb-4">{matchedPairs === DIFFICULTY_CONFIG[difficulty].pairs ? '🎉' : '⏰'}</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {matchedPairs === DIFFICULTY_CONFIG[difficulty].pairs ? `${t('congratulations')}!` : `${t('memory_timeUp')}!`}
          </h2>
          <p className="text-gray-600 mb-4">
            {t('memory_pairs')}: {matchedPairs}/{DIFFICULTY_CONFIG[difficulty].pairs}
          </p>
          {matchedPairs === DIFFICULTY_CONFIG[difficulty].pairs && (
            <div className="text-4xl font-bold text-purple-600 mb-4">
              {t('score')}: {timer * 10 + Math.max(0, 100 - moves) * 5}
            </div>
          )}
          <button
            onClick={initializeCards}
            className="flex items-center gap-2 mx-auto px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            <RotateCcw className="w-5 h-5" />
            {t('playAgain')}
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className={`grid ${getGridCols()} gap-3 max-w-2xl mx-auto`}>
          {cards.map((card, index) => (
            <button
              key={index}
              onClick={() => handleCardClick(index)}
              disabled={card.isFlipped || card.isMatched || isComplete}
              className={`
                aspect-square rounded-lg font-medium text-sm transition-all duration-300
                ${card.isMatched
                  ? 'bg-green-100 border-2 border-green-500 text-green-800'
                  : card.isFlipped
                  ? 'bg-purple-100 border-2 border-purple-500 text-purple-800'
                  : 'bg-gray-100 hover:bg-gray-200 border-2 border-gray-300'
                }
              `}
            >
              <div className="p-2 h-full flex items-center justify-center">
                {card.isFlipped || card.isMatched ? (
                  <div className="text-center">
                    <div className="text-2xl mb-1">{card.icon}</div>
                    <div className="text-xs leading-tight">
                      {card.id % 2 === 0 ? card.term : card.definition}
                    </div>
                  </div>
                ) : (
                  <div className="text-3xl">❓</div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 text-center text-gray-600">
        <p>{t('memory_instruction')}</p>
      </div>
    </div>
  )
}

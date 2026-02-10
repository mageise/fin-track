import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Gamepad2, Grid3X3, HelpCircle, Target, Brain } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { TicTacToe } from '../components/games/TicTacToe'
import { FinanceQuiz } from '../components/games/FinanceQuiz'
import { Breakout } from '../components/games/Breakout'
import { Card } from '../components/Card'

type GameType = 'menu' | 'tictactoe' | 'quiz' | 'breakout' | 'memory'

interface HighScores {
  tictactoe: number
  quiz: number
  breakout: number
}

type GameTranslationKey = 'game_tictactoe' | 'game_tictactoe_desc' | 'game_financeQuiz' | 'game_financeQuiz_desc' | 'game_breakout' | 'game_breakout_desc' | 'game_memoryMatch' | 'game_memoryMatch_desc'

const GAMES = [
  {
    id: 'tictactoe' as const,
    nameKey: 'game_tictactoe' as GameTranslationKey,
    descriptionKey: 'game_tictactoe_desc' as GameTranslationKey,
    icon: Grid3X3,
    color: 'bg-blue-500',
  },
  {
    id: 'quiz' as const,
    nameKey: 'game_financeQuiz' as GameTranslationKey,
    descriptionKey: 'game_financeQuiz_desc' as GameTranslationKey,
    icon: HelpCircle,
    color: 'bg-emerald-500',
  },
  {
    id: 'breakout' as const,
    nameKey: 'game_breakout' as GameTranslationKey,
    descriptionKey: 'game_breakout_desc' as GameTranslationKey,
    icon: Target,
    color: 'bg-orange-500',
  },
  {
    id: 'memory' as const,
    nameKey: 'game_memoryMatch' as GameTranslationKey,
    descriptionKey: 'game_memoryMatch_desc' as GameTranslationKey,
    icon: Brain,
    color: 'bg-purple-500',
    placeholder: true,
  },
]

export function Games() {
  const { t } = useTranslation()
  const [currentGame, setCurrentGame] = useState<GameType>('menu')
  const [highScores, setHighScores] = useState<HighScores>(() => {
    const saved = localStorage.getItem('fintrack-highscores')
    return saved ? JSON.parse(saved) : { tictactoe: 0, quiz: 0, breakout: 0 }
  })

  const updateHighScore = (game: keyof HighScores, score: number) => {
    setHighScores(prev => {
      const newScores = { ...prev, [game]: Math.max(prev[game], score) }
      localStorage.setItem('fintrack-highscores', JSON.stringify(newScores))
      return newScores
    })
  }

  const renderGame = () => {
    switch (currentGame) {
      case 'tictactoe':
        return (
          <TicTacToe
            onBack={() => setCurrentGame('menu')}
            onScoreUpdate={(score) => updateHighScore('tictactoe', score)}
            highScore={highScores.tictactoe}
          />
        )
      case 'quiz':
        return (
          <FinanceQuiz
            onBack={() => setCurrentGame('menu')}
            onScoreUpdate={(score) => updateHighScore('quiz', score)}
            highScore={highScores.quiz}
          />
        )
      case 'breakout':
        return (
          <Breakout
            onBack={() => setCurrentGame('menu')}
            onScoreUpdate={(score) => updateHighScore('breakout', score)}
            highScore={highScores.breakout}
          />
        )
      default:
        return null
    }
  }

  if (currentGame !== 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          {renderGame()}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('backToToolbox')}</span>
          </Link>
          <div className="flex items-center gap-3">
            <Gamepad2 className="w-10 h-10 text-pink-600" />
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">{t('tool_miniGames')}</h1>
              <p className="text-gray-600">{t('miniGamesSubtitle')}</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Grid3X3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('game_tictactoe')}</p>
                <p className="text-2xl font-bold text-blue-600">{highScores.tictactoe}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <HelpCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('game_financeQuiz')}</p>
                <p className="text-2xl font-bold text-emerald-600">{highScores.quiz}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('game_breakout')}</p>
                <p className="text-2xl font-bold text-orange-600">{highScores.breakout}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gray-100 rounded-lg">
                <Brain className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('game_memoryMatch')}</p>
                <p className="text-2xl font-bold text-gray-400">{t('miniGames_comingSoon')}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Game Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {GAMES.map((game) => {
            const Icon = game.icon
            if (game.placeholder) {
              return (
                <Card key={game.id} className="opacity-50 grayscale cursor-not-allowed">
                  <div className={`${game.color} w-16 h-16 rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{t(game.nameKey)}</h3>
                  <p className="text-gray-600">{t(game.descriptionKey)}</p>
                </Card>
              )
            }
            return (
              <Card key={game.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <div onClick={() => setCurrentGame(game.id)}>
                  <div className={`${game.color} w-16 h-16 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{t(game.nameKey)}</h3>
                  <p className="text-gray-600">{t(game.descriptionKey)}</p>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

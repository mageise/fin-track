import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Gamepad2, Grid3X3, HelpCircle, Target, Brain, Trophy } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { TicTacToe } from '../components/games/TicTacToe'
import { FinanceQuiz } from '../components/games/FinanceQuiz'
import { Breakout } from '../components/games/Breakout'
import { MemoryMatch } from '../components/games/MemoryMatch'
import { Achievements } from '../components/games/Achievements'
import { Card } from '../components/Card'
import type { GameType, GameDifficulty, HighScores } from '../types/games'
import { 
  loadHighScores, 
  loadGameStats, 
  updateHighScore, 
  updateSimpleHighScore,
  saveGameStats 
} from '../utils/games/storage'
import { checkAchievements, unlockAchievements, ACHIEVEMENTS } from '../utils/games/achievements'
import type { GameStats } from '../types/games'

type GameTranslationKey = 'game_tictactoe' | 'game_tictactoe_desc' | 'game_financeQuiz' | 'game_financeQuiz_desc' | 'game_breakout' | 'game_breakout_desc' | 'game_memoryMatch' | 'game_memoryMatch_desc'

const GAMES = [
  {
    id: 'tictactoe' as GameType,
    nameKey: 'game_tictactoe' as GameTranslationKey,
    descriptionKey: 'game_tictactoe_desc' as GameTranslationKey,
    icon: Grid3X3,
    color: 'bg-blue-500',
    difficultySupported: true,
  },
  {
    id: 'quiz' as GameType,
    nameKey: 'game_financeQuiz' as GameTranslationKey,
    descriptionKey: 'game_financeQuiz_desc' as GameTranslationKey,
    icon: HelpCircle,
    color: 'bg-emerald-500',
    difficultySupported: false,
  },
  {
    id: 'breakout' as GameType,
    nameKey: 'game_breakout' as GameTranslationKey,
    descriptionKey: 'game_breakout_desc' as GameTranslationKey,
    icon: Target,
    color: 'bg-orange-500',
    difficultySupported: false,
  },
  {
    id: 'memory' as GameType,
    nameKey: 'game_memoryMatch' as GameTranslationKey,
    descriptionKey: 'game_memoryMatch_desc' as GameTranslationKey,
    icon: Brain,
    color: 'bg-purple-500',
    difficultySupported: true,
  },
]

export function Games() {
  const { t } = useTranslation()
  const [currentGame, setCurrentGame] = useState<GameType>('menu')
  const [highScores, setHighScores] = useState<HighScores>(loadHighScores)
  const [gameStats, setGameStats] = useState<GameStats>(loadGameStats)
  const [newAchievements, setNewAchievements] = useState<string[]>([])
  const [showAchievements, setShowAchievements] = useState(false)

  // Check for new achievements on mount and when game stats change
  useEffect(() => {
    const newlyUnlocked = checkAchievements(gameStats)
    if (newlyUnlocked.length > 0) {
      const updatedStats = unlockAchievements(gameStats, newlyUnlocked)
      setGameStats(updatedStats)
      saveGameStats(updatedStats)
      setNewAchievements(newlyUnlocked)
    }
  }, [gameStats])

  const updateHighScoreWithDifficulty = (
    game: 'tictactoe' | 'memory',
    difficulty: GameDifficulty,
    score: number
  ) => {
    const newScores = updateHighScore(highScores, game, difficulty, score)
    setHighScores(newScores)
  }

  const updateHighScoreSimple = (game: 'quiz' | 'breakout', score: number) => {
    const newScores = updateSimpleHighScore(highScores, game, score)
    setHighScores(newScores)
  }

  const handleTicTacToeScore = (score: number, won: boolean, difficulty: GameDifficulty) => {
    updateHighScoreWithDifficulty('tictactoe', difficulty, score)
    
    // Update game stats
    const newStats = { ...gameStats }
    newStats.tictactoe.gamesPlayed++
    if (won) {
      newStats.tictactoe.gamesWon++
    }
    if (score > newStats.tictactoe.highScore) {
      newStats.tictactoe.highScore = score
    }
    setGameStats(newStats)
    saveGameStats(newStats)
  }

  const handleQuizComplete = (score: number, accuracy: number, maxStreak: number) => {
    updateHighScoreSimple('quiz', score)
    
    // Update game stats
    const newStats = { ...gameStats }
    newStats.quiz.gamesPlayed++
    if (score > newStats.quiz.highScore) {
      newStats.quiz.highScore = score
    }
    if (accuracy > newStats.quiz.bestAccuracy) {
      newStats.quiz.bestAccuracy = accuracy
    }
    if (maxStreak > newStats.quiz.maxStreak) {
      newStats.quiz.maxStreak = maxStreak
    }
    setGameStats(newStats)
    saveGameStats(newStats)
  }

  const handleBreakoutScore = (score: number, level: number) => {
    updateHighScoreSimple('breakout', score)
    
    // Update game stats
    const newStats = { ...gameStats }
    newStats.breakout.gamesPlayed++
    if (score > newStats.breakout.highScore) {
      newStats.breakout.highScore = score
    }
    if (level > newStats.breakout.maxLevel) {
      newStats.breakout.maxLevel = level
    }
    setGameStats(newStats)
    saveGameStats(newStats)
  }

  const handleMemoryScore = (score: number, difficulty: GameDifficulty) => {
    updateHighScoreWithDifficulty('memory', difficulty, score)
    
    // Update game stats
    const newStats = { ...gameStats }
    newStats.memory.gamesPlayed++
    if (score > newStats.memory.highScore) {
      newStats.memory.highScore = score
    }
    setGameStats(newStats)
    saveGameStats(newStats)
  }

  const dismissNewAchievements = () => {
    setNewAchievements([])
  }

  const renderGame = () => {
    switch (currentGame) {
      case 'tictactoe':
        return (
          <TicTacToe
            onBack={() => setCurrentGame('menu')}
            onScoreUpdate={handleTicTacToeScore}
            highScores={highScores.tictactoe}
          />
        )
      case 'quiz':
        return (
          <FinanceQuiz
            onBack={() => setCurrentGame('menu')}
            onScoreUpdate={handleQuizComplete}
            highScore={highScores.quiz}
          />
        )
      case 'breakout':
        return (
          <Breakout
            onBack={() => setCurrentGame('menu')}
            onScoreUpdate={handleBreakoutScore}
            highScore={highScores.breakout}
          />
        )
      case 'memory':
        return (
          <MemoryMatch
            onBack={() => setCurrentGame('menu')}
            onScoreUpdate={handleMemoryScore}
            highScores={highScores.memory}
          />
        )
      default:
        return null
    }
  }

  // Calculate best scores for display
  const getBestTicTacToeScore = () => {
    return Math.max(highScores.tictactoe.easy, highScores.tictactoe.medium, highScores.tictactoe.hard)
  }

  const getBestMemoryScore = () => {
    return Math.max(highScores.memory.easy, highScores.memory.medium, highScores.memory.hard)
  }

  const unlockedCount = gameStats.achievementsUnlocked.length
  const totalAchievements = ACHIEVEMENTS.length

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
                <p className="text-2xl font-bold text-blue-600">{getBestTicTacToeScore()}</p>
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
              <div className="p-3 bg-purple-100 rounded-lg">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('game_memoryMatch')}</p>
                <p className="text-2xl font-bold text-purple-600">{getBestMemoryScore()}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* New Achievements Notification */}
        {newAchievements.length > 0 && (
          <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-yellow-600" />
                <div>
                  <h3 className="font-bold text-gray-800">
                    {newAchievements.length === 1 
                      ? t('achievements_newSingle')
                      : t('achievements_newMultiple').replace('{count}', newAchievements.length.toString())}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {newAchievements.map(id => {
                      const achievement = ACHIEVEMENTS.find(a => a.id === id)
                      return achievement?.icon
                    }).join(' ')}
                  </p>
                </div>
              </div>
              <button
                onClick={dismissNewAchievements}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
              >
                {t('achievements_viewAll')}
              </button>
            </div>
          </div>
        )}

        {/* Achievements Summary */}
        <Card className="mb-8 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowAchievements(true)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-pink-100 rounded-lg">
                <Trophy className="w-8 h-8 text-pink-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{t('achievements_title')}</h3>
                <p className="text-gray-600">{t('achievements_description')}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-pink-600">{unlockedCount}/{totalAchievements}</div>
              <div className="text-sm text-gray-600">{t('achievements_progress')}</div>
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-4 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-pink-500 transition-all duration-500"
              style={{ width: `${(unlockedCount / totalAchievements) * 100}%` }}
            />
          </div>
        </Card>

        {/* Game Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {GAMES.map((game) => {
            const Icon = game.icon
            return (
              <Card 
                key={game.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setCurrentGame(game.id)}
              >
                <div className={`${game.color} w-16 h-16 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{t(game.nameKey)}</h3>
                <p className="text-gray-600">{t(game.descriptionKey)}</p>
                {game.difficultySupported && (
                  <div className="mt-2 text-xs text-gray-500">
                    {t('difficulty_levels')}
                  </div>
                )}
              </Card>
            )
          })}
        </div>

        {/* Achievements Modal */}
        {showAchievements && (
          <Achievements 
            gameStats={gameStats}
            onClose={() => setShowAchievements(false)}
          />
        )}
      </div>
    </div>
  )
}

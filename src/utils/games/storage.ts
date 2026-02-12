import type { GameDifficulty, GameStats, HighScores } from '../../types/games'

const HIGH_SCORES_KEY = 'fintrack-highscores-v2'
const GAME_STATS_KEY = 'fintrack-gamestats'

export const defaultHighScores: HighScores = {
  tictactoe: {
    easy: 0,
    medium: 0,
    hard: 0,
  },
  quiz: 0,
  breakout: 0,
  memory: {
    easy: 0,
    medium: 0,
    hard: 0,
  },
}

export const defaultGameStats: GameStats = {
  tictactoe: {
    gamesPlayed: 0,
    gamesWon: 0,
    highScore: 0,
  },
  quiz: {
    gamesPlayed: 0,
    highScore: 0,
    bestAccuracy: 0,
    maxStreak: 0,
  },
  breakout: {
    gamesPlayed: 0,
    highScore: 0,
    maxLevel: 0,
  },
  memory: {
    gamesPlayed: 0,
    highScore: 0,
  },
  totalGamesPlayed: 0,
  achievementsUnlocked: [],
}

export function loadHighScores(): HighScores {
  try {
    const saved = localStorage.getItem(HIGH_SCORES_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      // Merge with defaults to ensure all fields exist
      return {
        ...defaultHighScores,
        ...parsed,
        tictactoe: {
          ...defaultHighScores.tictactoe,
          ...(parsed.tictactoe || {}),
        },
        memory: {
          ...defaultHighScores.memory,
          ...(parsed.memory || {}),
        },
      }
    }
  } catch (e) {
    console.error('Failed to load high scores:', e)
  }
  return defaultHighScores
}

export function saveHighScores(scores: HighScores): void {
  try {
    localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(scores))
  } catch (e) {
    console.error('Failed to save high scores:', e)
  }
}

export function updateHighScore(
  scores: HighScores,
  game: 'tictactoe' | 'memory',
  difficulty: GameDifficulty,
  score: number
): HighScores {
  const newScores = { ...scores }
  if (score > newScores[game][difficulty]) {
    newScores[game][difficulty] = score
    saveHighScores(newScores)
  }
  return newScores
}

export function updateSimpleHighScore(
  scores: HighScores,
  game: 'quiz' | 'breakout',
  score: number
): HighScores {
  const newScores = { ...scores }
  if (score > newScores[game]) {
    newScores[game] = score
    saveHighScores(newScores)
  }
  return newScores
}

export function loadGameStats(): GameStats {
  try {
    const saved = localStorage.getItem(GAME_STATS_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      return {
        ...defaultGameStats,
        ...parsed,
        tictactoe: {
          ...defaultGameStats.tictactoe,
          ...(parsed.tictactoe || {}),
        },
        quiz: {
          ...defaultGameStats.quiz,
          ...(parsed.quiz || {}),
        },
        breakout: {
          ...defaultGameStats.breakout,
          ...(parsed.breakout || {}),
        },
        memory: {
          ...defaultGameStats.memory,
          ...(parsed.memory || {}),
        },
      }
    }
  } catch (e) {
    console.error('Failed to load game stats:', e)
  }
  return defaultGameStats
}

export function saveGameStats(stats: GameStats): void {
  try {
    localStorage.setItem(GAME_STATS_KEY, JSON.stringify(stats))
  } catch (e) {
    console.error('Failed to save game stats:', e)
  }
}

export function recordGamePlayed(gameType: keyof Omit<GameStats, 'totalGamesPlayed' | 'achievementsUnlocked'>): void {
  const stats = loadGameStats()
  stats[gameType].gamesPlayed++
  stats.totalGamesPlayed++
  saveGameStats(stats)
}

export function recordGameWon(gameType: 'tictactoe'): void {
  const stats = loadGameStats()
  stats[gameType].gamesWon++
  saveGameStats(stats)
}

export function recordQuizStats(score: number, accuracy: number, maxStreak: number): void {
  const stats = loadGameStats()
  stats.quiz.gamesPlayed++
  stats.totalGamesPlayed++
  if (score > stats.quiz.highScore) {
    stats.quiz.highScore = score
  }
  if (accuracy > stats.quiz.bestAccuracy) {
    stats.quiz.bestAccuracy = accuracy
  }
  if (maxStreak > stats.quiz.maxStreak) {
    stats.quiz.maxStreak = maxStreak
  }
  saveGameStats(stats)
}

export function recordBreakoutStats(score: number, level: number): void {
  const stats = loadGameStats()
  stats.breakout.gamesPlayed++
  stats.totalGamesPlayed++
  if (score > stats.breakout.highScore) {
    stats.breakout.highScore = score
  }
  if (level > stats.breakout.maxLevel) {
    stats.breakout.maxLevel = level
  }
  saveGameStats(stats)
}

export function recordMemoryStats(score: number): void {
  const stats = loadGameStats()
  stats.memory.gamesPlayed++
  stats.totalGamesPlayed++
  if (score > stats.memory.highScore) {
    stats.memory.highScore = score
  }
  saveGameStats(stats)
}

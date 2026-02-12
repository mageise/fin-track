import type { Achievement, GameStats } from '../../types/games'

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'firstWin',
    nameKey: 'achievement_firstWin',
    descriptionKey: 'achievement_firstWin_desc',
    icon: '🎯',
    unlockedAt: null,
    condition: (stats) => stats.tictactoe.gamesWon > 0,
  },
  {
    id: 'gameMaster',
    nameKey: 'achievement_gameMaster',
    descriptionKey: 'achievement_gameMaster_desc',
    icon: '🎮',
    unlockedAt: null,
    condition: (stats) =>
      stats.tictactoe.gamesPlayed > 0 &&
      stats.quiz.gamesPlayed > 0 &&
      stats.breakout.gamesPlayed > 0 &&
      stats.memory.gamesPlayed > 0,
  },
  {
    id: 'quickLearner',
    nameKey: 'achievement_quickLearner',
    descriptionKey: 'achievement_quickLearner_desc',
    icon: '📚',
    unlockedAt: null,
    condition: (stats) => stats.quiz.bestAccuracy >= 80,
  },
  {
    id: 'brickBreaker',
    nameKey: 'achievement_brickBreaker',
    descriptionKey: 'achievement_brickBreaker_desc',
    icon: '🧱',
    unlockedAt: null,
    condition: (stats) => stats.breakout.maxLevel >= 5,
  },
  {
    id: 'memoryPro',
    nameKey: 'achievement_memoryPro',
    descriptionKey: 'achievement_memoryPro_desc',
    icon: '🃏',
    unlockedAt: null,
    condition: (stats) => stats.memory.gamesPlayed > 0, // Will be enhanced when Memory Match tracks difficulty
  },
  {
    id: 'tictactoeChampion',
    nameKey: 'achievement_tictactoeChampion',
    descriptionKey: 'achievement_tictactoeChampion_desc',
    icon: '🏆',
    unlockedAt: null,
    condition: (stats) => stats.tictactoe.gamesWon >= 10,
  },
  {
    id: 'onFire',
    nameKey: 'achievement_onFire',
    descriptionKey: 'achievement_onFire_desc',
    icon: '🔥',
    unlockedAt: null,
    condition: (stats) => stats.quiz.maxStreak >= 5,
  },
  {
    id: 'perfectScore',
    nameKey: 'achievement_perfectScore',
    descriptionKey: 'achievement_perfectScore_desc',
    icon: '💯',
    unlockedAt: null,
    condition: (stats) => stats.quiz.bestAccuracy === 100,
  },
  {
    id: 'speedRunner',
    nameKey: 'achievement_speedRunner',
    descriptionKey: 'achievement_speedRunner_desc',
    icon: '⚡',
    unlockedAt: null,
    condition: (stats) => stats.memory.gamesPlayed > 0, // Will track time-based completion
  },
  {
    id: 'highScorer',
    nameKey: 'achievement_highScorer',
    descriptionKey: 'achievement_highScorer_desc',
    icon: '⭐',
    unlockedAt: null,
    condition: (stats) =>
      stats.tictactoe.highScore > 0 ||
      stats.quiz.highScore > 0 ||
      stats.breakout.highScore > 0 ||
      stats.memory.highScore > 0,
  },
]

export function checkAchievements(stats: GameStats): string[] {
  const newlyUnlocked: string[] = []
  
  ACHIEVEMENTS.forEach((achievement) => {
    if (!stats.achievementsUnlocked.includes(achievement.id)) {
      if (achievement.condition(stats)) {
        newlyUnlocked.push(achievement.id)
      }
    }
  })
  
  return newlyUnlocked
}

export function unlockAchievements(stats: GameStats, achievementIds: string[]): GameStats {
  const newStats = { ...stats }
  const newUnlocks = achievementIds.filter(id => !newStats.achievementsUnlocked.includes(id))
  
  if (newUnlocks.length > 0) {
    newStats.achievementsUnlocked = [...newStats.achievementsUnlocked, ...newUnlocks]
  }
  
  return newStats
}

export function getAchievementProgress(stats: GameStats): { unlocked: number; total: number } {
  const unlocked = stats.achievementsUnlocked.length
  const total = ACHIEVEMENTS.length
  return { unlocked, total }
}

export type GameType = 'menu' | 'tictactoe' | 'quiz' | 'breakout' | 'memory'

export type GameDifficulty = 'easy' | 'medium' | 'hard'

export interface HighScores {
  tictactoe: {
    easy: number
    medium: number
    hard: number
  }
  quiz: number
  breakout: number
  memory: {
    easy: number
    medium: number
    hard: number
  }
}

export interface GameConfig {
  id: GameType
  nameKey: string
  descriptionKey: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  placeholder?: boolean
  difficultySupported?: boolean
}

// Tic-Tac-Toe types
export type Player = 'X' | 'O' | null

export interface TicTacToeState {
  board: Player[]
  currentPlayer: 'X' | 'O'
  winner: Player | 'draw' | null
  winningLine: number[]
  score: number
  gamesPlayed: number
  difficulty: GameDifficulty
}

// Finance Quiz types
export interface QuizQuestion {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  category: 'fire' | 'investing' | 'budgeting' | 'taxes' | 'general'
}

export interface QuizState {
  currentQuestion: number
  score: number
  selectedAnswer: number | null
  showExplanation: boolean
  isAnswered: boolean
  isComplete: boolean
  streak: number
  maxStreak: number
}

// Breakout types
export interface Ball {
  x: number
  y: number
  dx: number
  dy: number
  radius: number
}

export interface Paddle {
  x: number
  y: number
  width: number
  height: number
}

export interface Brick {
  x: number
  y: number
  width: number
  height: number
  color: string
  points: number
  visible: boolean
  pattern: 'solid' | 'striped' | 'bonus'
  isBonus?: boolean
}

export interface BreakoutState {
  score: number
  lives: number
  gameState: 'ready' | 'playing' | 'gameOver' | 'won'
  level: number
}

// Memory Match types
export interface MemoryCard {
  id: number
  term: string
  definition: string
  icon: string
  isFlipped: boolean
  isMatched: boolean
}

export interface MemoryGameState {
  cards: MemoryCard[]
  flippedCards: number[]
  matchedPairs: number
  moves: number
  timer: number
  isComplete: boolean
  difficulty: GameDifficulty
  timeLimit: number
}

// Achievement types
export interface Achievement {
  id: string
  nameKey: string
  descriptionKey: string
  icon: string
  unlockedAt: string | null
  condition: (stats: GameStats) => boolean
}

export interface GameStats {
  tictactoe: {
    gamesPlayed: number
    gamesWon: number
    highScore: number
  }
  quiz: {
    gamesPlayed: number
    highScore: number
    bestAccuracy: number
    maxStreak: number
  }
  breakout: {
    gamesPlayed: number
    highScore: number
    maxLevel: number
  }
  memory: {
    gamesPlayed: number
    highScore: number
  }
  totalGamesPlayed: number
  achievementsUnlocked: string[]
}

export interface UnlockedAchievement extends Achievement {
  unlockedAt: string
}

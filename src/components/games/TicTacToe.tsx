import { useState, useCallback, useRef, useEffect } from 'react'
import { ArrowLeft, RotateCcw } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation'
import type { GameDifficulty } from '../../types/games'

interface TicTacToeProps {
  onBack: () => void
  onScoreUpdate: (score: number, won: boolean, difficulty: GameDifficulty) => void
  highScores: {
    easy: number
    medium: number
    hard: number
  }
}

type Player = 'X' | 'O' | null

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6], // Diagonals
]

export function TicTacToe({ onBack, onScoreUpdate, highScores }: TicTacToeProps) {
  const { t } = useTranslation()
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null))
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X')
  const [winner, setWinner] = useState<Player>(null)
  const [winningLine, setWinningLine] = useState<number[]>([])
  const [score, setScore] = useState(0)
  const [difficulty, setDifficulty] = useState<GameDifficulty>('medium')
  const [gamesPlayed, setGamesPlayed] = useState(0)

  const checkWinner = useCallback((boardState: Player[]): { winner: Player; line: number[] } => {
    for (const combo of WINNING_COMBINATIONS) {
      const [a, b, c] = combo
      if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
        return { winner: boardState[a], line: combo }
      }
    }
    return { winner: null, line: [] }
  }, [])

  // Easy AI: Random moves
  const getEasyMove = useCallback((currentBoard: Player[]): number => {
    const available = currentBoard.map((cell, i) => cell === null ? i : -1).filter(i => i !== -1)
    if (available.length > 0) {
      return available[Math.floor(Math.random() * available.length)]
    }
    return -1
  }, [])

  // Medium AI: Smart strategy (existing implementation)
  const getMediumMove = useCallback((currentBoard: Player[]): number => {
    // Check for winning move
    for (const combo of WINNING_COMBINATIONS) {
      const [a, b, c] = combo
      const line = [currentBoard[a], currentBoard[b], currentBoard[c]]
      const oCount = line.filter(cell => cell === 'O').length
      const nullCount = line.filter(cell => cell === null).length
      if (oCount === 2 && nullCount === 1) {
        if (currentBoard[a] === null) return a
        if (currentBoard[b] === null) return b
        if (currentBoard[c] === null) return c
      }
    }

    // Block player's winning move
    for (const combo of WINNING_COMBINATIONS) {
      const [a, b, c] = combo
      const line = [currentBoard[a], currentBoard[b], currentBoard[c]]
      const xCount = line.filter(cell => cell === 'X').length
      const nullCount = line.filter(cell => cell === null).length
      if (xCount === 2 && nullCount === 1) {
        if (currentBoard[a] === null) return a
        if (currentBoard[b] === null) return b
        if (currentBoard[c] === null) return c
      }
    }

    // Take center if available
    if (currentBoard[4] === null) return 4

    // Take a corner
    const corners = [0, 2, 6, 8]
    const availableCorners = corners.filter(i => currentBoard[i] === null)
    if (availableCorners.length > 0) {
      return availableCorners[Math.floor(Math.random() * availableCorners.length)]
    }

    // Take any available space
    const available = currentBoard.map((cell, i) => cell === null ? i : -1).filter(i => i !== -1)
    if (available.length > 0) {
      return available[Math.floor(Math.random() * available.length)]
    }

    return -1
  }, [])

  // Hard AI: Minimax algorithm - use useRef to handle circular reference
  const minimaxRef = useRef<((currentBoard: Player[], depth: number, isMaximizing: boolean) => number) | null>(null)

  const minimax = useCallback((currentBoard: Player[], depth: number, isMaximizing: boolean): number => {
    const { winner } = checkWinner(currentBoard)

    if (winner === 'O') return 10 - depth
    if (winner === 'X') return depth - 10
    if (!currentBoard.includes(null)) return 0

    if (isMaximizing) {
      let bestScore = -Infinity
      for (let i = 0; i < 9; i++) {
        if (currentBoard[i] === null) {
          currentBoard[i] = 'O'
          const score = minimaxRef.current!(currentBoard, depth + 1, false)
          currentBoard[i] = null
          bestScore = Math.max(score, bestScore)
        }
      }
      return bestScore
    } else {
      let bestScore = Infinity
      for (let i = 0; i < 9; i++) {
        if (currentBoard[i] === null) {
          currentBoard[i] = 'X'
          const score = minimaxRef.current!(currentBoard, depth + 1, true)
          currentBoard[i] = null
          bestScore = Math.min(score, bestScore)
        }
      }
      return bestScore
    }
  }, [checkWinner])

  useEffect(() => {
    minimaxRef.current = minimax
  }, [minimax])

  const getHardMove = useCallback((currentBoard: Player[]): number => {
    let bestScore = -Infinity
    let bestMove = -1

    for (let i = 0; i < 9; i++) {
      if (currentBoard[i] === null) {
        currentBoard[i] = 'O'
        const score = minimax(currentBoard, 0, false)
        currentBoard[i] = null
        if (score > bestScore) {
          bestScore = score
          bestMove = i
        }
      }
    }

    return bestMove
  }, [minimax])

  const getComputerMove = useCallback((currentBoard: Player[]): number => {
    switch (difficulty) {
      case 'easy':
        return getEasyMove(currentBoard)
      case 'hard':
        return getHardMove(currentBoard)
      case 'medium':
      default:
        return getMediumMove(currentBoard)
    }
  }, [difficulty, getEasyMove, getMediumMove, getHardMove])

  const handleClick = (index: number) => {
    if (board[index] || winner || currentPlayer !== 'X') return

    const newBoard = [...board]
    newBoard[index] = 'X'
    setBoard(newBoard)

    const { winner: gameWinner, line } = checkWinner(newBoard)
    if (gameWinner) {
      setWinner(gameWinner)
      setWinningLine(line)
      if (gameWinner === 'X') {
        const newScore = score + 100
        setScore(newScore)
        onScoreUpdate(newScore, true, difficulty)
      } else {
        onScoreUpdate(score, false, difficulty)
      }
      setGamesPlayed(prev => prev + 1)
    } else if (!newBoard.includes(null)) {
      setWinner('draw' as Player)
      setGamesPlayed(prev => prev + 1)
      onScoreUpdate(score, false, difficulty)
    } else {
      setCurrentPlayer('O')
      // Computer's turn
      setTimeout(() => {
        const computerMove = getComputerMove(newBoard)
        if (computerMove !== -1) {
          const computerBoard = [...newBoard]
          computerBoard[computerMove] = 'O'
          setBoard(computerBoard)

          const { winner: computerWinner, line: computerLine } = checkWinner(computerBoard)
          if (computerWinner) {
            setWinner(computerWinner)
            setWinningLine(computerLine)
            setGamesPlayed(prev => prev + 1)
            onScoreUpdate(score, false, difficulty)
          } else if (!computerBoard.includes(null)) {
            setWinner('draw' as Player)
            setGamesPlayed(prev => prev + 1)
            onScoreUpdate(score, false, difficulty)
          } else {
            setCurrentPlayer('X')
          }
        }
      }, 500)
    }
  }

  const resetGame = () => {
    setBoard(Array(9).fill(null))
    setCurrentPlayer('X')
    setWinner(null)
    setWinningLine([])
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('backToGames')}
        </button>
        <div className="flex items-center gap-4">
          {/* Difficulty Selector */}
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as GameDifficulty)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={gamesPlayed > 0}
          >
            <option value="easy">{t('easy')}</option>
            <option value="medium">{t('medium')}</option>
            <option value="hard">{t('hard')}</option>
          </select>
          
          <div className="text-right">
            <div className="text-sm text-gray-600">{t('score')}</div>
            <div className="text-2xl font-bold text-blue-600">{score}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">{t('best')} ({t(difficulty)})</div>
            <div className="text-2xl font-bold text-purple-600">{highScores[difficulty]}</div>
          </div>
        </div>
      </div>

      {/* Game Status */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {winner ? (
          <div className="text-center">
            <div className={`text-3xl font-bold mb-2 ${
              winner === 'X' ? 'text-green-600' : winner === 'O' ? 'text-red-600' : 'text-gray-600'
            }`}>
              {winner === 'X' ? `🎉 ${t('youWin')}` : winner === 'O' ? `😔 ${t('computerWins')}` : `🤝 ${t('itsADraw')}`}
            </div>
            <button
              onClick={resetGame}
              className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <RotateCcw className="w-4 h-4" />
              {t('playAgain')}
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-xl font-semibold text-gray-800">
              {currentPlayer === 'X' ? `${t('yourTurn')} (X)` : `${t('computerThinking')}...`}
            </div>
          </div>
        )}
      </div>

      {/* Game Board */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleClick(index)}
              disabled={!!cell || !!winner || currentPlayer !== 'X'}
              className={`aspect-square text-4xl font-bold rounded-lg transition-all ${
                winningLine.includes(index)
                  ? 'bg-green-200 text-green-800'
                  : cell
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-400'
              }`}
            >
              {cell}
            </button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-6 text-center text-gray-600">
        <p>{t('tictactoe_instruction')}</p>
      </div>
    </div>
  )
}

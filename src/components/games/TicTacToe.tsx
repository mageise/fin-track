import { useState, useCallback } from 'react'
import { ArrowLeft, RotateCcw } from 'lucide-react'

interface TicTacToeProps {
  onBack: () => void
  onScoreUpdate: (score: number) => void
  highScore: number
}

type Player = 'X' | 'O' | null

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6], // Diagonals
]

export function TicTacToe({ onBack, onScoreUpdate, highScore }: TicTacToeProps) {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null))
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X')
  const [winner, setWinner] = useState<Player>(null)
  const [winningLine, setWinningLine] = useState<number[]>([])
  const [score, setScore] = useState(0)
  const [, setGamesPlayed] = useState(0)

  const checkWinner = useCallback((boardState: Player[]): { winner: Player; line: number[] } => {
    for (const combo of WINNING_COMBINATIONS) {
      const [a, b, c] = combo
      if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
        return { winner: boardState[a], line: combo }
      }
    }
    return { winner: null, line: [] }
  }, [])

  const getComputerMove = useCallback((currentBoard: Player[]): number => {
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
        onScoreUpdate(newScore)
      }
      setGamesPlayed(prev => prev + 1)
    } else if (!newBoard.includes(null)) {
      setWinner('draw' as Player)
      setGamesPlayed(prev => prev + 1)
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
          } else if (!computerBoard.includes(null)) {
            setWinner('draw' as Player)
            setGamesPlayed(prev => prev + 1)
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
          Back to Games
        </button>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-gray-600">Score</div>
            <div className="text-2xl font-bold text-blue-600">{score}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Best</div>
            <div className="text-2xl font-bold text-purple-600">{highScore}</div>
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
              {winner === 'X' ? '🎉 You Win!' : winner === 'O' ? '😔 Computer Wins' : "🤝 It's a Draw!"}
            </div>
            <button
              onClick={resetGame}
              className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <RotateCcw className="w-4 h-4" />
              Play Again
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-xl font-semibold text-gray-800">
              {currentPlayer === 'X' ? 'Your Turn (X)' : 'Computer Thinking...'}
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
        <p>Get 3 in a row to win! You play as X, computer plays as O.</p>
      </div>
    </div>
  )
}

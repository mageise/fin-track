import { useState, useEffect, useRef, useCallback } from 'react'
import { ArrowLeft, RotateCcw } from 'lucide-react'

interface BreakoutProps {
  onBack: () => void
  onScoreUpdate: (score: number) => void
  highScore: number
}

interface Ball {
  x: number
  y: number
  dx: number
  dy: number
  radius: number
}

interface Paddle {
  x: number
  y: number
  width: number
  height: number
}

interface Brick {
  x: number
  y: number
  width: number
  height: number
  color: string
  points: number
  visible: boolean
}

const BRICK_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6']
const BRICK_POINTS = [50, 40, 30, 20, 10]
const GAME_WIDTH = 800
const GAME_HEIGHT = 600
const PADDLE_WIDTH = 100
const PADDLE_HEIGHT = 15
const BALL_RADIUS = 8
const BRICK_ROWS = 5
const BRICK_COLS = 10
const BRICK_WIDTH = 70
const BRICK_HEIGHT = 20
const BRICK_PADDING = 5
const BRICK_OFFSET_TOP = 60
const BRICK_OFFSET_LEFT = 35

export function Breakout({ onBack, onScoreUpdate, highScore }: BreakoutProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameOver' | 'won'>('ready')
  const [level, setLevel] = useState(1)
  const ballRef = useRef<Ball>({
    x: GAME_WIDTH / 2,
    y: GAME_HEIGHT - 50,
    dx: 4,
    dy: -4,
    radius: BALL_RADIUS,
  })
  const paddleRef = useRef<Paddle>({
    x: GAME_WIDTH / 2 - PADDLE_WIDTH / 2,
    y: GAME_HEIGHT - 30,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
  })
  const bricksRef = useRef<Brick[]>([])
  const animationRef = useRef<number | undefined>(undefined)
  const gameStateRef = useRef(gameState)

  // Keep gameStateRef in sync
  useEffect(() => {
    gameStateRef.current = gameState
  }, [gameState])

  const initializeBricks = useCallback(() => {
    const bricks: Brick[] = []
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        bricks.push({
          x: BRICK_OFFSET_LEFT + col * (BRICK_WIDTH + BRICK_PADDING),
          y: BRICK_OFFSET_TOP + row * (BRICK_HEIGHT + BRICK_PADDING),
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          color: BRICK_COLORS[row],
          points: BRICK_POINTS[row],
          visible: true,
        })
      }
    }
    bricksRef.current = bricks
  }, [])

  const resetBall = useCallback(() => {
    ballRef.current = {
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT - 50,
      dx: 4 + level * 0.5,
      dy: -4 - level * 0.5,
      radius: BALL_RADIUS,
    }
  }, [level])

  const resetGame = useCallback(() => {
    setScore(0)
    setLives(3)
    setLevel(1)
    setGameState('ready')
    paddleRef.current.x = GAME_WIDTH / 2 - PADDLE_WIDTH / 2
    resetBall()
    initializeBricks()
  }, [resetBall, initializeBricks])

  const startGame = useCallback(() => {
    setGameState('playing')
    if (gameState === 'ready' || gameState === 'gameOver' || gameState === 'won') {
      resetBall()
      initializeBricks()
    }
  }, [gameState, initializeBricks, resetBall])

  // Handle paddle movement
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameStateRef.current !== 'playing') return
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const scaleX = GAME_WIDTH / rect.width
    const gameX = x * scaleX
    
    paddleRef.current.x = Math.max(0, Math.min(GAME_WIDTH - PADDLE_WIDTH, gameX - PADDLE_WIDTH / 2))
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (gameStateRef.current !== 'playing') return
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0]
    const x = touch.clientX - rect.left
    const scaleX = GAME_WIDTH / rect.width
    const gameX = x * scaleX
    
    paddleRef.current.x = Math.max(0, Math.min(GAME_WIDTH - PADDLE_WIDTH, gameX - PADDLE_WIDTH / 2))
  }, [])

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = () => {
      // Clear canvas
      ctx.fillStyle = '#1f2937'
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

      // Draw bricks
      bricksRef.current.forEach((brick) => {
        if (brick.visible) {
          ctx.fillStyle = brick.color
          ctx.fillRect(brick.x, brick.y, brick.width, brick.height)
          // Add bevel effect
          ctx.strokeStyle = 'rgba(255,255,255,0.3)'
          ctx.strokeRect(brick.x, brick.y, brick.width, brick.height)
        }
      })

      // Draw paddle
      ctx.fillStyle = '#3b82f6'
      ctx.fillRect(paddleRef.current.x, paddleRef.current.y, paddleRef.current.width, paddleRef.current.height)
      // Add glow effect
      ctx.shadowColor = '#3b82f6'
      ctx.shadowBlur = 10
      ctx.fillRect(paddleRef.current.x, paddleRef.current.y, paddleRef.current.width, paddleRef.current.height)
      ctx.shadowBlur = 0

      // Draw ball
      ctx.beginPath()
      ctx.arc(ballRef.current.x, ballRef.current.y, ballRef.current.radius, 0, Math.PI * 2)
      ctx.fillStyle = '#fbbf24'
      ctx.fill()
      ctx.closePath()
      // Add glow
      ctx.shadowColor = '#fbbf24'
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.arc(ballRef.current.x, ballRef.current.y, ballRef.current.radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      // Draw game state text
      if (gameStateRef.current === 'ready') {
        ctx.fillStyle = '#ffffff'
        ctx.font = 'bold 30px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('CLICK TO START', GAME_WIDTH / 2, GAME_HEIGHT / 2)
      } else if (gameStateRef.current === 'gameOver') {
        ctx.fillStyle = '#ef4444'
        ctx.font = 'bold 40px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('GAME OVER', GAME_WIDTH / 2, GAME_HEIGHT / 2)
        ctx.fillStyle = '#ffffff'
        ctx.font = '20px Arial'
        ctx.fillText('Click to try again', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40)
      } else if (gameStateRef.current === 'won') {
        ctx.fillStyle = '#22c55e'
        ctx.font = 'bold 40px Arial'
        ctx.textAlign = 'center'
        ctx.fillText('YOU WON!', GAME_WIDTH / 2, GAME_HEIGHT / 2)
        ctx.fillStyle = '#ffffff'
        ctx.font = '20px Arial'
        ctx.fillText('Click to play next level', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40)
      }
    }

    const update = () => {
      if (gameStateRef.current !== 'playing') return

      const ball = ballRef.current
      const paddle = paddleRef.current

      // Move ball
      ball.x += ball.dx
      ball.y += ball.dy

      // Wall collisions
      if (ball.x + ball.radius > GAME_WIDTH || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx
      }
      if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy
      }

      // Paddle collision
      if (
        ball.y + ball.radius > paddle.y &&
        ball.y - ball.radius < paddle.y + paddle.height &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width
      ) {
        ball.dy = -Math.abs(ball.dy)
        // Add angle based on where ball hits paddle
        const hitPos = (ball.x - paddle.x) / paddle.width
        ball.dx = 8 * (hitPos - 0.5)
      }

      // Brick collisions
      let activeBricks = 0
      bricksRef.current.forEach((brick) => {
        if (!brick.visible) return
        activeBricks++
        if (
          ball.x > brick.x &&
          ball.x < brick.x + brick.width &&
          ball.y > brick.y &&
          ball.y < brick.y + brick.height
        ) {
          brick.visible = false
          ball.dy = -ball.dy
          setScore((prev) => {
            const newScore = prev + brick.points
            onScoreUpdate(newScore)
            return newScore
          })
        }
      })

      // Check win
      if (activeBricks === 0) {
        setGameState('won')
        return
      }

      // Ball out (lose life)
      if (ball.y > GAME_HEIGHT) {
        setLives((prev) => {
          const newLives = prev - 1
          if (newLives <= 0) {
            setGameState('gameOver')
          } else {
            resetBall()
          }
          return newLives
        })
      }
    }

    const gameLoop = () => {
      update()
      draw()
      animationRef.current = requestAnimationFrame(gameLoop)
    }

    gameLoop()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [onScoreUpdate, resetBall])

  // Initialize on mount
  useEffect(() => {
    initializeBricks()
  }, [initializeBricks])

  // Handle next level
  const nextLevel = () => {
    setLevel((prev) => prev + 1)
    initializeBricks()
    resetBall()
    setGameState('playing')
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Games
        </button>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-sm text-gray-600">Score</div>
            <div className="text-2xl font-bold text-orange-600">{score}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Level</div>
            <div className="text-2xl font-bold text-blue-600">{level}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Lives</div>
            <div className="flex gap-1">
              {Array.from({ length: lives }).map((_, i) => (
                <div key={i} className="w-3 h-3 rounded-full bg-red-500" />
              ))}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Best</div>
            <div className="text-2xl font-bold text-purple-600">{highScore}</div>
          </div>
        </div>
      </div>

      {/* Game Canvas */}
      <div className="bg-gray-900 rounded-lg overflow-hidden shadow-lg mx-auto" style={{ maxWidth: GAME_WIDTH }}>
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          onClick={() => {
            if (gameState === 'ready') startGame()
            else if (gameState === 'gameOver') resetGame()
            else if (gameState === 'won') nextLevel()
          }}
          className="w-full h-auto cursor-pointer touch-none"
          style={{ aspectRatio: `${GAME_WIDTH}/${GAME_HEIGHT}` }}
        />
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center text-gray-600">
        <p>Move your mouse or touch and drag to control the paddle. Break all bricks to win!</p>
        <div className="flex justify-center gap-4 mt-2">
          {BRICK_COLORS.map((color, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
              <span className="text-sm">{BRICK_POINTS[i]} pts</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      {(gameState === 'playing' || gameState === 'gameOver') && (
        <div className="mt-4 text-center">
          <button
            onClick={resetGame}
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Game
          </button>
        </div>
      )}
    </div>
  )
}

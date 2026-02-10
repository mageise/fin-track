import { useState } from 'react'
import { ArrowLeft, RotateCcw, CheckCircle, XCircle, Clock } from 'lucide-react'

interface FinanceQuizProps {
  onBack: () => void
  onScoreUpdate: (score: number) => void
  highScore: number
}

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: "What does 'FIRE' stand for in personal finance?",
    options: ["Financial Independence, Retire Early", "Fast Investment Returns Everyday", "Fiscal Income Revenue Estimate", "Financial Investment Risk Evaluation"],
    correctAnswer: 0,
    explanation: "FIRE stands for Financial Independence, Retire Early - a movement focused on extreme savings and investment."
  },
  {
    id: 2,
    question: "What is the recommended emergency fund amount?",
    options: ["1 month of expenses", "3-6 months of expenses", "12 months of expenses", "$1,000"],
    correctAnswer: 1,
    explanation: "Financial experts recommend having 3-6 months of expenses saved in an emergency fund."
  },
  {
    id: 3,
    question: "What is compound interest?",
    options: ["Interest on the principal only", "Interest on both principal and accumulated interest", "A type of bank account", "Interest that compounds daily"],
    correctAnswer: 1,
    explanation: "Compound interest is interest calculated on both the initial principal and the accumulated interest from previous periods."
  },
  {
    id: 4,
    question: "What is diversification in investing?",
    options: ["Putting all money in one stock", "Spreading investments across different assets", "Investing only in bonds", "Keeping money in cash"],
    correctAnswer: 1,
    explanation: "Diversification means spreading investments across various assets to reduce risk."
  },
  {
    id: 5,
    question: "What is a 401(k)?",
    options: ["A type of credit card", "A tax-advantaged retirement account", "A government bond", "A savings account"],
    correctAnswer: 1,
    explanation: "A 401(k) is an employer-sponsored retirement savings plan with tax advantages."
  },
  {
    id: 6,
    question: "What is the rule of 72?",
    options: ["A basketball rule", "A way to estimate investment doubling time", "A tax regulation", "A budgeting method"],
    correctAnswer: 1,
    explanation: "The rule of 72 estimates how long it takes to double your money: 72 divided by the interest rate."
  },
  {
    id: 7,
    question: "What is an ETF?",
    options: ["Electronic Transfer Fund", "Exchange-Traded Fund", "Estimated Tax Form", "Enhanced Treasury Fund"],
    correctAnswer: 1,
    explanation: "An ETF (Exchange-Traded Fund) is a basket of securities that trades on an exchange like a stock."
  },
  {
    id: 8,
    question: "What is dollar-cost averaging?",
    options: ["Investing all money at once", "Investing fixed amounts at regular intervals", "Counting dollars", "Currency exchange"],
    correctAnswer: 1,
    explanation: "Dollar-cost averaging is investing a fixed amount regularly, regardless of market conditions."
  },
  {
    id: 9,
    question: "What is a bear market?",
    options: ["A market with rising prices", "A market with falling prices (20%+ decline)", "A market with no changes", "A market with animals"],
    correctAnswer: 1,
    explanation: "A bear market is when prices fall 20% or more from recent highs."
  },
  {
    id: 10,
    question: "What is an IPO?",
    options: ["Initial Public Offering", "International Profit Organization", "Internal Purchase Order", "Investment Portfolio Option"],
    correctAnswer: 0,
    explanation: "IPO (Initial Public Offering) is when a private company first sells shares to the public."
  },
  {
    id: 11,
    question: "What is the S&P 500?",
    options: ["A savings account", "An index of 500 large US companies", "A government bond", "A cryptocurrency"],
    correctAnswer: 1,
    explanation: "The S&P 500 is a stock market index tracking 500 of the largest US publicly traded companies."
  },
  {
    id: 12,
    question: "What is liquidity?",
    options: ["How easily an asset can be converted to cash", "The amount of water in investments", "The speed of transactions", "The total value of assets"],
    correctAnswer: 0,
    explanation: "Liquidity refers to how quickly and easily an asset can be converted to cash without losing value."
  },
  {
    id: 13,
    question: "What is inflation?",
    options: ["A decrease in prices", "An increase in prices and decrease in purchasing power", "A type of investment", "A banking fee"],
    correctAnswer: 1,
    explanation: "Inflation is the rate at which the general level of prices rises and purchasing power falls."
  },
  {
    id: 14,
    question: "What is a bond?",
    options: ["A share of company ownership", "A loan to a company or government", "A type of savings account", "A currency exchange"],
    correctAnswer: 1,
    explanation: "A bond is a fixed-income investment where you lend money to an entity in exchange for periodic interest payments."
  },
  {
    id: 15,
    question: "What is net worth?",
    options: ["Total income", "Assets minus liabilities", "Monthly expenses", "Annual salary"],
    correctAnswer: 1,
    explanation: "Net worth is calculated by subtracting your liabilities (debts) from your assets."
  },
  {
    id: 16,
    question: "What is a bull market?",
    options: ["A market with declining prices", "A market with rising prices", "A market with no changes", "A market for cattle"],
    correctAnswer: 1,
    explanation: "A bull market is a financial market where prices are rising or expected to rise."
  },
  {
    id: 17,
    question: "What is the 50/30/20 rule?",
    options: ["50% needs, 30% wants, 20% savings", "50% stocks, 30% bonds, 20% cash", "50% income tax", "A gambling strategy"],
    correctAnswer: 0,
    explanation: "The 50/30/20 rule suggests spending 50% on needs, 30% on wants, and saving 20%."
  },
  {
    id: 18,
    question: "What is a Roth IRA?",
    options: ["A traditional retirement account", "A retirement account with tax-free withdrawals", "A savings bond", "A credit card"],
    correctAnswer: 1,
    explanation: "A Roth IRA is funded with after-tax dollars, allowing tax-free growth and withdrawals in retirement."
  },
  {
    id: 19,
    question: "What is asset allocation?",
    options: ["Distributing investments among different asset categories", "Buying only stocks", "Selling all investments", "Saving cash"],
    correctAnswer: 0,
    explanation: "Asset allocation is distributing investments among stocks, bonds, cash, and other categories based on goals and risk tolerance."
  },
  {
    id: 20,
    question: "What is a dividend?",
    options: ["A payment from company profits to shareholders", "A type of tax", "A bank fee", "A loan payment"],
    correctAnswer: 0,
    explanation: "A dividend is a portion of a company's profits distributed to shareholders."
  },
  {
    id: 21,
    question: "What does 'pay yourself first' mean?",
    options: ["Take a salary from your business", "Save money before paying bills", "Pay all bills first", "Invest in yourself"],
    correctAnswer: 1,
    explanation: "'Pay yourself first' means automatically routing savings from each paycheck before spending on anything else."
  },
  {
    id: 22,
    question: "What is a stock?",
    options: ["A loan to a company", "Ownership share in a company", "A government bond", "A savings account"],
    correctAnswer: 1,
    explanation: "A stock represents ownership in a company and a claim on part of its assets and earnings."
  },
  {
    id: 23,
    question: "What is the difference between a traditional IRA and Roth IRA?",
    options: ["Timing of tax benefits", "Nothing, they are the same", "One is for stocks, one for bonds", "One is international"],
    correctAnswer: 0,
    explanation: "Traditional IRAs give tax breaks when contributing; Roth IRAs give tax breaks when withdrawing in retirement."
  },
  {
    id: 24,
    question: "What is market capitalization?",
    options: ["Total value of a company's shares", "The number of employees", "Annual revenue", "The company's age"],
    correctAnswer: 0,
    explanation: "Market capitalization is the total value of a company's outstanding shares (share price × number of shares)."
  },
  {
    id: 25,
    question: "What is a credit score?",
    options: ["Your salary score", "A number representing creditworthiness", "A savings goal", "An investment return"],
    correctAnswer: 1,
    explanation: "A credit score is a number representing your creditworthiness, based on your credit history."
  },
]

export function FinanceQuiz({ onBack, onScoreUpdate, highScore }: FinanceQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [isAnswered, setIsAnswered] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)

  const handleAnswer = (answerIndex: number) => {
    if (isAnswered) return

    setSelectedAnswer(answerIndex)
    setIsAnswered(true)
    setShowExplanation(true)

    const isCorrect = answerIndex === QUESTIONS[currentQuestion].correctAnswer
    if (isCorrect) {
      const newStreak = streak + 1
      setStreak(newStreak)
      setMaxStreak(Math.max(maxStreak, newStreak))
      // Points: 100 base + streak bonus
      const points = 100 + (newStreak - 1) * 10
      const newScore = score + points
      setScore(newScore)
      onScoreUpdate(newScore)
    } else {
      setStreak(0)
    }
  }

  const nextQuestion = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
      setIsAnswered(false)
    } else {
      setIsComplete(true)
    }
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setScore(0)
    setSelectedAnswer(null)
    setShowExplanation(false)
    setIsAnswered(false)
    setIsComplete(false)
    setStreak(0)
    setMaxStreak(0)
  }

  if (isComplete) {
    const percentage = Math.round((score / (QUESTIONS.length * 100)) * 100)
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Games
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Quiz Complete!</h2>
          <div className="text-6xl font-bold text-emerald-600 mb-2">{score}</div>
          <div className="text-gray-600 mb-6">Total Points</div>
          
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-emerald-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-emerald-600">{percentage}%</div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{maxStreak}</div>
              <div className="text-sm text-gray-600">Best Streak</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{highScore}</div>
              <div className="text-sm text-gray-600">All-Time Best</div>
            </div>
          </div>

          <button
            onClick={resetQuiz}
            className="flex items-center gap-2 mx-auto px-6 py-3 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 text-lg"
          >
            <RotateCcw className="w-5 h-5" />
            Play Again
          </button>
        </div>
      </div>
    )
  }

  const question = QUESTIONS[currentQuestion]
  const isCorrect = selectedAnswer === question.correctAnswer

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
            <div className="text-sm text-gray-600">Question</div>
            <div className="text-xl font-bold text-gray-800">{currentQuestion + 1} / {QUESTIONS.length}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Score</div>
            <div className="text-2xl font-bold text-emerald-600">{score}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Best</div>
            <div className="text-2xl font-bold text-purple-600">{highScore}</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%` }}
          />
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-1 mt-2 text-orange-600">
            <Clock className="w-4 h-4" />
            <span className="font-semibold">{streak} streak! (+{streak * 10} bonus)</span>
          </div>
        )}
      </div>

      {/* Question */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">{question.question}</h2>

        <div className="space-y-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={isAnswered}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                isAnswered
                  ? index === question.correctAnswer
                    ? 'bg-green-100 border-green-500 text-green-800'
                    : index === selectedAnswer
                    ? 'bg-red-100 border-red-500 text-red-800'
                    : 'bg-gray-50 border-gray-200 text-gray-500'
                  : 'bg-gray-50 border-gray-200 hover:border-emerald-500 hover:bg-emerald-50'
              }`}
            >
              <div className="flex items-center gap-3">
                {isAnswered && index === question.correctAnswer && (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                )}
                {isAnswered && index === selectedAnswer && index !== question.correctAnswer && (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span>{option}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div className={`mt-6 p-4 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className={`font-semibold mb-2 ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
              {isCorrect ? '✓ Correct!' : '✗ Wrong!'}
            </div>
            <p className="text-gray-700">{question.explanation}</p>
            <button
              onClick={nextQuestion}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
            >
              {currentQuestion < QUESTIONS.length - 1 ? 'Next Question →' : 'See Results'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

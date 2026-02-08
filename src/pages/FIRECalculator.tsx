import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Target,
  ArrowLeft,
  Calculator,
  TrendingUp,
  DollarSign,
  Calendar,
  PiggyBank,
  Flame,
} from 'lucide-react'
import { useFinancial } from '../contexts/FinancialContext'
import { Card } from '../components/Card'
import { useTranslation } from '../hooks/useTranslation'
import { useFormatters } from '../hooks/useFormatters'

interface FIREResult {
  fireNumber: number
  yearsToFire: number
  monthlySavingsNeeded: number
  progressPercentage: number
  projectedFireDate: Date
}

export function FIRECalculator() {
  const { t } = useTranslation()
  const { formatCurrency, formatNumber } = useFormatters()
  const { netWorth } = useFinancial()

  // Input states
  const [annualExpenses, setAnnualExpenses] = useState(50000)
  const [withdrawalRate, setWithdrawalRate] = useState(4)
  const [expectedReturn, setExpectedReturn] = useState(7)
  const [monthlySavings, setMonthlySavings] = useState(2000)
  const [currentAge, setCurrentAge] = useState(30)

  // Calculate FIRE results
  const fireResult: FIREResult = useMemo(() => {
    const fireNumber = (annualExpenses * 100) / withdrawalRate
    const monthlyReturn = expectedReturn / 100 / 12
    const currentNetWorth = netWorth
    
    // Calculate years to FIRE using compound interest formula
    // FV = PV * (1 + r)^n + PMT * (((1 + r)^n - 1) / r)
    // Solve for n
    const targetAmount = fireNumber
    const monthlyContribution = monthlySavings
    
    let yearsToFire = 0
    let projectedAmount = currentNetWorth
    
    if (currentNetWorth >= targetAmount) {
      yearsToFire = 0
    } else {
      while (projectedAmount < targetAmount && yearsToFire < 100) {
        yearsToFire += 1 / 12
        projectedAmount = projectedAmount * (1 + monthlyReturn) + monthlyContribution
      }
    }

    // Calculate required monthly savings to reach FIRE in different timeframes
    const monthsToFire = yearsToFire * 12
    const monthlySavingsNeeded = monthsToFire > 0
      ? (targetAmount - currentNetWorth * Math.pow(1 + monthlyReturn, monthsToFire)) / 
        ((Math.pow(1 + monthlyReturn, monthsToFire) - 1) / monthlyReturn)
      : 0

    const progressPercentage = Math.min((currentNetWorth / fireNumber) * 100, 100)
    
    const projectedFireDate = new Date()
    projectedFireDate.setFullYear(projectedFireDate.getFullYear() + Math.floor(yearsToFire))
    projectedFireDate.setMonth(projectedFireDate.getMonth() + Math.floor((yearsToFire % 1) * 12))

    return {
      fireNumber,
      yearsToFire,
      monthlySavingsNeeded: Math.max(0, monthlySavingsNeeded),
      progressPercentage,
      projectedFireDate,
    }
  }, [annualExpenses, withdrawalRate, expectedReturn, monthlySavings, netWorth])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-cyan-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('backToToolbox')}</span>
          </Link>
          <div className="flex items-center gap-3">
            <Flame className="w-10 h-10 text-cyan-600" />
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">{t('fireCalculatorTitle')}</h1>
              <p className="text-gray-600">{t('fireCalculatorSubtitle')}</p>
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('currentNetWorth')}</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(netWorth)}</p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-100 rounded-lg">
                <Target className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('fireNumberLabel')}</p>
                <p className="text-2xl font-bold text-cyan-600">{formatCurrency(fireResult.fireNumber)}</p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('progressToFireLabel')}</p>
                <p className="text-2xl font-bold text-purple-600">{formatNumber(fireResult.progressPercentage)}%</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card title={t('yourFireParameters')} className="h-fit">
            <div className="space-y-6">
              {/* Annual Expenses */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('annualExpensesLabel')}
                </label>
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={annualExpenses}
                    onChange={(e) => setAnnualExpenses(Number(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    min="0"
                    step="1000"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {t('annualExpensesHint')}
                </p>
              </div>

              {/* Withdrawal Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('withdrawalRateLabel')}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={withdrawalRate}
                    onChange={(e) => setWithdrawalRate(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="w-16 text-right font-medium">{withdrawalRate}%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {t('withdrawalRateHint')}
                </p>
              </div>

              {/* Expected Return */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('expectedReturnLabel')}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="15"
                    step="0.5"
                    value={expectedReturn}
                    onChange={(e) => setExpectedReturn(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="w-16 text-right font-medium">{expectedReturn}%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {t('expectedReturnHint')}
                </p>
              </div>

              {/* Monthly Savings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('monthlySavingsLabel')}
                </label>
                <div className="flex items-center gap-3">
                  <PiggyBank className="w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={monthlySavings}
                    onChange={(e) => setMonthlySavings(Number(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    min="0"
                    step="100"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {t('monthlySavingsHint')}
                </p>
              </div>

              {/* Current Age */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('currentAgeLabel')}
                </label>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={currentAge}
                    onChange={(e) => setCurrentAge(Number(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    min="18"
                    max="100"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {t('currentAgeHint')}
                </p>
              </div>
            </div>
          </Card>

          {/* Results Section */}
          <div className="space-y-6">
            <Card title={t('yourFireJourney')} className="bg-gradient-to-br from-cyan-50 to-blue-50">
              <div className="space-y-6">
                {/* Years to FIRE */}
                <div className="text-center">
                  <p className="text-gray-600 mb-2">{t('yearsToFireLabel')}</p>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-6xl font-bold text-cyan-600">
                      {fireResult.yearsToFire < 1
                        ? '< 1'
                        : formatNumber(fireResult.yearsToFire)}
                    </span>
                    <span className="text-xl text-gray-500">{t('years')}</span>
                  </div>
                </div>

                {/* FIRE Age */}
                <div className="text-center">
                  <p className="text-gray-600 mb-1">{t('fireAgeLabel')}</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {currentAge + Math.ceil(fireResult.yearsToFire)}
                  </p>
                </div>

                {/* Projected Date */}
                <div className="text-center">
                  <p className="text-gray-600 mb-1">{t('projectedFireDateLabel')}</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {fireResult.projectedFireDate.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                    })}
                  </p>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">{t('progressToFireLabel')}</span>
                    <span className="font-medium">{formatNumber(fireResult.progressPercentage)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${fireResult.progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Monthly Savings Analysis */}
            <Card title={t('monthlySavingsAnalysis')}>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">{t('currentMonthlySavings')}</p>
                    <p className="text-xl font-semibold text-gray-800">{formatCurrency(monthlySavings)}</p>
                  </div>
                  <PiggyBank className="w-8 h-8 text-green-500" />
                </div>

                {fireResult.monthlySavingsNeeded > monthlySavings && (
                  <div className="flex justify-between items-center p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <div>
                      <p className="text-sm text-amber-700">{t('requiredForTimeline')}</p>
                      <p className="text-xl font-semibold text-amber-800">
                        {formatCurrency(fireResult.monthlySavingsNeeded)}
                      </p>
                    </div>
                    <Calculator className="w-8 h-8 text-amber-500" />
                  </div>
                )}

                <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                  <p className="text-sm text-cyan-800 mb-2">
                    <strong>{t('insightLabel')}:</strong> {t('fireInsightCurrent').replace('{{savings}}', formatCurrency(monthlySavings)).replace('{{years}}', formatNumber(fireResult.yearsToFire))}
                  </p>
                  {fireResult.monthlySavingsNeeded > monthlySavings && (
                    <p className="text-sm text-cyan-700">
                      {t('fireInsightIncrease').replace('{{amount}}', formatCurrency(fireResult.monthlySavingsNeeded))}
                    </p>
                  )}
                </div>
              </div>
            </Card>

            {/* FIRE Rules Explanation */}
            <Card title={t('understandingFireTitle')}>
              <div className="space-y-3 text-sm text-gray-600">
                <p>
                  {t('fireNumberExplanation')}
                </p>
                <p>
                  {t('rule4Explanation')}
                </p>
                <p>
                  {t('mathExplanation')}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

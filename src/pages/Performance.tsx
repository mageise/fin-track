import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Activity,
  PieChart as PieChartIcon,
} from 'lucide-react'
import { useFinancial } from '../contexts/FinancialContext'
import { Card } from '../components/Card'
import { CollapsibleSection } from '../components/CollapsibleSection'
import { INVESTMENT_TYPES, INVESTMENT_ACCOUNTS } from '../types/financial'
import { useTranslation } from '../hooks/useTranslation'
import { useFormatters } from '../hooks/useFormatters'
import { generateAvatarSVG } from '../utils/avatar'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

export function Performance() {
  const { t } = useTranslation()
  const { formatCurrency } = useFormatters()
  const { state, cashBalance } = useFinancial()

  // Calculate total gain/loss
  const totalGain = useMemo(() => {
    return state.investments.reduce((sum, inv) => {
      return sum + (inv.shares * inv.currentPrice) - (inv.shares * inv.costBasis)
    }, 0)
  }, [state.investments])

  // Calculate total return percentage
  const totalCost = useMemo(() => {
    return state.investments.reduce((sum, inv) => sum + (inv.shares * inv.costBasis), 0)
  }, [state.investments])
  const returnPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0

  // Calculate performance data for best/worst performers
  const performanceData = useMemo(() => {
    return state.investments.map((inv) => {
      const currentValue = inv.shares * inv.currentPrice
      const costBasis = inv.shares * inv.costBasis
      const gain = currentValue - costBasis
      const gainPercent = costBasis > 0 ? (gain / costBasis) * 100 : 0
      return {
        symbol: inv.symbol,
        name: inv.name,
        gain,
        gainPercent,
      }
    })
  }, [state.investments])

  const bestPerformer = useMemo(() => {
    return performanceData.length > 0
      ? performanceData.reduce((best, curr) => curr.gainPercent > best.gainPercent ? curr : best)
      : { symbol: '-', name: t('noInvestmentsYet'), gainPercent: 0 }
  }, [performanceData, t])

  const worstPerformer = useMemo(() => {
    return performanceData.length > 0
      ? performanceData.reduce((worst, curr) => curr.gainPercent < worst.gainPercent ? curr : worst)
      : { symbol: '-', name: t('noInvestmentsYet'), gainPercent: 0 }
  }, [performanceData, t])

  // Calculate allocation by type
  const allocationByType = useMemo(() => {
    const typeMap = new Map<string, number>()
    state.investments.forEach((inv) => {
      const value = inv.shares * inv.currentPrice
      const current = typeMap.get(inv.type) || 0
      typeMap.set(inv.type, current + value)
    })
    const result: Array<{ name: string; value: number }> = []
    // Add cash first (so it gets the green color)
    if (cashBalance > 0) {
      result.push({ name: 'Cash', value: cashBalance })
    }
    // Add investments
    typeMap.forEach((value, type) => {
      result.push({
        name: t(INVESTMENT_TYPES.find((item) => item.value === type)?.translationKey || 'investmentType_stock'),
        value,
      })
    })
    return result
  }, [state.investments, cashBalance, t])

  // Calculate allocation by account
  const allocationByAccount = useMemo(() => {
    const accountMap = new Map<string, number>()
    state.investments.forEach((inv) => {
      const value = inv.shares * inv.currentPrice
      const current = accountMap.get(inv.account) || 0
      accountMap.set(inv.account, current + value)
    })
    const result: Array<{ name: string; value: number }> = []
    // Add cash first (so it gets the green color)
    if (cashBalance > 0) {
      result.push({ name: 'Cash Accounts', value: cashBalance })
    }
    // Add investment accounts
    accountMap.forEach((value, account) => {
      result.push({
        name: t(INVESTMENT_ACCOUNTS.find((item) => item.value === account)?.translationKey || 'accountType_taxable'),
        value,
      })
    })
    return result
  }, [state.investments, cashBalance, t])

  // Calculate performance data for bar chart
  const chartPerformanceData = useMemo(() => {
    return state.investments.map((inv) => {
      const currentValue = inv.shares * inv.currentPrice
      const costBasis = inv.shares * inv.costBasis
      const gain = currentValue - costBasis
      const gainPercent = costBasis > 0 ? (gain / costBasis) * 100 : 0
      return {
        symbol: inv.symbol,
        gain,
        gainPercent,
      }
    }).sort((a, b) => b.gain - a.gain)
  }, [state.investments])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('backToToolbox')}</span>
          </Link>
          <div className="flex items-center gap-3">
            <Activity className="w-10 h-10 text-amber-600" />
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">{t('tool_performance')}</h1>
              <p className="text-gray-600">{t('portfolioSubtitle')}</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Gain/Loss */}
          <Card>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${totalGain >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                {totalGain >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-green-600" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-600" />
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('totalGainLoss')}</p>
                <p className={`text-2xl font-bold ${totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalGain >= 0 ? '+' : ''}{formatCurrency(totalGain)}
                </p>
              </div>
            </div>
          </Card>

          {/* Total Return % */}
          <Card>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${returnPercent >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                {returnPercent >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-green-600" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-600" />
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('totalReturn')}</p>
                <p className={`text-2xl font-bold ${returnPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {returnPercent >= 0 ? '+' : ''}{returnPercent.toFixed(2)}%
                </p>
              </div>
            </div>
          </Card>

          {/* Best Performer */}
          <Card>
            <div className="flex items-center gap-3">
              <img
                src={generateAvatarSVG(bestPerformer.symbol)}
                alt={bestPerformer.symbol}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p className="text-sm text-gray-600">{t('bestPerformer')}</p>
                <p className="font-semibold text-gray-800 truncate max-w-[120px]">{bestPerformer.name}</p>
                <p className={`text-sm ${bestPerformer.gainPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {bestPerformer.gainPercent >= 0 ? '+' : ''}{bestPerformer.gainPercent.toFixed(2)}%
                </p>
              </div>
            </div>
          </Card>

          {/* Worst Performer */}
          <Card>
            <div className="flex items-center gap-3">
              <img
                src={generateAvatarSVG(worstPerformer.symbol)}
                alt={worstPerformer.symbol}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p className="text-sm text-gray-600">{t('worstPerformer')}</p>
                <p className="font-semibold text-gray-800 truncate max-w-[120px]">{worstPerformer.name}</p>
                <p className={`text-sm ${worstPerformer.gainPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {worstPerformer.gainPercent >= 0 ? '+' : ''}{worstPerformer.gainPercent.toFixed(2)}%
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Portfolio Charts Section */}
        {state.investments.length > 0 && (
          <CollapsibleSection
            title={t('portfolioCharts')}
            subtitle={t('portfolioChartsSubtitle')}
            icon={PieChartIcon}
            iconColor="text-amber-600"
            initiallyExpanded={true}
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Allocation by Type */}
              <Card title={t('allocationByType')}>
                <div style={{ width: '100%', height: 250 }}>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={allocationByType}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {allocationByType.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => typeof value === 'number' ? formatCurrency(value) : String(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Allocation by Account */}
              <Card title={t('allocationByAccount')}>
                <div style={{ width: '100%', height: 250 }}>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={allocationByAccount}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {allocationByAccount.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => typeof value === 'number' ? formatCurrency(value) : String(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Performance by Holding */}
              <Card title={t('gainLossByHolding')}>
                <div style={{ width: '100%', height: 250 }}>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartPerformanceData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tickFormatter={(value) => `$${Number(value)}`} />
                      <YAxis dataKey="symbol" type="category" width={60} />
                      <Tooltip formatter={(value) => typeof value === 'number' ? formatCurrency(value) : String(value)} />
                      <Bar
                        dataKey="gain"
                        fill="#3b82f6"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          </CollapsibleSection>
        )}
      </div>
    </div>
  )
}

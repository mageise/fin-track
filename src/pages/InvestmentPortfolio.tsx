import { useState, useMemo } from 'react'
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
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  Trash2,
  Edit2,
  LineChart,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  Upload,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Banknote,
} from 'lucide-react'
import { useFinancial } from '../contexts/FinancialContext'
import { Card } from '../components/Card'
import { InvestmentForm } from '../components/InvestmentForm'
import { CSVImportDialog } from '../components/CSVImportDialog'
import { CashAccountForm } from '../components/CashAccountForm'
import { INVESTMENT_TYPES, INVESTMENT_ACCOUNTS, type Investment } from '../types/financial'
import { fetchMultiplePrices, type BatchUpdateResult } from '../services/yahooFinance'
import { useTranslation } from '../hooks/useTranslation'
import { useFormatters } from '../hooks/useFormatters'
import { generateAvatarSVG } from '../utils/avatar'

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

function formatRelativeTime(timestamp: string | null): string {
  if (!timestamp) return 'Never'

  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'Just now'
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`
  if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`
  if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function InvestmentPortfolio() {
  const { t } = useTranslation()
  const { formatCurrency, formatNumber } = useFormatters()
  const {
    state,
    deleteInvestment,
    bulkUpdateInvestmentPrices,
    setLastPriceUpdate,
    totalInvestmentValue,
    totalInvestmentGain,
    totalCashAmount,
    totalPortfolioValue,
    lastPriceUpdate,
  } = useFinancial()

  const [showForm, setShowForm] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [editingInvestment, setEditingInvestment] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updatingPriceId, setUpdatingPriceId] = useState<string | null>(null)
  const [updateResult, setUpdateResult] = useState<BatchUpdateResult | null>(null)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

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
    if (totalCashAmount > 0) {
      result.push({ name: 'Cash', value: totalCashAmount })
    }
    // Add investments
    typeMap.forEach((value, type) => {
      result.push({
        name: INVESTMENT_TYPES.find((t) => t.value === type)?.label || type,
        value,
      })
    })
    return result
  }, [state.investments, totalCashAmount])

  // Calculate allocation by account
  const allocationByAccount = useMemo(() => {
    const accountMap = new Map<string, number>()
    state.investments.forEach((inv) => {
      const value = inv.shares * inv.currentPrice
      const current = accountMap.get(inv.account) || 0
      accountMap.set(inv.account, current + value)
    })
    // Add cash accounts
    let cashTotal = 0
    state.cashAccounts.forEach((account) => {
      cashTotal += account.amount
    })
    const result: Array<{ name: string; value: number }> = []
    // Add cash first (so it gets the green color)
    if (cashTotal > 0) {
      result.push({ name: 'Cash Accounts', value: cashTotal })
    }
    // Add investment accounts
    accountMap.forEach((value, account) => {
      result.push({
        name: INVESTMENT_ACCOUNTS.find((a) => a.value === account)?.label || account,
        value,
      })
    })
    return result
  }, [state.investments, state.cashAccounts])

  // Calculate performance data for bar chart
  const performanceData = useMemo(() => {
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

  // Handle price update for single investment
  const handleUpdateSinglePrice = async (investment: Investment) => {
    setUpdatingPriceId(investment.id)
    setUpdateError(null)
    
    try {
      const result = await fetchMultiplePrices([investment.symbol])
      
      if (result.successful.length > 0 && result.successful[0].price) {
        bulkUpdateInvestmentPrices([{
          symbol: investment.symbol,
          price: result.successful[0].price,
        }])
        setLastPriceUpdate(new Date().toISOString())
      } else if (result.failed.length > 0) {
        setUpdateError(`${investment.symbol}: ${result.failed[0].error}`)
      }
    } catch (error) {
      setUpdateError(error instanceof Error ? error.message : 'Failed to update price')
    } finally {
      setUpdatingPriceId(null)
    }
  }

  // Handle price update
  const handleUpdatePrices = async () => {
    if (state.investments.length === 0) return
    
    setIsUpdating(true)
    setUpdateResult(null)
    setUpdateError(null)
    
    try {
      const symbols = state.investments.map(inv => inv.symbol)
      const result = await fetchMultiplePrices(symbols)
      
      // Update successful prices in context
      const successfulUpdates = result.successful.map(r => ({
        symbol: r.symbol,
        price: r.price!,
      }))
      
      if (successfulUpdates.length > 0) {
        bulkUpdateInvestmentPrices(successfulUpdates)
        setLastPriceUpdate(new Date().toISOString())
      }
      
      setUpdateResult(result)
      
      // Clear success message after 5 seconds
      if (result.failed.length === 0) {
        setTimeout(() => setUpdateResult(null), 5000)
      }
    } catch (error) {
      setUpdateError(error instanceof Error ? error.message : 'Failed to update prices')
    } finally {
      setIsUpdating(false)
    }
  }

  // Handle column sort
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  // Get sorted investments
  const sortedInvestments = useMemo(() => {
    if (!sortColumn) return state.investments

    return [...state.investments].sort((a, b) => {
      let valueA: number | string
      let valueB: number | string

      switch (sortColumn) {
        case 'symbol':
          valueA = a.symbol.toLowerCase()
          valueB = b.symbol.toLowerCase()
          break
        case 'name':
          valueA = a.name.toLowerCase()
          valueB = b.name.toLowerCase()
          break
        case 'type':
          valueA = a.type
          valueB = b.type
          break
        case 'account':
          valueA = a.account
          valueB = b.account
          break
        case 'shares':
          valueA = a.shares
          valueB = b.shares
          break
        case 'cost':
          valueA = a.costBasis
          valueB = b.costBasis
          break
        case 'price':
          valueA = a.currentPrice
          valueB = b.currentPrice
          break
        case 'value':
          valueA = a.shares * a.currentPrice
          valueB = b.shares * b.currentPrice
          break
        case 'gain':
          valueA = (a.shares * a.currentPrice) - (a.shares * a.costBasis)
          valueB = (b.shares * b.currentPrice) - (b.shares * b.costBasis)
          break
        default:
          return 0
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection === 'asc' 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA)
      }

      return sortDirection === 'asc' 
        ? (valueA as number) - (valueB as number)
        : (valueB as number) - (valueA as number)
    })
  }, [state.investments, sortColumn, sortDirection])

  // Status message component
  const StatusMessage = () => {
    if (updateError) {
      return (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
          <AlertCircle className="w-5 h-5" />
          <span>{t('errorLabel')}: {updateError}</span>
        </div>
      )
    }
    
    if (updateResult) {
      const total = updateResult.successful.length + updateResult.failed.length
      const allSuccess = updateResult.failed.length === 0
      const allFailed = updateResult.successful.length === 0
      
      if (allSuccess) {
        return (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 mb-4">
            <CheckCircle className="w-5 h-5" />
            <span>{t('successUpdatedAllPrices')} ({updateResult.successful.length})</span>
          </div>
        )
      } else if (allFailed) {
        return (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 mb-4">
            <AlertCircle className="w-5 h-5" />
            <span>{t('failedUpdateAllPrices')}</span>
          </div>
        )
      } else {
        const failedSymbols = updateResult.failed.map(f => f.symbol).join(', ')
        return (
          <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 mb-4">
            <AlertCircle className="w-5 h-5" />
            <span>
              {t('updatedXofYPrices').replace('{{success}}', String(updateResult.successful.length)).replace('{{total}}', String(total))}. 
              {t('failedSymbols')}: {failedSymbols}
            </span>
          </div>
        )
      }
    }
    
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('backToToolbox')}</span>
          </Link>
          <div className="flex items-center gap-3">
            <LineChart className="w-10 h-10 text-purple-600" />
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">{t('portfolioTitle')}</h1>
              <p className="text-gray-600">{t('portfolioSubtitle')}</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Wallet className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('totalPortfolioValue')}</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalPortfolioValue)}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <LineChart className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('investedValue')}</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalInvestmentValue)}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('cashOnHand')}</p>
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalCashAmount)}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-lg ${totalInvestmentGain >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                {totalInvestmentGain >= 0 ? (
                  <TrendingUp className={`w-6 h-6 ${totalInvestmentGain >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-600" />
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('totalGainLoss')}</p>
                <p className={`text-2xl font-bold ${totalInvestmentGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalInvestmentGain >= 0 ? '+' : ''}{formatCurrency(totalInvestmentGain)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Row */}
        {state.investments.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
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
                  <BarChart data={performanceData} layout="vertical">
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
        )}

        {/* Status Messages */}
        <StatusMessage />

        {/* Cash Accounts Section */}
        <div className="mb-8">
          <CashAccountsSection />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('addInvestment')}
          </button>

          <button
            onClick={() => setShowImportDialog(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            {t('importInvestments')}
          </button>

          {/* Update Button + Timestamp Group */}
          {state.investments.length > 0 && (
            <div className="flex items-center gap-4 ml-auto">
              {/* Last Updated Timestamp */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{t('lastUpdated')}: {formatRelativeTime(lastPriceUpdate)}</span>
              </div>

              <button
                onClick={handleUpdatePrices}
                disabled={isUpdating}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t('updating')}
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    {t('updatePrices')}
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Investment Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">{t('addNewInvestment')}</h2>
              <InvestmentForm onClose={() => setShowForm(false)} />
            </div>
          </div>
        )}

        {/* CSV Import Dialog */}
        {showImportDialog && (
          <CSVImportDialog onClose={() => setShowImportDialog(false)} />
        )}

        {/* Investments Table */}
        <Card title={`${t('yourHoldings')} (${state.investments.length})`} className="overflow-hidden">
          {state.investments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th 
                      className="text-left px-4 py-3 text-sm font-medium text-gray-600 cursor-pointer hover:text-purple-600 hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-1">
                        {t('nameHeader')}
                        {sortColumn === 'name' && (
                          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                        {sortColumn !== 'name' && <ArrowUpDown className="w-3 h-3 opacity-30" />}
                      </div>
                    </th>
                    <th 
                      className="text-left px-4 py-3 text-sm font-medium text-gray-600 cursor-pointer hover:text-purple-600 hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('type')}
                    >
                      <div className="flex items-center gap-1">
                        {t('typeHeader')}
                        {sortColumn === 'type' && (
                          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                        {sortColumn !== 'type' && <ArrowUpDown className="w-3 h-3 opacity-30" />}
                      </div>
                    </th>
                    <th 
                      className="text-left px-4 py-3 text-sm font-medium text-gray-600 cursor-pointer hover:text-purple-600 hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('account')}
                    >
                      <div className="flex items-center gap-1">
                        {t('accountHeader')}
                        {sortColumn === 'account' && (
                          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                        {sortColumn !== 'account' && <ArrowUpDown className="w-3 h-3 opacity-30" />}
                      </div>
                    </th>
                    <th 
                      className="text-right px-4 py-3 text-sm font-medium text-gray-600 cursor-pointer hover:text-purple-600 hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('shares')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {t('sharesHeader')}
                        {sortColumn === 'shares' && (
                          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                        {sortColumn !== 'shares' && <ArrowUpDown className="w-3 h-3 opacity-30" />}
                      </div>
                    </th>
                    <th 
                      className="text-right px-4 py-3 text-sm font-medium text-gray-600 cursor-pointer hover:text-purple-600 hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('cost')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {t('costHeader')}
                        {sortColumn === 'cost' && (
                          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                        {sortColumn !== 'cost' && <ArrowUpDown className="w-3 h-3 opacity-30" />}
                      </div>
                    </th>
                    <th 
                      className="text-right px-4 py-3 text-sm font-medium text-gray-600 cursor-pointer hover:text-purple-600 hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('price')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {t('priceHeader')}
                        {sortColumn === 'price' && (
                          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                        {sortColumn !== 'price' && <ArrowUpDown className="w-3 h-3 opacity-30" />}
                      </div>
                    </th>
                    <th 
                      className="text-right px-4 py-3 text-sm font-medium text-gray-600 cursor-pointer hover:text-purple-600 hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('value')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {t('valueHeader')}
                        {sortColumn === 'value' && (
                          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                        {sortColumn !== 'value' && <ArrowUpDown className="w-3 h-3 opacity-30" />}
                      </div>
                    </th>
                    <th 
                      className="text-right px-4 py-3 text-sm font-medium text-gray-600 cursor-pointer hover:text-purple-600 hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort('gain')}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {t('gainLossHeader')}
                        {sortColumn === 'gain' && (
                          sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                        )}
                        {sortColumn !== 'gain' && <ArrowUpDown className="w-3 h-3 opacity-30" />}
                      </div>
                    </th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">{t('actionsHeader')}</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedInvestments.map((investment) => {
                    const currentValue = investment.shares * investment.currentPrice
                    const costBasis = investment.shares * investment.costBasis
                    const gain = currentValue - costBasis
                    const gainPercent = costBasis > 0 ? (gain / costBasis) * 100 : 0

                    return (
                      <tr key={investment.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={generateAvatarSVG(investment.symbol)}
                              alt={investment.symbol}
                              className="w-10 h-10 rounded-full"
                              title={investment.symbol}
                            />
                            <div>
                              <div className="font-medium">{investment.name}</div>
                              <div className="text-xs text-gray-500">{investment.symbol}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {INVESTMENT_TYPES.find((t) => t.value === investment.type)?.label}
                        </td>
                        <td className="px-4 py-3">
                          {INVESTMENT_ACCOUNTS.find((a) => a.value === investment.account)?.label}
                        </td>
                        <td className="px-4 py-3 text-right">{formatNumber(investment.shares)}</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(investment.costBasis)}</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(investment.currentPrice)}</td>
                        <td className="px-4 py-3 text-right font-medium">{formatCurrency(currentValue)}</td>
                        <td className={`px-4 py-3 text-right ${gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          <div>{gain >= 0 ? '+' : ''}{formatCurrency(gain)}</div>
                          <div className="text-xs">({gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%)</div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleUpdateSinglePrice(investment)}
                              disabled={updatingPriceId === investment.id}
                              className="p-1 text-gray-600 hover:text-blue-600 transition-colors disabled:opacity-50"
                              title="Update price"
                            >
                              {updatingPriceId === investment.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <RefreshCw className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => setEditingInvestment(investment.id)}
                              className="p-1 text-gray-600 hover:text-purple-600 transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteInvestment(investment.id)}
                              className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>

                        {editingInvestment === investment.id && (
                          <td colSpan={9} className="p-0">
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                              <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                                <h2 className="text-2xl font-bold mb-4">{t('editInvestment')}</h2>
                                <InvestmentForm
                                  investment={investment}
                                  onClose={() => setEditingInvestment(null)}
                                />
                              </div>
                            </div>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <LineChart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">{t('noInvestmentsYet')}</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

// Cash Accounts Section Component
function CashAccountsSection() {
  const { t } = useTranslation()
  const { formatCurrency } = useFormatters()
  const { state, deleteCashAccount, totalCashAmount } = useFinancial()
  const [isExpanded, setIsExpanded] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingAccount, setEditingAccount] = useState<string | null>(null)

  if (state.cashAccounts.length === 0 && !showForm) {
    return (
      <div className="mt-8">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
        >
          <Plus className="w-4 h-4" />
          {t('addCashAccount')}
        </button>
        
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-4">{t('addCashAccount')}</h2>
              <CashAccountForm onClose={() => setShowForm(false)} />
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="mt-8">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full p-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-3">
          <Banknote className="w-6 h-6 text-emerald-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-800">{t('cashAccounts')}</h2>
            <p className="text-sm text-gray-600">{t('cashAccountsSubtitle')}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-2xl font-bold text-emerald-600">{formatCurrency(totalCashAmount)}</span>
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Add Button */}
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('addCashAccount')}
          </button>

          {/* Cash Accounts List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.cashAccounts.map((account) => (
              <Card key={account.id} className="relative">
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg text-gray-800">{account.name}</h3>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditingAccount(account.id)}
                        className="p-1 text-gray-600 hover:text-purple-600 transition-colors"
                        title={t('edit')}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteCashAccount(account.id)}
                        className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                        title={t('delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-2xl font-bold text-emerald-600">{formatCurrency(account.amount)}</p>
                  
                  {account.notes && (
                    <p className="text-sm text-gray-500 mt-2">{account.notes}</p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">{t('addCashAccount')}</h2>
            <CashAccountForm onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}

      {editingAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">{t('editCashAccount')}</h2>
            <CashAccountForm
              account={state.cashAccounts.find((a) => a.id === editingAccount)}
              onClose={() => setEditingAccount(null)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

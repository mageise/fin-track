import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'

import {
  ArrowLeft,
  SquarePlus,
  TrendingUp,
  TrendingDown,
  CircleDollarSign,
  Wallet,
  Trash2,
  Edit2,
  LineChart,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Eye,
  Upload,
  Banknote,
} from 'lucide-react'
import { useFinancial } from '../contexts/FinancialContext'
import { Card } from '../components/Card'

import { InvestmentForm } from '../components/InvestmentForm'
import { CSVImportDialog } from '../components/CSVImportDialog'

import { WatchlistForm } from '../components/WatchlistForm'
import { INVESTMENT_TYPES, INVESTMENT_ACCOUNTS, type Investment, type WatchlistItem } from '../types/financial'
import { fetchMultiplePrices, type BatchUpdateResult } from '../services/yahooFinance'
import { useTranslation } from '../hooks/useTranslation'
import { useFormatters } from '../hooks/useFormatters'
import { generateAvatarSVG } from '../utils/avatar'

export function InvestmentPortfolio() {
  const { t } = useTranslation()
  const { formatCurrency, formatNumber } = useFormatters()
  const {
    state,
    deleteInvestment,
    bulkUpdateInvestmentPrices,
    setLastPriceUpdate,
    demoteHoldingToWatchlist,
    totalInvestmentValue,
    totalInvestmentGain,
    totalPortfolioValue,
    cashBalance,
    updateCashBalance,
  } = useFinancial()

  const [isEditingCash, setIsEditingCash] = useState(false)
  const [cashInput, setCashInput] = useState('')

  const handleEditCash = () => {
    setIsEditingCash(true)
    setCashInput(String(cashBalance))
  }

  const handleSaveCash = () => {
    const value = parseFloat(cashInput) || 0
    updateCashBalance(value)
    setIsEditingCash(false)
  }

  const [showForm, setShowForm] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [editingInvestment, setEditingInvestment] = useState<string | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updatingPriceId, setUpdatingPriceId] = useState<string | null>(null)
  const [updateResult, setUpdateResult] = useState<BatchUpdateResult | null>(null)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

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

  const handleDemoteToWatchlist = (investment: Investment) => {
    demoteHoldingToWatchlist(investment.id, {
      shares: investment.shares,
      targetPrice: investment.currentPrice,
      notes: investment.notes,
    })
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
                <Banknote className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('cashOnHand')}</p>
                {isEditingCash ? (
                  <input
                    type="number"
                    value={cashInput}
                    onChange={(e) => setCashInput(e.target.value)}
                    onBlur={handleSaveCash}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveCash()}
                    className="text-2xl font-bold text-emerald-600 border-b border-emerald-600 focus:outline-none w-32 bg-transparent"
                    autoFocus
                  />
                ) : (
                  <p
                    onClick={handleEditCash}
                    className="text-2xl font-bold text-emerald-600 cursor-pointer hover:text-emerald-700"
                  >
                    {formatCurrency(cashBalance)}
                  </p>
                )}
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

        {/* Status Messages */}
        <StatusMessage />

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
        {state.investments.length > 0 ? (
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{t('holdings')} ({state.investments.length})</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleUpdatePrices}
                  disabled={isUpdating}
                  className="text-blue-600 disabled:opacity-50"
                  title={t('updatePrices')}
                >
                  {isUpdating ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <RefreshCw className="w-6 h-6" />
                  )}
                </button>
                <button
                  onClick={() => setShowImportDialog(true)}
                  className="text-green-600"
                  title={t('importInvestments')}
                >
                  <Upload className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setShowForm(true)}
                  className="text-purple-600"
                  title={t('addInvestment')}
                >
                  <SquarePlus className="w-6 h-6" />
                </button>
              </div>
            </div>
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
                          {t(INVESTMENT_TYPES.find((item) => item.value === investment.type)?.translationKey || 'investmentType_stock')}
                        </td>
                        <td className="px-4 py-3">
                          {t(INVESTMENT_ACCOUNTS.find((item) => item.value === investment.account)?.translationKey || 'accountType_taxable')}
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
                              onClick={() => handleDemoteToWatchlist(investment)}
                              className="p-1 text-gray-600 hover:text-orange-600 transition-colors"
                              title={t('demoteToWatchlist')}
                            >
                              <TrendingDown className="w-4 h-4" />
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
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{t('holdings')}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowImportDialog(true)}
                  className="text-green-600"
                  title={t('importInvestments')}
                >
                  <Upload className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setShowForm(true)}
                  className="text-purple-600"
                  title={t('addInvestment')}
                >
                  <SquarePlus className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="text-center py-12 text-gray-500">
              <CircleDollarSign className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">{t('noInvestmentsYet')}</p>
            </div>
          </Card>
        )}

        {/* Watchlist Section */}
        <div className="mt-8">
          <WatchlistSection />
        </div>
      </div>
    </div>
  )
}

// Watchlist Section Component
function WatchlistSection() {
  const { t } = useTranslation()
  const { formatCurrency, formatNumber } = useFormatters()
  const { state, addWatchlistItem, updateWatchlistItem, deleteWatchlistItem, promoteWatchlistToHolding, bulkUpdateWatchlistPrices, setLastPriceUpdate } = useFinancial()
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [updatingPriceId, setUpdatingPriceId] = useState<string | null>(null)
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('asc')
    }
  }

  const sortedWatchlist = useMemo(() => {
    if (!sortColumn) return state.watchlist

    return [...state.watchlist].sort((a, b) => {
      let valueA: number | string
      let valueB: number | string

      switch (sortColumn) {
        case 'name':
          valueA = a.name.toLowerCase()
          valueB = b.name.toLowerCase()
          break
        case 'symbol':
          valueA = a.symbol.toLowerCase()
          valueB = b.symbol.toLowerCase()
          break
        case 'shares':
          valueA = a.shares
          valueB = b.shares
          break
        case 'targetPrice':
          valueA = a.targetPrice
          valueB = b.targetPrice
          break
        case 'currentPrice':
          valueA = a.currentPrice || 0
          valueB = b.currentPrice || 0
          break
        case 'potentialValue':
          valueA = a.shares * a.targetPrice
          valueB = b.shares * b.targetPrice
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
  }, [state.watchlist, sortColumn, sortDirection])

  const handleUpdatePrice = async (item: WatchlistItem) => {
    setUpdatingPriceId(item.id)
    try {
      const result = await fetchMultiplePrices([item.symbol])
      
      if (result.successful.length > 0 && result.successful[0].price) {
        bulkUpdateWatchlistPrices([{
          symbol: item.symbol,
          price: result.successful[0].price,
        }])
        setLastPriceUpdate(new Date().toISOString())
      }
    } catch (error) {
      console.error('Failed to update price:', error)
    } finally {
      setUpdatingPriceId(null)
    }
  }

  const handlePromoteToHolding = (item: WatchlistItem) => {
    const defaultType = 'stock'
    const defaultAccount = 'taxable'
    
    promoteWatchlistToHolding(item.id, {
      type: defaultType,
      account: defaultAccount,
      shares: item.shares || 0,
      costBasis: item.currentPrice || item.targetPrice || 0,
      currentPrice: item.currentPrice || item.targetPrice || 0,
      notes: item.notes,
    })
  }

  if (state.watchlist.length === 0 && !showForm) {
    return (
      <div className="mt-8">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">{t('watchlist')}</h3>
            <button
              onClick={() => setShowForm(true)}
              className="text-purple-600 transition-colors"
              title={t('addToWatchlist')}
            >
              <SquarePlus className="w-6 h-6" />
            </button>
          </div>
          <div className="text-center py-12 text-gray-500">
            <Eye className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">{t('noWatchlistItems')}</p>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="mt-8">
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">{t('watchlist')} ({state.watchlist.length})</h3>
          <button
            onClick={() => setShowForm(true)}
            className="text-purple-600 transition-colors"
            title={t('addToWatchlist')}
          >
            <SquarePlus className="w-6 h-6" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th 
                  className="text-left px-4 py-3 text-sm font-medium text-gray-600 cursor-pointer hover:text-purple-600 hover:bg-gray-100 transition-colors min-w-[300px]"
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
                  className="text-right px-4 py-3 text-sm font-medium text-gray-600 cursor-pointer hover:text-purple-600 hover:bg-gray-100 transition-colors whitespace-nowrap"
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
                  className="text-right px-4 py-3 text-sm font-medium text-gray-600 cursor-pointer hover:text-purple-600 hover:bg-gray-100 transition-colors whitespace-nowrap"
                  onClick={() => handleSort('targetPrice')}
                >
                  <div className="flex items-center justify-end gap-1">
                    {t('targetPrice')}
                    {sortColumn === 'targetPrice' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                    {sortColumn !== 'targetPrice' && <ArrowUpDown className="w-3 h-3 opacity-30" />}
                  </div>
                </th>
                <th 
                  className="text-right px-4 py-3 text-sm font-medium text-gray-600 cursor-pointer hover:text-purple-600 hover:bg-gray-100 transition-colors whitespace-nowrap"
                  onClick={() => handleSort('currentPrice')}
                >
                  <div className="flex items-center justify-end gap-1">
                    {t('currentPrice')}
                    {sortColumn === 'currentPrice' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                    {sortColumn !== 'currentPrice' && <ArrowUpDown className="w-3 h-3 opacity-30" />}
                  </div>
                </th>
                <th 
                  className="text-right px-4 py-3 text-sm font-medium text-gray-600 cursor-pointer hover:text-purple-600 hover:bg-gray-100 transition-colors whitespace-nowrap"
                  onClick={() => handleSort('potentialValue')}
                >
                  <div className="flex items-center justify-end gap-1">
                    {t('potentialValue')}
                    {sortColumn === 'potentialValue' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                    {sortColumn !== 'potentialValue' && <ArrowUpDown className="w-3 h-3 opacity-30" />}
                  </div>
                </th>
                <th className="text-center px-4 py-3 text-sm font-medium text-gray-600 whitespace-nowrap">{t('actionsHeader')}</th>
              </tr>
            </thead>
            <tbody>
              {sortedWatchlist.map((item) => {
                const potentialValue = item.shares * item.targetPrice
                const currentPrice = item.currentPrice
                const targetDiff = currentPrice ? ((currentPrice - item.targetPrice) / item.targetPrice) * 100 : null

                return (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 min-w-[300px]">
                      <div className="flex items-center gap-3">
                        <img
                          src={generateAvatarSVG(item.symbol)}
                          alt={item.symbol}
                          className="w-10 h-10 rounded-full"
                          title={item.symbol}
                        />
                        <div>
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-gray-500">{item.symbol}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">{formatNumber(item.shares)}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">{formatCurrency(item.targetPrice)}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <span>{currentPrice ? formatCurrency(currentPrice) : '-'}</span>
                        <button
                          onClick={() => handleUpdatePrice(item)}
                          disabled={updatingPriceId === item.id}
                          className="text-gray-600 hover:text-blue-600 transition-colors disabled:opacity-50"
                          title={t('updatePrice')}
                        >
                          {updatingPriceId === item.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {targetDiff !== null && (
                        <div className={`text-xs ${targetDiff <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {targetDiff <= 0 ? '' : '+'}{targetDiff.toFixed(2)}%
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-medium whitespace-nowrap">{formatCurrency(potentialValue)}</td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handlePromoteToHolding(item)}
                          className="p-1 text-gray-600 hover:text-green-600 transition-colors"
                          title={t('promoteToHolding')}
                        >
                          <TrendingUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingItem(item.id)}
                          className="p-1 text-gray-600 hover:text-purple-600 transition-colors"
                          title={t('edit')}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteWatchlistItem(item.id)}
                          className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                          title={t('delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">{t('addToWatchlist')}</h2>
            <WatchlistForm
              onClose={() => setShowForm(false)}
              onAdd={addWatchlistItem}
              onUpdate={updateWatchlistItem}
            />
          </div>
        </div>
      )}

      {/* Edit Form Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4">{t('editWatchlistItem')}</h2>
            <WatchlistForm
              watchlistItem={state.watchlist.find((i) => i.id === editingItem)}
              onClose={() => setEditingItem(null)}
              onAdd={addWatchlistItem}
              onUpdate={updateWatchlistItem}
            />
          </div>
        </div>
      )}
    </div>
  )
}



import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Wallet, Plus, Edit2, Trash2, Copy, Plane, Home, UtensilsCrossed, Car, Ticket, ShoppingBag, MoreHorizontal, Grid3X3, List, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react'
import { useFinancial } from '../contexts/FinancialContext'
import { useTranslation } from '../hooks/useTranslation'
import { useFormatters } from '../hooks/useFormatters'
import { Card } from '../components/Card'
import { BudgetScenarioForm } from '../components/BudgetScenarioForm'
import type { BudgetScenario, BudgetCategory } from '../types/financial'

const CATEGORY_ICONS: Record<BudgetCategory, React.ReactNode> = {
  travel: <Plane className="w-4 h-4" />,
  accommodation: <Home className="w-4 h-4" />,
  food: <UtensilsCrossed className="w-4 h-4" />,
  transportation: <Car className="w-4 h-4" />,
  activities: <Ticket className="w-4 h-4" />,
  shopping: <ShoppingBag className="w-4 h-4" />,
  other: <MoreHorizontal className="w-4 h-4" />,
}

export function Budget() {
  const { t } = useTranslation()
  const { formatCurrency } = useFormatters()
  const { state, deleteBudgetScenario, duplicateBudgetScenario } = useFinancial()

  const [showForm, setShowForm] = useState(false)
  const [editingScenario, setEditingScenario] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Calculate statistics
  const stats = useMemo(() => {
    const scenarios = state.budgetScenarios
    if (scenarios.length === 0) return null

    const totals = scenarios.map((s) => ({
      ...s,
      total: s.lineItems.reduce((sum, item) => sum + item.amount, 0),
    }))

    const lowest = totals.reduce((min, s) => (s.total < min.total ? s : min), totals[0])
    const highest = totals.reduce((max, s) => (s.total > max.total ? s : max), totals[0])
    const average = totals.reduce((sum, s) => sum + s.total, 0) / totals.length

    return {
      totalScenarios: scenarios.length,
      lowestCost: lowest,
      highestCost: highest,
      averageCost: average,
    }
  }, [state.budgetScenarios])

  const handleDelete = (id: string) => {
    deleteBudgetScenario(id)
    setDeleteConfirmId(null)
  }

  const handleDuplicate = (scenario: BudgetScenario) => {
    duplicateBudgetScenario(scenario)
  }

  const getBudgetStatus = (total: number, limit?: number) => {
    if (!limit) return null
    const percentage = (total / limit) * 100
    if (percentage < 75) return { color: 'bg-green-500', textColor: 'text-green-600', status: 'under' }
    if (percentage <= 100) return { color: 'bg-yellow-500', textColor: 'text-yellow-600', status: 'near' }
    return { color: 'bg-red-500', textColor: 'text-red-600', status: 'over' }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span>{t('backToToolbox')}</span>
          </Link>
          <div className="flex items-center gap-3">
            <Wallet className="w-10 h-10 text-emerald-600" />
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">{t('budgetPlannerTitle')}</h1>
              <p className="text-gray-600">{t('budgetPlannerSubtitle')}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <Wallet className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('totalScenarios')}</p>
                  <p className="text-2xl font-bold text-emerald-600">{stats.totalScenarios}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('lowestCost')}</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.lowestCost.total)}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('averageCost')}</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.averageCost)}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Wallet className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('costRange')}</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(stats.highestCost.total - stats.lowestCost.total)}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
              {t('gridView')}
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <List className="w-4 h-4" />
              {t('listView')}
            </button>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('newScenario')}
          </button>
        </div>

        {/* Scenario Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">{t('newScenario')}</h2>
              <BudgetScenarioForm onClose={() => setShowForm(false)} />
            </div>
          </div>
        )}

        {/* Edit Scenario Modal */}
        {editingScenario && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">{t('editScenario')}</h2>
              <BudgetScenarioForm
                scenario={state.budgetScenarios.find((s) => s.id === editingScenario)}
                onClose={() => setEditingScenario(null)}
              />
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <div className="flex items-center gap-3 mb-4 text-red-600">
                <AlertCircle className="w-8 h-8" />
                <h2 className="text-xl font-bold">{t('confirmDelete')}</h2>
              </div>
              <p className="text-gray-600 mb-6">{t('deleteScenarioConfirm')}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
                >
                  {t('delete')}
                </button>
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scenarios Display */}
        {state.budgetScenarios.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {state.budgetScenarios.map((scenario) => {
                const total = scenario.lineItems.reduce((sum, item) => sum + item.amount, 0)
                const status = getBudgetStatus(total, scenario.budgetLimit)
                const isLowest = stats?.lowestCost.id === scenario.id

                return (
                  <Card key={scenario.id} className="relative overflow-hidden">
                    {isLowest && (
                      <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
                        {t('bestValue')}
                      </div>
                    )}

                    <div className="p-4">
                      {/* Header */}
                      <div className="mb-4">
                        <h3 className="font-semibold text-lg text-gray-800">{scenario.name}</h3>
                        {scenario.description && (
                          <p className="text-sm text-gray-500 mt-1">{scenario.description}</p>
                        )}
                      </div>

                      {/* Progress Bar */}
                      {scenario.budgetLimit && status && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600">{t('progress')}</span>
                            <span className={status.textColor}>{((total / scenario.budgetLimit) * 100).toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${status.color}`}
                              style={{ width: `${Math.min((total / scenario.budgetLimit) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Total */}
                      <div className="mb-4">
                        <div className="flex justify-between items-baseline">
                          <span className="text-sm text-gray-600">{t('totalCost')}</span>
                          <span className="text-2xl font-bold text-gray-800">{formatCurrency(total)}</span>
                        </div>
                        {scenario.budgetLimit && (
                          <div className="text-sm text-gray-500">
                            {t('of')} {formatCurrency(scenario.budgetLimit)}
                          </div>
                        )}
                      </div>

                      {/* Line Items */}
                      <div className="space-y-2 mb-4">
                        {scenario.lineItems.slice(0, 4).map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">{CATEGORY_ICONS[item.category]}</span>
                              <span className="text-gray-700 truncate max-w-[150px]">{item.label}</span>
                            </div>
                            <span className="text-gray-900 font-medium">{formatCurrency(item.amount)}</span>
                          </div>
                        ))}
                        {scenario.lineItems.length > 4 && (
                          <div className="text-sm text-gray-500 text-center">
                            +{scenario.lineItems.length - 4} {t('moreItems')}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => handleDuplicate(scenario)}
                          className="p-2 text-gray-600 hover:text-emerald-600 transition-colors"
                          title={t('duplicate')}
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingScenario(scenario.id)}
                          className="p-2 text-gray-600 hover:text-emerald-600 transition-colors"
                          title={t('edit')}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(scenario.id)}
                          className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                          title={t('delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            /* List View */
            <div className="space-y-4">
              {state.budgetScenarios.map((scenario) => {
                const total = scenario.lineItems.reduce((sum, item) => sum + item.amount, 0)
                const status = getBudgetStatus(total, scenario.budgetLimit)
                const isLowest = stats?.lowestCost.id === scenario.id

                return (
                  <Card key={scenario.id} className="relative overflow-hidden">
                    {/* Best Value Badge */}
                    {isLowest && (
                      <div className="absolute top-0 left-0 bg-green-500 text-white px-3 py-1 text-xs font-medium rounded-br-lg">
                        {t('bestValue')}
                      </div>
                    )}

                    <div className="p-4 pt-8 flex items-center gap-6">
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-gray-800">{scenario.name}</h3>
                        {scenario.description && (
                          <p className="text-sm text-gray-500 truncate">{scenario.description}</p>
                        )}
                      </div>

                      {/* Budget Progress */}
                      {scenario.budgetLimit && status && (
                        <div className="w-32 flex-shrink-0">
                          <div className="text-right text-sm text-gray-600 mb-1">
                            {((total / scenario.budgetLimit) * 100).toFixed(0)}%
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${status.color}`}
                              style={{ width: `${Math.min((total / scenario.budgetLimit) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Total */}
                      <div className="text-right flex-shrink-0">
                        <div className="text-2xl font-bold text-gray-800">{formatCurrency(total)}</div>
                        {scenario.budgetLimit && (
                          <div className="text-sm text-gray-500">
                            {t('of')} {formatCurrency(scenario.budgetLimit)}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleDuplicate(scenario)}
                          className="p-2 text-gray-600 hover:text-emerald-600 transition-colors"
                          title={t('duplicate')}
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingScenario(scenario.id)}
                          className="p-2 text-gray-600 hover:text-emerald-600 transition-colors"
                          title={t('edit')}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(scenario.id)}
                          className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                          title={t('delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Wallet className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">{t('noScenariosYet')}</p>
            <p className="text-sm text-gray-400 mt-2">{t('createFirstScenario')}</p>
          </div>
        )}
      </div>
    </div>
  )
}

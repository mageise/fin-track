import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, PiggyBank, Plus, Edit2, Trash2, Shield, Plane, Home, Car, GraduationCap, Target, Package, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useFinancial } from '../contexts/FinancialContext'
import { useTranslation } from '../hooks/useTranslation'
import { useFormatters } from '../hooks/useFormatters'
import { Card } from '../components/Card'
import { SavingsGoalForm } from '../components/SavingsGoalForm'
import type { SavingsGoal, SavingsGoalType } from '../types/financial'

const GOAL_ICONS: Record<SavingsGoalType, React.ReactNode> = {
  emergency: <Shield className="w-6 h-6" />,
  vacation: <Plane className="w-6 h-6" />,
  home: <Home className="w-6 h-6" />,
  vehicle: <Car className="w-6 h-6" />,
  education: <GraduationCap className="w-6 h-6" />,
  retirement: <Target className="w-6 h-6" />,
  other: <Package className="w-6 h-6" />,
}

const PRIORITY_COLORS = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  low: 'bg-green-100 text-green-700 border-green-200',
}

export function Savings() {
  const { t } = useTranslation()
  const { formatCurrency } = useFormatters()
  const {
    state,
    deleteSavingsGoal,
    updateSavingsAmount,
    totalSavingsAmount,
    totalSavingsTarget,
    overallSavingsProgress,
  } = useFinancial()

  const [showForm, setShowForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<string | null>(null)
  const [quickEditId, setQuickEditId] = useState<string | null>(null)
  const [quickEditAmount, setQuickEditAmount] = useState('')

  // Sort goals by priority (high -> medium -> low) then by target date
  const sortedGoals = useMemo(() => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return [...state.savingsGoals].sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
      if (priorityDiff !== 0) return priorityDiff
      
      // If same priority, sort by target date (earlier first)
      if (a.targetDate && b.targetDate) {
        return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
      }
      if (a.targetDate) return -1
      if (b.targetDate) return 1
      return 0
    })
  }, [state.savingsGoals])

  // Calculate on-track status
  const getOnTrackStatus = (goal: SavingsGoal) => {
    if (!goal.targetDate || goal.currentAmount >= goal.targetAmount) return { status: 'complete', message: '' }
    
    const today = new Date()
    const target = new Date(goal.targetDate)
    const monthsRemaining = (target.getFullYear() - today.getFullYear()) * 12 + (target.getMonth() - today.getMonth())
    
    if (monthsRemaining <= 0) {
      return { status: 'overdue', message: t('goalOverdue') }
    }
    
    const amountRemaining = goal.targetAmount - goal.currentAmount
    const monthlyNeeded = amountRemaining / monthsRemaining
    
    return { status: 'active', message: `${formatCurrency(monthlyNeeded)}/${t('perMonth')}` }
  }

  const handleQuickEdit = (goal: SavingsGoal) => {
    setQuickEditId(goal.id)
    setQuickEditAmount(goal.currentAmount.toString())
  }

  const handleQuickEditSubmit = (goalId: string) => {
    const amount = parseFloat(quickEditAmount) || 0
    updateSavingsAmount(goalId, amount)
    setQuickEditId(null)
    setQuickEditAmount('')
  }

  const activeGoalsCount = state.savingsGoals.length
  const completedGoalsCount = state.savingsGoals.filter(g => g.currentAmount >= g.targetAmount).length

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('backToToolbox')}</span>
          </Link>
          <div className="flex items-center gap-3">
            <PiggyBank className="w-10 h-10 text-orange-600" />
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">{t('savingsTitle')}</h1>
              <p className="text-gray-600">{t('savingsSubtitle')}</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-lg">
                <PiggyBank className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('totalSaved')}</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalSavingsAmount)}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('totalTarget')}</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalSavingsTarget)}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('overallProgress')}</p>
                <p className="text-2xl font-bold text-purple-600">{overallSavingsProgress.toFixed(1)}%</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('completedGoals')}</p>
                <p className="text-2xl font-bold text-green-600">{completedGoalsCount}/{activeGoalsCount}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Add Goal Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('addGoal')}
          </button>
        </div>

        {/* Goal Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">{t('addNewGoal')}</h2>
              <SavingsGoalForm onClose={() => setShowForm(false)} />
            </div>
          </div>
        )}

        {/* Edit Goal Modal */}
        {editingGoal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">{t('editGoal')}</h2>
              <SavingsGoalForm
                goal={state.savingsGoals.find(g => g.id === editingGoal)}
                onClose={() => setEditingGoal(null)}
              />
            </div>
          </div>
        )}

        {/* Goals Grid */}
        {sortedGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedGoals.map((goal) => {
              const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100)
              const isComplete = goal.currentAmount >= goal.targetAmount
              const { message } = getOnTrackStatus(goal)

              return (
                <Card key={goal.id} className="relative overflow-hidden">
                  {/* Priority Badge */}
                  <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-medium border ${PRIORITY_COLORS[goal.priority]}`}>
                    {t(`priority_${goal.priority}`)}
                  </div>

                  <div className="p-4">
                    {/* Goal Header */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                        {GOAL_ICONS[goal.type]}
                      </div>
                      <div className="flex-1 pr-16">
                        <h3 className="font-semibold text-lg text-gray-800">{goal.name}</h3>
                        <p className="text-sm text-gray-500">{t(`goalType_${goal.type}`)}</p>
                      </div>
                    </div>

                    {/* Progress Section */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600">{t('progressLabel')}</span>
                        <span className="font-medium">{progress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isComplete ? 'bg-green-500' : progress > 75 ? 'bg-green-500' : progress > 25 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Amounts */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">{t('currentAmount')}</p>
                        {quickEditId === goal.id ? (
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={quickEditAmount}
                              onChange={(e) => setQuickEditAmount(e.target.value)}
                              className="w-24 px-2 py-1 text-sm border border-gray-300 rounded"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleQuickEditSubmit(goal.id)
                                if (e.key === 'Escape') {
                                  setQuickEditId(null)
                                  setQuickEditAmount('')
                                }
                              }}
                            />
                            <button
                              onClick={() => handleQuickEditSubmit(goal.id)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleQuickEdit(goal)}
                            className="text-lg font-semibold text-gray-800 hover:text-orange-600 transition-colors"
                          >
                            {formatCurrency(goal.currentAmount)}
                          </button>
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">{t('targetAmount')}</p>
                        <p className="text-lg font-semibold text-gray-800">{formatCurrency(goal.targetAmount)}</p>
                      </div>
                    </div>

                    {/* Target Date & Status */}
                    {goal.targetDate && (
                      <div className="flex items-center gap-2 text-sm mb-3">
                        <AlertCircle className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          {t('targetDate')}: {new Date(goal.targetDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    {/* Monthly Needed / Status */}
                    {!isComplete && message && (
                      <div className="flex items-center gap-2 text-sm mb-4 p-2 bg-blue-50 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <span className="text-blue-700">{message}</span>
                      </div>
                    )}

                    {isComplete && (
                      <div className="flex items-center gap-2 text-sm mb-4 p-2 bg-green-50 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-green-700">{t('goalComplete')}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => setEditingGoal(goal.id)}
                        className="p-2 text-gray-600 hover:text-orange-600 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteSavingsGoal(goal.id)}
                        className="p-2 text-gray-600 hover:text-red-600 transition-colors"
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
          <div className="text-center py-12 text-gray-500">
            <PiggyBank className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">{t('noGoalsYet')}</p>
            <p className="text-sm text-gray-400 mt-2">{t('addFirstGoal')}</p>
          </div>
        )}
      </div>
    </div>
  )
}

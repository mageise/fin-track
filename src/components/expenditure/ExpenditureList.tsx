import { useState } from 'react'
import { SquarePlus, Upload, Edit2, Trash2, AlertCircle } from 'lucide-react'
import { useFinancial } from '../../contexts/FinancialContext'
import { useTranslation } from '../../hooks/useTranslation'
import { useFormatters } from '../../hooks/useFormatters'
import { Card } from '../Card'
import { EXPENDITURE_CATEGORIES, FREQUENCIES, type Expenditure, type ExpenditureCategory, type Frequency } from '../../types/incomeExpenditure'
import { ExpenditureForm } from './ExpenditureForm'
import { ExpenditureImportDialog } from './ExpenditureImportDialog'

export function ExpenditureList() {
  const { state, deleteExpenditure, clearExpenditures } = useFinancial()
  const { t } = useTranslation()
  const { formatCurrency } = useFormatters()

  const [showForm, setShowForm] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importCategory, setImportCategory] = useState<ExpenditureCategory>('fixedCosts')
  const [editingExpenditure, setEditingExpenditure] = useState<Expenditure | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<ExpenditureCategory>>(
    new Set(['fixedCosts', 'reserves', 'investments'])
  )
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set())
  const [showClearModal, setShowClearModal] = useState(false)

  const expenditures = state.expenditures || []

  const groupedExpenditures = expenditures.reduce((acc, exp) => {
    if (!acc[exp.category]) {
      acc[exp.category] = {}
    }
    const subcategory = exp.subcategory || '__unassigned__'
    if (!acc[exp.category][subcategory]) {
      acc[exp.category][subcategory] = []
    }
    acc[exp.category][subcategory].push(exp)
    return acc
  }, {} as Record<ExpenditureCategory, Record<string, Expenditure[]>>)

  const toMonthlyAmount = (amount: number, frequency: Frequency): number => {
    const freq = FREQUENCIES.find(f => f.value === frequency)
    return freq ? amount / freq.months : amount
  }

  const toggleCategory = (category: ExpenditureCategory) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  const toggleSubcategory = (subcategoryKey: string) => {
    const newExpanded = new Set(expandedSubcategories)
    if (newExpanded.has(subcategoryKey)) {
      newExpanded.delete(subcategoryKey)
    } else {
      newExpanded.add(subcategoryKey)
    }
    setExpandedSubcategories(newExpanded)
  }

  const handleEdit = (expenditure: Expenditure) => {
    setEditingExpenditure(expenditure)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    deleteExpenditure(id)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingExpenditure(null)
  }

  const getCategoryLabel = (category: ExpenditureCategory): string => {
    return t(category)
  }

  if (expenditures.length === 0) {
    return (
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{t('expenditures')}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setImportCategory('fixedCosts')
                setShowImportDialog(true)
              }}
              className="text-teal-600"
              title={t('importExpenditures')}
            >
              <Upload className="w-6 h-6" />
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="text-teal-600"
              title={t('addExpenditure')}
            >
              <SquarePlus className="w-6 h-6" />
            </button>
          </div>
        </div>
        <div className="text-center py-8">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
            </svg>
          </div>
          <p className="text-gray-500">{t('noExpenditures')}</p>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">{t('addExpenditure')}</h3>
              <ExpenditureForm onClose={handleCloseForm} />
            </div>
          </div>
        )}

        {showImportDialog && (
          <ExpenditureImportDialog
            initialCategory={importCategory}
            onClose={() => setShowImportDialog(false)}
          />
        )}
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{t('expenditures')}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowClearModal(true)}
            className="text-rose-600"
            title={t('clearAllExpenditures')}
          >
            <Trash2 className="w-6 h-6" />
          </button>
          <button
            onClick={() => {
              setImportCategory('fixedCosts')
              setShowImportDialog(true)
            }}
            className="text-teal-600"
            title={t('importExpenditures')}
          >
            <Upload className="w-6 h-6" />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="text-teal-600"
            title={t('addExpenditure')}
          >
            <SquarePlus className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {EXPENDITURE_CATEGORIES.map((category) => {
          const categorySubcats = groupedExpenditures[category.value] || {}
          const isExpanded = expandedCategories.has(category.value)
          const totalMonthly = Object.values(categorySubcats).flat().reduce((sum, exp) => sum + toMonthlyAmount(exp.amount, exp.frequency), 0)
          const totalCount = Object.values(categorySubcats).flat().length

          return (
            <div key={category.value} className="border rounded-lg">
              <button
                onClick={() => toggleCategory(category.value)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-gray-400">
                    {isExpanded ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </span>
                  <span className="font-medium text-gray-900">{getCategoryLabel(category.value)}</span>
                  <span className="text-sm text-gray-500">({totalCount})</span>
                </div>
                <span className="font-semibold text-gray-700">{formatCurrency(totalMonthly)}/{t('monthlyShort')}</span>
              </button>

              {isExpanded && totalCount > 0 && (
                <div className="border-t bg-gray-50">
                  {Object.entries(categorySubcats)
                  .sort(([a], [b]) => {
                    if (a === '__unassigned__') return 1
                    if (b === '__unassigned__') return -1
                    return 0
                  })
                  .map(([subcategory, exps]) => {
                    const subcatKey = `${category.value}-${subcategory}`
                    const isSubcatExpanded = expandedSubcategories.has(subcatKey)
                    const subcatTotal = exps.reduce((sum, exp) => sum + toMonthlyAmount(exp.amount, exp.frequency), 0)

                    return (
                      <div key={subcategory}>
                        <button
                          onClick={() => toggleSubcategory(subcatKey)}
                          className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-100"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-400">
                              {isSubcatExpanded ? (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              )}
                            </span>
                            <span className={`text-sm ${subcategory === '__unassigned__' ? 'text-gray-500 italic' : 'font-medium text-gray-700'}`}>
                                  {subcategory === '__unassigned__'
                                    ? t('subcat_Unassigned')
                                    : t(('subcat_' + subcategory) as any) || subcategory}
                                </span>
                          </div>
                          <span className="text-sm text-gray-600">{formatCurrency(subcatTotal)}/{t('monthlyShort')}</span>
                        </button>

                        {isSubcatExpanded && (
                          <div className="border-t px-4 py-2 bg-white space-y-2">
                            {exps.map((exp) => (
                              <div key={exp.id} className="flex items-center justify-between py-2">
                                <div>
                                  <p className="font-medium text-gray-900">{exp.name}</p>
                                  <p className="text-sm text-gray-500">
                                    {formatCurrency(exp.amount)} {t(('frequency_' + exp.frequency) as any)}
                                  </p>
                                  {exp.notes && (
                                    <p className="text-xs text-gray-400 italic">{exp.notes}</p>
                                  )}
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleEdit(exp)}
                                    className="p-1 text-gray-600 hover:text-teal-600 transition-colors"
                                    title={t('edit')}
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(exp.id)}
                                    className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                                    title={t('delete')}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingExpenditure ? t('editExpenditure') : t('addExpenditure')}
            </h3>
            <ExpenditureForm
              expenditure={editingExpenditure || undefined}
              onClose={handleCloseForm}
            />
          </div>
        </div>
      )}

      {showImportDialog && (
        <ExpenditureImportDialog
          initialCategory={importCategory}
          onClose={() => setShowImportDialog(false)}
        />
      )}

      {showClearModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4 text-red-600">
              <AlertCircle className="w-8 h-8" />
              <h2 className="text-xl font-bold">{t('clearAllExpenditures')}</h2>
            </div>
            <p className="text-gray-600 mb-6">{t('confirmClearAll', { count: expenditures.length })}</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  clearExpenditures()
                  setShowClearModal(false)
                }}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
              >
                {t('delete')}
              </button>
              <button
                onClick={() => setShowClearModal(false)}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

import { useState } from 'react'
import { SquarePlus, Upload } from 'lucide-react'
import { useFinancial } from '../../contexts/FinancialContext'
import { useTranslation } from '../../hooks/useTranslation'
import { useFormatters } from '../../hooks/useFormatters'
import { EXPENDITURE_CATEGORIES, FREQUENCIES, type Expenditure, type ExpenditureCategory, type Frequency } from '../../types/incomeExpenditure'
import { ExpenditureForm } from './ExpenditureForm'
import { ExpenditureImportDialog } from './ExpenditureImportDialog'

export function ExpenditureList() {
  const { state, deleteExpenditure } = useFinancial()
  const { t } = useTranslation()
  const { formatCurrency } = useFormatters()

  const [showForm, setShowForm] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importCategory, setImportCategory] = useState<ExpenditureCategory>('fixed_cost')
  const [editingExpenditure, setEditingExpenditure] = useState<Expenditure | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<ExpenditureCategory>>(
    new Set(['fixed_cost', 'reserve', 'investment'])
  )
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set())

  const expenditures = state.expenditures || []

  const groupedExpenditures = expenditures.reduce((acc, exp) => {
    if (!acc[exp.category]) {
      acc[exp.category] = {}
    }
    const subcategory = exp.subcategory || 'Other'
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
    if (confirm(t('confirmDelete') || 'Are you sure you want to delete this expenditure?')) {
      deleteExpenditure(id)
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingExpenditure(null)
  }

  const getCategoryLabel = (category: ExpenditureCategory): string => {
    switch (category) {
      case 'fixed_cost':
        return t('fixedCosts')
      case 'reserve':
        return t('reserves')
      case 'investment':
        return t('investments')
      default:
        return category
    }
  }

  if (expenditures.length === 0 && !showForm) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{t('expenditures')}</h3>
          <button
            onClick={() => setShowForm(true)}
            className="text-teal-600 hover:text-teal-700"
            title={t('addExpenditure')}
          >
            <SquarePlus className="w-6 h-6" />
          </button>
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
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{t('expenditures')}</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setImportCategory('fixed_cost')
              setShowImportDialog(true)
            }}
            className="text-teal-600 hover:text-teal-700"
            title={t('importExpenditures')}
          >
            <Upload className="w-6 h-6" />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="text-teal-600 hover:text-teal-700"
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
                <span className="font-semibold text-gray-700">{formatCurrency(totalMonthly)}/mo</span>
              </button>

              {isExpanded && totalCount > 0 && (
                <div className="border-t bg-gray-50">
                  {Object.entries(categorySubcats).map(([subcategory, exps]) => {
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
                            <span className="text-sm font-medium text-gray-700">{subcategory}</span>
                          </div>
                          <span className="text-sm text-gray-600">{formatCurrency(subcatTotal)}/mo</span>
                        </button>

                        {isSubcatExpanded && (
                          <div className="border-t px-4 py-2 bg-white space-y-2">
                            {exps.map((exp) => (
                              <div key={exp.id} className="flex items-center justify-between py-2">
                                <div>
                                  <p className="font-medium text-gray-900">{exp.name}</p>
                                  <p className="text-sm text-gray-500">
                                    {formatCurrency(exp.amount)}/{t(exp.frequency)}
                                  </p>
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleEdit(exp)}
                                    className="text-emerald-600 hover:text-emerald-700 text-sm"
                                  >
                                    {t('edit')}
                                  </button>
                                  <button
                                    onClick={() => handleDelete(exp.id)}
                                    className="text-rose-600 hover:text-rose-700 text-sm"
                                  >
                                    {t('delete')}
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
    </div>
  )
}

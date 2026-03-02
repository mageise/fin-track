import { useState } from 'react'
import { useFinancial } from '../../contexts/FinancialContext'
import { useTranslation } from '../../hooks/useTranslation'
import { EXPENDITURE_CATEGORIES, EXPENDITURE_SUBCATEGORIES, FREQUENCIES, type Expenditure, type ExpenditureCategory, type Frequency } from '../../types/incomeExpenditure'

interface ExpenditureFormProps {
  expenditure?: Expenditure
  onClose: () => void
}

export function ExpenditureForm({ expenditure, onClose }: ExpenditureFormProps) {
  const { addExpenditure, updateExpenditure } = useFinancial()
  const { t } = useTranslation()

  const [formData, setFormData] = useState({
    name: expenditure?.name || '',
    category: expenditure?.category || 'fixed_cost' as ExpenditureCategory,
    subcategory: expenditure?.subcategory || '',
    amount: expenditure?.amount || 0,
    frequency: expenditure?.frequency || 'monthly' as Frequency,
    isRecurring: expenditure?.isRecurring ?? true,
    startDate: expenditure?.startDate || new Date().toISOString().split('T')[0],
    notes: expenditure?.notes || '',
  })

  const subcategories = EXPENDITURE_SUBCATEGORIES[formData.category] || []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (expenditure) {
      updateExpenditure({ ...expenditure, ...formData })
    } else {
      addExpenditure(formData)
    }
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('expenditureName')}
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          placeholder={t('expenditureName')}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('category')}
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenditureCategory, subcategory: '' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {EXPENDITURE_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('subcategory') || 'Subcategory'}
          </label>
          <select
            value={formData.subcategory}
            onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">-</option>
            {subcategories.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('frequency')}
          </label>
          <select
            value={formData.frequency}
            onChange={(e) => setFormData({ ...formData, frequency: e.target.value as Frequency })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {FREQUENCIES.map((freq) => (
              <option key={freq.value} value={freq.value}>
                {t(freq.value) || freq.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('amount')} (€)
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
          required
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isRecurring"
          checked={formData.isRecurring}
          onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
          className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
        />
        <label htmlFor="isRecurring" className="ml-2 text-sm font-medium text-gray-700">
          {t('recurring')}
        </label>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {t('cancel')}
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {expenditure ? t('update') : t('add')}
        </button>
      </div>
    </form>
  )
}

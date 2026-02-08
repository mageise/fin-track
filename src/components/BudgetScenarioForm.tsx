import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { BUDGET_CATEGORIES, type BudgetScenario, type BudgetLineItem, type BudgetCategory } from '../types/financial'
import { useFinancial } from '../contexts/FinancialContext'
import { useTranslation } from '../hooks/useTranslation'
import { useFormatters } from '../hooks/useFormatters'

interface BudgetScenarioFormProps {
  scenario?: BudgetScenario
  onClose: () => void
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function BudgetScenarioForm({ scenario, onClose }: BudgetScenarioFormProps) {
  const { addBudgetScenario, updateBudgetScenario } = useFinancial()
  const { t } = useTranslation()
  const { formatCurrency } = useFormatters()

  const [formData, setFormData] = useState({
    name: scenario?.name || '',
    description: scenario?.description || '',
    budgetLimit: scenario?.budgetLimit,
    hasBudgetLimit: scenario?.budgetLimit !== undefined,
    lineItems: scenario?.lineItems || [
      { id: generateId(), category: 'other' as BudgetCategory, label: '', amount: 0 },
    ],
  })

  const totalCost = formData.lineItems.reduce((sum, item) => sum + item.amount, 0)

  const getBudgetStatus = () => {
    if (!formData.hasBudgetLimit || formData.budgetLimit === undefined) return null
    const percentage = (totalCost / formData.budgetLimit) * 100
    if (percentage < 75) return { color: 'text-green-600', bgColor: 'bg-green-100', label: t('underBudget') }
    if (percentage <= 100) return { color: 'text-yellow-600', bgColor: 'bg-yellow-100', label: t('nearLimit') }
    return { color: 'text-red-600', bgColor: 'bg-red-100', label: t('overBudget') }
  }

  const budgetStatus = getBudgetStatus()

  const handleAddLineItem = () => {
    setFormData({
      ...formData,
      lineItems: [
        ...formData.lineItems,
        { id: generateId(), category: 'other' as BudgetCategory, label: '', amount: 0 },
      ],
    })
  }

  const handleRemoveLineItem = (id: string) => {
    if (formData.lineItems.length > 1) {
      setFormData({
        ...formData,
        lineItems: formData.lineItems.filter((item) => item.id !== id),
      })
    }
  }

  const handleLineItemChange = (id: string, field: keyof BudgetLineItem, value: string | number) => {
    setFormData({
      ...formData,
      lineItems: formData.lineItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const scenarioData = {
      name: formData.name,
      description: formData.description,
      budgetLimit: formData.hasBudgetLimit ? formData.budgetLimit : undefined,
      lineItems: formData.lineItems.filter((item) => item.label.trim() !== ''),
    }

    if (scenario) {
      updateBudgetScenario({ ...scenario, ...scenarioData })
    } else {
      addBudgetScenario(scenarioData)
    }
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('scenarioNameLabel')}
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder={t('scenarioNamePlaceholder')}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('scenarioDescriptionLabel')} ({t('optional')})
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            rows={2}
            placeholder={t('scenarioDescriptionPlaceholder')}
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.hasBudgetLimit}
              onChange={(e) => setFormData({ ...formData, hasBudgetLimit: e.target.checked })}
              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm font-medium text-gray-700">{t('setBudgetLimit')}</span>
          </label>

          {formData.hasBudgetLimit && (
            <input
              type="number"
              value={formData.budgetLimit || ''}
              onChange={(e) => setFormData({ ...formData, budgetLimit: parseFloat(e.target.value) || 0 })}
              className="w-32 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              min="0"
              step="0.01"
              placeholder="0"
            />
          )}
        </div>
      </div>

      {/* Line Items */}
      <div className="space-y-3">
        <h3 className="font-medium text-gray-800">{t('lineItems')}</h3>
        
        {formData.lineItems.map((item) => (
          <div key={item.id} className="flex gap-2 items-start">
            <select
              value={item.category}
              onChange={(e) => handleLineItemChange(item.id, 'category', e.target.value as BudgetCategory)}
              className="w-32 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            >
              {BUDGET_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            
            <input
              type="text"
              value={item.label}
              onChange={(e) => handleLineItemChange(item.id, 'label', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              placeholder={t('lineItemLabelPlaceholder')}
            />
            
            <input
              type="number"
              value={item.amount || ''}
              onChange={(e) => handleLineItemChange(item.id, 'amount', parseFloat(e.target.value) || 0)}
              className="w-28 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-right"
              min="0"
              step="0.01"
              placeholder="0"
            />
            
            <button
              type="button"
              onClick={() => handleRemoveLineItem(item.id)}
              disabled={formData.lineItems.length <= 1}
              className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddLineItem}
          className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          {t('addLineItem')}
        </button>
      </div>

      {/* Total Summary */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-700">{t('totalCost')}</span>
          <div className="text-right">
            <span className="text-2xl font-bold text-gray-800">{formatCurrency(totalCost)}</span>
            {formData.hasBudgetLimit && formData.budgetLimit !== undefined && (
              <div className="text-sm text-gray-500">
                {t('of')} {formatCurrency(formData.budgetLimit)}
              </div>
            )}
          </div>
        </div>

        {formData.hasBudgetLimit && formData.budgetLimit !== undefined && budgetStatus && (
          <div className={`mt-3 p-3 rounded-lg ${budgetStatus.bgColor} ${budgetStatus.color} flex items-center justify-between`}>
            <span className="font-medium">{budgetStatus.label}</span>
            <span className="text-sm">
              {((totalCost / formData.budgetLimit) * 100).toFixed(1)}% {t('used')}
            </span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors"
        >
          {scenario ? t('updateScenario') : t('createScenario')}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition-colors"
        >
          {t('cancel')}
        </button>
      </div>
    </form>
  )
}

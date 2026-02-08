import { useState } from 'react'
import { INVESTMENT_TYPES, INVESTMENT_ACCOUNTS, type Investment, type InvestmentType, type InvestmentAccount } from '../types/financial'
import { useFinancial } from '../contexts/FinancialContext'
import { useTranslation } from '../hooks/useTranslation'
import { useFormatters } from '../hooks/useFormatters'

interface InvestmentFormProps {
  investment?: Investment
  onClose: () => void
}

export function InvestmentForm({ investment, onClose }: InvestmentFormProps) {
  const { t } = useTranslation()
  const { formatCurrency } = useFormatters()
  const { addInvestment, updateInvestment } = useFinancial()
  const [formData, setFormData] = useState({
    symbol: investment?.symbol || '',
    name: investment?.name || '',
    type: investment?.type || 'stock' as InvestmentType,
    account: investment?.account || 'taxable' as InvestmentAccount,
    shares: investment?.shares || 0,
    costBasis: investment?.costBasis || 0,
    currentPrice: investment?.currentPrice || 0,
    notes: investment?.notes || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (investment) {
      updateInvestment({ ...investment, ...formData })
    } else {
      addInvestment(formData)
    }
    onClose()
  }

  const currentValue = formData.shares * formData.currentPrice
  const totalCost = formData.shares * formData.costBasis
  const gainLoss = currentValue - totalCost
  const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('symbolLabel')}
          </label>
          <input
            type="text"
            value={formData.symbol}
            onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="AAPL"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('investmentNameLabel')}
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Apple Inc."
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('investmentTypeLabel')}
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as InvestmentType })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {INVESTMENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {t(type.translationKey)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('accountTypeLabel')}
          </label>
          <select
            value={formData.account}
            onChange={(e) => setFormData({ ...formData, account: e.target.value as InvestmentAccount })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {INVESTMENT_ACCOUNTS.map((account) => (
              <option key={account.value} value={account.value}>
                {t(account.translationKey)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('sharesLabel')}
          </label>
          <input
            type="number"
            value={formData.shares}
            onChange={(e) => setFormData({ ...formData, shares: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            min="0"
            step="0.00000001"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('costBasisLabel')}
          </label>
          <input
            type="number"
            value={formData.costBasis}
            onChange={(e) => setFormData({ ...formData, costBasis: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            min="0"
            step="0.00000001"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('currentPriceLabel')}
          </label>
          <input
            type="number"
            value={formData.currentPrice}
            onChange={(e) => setFormData({ ...formData, currentPrice: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            min="0"
            step="0.00000001"
            required
          />
        </div>
      </div>

      {/* Preview Calculations */}
      {formData.shares > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">{t('currentValueLabel')}:</span>
            <span className="font-medium">
              {formatCurrency(currentValue)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">{t('totalCost')}:</span>
            <span className="font-medium">
              {formatCurrency(totalCost)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">{t('totalGainLoss')}:</span>
            <span className={`font-medium ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {gainLoss >= 0 ? '+' : ''}{formatCurrency(gainLoss)}
              ({gainLossPercent >= 0 ? '+' : ''}{gainLossPercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {t('notesOptionalLabel')}
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          rows={2}
          placeholder={t('notesPlaceholder')}
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition-colors"
        >
          {investment ? t('updateInvestmentButton') : t('addInvestment')}
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

import { useState } from 'react'
import { useFinancial } from '../../contexts/FinancialContext'
import { useTranslation } from '../../hooks/useTranslation'
import { DEFAULT_WORK_CONFIG, DEFAULT_TAX_CONFIG, type WorkConfig, type TaxConfig } from '../../types/incomeExpenditure'

interface WorkDayConfigProps {
  onSave?: () => void
}

export function WorkDayConfig({ onSave }: WorkDayConfigProps) {
  const { state, setWorkConfig, setTaxConfig } = useFinancial()
  const { t } = useTranslation()

  const [workConfig, setWorkConfigState] = useState<WorkConfig>(
    state.workConfig || DEFAULT_WORK_CONFIG
  )

  const [taxConfig, setTaxConfigState] = useState<TaxConfig>(
    state.taxConfig || DEFAULT_TAX_CONFIG
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setWorkConfig(workConfig)
    setTaxConfig(taxConfig)
    onSave?.()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
        <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('workConfigTitle') || 'Work Configuration'}
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('hourlyRate') || 'Hourly Rate (€)'}
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={workConfig.hourlyRate}
              onChange={(e) => setWorkConfigState({ ...workConfig, hourlyRate: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('dailyHours') || 'Daily Hours'}
            </label>
            <input
              type="number"
              min="0"
              max="24"
              step="0.5"
              value={workConfig.dailyHours}
              onChange={(e) => setWorkConfigState({ ...workConfig, dailyHours: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('workDays') || 'Work Days/Year'}
            </label>
            <input
              type="number"
              min="0"
              max="365"
              value={workConfig.workDays}
              onChange={(e) => setWorkConfigState({ ...workConfig, workDays: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {t('taxConfigTitle') || 'Tax Configuration'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('incomeTaxRate') || 'Income Tax Rate (%)'}
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={taxConfig.incomeTaxRate}
              onChange={(e) => setTaxConfigState({ ...taxConfig, incomeTaxRate: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('solidaritySurcharge') || 'Solidarity Surcharge (%)'}
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={taxConfig.solidaritySurcharge}
              onChange={(e) => setTaxConfigState({ ...taxConfig, solidaritySurcharge: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('taxExemption')} (€)
            </label>
            <input
              type="number"
              min="0"
              value={taxConfig.taxExemption}
              onChange={(e) => setTaxConfigState({ ...taxConfig, taxExemption: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('incomeAdjustment') || 'Income Adjustment (€)'}
            </label>
            <input
              type="number"
              step="0.01"
              value={taxConfig.incomeAdjustment}
              onChange={(e) => setTaxConfigState({ ...taxConfig, incomeAdjustment: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('childBenefit') || 'Child Benefit (€)'}
            </label>
            <input
              type="number"
              step="0.01"
              value={taxConfig.childBenefit}
              onChange={(e) => setTaxConfigState({ ...taxConfig, childBenefit: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {t('save') || 'Save'}
        </button>
      </div>
    </form>
  )
}

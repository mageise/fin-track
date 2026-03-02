import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useFinancial } from '../../contexts/FinancialContext'
import { useTranslation } from '../../hooks/useTranslation'
import { useFormatters } from '../../hooks/useFormatters'
import { DEFAULT_WORK_CONFIG, DEFAULT_TAX_CONFIG } from '../../types/incomeExpenditure'
import { calculateIncomeMetrics } from '../../utils/incomeCalculations'

export function IncomeCalculator() {
  const { state } = useFinancial()
  const { t } = useTranslation()
  const { formatCurrency } = useFormatters()
  const [showTaxDetails, setShowTaxDetails] = useState(false)

  const workConfig = state.workConfig || DEFAULT_WORK_CONFIG
  const taxConfig = state.taxConfig || DEFAULT_TAX_CONFIG

  const calculations = useMemo(() => {
    return calculateIncomeMetrics(workConfig, taxConfig)
  }, [workConfig, taxConfig])

  if (!state.workConfig) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-gray-500">{t('setupWorkConfig')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {t('income')}
      </h3>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-800">{t('grossIncome')}</span>
          <span className="text-lg font-semibold">{formatCurrency(calculations.annualGross)}</span>
        </div>

        <button
          onClick={() => setShowTaxDetails(!showTaxDetails)}
          className="w-full flex items-center justify-between border-t border-gray-300 pt-3 hover:bg-gray-50 -mx-2 px-2 rounded"
        >
          <div className="flex items-center gap-2 text-gray-600">
            {showTaxDetails ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <span>{t('taxDetails') || 'Tax Details'}</span>
          </div>
        </button>

        {showTaxDetails && (
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">{t('grossIncomeTaxable')}</span>
              <span>{formatCurrency(calculations.grossIncomeTaxable)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">{t('taxExemption')}</span>
              <span className="text-gray-500">-{formatCurrency(taxConfig.taxExemption)}</span>
            </div>
            <div className="flex justify-between items-center font-medium">
              <span className="text-gray-800">{t('taxableIncome')}</span>
              <span>{formatCurrency(calculations.taxableIncome)}</span>
            </div>
          </div>
        )}

        <div className="border-t border-gray-300 pt-3 space-y-2">
          <div className="flex justify-between text-rose-600">
            <span>{t('incomeTax')}</span>
            <span>-{formatCurrency(calculations.annualTax)}</span>
          </div>
          <div className="flex justify-between text-rose-600">
            <span>{t('solidaritySurcharge')}</span>
            <span>-{formatCurrency(calculations.solidaritySurcharge)}</span>
          </div>
          <div className="flex justify-between text-rose-600">
            <span>{t('childBenefitHalf')}</span>
            <span>-{formatCurrency(calculations.childBenefitHalf)}</span>
          </div>
        </div>

        <div className="border-t border-gray-300 pt-3">
          <div className="flex justify-between text-xl font-bold">
            <span className="text-gray-800">{t('netIncome')}</span>
            <span className="text-emerald-600">{formatCurrency(calculations.annualNet)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Calculator, ChevronDown, ChevronRight, CircleHelp, Percent, Receipt, SquarePlus, TrendingUp, Trash2 } from 'lucide-react'
import { Card } from '../components/Card'
import { useTranslation } from '../hooks/useTranslation'
import { useFormatters } from '../hooks/useFormatters'
import { useFinancial } from '../contexts/FinancialContext'
import { calculateGermanTax } from '../utils/taxCalculator'
import type { TaxYear } from '../types/tax'
import type { WorkPeriod } from '../types/incomeExpenditure'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function TaxCalculator() {
  const { t } = useTranslation()
  const { formatCurrency, formatNumber } = useFormatters()
  const navigate = useNavigate()
  const { state, addWorkPeriod, updateWorkPeriod, deleteWorkPeriod, setTaxConfig, setAnnualNetIncome } = useFinancial()

  const workPeriods = state.workPeriods || []

  const [taxYear, setTaxYear] = useState<TaxYear>(2026)
  const [grossIncomeOverride, setGrossIncomeOverride] = useState<number | null>(null)
  const [grossIncomeTaxableOverride, setGrossIncomeTaxableOverride] = useState<number | null>(null)
  const [taxExemption, setTaxExemption] = useState(state.taxConfig?.taxExemption || 0)
  const [showTaxableIncomeDetails, setShowTaxableIncomeDetails] = useState(false)
  const [showIncomeTaxDetails, setShowIncomeTaxDetails] = useState(false)
  const [showNetIncomeDetails, setShowNetIncomeDetails] = useState(false)
  const [showWorkConfig, setShowWorkConfig] = useState(false)

  const calculatedGrossIncome = workPeriods
    .filter(wp => wp.incomeYear)
    .reduce((sum, wp) => sum + Math.round(wp.workdays * wp.workingHours * wp.hourlyRate), 0)

  const calculatedGrossIncomeTaxable = workPeriods
    .filter(wp => wp.taxYear)
    .reduce((sum, wp) => sum + Math.round(wp.workdays * wp.workingHours * wp.hourlyRate), 0)

  const grossIncome = grossIncomeOverride !== null ? grossIncomeOverride : calculatedGrossIncome
  const grossIncomeTaxable = grossIncomeTaxableOverride !== null ? grossIncomeTaxableOverride : calculatedGrossIncomeTaxable

  const handleWorkPeriodChange = (id: string, field: keyof WorkPeriod, value: string | number | boolean) => {
    const period = workPeriods.find(wp => wp.id === id)
    if (!period) return

    const updatedPeriod = { ...period, [field]: value }
    updateWorkPeriod(updatedPeriod)
  }

  const handleAddWorkPeriod = () => {
    const newPeriod: WorkPeriod = {
      id: generateId(),
      period: taxYear.toString(),
      workdays: 20,
      workingHours: 8,
      hourlyRate: 95,
      incomeYear: true,
      taxYear: true,
    }
    addWorkPeriod(newPeriod)
  }

  const handleDeleteWorkPeriod = (id: string) => {
    deleteWorkPeriod(id)
  }

  const handleTaxExemptionChange = (value: number) => {
    setTaxConfig({ taxExemption: value })
    setTaxExemption(value)
  }

  const handleGrossIncomeOverride = (value: number) => {
    if (value === calculatedGrossIncome) {
      setGrossIncomeOverride(null)
    } else {
      setGrossIncomeOverride(value)
    }
  }

  const handleGrossIncomeTaxableOverride = (value: number) => {
    if (value === calculatedGrossIncomeTaxable) {
      setGrossIncomeTaxableOverride(null)
    } else {
      setGrossIncomeTaxableOverride(value)
    }
  }

  const taxableIncome = Math.max(0, grossIncomeTaxable - taxExemption)

  const result = useMemo(() => {
    return calculateGermanTax(taxableIncome, taxYear)
  }, [taxableIncome, taxYear])

  const netIncome = grossIncome - result.totalTax

  const translateZone = (name: string): { name: string; description: string } => {
    if (name === 'Nullzone (0%)') {
      return {
        name: t('zoneZeroName'),
        description: t('zoneZeroDescription')
      }
    }

    const zoneMap: Record<string, string> = {
      'Untere Progressionszone (14-24%)': t('zoneLowerProgressive'),
      'Obere Progressionszone (24-42%)': t('zoneUpperProgressive'),
      'Proportionalzone (42%)': t('zoneProportional'),
      'Reichensteuer (45%)': t('zoneTopRate'),
    }
    return { name: zoneMap[name] || name, description: '' }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('backToToolbox')}</span>
          </Link>
          <div className="flex items-center gap-3">
            <Calculator className="w-10 h-10 text-green-600" />
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">{t('tool_tax')}</h1>
              <p className="text-gray-600">{t('taxCalculatorSubtitle')}</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 rounded-lg">
                <Calculator className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('totalTax')}</p>
                <p className="text-2xl font-bold text-rose-600">{formatCurrency(result.totalTax)}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 rounded-lg">
                <Percent className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('effectiveTaxRate')}</p>
                <p className="text-2xl font-bold text-amber-600">{formatNumber(result.effectiveRate)}%</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('marginalTaxRate')}</p>
                <p className="text-2xl font-bold text-blue-600">~{Math.round(result.marginalRate)}%</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 rounded-lg">
                <Calculator className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('quarterlyTaxPrepayment')}</p>
                <p className="text-2xl font-bold text-amber-600">{formatCurrency(result.totalTax / 4)}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card title={t('input')}>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('taxYear')}
                  </label>
                  <select
                    value={taxYear}
                    onChange={(e) => setTaxYear(Number(e.target.value) as TaxYear)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value={2024}>2024</option>
                    <option value={2025}>2025</option>
                    <option value={2026}>2026</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('taxExemption')} (€)
                  </label>
                  <input
                    type="number"
                    value={taxExemption}
                    onChange={(e) => handleTaxExemptionChange(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    min="0"
                    step="100"
                  />
                </div>
              </div>

              {/* Gross Income and Gross Income (Taxable) side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('grossIncome')} (€)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={grossIncome}
                      onChange={(e) => handleGrossIncomeOverride(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      min="0"
                      step="100"
                    />
                  </div>
                  {grossIncomeOverride !== null && (
                    <p className="text-xs text-gray-500 mt-1">
                      <button 
                        onClick={() => setGrossIncomeOverride(null)} 
                        className="underline hover:text-gray-700"
                      >
                        {t('resetToCalculated', { value: formatCurrency(calculatedGrossIncome) })}
                      </button>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('grossIncomeTaxable')} (€)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={grossIncomeTaxable}
                      onChange={(e) => handleGrossIncomeTaxableOverride(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      min="0"
                      step="100"
                    />
                  </div>
                  {grossIncomeTaxableOverride !== null && (
                    <p className="text-xs text-gray-500 mt-1">
                      <button 
                        onClick={() => setGrossIncomeTaxableOverride(null)} 
                        className="underline hover:text-gray-700"
                      >
                        {t('resetToCalculated', { value: formatCurrency(calculatedGrossIncomeTaxable) })}
                      </button>
                    </p>
                  )}
                </div>
              </div>

              <div className="border border-gray-300 rounded-lg p-4 space-y-2">
                <div
                  onClick={() => setShowWorkConfig(!showWorkConfig)}
                  className="flex items-center justify-between hover:bg-gray-200 -mx-2 px-2 py-2 rounded cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-gray-700">
                    {showWorkConfig ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    <span className="font-medium">{t('workPeriods')}</span>
                  </div>
                  <span className="font-bold text-gray-700">{formatCurrency(grossIncome)}</span>
                </div>

                {showWorkConfig && (
                  <div className="mt-3 space-y-3 pl-6">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-2 py-2 text-left font-medium text-gray-600">{t('period')}</th>
                            <th className="px-2 py-2 text-left font-medium text-gray-600">{t('days')}</th>
                            <th className="px-2 py-2 text-left font-medium text-gray-600">{t('hours')}</th>
                            <th className="px-2 py-2 text-left font-medium text-gray-600">{t('rate')}</th>
                            <th className="px-2 py-2 text-center font-medium text-gray-600">{t('incomeShort')}</th>
                            <th className="px-2 py-2 text-center font-medium text-gray-600">{t('tax')}</th>
                            <th className="px-2 py-2"></th>
                          </tr>
                        </thead>
                        <tbody>
                        {workPeriods.map((wp) => (
                          <tr key={wp.id} className="border-b border-gray-100">
                            <td className="px-2 py-2">
                              <input
                                type="text"
                                value={wp.period}
                                onChange={(e) => handleWorkPeriodChange(wp.id, 'period', e.target.value)}
                                className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="number"
                                value={wp.workdays}
                                onChange={(e) => handleWorkPeriodChange(wp.id, 'workdays', Number(e.target.value))}
                                className="w-14 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                                min="0"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="number"
                                value={wp.workingHours}
                                onChange={(e) => handleWorkPeriodChange(wp.id, 'workingHours', Number(e.target.value))}
                                className="w-14 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                                min="0"
                                step="0.5"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="number"
                                value={wp.hourlyRate}
                                onChange={(e) => handleWorkPeriodChange(wp.id, 'hourlyRate', Number(e.target.value))}
                                className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                                min="0"
                                step="0.01"
                              />
                            </td>
                            <td className="px-2 py-2 text-center">
                              <input
                                type="checkbox"
                                checked={wp.incomeYear}
                                onChange={(e) => handleWorkPeriodChange(wp.id, 'incomeYear', e.target.checked)}
                                className="w-4 h-4 text-green-600 rounded"
                              />
                            </td>
                            <td className="px-2 py-2 text-center">
                              <input
                                type="checkbox"
                                checked={wp.taxYear}
                                onChange={(e) => handleWorkPeriodChange(wp.id, 'taxYear', e.target.checked)}
                                className="w-4 h-4 text-green-600 rounded"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <button
                                onClick={() => handleDeleteWorkPeriod(wp.id)}
                                className="p-1 text-red-500 hover:text-red-700"
                                title={t('deleteRow')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        <tr>
                          <td colSpan={6}></td>
                          <td className="px-2 py-2">
                            <button
                              onClick={handleAddWorkPeriod}
                              className="text-green-600 hover:text-green-700"
                              title={t('addRow')}
                            >
                              <SquarePlus className="w-6 h-6" />
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              </div>
              </div>
            </Card>

          <Card title={t('result')}>
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg p-4 space-y-2">
                <div
                  onClick={() => setShowTaxableIncomeDetails(!showTaxableIncomeDetails)}
                  className="flex items-center justify-between hover:bg-gray-200 -mx-2 px-2 py-2 rounded cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-gray-700">
                    {showTaxableIncomeDetails ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    <span className="font-medium">{t('taxableIncome')}</span>
                  </div>
                  <span className="font-bold text-gray-700">{formatCurrency(result.taxableIncome)}</span>
                </div>

                {showTaxableIncomeDetails && (
                  <div className="mt-2 space-y-2 pl-6">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-gray-700">{t('grossIncomeTaxable')}</span>
                      <span className="text-gray-700">{formatCurrency(grossIncomeTaxable)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-gray-700">{t('taxExemption')}</span>
                      <span className="text-rose-600">-{formatCurrency(taxExemption)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-rose-50 rounded-lg p-4 space-y-2">
                <div
                  onClick={() => setShowIncomeTaxDetails(!showIncomeTaxDetails)}
                  className="flex items-center justify-between hover:bg-rose-100 -mx-2 px-2 py-2 rounded cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-rose-700">
                    {showIncomeTaxDetails ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    <span className="font-medium">{t('incomeTax')} ({result.incomeTaxRate.toFixed(2)}%)</span>
                  </div>
                  <span className="font-bold text-rose-700">{formatCurrency(result.incomeTax)}</span>
                </div>

                {showIncomeTaxDetails && (
                  <div className="mt-2 space-y-2 pl-6">
                    {result.breakdown.map((zone) => {
                      const translated = translateZone(zone.name)
                      return (
                      <div key={zone.zone} className="flex justify-between items-center py-1 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">{translated.name}</span>
                          <span className="text-gray-400 text-xs ml-2">
                            ({formatCurrency(zone.incomeInZone)}{translated.description && ` ${translated.description}`})
                          </span>
                        </div>
                        <span className="text-rose-600">{formatCurrency(zone.taxInZone)}</span>
                      </div>
                    )})}
                  </div>
                )}

                <div className="pl-6">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700 text-sm flex items-center gap-1">
                      {t('solidaritySurcharge')} ({result.soliBreakdown.rate.toFixed(2)}%)
                      <span title={taxYear === 2024 ? t('soliTooltip2024') : taxYear === 2025 ? t('soliTooltip2025') : t('soliTooltip2026')}>
                        <CircleHelp className="w-3.5 h-3.5 cursor-help" />
                      </span>
                    </span>
                    <span className="text-rose-600 text-sm">{formatCurrency(result.solidaritySurcharge, 2)}</span>
                  </div>
                </div>
                <div className="pl-6">
                  <div className="border-t border-rose-200 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-rose-800">{t('totalTax')}</span>
                      <span className="text-xl font-bold text-rose-800">{formatCurrency(result.totalTax)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 rounded-lg p-4 space-y-2">
                <div
                  onClick={() => setShowNetIncomeDetails(!showNetIncomeDetails)}
                  className="flex items-center justify-between hover:bg-emerald-100 -mx-2 px-2 py-2 rounded cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-emerald-700">
                    {showNetIncomeDetails ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    <span className="font-medium">{t('netIncome')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      onClick={(e) => {
                        e.stopPropagation()
                        setAnnualNetIncome(netIncome)
                        navigate('/income-expenditure')
                      }}
                      className="text-teal-600 hover:text-teal-700 transition-colors cursor-pointer"
                      title={t('syncWithIncomeExpenditure')}
                    >
                      <Receipt className="w-4 h-4" />
                    </span>
                    <span className="font-bold text-emerald-700">{formatCurrency(netIncome)}</span>
                  </div>
                </div>

                {showNetIncomeDetails && (
                  <div className="mt-2 space-y-2 pl-6 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">{t('grossIncome')}</span>
                      <span className="text-gray-700">{formatCurrency(grossIncome)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">{t('totalTax')}</span>
                      <span className="text-rose-600">- {formatCurrency(result.totalTax)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

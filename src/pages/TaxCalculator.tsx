import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Calculator, ChevronDown, ChevronRight } from 'lucide-react'
import { Card } from '../components/Card'
import { useTranslation } from '../hooks/useTranslation'
import { useFormatters } from '../hooks/useFormatters'
import { calculateGermanTax } from '../utils/taxCalculator'
import type { TaxYear } from '../types/tax'
import { WorkDayConfig } from '../components/income/WorkDayConfig'
import { IncomeCalculator } from '../components/income/IncomeCalculator'

export function TaxCalculator() {
  const { t } = useTranslation()
  const { formatCurrency, formatNumber } = useFormatters()
  const [taxYear, setTaxYear] = useState<TaxYear>(2026)
  const [income, setIncome] = useState(12348)
  const [showBreakdown, setShowBreakdown] = useState(false)

  const result = useMemo(() => {
    return calculateGermanTax(income, taxYear)
  }, [income, taxYear])

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
              <p className="text-gray-600">Berechnung der deutschen Einkommensteuer nach §32a EStG</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card title="Eingabe">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Steuerjahr
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
                  Zu versteuerndes Einkommen (€)
                </label>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 text-lg">€</span>
                  <input
                    type="number"
                    value={income}
                    onChange={(e) => setIncome(Math.max(0, Number(e.target.value)))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    min="0"
                    step="100"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Jahresbrutto abzüglich aller Abzüge und Freibeträge
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  <strong>Grundfreibetrag:</strong> €
                  {taxYear === 2024 ? '11.784' : taxYear === 2025 ? '12.096' : '12.348'}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {taxYear === 2024 
                    ? 'Einkommen bis €11.784 ist steuerfrei'
                    : taxYear === 2025
                    ? 'Einkommen bis €12.096 ist steuerfrei'
                    : 'Einkommen bis €12.348 ist steuerfrei'}
                </p>
              </div>
            </div>
          </Card>

          <Card title="Ergebnis">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Bruttoeinkommen</span>
                <span className="font-medium">{formatCurrency(result.grossIncome)}</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-600">Zu versteuerndes Einkommen</span>
                <span className="font-medium">{formatCurrency(result.taxableIncome)}</span>
              </div>

              <div className="bg-rose-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-rose-700">Einkommensteuer</span>
                  <span className="text-xl font-bold text-rose-700">-{formatCurrency(result.incomeTax)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-rose-600 text-sm">
                    Solidaritätszuschlag ({result.soliBreakdown.name})
                  </span>
                  <span className="text-rose-600 text-sm">-{formatCurrency(result.solidaritySurcharge, 2)}</span>
                </div>
                <div className="border-t border-rose-200 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-rose-800">Gesamtsteuer</span>
                    <span className="text-xl font-bold text-rose-800">-{formatCurrency(result.totalTax)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-sm text-gray-600">Effektiver Steuersatz</p>
                  <p className="text-2xl font-bold text-gray-800">{formatNumber(result.effectiveRate)}%</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-sm text-gray-600">Grenzsteuersatz</p>
                  <p className="text-2xl font-bold text-gray-800">~{Math.round(result.marginalRate)}%</p>
                </div>
              </div>

              <div className="text-center text-xl font-bold text-green-600 pt-2">
                Netto: {formatCurrency(result.grossIncome - result.totalTax)}
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="w-full flex items-center justify-between hover:bg-gray-50 -mx-4 px-4 py-2 rounded"
            >
              <span className="font-medium text-gray-700">Steuerberechnung nach Zonen</span>
              {showBreakdown ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              )}
            </button>

            {showBreakdown && (
              <div className="mt-4 space-y-3">
                {result.breakdown.map((zone) => (
                  <div key={zone.zone} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <span className="font-medium text-gray-700">{zone.name}</span>
                      <span className="text-gray-400 text-sm ml-2">
                        ({formatCurrency(zone.incomeInZone)})
                      </span>
                    </div>
                    <span className="text-rose-600">-{formatCurrency(zone.taxInZone)}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                  <span className="font-semibold text-gray-800">Summe</span>
                  <span className="font-bold text-rose-700">-{formatCurrency(result.incomeTax)}</span>
                </div>
              </div>
            )}
          </Card>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Einkommensberechnung</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <IncomeCalculator />
            <WorkDayConfig onSave={() => {}} />
          </div>
        </div>
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { ArrowLeft, Receipt, TrendingUp, TrendingDown, PiggyBank, Calculator } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useFormatters } from '../hooks/useFormatters'
import { useFinancial } from '../contexts/FinancialContext'
import { Card } from '../components/Card'
import { ExpenditureList } from '../components/expenditure/ExpenditureList'

export function IncomeExpenditurePage() {
  const { t } = useTranslation()
  const { formatCurrency } = useFormatters()
  const { state, setAnnualNetIncome } = useFinancial()

  const annualNetIncome = state.annualNetIncome || 0
  const monthlyIncome = Math.round(annualNetIncome / 12)
  const expenditures = state.expenditures || []
  const totalMonthlyExpenditures = expenditures.reduce((sum, exp) => sum + exp.amount, 0)
  const monthlyBuffer = monthlyIncome - totalMonthlyExpenditures

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('backToToolbox')}</span>
          </Link>
          <div className="flex items-center gap-3">
            <Receipt className="w-10 h-10 text-teal-600" />
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">{t('tool_incomeExpenditure')}</h1>
              <p className="text-gray-600">{t('incomeExpenditureSubtitle')}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-teal-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('monthlyIncome')}</p>
                <p className="text-2xl font-bold text-teal-600">{formatCurrency(monthlyIncome)}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 rounded-lg">
                <TrendingDown className="w-6 h-6 text-rose-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('monthlyExpenditures')}</p>
                <p className="text-2xl font-bold text-rose-600">{formatCurrency(totalMonthlyExpenditures)}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <PiggyBank className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('monthlyBuffer')}</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(monthlyBuffer)}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 rounded-lg">
                <Calculator className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('taxPrepayment')}</p>
                <p className="text-lg font-bold text-amber-600">Coming soon</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="mb-8">
          <Card title={t('annualNetIncome')}>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-lg">€</span>
              <input
                type="number"
                value={annualNetIncome}
                onChange={(e) => setAnnualNetIncome(Math.max(0, Number(e.target.value)))}
                className="w-40 px-3 py-2 text-xl font-bold text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                min="0"
                step="100"
              />
            </div>
          </Card>
        </div>

        <div className="mb-8">
          <ExpenditureList />
        </div>
      </div>
    </div>
  )
}

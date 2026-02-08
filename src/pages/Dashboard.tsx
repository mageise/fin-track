import { useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Plus,
  Trash2,
  Edit2,
  PieChart as PieChartIcon,
  ArrowLeft,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useFinancial } from '../contexts/FinancialContext'
import { useTranslation } from '../hooks/useTranslation'
import { useFormatters } from '../hooks/useFormatters'
import { Card } from '../components/Card'
import { AssetForm } from '../components/AssetForm'
import { LiabilityForm } from '../components/LiabilityForm'
import { ASSET_TYPES, LIABILITY_TYPES } from '../types/financial'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

function SummaryCard({
  title,
  value,
  icon: Icon,
  trend,
  colorClass,
}: {
  title: string
  value: string
  icon: React.ElementType
  trend?: string
  colorClass: string
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
          {trend && <p className="text-sm text-gray-500 mt-1">{trend}</p>}
        </div>
        <div className={`p-3 rounded-lg ${colorClass.replace('text-', 'bg-').replace('600', '100')}`}>
          <Icon className={`w-6 h-6 ${colorClass}`} />
        </div>
      </div>
    </Card>
  )
}

export function Dashboard() {
  const {
    state,
    totalAssets,
    totalLiabilities,
    netWorth,
    fireProgress,
    deleteAsset,
    deleteLiability,
    firstName,
  } = useFinancial()
  const { t } = useTranslation()
  const { formatCurrency, formatShortDate } = useFormatters()

  const [showAssetForm, setShowAssetForm] = useState(false)
  const [showLiabilityForm, setShowLiabilityForm] = useState(false)
  const [editingAsset, setEditingAsset] = useState<string | null>(null)
  const [editingLiability, setEditingLiability] = useState<string | null>(null)

  const assetData = ASSET_TYPES.map((type) => ({
    name: type.label,
    value: state.assets
      .filter((a) => a.type === type.value)
      .reduce((sum, a) => sum + a.value, 0),
  })).filter((item) => item.value > 0)

  const netWorthChartData = state.netWorthHistory.slice(-12).map((entry) => ({
    date: formatShortDate(entry.date),
    netWorth: entry.netWorth,
    assets: entry.assets,
    liabilities: entry.liabilities,
  }))

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('backToToolbox')}</span>
          </Link>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {firstName ? `${t('welcomeBack')}, ${firstName}!` : t('dashboardTitle')}
          </h1>
          <p className="text-gray-600">{t('dashboardSubtitle')}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard
            title={t('fireProgress')}
            value={`${fireProgress.toFixed(1)}%`}
            icon={Target}
            trend={`${t('fireGoalLabel')}: ${formatCurrency(state.fireGoal)}`}
            colorClass="text-purple-600"
          />
          <SummaryCard
            title={t('totalAssets')}
            value={formatCurrency(totalAssets)}
            icon={TrendingUp}
            colorClass="text-green-600"
          />
          <SummaryCard
            title={t('totalLiabilities')}
            value={formatCurrency(totalLiabilities)}
            icon={TrendingDown}
            colorClass="text-red-600"
          />
          <SummaryCard
            title={t('netWorth')}
            value={formatCurrency(netWorth)}
            icon={DollarSign}
            colorClass="text-blue-600"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Net Worth Trend */}
          <Card title={t('netWorthTrend')}>
            {netWorthChartData.length > 0 ? (
              <div className="w-full" style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={netWorthChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(value) => formatCurrency(Number(value)).replace(/[€$]/g, '')} />
                    <Tooltip formatter={(value) => typeof value === 'number' ? formatCurrency(value) : String(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="netWorth" stroke="#3b82f6" strokeWidth={2} name={t('netWorth')} />
                    <Line type="monotone" dataKey="assets" stroke="#10b981" strokeWidth={2} name={t('totalAssets')} />
                    <Line type="monotone" dataKey="liabilities" stroke="#ef4444" strokeWidth={2} name={t('totalLiabilities')} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <TrendingUp className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                  <p className="text-lg font-medium">{t('noHistoryYet')}</p>
                  <p className="text-sm text-gray-400 mt-1">{t('addAssetsOrLiabilities')}</p>
                </div>
              </div>
            )}
          </Card>

          {/* Asset Allocation */}
          <Card title={t('assetAllocation')}>
            {assetData.length > 0 ? (
              <div className="w-full" style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={assetData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {assetData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => typeof value === 'number' ? formatCurrency(value) : String(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                <div className="text-center">
                  <PieChartIcon className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                  <p className="text-lg font-medium">{t('noAssetDataYet')}</p>
                  <p className="text-sm text-gray-400 mt-1">{t('addFirstAsset')}</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Assets & Liabilities Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assets Section */}
          <Card title={t('assets')} className="h-full">
            <div className="mb-4">
              <button
                onClick={() => setShowAssetForm(true)}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('addAsset')}
              </button>
            </div>

            {showAssetForm && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <AssetForm onClose={() => setShowAssetForm(false)} />
              </div>
            )}

            <div className="space-y-3">
              {state.assets.map((asset) => (
                <div key={asset.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{asset.name}</div>
                    <div className="text-sm text-gray-500">
                      {ASSET_TYPES.find((t) => t.value === asset.type)?.label}
                    </div>
                    {asset.notes && <div className="text-sm text-gray-400 mt-1">{asset.notes}</div>}
                  </div>
                  <div className="text-right mr-4">
                    <div className="font-semibold text-green-600">{formatCurrency(asset.value)}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingAsset(asset.id)} className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteAsset(asset.id)} className="p-2 text-gray-600 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {editingAsset === asset.id && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                        <AssetForm asset={asset} onClose={() => setEditingAsset(null)} />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {state.assets.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Wallet className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>{t('noAssetsYet')}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Liabilities Section */}
          <Card title={t('liabilities')} className="h-full">
            <div className="mb-4">
              <button
                onClick={() => setShowLiabilityForm(true)}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('addLiability')}
              </button>
            </div>

            {showLiabilityForm && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <LiabilityForm onClose={() => setShowLiabilityForm(false)} />
              </div>
            )}

            <div className="space-y-3">
              {state.liabilities.map((liability) => (
                <div key={liability.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{liability.name}</div>
                    <div className="text-sm text-gray-500">
                      {LIABILITY_TYPES.find((t) => t.value === liability.type)?.label}
                      {liability.interestRate && ` • ${liability.interestRate}% APR`}
                    </div>
                    {liability.notes && <div className="text-sm text-gray-400 mt-1">{liability.notes}</div>}
                  </div>
                  <div className="text-right mr-4">
                    <div className="font-semibold text-red-600">{formatCurrency(liability.value)}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditingLiability(liability.id)} className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteLiability(liability.id)} className="p-2 text-gray-600 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {editingLiability === liability.id && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                        <LiabilityForm liability={liability} onClose={() => setEditingLiability(null)} />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {state.liabilities.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <PieChartIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>{t('noLiabilitiesYet')}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

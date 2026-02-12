import {
  DollarSign,
  TrendingUp,
  Target,
  Receipt,
  LineChart,
  PiggyBank,
  Calculator,
  Shield,
  Settings,
  Database,
  AlertTriangle,
  Scale,
  Wallet,
  Gamepad2,
  Activity,
  FileText,
} from 'lucide-react'
import { ToolTile } from '../components/ToolTile'
import { useTranslation } from '../hooks/useTranslation'

export function Toolbox() {
  const { t } = useTranslation()

  const tools = [
    // Row 1 - Core Tracking
    {
      id: 'net-worth',
      name: t('tool_netWorth'),
      icon: <DollarSign className="w-16 h-16 text-white" />,
      path: '/dashboard',
      color: 'blue',
      isPlaceholder: false,
    },
    {
      id: 'budget',
      name: t('tool_budget'),
      icon: <Wallet className="w-16 h-16 text-white" />,
      path: '/budget',
      color: 'emerald',
      isPlaceholder: false,
    },
    {
      id: 'portfolio',
      name: t('tool_portfolio'),
      icon: <LineChart className="w-16 h-16 text-white" />,
      path: '/portfolio',
      color: 'purple',
      isPlaceholder: false,
    },
    {
      id: 'savings',
      name: t('tool_savings'),
      icon: <PiggyBank className="w-16 h-16 text-white" />,
      path: '/savings',
      color: 'orange',
      isPlaceholder: false,
    },

    // Row 2 - Analysis
    {
      id: 'expenses',
      name: t('tool_expenses'),
      icon: <Receipt className="w-16 h-16 text-white" />,
      path: '/expenses',
      color: 'teal',
      isPlaceholder: true,
    },
    {
      id: 'debt',
      name: t('tool_debt'),
      icon: <AlertTriangle className="w-16 h-16 text-white" />,
      path: '/debt',
      color: 'red',
      isPlaceholder: true,
    },
    {
      id: 'performance',
      name: t('tool_performance'),
      icon: <Activity className="w-16 h-16 text-white" />,
      path: '/performance',
      color: 'amber',
      isPlaceholder: false,
    },
    {
      id: 'reports',
      name: t('tool_reports'),
      icon: <FileText className="w-16 h-16 text-white" />,
      path: '/reports',
      color: 'indigo',
      isPlaceholder: false,
    },

    // Row 3 - Planning
    {
      id: 'fire',
      name: t('tool_fire'),
      icon: <Target className="w-16 h-16 text-white" />,
      path: '/fire',
      color: 'cyan',
      isPlaceholder: false,
    },
    {
      id: 'retirement',
      name: t('tool_retirement'),
      icon: <Shield className="w-16 h-16 text-white" />,
      path: '/retirement',
      color: 'amber',
      isPlaceholder: true,
    },
    {
      id: 'tax',
      name: t('tool_tax'),
      icon: <Calculator className="w-16 h-16 text-white" />,
      path: '/tax',
      color: 'emerald',
      isPlaceholder: true,
    },
    {
      id: 'risk',
      name: t('tool_risk'),
      icon: <Scale className="w-16 h-16 text-white" />,
      path: '/risk',
      color: 'violet',
      isPlaceholder: true,
    },

    // Row 4 - Data & Settings
    {
      id: 'export',
      name: t('tool_export'),
      icon: <Database className="w-16 h-16 text-white" />,
      path: '/export',
      color: 'slate',
      isPlaceholder: true,
    },
    {
      id: 'history',
      name: t('tool_history'),
      icon: <TrendingUp className="w-16 h-16 text-white" />,
      path: '/history',
      color: 'zinc',
      isPlaceholder: true,
    },
    {
      id: 'games',
      name: t('tool_miniGames'),
      icon: <Gamepad2 className="w-16 h-16 text-white" />,
      path: '/games',
      color: 'pink',
      isPlaceholder: false,
    },
    {
      id: 'settings',
      name: t('tool_settings'),
      icon: <Settings className="w-16 h-16 text-white" />,
      path: '/settings',
      color: 'rose',
      isPlaceholder: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            {t('toolboxTitle')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('toolboxSubtitle')}
          </p>
        </div>

        {/* Tools Grid - 4x4 Layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          {tools.map((tool) => (
            <ToolTile
              key={tool.id}
              icon={tool.icon}
              name={tool.name}
              path={tool.path}
              color={tool.color}
              isPlaceholder={tool.isPlaceholder}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>{t('hoverHint')}</p>
          <p className="mt-2">{t('moreToolsComing')}</p>
        </div>
      </div>
    </div>
  )
}

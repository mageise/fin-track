import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, FileText, Download, Plus, Trash2, Loader2, Calendar, Filter, Eye, X } from 'lucide-react'
import { useFinancial } from '../contexts/FinancialContext'
import { Card } from '../components/Card'
import { useTranslation } from '../hooks/useTranslation'
import { useFormatters } from '../hooks/useFormatters'
import type { ReportType, ReportSection, ReportData } from '../types/financial'

const REPORT_TYPES: { value: ReportType; label: string }[] = [
  { value: 'comprehensive', label: 'Comprehensive Report' },
  { value: 'net-worth-summary', label: 'Net Worth Summary' },
  { value: 'investment-performance', label: 'Investment Performance' },
  { value: 'budget-analysis', label: 'Budget Analysis' },
  { value: 'savings-progress', label: 'Savings Progress' },
]

const DATE_RANGES = [
  { value: 'last-30-days', label: 'Last 30 Days' },
  { value: 'last-90-days', label: 'Last 90 Days' },
  { value: 'current-month', label: 'Current Month' },
  { value: 'current-year', label: 'Current Year' },
  { value: 'ytd', label: 'Year to Date' },
  { value: 'custom', label: 'Custom Range' },
]

const SECTIONS: { value: ReportSection; label: string }[] = [
  { value: 'summary', label: 'Executive Summary' },
  { value: 'net-worth', label: 'Net Worth' },
  { value: 'investments', label: 'Investments' },
  { value: 'budget', label: 'Budget' },
  { value: 'savings', label: 'Savings Goals' },
]

export function Reports() {
  const { t } = useTranslation()
  const { formatDate } = useFormatters()
  const { state, generateReport, deleteReport } = useFinancial()

  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedType, setSelectedType] = useState<ReportType>('comprehensive')
  const [selectedDateRange, setSelectedDateRange] = useState('last-30-days')
  const [selectedSections, setSelectedSections] = useState<ReportSection[]>(['summary', 'net-worth', 'investments'])
  const [viewingReport, setViewingReport] = useState<string | null>(null)

  const handleGenerateReport = async () => {
    setIsGenerating(true)

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()

    switch (selectedDateRange) {
      case 'last-30-days':
        startDate.setDate(endDate.getDate() - 30)
        break
      case 'last-90-days':
        startDate.setDate(endDate.getDate() - 90)
        break
      case 'current-month':
        startDate.setDate(1)
        break
      case 'current-year':
        startDate.setMonth(0, 1)
        break
      case 'ytd':
        startDate.setMonth(0, 1)
        break
    }

    // Generate report data
    const reportData: ReportData = {}

    // Net Worth Data
    if (selectedSections.includes('net-worth') || selectedSections.includes('summary')) {
      const totalAssets = state.assets.reduce((sum, asset) => sum + asset.value, 0)
      const totalLiabilities = state.liabilities.reduce((sum, liability) => sum + liability.value, 0)
      const currentNetWorth = totalAssets - totalLiabilities

      // Find start net worth from history or estimate
      const startNetWorth = state.netWorthHistory.length > 0
        ? state.netWorthHistory[0].netWorth
        : currentNetWorth

      reportData.netWorth = {
        startAmount: startNetWorth,
        endAmount: currentNetWorth,
        change: currentNetWorth - startNetWorth,
        changePercent: startNetWorth !== 0 ? ((currentNetWorth - startNetWorth) / Math.abs(startNetWorth)) * 100 : 0
      }
    }

    // Investment Data
    if (selectedSections.includes('investments') || selectedSections.includes('summary')) {
      const investments = state.investments.map(inv => {
        const currentValue = inv.shares * inv.currentPrice
        const costBasis = inv.shares * inv.costBasis
        const gain = currentValue - costBasis
        const gainPercent = costBasis > 0 ? (gain / costBasis) * 100 : 0
        return {
          symbol: inv.symbol,
          name: inv.name,
          gain,
          gainPercent
        }
      })

      const totalValue = state.investments.reduce((sum, inv) => sum + (inv.shares * inv.currentPrice), 0)
      const totalCost = state.investments.reduce((sum, inv) => sum + (inv.shares * inv.costBasis), 0)
      const totalGain = totalValue - totalCost

      // Build allocation by type
      const typeMap = new Map<string, number>()
      state.investments.forEach(inv => {
        const value = inv.shares * inv.currentPrice
        typeMap.set(inv.type, (typeMap.get(inv.type) || 0) + value)
      })

      // Build allocation by account
      const accountMap = new Map<string, number>()
      state.investments.forEach(inv => {
        const value = inv.shares * inv.currentPrice
        accountMap.set(inv.account, (accountMap.get(inv.account) || 0) + value)
      })

      reportData.investments = {
        totalValue,
        totalGain,
        totalReturn: totalCost > 0 ? (totalGain / totalCost) * 100 : 0,
        topPerformers: investments.length > 0
          ? [...investments].sort((a, b) => b.gainPercent - a.gainPercent).slice(0, 3)
          : [],
        worstPerformers: investments.length > 0
          ? [...investments].sort((a, b) => a.gainPercent - b.gainPercent).slice(0, 3)
          : [],
        allocationByType: Array.from(typeMap.entries()).map(([name, value]) => ({ name, value })),
        allocationByAccount: Array.from(accountMap.entries()).map(([name, value]) => ({ name, value }))
      }
    }

    // Budget Data
    if (selectedSections.includes('budget') || selectedSections.includes('summary')) {
      const activeScenario = state.budgetScenarios[0]
      if (activeScenario) {
        const totalBudget = activeScenario.budgetLimit || 0
        const totalSpent = activeScenario.lineItems.reduce((sum, item) => sum + item.amount, 0)
        const categoryBreakdown = activeScenario.lineItems.map(item => ({
          category: item.category,
          budget: item.amount,
          spent: item.amount,
          remaining: 0
        }))

        reportData.budget = {
          totalBudget,
          totalSpent,
          totalRemaining: totalBudget - totalSpent,
          adherencePercent: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
          categoryBreakdown,
          overspentCategories: totalSpent > totalBudget ? ['Total'] : []
        }
      }
    }

    // Savings Data
    if (selectedSections.includes('savings') || selectedSections.includes('summary')) {
      const totalSaved = state.savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0)
      const totalTarget = state.savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0)
      const completedGoals = state.savingsGoals.filter(goal => goal.currentAmount >= goal.targetAmount).length

      reportData.savings = {
        totalSaved,
        totalTarget,
        progressPercent: totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0,
        completedGoals,
        activeGoals: state.savingsGoals.length - completedGoals,
        goalsProgress: state.savingsGoals.map(goal => ({
          name: goal.name,
          currentAmount: goal.currentAmount,
          targetAmount: goal.targetAmount,
          progressPercent: goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0
        }))
      }
    }

    const reportType = REPORT_TYPES.find(r => r.value === selectedType)

    generateReport({
      type: selectedType,
      title: `${reportType?.label} - ${formatDate(startDate.toISOString())} to ${formatDate(endDate.toISOString())}`,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      sections: selectedSections,
      data: reportData
    })

    // Simulate generation delay
    setTimeout(() => {
      setIsGenerating(false)
    }, 1500)
  }

  const handleToggleSection = (section: ReportSection) => {
    if (selectedSections.includes(section)) {
      setSelectedSections(selectedSections.filter(s => s !== section))
    } else {
      setSelectedSections([...selectedSections, section])
    }
  }

  const handleExportCSV = (reportId: string) => {
    const report = state.reports.find(r => r.id === reportId)
    if (!report) return

    let csvContent = ''
    const timestamp = new Date().toISOString().split('T')[0]

    // Add report header
    csvContent += `Report: ${report.title}\n`
    csvContent += `Generated: ${formatDate(report.generatedAt)}\n`
    csvContent += `Date Range: ${formatDate(report.dateRange.start)} to ${formatDate(report.dateRange.end)}\n\n`

    // Net Worth Section
    if (report.data.netWorth) {
      csvContent += 'NET WORTH SUMMARY\n'
      csvContent += 'Metric,Value\n'
      csvContent += `Start Amount,€${report.data.netWorth.startAmount.toLocaleString()}\n`
      csvContent += `End Amount,€${report.data.netWorth.endAmount.toLocaleString()}\n`
      csvContent += `Change,€${report.data.netWorth.change.toLocaleString()}\n`
      csvContent += `Change %,${report.data.netWorth.changePercent.toFixed(2)}%\n\n`
    }

    // Investments Section
    if (report.data.investments) {
      csvContent += 'INVESTMENT PERFORMANCE\n'
      csvContent += 'Metric,Value\n'
      csvContent += `Total Value,€${report.data.investments.totalValue.toLocaleString()}\n`
      csvContent += `Total Gain/Loss,€${report.data.investments.totalGain.toLocaleString()}\n`
      csvContent += `Total Return,${report.data.investments.totalReturn.toFixed(2)}%\n\n`

      if (report.data.investments.topPerformers.length > 0) {
        csvContent += 'TOP PERFORMERS\n'
        csvContent += 'Symbol,Name,Gain %\n'
        report.data.investments.topPerformers.forEach(perf => {
          csvContent += `${perf.symbol},${perf.name},${perf.gainPercent.toFixed(2)}%\n`
        })
        csvContent += '\n'
      }
    }

    // Budget Section
    if (report.data.budget) {
      csvContent += 'BUDGET ANALYSIS\n'
      csvContent += 'Metric,Value\n'
      csvContent += `Total Budget,€${report.data.budget.totalBudget.toLocaleString()}\n`
      csvContent += `Total Spent,€${report.data.budget.totalSpent.toLocaleString()}\n`
      csvContent += `Remaining,€${report.data.budget.totalRemaining.toLocaleString()}\n`
      csvContent += `Adherence,${report.data.budget.adherencePercent.toFixed(1)}%\n\n`
    }

    // Savings Section
    if (report.data.savings) {
      csvContent += 'SAVINGS PROGRESS\n'
      csvContent += 'Metric,Value\n'
      csvContent += `Total Saved,€${report.data.savings.totalSaved.toLocaleString()}\n`
      csvContent += `Total Target,€${report.data.savings.totalTarget.toLocaleString()}\n`
      csvContent += `Progress,${report.data.savings.progressPercent.toFixed(1)}%\n`
      csvContent += `Completed Goals,${report.data.savings.completedGoals}\n`
      csvContent += `Active Goals,${report.data.savings.activeGoals}\n\n`

      if (report.data.savings.goalsProgress.length > 0) {
        csvContent += 'GOALS BREAKDOWN\n'
        csvContent += 'Goal Name,Current Amount,Target Amount,Progress %\n'
        report.data.savings.goalsProgress.forEach(goal => {
          csvContent += `${goal.name},€${goal.currentAmount.toLocaleString()},€${goal.targetAmount.toLocaleString()},${goal.progressPercent.toFixed(1)}%\n`
        })
      }
    }

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `fintrack-report-${report.type}-${timestamp}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleExportPDF = (reportId: string) => {
    // TODO: Implement PDF export
    console.log('Exporting PDF for report:', reportId)
  }

  const handleViewReport = (reportId: string) => {
    setViewingReport(reportId)
  }

  const handleCloseViewer = () => {
    setViewingReport(null)
  }

  const selectedReportData = viewingReport ? state.reports.find(r => r.id === viewingReport) : null

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('backToToolbox')}</span>
          </Link>
          <div className="flex items-center gap-3">
            <FileText className="w-10 h-10 text-indigo-600" />
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">{t('tool_reports')}</h1>
              <p className="text-gray-600">Generate and export comprehensive financial reports</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-indigo-600">{state.reports.length}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Generated</p>
                <p className="text-2xl font-bold text-blue-600">
                  {state.reports.length > 0 
                    ? formatDate(state.reports[state.reports.length - 1].generatedAt)
                    : 'Never'
                  }
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Download className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">PDF Exports</p>
                <p className="text-2xl font-bold text-green-600">{state.reports.length}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Download className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">CSV Exports</p>
                <p className="text-2xl font-bold text-purple-600">{state.reports.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Generate New Report */}
        <Card className="mb-8" title="Generate New Report">
          <div className="space-y-6">
            {/* Report Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as ReportType)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {REPORT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {DATE_RANGES.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sections */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Include Sections
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {SECTIONS.map((section) => (
                  <label
                    key={section.value}
                    className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSections.includes(section.value)}
                      onChange={() => handleToggleSection(section.value)}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{section.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating || selectedSections.length === 0}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </Card>

        {/* Recent Reports */}
        <Card title="Recent Reports">
          {state.reports.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No reports generated yet</p>
              <p className="text-sm text-gray-400 mt-2">Create your first report above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {state.reports.slice().reverse().map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <FileText className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{report.title}</h3>
                      <p className="text-sm text-gray-500">
                        Generated: {formatDate(report.generatedAt)}
                      </p>
                      <p className="text-xs text-gray-400">
                        Sections: {report.sections.join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleViewReport(report.id)}
                      className="p-2 text-gray-600 hover:text-indigo-600 transition-colors"
                      title="View Report"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleExportPDF(report.id)}
                      className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                      title="Export PDF"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleExportCSV(report.id)}
                      className="p-2 text-gray-600 hover:text-green-600 transition-colors"
                      title="Export CSV"
                    >
                      <Filter className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deleteReport(report.id)}
                      className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Report Viewer Modal */}
        {selectedReportData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedReportData.title}</h2>
                  <p className="text-gray-600">
                    Generated: {formatDate(selectedReportData.generatedAt)}
                  </p>
                </div>
                <button
                  onClick={handleCloseViewer}
                  className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Net Worth Section */}
                {selectedReportData.data.netWorth && (
                  <Card title="Net Worth Summary">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Start Amount</p>
                        <p className="text-xl font-bold text-gray-800">
                          €{selectedReportData.data.netWorth.startAmount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">End Amount</p>
                        <p className="text-xl font-bold text-gray-800">
                          €{selectedReportData.data.netWorth.endAmount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Change</p>
                        <p className={`text-xl font-bold ${selectedReportData.data.netWorth.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedReportData.data.netWorth.change >= 0 ? '+' : ''}
                          €{selectedReportData.data.netWorth.change.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Change %</p>
                        <p className={`text-xl font-bold ${selectedReportData.data.netWorth.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedReportData.data.netWorth.changePercent >= 0 ? '+' : ''}
                          {selectedReportData.data.netWorth.changePercent.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Investments Section */}
                {selectedReportData.data.investments && (
                  <Card title="Investment Performance">
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Total Value</p>
                          <p className="text-2xl font-bold text-indigo-600">
                            €{selectedReportData.data.investments.totalValue.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Total Gain/Loss</p>
                          <p className={`text-2xl font-bold ${selectedReportData.data.investments.totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {selectedReportData.data.investments.totalGain >= 0 ? '+' : ''}
                            €{selectedReportData.data.investments.totalGain.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Total Return</p>
                          <p className={`text-2xl font-bold ${selectedReportData.data.investments.totalReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {selectedReportData.data.investments.totalReturn >= 0 ? '+' : ''}
                            {selectedReportData.data.investments.totalReturn.toFixed(2)}%
                          </p>
                        </div>
                      </div>

                      {selectedReportData.data.investments.topPerformers.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Top Performers</h4>
                          <div className="space-y-2">
                            {selectedReportData.data.investments.topPerformers.map((perf, idx) => (
                              <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                <span className="font-medium">{perf.name} ({perf.symbol})</span>
                                <span className="text-green-600 font-semibold">+{perf.gainPercent.toFixed(2)}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {/* Budget Section */}
                {selectedReportData.data.budget && (
                  <Card title="Budget Analysis">
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Total Budget</p>
                          <p className="text-xl font-bold text-gray-800">
                            €{selectedReportData.data.budget.totalBudget.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Spent</p>
                          <p className="text-xl font-bold text-gray-800">
                            €{selectedReportData.data.budget.totalSpent.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Adherence</p>
                          <p className={`text-xl font-bold ${selectedReportData.data.budget.adherencePercent <= 100 ? 'text-green-600' : 'text-red-600'}`}>
                            {selectedReportData.data.budget.adherencePercent.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Savings Section */}
                {selectedReportData.data.savings && (
                  <Card title="Savings Progress">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Total Saved</p>
                          <p className="text-xl font-bold text-green-600">
                            €{selectedReportData.data.savings.totalSaved.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Target</p>
                          <p className="text-xl font-bold text-gray-800">
                            €{selectedReportData.data.savings.totalTarget.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Progress</p>
                          <p className="text-xl font-bold text-blue-600">
                            {selectedReportData.data.savings.progressPercent.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Goals</p>
                          <p className="text-xl font-bold text-purple-600">
                            {selectedReportData.data.savings.completedGoals}/{selectedReportData.data.savings.activeGoals + selectedReportData.data.savings.completedGoals}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

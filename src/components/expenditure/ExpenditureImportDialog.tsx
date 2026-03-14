import { useState, useRef, useCallback } from 'react'
import { X, Upload, AlertCircle, CheckCircle, Settings2, FileSpreadsheet } from 'lucide-react'
import { useFinancial } from '../../contexts/FinancialContext'
import { useTranslation } from '../../hooks/useTranslation'
import { type ExpenditureCategory, type Frequency, FREQUENCIES, EXPENDITURE_SUBCATEGORIES, EXPENDITURE_CATEGORIES } from '../../types/incomeExpenditure'
import { Card } from '../Card'

interface ImportPreviewItem {
  id: string
  name: string
  subcategory: string
  amount: number
  frequency: Frequency
  notes: string
  isValid: boolean
  errors: string[]
  selected: boolean
  originalRow: number
}

interface ColumnMapping {
  name: string
  subcategory: string
  amount: string
  frequency: string
  notes: string
}

const DEFAULT_MAPPING: ColumnMapping = {
  name: '',
  subcategory: '',
  amount: '',
  frequency: '',
  notes: '',
}

const HEADER_PATTERNS: Record<keyof ColumnMapping, string[]> = {
  name: ['name', 'bezeichnung', 'titel'],
  subcategory: ['subcategory', 'unterkategorie', 'category', 'kategorie'],
  amount: ['amount', 'betrag', 'preis', 'summe', 'value', 'monatlich', 'monthly'],
  frequency: ['frequency', 'häufigkeit', 'intervall', 'period', 'zeitraum', 'periode', 'interval'],
  notes: ['notes', 'notizen', 'hinweise', 'description', 'beschreibung', 'comments'],
}

function findBestHeaderMatch(headers: string[], patterns: string[]): string {
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim())
  for (const header of normalizedHeaders) {
    for (const pattern of patterns) {
      if (header.includes(pattern)) {
        return headers[normalizedHeaders.indexOf(header)]
      }
    }
  }
  return ''
}

const SUBCATEGORY_VALUE_PATTERNS: Record<string, string[]> = {
  'Home': ['home', 'wohnung', 'miete', 'rent', 'housing', 'house', 'haus'],
  'Utility': ['utility', 'nebenkosten', 'strom', 'gas', 'water'],
  'Insurance': ['insurance', 'versicherung'],
  'Car': ['car', 'auto', 'fahrzeug', 'kfz'],
  'Shopping': ['shopping', 'einkaufen', 'einkauf', 'einkäufe'],
  'FamilyCo': ['family', 'familie'],
  'House': ['house', 'haus'],
  'Tax': ['tax', 'steuer'],
  'Repayment': ['repayment', 'tilgung'],
  'Vacation': ['vacation', 'urlaub', 'reise'],
  'Purchase': ['purchase', 'anschaffung', 'kauf'],
  'Pension': ['pension', 'rente'],
  'Saving': ['saving', 'sparen'],
  'ETF': ['etf'],
  'Stock': ['stock', 'aktien', 'aktie'],
  'Bond': ['bond', 'anleihe'],
  'Crypto': ['crypto', 'krypt'],
  'Other': ['other', 'sonstiges', 'sonstige'],
}

const FREQUENCY_VALUE_PATTERNS: Record<string, string[]> = {
  'bimonthly': ['bimonthly', 'zweimonatlich', 'two-monthly', 'every two months', 'alle zwei monate'],
  'quarterly': ['quarterly', 'vierteljährlich', 'quartalsweise', 'quarter', 'quartal'],
  'yearly': ['yearly', 'jährlich', 'jährliche', 'year', 'jahr'],
  'monthly': ['monthly', 'monatlich', 'monatliche', 'month', 'monat'],
}

function findBestFrequencyMatch(value: string): string {
  const normalized = value.toLowerCase().trim()
  for (const [freq, patterns] of Object.entries(FREQUENCY_VALUE_PATTERNS)) {
    for (const pattern of patterns) {
      if (normalized.includes(pattern)) {
        return freq
      }
    }
  }
  return 'monthly'
}

function findBestSubcategoryMatch(value: string): string {
  const normalized = value.toLowerCase().trim()
  for (const [subcategory, patterns] of Object.entries(SUBCATEGORY_VALUE_PATTERNS)) {
    for (const pattern of patterns) {
      if (normalized.includes(pattern)) {
        return subcategory
      }
    }
  }
  return 'Other'
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

function parseNumber(value: string): number | null {
  const normalized = value.trim().replace(/\./g, '').replace(',', '.')
  const num = parseFloat(normalized)
  return isNaN(num) ? null : num
}

interface ExpenditureImportDialogProps {
  initialCategory?: ExpenditureCategory
  onClose: () => void
}

export function ExpenditureImportDialog({ initialCategory = 'fixedCosts', onClose }: ExpenditureImportDialogProps) {
  const { t } = useTranslation()
  const { addExpenditure } = useFinancial()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [category, setCategory] = useState<ExpenditureCategory>(initialCategory)
  const [previewData, setPreviewData] = useState<ImportPreviewItem[]>([])
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>(DEFAULT_MAPPING)
  const [processedHeaders, setProcessedHeaders] = useState<{value: string, display: string}[]>([])
  const [rawCSV, setRawCSV] = useState<string[][]>([])
  const [fileName, setFileName] = useState<string>('')
  const [showMapping, setShowMapping] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const subcategories = EXPENDITURE_SUBCATEGORIES[category]
  const frequencies = FREQUENCIES

  const validateItem = useCallback((item: Partial<ImportPreviewItem>): string[] => {
    const errors: string[] = []

    if (!item.name || item.name.trim() === '') {
      errors.push(t('errorNameRequired'))
    }
    if (item.amount === undefined || item.amount <= 0) {
      errors.push(t('errorAmountPositive'))
    }
    if (!item.frequency || !frequencies.find(f => f.value === item.frequency)) {
      errors.push(t('errorFrequencyRequired'))
    }

    return errors
  }, [t, frequencies])

  const processCSV = useCallback((lines: string[][], mapping: ColumnMapping): ImportPreviewItem[] => {
    const items: ImportPreviewItem[] = []
    const headers = lines[0].map(h => h.toLowerCase().trim())

    const getIndex = (headerName: string): number => {
      if (headerName?.startsWith('COLUMN_')) {
        const colNum = parseInt(headerName.replace('COLUMN_', '')) - 1
        return colNum
      }
      if (!headerName) return -1
      return headers.indexOf(headerName.toLowerCase().trim())
    }

    const nameIdx = getIndex(mapping.name)
    const subcategoryIdx = getIndex(mapping.subcategory)
    const amountIdx = getIndex(mapping.amount)
    const frequencyIdx = getIndex(mapping.frequency)
    const notesIdx = getIndex(mapping.notes)

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      if (line.length === 0 || line.every(cell => cell.trim() === '')) continue

      const name = nameIdx >= 0 ? (line[nameIdx] || '').trim() : ''
      const subcategory = subcategoryIdx >= 0 ? findBestSubcategoryMatch(line[subcategoryIdx] || '') : ''
      const amountRaw = amountIdx >= 0 ? parseNumber(line[amountIdx] || '') : null
      const frequencyRaw = frequencyIdx >= 0 ? (line[frequencyIdx] || '').trim().toLowerCase() : ''
      const notes = notesIdx >= 0 ? (line[notesIdx] || '').trim() : ''

      const frequency = (frequencyRaw ? findBestFrequencyMatch(frequencyRaw) : 'monthly') as Frequency

      const amount = amountRaw || 0

      const item: ImportPreviewItem = {
        id: generateId(),
        name,
        subcategory,
        amount,
        frequency,
        notes,
        isValid: false,
        errors: [],
        selected: true,
        originalRow: i + 1,
      }

      item.errors = validateItem(item)
      item.isValid = item.errors.length === 0
      item.selected = item.isValid

      items.push(item)
    }

    return items
  }, [validateItem, frequencies])

  const handleMappingChange = useCallback((field: keyof ColumnMapping, value: string) => {
    const newMapping = { ...columnMapping, [field]: value }
    setColumnMapping(newMapping)

    if (rawCSV.length > 0) {
      const items = processCSV(rawCSV, newMapping)
      setPreviewData(items)
    }
  }, [columnMapping, rawCSV, processCSV])

  const processFile = useCallback((file: File) => {
    setFileName(file.name)
    setIsLoading(true)
    setError(null)

    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const lines = content.split(/\r?\n/).map(line => line.split(';'))

        if (lines.length < 2) {
          setError(t('errorCSVEmpty'))
          setIsLoading(false)
          return
        }

        if (lines.length > 101) {
          setError(t('errorCSVTooManyRows'))
          setIsLoading(false)
          return
        }

        const headers = lines[0].map(h => h.trim())
        
        // Process headers: generate pseudo values for empty headers
        const processedHeaders = headers.map((header, idx) => {
          if (header === '') {
            const colLetter = String.fromCharCode(65 + idx) // A, B, C...
            const pseudoValue = `COLUMN_${idx + 1}`
            const display = t((`column_${colLetter}`) as any)
            return { value: pseudoValue, display }
          }
          return { value: header, display: header }
        })
        
        setProcessedHeaders(processedHeaders)
        setRawCSV(lines)

        const autoMapping: ColumnMapping = {
          name: findBestHeaderMatch(headers, HEADER_PATTERNS.name) || (headers[0] === '' ? 'COLUMN_1' : ''),
          subcategory: findBestHeaderMatch(headers, HEADER_PATTERNS.subcategory),
          amount: findBestHeaderMatch(headers, HEADER_PATTERNS.amount),
          frequency: findBestHeaderMatch(headers, HEADER_PATTERNS.frequency),
          notes: findBestHeaderMatch(headers, HEADER_PATTERNS.notes),
        }
        setColumnMapping(autoMapping)

        const items = processCSV(lines, autoMapping)
        setPreviewData(items)
      } catch {
        setError(t('errorParsingCSV'))
      } finally {
        setIsLoading(false)
      }
    }

    reader.onerror = () => {
      setError(t('errorReadingFile'))
      setIsLoading(false)
    }

    reader.readAsText(file, 'UTF-8')
  }, [t, processCSV])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file && file.name.endsWith('.csv')) {
      processFile(file)
    } else {
      setError(t('errorInvalidFileType'))
    }
  }

  const toggleSelectItem = (id: string) => {
    setPreviewData(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, selected: !item.selected }
      }
      return item
    }))
  }

  const toggleSelectAll = () => {
    const allSelected = previewData.every(item => item.selected)
    setPreviewData(prev => prev.map(item => ({
      ...item,
      selected: !allSelected
    })))
  }

  const handleUpdateItem = (id: string, field: keyof ImportPreviewItem, value: string) => {
    setPreviewData(prev => prev.map(item => {
      if (item.id !== id) return item

      const updated: Partial<ImportPreviewItem> = { ...item }

      if (field === 'amount') {
        updated.amount = parseNumber(value) || 0
      } else if (field === 'subcategory') {
        updated.subcategory = value
      } else if (field === 'frequency') {
        const freq = frequencies.find(f => f.value === value || f.label.toLowerCase() === value.toLowerCase())
        updated.frequency = freq?.value || 'monthly'
      } else if (field === 'name') {
        updated.name = value
      } else if (field === 'notes') {
        updated.notes = value
      }

      updated.errors = validateItem(updated)
      updated.isValid = updated.errors.length === 0

      return updated as ImportPreviewItem
    }))
  }

  const handleImport = useCallback(() => {
    const selectedItems = previewData.filter(item => item.selected && item.isValid)

    selectedItems.forEach(item => {
      addExpenditure({
        name: item.name,
        category: category,
        subcategory: item.subcategory || undefined,
        amount: item.amount,
        frequency: item.frequency,
        isRecurring: true,
        startDate: new Date().toISOString().split('T')[0],
        notes: item.notes || undefined,
      })
    })

    onClose()
  }, [previewData, category, addExpenditure, onClose, frequencies])

  const validCount = previewData.filter(item => item.isValid).length
  const selectedCount = previewData.filter(item => item.selected).length
  const invalidCount = previewData.filter(item => !item.isValid).length

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{t('importExpendituresTitle')}</h2>
            <p className="text-gray-600 mt-1">
              {t('importExpendituresSubtitle')}
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Category Selection */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('category')}
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenditureCategory)}
            className="w-full max-w-xs px-3 py-2 border rounded-md"
          >
            {EXPENDITURE_CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>
                {t(cat.value)}
              </option>
            ))}
          </select>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {!previewData.length ? (
            /* File Upload Area */
            <div className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer ${
                  isDragging
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-300 hover:border-teal-400 hover:bg-gray-50'
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className={`w-16 h-16 mx-auto mb-4 transition-colors ${
                  isDragging ? 'text-teal-500' : 'text-gray-400'
                }`} />
                <p className={`text-lg font-medium mb-2 transition-colors ${
                  isDragging ? 'text-teal-700' : 'text-gray-700'
                }`}>
                  {isDragging ? t('dropCSVFileHere') : t('clickOrDropCSVFile')}
                </p>
                <p className="text-sm text-gray-500">
                  {t('csvFormatHint')}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}

              {isLoading && (
                <div className="text-center py-4">
                  <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto mb-2" />
                  <p className="text-gray-600">{t('parsingCSVFile')}</p>
                </div>
              )}
            </div>
          ) : (
            /* Preview */
            <div className="space-y-4">
              {/* File Info and Mapping Toggle */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-teal-600" />
                  <span className="font-medium">{fileName}</span>
                  <span className="text-sm text-gray-500">
                    ({previewData.length} rows)
                  </span>
                </div>
                <button
                  onClick={() => setShowMapping(!showMapping)}
                  className="flex items-center gap-2 text-teal-600 hover:text-teal-700"
                >
                  <Settings2 className="w-4 h-4" />
                  {showMapping ? t('hideColumnMapping') : t('showColumnMapping')}
                </button>
              </div>

              {/* Column Mapping */}
              {showMapping && (
                <Card className="bg-teal-50">
                  <h3 className="font-medium mb-3">{t('columnMapping')}</h3>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">{t('expenditureName')} *</label>
                      <select
                        value={columnMapping.name}
                        onChange={(e) => handleMappingChange('name', e.target.value)}
                        className="w-full px-2 py-1 border rounded"
                      >
                        <option value="">--</option>
                        {processedHeaders.map((header, idx) => (
                          <option key={idx} value={header.value}>{header.display}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">{t('subcategory')}</label>
                      <select
                        value={columnMapping.subcategory}
                        onChange={(e) => handleMappingChange('subcategory', e.target.value)}
                        className="w-full px-2 py-1 border rounded"
                      >
                        <option value="">--</option>
                        {processedHeaders.map((header, idx) => (
                          <option key={idx} value={header.value}>{header.display}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">{t('amount')} *</label>
                      <select
                        value={columnMapping.amount}
                        onChange={(e) => handleMappingChange('amount', e.target.value)}
                        className="w-full px-2 py-1 border rounded"
                      >
                        <option value="">--</option>
                        {processedHeaders.map((header, idx) => (
                          <option key={idx} value={header.value}>{header.display}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">{t('frequency')}</label>
                      <select
                        value={columnMapping.frequency}
                        onChange={(e) => handleMappingChange('frequency', e.target.value)}
                        className="w-full px-2 py-1 border rounded"
                      >
                        <option value="">--</option>
                        {processedHeaders.map((header, idx) => (
                          <option key={idx} value={header.value}>{header.display}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">{t('notes')}</label>
                      <select
                        value={columnMapping.notes}
                        onChange={(e) => handleMappingChange('notes', e.target.value)}
                        className="w-full px-2 py-1 border rounded"
                      >
                        <option value="">--</option>
                        {processedHeaders.map((header, idx) => (
                          <option key={idx} value={header.value}>{header.display}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </Card>
              )}

              {/* Summary */}
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>{validCount} valid</span>
                </div>
                <div className="flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span>{invalidCount} invalid</span>
                </div>
                <div className="flex items-center gap-1 font-medium">
                  <span>{selectedCount} selected</span>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={previewData.length > 0 && previewData.every(item => item.selected)}
                          onChange={toggleSelectAll}
                          className="rounded"
                        />
                      </th>
                      <th className="px-3 py-3 text-left text-sm font-medium text-gray-600">
                        {t('expenditureName')}
                      </th>
                      <th className="px-3 py-3 text-left text-sm font-medium text-gray-600">
                        {t('subcategory')}
                      </th>
                      <th className="px-3 py-3 text-right text-sm font-medium text-gray-600">
                        {t('amount')}
                      </th>
                      <th className="px-3 py-3 text-left text-sm font-medium text-gray-600">
                        {t('frequency')}
                      </th>
                      <th className="px-3 py-3 text-left text-sm font-medium text-gray-600">
                        {t('notes')}
                      </th>
                      <th className="px-3 py-3 text-left text-sm font-medium text-gray-600">
                        {t('status')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {previewData.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={() => toggleSelectItem(item.id)}
                            disabled={!item.isValid}
                            className="rounded"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                            className={`w-full px-2 py-1 border rounded text-sm ${!item.isValid && item.errors.some(e => e.includes('Name')) ? 'border-red-500 bg-red-50' : ''}`}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={item.subcategory}
                            onChange={(e) => handleUpdateItem(item.id, 'subcategory', e.target.value)}
                            className="w-full px-2 py-1 border rounded text-sm"
                          >
                            <option value="">-</option>
                            {subcategories.map(sub => (
                              <option key={sub} value={sub}>{t(('subcat_' + sub) as any) || sub}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={item.amount}
                            onChange={(e) => handleUpdateItem(item.id, 'amount', e.target.value)}
                            className={`w-24 px-2 py-1 border rounded text-sm text-right ${!item.isValid && item.errors.some(e => e.includes('Amount')) ? 'border-red-500 bg-red-50' : ''}`}
                            step="0.01"
                            min="0"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={item.frequency}
                            onChange={(e) => handleUpdateItem(item.id, 'frequency', e.target.value)}
                            className="w-full px-2 py-1 border rounded text-sm"
                          >
                            {frequencies.map(freq => (
                              <option key={freq.value} value={freq.value}>{t(freq.value)}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={item.notes}
                            onChange={(e) => handleUpdateItem(item.id, 'notes', e.target.value)}
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </td>
                        <td className="px-3 py-2 text-sm">
                          {item.errors.length > 0 ? (
                            <div className="text-red-600 text-xs">
                              {item.errors.map((err, idx) => (
                                <div key={idx}>{err}</div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-green-600 flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {previewData.length > 0 && (
          <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleImport}
              disabled={selectedCount === 0}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('import')} ({selectedCount})
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

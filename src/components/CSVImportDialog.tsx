import { useState, useRef, useCallback } from 'react'
import { CheckCircle, AlertCircle, X, FileSpreadsheet, Settings2, Upload } from 'lucide-react'
import { Card } from './Card'
import { INVESTMENT_TYPES, INVESTMENT_ACCOUNTS, type InvestmentType, type InvestmentAccount } from '../types/financial'
import { useFinancial } from '../contexts/FinancialContext'
import { validateTickerSymbol } from '../services/yahooFinance'

interface ImportPreviewItem {
  id: string
  symbol: string
  name: string
  shares: number
  costBasis: number
  currentPrice: number
  type: InvestmentType
  account: InvestmentAccount
  isValid: boolean
  errors: string[]
  isExisting: boolean
  selected: boolean
  originalRow: number
}

interface ColumnMapping {
  shares: number
  name: number
  costBasis: number
  currentPrice: number
  symbol: number
}

const DEFAULT_MAPPING: ColumnMapping = {
  shares: 0,      // Column 1 (0-indexed)
  name: 1,        // Column 2 (0-indexed)
  costBasis: 4,   // Column 5 (0-indexed)
  currentPrice: 5, // Column 6 (0-indexed)
  symbol: 16,     // Column 17 (0-indexed)
}

interface CSVImportDialogProps {
  onClose: () => void
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

function parseNumber(value: string): number | null {
  // Handle comma as decimal separator
  const normalized = value.trim().replace(/\./g, '').replace(',', '.')
  const num = parseFloat(normalized)
  return isNaN(num) ? null : num
}

export function CSVImportDialog({ onClose }: CSVImportDialogProps) {
  const { state, addInvestment } = useFinancial()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [previewData, setPreviewData] = useState<ImportPreviewItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showMapping, setShowMapping] = useState(false)
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>(DEFAULT_MAPPING)
  const [rawCSV, setRawCSV] = useState<string[][]>([])
  const [fileName, setFileName] = useState<string>('')
  const [isDragging, setIsDragging] = useState(false)

  const validateItem = useCallback((item: Partial<ImportPreviewItem>): string[] => {
    const errors: string[] = []
    
    if (!item.symbol || !validateTickerSymbol(item.symbol)) {
      errors.push('Invalid ticker symbol')
    }
    
    if (!item.name || item.name.trim() === '') {
      errors.push('Name is required')
    }
    
    if (item.shares === undefined || item.shares === null || item.shares <= 0) {
      errors.push('Shares must be positive')
    }
    
    if (item.costBasis === undefined || item.costBasis === null || item.costBasis < 0) {
      errors.push('Cost basis must be non-negative')
    }
    
    if (item.currentPrice === undefined || item.currentPrice === null || item.currentPrice < 0) {
      errors.push('Current price must be non-negative')
    }
    
    return errors
  }, [])

  const processCSV = useCallback((lines: string[][], mapping: ColumnMapping): ImportPreviewItem[] => {
    const items: ImportPreviewItem[] = []
    const existingSymbols = new Set(state.investments.map(inv => inv.symbol.toUpperCase()))
    
    // Skip header row, start from index 1
    for (let i = 1; i < lines.length && i <= 100; i++) {
      const line = lines[i]
      if (line.length === 0 || line.every(cell => cell.trim() === '')) continue
      
      const shares = parseNumber(line[mapping.shares] || '')
      const name = (line[mapping.name] || '').trim()
      const costBasis = parseNumber(line[mapping.costBasis] || '')
      const currentPrice = parseNumber(line[mapping.currentPrice] || '')
      const symbol = (line[mapping.symbol] || '').trim().toUpperCase()
      
      const item: ImportPreviewItem = {
        id: generateId(),
        symbol,
        name,
        shares: shares || 0,
        costBasis: costBasis || 0,
        currentPrice: currentPrice || 0,
        type: 'stock',
        account: 'taxable',
        isValid: false,
        errors: [],
        isExisting: existingSymbols.has(symbol),
        selected: false,
        originalRow: i + 1,
      }
      
      item.errors = validateItem(item)
      item.isValid = item.errors.length === 0 && !item.isExisting
      item.selected = item.isValid
      
      items.push(item)
    }
    
    return items
  }, [state.investments, validateItem])

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
          setError('CSV file must have at least a header row and one data row')
          setIsLoading(false)
          return
        }
        
        if (lines.length > 101) {
          setError('CSV file contains more than 100 data rows. Please limit to 100 investments per import.')
          setIsLoading(false)
          return
        }
        
        setRawCSV(lines)
        const items = processCSV(lines, columnMapping)
        setPreviewData(items)
        setIsLoading(false)
      } catch (err) {
        setError('Error parsing CSV file: ' + (err instanceof Error ? err.message : 'Unknown error'))
        setIsLoading(false)
      }
    }
    
    reader.onerror = () => {
      setError('Error reading file')
      setIsLoading(false)
    }
    
    reader.readAsText(file, 'UTF-8')
  }, [columnMapping, processCSV])

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    processFile(file)
  }, [processFile])

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      if (file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv') {
        processFile(file)
      } else {
        setError('Please upload a CSV file')
      }
    }
  }, [processFile])

  const handleMappingChange = useCallback((field: keyof ColumnMapping, value: number) => {
    const newMapping = { ...columnMapping, [field]: value }
    setColumnMapping(newMapping)
    if (rawCSV.length > 0) {
      const items = processCSV(rawCSV, newMapping)
      setPreviewData(items)
    }
  }, [columnMapping, rawCSV, processCSV])

  const handleToggleSelect = useCallback((id: string) => {
    setPreviewData(prev => prev.map(item => 
      item.id === id ? { ...item, selected: !item.selected } : item
    ))
  }, [])

  const handleSelectAll = useCallback(() => {
    const allSelected = previewData.every(item => item.selected)
    setPreviewData(prev => prev.map(item => ({ ...item, selected: !allSelected })))
  }, [previewData])

  const handleFieldChange = useCallback((id: string, field: keyof ImportPreviewItem, value: string | number | InvestmentType | InvestmentAccount) => {
    setPreviewData(prev => prev.map(item => {
      if (item.id !== id) return item
      
      const updated = { ...item, [field]: value }
      updated.errors = validateItem(updated)
      updated.isValid = updated.errors.length === 0 && !updated.isExisting
      
      return updated
    }))
  }, [validateItem])

  const handleImport = useCallback(() => {
    const selectedItems = previewData.filter(item => item.selected && item.isValid)
    
    selectedItems.forEach(item => {
      addInvestment({
        symbol: item.symbol,
        name: item.name,
        type: item.type,
        account: item.account,
        shares: item.shares,
        costBasis: item.costBasis,
        currentPrice: item.currentPrice,
      })
    })
    
    onClose()
  }, [previewData, addInvestment, onClose])

  const validCount = previewData.filter(item => item.isValid).length
  const selectedCount = previewData.filter(item => item.selected).length
  const existingCount = previewData.filter(item => item.isExisting).length
  const invalidCount = previewData.filter(item => !item.isValid && !item.isExisting).length

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Import Investments</h2>
            <p className="text-gray-600 mt-1">
              Upload a CSV file with semicolon-separated values
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {!previewData.length ? (
            /* File Upload Area */
            <div className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className={`w-16 h-16 mx-auto mb-4 transition-colors ${
                  isDragging ? 'text-blue-500' : 'text-gray-400'
                }`} />
                <p className={`text-lg font-medium mb-2 transition-colors ${
                  isDragging ? 'text-blue-700' : 'text-gray-700'
                }`}>
                  {isDragging ? 'Drop CSV file here' : 'Click or drop CSV file here'}
                </p>
                <p className="text-sm text-gray-500">
                  Semicolon-separated, max 100 rows, UTF-8 encoding
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
                  <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2" />
                  <p className="text-gray-600">Parsing CSV file...</p>
                </div>
              )}
            </div>
          ) : (
            /* Preview Table */
            <div className="space-y-4">
              {/* File Info */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">{fileName}</span>
                  <span className="text-sm text-gray-500">
                    ({previewData.length} rows)
                  </span>
                </div>
                <button
                  onClick={() => setShowMapping(!showMapping)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                >
                  <Settings2 className="w-4 h-4" />
                  {showMapping ? 'Hide' : 'Show'} Column Mapping
                </button>
              </div>

              {/* Column Mapping */}
              {showMapping && (
                <Card className="bg-blue-50">
                  <h3 className="font-medium mb-3">Column Mapping</h3>
                  <div className="grid grid-cols-5 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Shares (Col)</label>
                      <input
                        type="number"
                        value={columnMapping.shares + 1}
                        onChange={(e) => handleMappingChange('shares', parseInt(e.target.value) - 1)}
                        className="w-full px-2 py-1 border rounded"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Name (Col)</label>
                      <input
                        type="number"
                        value={columnMapping.name + 1}
                        onChange={(e) => handleMappingChange('name', parseInt(e.target.value) - 1)}
                        className="w-full px-2 py-1 border rounded"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Cost Basis (Col)</label>
                      <input
                        type="number"
                        value={columnMapping.costBasis + 1}
                        onChange={(e) => handleMappingChange('costBasis', parseInt(e.target.value) - 1)}
                        className="w-full px-2 py-1 border rounded"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Current Price (Col)</label>
                      <input
                        type="number"
                        value={columnMapping.currentPrice + 1}
                        onChange={(e) => handleMappingChange('currentPrice', parseInt(e.target.value) - 1)}
                        className="w-full px-2 py-1 border rounded"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Symbol (Col)</label>
                      <input
                        type="number"
                        value={columnMapping.symbol + 1}
                        onChange={(e) => handleMappingChange('symbol', parseInt(e.target.value) - 1)}
                        className="w-full px-2 py-1 border rounded"
                        min="1"
                      />
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
                <div className="flex items-center gap-1 text-gray-500">
                  <span>{existingCount} already in portfolio</span>
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
                      <th className="px-3 py-2 text-left">
                        <input
                          type="checkbox"
                          checked={previewData.length > 0 && previewData.every(item => item.selected)}
                          onChange={handleSelectAll}
                          className="rounded"
                        />
                      </th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">Symbol</th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">Name</th>
                      <th className="px-3 py-2 text-right text-sm font-medium text-gray-600">Shares</th>
                      <th className="px-3 py-2 text-right text-sm font-medium text-gray-600">Cost Basis</th>
                      <th className="px-3 py-2 text-right text-sm font-medium text-gray-600">Current Price</th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">Type</th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">Account</th>
                      <th className="px-3 py-2 text-left text-sm font-medium text-gray-600">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((item) => (
                      <tr 
                        key={item.id} 
                        className={`border-t ${item.isExisting ? 'bg-gray-100 text-gray-400' : ''}`}
                      >
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={() => handleToggleSelect(item.id)}
                            disabled={item.isExisting || (!item.isValid && item.errors.length > 0)}
                            className="rounded"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={item.symbol}
                            onChange={(e) => handleFieldChange(item.id, 'symbol', e.target.value)}
                            className={`w-24 px-2 py-1 border rounded text-sm ${!item.isValid && item.errors.some(e => e.includes('symbol')) ? 'border-red-500 bg-red-50' : ''}`}
                            disabled={item.isExisting}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleFieldChange(item.id, 'name', e.target.value)}
                            className={`w-40 px-2 py-1 border rounded text-sm ${!item.isValid && item.errors.some(e => e.includes('Name')) ? 'border-red-500 bg-red-50' : ''}`}
                            disabled={item.isExisting}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={item.shares}
                            onChange={(e) => handleFieldChange(item.id, 'shares', parseFloat(e.target.value) || 0)}
                            className={`w-24 px-2 py-1 border rounded text-sm text-right ${!item.isValid && item.errors.some(e => e.includes('Shares')) ? 'border-red-500 bg-red-50' : ''}`}
                            step="0.001"
                            disabled={item.isExisting}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={item.costBasis}
                            onChange={(e) => handleFieldChange(item.id, 'costBasis', parseFloat(e.target.value) || 0)}
                            className={`w-24 px-2 py-1 border rounded text-sm text-right ${!item.isValid && item.errors.some(e => e.includes('Cost')) ? 'border-red-500 bg-red-50' : ''}`}
                            step="0.01"
                            disabled={item.isExisting}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            value={item.currentPrice}
                            onChange={(e) => handleFieldChange(item.id, 'currentPrice', parseFloat(e.target.value) || 0)}
                            className={`w-24 px-2 py-1 border rounded text-sm text-right ${!item.isValid && item.errors.some(e => e.includes('price')) ? 'border-red-500 bg-red-50' : ''}`}
                            step="0.01"
                            disabled={item.isExisting}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={item.type}
                            onChange={(e) => handleFieldChange(item.id, 'type', e.target.value as InvestmentType)}
                            className="w-28 px-2 py-1 border rounded text-sm"
                            disabled={item.isExisting}
                          >
                            {INVESTMENT_TYPES.map(type => (
                              <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={item.account}
                            onChange={(e) => handleFieldChange(item.id, 'account', e.target.value as InvestmentAccount)}
                            className="w-32 px-2 py-1 border rounded text-sm"
                            disabled={item.isExisting}
                          >
                            {INVESTMENT_ACCOUNTS.map(acc => (
                              <option key={acc.value} value={acc.value}>{acc.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2 text-sm">
                          {item.isExisting ? (
                            <span className="text-gray-500">Already in portfolio</span>
                          ) : item.errors.length > 0 ? (
                            <div className="text-red-600 text-xs">
                              {item.errors.map((err, idx) => (
                                <div key={idx}>{err}</div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-green-600 flex items-center gap-1">
                              <CheckCircle className="w-4 h-4" />
                              Valid
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
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            Cancel
          </button>
          {previewData.length > 0 && (
            <button
              onClick={handleImport}
              disabled={selectedCount === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Import {selectedCount} Investment{selectedCount !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import type { WatchlistItem } from '../types/financial'

interface WatchlistFormProps {
  watchlistItem?: WatchlistItem
  onClose: () => void
  onAdd: (item: Omit<WatchlistItem, 'id' | 'dateAdded'>) => void
  onUpdate: (item: WatchlistItem) => void
}

export function WatchlistForm({ watchlistItem, onClose, onAdd, onUpdate }: WatchlistFormProps) {
  const [symbol, setSymbol] = useState(watchlistItem?.symbol || '')
  const [name, setName] = useState(watchlistItem?.name || '')
  const [shares, setShares] = useState(watchlistItem?.shares?.toString() || '')
  const [targetPrice, setTargetPrice] = useState(watchlistItem?.targetPrice?.toString() || '')
  const [notes, setNotes] = useState(watchlistItem?.notes || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!symbol.trim() || !name.trim()) return

    if (watchlistItem) {
      // Updating existing item
      onUpdate({
        ...watchlistItem,
        symbol: symbol.trim().toUpperCase(),
        name: name.trim(),
        shares: parseFloat(shares) || 0,
        targetPrice: parseFloat(targetPrice) || 0,
        notes: notes.trim() || undefined,
      })
    } else {
      // Adding new item
      onAdd({
        symbol: symbol.trim().toUpperCase(),
        name: name.trim(),
        shares: parseFloat(shares) || 0,
        targetPrice: parseFloat(targetPrice) || 0,
        notes: notes.trim() || undefined,
      })
    }

    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Symbol/Ticker <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="e.g., AAPL"
          required
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="e.g., Apple Inc."
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Planned Shares
          </label>
          <input
            type="number"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="0"
            min="0"
            step="0.01"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target Price
          </label>
          <input
            type="number"
            value={targetPrice}
            onChange={(e) => setTargetPrice(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes (Optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Additional notes..."
          rows={3}
        />
      </div>
      
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
        >
          {watchlistItem ? 'Update' : 'Add to Watchlist'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

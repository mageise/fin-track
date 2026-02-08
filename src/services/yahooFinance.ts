/**
 * Yahoo Finance API Service
 * Unofficial API for fetching stock and crypto prices
 * Endpoint: https://query1.finance.yahoo.com/v8/finance/chart/{SYMBOL}
 * 
 * NOTE: Yahoo Finance API has CORS restrictions. This service uses a CORS proxy
 * in development mode to bypass restrictions.
 */

export interface PriceUpdateResult {
  symbol: string
  price: number | null
  error?: string
}

export interface BatchUpdateResult {
  successful: PriceUpdateResult[]
  failed: PriceUpdateResult[]
  timestamp: Date
}

// Check if we're in development mode
const isDevelopment = typeof window !== 'undefined' && window.location.hostname === 'localhost'

// CORS proxy URL (free public proxy)
const CORS_PROXY = 'https://corsproxy.io/?'

/**
 * Validates ticker symbol format
 * Supports: Stocks (AAPL, MSFT), Crypto (BTC-USD, ETH-USD), International (AIR.PA, SONY)
 */
export function validateTickerSymbol(symbol: string): boolean {
  if (!symbol || typeof symbol !== 'string') {
    return false
  }
  
  const trimmed = symbol.trim().toUpperCase()
  
  // Basic ticker validation rules
  // - Must be 1-10 characters
  // - Can contain letters, numbers, hyphens, and dots
  // - Common patterns: AAPL, BTC-USD, BRK.A, AIR.PA, 12345.X (European exchanges)
  const tickerPattern = /^[A-Z0-9][A-Z0-9.-]{0,9}$/
  
  return tickerPattern.test(trimmed)
}

/**
 * Fetches current price for a single ticker symbol
 */
export async function fetchStockPrice(symbol: string): Promise<PriceUpdateResult> {
  const trimmedSymbol = symbol.trim().toUpperCase()
  
  // Validate symbol format
  if (!validateTickerSymbol(trimmedSymbol)) {
    return {
      symbol: trimmedSymbol,
      price: null,
      error: `Invalid ticker symbol format: ${symbol}`,
    }
  }
  
  try {
    const baseUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${trimmedSymbol}?interval=1d&range=1d`
    // Use CORS proxy in development
    const url = isDevelopment ? `${CORS_PROXY}${encodeURIComponent(baseUrl)}` : baseUrl
    
    console.log(`Fetching price for ${trimmedSymbol}...`)
    console.log(`URL: ${url}`)
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    })
    
    console.log(`Response status for ${trimmedSymbol}:`, response.status)
    
    if (!response.ok) {
      if (response.status === 404) {
        return {
          symbol: trimmedSymbol,
          price: null,
          error: `Symbol not found: ${trimmedSymbol}`,
        }
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log(`Data received for ${trimmedSymbol}:`, data)
    
    // Check if data exists and has the expected structure
    if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
      return {
        symbol: trimmedSymbol,
        price: null,
        error: `No data available for: ${trimmedSymbol}`,
      }
    }
    
    const result = data.chart.result[0]
    
    // Try to get current price from different possible locations
    let price: number | null = null
    
    // Option 1: meta.regularMarketPrice (most common)
    if (result.meta?.regularMarketPrice) {
      price = result.meta.regularMarketPrice
    }
    // Option 2: meta.previousClose (fallback)
    else if (result.meta?.previousClose) {
      price = result.meta.previousClose
    }
    // Option 3: indicators.quote[0].close[last]
    else if (result.indicators?.quote?.[0]?.close?.length > 0) {
      const closes = result.indicators.quote[0].close
      const lastClose = closes[closes.length - 1]
      if (lastClose !== null && lastClose !== undefined) {
        price = lastClose
      }
    }
    
    if (price === null || isNaN(price)) {
      return {
        symbol: trimmedSymbol,
        price: null,
        error: `Unable to extract price for: ${trimmedSymbol}`,
      }
    }
    
    console.log(`Price for ${trimmedSymbol}: ${price}`)
    
    return {
      symbol: trimmedSymbol,
      price: price,
    }
    
  } catch (error) {
    console.error(`Error fetching price for ${trimmedSymbol}:`, error)
    
    // Provide more specific error messages
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      if (isDevelopment) {
        return {
          symbol: trimmedSymbol,
          price: null,
          error: `Network error: Cannot connect to CORS proxy. The proxy service may be temporarily unavailable.`,
        }
      } else {
        return {
          symbol: trimmedSymbol,
          price: null,
          error: `Network error: Cannot fetch data. Please check your internet connection.`,
        }
      }
    }
    
    return {
      symbol: trimmedSymbol,
      price: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Fetches prices for multiple symbols with delay between requests
 * Yahoo Finance may rate-limit if too many requests too fast
 */
export async function fetchMultiplePrices(
  symbols: string[],
  delayMs: number = 500
): Promise<BatchUpdateResult> {
  const successful: PriceUpdateResult[] = []
  const failed: PriceUpdateResult[] = []
  
  // Remove duplicates
  const uniqueSymbols = [...new Set(symbols.map(s => s.trim().toUpperCase()))]
  
  for (let i = 0; i < uniqueSymbols.length; i++) {
    const symbol = uniqueSymbols[i]
    const result = await fetchStockPrice(symbol)
    
    if (result.price !== null) {
      successful.push(result)
    } else {
      failed.push(result)
    }
    
    // Add delay between requests to avoid rate limiting
    // Skip delay for the last item
    if (i < uniqueSymbols.length - 1 && delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }
  
  return {
    successful,
    failed,
    timestamp: new Date(),
  }
}

/**
 * Common ticker symbol examples for reference
 */
export const TICKER_EXAMPLES = {
  stocks: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'JPM'],
  crypto: ['BTC-USD', 'ETH-USD', 'SOL-USD', 'ADA-USD', 'DOT-USD'],
  international: ['AIR.PA', 'SONY', 'TM', 'BABA', 'TCEHY'],
}

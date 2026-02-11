import { createContext, useContext, useReducer, useEffect, useRef, type ReactNode } from 'react'
import type { Asset, Liability, NetWorthHistory, Investment, SavingsGoal, BudgetScenario, CashAccount, WatchlistItem } from '../types/financial'

export type Locale = 'de' | 'en'
export type Currency = 'EUR' | 'USD'

interface FinancialState {
  assets: Asset[]
  liabilities: Liability[]
  investments: Investment[]
  savingsGoals: SavingsGoal[]
  budgetScenarios: BudgetScenario[]
  cashAccounts: CashAccount[]
  watchlist: WatchlistItem[]
  netWorthHistory: NetWorthHistory[]
  fireGoal: number
  lastPriceUpdate: string | null
  locale: Locale
  currency: Currency
  firstName: string
  cashBalance: number
}

type Action =
  | { type: 'ADD_ASSET'; payload: Asset }
  | { type: 'UPDATE_ASSET'; payload: Asset }
  | { type: 'DELETE_ASSET'; payload: string }
  | { type: 'ADD_LIABILITY'; payload: Liability }
  | { type: 'UPDATE_LIABILITY'; payload: Liability }
  | { type: 'DELETE_LIABILITY'; payload: string }
  | { type: 'ADD_INVESTMENT'; payload: Investment }
  | { type: 'UPDATE_INVESTMENT'; payload: Investment }
  | { type: 'DELETE_INVESTMENT'; payload: string }
  | { type: 'UPDATE_INVESTMENT_PRICES'; payload: { symbol: string; price: number }[] }
  | { type: 'ADD_SAVINGS_GOAL'; payload: SavingsGoal }
  | { type: 'UPDATE_SAVINGS_GOAL'; payload: SavingsGoal }
  | { type: 'DELETE_SAVINGS_GOAL'; payload: string }
  | { type: 'UPDATE_SAVINGS_AMOUNT'; payload: { id: string; currentAmount: number } }
  | { type: 'ADD_BUDGET_SCENARIO'; payload: BudgetScenario }
  | { type: 'UPDATE_BUDGET_SCENARIO'; payload: BudgetScenario }
  | { type: 'DELETE_BUDGET_SCENARIO'; payload: string }
  | { type: 'DUPLICATE_BUDGET_SCENARIO'; payload: BudgetScenario }
  | { type: 'ADD_CASH_ACCOUNT'; payload: CashAccount }
  | { type: 'UPDATE_CASH_ACCOUNT'; payload: CashAccount }
  | { type: 'DELETE_CASH_ACCOUNT'; payload: string }
  | { type: 'ADD_WATCHLIST_ITEM'; payload: WatchlistItem }
  | { type: 'UPDATE_WATCHLIST_ITEM'; payload: WatchlistItem }
  | { type: 'DELETE_WATCHLIST_ITEM'; payload: string }
  | { type: 'PROMOTE_WATCHLIST_TO_HOLDING'; payload: { watchlistId: string; investmentData: Omit<Investment, 'id' | 'dateAdded' | 'symbol' | 'name'> } }
  | { type: 'DEMOTE_HOLDING_TO_WATCHLIST'; payload: { investmentId: string; watchlistData: Omit<WatchlistItem, 'id' | 'dateAdded' | 'symbol' | 'name' | 'currentPrice'> } }
  | { type: 'UPDATE_WATCHLIST_PRICES'; payload: { symbol: string; price: number }[] }
  | { type: 'SET_LAST_PRICE_UPDATE'; payload: string }
  | { type: 'SET_FIRE_GOAL'; payload: number }
  | { type: 'SET_LOCALE'; payload: Locale }
  | { type: 'SET_CURRENCY'; payload: Currency }
  | { type: 'SET_FIRST_NAME'; payload: string }
  | { type: 'SET_CASH_BALANCE'; payload: number }
  | { type: 'LOAD_STATE'; payload: FinancialState }

const STORAGE_KEY = 'fintrack-data-v2'

const defaultState: FinancialState = {
  assets: [],
  liabilities: [],
  investments: [],
  savingsGoals: [],
  budgetScenarios: [],
  cashAccounts: [],
  watchlist: [],
  netWorthHistory: [],
  fireGoal: 1000000,
  lastPriceUpdate: null,
  locale: 'de',
  currency: 'EUR',
  firstName: '',
  cashBalance: 0,
}

// Load initial state from localStorage
function loadInitialState(): FinancialState {
  if (typeof window === 'undefined') return defaultState
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      console.log('Loaded data from localStorage:', parsed)
      return {
        ...defaultState,
        ...parsed,
        investments: parsed.investments || [],
        savingsGoals: parsed.savingsGoals || [],
        budgetScenarios: parsed.budgetScenarios || [],
        cashAccounts: parsed.cashAccounts || [],
        watchlist: parsed.watchlist || [],
        lastPriceUpdate: parsed.lastPriceUpdate || null,
        locale: parsed.locale || 'de',
        currency: parsed.currency || 'EUR',
        firstName: parsed.firstName || '',
        cashBalance: parsed.cashBalance ?? 0,
      }
    }
  } catch (e) {
    console.error('Failed to load from localStorage:', e)
  }
  return defaultState
}

function calculateNetWorth(assets: Asset[], liabilities: Liability[]): NetWorthHistory {
  const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0)
  const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.value, 0)
  
  return {
    date: new Date().toISOString().split('T')[0],
    netWorth: totalAssets - totalLiabilities,
    assets: totalAssets,
    liabilities: totalLiabilities,
  }
}

function financialReducer(state: FinancialState, action: Action): FinancialState {
  switch (action.type) {
    case 'ADD_ASSET': {
      const newAssets = [...state.assets, action.payload]
      return {
        ...state,
        assets: newAssets,
        netWorthHistory: [...state.netWorthHistory, calculateNetWorth(newAssets, state.liabilities)],
      }
    }
    case 'UPDATE_ASSET': {
      const newAssets = state.assets.map((asset) =>
        asset.id === action.payload.id ? action.payload : asset
      )
      return {
        ...state,
        assets: newAssets,
        netWorthHistory: [...state.netWorthHistory, calculateNetWorth(newAssets, state.liabilities)],
      }
    }
    case 'DELETE_ASSET': {
      const newAssets = state.assets.filter((asset) => asset.id !== action.payload)
      return {
        ...state,
        assets: newAssets,
        netWorthHistory: [...state.netWorthHistory, calculateNetWorth(newAssets, state.liabilities)],
      }
    }
    case 'ADD_LIABILITY': {
      const newLiabilities = [...state.liabilities, action.payload]
      return {
        ...state,
        liabilities: newLiabilities,
        netWorthHistory: [...state.netWorthHistory, calculateNetWorth(state.assets, newLiabilities)],
      }
    }
    case 'UPDATE_LIABILITY': {
      const newLiabilities = state.liabilities.map((liability) =>
        liability.id === action.payload.id ? action.payload : liability
      )
      return {
        ...state,
        liabilities: newLiabilities,
        netWorthHistory: [...state.netWorthHistory, calculateNetWorth(state.assets, newLiabilities)],
      }
    }
    case 'DELETE_LIABILITY': {
      const newLiabilities = state.liabilities.filter((liability) => liability.id !== action.payload)
      return {
        ...state,
        liabilities: newLiabilities,
        netWorthHistory: [...state.netWorthHistory, calculateNetWorth(state.assets, newLiabilities)],
      }
    }
    case 'ADD_INVESTMENT':
      return {
        ...state,
        investments: [...state.investments, action.payload],
      }
    case 'UPDATE_INVESTMENT':
      return {
        ...state,
        investments: state.investments.map((inv) =>
          inv.id === action.payload.id ? action.payload : inv
        ),
      }
    case 'DELETE_INVESTMENT':
      return {
        ...state,
        investments: state.investments.filter((inv) => inv.id !== action.payload),
      }
    case 'ADD_SAVINGS_GOAL':
      return {
        ...state,
        savingsGoals: [...state.savingsGoals, action.payload],
      }
    case 'UPDATE_SAVINGS_GOAL':
      return {
        ...state,
        savingsGoals: state.savingsGoals.map((goal) =>
          goal.id === action.payload.id ? action.payload : goal
        ),
      }
    case 'DELETE_SAVINGS_GOAL':
      return {
        ...state,
        savingsGoals: state.savingsGoals.filter((goal) => goal.id !== action.payload),
      }
    case 'UPDATE_SAVINGS_AMOUNT':
      return {
        ...state,
        savingsGoals: state.savingsGoals.map((goal) =>
          goal.id === action.payload.id
            ? { ...goal, currentAmount: action.payload.currentAmount }
            : goal
        ),
      }
    case 'UPDATE_INVESTMENT_PRICES': {
      const priceMap = new Map(action.payload.map(p => [p.symbol.toUpperCase(), p.price]))
      return {
        ...state,
        investments: state.investments.map((inv) => {
          const newPrice = priceMap.get(inv.symbol.toUpperCase())
          if (newPrice !== undefined) {
            return { ...inv, currentPrice: newPrice }
          }
          return inv
        }),
      }
    }
    case 'SET_LAST_PRICE_UPDATE':
      return {
        ...state,
        lastPriceUpdate: action.payload,
      }
    case 'ADD_BUDGET_SCENARIO':
      return {
        ...state,
        budgetScenarios: [...state.budgetScenarios, action.payload],
      }
    case 'UPDATE_BUDGET_SCENARIO':
      return {
        ...state,
        budgetScenarios: state.budgetScenarios.map((scenario) =>
          scenario.id === action.payload.id ? action.payload : scenario
        ),
      }
    case 'DELETE_BUDGET_SCENARIO':
      return {
        ...state,
        budgetScenarios: state.budgetScenarios.filter((scenario) => scenario.id !== action.payload),
      }
    case 'DUPLICATE_BUDGET_SCENARIO':
      return {
        ...state,
        budgetScenarios: [...state.budgetScenarios, action.payload],
      }
    case 'ADD_CASH_ACCOUNT':
      return {
        ...state,
        cashAccounts: [...state.cashAccounts, action.payload],
      }
    case 'UPDATE_CASH_ACCOUNT':
      return {
        ...state,
        cashAccounts: state.cashAccounts.map((account) =>
          account.id === action.payload.id ? action.payload : account
        ),
      }
    case 'DELETE_CASH_ACCOUNT':
      return {
        ...state,
        cashAccounts: state.cashAccounts.filter((account) => account.id !== action.payload),
      }
    case 'ADD_WATCHLIST_ITEM':
      return {
        ...state,
        watchlist: [...state.watchlist, action.payload],
      }
    case 'UPDATE_WATCHLIST_ITEM':
      return {
        ...state,
        watchlist: state.watchlist.map((item) =>
          item.id === action.payload.id ? action.payload : item
        ),
      }
    case 'DELETE_WATCHLIST_ITEM':
      return {
        ...state,
        watchlist: state.watchlist.filter((item) => item.id !== action.payload),
      }
    case 'UPDATE_WATCHLIST_PRICES': {
      const priceMap = new Map(action.payload.map(p => [p.symbol.toUpperCase(), p.price]))
      return {
        ...state,
        watchlist: state.watchlist.map((item) => {
          const newPrice = priceMap.get(item.symbol.toUpperCase())
          if (newPrice !== undefined) {
            return { ...item, currentPrice: newPrice }
          }
          return item
        }),
      }
    }
    case 'PROMOTE_WATCHLIST_TO_HOLDING': {
      const watchlistItem = state.watchlist.find((item) => item.id === action.payload.watchlistId)
      if (!watchlistItem) return state
      
      const newInvestment: Investment = {
        ...action.payload.investmentData,
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        symbol: watchlistItem.symbol,
        name: watchlistItem.name,
        dateAdded: new Date().toISOString(),
      }
      return {
        ...state,
        watchlist: state.watchlist.filter((item) => item.id !== action.payload.watchlistId),
        investments: [...state.investments, newInvestment],
      }
    }
    case 'DEMOTE_HOLDING_TO_WATCHLIST': {
      const investment = state.investments.find((inv) => inv.id === action.payload.investmentId)
      if (!investment) return state
      
      const newWatchlistItem: WatchlistItem = {
        ...action.payload.watchlistData,
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        symbol: investment.symbol,
        name: investment.name,
        currentPrice: investment.currentPrice,
        dateAdded: new Date().toISOString(),
      }
      return {
        ...state,
        investments: state.investments.filter((inv) => inv.id !== action.payload.investmentId),
        watchlist: [...state.watchlist, newWatchlistItem],
      }
    }
    case 'SET_FIRE_GOAL':
      return { ...state, fireGoal: action.payload }
    case 'SET_LOCALE':
      return { ...state, locale: action.payload }
    case 'SET_CURRENCY':
      return { ...state, currency: action.payload }
    case 'SET_FIRST_NAME':
      return { ...state, firstName: action.payload }
    case 'SET_CASH_BALANCE':
      return { ...state, cashBalance: action.payload }
    case 'LOAD_STATE':
      return { 
        ...action.payload, 
        investments: action.payload.investments || [],
        savingsGoals: action.payload.savingsGoals || [],
        budgetScenarios: action.payload.budgetScenarios || [],
        cashAccounts: action.payload.cashAccounts || [],
        watchlist: action.payload.watchlist || [],
        lastPriceUpdate: action.payload.lastPriceUpdate || null,
        locale: action.payload.locale || 'de',
        currency: action.payload.currency || 'EUR',
        firstName: action.payload.firstName || '',
      }
    default:
      return state
  }
}

interface FinancialContextType {
  state: FinancialState
  addAsset: (asset: Omit<Asset, 'id' | 'dateAdded'>) => void
  updateAsset: (asset: Asset) => void
  deleteAsset: (id: string) => void
  addLiability: (liability: Omit<Liability, 'id' | 'dateAdded'>) => void
  updateLiability: (liability: Liability) => void
  deleteLiability: (id: string) => void
  addInvestment: (investment: Omit<Investment, 'id' | 'dateAdded'>) => void
  updateInvestment: (investment: Investment) => void
  deleteInvestment: (id: string) => void
  bulkUpdateInvestmentPrices: (updates: { symbol: string; price: number }[]) => void
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'dateCreated'>) => void
  updateSavingsGoal: (goal: SavingsGoal) => void
  deleteSavingsGoal: (id: string) => void
  updateSavingsAmount: (id: string, currentAmount: number) => void
  addBudgetScenario: (scenario: Omit<BudgetScenario, 'id' | 'dateCreated' | 'dateModified'>) => void
  updateBudgetScenario: (scenario: BudgetScenario) => void
  deleteBudgetScenario: (id: string) => void
  duplicateBudgetScenario: (scenario: BudgetScenario) => void
  addCashAccount: (account: Omit<CashAccount, 'id' | 'dateAdded'>) => void
  updateCashAccount: (account: CashAccount) => void
  deleteCashAccount: (id: string) => void
  addWatchlistItem: (item: Omit<WatchlistItem, 'id' | 'dateAdded'>) => void
  updateWatchlistItem: (item: WatchlistItem) => void
  deleteWatchlistItem: (id: string) => void
  promoteWatchlistToHolding: (watchlistId: string, investmentData: Omit<Investment, 'id' | 'dateAdded' | 'symbol' | 'name'>) => void
  demoteHoldingToWatchlist: (investmentId: string, watchlistData: Omit<WatchlistItem, 'id' | 'dateAdded' | 'symbol' | 'name' | 'currentPrice'>) => void
  bulkUpdateWatchlistPrices: (updates: { symbol: string; price: number }[]) => void
  setLastPriceUpdate: (timestamp: string) => void
  setFireGoal: (goal: number) => void
  setLocale: (locale: Locale) => void
  setCurrency: (currency: Currency) => void
  setFirstName: (firstName: string) => void
  updateCashBalance: (amount: number) => void
  totalAssets: number
  totalLiabilities: number
  netWorth: number
  fireProgress: number
  totalInvestmentValue: number
  totalInvestmentCost: number
  totalInvestmentGain: number
  totalSavingsAmount: number
  totalSavingsTarget: number
  overallSavingsProgress: number
  totalCashAmount: number
  totalPortfolioValue: number
  cashBalance: number
  lastPriceUpdate: string | null
  locale: Locale
  currency: Currency
  firstName: string
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined)

export function FinancialProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(financialReducer, undefined, loadInitialState)
  const initialStateRef = useRef<string>('')
  const isFirstRenderRef = useRef(true)

  // Save to localStorage only when state actually changes from initial
  useEffect(() => {
    const currentStateStr = JSON.stringify(state)
    
    // On first render, store the initial state and skip saving
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false
      initialStateRef.current = currentStateStr
      console.log('Initial load complete, state stored for comparison')
      return
    }
    
    // Skip if state matches what we loaded initially
    if (initialStateRef.current === currentStateStr) {
      return
    }
    
    // This is a real change, save it
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
      console.log('Saved to localStorage (state changed):', state)
      // Update the reference so we don't save the same state again
      initialStateRef.current = currentStateStr
    } catch (e) {
      console.error('Failed to save to localStorage:', e)
    }
  }, [state])

  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  const addAsset = (asset: Omit<Asset, 'id' | 'dateAdded'>) => {
    const newAsset: Asset = {
      ...asset,
      id: generateId(),
      dateAdded: new Date().toISOString(),
    }
    dispatch({ type: 'ADD_ASSET', payload: newAsset })
  }

  const updateAsset = (asset: Asset) => {
    dispatch({ type: 'UPDATE_ASSET', payload: asset })
  }

  const deleteAsset = (id: string) => {
    dispatch({ type: 'DELETE_ASSET', payload: id })
  }

  const addLiability = (liability: Omit<Liability, 'id' | 'dateAdded'>) => {
    const newLiability: Liability = {
      ...liability,
      id: generateId(),
      dateAdded: new Date().toISOString(),
    }
    dispatch({ type: 'ADD_LIABILITY', payload: newLiability })
  }

  const updateLiability = (liability: Liability) => {
    dispatch({ type: 'UPDATE_LIABILITY', payload: liability })
  }

  const deleteLiability = (id: string) => {
    dispatch({ type: 'DELETE_LIABILITY', payload: id })
  }

  const addInvestment = (investment: Omit<Investment, 'id' | 'dateAdded'>) => {
    const newInvestment: Investment = {
      ...investment,
      id: generateId(),
      dateAdded: new Date().toISOString(),
    }
    dispatch({ type: 'ADD_INVESTMENT', payload: newInvestment })
  }

  const updateInvestment = (investment: Investment) => {
    dispatch({ type: 'UPDATE_INVESTMENT', payload: investment })
  }

  const deleteInvestment = (id: string) => {
    dispatch({ type: 'DELETE_INVESTMENT', payload: id })
  }

  const bulkUpdateInvestmentPrices = (updates: { symbol: string; price: number }[]) => {
    dispatch({ type: 'UPDATE_INVESTMENT_PRICES', payload: updates })
  }

  const setLastPriceUpdate = (timestamp: string) => {
    dispatch({ type: 'SET_LAST_PRICE_UPDATE', payload: timestamp })
  }

  const setFireGoal = (goal: number) => {
    dispatch({ type: 'SET_FIRE_GOAL', payload: goal })
  }

  const setLocale = (locale: Locale) => {
    dispatch({ type: 'SET_LOCALE', payload: locale })
  }

  const setCurrency = (currency: Currency) => {
    dispatch({ type: 'SET_CURRENCY', payload: currency })
  }

  const setFirstName = (firstName: string) => {
    dispatch({ type: 'SET_FIRST_NAME', payload: firstName })
  }

  const updateCashBalance = (amount: number) => {
    dispatch({ type: 'SET_CASH_BALANCE', payload: amount })
  }

  const addSavingsGoal = (goal: Omit<SavingsGoal, 'id' | 'dateCreated'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: generateId(),
      dateCreated: new Date().toISOString(),
    }
    dispatch({ type: 'ADD_SAVINGS_GOAL', payload: newGoal })
  }

  const updateSavingsGoal = (goal: SavingsGoal) => {
    dispatch({ type: 'UPDATE_SAVINGS_GOAL', payload: goal })
  }

  const deleteSavingsGoal = (id: string) => {
    dispatch({ type: 'DELETE_SAVINGS_GOAL', payload: id })
  }

  const updateSavingsAmount = (id: string, currentAmount: number) => {
    dispatch({ type: 'UPDATE_SAVINGS_AMOUNT', payload: { id, currentAmount } })
  }

  const addBudgetScenario = (scenario: Omit<BudgetScenario, 'id' | 'dateCreated' | 'dateModified'>) => {
    const now = new Date().toISOString()
    const newScenario: BudgetScenario = {
      ...scenario,
      id: generateId(),
      dateCreated: now,
      dateModified: now,
    }
    dispatch({ type: 'ADD_BUDGET_SCENARIO', payload: newScenario })
  }

  const updateBudgetScenario = (scenario: BudgetScenario) => {
    const updatedScenario = {
      ...scenario,
      dateModified: new Date().toISOString(),
    }
    dispatch({ type: 'UPDATE_BUDGET_SCENARIO', payload: updatedScenario })
  }

  const deleteBudgetScenario = (id: string) => {
    dispatch({ type: 'DELETE_BUDGET_SCENARIO', payload: id })
  }

  const duplicateBudgetScenario = (scenario: BudgetScenario) => {
    const now = new Date().toISOString()
    const duplicatedScenario: BudgetScenario = {
      ...scenario,
      id: generateId(),
      name: `${scenario.name} (Copy)`,
      dateCreated: now,
      dateModified: now,
    }
    dispatch({ type: 'DUPLICATE_BUDGET_SCENARIO', payload: duplicatedScenario })
  }

  const addCashAccount = (account: Omit<CashAccount, 'id' | 'dateAdded'>) => {
    const newAccount: CashAccount = {
      ...account,
      id: generateId(),
      dateAdded: new Date().toISOString(),
    }
    dispatch({ type: 'ADD_CASH_ACCOUNT', payload: newAccount })
  }

  const updateCashAccount = (account: CashAccount) => {
    dispatch({ type: 'UPDATE_CASH_ACCOUNT', payload: account })
  }

  const deleteCashAccount = (id: string) => {
    dispatch({ type: 'DELETE_CASH_ACCOUNT', payload: id })
  }

  const addWatchlistItem = (item: Omit<WatchlistItem, 'id' | 'dateAdded'>) => {
    const newItem: WatchlistItem = {
      ...item,
      id: generateId(),
      dateAdded: new Date().toISOString(),
    }
    dispatch({ type: 'ADD_WATCHLIST_ITEM', payload: newItem })
  }

  const updateWatchlistItem = (item: WatchlistItem) => {
    dispatch({ type: 'UPDATE_WATCHLIST_ITEM', payload: item })
  }

  const deleteWatchlistItem = (id: string) => {
    dispatch({ type: 'DELETE_WATCHLIST_ITEM', payload: id })
  }

  const promoteWatchlistToHolding = (watchlistId: string, investmentData: Omit<Investment, 'id' | 'dateAdded' | 'symbol' | 'name'>) => {
    dispatch({ type: 'PROMOTE_WATCHLIST_TO_HOLDING', payload: { watchlistId, investmentData } })
  }

  const demoteHoldingToWatchlist = (investmentId: string, watchlistData: Omit<WatchlistItem, 'id' | 'dateAdded' | 'symbol' | 'name' | 'currentPrice'>) => {
    dispatch({ type: 'DEMOTE_HOLDING_TO_WATCHLIST', payload: { investmentId, watchlistData } })
  }

  const bulkUpdateWatchlistPrices = (updates: { symbol: string; price: number }[]) => {
    dispatch({ type: 'UPDATE_WATCHLIST_PRICES', payload: updates })
  }

  const totalAssets = state.assets.reduce((sum, asset) => sum + asset.value, 0)
  const totalLiabilities = state.liabilities.reduce((sum, liability) => sum + liability.value, 0)
  const netWorth = totalAssets - totalLiabilities
  const fireProgress = Math.min((netWorth / state.fireGoal) * 100, 100)
  
  const totalInvestmentValue = state.investments.reduce((sum, inv) => sum + (inv.shares * inv.currentPrice), 0)
  const totalInvestmentCost = state.investments.reduce((sum, inv) => sum + (inv.shares * inv.costBasis), 0)
  const totalInvestmentGain = totalInvestmentValue - totalInvestmentCost

  const totalSavingsAmount = state.savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0)
  const totalSavingsTarget = state.savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const overallSavingsProgress = totalSavingsTarget > 0 ? Math.min((totalSavingsAmount / totalSavingsTarget) * 100, 100) : 0

  const totalCashAmount = state.cashBalance
  const totalPortfolioValue = totalInvestmentValue + totalCashAmount

  return (
    <FinancialContext.Provider
      value={{
        state,
        addAsset,
        updateAsset,
        deleteAsset,
        addLiability,
        updateLiability,
        deleteLiability,
        addInvestment,
        updateInvestment,
        deleteInvestment,
        bulkUpdateInvestmentPrices,
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        updateSavingsAmount,
        addBudgetScenario,
        updateBudgetScenario,
        deleteBudgetScenario,
        duplicateBudgetScenario,
        addCashAccount,
        updateCashAccount,
        deleteCashAccount,
        addWatchlistItem,
        updateWatchlistItem,
        deleteWatchlistItem,
        promoteWatchlistToHolding,
        demoteHoldingToWatchlist,
        bulkUpdateWatchlistPrices,
        setLastPriceUpdate,
        setFireGoal,
        setLocale,
        setCurrency,
        setFirstName,
        updateCashBalance,
        totalAssets,
        totalLiabilities,
        netWorth,
        fireProgress,
        totalInvestmentValue,
        totalInvestmentCost,
        totalInvestmentGain,
        totalSavingsAmount,
        totalSavingsTarget,
        overallSavingsProgress,
        totalCashAmount,
        totalPortfolioValue,
        cashBalance: state.cashBalance,
        lastPriceUpdate: state.lastPriceUpdate,
        locale: state.locale,
        currency: state.currency,
        firstName: state.firstName,
      }}
    >
      {children}
    </FinancialContext.Provider>
  )
}

export function useFinancial() {
  const context = useContext(FinancialContext)
  if (context === undefined) {
    throw new Error('useFinancial must be used within a FinancialProvider')
  }
  return context
}

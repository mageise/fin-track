import type { TranslationKey } from '../i18n/translations'

export type AssetType = 'cash' | 'investment' | 'retirement' | 'real_estate' | 'vehicle' | 'other'
export type LiabilityType = 'mortgage' | 'auto_loan' | 'credit_card' | 'student_loan' | 'personal_loan' | 'other'

export interface Asset {
  id: string
  name: string
  type: AssetType
  value: number
  dateAdded: string
  notes?: string
}

export interface Liability {
  id: string
  name: string
  type: LiabilityType
  value: number
  interestRate?: number
  dateAdded: string
  notes?: string
}

export interface NetWorthHistory {
  date: string
  netWorth: number
  assets: number
  liabilities: number
}

export interface FinancialData {
  assets: Asset[]
  liabilities: Liability[]
  netWorthHistory: NetWorthHistory[]
}

// Investment Portfolio Types
export type InvestmentType = 'stock' | 'bond' | 'etf' | 'mutual_fund' | 'crypto' | 'commodity' | 'reit' | 'cash'
export type InvestmentAccount = 'taxable' | 'ira' | 'roth_ira' | '401k' | 'hsa' | '529'

export interface Investment {
  id: string
  symbol: string
  name: string
  type: InvestmentType
  account: InvestmentAccount
  shares: number
  costBasis: number
  currentPrice: number
  dateAdded: string
  notes?: string
}

export interface WatchlistItem {
  id: string
  symbol: string
  name: string
  shares: number
  targetPrice: number
  currentPrice?: number
  dateAdded: string
  notes?: string
}

export const INVESTMENT_TYPES: { value: InvestmentType; translationKey: TranslationKey }[] = [
  { value: 'stock', translationKey: 'investmentType_stock' },
  { value: 'bond', translationKey: 'investmentType_bond' },
  { value: 'etf', translationKey: 'investmentType_etf' },
  { value: 'mutual_fund', translationKey: 'investmentType_mutual_fund' },
  { value: 'crypto', translationKey: 'investmentType_crypto' },
  { value: 'commodity', translationKey: 'investmentType_commodity' },
  { value: 'reit', translationKey: 'investmentType_reit' },
  { value: 'cash', translationKey: 'investmentType_cash' },
]

export const INVESTMENT_ACCOUNTS: { value: InvestmentAccount; translationKey: TranslationKey }[] = [
  { value: 'taxable', translationKey: 'accountType_taxable' },
  { value: 'ira', translationKey: 'accountType_ira' },
  { value: 'roth_ira', translationKey: 'accountType_roth_ira' },
  { value: '401k', translationKey: 'accountType_401k' },
  { value: 'hsa', translationKey: 'accountType_hsa' },
  { value: '529', translationKey: 'accountType_529' },
]

export const ASSET_TYPES: { value: AssetType; label: string; icon: string }[] = [
  { value: 'cash', label: 'Cash & Savings', icon: 'Wallet' },
  { value: 'investment', label: 'Investment Accounts', icon: 'TrendingUp' },
  { value: 'retirement', label: 'Retirement Accounts', icon: 'Shield' },
  { value: 'real_estate', label: 'Real Estate', icon: 'Home' },
  { value: 'vehicle', label: 'Vehicles', icon: 'Car' },
  { value: 'other', label: 'Other', icon: 'Package' },
]

export const LIABILITY_TYPES: { value: LiabilityType; label: string; icon: string }[] = [
  { value: 'mortgage', label: 'Mortgage', icon: 'Home' },
  { value: 'auto_loan', label: 'Auto Loan', icon: 'Car' },
  { value: 'credit_card', label: 'Credit Card', icon: 'CreditCard' },
  { value: 'student_loan', label: 'Student Loan', icon: 'GraduationCap' },
  { value: 'personal_loan', label: 'Personal Loan', icon: 'User' },
  { value: 'other', label: 'Other', icon: 'Package' },
]

// Savings Goals Types
export type SavingsGoalType = 'emergency' | 'vacation' | 'home' | 'vehicle' | 'education' | 'retirement' | 'other'
export type SavingsPriority = 'low' | 'medium' | 'high'

export interface SavingsGoal {
  id: string
  name: string
  type: SavingsGoalType
  targetAmount: number
  currentAmount: number
  targetDate?: string
  priority: SavingsPriority
  dateCreated: string
  notes?: string
}

export const SAVINGS_GOAL_TYPES: { value: SavingsGoalType; label: string; icon: string }[] = [
  { value: 'emergency', label: 'Emergency Fund', icon: 'Shield' },
  { value: 'vacation', label: 'Vacation', icon: 'Plane' },
  { value: 'home', label: 'Home', icon: 'Home' },
  { value: 'vehicle', label: 'Vehicle', icon: 'Car' },
  { value: 'education', label: 'Education', icon: 'GraduationCap' },
  { value: 'retirement', label: 'Retirement', icon: 'Target' },
  { value: 'other', label: 'Other', icon: 'Package' },
]

export const SAVINGS_PRIORITIES: { value: SavingsPriority; label: string }[] = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

// Budget Planner Types
export type BudgetCategory =
  | 'travel'
  | 'accommodation'
  | 'food'
  | 'transportation'
  | 'activities'
  | 'shopping'
  | 'other'

export interface BudgetLineItem {
  id: string
  category: BudgetCategory
  label: string
  amount: number
}

export interface BudgetScenario {
  id: string
  name: string
  description?: string
  budgetLimit?: number
  lineItems: BudgetLineItem[]
  dateCreated: string
  dateModified: string
}

export const BUDGET_CATEGORIES: {
  value: BudgetCategory
  label: string
  icon: string
}[] = [
  { value: 'travel', label: 'Travel', icon: 'Plane' },
  { value: 'accommodation', label: 'Accommodation', icon: 'Home' },
  { value: 'food', label: 'Food & Dining', icon: 'UtensilsCrossed' },
  { value: 'transportation', label: 'Transportation', icon: 'Car' },
  { value: 'activities', label: 'Activities', icon: 'Ticket' },
  { value: 'shopping', label: 'Shopping', icon: 'ShoppingBag' },
  { value: 'other', label: 'Other', icon: 'MoreHorizontal' },
]

// Cash Accounts Types
export interface CashAccount {
  id: string
  name: string
  amount: number
  dateAdded: string
  notes?: string
}

// Reports Types
export type ReportType =
  | 'net-worth-summary'
  | 'investment-performance'
  | 'budget-analysis'
  | 'savings-progress'
  | 'comprehensive'

export type ReportSection = 'net-worth' | 'investments' | 'budget' | 'savings' | 'summary'

export interface InvestmentPerformance {
  symbol: string
  name: string
  gain: number
  gainPercent: number
}

export interface AllocationItem {
  name: string
  value: number
}

export interface BudgetCategorySummary {
  category: string
  budget: number
  spent: number
  remaining: number
}

export interface SavingsGoalProgress {
  name: string
  currentAmount: number
  targetAmount: number
  progressPercent: number
}

export interface ReportData {
  netWorth?: {
    startAmount: number
    endAmount: number
    change: number
    changePercent: number
  }
  investments?: {
    totalValue: number
    totalGain: number
    totalReturn: number
    topPerformers: InvestmentPerformance[]
    worstPerformers: InvestmentPerformance[]
    allocationByType: AllocationItem[]
    allocationByAccount: AllocationItem[]
  }
  budget?: {
    totalBudget: number
    totalSpent: number
    totalRemaining: number
    adherencePercent: number
    categoryBreakdown: BudgetCategorySummary[]
    overspentCategories: string[]
  }
  savings?: {
    totalSaved: number
    totalTarget: number
    progressPercent: number
    completedGoals: number
    activeGoals: number
    goalsProgress: SavingsGoalProgress[]
  }
}

export interface Report {
  id: string
  type: ReportType
  title: string
  dateRange: {
    start: string
    end: string
  }
  generatedAt: string
  sections: ReportSection[]
  data: ReportData
}

export interface ReportTemplate {
  id: string
  name: string
  type: ReportType
  defaultDateRange: 'current-month' | 'current-year' | 'last-30-days' | 'last-90-days' | 'ytd' | 'custom'
  includedSections: ReportSection[]
}

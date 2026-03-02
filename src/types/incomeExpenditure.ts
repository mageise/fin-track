export interface WorkConfig {
  hourlyRate: number
  dailyHours: number
  workDays: number
}

export interface TaxConfig {
  incomeTaxRate: number
  taxExemption: number
  solidaritySurcharge: number
  incomeAdjustment: number
  childBenefit: number
}

export type ExpenditureCategory = 'fixed_cost' | 'reserve' | 'investment'

export type Frequency = 'monthly' | 'quarterly' | 'yearly'

export interface Expenditure {
  id: string
  name: string
  category: ExpenditureCategory
  subcategory?: string
  amount: number
  frequency: Frequency
  isRecurring: boolean
  startDate: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface QuarterlyData {
  quarter: string
  grossIncome: number
  netIncome: number
  expenditures: number
  netCashFlow: number
  taxPrepayment: number
  buffer: number
  cashOnHand: number
}

export interface IncomeExpenditureData {
  workConfig: WorkConfig | null
  taxConfig: TaxConfig | null
  expenditures: Expenditure[]
}

export const DEFAULT_WORK_CONFIG: WorkConfig = {
  hourlyRate: 0,
  dailyHours: 8,
  workDays: 220,
}

export const DEFAULT_TAX_CONFIG: TaxConfig = {
  incomeTaxRate: 0,
  taxExemption: 11604,
  solidaritySurcharge: 5.5,
  incomeAdjustment: 0,
  childBenefit: 0,
}

export const EXPENDITURE_CATEGORIES: {
  value: ExpenditureCategory
  label: string
  icon: string
}[] = [
  { value: 'fixed_cost', label: 'Fixed Cost', icon: 'CreditCard' },
  { value: 'reserve', label: 'Reserve', icon: 'PiggyBank' },
  { value: 'investment', label: 'Investment', icon: 'TrendingUp' },
]

export const EXPENDITURE_SUBCATEGORIES: Record<ExpenditureCategory, string[]> = {
  fixed_cost: ['Other', 'Home', 'Utility', 'Insurance', 'Car', 'Shopping', 'Family & Co.'],
  reserve: ['Other', 'House', 'Car', 'Tax', 'Repayment', 'Vacation', 'Purchase', 'Pension', 'Saving'],
  investment: ['Other', 'ETF', 'Stock', 'Bond', 'Crypto', 'Pension'],
}

export const FREQUENCIES: {
  value: Frequency
  label: string
  months: number
}[] = [
  { value: 'monthly', label: 'Monthly', months: 1 },
  { value: 'quarterly', label: 'Quarterly', months: 3 },
  { value: 'yearly', label: 'Yearly', months: 12 },
]

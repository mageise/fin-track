export interface WorkPeriod {
  id: string
  period: string
  workdays: number
  workingHours: number
  hourlyRate: number
  incomeYear: boolean
  taxYear: boolean
}

export interface TaxConfig {
  taxExemption: number
}

export type ExpenditureCategory = 'fixedCosts' | 'reserves' | 'investments'

export type Frequency = 'monthly' | 'quarterly' | 'yearly' | 'bimonthly'

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
  workPeriods: WorkPeriod[]
  taxConfig: TaxConfig | null
  expenditures: Expenditure[]
}

export const DEFAULT_TAX_CONFIG: TaxConfig = {
  taxExemption: 11604,
}

export const DEFAULT_WORK_PERIODS: WorkPeriod[] = [
  {
    id: '1',
    period: new Date().getFullYear().toString(),
    workdays: 220,
    workingHours: 8,
    hourlyRate: 50,
    incomeYear: true,
    taxYear: true,
  },
]

export const EXPENDITURE_CATEGORIES: {
  value: ExpenditureCategory
  label: string
  icon: string
}[] = [
  { value: 'fixedCosts', label: 'Fixed Costs', icon: 'CreditCard' },
  { value: 'reserves', label: 'Reserves', icon: 'PiggyBank' },
  { value: 'investments', label: 'Investments', icon: 'TrendingUp' },
]

export const EXPENDITURE_SUBCATEGORIES: Record<ExpenditureCategory, string[]> = {
  fixedCosts: ['Other', 'Home', 'Utility', 'Insurance', 'Car', 'Shopping', 'FamilyCo'],
  reserves: ['Other', 'House', 'Car', 'Tax', 'Repayment', 'Vacation', 'Purchase', 'Retirement', 'Saving'],
  investments: ['Other', 'ETF', 'Stock', 'Bond', 'Crypto', 'Pension'],
}

export const FREQUENCIES: {
  value: Frequency
  label: string
  months: number
}[] = [
  { value: 'monthly', label: 'Monthly', months: 1 },
  { value: 'bimonthly', label: 'Bimonthly', months: 2 },
  { value: 'quarterly', label: 'Quarterly', months: 3 },
  { value: 'yearly', label: 'Yearly', months: 12 },
]

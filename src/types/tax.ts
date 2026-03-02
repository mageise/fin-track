export type TaxYear = 2024 | 2025 | 2026

export interface TaxBracket {
  name: string
  minIncome: number
  maxIncome: number | null
  formula: 'linear' | 'proportional'
  y?: number
  z?: number
  x?: number
  constant?: number
}

export interface TaxBreakdownZone {
  zone: string
  name: string
  incomeInZone: number
  taxInZone: number
}

export interface SoliBreakdown {
  zone: 'freigrenze' | 'milderung' | 'voll'
  name: string
  incomeTax: number
  soliAmount: number
}

export interface TaxResult {
  grossIncome: number
  taxableIncome: number
  incomeTax: number
  solidaritySurcharge: number
  soliBreakdown: SoliBreakdown
  totalTax: number
  effectiveRate: number
  marginalRate: number
  breakdown: TaxBreakdownZone[]
}

export interface TaxBrackets {
  year: TaxYear
  grundfreibetrag: number
  zones: TaxBracket[]
}

import type { WorkConfig, TaxConfig } from '../types/incomeExpenditure'

export function calculateIncomeMetrics(
  workConfig: WorkConfig,
  taxConfig: TaxConfig
) {
  const netWorkDays = workConfig.workDays

  const dailyRate = workConfig.hourlyRate * workConfig.dailyHours
  const annualGross = dailyRate * netWorkDays
  const grossIncomeTaxable = annualGross + taxConfig.incomeAdjustment

  const taxableIncome = Math.max(0, grossIncomeTaxable - taxConfig.taxExemption)
  const annualTax = (taxableIncome / 100) * taxConfig.incomeTaxRate
  const solidaritySurcharge = (annualTax / 100) * taxConfig.solidaritySurcharge
  const childBenefitHalf = (taxConfig.childBenefit / 2)
  const annualNet = annualGross - annualTax - solidaritySurcharge - childBenefitHalf

  return {
    netWorkDays,
    dailyRate,
    annualGross,
    grossIncomeTaxable,
    taxableIncome,
    annualTax,
    solidaritySurcharge,
    childBenefitHalf,
    annualNet,
    quarterlyGross: annualGross / 4,
    quarterlyTax: annualTax / 4,
    quarterlyNet: annualNet / 4,
    monthlyNet: annualNet / 12,
  }
}

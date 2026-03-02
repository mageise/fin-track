import type { TaxYear, TaxBrackets, TaxResult, TaxBreakdownZone, SoliBreakdown } from '../types/tax'

const TAX_BRACKETS_2024: TaxBrackets = {
  year: 2024,
  grundfreibetrag: 11784,
  zones: [
    {
      name: 'Nullzone',
      minIncome: 0,
      maxIncome: 11784,
      formula: 'linear',
    },
    {
      name: 'Untere Progressionszone',
      minIncome: 11785,
      maxIncome: 17005,
      formula: 'proportional',
      y: 0,
      constant: 0,
    },
    {
      name: 'Obere Progressionszone',
      minIncome: 17006,
      maxIncome: 66760,
      formula: 'proportional',
      z: 0,
      constant: 991.21,
    },
    {
      name: 'Proportionalzone',
      minIncome: 66761,
      maxIncome: 277825,
      formula: 'proportional',
      x: 0.42,
      constant: -10602.13,
    },
    {
      name: 'Reichensteuer',
      minIncome: 277826,
      maxIncome: null,
      formula: 'proportional',
      x: 0.45,
      constant: -18936.88,
    },
  ],
}

const TAX_BRACKETS_2025: TaxBrackets = {
  year: 2025,
  grundfreibetrag: 12096,
  zones: [
    {
      name: 'Nullzone',
      minIncome: 0,
      maxIncome: 12096,
      formula: 'linear',
    },
    {
      name: 'Untere Progressionszone',
      minIncome: 12097,
      maxIncome: 17443,
      formula: 'proportional',
      y: 0,
      constant: 0,
    },
    {
      name: 'Obere Progressionszone',
      minIncome: 17444,
      maxIncome: 68480,
      formula: 'proportional',
      z: 0,
      constant: 1015.13,
    },
    {
      name: 'Proportionalzone',
      minIncome: 68481,
      maxIncome: 277825,
      formula: 'proportional',
      x: 0.42,
      constant: -10911.92,
    },
    {
      name: 'Reichensteuer',
      minIncome: 277826,
      maxIncome: null,
      formula: 'proportional',
      x: 0.45,
      constant: -19246.67,
    },
  ],
}

const TAX_BRACKETS_2026: TaxBrackets = {
  year: 2026,
  grundfreibetrag: 12348,
  zones: [
    {
      name: 'Nullzone',
      minIncome: 0,
      maxIncome: 12348,
      formula: 'linear',
    },
    {
      name: 'Untere Progressionszone',
      minIncome: 12349,
      maxIncome: 17799,
      formula: 'proportional',
      y: 0,
      constant: 0,
    },
    {
      name: 'Obere Progressionszone',
      minIncome: 17800,
      maxIncome: 69878,
      formula: 'proportional',
      z: 0,
      constant: 1034.87,
    },
    {
      name: 'Proportionalzone',
      minIncome: 69879,
      maxIncome: 277825,
      formula: 'proportional',
      x: 0.42,
      constant: -11135.63,
    },
    {
      name: 'Reichensteuer',
      minIncome: 277826,
      maxIncome: null,
      formula: 'proportional',
      x: 0.45,
      constant: -19470.38,
    },
  ],
}

export function getTaxBrackets(year: TaxYear): TaxBrackets {
  switch (year) {
    case 2024:
      return TAX_BRACKETS_2024
    case 2025:
      return TAX_BRACKETS_2025
    case 2026:
      return TAX_BRACKETS_2026
    default:
      return TAX_BRACKETS_2025
  }
}

function calculateIncomeTax(income: number, brackets: TaxBrackets): number {
  const x = Math.floor(income)

  if (x <= brackets.grundfreibetrag) {
    return 0
  }

  if (x <= 17005) {
    const y = (x - 11784) / 10000
    const result = (954.80 * y + 1400) * y
    return Math.floor(result)
  }

  if (x <= 66760) {
    const z = (x - 17005) / 10000
    const result = (181.19 * z + 2397) * z + 991.21
    return Math.floor(result)
  }

  if (x <= 277825) {
    const result = 0.42 * x - 10636.31
    return Math.floor(result)
  }

  const result = 0.45 * x - 18971.06
  return Math.floor(result)
}

function calculateIncomeTax2025(income: number, brackets: TaxBrackets): number {
  const x = Math.floor(income)

  if (x <= brackets.grundfreibetrag) {
    return 0
  }

  if (x <= 17443) {
    const y = (x - 12096) / 10000
    const result = (932.30 * y + 1400) * y
    return Math.floor(result)
  }

  if (x <= 68480) {
    const z = (x - 17443) / 10000
    const result = (176.64 * z + 2397) * z + 1015.13
    return Math.floor(result)
  }

  if (x <= 277825) {
    const result = 0.42 * x - 10911.92
    return Math.floor(result)
  }

  const result = 0.45 * x - 19246.67
  return Math.floor(result)
}

function calculateIncomeTax2026(income: number, brackets: TaxBrackets): number {
  const x = Math.floor(income)

  if (x <= brackets.grundfreibetrag) {
    return 0
  }

  if (x <= 17799) {
    const y = (x - 12348) / 10000
    const result = (914.51 * y + 1400) * y
    return Math.floor(result)
  }

  if (x <= 69878) {
    const z = (x - 17799) / 10000
    const result = (173.10 * z + 2397) * z + 1034.87
    return Math.floor(result)
  }

  if (x <= 277825) {
    const result = 0.42 * x - 11135.63
    return Math.floor(result)
  }

  const result = 0.45 * x - 19470.38
  return Math.floor(result)
}

const SOLI_THRESHOLDS_2024 = {
  freigrenze: 18130,
  upperLimit: 33710,
}

const SOLI_THRESHOLDS_2025 = {
  freigrenze: 19950,
  upperLimit: 37094,
}

const SOLI_THRESHOLDS_2026 = {
  freigrenze: 20350,
  upperLimit: 37838,
}

function getSoliThresholds(year: TaxYear) {
  switch (year) {
    case 2024:
      return SOLI_THRESHOLDS_2024
    case 2025:
      return SOLI_THRESHOLDS_2025
    case 2026:
      return SOLI_THRESHOLDS_2026
    default:
      return SOLI_THRESHOLDS_2025
  }
}

function calculateSolidaritySurcharge(incomeTax: number, year: TaxYear): number {
  if (incomeTax <= 0) return 0

  const thresholds = getSoliThresholds(year)

  if (incomeTax <= thresholds.freigrenze) {
    return 0
  }

  if (incomeTax <= thresholds.upperLimit) {
    return Math.round(100 * (incomeTax - thresholds.freigrenze) * 0.119) / 100
  }

  return Math.round(100 * incomeTax * 0.055) / 100
}

function calculateSoliBreakdown(incomeTax: number, year: TaxYear): SoliBreakdown {
  if (incomeTax <= 0) {
    return { zone: 'freigrenze', name: 'Freigrenze', incomeTax: 0, soliAmount: 0 }
  }

  const thresholds = getSoliThresholds(year)

  if (incomeTax <= thresholds.freigrenze) {
    return { zone: 'freigrenze', name: 'Freigrenze', incomeTax, soliAmount: 0 }
  }

  if (incomeTax <= thresholds.upperLimit) {
    const soliAmount = Math.round(100 * (incomeTax - thresholds.freigrenze) * 0.119) / 100
    return { zone: 'milderung', name: 'Milderungszone', incomeTax, soliAmount }
  }

  const soliAmount = Math.round(100 * incomeTax * 0.055) / 100
  return { zone: 'voll', name: 'Vollzone (5,5%)', incomeTax, soliAmount }
}

export function calculateGermanTax(
  grossIncome: number,
  year: TaxYear
): TaxResult {
  const brackets = getTaxBrackets(year)
  const taxableIncome = Math.max(0, Math.floor(grossIncome))

  let incomeTax: number
  if (year === 2024) {
    incomeTax = calculateIncomeTax(taxableIncome, brackets)
  } else if (year === 2025) {
    incomeTax = calculateIncomeTax2025(taxableIncome, brackets)
  } else {
    incomeTax = calculateIncomeTax2026(taxableIncome, brackets)
  }

  const solidaritySurcharge = calculateSolidaritySurcharge(incomeTax, year)
  const soliBreakdown = calculateSoliBreakdown(incomeTax, year)
  const totalTax = incomeTax + solidaritySurcharge
  const effectiveRate = grossIncome > 0 ? (totalTax / grossIncome) * 100 : 0

  const marginalRate = calculateMarginalRate(taxableIncome, year)
  const breakdown = calculateBreakdown(taxableIncome, year)

  return {
    grossIncome,
    taxableIncome,
    incomeTax,
    solidaritySurcharge,
    soliBreakdown,
    totalTax,
    effectiveRate,
    marginalRate,
    breakdown,
  }
}

function calculateMarginalRate(income: number, year: TaxYear): number {
  const x = Math.floor(income)

  if (year === 2024) {
    if (x <= 11784) return 0
    if (x <= 17005) {
      const y = (x - 11784) / 10000
      return ((2 * 954.80 * y + 1400) / 10000) * 100
    }
    if (x <= 66760) {
      const z = (x - 17005) / 10000
      return ((2 * 181.19 * z + 2397) / 10000) * 100
    }
    if (x <= 277825) return 42
    return 45
  } else if (year === 2025) {
    if (x <= 12096) return 0
    if (x <= 17443) {
      const y = (x - 12096) / 10000
      return ((2 * 932.30 * y + 1400) / 10000) * 100
    }
    if (x <= 68480) {
      const z = (x - 17443) / 10000
      return ((2 * 176.64 * z + 2397) / 10000) * 100
    }
    if (x <= 277825) return 42
    return 45
  } else {
    if (x <= 12348) return 0
    if (x <= 17799) {
      const y = (x - 12348) / 10000
      return ((2 * 914.51 * y + 1400) / 10000) * 100
    }
    if (x <= 69878) {
      const z = (x - 17799) / 10000
      return ((2 * 173.10 * z + 2397) / 10000) * 100
    }
    if (x <= 277825) return 42
    return 45
  }
}

function calculateBreakdown(income: number, year: TaxYear): TaxBreakdownZone[] {
  const breakdown: TaxBreakdownZone[] = []
  const x = Math.floor(income)

  if (year === 2024) {
    if (x <= 11784) {
      breakdown.push({ zone: '1', name: 'Nullzone (0%)', incomeInZone: x, taxInZone: 0 })
      return breakdown
    }

    breakdown.push({ zone: '1', name: 'Nullzone (0%)', incomeInZone: 11784, taxInZone: 0 })

    if (x <= 17005) {
      const incomeInZone = x - 11784
      const y = incomeInZone / 10000
      const taxInZone = Math.floor((954.80 * y + 1400) * y)
      breakdown.push({ zone: '2', name: 'Untere Progressionszone (14-24%)', incomeInZone, taxInZone })
      return breakdown
    }

    const taxAtEndOfZone2 = Math.floor((954.80 * ((17005 - 11784) / 10000) + 1400) * ((17005 - 11784) / 10000))
    breakdown.push({
      zone: '2',
      name: 'Untere Progressionszone (14-24%)',
      incomeInZone: 17005 - 11784,
      taxInZone: taxAtEndOfZone2,
    })

    if (x <= 66760) {
      const incomeInZone = x - 17005
      const z = incomeInZone / 10000
      const taxTotal = Math.floor((181.19 * z + 2397) * z + 991.21)
      const taxInZone = taxTotal - taxAtEndOfZone2
      breakdown.push({ zone: '3', name: 'Obere Progressionszone (24-42%)', incomeInZone, taxInZone })
      return breakdown
    }

    const taxAtEndOfZone3 = Math.floor((181.19 * ((66760 - 17005) / 10000) + 2397) * ((66760 - 17005) / 10000) + 991.21)
    breakdown.push({
      zone: '3',
      name: 'Obere Progressionszone (24-42%)',
      incomeInZone: 66760 - 17005,
      taxInZone: taxAtEndOfZone3 - taxAtEndOfZone2,
    })

    if (x <= 277825) {
      const incomeInZone = x - 66760
      const taxInZone = Math.floor(0.42 * incomeInZone)
      breakdown.push({ zone: '4', name: 'Proportionalzone (42%)', incomeInZone, taxInZone })
      return breakdown
    }

    breakdown.push({
      zone: '4',
      name: 'Proportionalzone (42%)',
      incomeInZone: 277825 - 66760,
      taxInZone: Math.floor(0.42 * (277825 - 66760)),
    })

    const incomeInZone5 = x - 277825
    const taxInZone5 = Math.floor(0.45 * incomeInZone5)
    breakdown.push({ zone: '5', name: 'Reichensteuer (45%)', incomeInZone: incomeInZone5, taxInZone: taxInZone5 })
  } else if (year === 2025) {
    if (x <= 12096) {
      breakdown.push({ zone: '1', name: 'Nullzone (0%)', incomeInZone: x, taxInZone: 0 })
      return breakdown
    }

    breakdown.push({ zone: '1', name: 'Nullzone (0%)', incomeInZone: 12096, taxInZone: 0 })

    if (x <= 17443) {
      const incomeInZone = x - 12096
      const y = incomeInZone / 10000
      const taxInZone = Math.floor((932.30 * y + 1400) * y)
      breakdown.push({ zone: '2', name: 'Untere Progressionszone (14-24%)', incomeInZone, taxInZone })
      return breakdown
    }

    const taxAtEndOfZone2_2025 = Math.floor((932.30 * ((17443 - 12096) / 10000) + 1400) * ((17443 - 12096) / 10000))
    breakdown.push({
      zone: '2',
      name: 'Untere Progressionszone (14-24%)',
      incomeInZone: 17443 - 12096,
      taxInZone: taxAtEndOfZone2_2025,
    })

    if (x <= 68480) {
      const incomeInZone = x - 17443
      const z = incomeInZone / 10000
      const taxTotal = Math.floor((176.64 * z + 2397) * z + 1015.13)
      const taxInZone = taxTotal - taxAtEndOfZone2_2025
      breakdown.push({ zone: '3', name: 'Obere Progressionszone (24-42%)', incomeInZone, taxInZone })
      return breakdown
    }

    const taxAtEndOfZone3_2025 = Math.floor((176.64 * ((68480 - 17443) / 10000) + 2397) * ((68480 - 17443) / 10000) + 1015.13)
    breakdown.push({
      zone: '3',
      name: 'Obere Progressionszone (24-42%)',
      incomeInZone: 68480 - 17443,
      taxInZone: taxAtEndOfZone3_2025 - taxAtEndOfZone2_2025,
    })

    if (x <= 277825) {
      const incomeInZone = x - 68480
      const taxInZone = Math.floor(0.42 * incomeInZone)
      breakdown.push({ zone: '4', name: 'Proportionalzone (42%)', incomeInZone, taxInZone })
      return breakdown
    }

    breakdown.push({
      zone: '4',
      name: 'Proportionalzone (42%)',
      incomeInZone: 277825 - 68480,
      taxInZone: Math.floor(0.42 * (277825 - 68480)),
    })

    const incomeInZone5_2025 = x - 277825
    const taxInZone5_2025 = Math.floor(0.45 * incomeInZone5_2025)
    breakdown.push({ zone: '5', name: 'Reichensteuer (45%)', incomeInZone: incomeInZone5_2025, taxInZone: taxInZone5_2025 })
  } else {
    if (x <= 12348) {
      breakdown.push({ zone: '1', name: 'Nullzone (0%)', incomeInZone: x, taxInZone: 0 })
      return breakdown
    }

    breakdown.push({ zone: '1', name: 'Nullzone (0%)', incomeInZone: 12348, taxInZone: 0 })

    if (x <= 17799) {
      const incomeInZone = x - 12348
      const y = incomeInZone / 10000
      const taxInZone = Math.floor((914.51 * y + 1400) * y)
      breakdown.push({ zone: '2', name: 'Untere Progressionszone (14-24%)', incomeInZone, taxInZone })
      return breakdown
    }

    const taxAtEndOfZone2_2026 = Math.floor((914.51 * ((17799 - 12348) / 10000) + 1400) * ((17799 - 12348) / 10000))
    breakdown.push({
      zone: '2',
      name: 'Untere Progressionszone (14-24%)',
      incomeInZone: 17799 - 12348,
      taxInZone: taxAtEndOfZone2_2026,
    })

    if (x <= 69878) {
      const incomeInZone = x - 17799
      const z = incomeInZone / 10000
      const taxTotal = Math.floor((173.10 * z + 2397) * z + 1034.87)
      const taxInZone = taxTotal - taxAtEndOfZone2_2026
      breakdown.push({ zone: '3', name: 'Obere Progressionszone (24-42%)', incomeInZone, taxInZone })
      return breakdown
    }

    const taxAtEndOfZone3_2026 = Math.floor((173.10 * ((69878 - 17799) / 10000) + 2397) * ((69878 - 17799) / 10000) + 1034.87)
    breakdown.push({
      zone: '3',
      name: 'Obere Progressionszone (24-42%)',
      incomeInZone: 69878 - 17799,
      taxInZone: taxAtEndOfZone3_2026 - taxAtEndOfZone2_2026,
    })

    if (x <= 277825) {
      const incomeInZone = x - 69878
      const taxInZone = Math.floor(0.42 * incomeInZone)
      breakdown.push({ zone: '4', name: 'Proportionalzone (42%)', incomeInZone, taxInZone })
      return breakdown
    }

    breakdown.push({
      zone: '4',
      name: 'Proportionalzone (42%)',
      incomeInZone: 277825 - 69878,
      taxInZone: Math.floor(0.42 * (277825 - 69878)),
    })

    const incomeInZone5_2026 = x - 277825
    const taxInZone5_2026 = Math.floor(0.45 * incomeInZone5_2026)
    breakdown.push({ zone: '5', name: 'Reichensteuer (45%)', incomeInZone: incomeInZone5_2026, taxInZone: taxInZone5_2026 })
  }

  return breakdown
}

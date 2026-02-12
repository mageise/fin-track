import { describe, it, expect } from 'vitest'
import type { Investment, SavingsGoal } from '../types/financial'

// Test data aggregation logic
function calculateNetWorthChange(startAmount: number, endAmount: number) {
  const change = endAmount - startAmount
  const changePercent = startAmount !== 0 ? (change / Math.abs(startAmount)) * 100 : 0
  return { change, changePercent }
}

function calculateInvestmentPerformance(investments: Investment[]) {
  return investments.map(inv => {
    const currentValue = inv.shares * inv.currentPrice
    const costBasis = inv.shares * inv.costBasis
    const gain = currentValue - costBasis
    const gainPercent = costBasis > 0 ? (gain / costBasis) * 100 : 0
    return {
      symbol: inv.symbol,
      name: inv.name,
      gain,
      gainPercent
    }
  })
}

function calculateTotalInvestmentValue(investments: Investment[]) {
  return investments.reduce((sum, inv) => sum + (inv.shares * inv.currentPrice), 0)
}

function calculateTotalInvestmentCost(investments: Investment[]) {
  return investments.reduce((sum, inv) => sum + (inv.shares * inv.costBasis), 0)
}

function calculateSavingsProgress(goals: SavingsGoal[]) {
  const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0)
  const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0)
  const completedGoals = goals.filter(goal => goal.currentAmount >= goal.targetAmount).length
  
  return {
    totalSaved,
    totalTarget,
    progressPercent: totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0,
    completedGoals,
    activeGoals: goals.length - completedGoals
  }
}

describe('Reports Data Aggregation', () => {
  describe('Net Worth Calculations', () => {
    it('should calculate positive change correctly', () => {
      const result = calculateNetWorthChange(100000, 120000)
      expect(result.change).toBe(20000)
      expect(result.changePercent).toBe(20)
    })

    it('should calculate negative change correctly', () => {
      const result = calculateNetWorthChange(100000, 80000)
      expect(result.change).toBe(-20000)
      expect(result.changePercent).toBe(-20)
    })

    it('should handle zero start amount', () => {
      const result = calculateNetWorthChange(0, 50000)
      expect(result.change).toBe(50000)
      expect(result.changePercent).toBe(0)
    })
  })

  describe('Investment Performance', () => {
    const mockInvestments: Investment[] = [
      {
        id: '1',
        symbol: 'AAPL',
        name: 'Apple Inc.',
        type: 'stock',
        account: 'taxable',
        shares: 10,
        costBasis: 150,
        currentPrice: 175,
        dateAdded: '2024-01-01'
      },
      {
        id: '2',
        symbol: 'TSLA',
        name: 'Tesla Inc.',
        type: 'stock',
        account: 'taxable',
        shares: 5,
        costBasis: 200,
        currentPrice: 180,
        dateAdded: '2024-01-01'
      }
    ]

    it('should calculate gain for winning investment', () => {
      const result = calculateInvestmentPerformance(mockInvestments)
      const applePerf = result.find(p => p.symbol === 'AAPL')
      expect(applePerf?.gain).toBe(250) // (175-150) * 10
      expect(applePerf?.gainPercent).toBeCloseTo(16.67, 2) // (25/150) * 100
    })

    it('should calculate loss for losing investment', () => {
      const result = calculateInvestmentPerformance(mockInvestments)
      const teslaPerf = result.find(p => p.symbol === 'TSLA')
      expect(teslaPerf?.gain).toBe(-100) // (180-200) * 5
      expect(teslaPerf?.gainPercent).toBe(-10) // (-20/200) * 100
    })

    it('should calculate total investment value', () => {
      const total = calculateTotalInvestmentValue(mockInvestments)
      expect(total).toBe(2650) // (175*10) + (180*5)
    })

    it('should calculate total investment cost', () => {
      const total = calculateTotalInvestmentCost(mockInvestments)
      expect(total).toBe(2500) // (150*10) + (200*5)
    })
  })

  describe('Savings Progress', () => {
    const mockGoals: SavingsGoal[] = [
      {
        id: '1',
        name: 'Emergency Fund',
        type: 'emergency',
        targetAmount: 10000,
        currentAmount: 8000,
        priority: 'high',
        dateCreated: '2024-01-01'
      },
      {
        id: '2',
        name: 'Vacation',
        type: 'vacation',
        targetAmount: 5000,
        currentAmount: 5000,
        priority: 'medium',
        dateCreated: '2024-01-01'
      },
      {
        id: '3',
        name: 'New Car',
        type: 'vehicle',
        targetAmount: 20000,
        currentAmount: 5000,
        priority: 'low',
        dateCreated: '2024-01-01'
      }
    ]

    it('should calculate total saved correctly', () => {
      const result = calculateSavingsProgress(mockGoals)
      expect(result.totalSaved).toBe(18000) // 8000 + 5000 + 5000
    })

    it('should calculate total target correctly', () => {
      const result = calculateSavingsProgress(mockGoals)
      expect(result.totalTarget).toBe(35000) // 10000 + 5000 + 20000
    })

    it('should calculate progress percentage', () => {
      const result = calculateSavingsProgress(mockGoals)
      expect(result.progressPercent).toBeCloseTo(51.43, 2) // (18000/35000) * 100
    })

    it('should count completed goals correctly', () => {
      const result = calculateSavingsProgress(mockGoals)
      expect(result.completedGoals).toBe(1) // Only Vacation is complete
      expect(result.activeGoals).toBe(2)
    })
  })
})

describe('CSV Export Formatting', () => {
  it('should format currency values correctly', () => {
    const value = 1234567.89
    const formatted = `€${value.toLocaleString()}`
    expect(formatted).toBe('€1,234,567.89')
  })

  it('should format percentage values correctly', () => {
    const value = 15.678
    const formatted = `${value.toFixed(2)}%`
    expect(formatted).toBe('15.68%')
  })
})

describe('Edge Cases', () => {
  it('should handle empty investments array', () => {
    const result = calculateTotalInvestmentValue([])
    expect(result).toBe(0)
  })

  it('should handle empty savings goals', () => {
    const result = calculateSavingsProgress([])
    expect(result.totalSaved).toBe(0)
    expect(result.totalTarget).toBe(0)
    expect(result.progressPercent).toBe(0)
  })

  it('should handle zero cost basis', () => {
    const investments: Investment[] = [{
      id: '1',
      symbol: 'TEST',
      name: 'Test Stock',
      type: 'stock',
      account: 'taxable',
      shares: 10,
      costBasis: 0,
      currentPrice: 100,
      dateAdded: '2024-01-01'
    }]
    
    const result = calculateInvestmentPerformance(investments)
    expect(result[0].gainPercent).toBe(0)
  })
})

# Example Plan: Expenses Tracker

> **Note:** This is an example plan file showing the structure and level of detail expected. Use this as a reference when creating your own plan files.

## Overview

The Expenses Tracker allows users to record and categorize their daily expenses, set monthly budgets per category, and visualize spending patterns over time. This feature integrates with the existing Budget Planner to provide comprehensive expense management.

## User Story

As a FinTrack user, I want to track my daily expenses by category so that I can understand my spending habits and stay within my budget limits.

## Technical Requirements

### Data Models

```typescript
// Add to types/financial.ts

export interface Expense {
  id: string
  amount: number
  category: ExpenseCategory
  description: string
  date: string // ISO date string
  paymentMethod: 'cash' | 'card' | 'transfer'
  isRecurring: boolean
  recurringInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  notes?: string
  createdAt: string
  updatedAt: string
}

export type ExpenseCategory = 
  | 'food'
  | 'transportation' 
  | 'housing'
  | 'utilities'
  | 'entertainment'
  | 'healthcare'
  | 'shopping'
  | 'education'
  | 'other'

export interface MonthlyBudget {
  month: string // Format: "2025-02"
  categoryBudgets: Record<ExpenseCategory, number>
  totalBudget: number
}

export interface ExpenseSummary {
  totalSpent: number
  totalBudget: number
  remainingBudget: number
  categoryBreakdown: Record<ExpenseCategory, {
    spent: number
    budget: number
    percentage: number
  }>
}
```

### Context Updates

Add to FinancialContext:
- `expenses: Expense[]`
- `monthlyBudgets: MonthlyBudget[]`
- Actions: `addExpense`, `updateExpense`, `deleteExpense`, `setCategoryBudget`

### Components Needed

1. **ExpensesPage** - Main page component
2. **ExpenseList** - Display list of expenses with filters
3. **ExpenseForm** - Add/edit expense modal
4. **ExpenseCard** - Individual expense display
5. **CategoryBudgetCard** - Show budget vs spent per category
6. **ExpensesChart** - Visual spending breakdown
7. **RecurringExpensesManager** - Handle recurring expense creation

## UI/UX Design

### Layout

```
┌─────────────────────────────────────────────┐
│  ← Back to Toolbox    Expenses             │
├─────────────────────────────────────────────┤
│  Summary Cards (3):                         │
│  [Total Spent] [Budget Remaining] [% Used] │
├─────────────────────────────────────────────┤
│  Charts Section                             │
│  [Pie: By Category] [Bar: Monthly Trend]   │
├─────────────────────────────────────────────┤
│  Budget Overview                            │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│  │ Food    │ │Trans... │ │Housing  │      │
│  │ €450/600│ │ €200/300│ │ €800/900│      │
│  └─────────┘ └─────────┘ └─────────┘      │
├─────────────────────────────────────────────┤
│  Recent Expenses                            │
│  ┌──────────────────────────────────────┐  │
│  │ 🍔  Lunch at Restaurant    €25.50   │  │
│  │ 🚗  Gas Station            €60.00   │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### User Flow

1. **Add Expense**: User clicks "Add Expense" → Modal opens → User enters amount, category, description → Saves
2. **View Expenses**: List shows recent expenses with filters by date/category
3. **Set Budget**: User clicks on category card → Sets monthly budget limit
4. **View Insights**: Charts show spending patterns and budget adherence

### Visual Design

- Use existing color palette (amber for warnings when over budget)
- Progress bars for budget usage (green < 80%, yellow 80-100%, red > 100%)
- Icons from Lucide React (Wallet, ShoppingCart, Car, Home, etc.)
- Responsive grid layout (1 col mobile, 2 col tablet, 3 col desktop)

## Implementation Steps

### Step 1: Update Data Types and Context

**Files to modify:**
- `src/types/financial.ts` - Add Expense, ExpenseCategory, MonthlyBudget types
- `src/contexts/FinancialContext.tsx` - Add expenses state and actions

**Details:**
```typescript
// In FinancialState interface:
expenses: Expense[]
monthlyBudgets: MonthlyBudget[]

// In Action type:
| { type: 'ADD_EXPENSE'; payload: Expense }
| { type: 'UPDATE_EXPENSE'; payload: Expense }
| { type: 'DELETE_EXPENSE'; payload: string }
| { type: 'SET_CATEGORY_BUDGET'; payload: { month: string; category: ExpenseCategory; budget: number } }

// In defaultState:
expenses: [],
monthlyBudgets: []
```

**Expected outcome:** Types and context support expense tracking

### Step 2: Create Expenses Page Structure

**Files to create:**
- `src/pages/Expenses.tsx` - Main page

**Details:**
- Follow existing page structure (Back to Toolbox link, header with icon)
- Use Card component for sections
- Add to App.tsx routes

**Expected outcome:** Page renders with basic layout

### Step 3: Create Summary Cards

**Components to create:**
- Total spent this month
- Budget remaining
- Percentage of budget used

**Details:**
- Calculate from expenses and monthlyBudgets
- Format currency using existing formatters
- Show trends (up/down arrows compared to last month)

**Expected outcome:** Cards display accurate summary data

### Step 4: Create Expense List and Form

**Components:**
- `ExpenseList.tsx` - Display with date grouping
- `ExpenseForm.tsx` - Add/edit modal

**Details:**
- List shows date, description, category, amount
- Filter by date range and category
- Form validates required fields
- Support recurring expense checkbox

**Expected outcome:** Users can add, view, edit, delete expenses

### Step 5: Create Budget Management

**Components:**
- `CategoryBudgetCard.tsx` - Show budget vs spent

**Details:**
- Display all expense categories
- Show progress bar (spent / budget)
- Color-coded: green, yellow, red based on percentage
- Click to set/adjust budget

**Expected outcome:** Users can set and monitor category budgets

### Step 6: Add Charts

**Components:**
- Pie chart: Spending by category
- Bar chart: Monthly spending trend

**Details:**
- Use Recharts (already in project)
- Responsive containers
- Tooltips showing amounts

**Expected outcome:** Visual insights into spending patterns

### Step 7: Add Recurring Expenses

**Logic:**
- When adding expense, check "isRecurring"
- Store recurring interval
- On app load, check if recurring expenses need to be created
- Auto-create expenses for current period

**Expected outcome:** Recurring expenses automatically added

### Step 8: Polish and Testing

**Tasks:**
- Add loading states
- Handle empty states
- Add confirmation dialogs for delete
- Test edge cases (no budget set, overspending, etc.)

**Expected outcome:** Production-ready feature

## Dependencies

### Prerequisites
- [x] Budget Planner (exists, can integrate budget data)
- [x] FinancialContext (for state management)
- [x] Card component (reusable UI)

### Related Features
- Budget Planner - Share budget limits
- Net Worth Dashboard - Could show expenses impact

## Acceptance Criteria

### Must Have
- [ ] Users can add expenses with amount, category, description, date
- [ ] Users can view list of expenses with filters
- [ ] Users can edit and delete expenses
- [ ] Users can set monthly budgets per category
- [ ] Visual indicator when approaching or exceeding budget
- [ ] Expenses persist in localStorage

### Should Have
- [ ] Recurring expenses support
- [ ] Charts showing spending breakdown
- [ ] Monthly spending trends
- [ ] Export expenses to CSV

### Nice to Have
- [ ] Receipt photo attachment
- [ ] Bank import integration
- [ ] Spending predictions based on history
- [ ] Budget rollover to next month

## UI Compliance

This feature must follow FinTrack UI guidelines:

- [ ] **Theme Color**: Pick unique color not used by other tools (avoid: blue, emerald, purple, orange, amber, cyan, pink, rose)
- [ ] **Page Structure**: Use standard container (bg-gray-50, max-w-7xl, mx-auto)
- [ ] **Header**: Include back link with theme-colored hover, page icon, title, subtitle
- [ ] **Summary Cards**: 4-column responsive grid with icon containers (bg-{color}-100, text-{color}-600)
- [ ] **Color Pairs**: Follow 100/600 pattern for consistency
- [ ] **Translation**: All text translatable using t() from useTranslation hook
- [ ] **Responsive**: 1 col mobile, 2 col tablet, 3+ col desktop
- [ ] **Icons**: Lucide React icons (w-6 h-6 cards, w-4 h-4 actions)
- [ ] **Modals**: max-w-2xl standard, max-w-3xl for complex forms
- [ ] **Empty States**: Gray icon (w-16 h-16 text-gray-300), centered layout
- [ ] **Loading**: Loader2 icon with animate-spin
- [ ] **Action Buttons**: Primary (bg-{theme}-600), icon-only (hover:text-{theme}-600), delete (hover:text-red-600)

## Testing Considerations

### Unit Tests
- Expense calculation logic
- Budget percentage calculations
- Category filtering

### Integration Tests
- Add expense flow
- Edit expense flow
- Budget setting flow

### Edge Cases
- [ ] No expenses added yet (empty state)
- [ ] Budget not set for category
- [ ] Overspending (negative remaining budget)
- [ ] Very large expense amounts
- [ ] Date in future
- [ ] Recurring expense creation on month boundary

## Notes

- Consider integration with existing Budget Planner feature
- May need to update translations (DE/EN) for new UI text
- Icon suggestions: Wallet, Receipt, TrendingUp, PieChart
- Color scheme: Use existing app colors, amber for budget warnings

## References

- Similar implementation: `src/pages/Savings.tsx` (goals tracking)
- Recharts examples: `src/pages/Performance.tsx` (charts)
- Form patterns: `src/components/InvestmentForm.tsx`

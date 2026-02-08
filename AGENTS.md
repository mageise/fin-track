# AGENTS.md - FinTrack Coding Guidelines

This document provides guidelines for AI agents and developers working on the FinTrack Finance Tracker application.

## Build, Lint, and Test Commands

```bash
# Development
npm run dev              # Start Vite dev server (http://localhost:5173)

# Build
npm run build           # TypeScript compile + Vite build for production
npm run preview         # Preview production build locally

# Linting
npm run lint            # Run ESLint on all files

# Testing
npm test                # Run all tests with Vitest (watch mode)
npm test -- --run      # Run tests once (CI mode)
npm test -- --reporter=verbose  # Run with detailed output
npm test -- src/tests/App.test.tsx  # Run single test file
npm test -- -t "renders without crashing"  # Run test by name
npm run test:ui         # Run tests with Vitest UI
```

## Code Style Guidelines

### TypeScript

- **Use strict typing**: Enable strict mode, avoid `any` types
- **Type imports**: Use `import type { ... }` for type-only imports
- **Interface naming**: PascalCase for interfaces (e.g., `FinancialState`, `AssetProps`)
- **Type annotations**: Explicit return types for exported functions
- **Optional properties**: Use `?` for optional fields, not `| undefined`

### Imports

Order imports by category with blank lines between:

1. React and framework imports
2. Third-party libraries (recharts, lucide-react)
3. Absolute project imports (contexts, components, types)
4. Relative imports (`../`, `./`)

Example:
```typescript
import { useState, useEffect } from 'react'
import { LineChart, Line } from 'recharts'
import { DollarSign } from 'lucide-react'

import { useFinancial } from '../contexts/FinancialContext'
import { Card } from '../components/Card'
import type { Asset } from '../types/financial'
```

### Naming Conventions

- **Components**: PascalCase (e.g., `Dashboard`, `AssetForm`)
- **Functions**: camelCase (e.g., `calculateNetWorth`, `formatCurrency`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `STORAGE_KEY`, `COLORS`)
- **Types/Interfaces**: PascalCase (e.g., `AssetType`, `FinancialState`)
- **Files**: PascalCase for components, camelCase for utilities
- **Hooks**: Prefix with `use` (e.g., `useFinancial`, `useState`)

### Formatting

- **Indentation**: 2 spaces
- **Semicolons**: Do not use semicolons
- **Quotes**: Single quotes for strings
- **Line length**: ~100 characters soft limit
- **Trailing commas**: Use in multi-line objects/arrays

### React Patterns

- **Functional components**: Use function declarations, not const arrows
- **Props destructuring**: Destructure props in function parameters
- **State management**: Use Context API with useReducer for global state
- **Refs**: Use `useRef` for mutable values that don't trigger re-renders
- **Effects**: Always provide dependency arrays, avoid infinite loops
- **Conditional rendering**: Use ternary operators or early returns

Example:
```typescript
interface CardProps {
  title?: string
  children: ReactNode
}

export function Card({ title, children }: CardProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      {title && <h3>{title}</h3>}
      {children}
    </div>
  )
}
```

### Styling (Tailwind CSS)

- Use Tailwind utility classes exclusively
- Prefer `className` over inline `style` (except for dynamic dimensions)
- Order classes logically: layout → sizing → spacing → colors → effects
- Extract common patterns to component variants
- Use arbitrary values sparingly: `h-[300px]` only when necessary

### Error Handling

- Wrap localStorage operations in try-catch blocks
- Log errors to console for debugging: `console.error('Message:', error)`
- Provide fallback values for failed operations
- Validate data before parsing JSON

Example:
```typescript
try {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    return JSON.parse(stored)
  }
} catch (e) {
  console.error('Failed to load:', e)
}
return defaultState
```

### Testing

- Use Vitest with React Testing Library
- Name test files with `.test.tsx` suffix
- Group related tests with `describe()` blocks
- Use semantic queries: `getByText`, `getByRole` over `getByTestId`
- Test behavior, not implementation details

Example:
```typescript
describe('Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<Component />)
    expect(container).toBeTruthy()
  })
})
```

### File Organization

```
src/
├── components/     # Reusable UI components (Card, Button, Input)
├── contexts/       # React Context providers (FinancialContext)
├── pages/          # Page-level components (Dashboard)
├── types/          # TypeScript type definitions
├── hooks/          # Custom React hooks
├── utils/          # Utility functions
└── tests/          # Test files and setup
```

### Console Logging

- Use `console.log()` for informational messages (loading, saving)
- Use `console.error()` for errors and exceptions
- Remove debug logs before committing production code
- Include descriptive messages with data context

### Performance Considerations

- Use `useMemo` for expensive calculations
- Use `useCallback` for function props passed to children
- Avoid unnecessary re-renders with proper dependency arrays
- Lazy load heavy components with React.lazy() when needed

## Project-Specific Notes

- Financial data is stored in localStorage under `fintrack-data-v2`
- All currency values are stored as numbers (cents/dollars depending on precision needs)
- Charts use Recharts library with ResponsiveContainer
- Icons come from Lucide React library
- FIRE calculation: (netWorth / fireGoal) * 100
- Net worth = totalAssets - totalLiabilities

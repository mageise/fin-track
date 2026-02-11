# Finance Tracker (FinTrack)

A web application to track personal finance, wealth building, and progress toward FIRE (Financial Independence, Retire Early).

## Features

### Net Worth Dashboard
- **Real-time Net Worth Calculation**: Track assets minus liabilities in real-time
- **Interactive Charts**: 
  - Net worth trend over time with line charts
  - Asset allocation pie chart
  - Visual representation of financial progress
- **FIRE Progress Tracking**: Set your financial independence goal and track your progress
- **Asset Management**: Add, edit, and delete assets with categories (cash, investments, real estate, vehicles, etc.)
- **Liability Tracking**: Track mortgages, credit cards, loans, and other debts
- **Persistent Storage**: All data is saved to localStorage for privacy

### Budget Planner
- **Monthly Budget Management**: Create and manage budgets across categories
- **Spending Analysis**: Track expenses against budget limits
- **Category Tracking**: Organize spending by category (food, travel, accommodation, etc.)

### Investment Portfolio
- **Holdings Management**: Track stocks, bonds, ETFs, crypto, and more
- **Watchlist**: Monitor potential investments and promote to holdings
- **Performance Analytics**: Track gains/losses, returns, and top performers

### Savings Goals
- **Goal Tracking**: Set and monitor savings targets
- **Priority Organization**: Organize goals by priority (high, medium, low)
- **Progress Visualization**: See your progress toward each goal

## Tech Stack

- **React 19** - Modern React with hooks
- **TypeScript** - Type-safe code
- **Vite** - Fast development and building
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Interactive charts
- **Lucide React** - Beautiful icons
- **Vitest** - Fast unit testing

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone or navigate to the project
cd fintrack

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Running Tests

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui
```

### Building for Production

```bash
# Build the app
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Main app pages (Dashboard, Budget, Investment, Savings, etc.)
├── contexts/           # React contexts for state
├── types/              # TypeScript definitions
├── hooks/              # Custom React hooks
├── utils/              # Helper functions
├── services/           # API services
├── App.tsx             # Main App component
└── index.css           # Global styles
```

## Usage Guide

### Adding Assets
1. Click "Add Asset" in the Assets section
2. Enter the asset name, type, and current value
3. Optional: Add notes for reference
4. Click "Add Asset" to save

### Adding Liabilities
1. Click "Add Liability" in the Liabilities section
2. Enter the liability name, type, and balance
3. Optional: Add interest rate and notes
4. Click "Add Liability" to save

### Editing Items
- Click the edit icon (pencil) on any asset or liability to modify it
- Click the delete icon (trash) to remove an item

### Tracking FIRE Progress
- Set your FIRE goal amount in the code (currently defaults to $1,000,000)
- The progress card shows what percentage of your goal you've achieved

## Roadmap

See [ROADMAP.md](./ROADMAP.md) for the complete feature roadmap with implementation status.

### Implemented ✓
- Budget planner
- Investment portfolio with holdings, watchlist, and performance analytics
- Savings goals
- FIRE calculator

### Coming Soon
- Reports and exports
- Retirement planning
- Tax calculator
- Risk assessment

## License

MIT

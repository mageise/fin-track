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
│   ├── Card.tsx        # Card container component
│   ├── AssetForm.tsx   # Add/edit asset form
│   └── LiabilityForm.tsx # Add/edit liability form
├── pages/              # Main app pages
│   └── Dashboard.tsx   # Net worth dashboard
├── contexts/           # React contexts for state
│   └── FinancialContext.tsx # Global financial state
├── types/              # TypeScript definitions
│   └── financial.ts    # Financial data types
├── tests/              # Test files
│   ├── setup.ts        # Test configuration
│   └── App.test.tsx    # App component tests
├── hooks/              # Custom React hooks
├── utils/              # Helper functions
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

Future features to add:
- [ ] Budget tracking and management
- [ ] Investment portfolio analysis
- [ ] Savings goals with progress tracking
- [ ] Monthly/annual reports
- [ ] Data export/import (JSON/CSV)
- [ ] Multiple user profiles
- [ ] Dark mode toggle
- [ ] Mobile app with offline support

## Contributing

Feel free to submit issues and pull requests!

## License

MIT

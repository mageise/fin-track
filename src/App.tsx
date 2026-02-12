import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { FinancialProvider } from './contexts/FinancialContext'
import { Toolbox } from './pages/Toolbox'
import { Dashboard } from './pages/Dashboard'
import { FIRECalculator } from './pages/FIRECalculator'
import { InvestmentPortfolio } from './pages/InvestmentPortfolio'
import { Savings } from './pages/Savings'
import { Budget } from './pages/Budget'
import { Settings } from './pages/Settings'
import { Games } from './pages/Games'
import { Performance } from './pages/Performance'
import { Reports } from './pages/Reports'
import { ErrorBoundary } from './components/ErrorBoundary'

export function AppContent() {
  return (
    <ErrorBoundary>
      <FinancialProvider>
        <Routes>
          <Route path="/" element={<Toolbox />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/fire" element={<FIRECalculator />} />
          <Route path="/portfolio" element={<InvestmentPortfolio />} />
          <Route path="/savings" element={<Savings />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/games" element={<Games />} />
          <Route path="/performance" element={<Performance />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </FinancialProvider>
    </ErrorBoundary>
  )
}

function App() {
  return (
    <BrowserRouter basename="/fin-track">
      <AppContent />
    </BrowserRouter>
  )
}

export default App

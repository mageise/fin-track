import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AppContent } from '../App'

describe('App Rendering', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <MemoryRouter>
        <AppContent />
      </MemoryRouter>
    )
    expect(container).toBeTruthy()
  })

  it('displays the toolbox title on root route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppContent />
      </MemoryRouter>
    )
    expect(screen.getByText('Finanz Tracker Toolbox')).toBeInTheDocument()
  })

  it('displays the dashboard title', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AppContent />
      </MemoryRouter>
    )
    expect(screen.getByText('Net Worth Dashboard')).toBeInTheDocument()
  })

  it('displays summary cards', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AppContent />
      </MemoryRouter>
    )
    expect(screen.getByText('Nettovermögen')).toBeInTheDocument()
    expect(screen.getByText('Gesamtvermögen')).toBeInTheDocument()
    expect(screen.getByText('Gesamtverbindlichkeiten')).toBeInTheDocument()
    expect(screen.getByText('FIRE-Fortschritt')).toBeInTheDocument()
  })

  it('displays asset and liability sections', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AppContent />
      </MemoryRouter>
    )
    expect(screen.getByText('Vermögenswerte')).toBeInTheDocument()
    expect(screen.getByText('Verbindlichkeiten')).toBeInTheDocument()
    expect(screen.getByText('Vermögenswert hinzufügen')).toBeInTheDocument()
    expect(screen.getByText('Verbindlichkeit hinzufügen')).toBeInTheDocument()
  })

  it('displays empty state messages', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AppContent />
      </MemoryRouter>
    )
    expect(screen.getByText('Noch kein Verlauf')).toBeInTheDocument()
    expect(screen.getByText('Noch keine Vermögenswertdaten')).toBeInTheDocument()
  })
})

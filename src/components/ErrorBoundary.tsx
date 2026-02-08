import type { ReactNode } from 'react'
import { useState, useEffect } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setHasError(true)
      setError(event.error)
      event.preventDefault()
    }

    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  if (hasError) {
    return (
      <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
        <h1 style={{ color: '#ef4444' }}>Something went wrong</h1>
        <pre style={{ background: '#f3f4f6', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
          {error?.message}
          {error?.stack}
        </pre>
        <button 
          onClick={() => window.location.reload()}
          style={{ 
            marginTop: '10px', 
            padding: '10px 20px', 
            background: '#3b82f6', 
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reload Page
        </button>
      </div>
    )
  }

  return <>{children}</>
}

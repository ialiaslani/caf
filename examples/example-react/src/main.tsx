import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { CAFErrorBoundary } from '@c-a-f/infrastructure-react'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <CAFErrorBoundary
        fallback={(error, _errorInfo, resetError) => (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '2rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Oops! Something went wrong</h2>
            <p style={{ marginBottom: '1rem', opacity: 0.9 }}>{error.message}</p>
            <button
              onClick={resetError}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
            >
              Try again
            </button>
          </div>
        )}
        onError={(error, errorInfo) => {
          // Log to error reporting service
          console.error('Error caught by CAFErrorBoundary:', error, errorInfo);
        }}
      >
        <App />
      </CAFErrorBoundary>
    </BrowserRouter>
  </StrictMode>,
)

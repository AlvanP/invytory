import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@/styles/index.css'
import { AuthProvider } from '@/hooks/useAuth'
import App from './App.tsx'

// After a new release, a tab that was open before it may ask for a page file
// that no longer exists. Reload once to pick up the new version.
window.addEventListener('vite:preloadError', (event) => {
  try {
    if (sessionStorage.getItem('invytory:reloaded') === '1') return
    sessionStorage.setItem('invytory:reloaded', '1')
  } catch {
    // Storage blocked: reload anyway, once per page load is enough.
  }
  event.preventDefault()
  window.location.reload()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
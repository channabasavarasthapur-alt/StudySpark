import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './theme/ThemeProvider.tsx'
import { StudyProvider } from './study/StudyContext.tsx'
import { AuthProvider } from './auth/AuthProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <StudyProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </StudyProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)

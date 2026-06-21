import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './theme/ThemeProvider.tsx'
import { StudyProvider } from './study/StudyContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <StudyProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </StudyProvider>
    </ThemeProvider>
  </StrictMode>,
)

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { ZoneLanguageProvider } from './contexts/ZoneLanguageContext'
import { ThemeProvider } from './contexts/ThemeContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ZoneLanguageProvider>
        <App />
      </ZoneLanguageProvider>
    </ThemeProvider>
  </React.StrictMode>,
)

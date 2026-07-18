import React from 'react'
import ReactDOM from 'react-dom/client'
import './i18n'
import App from './App'
import './index.css'
import './styles/animations.css'
import { ZoneLanguageProvider } from './contexts/ZoneLanguageContext'
import { ThemeProvider } from './contexts/ThemeContext'

// Register PWA Service Worker
import { registerSW } from 'virtual:pwa-register'
registerSW({
  immediate: true,
  onRegisteredSW(swScriptUrl: string) {
    console.log('Service Worker registered:', swScriptUrl)
  },
  onRegisterError(error: Error) {
    console.error('Error registering Service Worker:', error)
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ZoneLanguageProvider>
        <App />
      </ZoneLanguageProvider>
    </ThemeProvider>
  </React.StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import { App } from './App'
import { reportCatalogIssues } from './lib/report-catalog'

if (import.meta.env.DEV) reportCatalogIssues()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { ImportProvider } from './contexts/ImportContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ImportProvider>
        <App />
      </ImportProvider>
    </BrowserRouter>
  </StrictMode>,
)

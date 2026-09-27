import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* basename = `base` de Vite, para poder publicar en una subcarpeta (GitHub Pages) */}
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      {/* reducedMotion="user" respeta la preferencia del sistema operativo */}
      <MotionConfig reducedMotion="user">
        <App />
      </MotionConfig>
    </BrowserRouter>
  </StrictMode>,
)

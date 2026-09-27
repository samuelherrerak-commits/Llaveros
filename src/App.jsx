import { Routes, Route, Navigate } from 'react-router-dom'
import KeychainPage from './pages/KeychainPage.jsx'
import HomePage from './pages/HomePage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {/* midominio.com/id/juan-maria  ← URL grabada en el chip NFC */}
      <Route path="/id/:slug" element={<KeychainPage />} />
      {/* Atajo opcional: midominio.com/juan-maria */}
      <Route path="/:slug" element={<KeychainPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

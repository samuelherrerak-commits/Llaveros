import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// VITE_BASE: ruta donde se publica el sitio estático.
//   "/"            → dominio propio o raíz (Netlify, Vercel, Cloudflare Pages…)
//   "/llaveros/"   → GitHub Pages de proyecto (usuario.github.io/llaveros/)
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react(), tailwindcss()],
})

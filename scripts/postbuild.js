/**
 * Post-build para hosting 100% estático (sin rewrites de servidor).
 *
 * 1. dist/404.html  → copia de index.html. GitHub Pages (y otros) la sirven
 *    ante cualquier ruta desconocida, así /id/<slug> sigue abriendo la app
 *    aunque el slug venga del Google Sheet y no exista como archivo.
 * 2. dist/id/<slug>/index.html → una página real por cada llavero definido
 *    en src/data/keychains.js. Responden 200 en cualquier hosting estático.
 */
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { KEYCHAINS } from '../src/data/keychains.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const indexPath = join(dist, 'index.html')
const html = readFileSync(indexPath, 'utf8')

copyFileSync(indexPath, join(dist, '404.html'))

const escape = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

const slugs = Object.keys(KEYCHAINS)
for (const slug of slugs) {
  const { receiver } = KEYCHAINS[slug]
  const page = html.replace(/<title>.*?<\/title>/, `<title>Para ${escape(receiver)} ♥</title>`)
  const dir = join(dist, 'id', slug)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'index.html'), page)
}

// Evita que GitHub Pages procese el sitio con Jekyll.
writeFileSync(join(dist, '.nojekyll'), '')

console.log(`✓ postbuild: 404.html + ${slugs.length} páginas estáticas en dist/id/`)

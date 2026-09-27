import { lazy } from 'react'

/**
 * Registro de plantillas. template_id (columna del Sheet) → componente.
 * Cada plantilla se carga en su propio chunk: el teléfono solo descarga
 * la que va a mostrar.
 */
const loaders = {
  1: () => import('./MinimalistElegant.jsx'),
  2: () => import('./FloralBloom.jsx'),
  3: () => import('./PolaroidMemory.jsx'),
  4: () => import('./NeonCosmic.jsx'),
  5: () => import('./PlayfulHeart.jsx'),
  6: () => import('./VesperNight.jsx'),
}

export const TEMPLATES = {
  1: { name: 'Minimalist Elegant', theme: '#0b0b0c', Component: lazy(loaders[1]) },
  2: { name: 'Floral Bloom', theme: '#fdf2f4', Component: lazy(loaders[2]) },
  3: { name: 'Polaroid Memory', theme: '#ebe6de', Component: lazy(loaders[3]) },
  4: { name: 'Neon Cosmic', theme: '#05010d', Component: lazy(loaders[4]) },
  5: { name: 'Playful Heart', theme: '#ff3d7f', Component: lazy(loaders[5]) },
  6: { name: 'Vesper Night', theme: '#000000', Component: lazy(loaders[6]) },
}

export function getTemplate(id) {
  return TEMPLATES[id] ?? TEMPLATES[1]
}

/** Descarga el chunk en paralelo al fetch de datos. */
export function preloadTemplate(id) {
  return (loaders[id] ?? loaders[1])()
}

/**
 * Configuración del portal.
 * Los valores por defecto apuntan a la Web App de producción; cualquiera se
 * puede sobreescribir con variables de entorno en el build (.env o CI).
 */
const env = import.meta.env

/** URL /exec de la Web App de Apps Script. */
export const GAS_URL =
  env.VITE_GAS_URL?.trim() ||
  'https://script.google.com/macros/s/AKfycbwAH8xudqE0PKLshLnBI1Hcp0G8u8jv5iHmHY0gP7XaKIsTpyXVbwuA0vbCiuliQ2f2/exec'

/**
 * Token que valida Code.gs (API_TOKEN). Va en la URL como `token=`.
 * Ojo: en un sitio estático este valor es visible en el JS publicado.
 */
export const API_TOKEN = env.VITE_API_TOKEN?.trim() || 'Llaverosv1'

/**
 * De dónde salen los mensajes:
 *   "sheets" (por defecto) → Google Sheets vía Apps Script
 *   "local"                → src/data/keychains.js, sin backend
 */
export const DATA_SOURCE = env.VITE_DATA_SOURCE === 'local' ? 'local' : 'sheets'

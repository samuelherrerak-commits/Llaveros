import { KEYCHAINS } from '../data/keychains.js'
import { API_TOKEN, DATA_SOURCE, GAS_URL } from '../config.js'
const TIMEOUT_MS = 12000
const CACHE_PREFIX = 'llavero:'

export class KeychainError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'KeychainError'
    this.code = code // 'UNAUTHORIZED' | 'NOT_FOUND' | 'MISSING_SLUG' | 'NETWORK' | 'TIMEOUT' | 'INTERNAL_ERROR'
  }
}

/** Promesas en vuelo: evita dobles requests (StrictMode, re-renders). */
const inflight = new Map()

/**
 * Obtiene los datos de un llavero por su slug.
 * Orden: cache de sesión → request en vuelo → fetch a Apps Script (→ JSONP si CORS falla).
 */
export function getKeychain(slug) {
  const key = normalizeSlug(slug)
  if (!key) return Promise.reject(new KeychainError('MISSING_SLUG', 'Falta el slug.'))

  const cached = readCache(key)
  if (cached) return Promise.resolve(cached)

  if (inflight.has(key)) return inflight.get(key)

  const promise = (DATA_SOURCE === 'sheets' ? fetchFromAppsScript(key) : fetchLocal(key))
    .then((data) => {
      const record = normalizeRecord(data)
      writeCache(key, record)
      return record
    })
    .finally(() => inflight.delete(key))

  inflight.set(key, promise)
  return promise
}

/* ------------------------------------------------------------------ */

async function fetchFromAppsScript(slug) {
  const url = new URL(GAS_URL)
  url.searchParams.set('slug', slug)
  // El token va como query param (no header) para no provocar preflight CORS.
  url.searchParams.set('token', API_TOKEN)

  let payload
  try {
    payload = await fetchJson(url)
  } catch (err) {
    if (err instanceof KeychainError && err.code === 'TIMEOUT') throw err
    // Un TypeError aquí suele ser CORS o red. Reintentamos por JSONP,
    // que no depende de headers CORS.
    payload = await jsonp(url)
  }

  if (!payload?.ok) {
    throw new KeychainError(payload?.error || 'INTERNAL_ERROR', payload?.message || 'Error desconocido.')
  }
  return payload.data
}

/**
 * GET "simple" según la especificación CORS: sin headers personalizados
 * ni Content-Type, así el navegador no envía un preflight OPTIONS
 * (Apps Script no puede responderlo). fetch sigue el 302 de Google
 * automáticamente y la respuesta final trae Access-Control-Allow-Origin: *.
 */
async function fetchJson(url) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(url, { method: 'GET', redirect: 'follow', signal: controller.signal })
    if (!res.ok) throw new KeychainError('NETWORK', `HTTP ${res.status}`)
    return await res.json()
  } catch (err) {
    if (err.name === 'AbortError') throw new KeychainError('TIMEOUT', 'La conexión tardó demasiado.')
    throw err
  } finally {
    clearTimeout(timer)
  }
}

function jsonp(url) {
  return new Promise((resolve, reject) => {
    const cb = `__llavero_cb_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
    const src = new URL(url)
    src.searchParams.set('callback', cb)

    const script = document.createElement('script')
    const cleanup = () => {
      clearTimeout(timer)
      delete window[cb]
      script.remove()
    }
    const timer = setTimeout(() => {
      cleanup()
      reject(new KeychainError('TIMEOUT', 'La conexión tardó demasiado.'))
    }, TIMEOUT_MS)

    window[cb] = (data) => {
      cleanup()
      resolve(data)
    }
    script.onerror = () => {
      cleanup()
      reject(new KeychainError('NETWORK', 'No se pudo conectar con el servidor.'))
    }
    script.src = src.toString()
    document.head.appendChild(script)
  })
}

/** Modo estático: datos empaquetados en el build (src/data/keychains.js). */
async function fetchLocal(slug) {
  // En desarrollo simulamos latencia para poder ver la pantalla de carga.
  if (import.meta.env.DEV) await new Promise((r) => setTimeout(r, 600))
  const data = KEYCHAINS[slug]
  if (!data) throw new KeychainError('NOT_FOUND', 'No existe un llavero con ese slug.')
  return { slug, ...data }
}

/* ------------------------------------------------------------------ */

function normalizeSlug(slug) {
  return String(slug ?? '').trim().toLowerCase()
}

function normalizeRecord(raw = {}) {
  let extra = raw.extra_data ?? {}
  if (typeof extra === 'string') {
    try {
      extra = extra ? JSON.parse(extra) : {}
    } catch {
      extra = /^https?:\/\//i.test(extra) ? { photo: extra } : {}
    }
  }

  const templateId = Number.parseInt(raw.template_id, 10)
  return {
    slug: raw.slug ?? '',
    templateId: templateId >= 1 && templateId <= 6 ? templateId : 1,
    sender: String(raw.sender ?? '').trim(),
    receiver: String(raw.receiver ?? '').trim(),
    message: String(raw.message ?? '').trim(),
    extra: extra && typeof extra === 'object' ? extra : {},
  }
}

function readCache(key) {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeCache(key, value) {
  try {
    sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify(value))
  } catch {
    /* modo privado / cuota llena: ignorar */
  }
}

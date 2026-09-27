import { Suspense, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useKeychain } from '../hooks/useKeychain.js'
import { getTemplate, preloadTemplate } from '../templates/index.js'
import LoadingScreen from '../components/LoadingScreen.jsx'
import ErrorScreen from '../components/ErrorScreen.jsx'
import { ease } from '../lib/motion.js'

/**
 * Página que abre el NFC: /id/:slug
 * 1. Lee el slug de la URL.
 * 2. Pide los datos a Apps Script (useKeychain → services/api.js).
 * 3. Renderiza la plantilla indicada en template_id.
 */
export default function KeychainPage() {
  const { slug } = useParams()
  const { status, data, error } = useKeychain(slug)

  const template = data ? getTemplate(data.templateId) : null

  useEffect(() => {
    if (data) preloadTemplate(data.templateId)
  }, [data])

  useThemeColor(template?.theme ?? '#0a0a0a')

  useEffect(() => {
    if (data?.receiver) document.title = `Para ${data.receiver} ♥`
  }, [data])

  return (
    <AnimatePresence mode="wait">
      {status === 'loading' && <LoadingScreen key="loading" />}

      {status === 'error' && <ErrorScreen key="error" error={error} />}

      {status === 'success' && template && (
        <motion.div
          key={`tpl-${data.slug}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.5, ease: ease.outExpo } }}
          exit={{ opacity: 0 }}
        >
          <Suspense fallback={<LoadingScreen />}>
            <template.Component data={data} />
          </Suspense>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Sincroniza la barra de estado del navegador móvil con la plantilla. */
function useThemeColor(color) {
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]')
    if (!meta) return
    const prev = meta.getAttribute('content')
    meta.setAttribute('content', color)
    document.body.style.backgroundColor = color
    return () => {
      meta.setAttribute('content', prev)
    }
  }, [color])
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { spring } from '../lib/motion.js'
import './vesper-night.css'

/**
 * Template 6 — Vesper Night
 * Adaptación de la landing "Vesper.ai" (motionsites.ai): negro puro, video de
 * fondo al 100%, pills de metal líquido, botones liquid-glass y entrada
 * escalonada. En vez de vender un producto, cuenta un mensaje de amor.
 *
 * extra_data opcional:
 *   video  → URL mp4 de fondo (por defecto el clip nocturno de Vesper)
 *   since  → fecha "YYYY-MM-DD" para mostrar "N días juntos"
 *   title  → reemplaza la segunda línea del titular ("todo mi amor.")
 *   stat1 / stat2 → reemplazan los textos de las dos primeras estadísticas
 */

const DEFAULT_VIDEO =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260818_072341_50851634-bbc3-4c33-9acc-7647d4db44aa.mp4'

const EASE = [0.16, 1, 0.3, 1]
const HEART = 'M12 21s-8.5-5.1-8.5-11.2A4.8 4.8 0 0 1 12 6.9a4.8 4.8 0 0 1 8.5 2.9C20.5 15.9 12 21 12 21z'

/* ------------------------------------------------------------------ */
/*  Entrada escalonada (tabla del diseño original)                     */
/* ------------------------------------------------------------------ */

const FROM = {
  scale: { opacity: 0, scale: 0.84 },
  soft: { opacity: 0, y: 14 },
  mask: { opacity: 0, y: '40%' },
  pop: { opacity: 0, scale: 0.9 },
  btn: { opacity: 0, y: 18, scale: 0.94 },
  side: { opacity: 0, x: 22 },
  stat: { opacity: 0, y: 20 },
}

/** Props de framer para un elemento con entrada `kind` y retardo `d` (s). */
function appear(kind, d, duration = 1.05) {
  const to = { opacity: 1, x: 0, y: 0, scale: 1 }
  let transition = { duration, ease: EASE, delay: d }

  // Las piezas "físicas" (botones, logo, badge) aterrizan con resorte.
  if (kind === 'scale' || kind === 'btn') {
    transition = { ...spring.soft, delay: d, opacity: { duration: 0.6, ease: EASE, delay: d } }
  }
  if (kind === 'pop') {
    return {
      initial: FROM.pop,
      animate: { opacity: [0, 1, 1], scale: [0.9, 1.03, 1] },
      transition: { duration, ease: EASE, delay: d, times: [0, 0.7, 1] },
    }
  }
  return { initial: FROM[kind], animate: to, transition }
}

/* ------------------------------------------------------------------ */

export default function VesperNight({ data }) {
  const { receiver } = data
  const [run, setRun] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const videoRef = useRef(null)
  const isDesktop = useMediaQuery('(min-width: 901px)')
  const { hearts, burst, removeHeart } = useHearts()
  const kisses = useRef(0)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(0)

  const showToast = useCallback((text) => {
    clearTimeout(toastTimer.current)
    setToast({ id: Date.now(), text })
    toastTimer.current = setTimeout(() => setToast(null), 1800)
  }, [])

  const sendKiss = useCallback(() => {
    burst(9)
    navigator.vibrate?.([12, 30, 12])
    const n = ++kisses.current
    showToast(`💋 ${n} ${n === 1 ? 'beso' : 'besos'} para ${receiver}`)
  }, [burst, receiver, showToast])

  const loveYou = useCallback(() => {
    burst(18)
    navigator.vibrate?.([20, 40, 60])
    showToast('Te amo ♥')
  }, [burst, showToast])

  const replay = useCallback(() => {
    setMenuOpen(false)
    setRun((r) => r + 1)
  }, [])

  const share = useCallback(async () => {
    setMenuOpen(false)
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: `Para ${receiver} ♥`, url })
      } else {
        await navigator.clipboard.writeText(url)
        showToast('Enlace copiado')
      }
    } catch {
      /* el usuario canceló */
    }
  }, [receiver, showToast])

  // Menú: Escape, pasar a escritorio y bloqueo de scroll.
  useEffect(() => {
    if (isDesktop) setMenuOpen(false)
  }, [isDesktop])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  useEffect(() => () => clearTimeout(toastTimer.current), [])

  // Algunos navegadores ignoran autoPlay: lo pedimos explícitamente y, si lo
  // rechazan, reintentamos con el primer toque del usuario.
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const tryPlay = () => video.play?.().catch(() => {})
    tryPlay()
    window.addEventListener('pointerdown', tryPlay, { once: true })
    return () => window.removeEventListener('pointerdown', tryPlay)
  }, [])

  const actions = { sendKiss, loveYou, replay, share, closeMenu: () => setMenuOpen(false) }

  return (
    <div className={`vn${menuOpen ? ' menu-open' : ''}`} style={{ background: '#000', color: '#fff' }}>
      <div className="vn-grain" aria-hidden />

      {/* Respaldo: noche animada debajo del video. Se ve si el video tarda,
          falla o el navegador bloquea el autoplay (p. ej. iOS en Ahorro de batería). */}
      <NightFallback />

      {/* Video de fondo: 100% opacidad, sin overlay. Tapa el respaldo en cuanto reproduce. */}
      <motion.video
        ref={videoRef}
        className="vn-video"
        src={data.extra.video || DEFAULT_VIDEO}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden
        onPlaying={() => setVideoReady(true)}
        onError={() => setVideoReady(false)}
        initial={{ opacity: 0, scale: 1.06 }}
        animate={videoReady ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.06 }}
        transition={{ duration: 1.6, ease: EASE }}
      />

      <Scene
        key={run}
        data={data}
        isDesktop={isDesktop}
        menuOpen={menuOpen}
        onToggleMenu={() => setMenuOpen((o) => !o)}
        actions={actions}
      />

      <Hearts hearts={hearts} onDone={removeHeart} />

      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            className="vn-toast"
            role="status"
            initial={{ opacity: 0, y: -12, x: '-50%', scale: 0.92, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, x: '-50%', scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, x: '-50%', scale: 0.96, filter: 'blur(4px)' }}
            transition={spring.snappy}
          >
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ------------------------------------------------------------------ */

function Scene({ data, isDesktop, menuOpen, onToggleMenu, actions }) {
  const { sender, receiver, message, extra } = data
  const nav = [
    { label: 'Nuestro mensaje', short: 'Mensaje', onClick: actions.closeMenu, d: 0.16, kind: 'scale' },
    { label: 'Mandar un beso', short: 'Un beso', onClick: actions.sendKiss, d: 0.28, kind: 'soft', heart: true },
    { label: 'Ver de nuevo', short: 'Repetir', onClick: actions.replay, d: 0.4, kind: 'scale' },
    { label: 'Compartir', short: 'Compartir', onClick: actions.share, d: 0.52, kind: 'soft' },
  ]

  return (
    <div className="vn-page">
      <AnimatePresence>
        {!isDesktop && menuOpen && (
          <motion.div
            key="backdrop"
            className="vn-menu-backdrop"
            onClick={actions.closeMenu}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
          />
        )}
      </AnimatePresence>

      <header className="vn-header">
        <motion.a href="#top" className="vn-logo" aria-label={`Para ${receiver}`} {...appear('scale', 0.08)}>
          <LogoMark />
          <span className="vn-logo-text">
            {receiver}
            <span className="vn-logo-suffix">.amor</span>
          </span>
        </motion.a>

        <AnimatePresence>
          {(isDesktop || menuOpen) && (
            <motion.nav
              key="nav"
              className="vn-nav"
              id="vn-nav"
              aria-label="Opciones"
              exit={{ opacity: 0, transition: { duration: 0.18 } }}
            >
              {nav.map((item, i) => (
                <motion.button
                  key={item.label}
                  type="button"
                  className="vn-pill"
                  onClick={() => {
                    item.onClick()
                    if (!isDesktop) actions.closeMenu()
                  }}
                  {...(isDesktop
                    ? appear(item.kind, item.d)
                    : {
                        initial: { opacity: 0, y: 18, scale: 0.96 },
                        animate: { opacity: 1, y: 0, scale: 1 },
                        exit: { opacity: 0, y: 10, transition: { duration: 0.15 } },
                        transition: { ...spring.smooth, delay: 0.04 + i * 0.05 },
                      })}
                  whileTap={{ scale: 0.96 }}
                >
                  {item.heart && (
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d={HEART} />
                    </svg>
                  )}
                  {isDesktop ? item.short : item.label}
                </motion.button>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          className="vn-btn vn-btn-solid vn-header-cta"
          onClick={actions.loveYou}
          whileTap={{ scale: 0.94 }}
          {...appear('scale', 0.34)}
        >
          <HeartIcon />
          Te amo
        </motion.button>

        {!isDesktop && (
          <motion.button
            type="button"
            className="vn-burger"
            aria-controls="vn-nav"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            onClick={onToggleMenu}
            whileTap={{ scale: 0.92 }}
            {...appear('scale', 0.34)}
          >
            <span />
            <span />
            <span />
          </motion.button>
        )}
      </header>

      <main className="vn-hero" id="top">
        <div className="vn-hero-copy">
          <motion.div className="vn-badge" {...appear('pop', 0.22)}>
            <motion.svg
              viewBox="0 0 24 24"
              fill="#fff"
              aria-hidden
              initial={{ scale: 0.2, rotate: -50 }}
              animate={{ scale: [0.2, 1.2, 1], rotate: [-50, 8, 0] }}
              transition={{ duration: 0.9, delay: 0.28, ease: EASE, times: [0, 0.65, 1] }}
            >
              <path d="M12 2.6C12.55 2.6 12.88 3.15 13.08 4.7c.62 4.7 1.52 5.6 6.22 6.22 1.55.2 2.1.53 2.1 1.08s-.55.88-2.1 1.08c-4.7.62-5.6 1.52-6.22 6.22-.2 1.55-.53 2.1-1.08 2.1s-.88-.55-1.08-2.1c-.62-4.7-1.52-5.6-6.22-6.22C3.15 12.88 2.6 12.55 2.6 12s.55-.88 2.1-1.08c4.7-.62 5.6-1.52 6.22-6.22C11.12 3.15 11.45 2.6 12 2.6Z" />
            </motion.svg>
            Un mensaje de {sender}
          </motion.div>

          <h1 className="vn-h1" aria-label={`Para ${receiver}, con ${extra.title || 'todo mi amor.'}`}>
            <span className="vn-line" aria-hidden>
              <motion.span {...appear('mask', 0.42)}>
                Para{' '}
                <motion.em
                  initial={{ opacity: 0.35, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  transition={{ duration: 1.2, delay: 0.72, ease: EASE }}
                >
                  {receiver}
                </motion.em>
                , con
              </motion.span>
            </span>
            <span className="vn-line" aria-hidden>
              <motion.span {...appear('mask', 0.62)}>{extra.title || 'todo mi amor.'}</motion.span>
            </span>
          </h1>

          <motion.p className="vn-lede" {...appear('soft', 0.82, 1.25)}>
            {message}
          </motion.p>

          <div className="vn-actions">
            <motion.button
              type="button"
              className="vn-btn vn-btn-solid"
              onClick={actions.sendKiss}
              whileTap={{ scale: 0.95 }}
              {...appear('btn', 0.96)}
            >
              <HeartIcon />
              Mandar un beso
            </motion.button>
            <motion.button
              type="button"
              className="vn-btn vn-btn-ghost"
              onClick={actions.replay}
              whileTap={{ scale: 0.95 }}
              {...appear('side', 1.1)}
            >
              Ver de nuevo
            </motion.button>
          </div>
        </div>
      </main>

      <footer className="vn-stats">
        <motion.div className="vn-stat" {...appear('stat', 1.12)}>
          <DualPillIcon />
          {firstStat(extra)}
        </motion.div>
        <motion.div className="vn-stat" {...appear('stat', 1.28)}>
          <HeartTileIcon />
          {extra.stat2 || 'Hecho solo para ti, de corazón'}
        </motion.div>
        <motion.div className="vn-stat" {...appear('stat', 1.44)}>
          <CoupleIcon a={sender} b={receiver} />
          {sender} &amp; {receiver}
        </motion.div>
      </footer>
    </div>
  )
}

function firstStat(extra) {
  if (extra.stat1) return extra.stat1
  const since = extra.since ? new Date(`${extra.since}T00:00:00`) : null
  if (since && !Number.isNaN(since.getTime())) {
    const days = Math.max(0, Math.floor((Date.now() - since.getTime()) / 86_400_000))
    return `${days.toLocaleString('es')} ${days === 1 ? 'día' : 'días'} juntos`
  }
  return 'Dos corazones, un mismo camino'
}

/* ------------------------------------------------------------------ */
/*  Fondo de respaldo                                                  */
/* ------------------------------------------------------------------ */

const STARS = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: (i * 37.3) % 100,
  top: (i * 53.7) % 62,
  size: i % 5 === 0 ? 2 : 1,
  delay: (i % 7) * 0.6,
}))

function NightFallback() {
  return (
    <div className="vn-fallback" aria-hidden>
      <motion.div
        className="vn-fallback-glow vn-fallback-glow--rose"
        animate={{ x: ['-8%', '6%', '-8%'], scale: [1, 1.12, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="vn-fallback-glow vn-fallback-glow--violet"
        animate={{ x: ['6%', '-6%', '6%'], scale: [1.1, 1, 1.1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      {STARS.map((s) => (
        <motion.span
          key={s.id}
          className="vn-star"
          style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size }}
          animate={{ opacity: [0.15, 0.9, 0.15] }}
          transition={{ duration: 3.2, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Corazones flotantes                                                */
/* ------------------------------------------------------------------ */

function useHearts() {
  const [hearts, setHearts] = useState([])
  const seq = useRef(0)

  const burst = useCallback((count) => {
    const batch = Array.from({ length: count }, () => ({
      id: ++seq.current,
      left: 8 + Math.random() * 84,
      size: 16 + Math.random() * 22,
      rise: 55 + Math.random() * 45, // vh
      drift: (Math.random() - 0.5) * 80,
      spin: (Math.random() - 0.5) * 50,
      delay: Math.random() * 0.35,
      duration: 2.2 + Math.random() * 1.4,
    }))
    setHearts((h) => [...h, ...batch].slice(-60))
  }, [])

  const removeHeart = useCallback((id) => setHearts((h) => h.filter((x) => x.id !== id)), [])

  return { hearts, burst, removeHeart }
}

function Hearts({ hearts, onDone }) {
  return (
    <div className="vn-hearts" aria-hidden>
      {hearts.map((h) => (
        <motion.svg
          key={h.id}
          viewBox="0 0 24 24"
          fill="currentColor"
          className="vn-heart"
          style={{ left: `${h.left}%`, width: h.size, height: h.size }}
          initial={{ y: 0, x: 0, scale: 0, opacity: 0, rotate: 0 }}
          animate={{
            y: `-${h.rise}vh`,
            x: [0, h.drift * 0.6, h.drift],
            scale: [0, 1.25, 1],
            opacity: [0, 1, 1, 0],
            rotate: h.spin,
          }}
          transition={{
            duration: h.duration,
            delay: h.delay,
            ease: EASE,
            scale: { ...spring.bouncy, delay: h.delay },
            opacity: { duration: h.duration, delay: h.delay, times: [0, 0.1, 0.7, 1] },
          }}
          onAnimationComplete={() => onDone(h.id)}
        >
          <path d={HEART} />
        </motion.svg>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Iconos                                                             */
/* ------------------------------------------------------------------ */

/** Marca de Vesper con un latido suave. */
function LogoMark() {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      animate={{ scale: [1, 1.12, 1, 1.07, 1] }}
      transition={{ duration: 1.3, repeat: Infinity, repeatDelay: 1.6, delay: 1.8, times: [0, 0.14, 0.28, 0.42, 1] }}
    >
      <g transform="rotate(-30 12 12)">
        <circle cx="7.3" cy="3.2" r="1.45" />
        <rect x="5.5" y="4.7" width="3.6" height="14.6" rx="1.8" />
        <rect x="14.9" y="4.7" width="3.6" height="14.6" rx="1.8" />
        <circle cx="16.7" cy="20.8" r="1.45" fill="#ff5c8a" />
      </g>
    </motion.svg>
  )
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d={HEART} />
    </svg>
  )
}

function DualPillIcon() {
  return (
    <svg className="vn-stat-icon" viewBox="0 0 24 24" aria-hidden>
      <defs>
        <linearGradient id="vn-pill-a" x1="3" y1="2" x2="14" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.38" />
          <stop offset="1" stopColor="#3a3a3a" stopOpacity="0.62" />
        </linearGradient>
        <linearGradient id="vn-pill-b" x1="3" y1="2" x2="14" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3a3a3a" stopOpacity="0.38" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.62" />
        </linearGradient>
      </defs>
      <rect x="3.4" y="2.6" width="7.2" height="18.8" rx="3.6" fill="url(#vn-pill-a)" />
      <rect x="13.4" y="2.6" width="7.2" height="18.8" rx="3.6" fill="url(#vn-pill-b)" />
      <rect x="9.2" y="10.9" width="5.6" height="2.2" rx="1.1" fill="#ff5c8a" />
    </svg>
  )
}

/** El "download tile" original, ahora con un corazón. */
function HeartTileIcon() {
  return (
    <svg className="vn-stat-icon" viewBox="0 0 24 24" aria-hidden>
      <rect x="2.4" y="2.4" width="19.2" height="19.2" rx="6.2" fill="#ffffff" />
      <path d="M12 16.6s-4.4-2.6-4.4-5.8a2.5 2.5 0 0 1 4.4-1.5 2.5 2.5 0 0 1 4.4 1.5c0 3.2-4.4 5.8-4.4 5.8z" fill="#e8335f" />
    </svg>
  )
}

/** Tres avatares → emisor, un corazón y receptor. */
function CoupleIcon({ a, b }) {
  const initial = (s) => (s?.trim()?.[0] || '·').toUpperCase()
  return (
    <svg className="vn-stat-icon-wide" viewBox="0 0 40 22" aria-hidden>
      <circle cx="10.2" cy="11" r="9.2" fill="#2b2b2b" stroke="#000" strokeWidth="1" />
      <text x="8.2" y="15" fill="#f4f4f4" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="11.5" textAnchor="middle">
        {initial(a)}
      </text>
      <circle cx="20.2" cy="11" r="7.4" fill="#ff5c8a" stroke="#000" strokeWidth="1" />
      <path d="M20.2 14.6s-3.3-2-3.3-4.4a1.9 1.9 0 0 1 3.3-1.2 1.9 1.9 0 0 1 3.3 1.2c0 2.4-3.3 4.4-3.3 4.4z" fill="#fff" />
      <circle cx="30.2" cy="11" r="9.2" fill="#ffffff" stroke="#000" strokeWidth="1" />
      <text x="30.8" y="15" fill="#111" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="11.5" textAnchor="middle">
        {initial(b)}
      </text>
    </svg>
  )
}

/* ------------------------------------------------------------------ */

function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches)
  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])
  return matches
}

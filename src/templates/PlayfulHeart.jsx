import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTime,
  useTransform,
} from 'framer-motion'
import ReplayButton from '../components/ReplayButton.jsx'
import { spring } from '../lib/motion.js'

const HOLD_MS = 1500
const HEART_PATH = 'M12 21s-8.5-5.1-8.5-11.2A4.8 4.8 0 0 1 12 6.9a4.8 4.8 0 0 1 8.5 2.9C20.5 15.9 12 21 12 21z'

/**
 * Template 5 — Playful Heart
 * Colores vibrantes e interacciones elásticas. Hay que mantener presionado
 * el corazón; al cargarse por completo "explota" y el mensaje salta a pantalla.
 */
export default function PlayfulHeart({ data }) {
  const [exploded, setExploded] = useState(false)
  const [run, setRun] = useState(0)

  return (
    <main className="screen-dvh safe-px safe-pt safe-pb no-select relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#ff3d7f] via-[#ff5a6e] to-[#ff9a3d] text-white">
      <Blobs />

      <AnimatePresence mode="wait">
        {!exploded ? (
          <HeartCharger
            key={`charger-${run}`}
            receiver={data.receiver}
            onExplode={() => setExploded(true)}
          />
        ) : (
          <Reveal
            key={`reveal-${run}`}
            data={data}
            onReplay={() => {
              setExploded(false)
              setRun((n) => n + 1)
            }}
          />
        )}
      </AnimatePresence>
    </main>
  )
}

/* ------------------------------------------------------------------ */

function HeartCharger({ receiver, onExplode }) {
  const progress = useMotionValue(0)
  const controls = useRef(null)
  const [label, setLabel] = useState(0)
  const [charging, setCharging] = useState(false)

  // Temblor proporcional a la carga.
  const time = useTime()
  const shakeX = useTransform([time, progress], ([t, p]) => Math.sin(t / 22) * p * p * 6)
  const shakeR = useTransform([time, progress], ([t, p]) => Math.cos(t / 30) * p * p * 5)
  const scale = useTransform(progress, [0, 1], [1, 1.4])
  const glow = useTransform(progress, [0, 1], [0.25, 0.9])
  const glowScale = useTransform(progress, [0, 1], [0.9, 1.9])
  const ringOpacity = useTransform(progress, [0, 0.02], [0, 1])

  useMotionValueEvent(progress, 'change', (p) => {
    const step = p > 0.7 ? 3 : p > 0.35 ? 2 : p > 0.02 ? 1 : 0
    setLabel((prev) => (prev === step ? prev : step))
  })

  // La carga se maneja con requestAnimationFrame: progreso lineal y exacto
  // mientras el dedo esté abajo, sin depender del motor de animación.
  const frame = useRef(0)
  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  const start = (e) => {
    e?.currentTarget?.setPointerCapture?.(e.pointerId)
    controls.current?.stop()
    cancelAnimationFrame(frame.current)
    setCharging(true)
    navigator.vibrate?.(10)

    const t0 = performance.now() - progress.get() * HOLD_MS
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / HOLD_MS)
      progress.set(p)
      if (p < 1) {
        frame.current = requestAnimationFrame(tick)
      } else {
        navigator.vibrate?.([30, 40, 70])
        onExplode()
      }
    }
    frame.current = requestAnimationFrame(tick)
  }

  const release = () => {
    if (progress.get() >= 1) return
    cancelAnimationFrame(frame.current)
    setCharging(false)
    // Regresa como una liga elástica.
    controls.current = animate(progress, 0, spring.bouncy)
  }

  const labels = [`Para ${receiver}`, 'Así, no sueltes…', '¡Un poquito más!', '¡Ya casi explota!']

  return (
    <motion.div
      className="relative flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.8, filter: 'blur(12px)', transition: { duration: 0.25 } }}
      transition={spring.bouncy}
    >
      <div className="h-8 overflow-hidden text-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.p
            key={label}
            className="font-round text-xl font-semibold"
            initial={{ y: 28, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -28, opacity: 0, scale: 0.8 }}
            transition={spring.bouncy}
          >
            {labels[label]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="relative my-10 grid size-64 place-items-center">
        {/* Halo */}
        <motion.div
          aria-hidden
          className="absolute size-44 rounded-full bg-white blur-3xl"
          style={{ opacity: glow, scale: glowScale }}
        />

        {/* Anillo de progreso */}
        <svg aria-hidden viewBox="0 0 100 100" className="absolute size-full -rotate-90">
          <circle cx="50" cy="50" r="46" fill="none" stroke="white" strokeOpacity="0.18" strokeWidth="2.5" />
          <motion.circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            style={{ pathLength: progress, opacity: ringOpacity }}
          />
        </svg>

        {/* Latido en reposo */}
        <motion.div
          animate={charging ? { scale: 1 } : { scale: [1, 1.08, 1, 1.05, 1] }}
          transition={charging ? spring.snappy : { duration: 1.3, repeat: Infinity, repeatDelay: 0.4, times: [0, 0.14, 0.28, 0.42, 1] }}
        >
          <motion.button
            type="button"
            aria-label="Mantén presionado para abrir tu mensaje"
            className="relative grid size-40 touch-none place-items-center rounded-full outline-none focus-visible:ring-4 focus-visible:ring-white/60"
            style={{ scale, x: shakeX, rotate: shakeR }}
            onPointerDown={start}
            onPointerUp={release}
            onPointerCancel={release}
            onContextMenu={(e) => e.preventDefault()}
            onKeyDown={(e) => {
              if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
                e.preventDefault()
                start()
              }
            }}
            onKeyUp={(e) => (e.key === ' ' || e.key === 'Enter') && release()}
          >
            <svg viewBox="0 0 24 24" className="size-full drop-shadow-[0_18px_30px_rgba(160,0,60,0.45)]">
              <defs>
                <linearGradient id="heart-fill" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#ffe1ea" />
                </linearGradient>
              </defs>
              <path d={HEART_PATH} fill="url(#heart-fill)" />
              <path d="M7.2 9.3a2.4 2.4 0 0 1 2.3-1.9" stroke="#ff3d7f" strokeOpacity=".35" strokeWidth="1.2" strokeLinecap="round" fill="none" />
            </svg>
          </motion.button>
        </motion.div>
      </div>

      <motion.p
        className="font-round text-sm font-medium tracking-wide text-white/80"
        animate={{ opacity: charging ? 0 : [0.6, 1, 0.6] }}
        transition={charging ? { duration: 0.2 } : { duration: 2, repeat: Infinity }}
      >
        Mantén presionado el corazón
      </motion.p>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */

function Reveal({ data, onReplay }) {
  const { sender, receiver, message } = data
  const words = message.split(/\s+/).filter(Boolean)

  return (
    <motion.div className="relative flex w-full max-w-sm flex-col items-center">
      <Burst />

      {/* Onda expansiva */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -ml-20 -mt-20 size-40 rounded-full border-[6px] border-white"
        initial={{ scale: 0.2, opacity: 1 }}
        animate={{ scale: 5, opacity: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      />

      <motion.article
        className="relative w-full rounded-[2.25rem] border border-white/40 bg-white/20 px-7 pb-8 pt-10 text-center shadow-[0_30px_80px_-20px_rgba(150,0,50,0.5)] backdrop-blur-xl"
        initial={{ scale: 0.2, rotate: -12, opacity: 0, y: 40 }}
        animate={{ scale: 1, rotate: 0, opacity: 1, y: 0 }}
        transition={{ ...spring.bouncy, delay: 0.12, opacity: { duration: 0.15, delay: 0.12 } }}
      >
        <motion.h1
          className="font-round text-[clamp(2.4rem,12vw,3.25rem)] leading-none font-bold"
          initial={{ scale: 0, rotate: 8 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ ...spring.bouncy, delay: 0.3 }}
        >
          ¡{receiver}!
        </motion.h1>

        <p className="mt-6 font-round text-[1.45rem] leading-snug font-semibold" aria-label={message}>
          {words.map((w, i) => (
            <motion.span
              key={i}
              aria-hidden
              className="inline-block"
              initial={{ scale: 0, y: 20, rotate: (i % 2 ? 1 : -1) * 14 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              transition={{ ...spring.bouncy, delay: 0.5 + i * 0.06 }}
            >
              {w}
              {i < words.length - 1 && ' '}
            </motion.span>
          ))}
        </p>

        <motion.div
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-round text-sm font-semibold text-[#ff3d7f]"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ ...spring.bouncy, delay: 0.7 + words.length * 0.06 }}
        >
          <svg viewBox="0 0 24 24" className="size-4 fill-current">
            <path d={HEART_PATH} />
          </svg>
          con amor, {sender}
        </motion.div>
      </motion.article>

      <ReplayButton
        onClick={onReplay}
        delay={1 + words.length * 0.06}
        className="mt-8 border border-white/40 bg-white/20 text-white"
      />
    </motion.div>
  )
}

/** Partículas que salen disparadas con física de resorte y caen con "gravedad". */
function Burst({ count = 30 }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4
        const dist = 120 + Math.random() * 170
        return {
          id: i,
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          size: 14 + Math.random() * 22,
          rotate: (Math.random() - 0.5) * 120,
          heart: i % 3 !== 0,
          color: ['#ffffff', '#ffe066', '#ffd1dc', '#ff2d6f'][i % 4],
          fall: 90 + Math.random() * 140,
        }
      }),
    [count],
  )

  return (
    <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 z-20">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{ width: p.size, height: p.size, marginLeft: -p.size / 2, marginTop: -p.size / 2 }}
          initial={{ x: 0, y: 0, scale: 0, rotate: 0, opacity: 1 }}
          animate={{ x: p.x, y: [0, p.y, p.y + p.fall], scale: [0, 1.2, 0.6], rotate: p.rotate, opacity: [1, 1, 0] }}
          transition={{
            x: { type: 'spring', stiffness: 140, damping: 11 },
            rotate: { type: 'spring', stiffness: 80, damping: 8 },
            y: { duration: 1.9, times: [0, 0.3, 1], ease: ['easeOut', 'easeIn'] },
            scale: { duration: 1.9, times: [0, 0.2, 1] },
            opacity: { duration: 1.9, times: [0, 0.7, 1] },
          }}
        >
          {p.heart ? (
            <svg viewBox="0 0 24 24" className="size-full" style={{ fill: p.color }}>
              <path d={HEART_PATH} />
            </svg>
          ) : (
            <span className="block size-1/2 rounded-full" style={{ background: p.color }} />
          )}
        </motion.div>
      ))}
    </div>
  )
}

function Blobs() {
  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-[#ffd166]/40 blur-3xl"
        animate={{ x: [0, 40, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-16 size-80 rounded-full bg-[#b5179e]/40 blur-3xl"
        animate={{ x: [0, -30, 0], y: [0, -40, 0], scale: [1.1, 1, 1.1] }}
        transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
      />
    </>
  )
}

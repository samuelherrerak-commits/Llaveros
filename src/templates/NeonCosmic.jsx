import { useEffect, useMemo } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import WordReveal from '../components/WordReveal.jsx'
import { ease, spring } from '../lib/motion.js'

/**
 * Template 4 — Neon / Cosmic
 * Oscuro, urbano. Tipografía gruesa con glow neón, nebulosas y un campo de
 * estrellas en 3 capas con paralaje (giroscopio en móvil, puntero en desktop).
 */
export default function NeonCosmic({ data }) {
  const { sender, receiver, message, extra } = data
  const neon = extra.color || '#ff2bd6'
  const neon2 = extra.color2 || '#22d3ee'
  const { x, y } = useParallax()
  const words = message.split(/\s+/).length

  // Cada capa se mueve con distinta intensidad → profundidad.
  const nebulaA = { x: useTransform(x, (v) => v * -20), y: useTransform(y, (v) => v * -20) }
  const nebulaB = { x: useTransform(x, (v) => v * -12), y: useTransform(y, (v) => v * -12) }
  const content = { x: useTransform(x, (v) => v * 6), y: useTransform(y, (v) => v * 6) }

  return (
    <main
      className="screen-dvh safe-px safe-pt safe-pb relative flex flex-col overflow-hidden bg-[#05010d] text-white"
      style={{ '--neon': neon, '--neon2': neon2 }}
    >
      {/* Nebulosas */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-1/3 top-[-10%] size-[80vmax] rounded-full opacity-40 mix-blend-screen blur-[90px]"
        style={{ background: `radial-gradient(circle, ${neon}66, transparent 60%)`, ...nebulaA }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-1/3 bottom-[-20%] size-[80vmax] rounded-full opacity-35 mix-blend-screen blur-[90px]"
        style={{ background: `radial-gradient(circle, ${neon2}55, transparent 60%)`, ...nebulaB }}
        animate={{ scale: [1.1, 1, 1.1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      <Starfield x={x} y={y} />
      <ShootingStar />

      {/* Contenido con un paralaje inverso muy leve: sensación de profundidad */}
      <motion.div
        className="relative z-10 flex flex-1 flex-col"
        style={content}
      >
        <header className="flex justify-center pt-2">
          <motion.div
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 backdrop-blur-md"
            initial={{ opacity: 0, y: -16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...spring.smooth, delay: 0.2 }}
          >
            <motion.span
              className="size-1.5 rounded-full"
              style={{ background: neon2, boxShadow: `0 0 8px ${neon2}` }}
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            <span className="font-grotesk text-[10px] font-medium uppercase tracking-[0.3em] text-white/70">
              Transmisión entrante
            </span>
          </motion.div>
        </header>

        <section className="flex flex-1 flex-col justify-center py-10">
          <motion.p
            className="font-grotesk text-sm font-bold uppercase tracking-[0.5em]"
            style={{ color: neon2, textShadow: `0 0 12px ${neon2}` }}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...spring.smooth, delay: 0.5 }}
          >
            Para
          </motion.p>

          {/* Nombre con encendido tipo tubo de neón */}
          <motion.h1
            className="mt-2 break-words font-display text-[clamp(3rem,17vw,5.5rem)] leading-[0.9] font-black uppercase tracking-tight"
            style={{
              color: '#fff',
              textShadow: `0 0 4px #fff, 0 0 14px ${neon}, 0 0 32px ${neon}, 0 0 64px ${neon}`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.15, 1, 0.4, 1, 0.85, 1] }}
            transition={{ duration: 1.4, delay: 0.7, times: [0, 0.08, 0.14, 0.24, 0.3, 0.42, 0.7, 1], ease: 'linear' }}
          >
            {receiver}
          </motion.h1>

          <motion.div
            aria-hidden
            className="mt-8 h-[2px] w-24 origin-left rounded-full"
            style={{ background: `linear-gradient(90deg, ${neon}, ${neon2})`, boxShadow: `0 0 12px ${neon}` }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ ...spring.smooth, delay: 1.9 }}
          />

          <WordReveal
            text={message}
            delay={2.1}
            stagger={0.07}
            y={14}
            blur={10}
            className="mt-8 font-grotesk text-[1.65rem] leading-[1.25] font-bold text-white/95"
            wordClassName="[text-shadow:0_0_18px_rgba(255,255,255,0.25)]"
          />
        </section>

        <footer className="flex items-center justify-between pb-2">
          <motion.div
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] py-2 pl-2 pr-4 backdrop-blur-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring.smooth, delay: 2.4 + words * 0.07 }}
          >
            <span
              className="grid size-9 place-items-center rounded-xl font-display text-sm font-extrabold text-black"
              style={{ background: `linear-gradient(135deg, ${neon}, ${neon2})` }}
            >
              {sender.charAt(0).toUpperCase()}
            </span>
            <span className="leading-tight">
              <span className="block font-grotesk text-[10px] uppercase tracking-[0.3em] text-white/45">De</span>
              <span className="block font-grotesk text-sm font-bold">{sender}</span>
            </span>
          </motion.div>

          <motion.svg
            viewBox="0 0 24 24"
            className="size-8"
            fill="none"
            stroke={neon}
            strokeWidth="2"
            style={{ filter: `drop-shadow(0 0 6px ${neon}) drop-shadow(0 0 14px ${neon})` }}
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ ...spring.bouncy, delay: 2.6 + words * 0.07 }}
          >
            <motion.path
              d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"
              animate={{ scale: [1, 1.12, 1, 1.08, 1] }}
              transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 0.6, delay: 3.5 }}
            />
          </motion.svg>
        </footer>
      </motion.div>
    </main>
  )
}

/* ------------------------------------------------------------------ */

/** Campo de estrellas en 3 capas. Cada capa es un solo div con box-shadows: barato de pintar. */
function Starfield({ x, y }) {
  const layers = useMemo(
    () => [
      { count: 110, size: 1, depth: 8, twinkle: 5 },
      { count: 45, size: 1.5, depth: 22, twinkle: 3.5 },
      { count: 18, size: 2.5, depth: 42, twinkle: 2.5 },
    ].map((l) => ({ ...l, shadow: makeStars(l.count) })),
    [],
  )

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute left-1/2 top-1/2 size-[200vmax] -ml-[100vmax] -mt-[100vmax]"
      animate={{ rotate: 360 }}
      transition={{ duration: 400, repeat: Infinity, ease: 'linear' }}
    >
      {layers.map((l, i) => (
        <StarLayer key={i} layer={l} x={x} y={y} />
      ))}
    </motion.div>
  )
}

function StarLayer({ layer, x, y }) {
  const lx = useTransform(x, (v) => v * layer.depth)
  const ly = useTransform(y, (v) => v * layer.depth)
  return (
    <motion.div className="absolute inset-0" style={{ x: lx, y: ly }}>
      <motion.div
        className="absolute left-0 top-0 rounded-full bg-white"
        style={{ width: layer.size, height: layer.size, boxShadow: layer.shadow }}
        animate={{ opacity: [1, 0.55, 1] }}
        transition={{ duration: layer.twinkle, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  )
}

function makeStars(count) {
  const tints = ['#ffffff', '#ffffff', '#ffffff', '#c7d2fe', '#fbcfe8', '#a5f3fc']
  return Array.from({ length: count }, () => {
    const px = (Math.random() * 200).toFixed(2)
    const py = (Math.random() * 200).toFixed(2)
    return `${px}vmax ${py}vmax ${tints[(Math.random() * tints.length) | 0]}`
  }).join(',')
}

function ShootingStar() {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute left-[70%] top-[8%] h-px w-28"
      style={{ rotate: -35, background: 'linear-gradient(90deg, #fff, transparent)' }}
      initial={{ opacity: 0, x: 0, y: 0 }}
      animate={{ opacity: [0, 1, 0], x: [0, -260], y: [0, 182] }}
      transition={{ duration: 1.1, ease: ease.outQuart, repeat: Infinity, repeatDelay: 5.5, delay: 3 }}
    />
  )
}

/**
 * Valores de paralaje normalizados en [-1, 1], suavizados con spring.
 * Usa el giroscopio si está disponible (en iOS pide permiso al primer toque)
 * y el puntero como alternativa.
 */
function useParallax() {
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, { stiffness: 60, damping: 18, mass: 0.8 })
  const y = useSpring(rawY, { stiffness: 60, damping: 18, mass: 0.8 })

  useEffect(() => {
    const clamp = (v) => Math.max(-1, Math.min(1, v))

    const onPointer = (e) => {
      rawX.set((e.clientX / window.innerWidth) * 2 - 1)
      rawY.set((e.clientY / window.innerHeight) * 2 - 1)
    }
    const onOrientation = (e) => {
      if (e.gamma == null || e.beta == null) return
      rawX.set(clamp(e.gamma / 25))
      rawY.set(clamp((e.beta - 45) / 25)) // 45° ≈ cómo se sostiene el teléfono
    }
    const askPermission = async () => {
      try {
        if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
          const res = await DeviceOrientationEvent.requestPermission()
          if (res === 'granted') window.addEventListener('deviceorientation', onOrientation)
        }
      } catch {
        /* el usuario lo negó: seguimos con el puntero */
      }
    }

    window.addEventListener('pointermove', onPointer, { passive: true })
    if (typeof DeviceOrientationEvent !== 'undefined') {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        window.addEventListener('pointerdown', askPermission, { once: true })
      } else {
        window.addEventListener('deviceorientation', onOrientation)
      }
    }

    return () => {
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('pointerdown', askPermission)
      window.removeEventListener('deviceorientation', onOrientation)
    }
  }, [rawX, rawY])

  return { x, y }
}

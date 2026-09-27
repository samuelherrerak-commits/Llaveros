import { useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { ease, spring } from '../lib/motion.js'

/**
 * Template 3 — Polaroid Memory
 * Una foto instantánea que se "revela", se inclina con el dedo y al tocarla
 * se voltea en 3D para mostrar el mensaje escrito a mano.
 */
export default function PolaroidMemory({ data }) {
  const { sender, receiver, message, extra } = data
  const [flipped, setFlipped] = useState(false)
  const [hasFlipped, setHasFlipped] = useState(false)

  // Inclinación según la posición del dedo sobre la tarjeta.
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const tiltX = useSpring(useTransform(py, [0, 1], [7, -7]), spring.soft)
  const tiltY = useSpring(useTransform(px, [0, 1], [-9, 9]), spring.soft)
  const glareX = useTransform(px, [0, 1], ['0%', '100%'])
  const glareY = useTransform(py, [0, 1], ['0%', '100%'])

  const handlePointerMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    px.set((e.clientX - r.left) / r.width)
    py.set((e.clientY - r.top) / r.height)
  }
  const resetTilt = () => {
    px.set(0.5)
    py.set(0.5)
  }

  const flip = () => {
    setFlipped((f) => !f)
    setHasFlipped(true)
    navigator.vibrate?.(8)
  }

  return (
    <main className="screen-dvh safe-px safe-pt safe-pb relative flex flex-col items-center justify-center overflow-hidden bg-[#ebe6de] text-stone-800">
      {/* Mesa: viñeta cálida + grano */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,#f7f3ec_0%,#e6dfd3_55%,#d6cdbd_100%)]" />
      <div aria-hidden className="grain pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-multiply" />

      <motion.p
        className="relative mb-8 font-hand text-2xl text-stone-500"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring.gentle, delay: 1.2 }}
      >
        un recuerdo para {receiver}
      </motion.p>

      {/* Entrada: la foto "cae" sobre la mesa */}
      <motion.div
        className="relative w-[min(82vw,340px)]"
        style={{ perspective: 1400 }}
        initial={{ y: -420, rotate: -18, opacity: 0 }}
        animate={{ y: 0, rotate: -3, opacity: 1 }}
        transition={{ ...spring.soft, opacity: { duration: 0.3 } }}
      >
        <motion.div
          style={{ rotateX: tiltX, rotateY: tiltY, transformStyle: 'preserve-3d' }}
          onPointerMove={handlePointerMove}
          onPointerLeave={resetTilt}
          onPointerUp={resetTilt}
          whileTap={{ scale: 0.97 }}
          transition={spring.snappy}
          onTap={flip}
          className="relative cursor-pointer touch-manipulation no-select"
          role="button"
          tabIndex={0}
          aria-pressed={flipped}
          aria-label={flipped ? 'Ver la foto' : 'Voltear la foto para leer el mensaje'}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), flip())}
        >
          {/* Flip 3D */}
          <motion.div
            className="relative aspect-[88/107] w-full"
            style={{ transformStyle: 'preserve-3d' }}
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={spring.flip}
          >
            <Front photo={extra.photo} caption={extra.caption || `${receiver} ♡`} glareX={glareX} glareY={glareY} />
            <Back receiver={receiver} sender={sender} message={message} date={extra.date} revealed={hasFlipped} />
          </motion.div>
        </motion.div>

        {/* Cinta adhesiva */}
        <motion.div
          aria-hidden
          className="absolute -top-3 left-1/2 h-7 w-24 -translate-x-1/2 rotate-[4deg] bg-[#f5ecd7]/80 shadow-sm backdrop-blur-[2px]"
          style={{ clipPath: 'polygon(3% 0, 97% 4%, 100% 100%, 0 96%)' }}
          initial={{ opacity: 0, scale: 1.3 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...spring.snappy, delay: 0.7 }}
        />
      </motion.div>

      {/* Pista */}
      <div className="relative mt-10 h-6">
        <AnimatePresence mode="wait">
          <motion.p
            key={flipped ? 'back' : hasFlipped ? 'front-again' : 'hint'}
            className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.25em] text-stone-500"
            initial={{ opacity: 0, y: 6, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -6, filter: 'blur(4px)' }}
            transition={{ duration: 0.35, ease: ease.outExpo, delay: hasFlipped ? 0 : 2.2 }}
          >
            <motion.span
              animate={!hasFlipped ? { scale: [1, 1.25, 1] } : {}}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-block size-1.5 rounded-full bg-rose-400"
            />
            {flipped ? 'Toca para ver la foto' : 'Toca la foto para voltearla'}
          </motion.p>
        </AnimatePresence>
      </div>
    </main>
  )
}

const face = 'absolute inset-0 rounded-[3px] bg-[#fbfaf7] shadow-[0_1px_1px_rgba(0,0,0,.08),0_12px_24px_-8px_rgba(60,40,20,.35),0_40px_60px_-30px_rgba(60,40,20,.45)]'
const hidden = { backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }

function Front({ photo, caption, glareX, glareY }) {
  const [loaded, setLoaded] = useState(!photo)
  const glare = useTransform(
    [glareX, glareY],
    ([x, y]) => `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,.55), transparent 55%)`,
  )

  return (
    <div className={`${face} flex flex-col p-[6%] pb-0`} style={hidden}>
      <div className="relative aspect-square w-full overflow-hidden bg-stone-900">
        {photo ? (
          <motion.img
            src={photo}
            alt=""
            draggable={false}
            onLoad={() => setLoaded(true)}
            className="size-full object-cover"
            // Efecto de revelado: sobreexpuesta y desaturada → imagen final
            initial={{ opacity: 0, filter: 'brightness(2.2) saturate(0) contrast(0.6) blur(6px)' }}
            animate={
              loaded
                ? { opacity: 1, filter: 'brightness(1) saturate(1.05) contrast(1.02) blur(0px)' }
                : { opacity: 0 }
            }
            transition={{ duration: 3.2, delay: 0.5, ease: ease.outQuart }}
          />
        ) : (
          <motion.div
            className="size-full bg-[radial-gradient(circle_at_30%_30%,#fecdd3,#f472b6_45%,#7c3aed)]"
            initial={{ opacity: 0, filter: 'brightness(2) saturate(0)' }}
            animate={{ opacity: 1, filter: 'brightness(1) saturate(1)' }}
            transition={{ duration: 3, delay: 0.5, ease: ease.outQuart }}
          />
        )}
        {/* Brillo que sigue al dedo */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 mix-blend-soft-light"
          style={{ background: glare }}
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(0,0,0,.06)]" />
      </div>
      <div className="flex flex-1 items-center justify-center">
        <p className="font-hand text-[1.7rem] leading-none text-stone-700">{caption}</p>
      </div>
    </div>
  )
}

/** Reverso: el mensaje se "escribe" palabra a palabra la primera vez que se voltea. */
function Back({ receiver, sender, message, date, revealed }) {
  const words = message.split(/\s+/).filter(Boolean)
  const ink = (i) => ({
    initial: { opacity: 0, filter: 'blur(2px)' },
    animate: revealed ? { opacity: 1, filter: 'blur(0px)' } : {},
    transition: { duration: 0.35, delay: 0.45 + i * 0.07, ease: ease.outQuart },
  })

  return (
    <div
      className={`${face} overflow-hidden`}
      style={{ ...hidden, transform: 'rotateY(180deg)' }}
    >
      {/* Papel rayado */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0, transparent 33px, #cfd8e3 33px, #cfd8e3 34px)',
          backgroundPosition: '0 58px',
        }}
      />
      <div aria-hidden className="absolute bottom-0 left-9 top-0 w-px bg-rose-300/70" />

      <div className="relative flex h-full flex-col py-5 pl-12 pr-6">
        <div className="flex items-baseline justify-between">
          <p className="font-hand text-[1.9rem] leading-[34px] text-stone-800">Para {receiver},</p>
          {date && <p className="font-hand text-base text-stone-400">{date}</p>}
        </div>
        <p className="mt-[10px] flex-1 overflow-y-auto font-hand text-[1.45rem] leading-[34px] text-[#26408b]" aria-label={message}>
          {words.map((w, i) => (
            <motion.span key={i} aria-hidden className="inline-block" {...ink(i)}>
              {w}
              {i < words.length - 1 && '\u00A0'}
            </motion.span>
          ))}
        </p>
        <motion.p className="self-end font-hand text-[1.6rem] leading-[34px] text-stone-700" {...ink(words.length + 2)}>
          — {sender} ♥
        </motion.p>
      </div>
    </div>
  )
}

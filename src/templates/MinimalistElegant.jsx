import { useState } from 'react'
import { motion } from 'framer-motion'
import WordReveal from '../components/WordReveal.jsx'
import ReplayButton from '../components/ReplayButton.jsx'
import { ease, spring } from '../lib/motion.js'

/**
 * Template 1 — Minimalist Elegant
 * Monocromo, Playfair Display, fade-ins sutiles y texto palabra por palabra.
 */
export default function MinimalistElegant({ data }) {
  const [run, setRun] = useState(0)
  return <Scene key={run} data={data} onReplay={() => setRun((n) => n + 1)} />
}

function Scene({ data, onReplay }) {
  const { sender, receiver, message, extra } = data
  const accent = extra.color || '#d6c7a1'
  const [done, setDone] = useState(false)

  // Tiempo aproximado en el que termina el mensaje, para encadenar la firma.
  const words = message.split(/\s+/).length
  const messageDelay = 1.5

  return (
    <main className="screen-dvh safe-px safe-pt safe-pb relative flex flex-col overflow-hidden bg-[#0b0b0c] text-neutral-100">
      {/* Luz ambiental que se desplaza muy lento */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 size-[34rem] rounded-full opacity-[0.14] blur-[120px]"
        style={{ background: accent }}
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 0.14, scale: 1, x: ['-50%', '-44%', '-56%', '-50%'] }}
        transition={{ opacity: { duration: 2.4 }, scale: { duration: 3, ease: ease.outExpo }, x: { duration: 22, repeat: Infinity, ease: 'easeInOut' } }}
      />
      <div aria-hidden className="grain pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay" />

      {/* Encabezado */}
      <header className="relative flex items-center justify-between pt-2">
        <motion.span
          className="text-[10px] font-medium uppercase tracking-[0.4em] text-neutral-500"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: ease.outExpo }}
        >
          Una carta
        </motion.span>
        <motion.span
          className="font-serif text-xs italic text-neutral-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.35 }}
        >
          N.º 001
        </motion.span>
      </header>

      {/* Cuerpo */}
      <section className="relative flex flex-1 flex-col justify-center py-12">
        <motion.p
          className="font-serif text-sm italic tracking-wide"
          style={{ color: accent }}
          initial={{ opacity: 0, y: 8, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ ...spring.gentle, delay: 0.5, opacity: { duration: 1.2, delay: 0.5 } }}
        >
          Para
        </motion.p>

        <WordReveal
          as="h1"
          text={receiver}
          delay={0.7}
          stagger={0.12}
          y={18}
          blur={14}
          className="mt-1 font-serif text-[clamp(2.75rem,14vw,4.5rem)] leading-[0.95] font-normal tracking-tight text-white"
        />

        {/* Línea que se dibuja */}
        <motion.div
          aria-hidden
          className="my-9 h-px w-16 origin-left"
          style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.4, delay: 1.1, ease: ease.outExpo }}
        />

        <WordReveal
          text={message}
          delay={messageDelay}
          stagger={0.075}
          y={6}
          blur={6}
          onComplete={() => setDone(true)}
          className="font-serif text-[1.35rem] leading-[1.55] font-normal text-neutral-200"
          transition={{
            opacity: { duration: 0.9, ease: ease.outExpo },
            filter: { duration: 0.9, ease: ease.outExpo },
            y: { duration: 1, ease: ease.outExpo },
          }}
        />

        {/* Firma */}
        <motion.p
          className="mt-10 self-end font-serif text-lg italic text-neutral-400"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...spring.gentle, delay: messageDelay + words * 0.075 + 0.5, opacity: { duration: 1.2, delay: messageDelay + words * 0.075 + 0.5 } }}
        >
          — {sender}
        </motion.p>
      </section>

      {/* Pie */}
      <footer className="relative flex h-11 items-center justify-between">
        <motion.span
          className="text-[10px] uppercase tracking-[0.35em] text-neutral-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: done ? 1 : 0 }}
          transition={{ duration: 1.2 }}
        >
          Con amor
        </motion.span>
        {done && <ReplayButton onClick={onReplay} className="border border-white/10 bg-white/[0.04] text-neutral-400" />}
      </footer>
    </main>
  )
}

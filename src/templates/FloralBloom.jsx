import { useMemo } from 'react'
import { motion } from 'framer-motion'
import WordReveal from '../components/WordReveal.jsx'
import { blurIn, ease, spring, stagger } from '../lib/motion.js'

/**
 * Template 2 — Floral Bloom
 * Pasteles, tipografía script, pétalos cayendo y una tarjeta de vidrio que respira.
 */
export default function FloralBloom({ data }) {
  const { sender, receiver, message, extra } = data
  const petalColor = extra.color || '#f9a8c9'

  return (
    <main className="screen-dvh safe-px safe-pt safe-pb relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#fff7f0] via-[#fdeef1] to-[#fbd9e3] text-rose-950">
      {/* Manchas de color difuminadas */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-10 size-72 rounded-full bg-[#ffd6c9] blur-3xl"
        animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-20 bottom-16 size-80 rounded-full bg-[#f7c6dc] blur-3xl"
        animate={{ x: [0, -24, 0], y: [0, -30, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />

      <Petals color={petalColor} />

      <motion.div
        className="relative w-full max-w-sm"
        variants={stagger(0.14, 0.2)}
        initial="hidden"
        animate="show"
      >
        <Bloom color={petalColor} />

        {/* Tarjeta de vidrio que respira */}
        <motion.article
          variants={{
            hidden: { opacity: 0, y: 40, scale: 0.96 },
            show: { opacity: 1, y: 0, scale: 1, transition: { ...spring.soft, opacity: { duration: 0.8 } } },
          }}
          className="relative rounded-[2rem] border border-white/70 bg-white/45 px-7 pb-9 pt-12 text-center shadow-[0_30px_80px_-30px_rgba(190,70,110,0.45)] backdrop-blur-2xl"
        >
          <motion.div
            className="absolute inset-0 rounded-[2rem]"
            aria-hidden
            animate={{ scale: [1, 1.012, 1] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,.9)' }}
          />

          <motion.p variants={blurIn} className="font-cormorant text-xs uppercase tracking-[0.45em] text-rose-400">
            Para ti
          </motion.p>

          <motion.h1
            variants={{
              hidden: { opacity: 0, scale: 0.9, filter: 'blur(8px)' },
              show: { opacity: 1, scale: 1, filter: 'blur(0px)', transition: { ...spring.gentle, opacity: { duration: 1.2 }, filter: { duration: 1.2 } } },
            }}
            className="mt-2 font-script text-[clamp(3.25rem,16vw,4.5rem)] leading-none text-rose-500"
          >
            {receiver}
          </motion.h1>

          <Divider />

          <Breathing>
            <WordReveal
              text={message}
              delay={1.3}
              stagger={0.09}
              y={4}
              blur={5}
              className="font-cormorant text-[1.4rem] leading-[1.5] italic text-rose-950/80"
              transition={{
                opacity: { duration: 1.1, ease: ease.outQuart },
                filter: { duration: 1.1, ease: ease.outQuart },
                y: { duration: 1.2, ease: ease.outQuart },
              }}
            />
          </Breathing>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring.gentle, delay: 1.6 + message.split(/\s+/).length * 0.09 }}
            className="mt-8"
          >
            <p className="font-cormorant text-sm italic text-rose-400">con todo mi cariño,</p>
            <p className="font-script text-4xl leading-tight text-rose-600">{sender}</p>
          </motion.div>
        </motion.article>
      </motion.div>
    </main>
  )
}

/** Hace que el texto "respire": escala y opacidad muy leves en bucle. */
function Breathing({ children }) {
  return (
    <motion.div
      animate={{ scale: [1, 1.015, 1], opacity: [1, 0.92, 1] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
    >
      {children}
    </motion.div>
  )
}

function Divider() {
  return (
    <div className="my-6 flex items-center justify-center gap-3" aria-hidden>
      <motion.span
        className="h-px w-12 origin-right bg-gradient-to-l from-rose-300 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.2, delay: 1, ease: ease.outExpo }}
      />
      <motion.span
        className="text-rose-300"
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ ...spring.bouncy, delay: 1.1 }}
      >
        ✿
      </motion.span>
      <motion.span
        className="h-px w-12 origin-left bg-gradient-to-r from-rose-300 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.2, delay: 1, ease: ease.outExpo }}
      />
    </div>
  )
}

/** Flor que se abre pétalo a pétalo sobre la tarjeta. */
function Bloom({ color }) {
  const petals = [0, 72, 144, 216, 288]
  return (
    <motion.div
      className="absolute -top-10 left-1/2 z-10 -ml-10 size-20"
      variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
      aria-hidden
    >
      <motion.svg
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
        viewBox="-50 -50 100 100"
        className="size-full drop-shadow-[0_8px_16px_rgba(236,72,153,0.3)]"
      >
        {petals.map((deg, i) => (
          <g key={deg} transform={`rotate(${deg})`}>
            <motion.ellipse
              cx="0"
              cy="-22"
              rx="15"
              ry="23"
              fill={color}
              fillOpacity="0.9"
              stroke="white"
              strokeOpacity="0.7"
              strokeWidth="1.5"
              style={{ originX: '50%', originY: '100%' }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ ...spring.soft, delay: 0.5 + i * 0.09 }}
            />
          </g>
        ))}
        <motion.circle
          r="10"
          fill="#fde68a"
          stroke="white"
          strokeWidth="2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ ...spring.bouncy, delay: 1 }}
        />
      </motion.svg>
    </motion.div>
  )
}

/** Pétalos cayendo con deriva lateral y giro. Parámetros aleatorios fijos por montaje. */
function Petals({ color, count = 16 }) {
  const petals = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 10 + Math.random() * 14,
        duration: 9 + Math.random() * 8,
        delay: Math.random() * -16, // negativo: ya hay pétalos en pantalla al entrar
        drift: 20 + Math.random() * 50,
        spin: (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 360),
        opacity: 0.45 + Math.random() * 0.45,
      })),
    [count],
  )

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {petals.map((p) => (
        <motion.div
          key={p.id}
          className="absolute -top-8"
          style={{ left: `${p.left}%`, width: p.size, height: p.size, opacity: p.opacity }}
          animate={{
            y: ['0vh', '112vh'],
            x: [0, p.drift, -p.drift * 0.4, p.drift * 0.7, 0],
            rotate: [0, p.spin],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
            x: { duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          <svg viewBox="0 0 20 20" className="size-full">
            <path d="M10 0C15 5 17 11 10 20 3 11 5 5 10 0z" fill={color} />
            <path d="M10 3v13" stroke="white" strokeOpacity=".5" strokeWidth=".8" />
          </svg>
        </motion.div>
      ))}
    </div>
  )
}

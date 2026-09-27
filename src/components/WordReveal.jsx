import { motion } from 'framer-motion'
import { ease, spring } from '../lib/motion.js'

/**
 * Revela un texto palabra por palabra con fade + blur + leve subida.
 * Cada palabra es inline-block para que el salto de línea siga siendo natural.
 */
export default function WordReveal({
  text,
  as: Tag = 'p',
  className = '',
  wordClassName = '',
  delay = 0,
  stagger = 0.06,
  y = 10,
  blur = 8,
  transition,
  onComplete,
}) {
  const words = String(text).split(/\s+/).filter(Boolean)
  const MotionTag = motion[Tag] ?? motion.p

  return (
    <MotionTag
      className={className}
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      onAnimationComplete={(def) => def === 'show' && onComplete?.()}
      aria-label={text}
    >
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          aria-hidden
          className={`inline-block will-change-[transform,opacity,filter] ${wordClassName}`}
          variants={{
            hidden: { opacity: 0, y, filter: `blur(${blur}px)` },
            show: {
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
              transition: transition ?? {
                ...spring.smooth,
                opacity: { duration: 0.5, ease: ease.outExpo },
                filter: { duration: 0.6, ease: ease.outExpo },
              },
            },
          }}
        >
          {word}
          {i < words.length - 1 && ' '}
        </motion.span>
      ))}
    </MotionTag>
  )
}

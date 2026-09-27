/**
 * Presets de física compartidos. Todo movimiento de la app sale de aquí
 * para que la sensación sea coherente entre plantillas.
 *
 *  - stiffness: qué tan "tenso" está el resorte (velocidad).
 *  - damping:   fricción; bajo = rebota, alto = se asienta sin rebote.
 *  - mass:      inercia; más masa = más perezoso.
 */
export const spring = {
  /** Entradas de UI: rápido, sin rebote perceptible. */
  smooth: { type: 'spring', stiffness: 260, damping: 30, mass: 1 },
  /** Elementos que "aterrizan" con un micro-rebote. */
  soft: { type: 'spring', stiffness: 170, damping: 22, mass: 1 },
  /** Botones / taps: respuesta inmediata. */
  snappy: { type: 'spring', stiffness: 500, damping: 32, mass: 0.8 },
  /** Elástico y juguetón (plantilla 5). */
  bouncy: { type: 'spring', stiffness: 380, damping: 14, mass: 0.9 },
  /** Lento y pesado: fondos, tarjetas grandes. */
  gentle: { type: 'spring', stiffness: 90, damping: 20, mass: 1.2 },
  /** Flip 3D de la polaroid. */
  flip: { type: 'spring', stiffness: 120, damping: 17, mass: 1 },
}

/** Curvas para transiciones basadas en tiempo (opacidad, blur). */
export const ease = {
  outExpo: [0.16, 1, 0.3, 1],
  outQuart: [0.25, 1, 0.5, 1],
  inOut: [0.65, 0, 0.35, 1],
}

/** Contenedor que escalona a sus hijos. */
export const stagger = (staggerChildren = 0.08, delayChildren = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren } },
})

/** Fade + blur + desplazamiento: la entrada "firma" de la app. */
export const blurIn = {
  hidden: { opacity: 0, y: 12, filter: 'blur(10px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { ...spring.smooth, opacity: { duration: 0.6, ease: ease.outExpo }, filter: { duration: 0.7, ease: ease.outExpo } },
  },
}

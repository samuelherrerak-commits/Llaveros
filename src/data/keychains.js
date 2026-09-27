/**
 * Fuente de datos local (modo 100% estático).
 *
 * Se usa con VITE_DATA_SOURCE=local: los mensajes viven aquí, dentro del
 * build, y no hace falta ningún backend. Además, el post-build genera una
 * página real `dist/id/<slug>/index.html` por cada entrada.
 *
 * Por defecto (VITE_DATA_SOURCE=sheets) los datos salen del Google Sheet y
 * este archivo solo alimenta la lista de demo en desarrollo.
 *
 * Mismo formato que las columnas del Sheet:
 *   slug → { template_id, sender, receiver, message, extra_data }
 */
export const KEYCHAINS = {
  'juan-maria': {
    template_id: 1,
    sender: 'Juan',
    receiver: 'María',
    message:
      'Contigo aprendí que el silencio también puede ser un hogar. Gracias por quedarte, incluso en los días en que yo no sabía cómo pedírtelo.',
    extra_data: '',
  },
  'flor-de-abril': {
    template_id: 2,
    sender: 'Andrés',
    receiver: 'Sofía',
    message: 'Floreces en todo lo que tocas, y yo, sin darme cuenta, empecé a florecer contigo.',
    extra_data: '{"color":"#f9a8c9"}',
  },
  'nuestro-verano': {
    template_id: 3,
    sender: 'Leo',
    receiver: 'Valen',
    message: 'Este fue el día en que supe que eras tú. Lo guardo aquí para que nunca se nos olvide.',
    extra_data:
      '{"photo":"https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=900&q=80","date":"14 · 02 · 2025","caption":"nuestro verano ☀"}',
  },
  'baby-galaxia': {
    template_id: 4,
    sender: 'Kevin',
    receiver: 'Dani',
    message: 'En un universo de millones, siempre te elijo a ti.',
    extra_data: '{"color":"#a855f7"}',
  },
  'boom-amor': {
    template_id: 5,
    sender: 'Pau',
    receiver: 'Nico',
    message: '¡Te quiero más que ayer y menos que mañana!',
    extra_data: '',
  },
}

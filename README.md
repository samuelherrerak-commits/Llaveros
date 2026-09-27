# Llaveros NFC 💌

Web app móvil y **100% estática** que se abre al escanear un llavero NFC y muestra un mensaje de amor personalizado con una de 5 plantillas animadas.

- **Frontend:** React 19 + Vite, Tailwind CSS v4, Framer Motion (físicas de resorte).
- **Datos:** Google Sheets vía Google Apps Script **o** un archivo local (sin backend).
- **Hosting:** cualquier hosting estático (GitHub Pages, Netlify, Vercel, Cloudflare Pages, S3…). El build es solo HTML/CSS/JS en `dist/`.

```
midominio.com/id/juan-maria   ← URL grabada en el chip NFC
```

---

## Estructura

```
├── apps-script/
│   ├── Code.gs              # Backend: doGet(e) → JSON (y JSONP opcional)
│   └── appsscript.json      # Manifiesto (Web App pública, runtime V8)
├── scripts/
│   └── postbuild.js         # Genera 404.html + dist/id/<slug>/index.html
├── src/
│   ├── main.jsx             # BrowserRouter + MotionConfig
│   ├── App.jsx              # Rutas: /, /id/:slug, /:slug
│   ├── index.css            # Tailwind v4 + fuentes + utilidades (safe-area, dvh)
│   ├── data/keychains.js    # Datos locales (modo estático / desarrollo)
│   ├── services/api.js      # Servicio de fetch a Apps Script (+ cache, JSONP, timeout)
│   ├── hooks/useKeychain.js # Estado loading / success / error
│   ├── lib/motion.js        # Presets de spring compartidos
│   ├── pages/
│   │   ├── KeychainPage.jsx # Lee el slug → fetch → renderiza la plantilla
│   │   └── HomePage.jsx     # Portada neutra (lista de demo solo en dev)
│   ├── components/          # LoadingScreen, ErrorScreen, WordReveal, ReplayButton
│   └── templates/
│       ├── index.js               # template_id → componente (lazy, un chunk por plantilla)
│       ├── MinimalistElegant.jsx  # 1
│       ├── FloralBloom.jsx        # 2
│       ├── PolaroidMemory.jsx     # 3
│       ├── NeonCosmic.jsx         # 4
│       └── PlayfulHeart.jsx       # 5
└── .github/workflows/deploy.yml   # Deploy automático a GitHub Pages
```

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:5173 → la portada lista las 5 demos
npm run build      # genera dist/ listo para subir
npm run preview
```

## Fuente de datos: dos modos

| Modo | Cómo se activa | Cuándo usarlo |
| --- | --- | --- |
| **Local (estático puro)** | `VITE_GAS_URL` vacía | Pocos llaveros; editas `src/data/keychains.js` y vuelves a publicar. Sin dependencias externas. |
| **Google Sheets** | `VITE_GAS_URL=https://script.google.com/macros/s/…/exec` | Agregar llaveros sin volver a publicar: solo añades una fila al Sheet. |

En ambos casos el frontend sigue siendo un sitio estático: el Sheet se consulta desde el navegador.

### Columnas del Sheet

| slug | template_id | sender | receiver | message | extra_data |
| --- | --- | --- | --- | --- | --- |
| juan-maria | 1 | Juan | María | Contigo aprendí… | |
| nuestro-verano | 3 | Leo | Valen | Este fue el día… | `{"photo":"https://…","date":"14 · 02 · 2025"}` |

`extra_data` acepta JSON, pares `clave=valor; clave2=valor2` o una URL suelta (se toma como foto). Claves útiles:

| Clave | Plantillas | Uso |
| --- | --- | --- |
| `color` | 1, 2, 4 | Color de acento (dorado, pétalos, neón) |
| `color2` | 4 | Segundo neón |
| `photo` | 3 | URL de la foto de la polaroid |
| `caption` | 3 | Texto bajo la foto |
| `date` | 3 | Fecha en el reverso |

## Configurar Apps Script

1. Crea el Google Sheet → **Extensiones → Apps Script**.
2. Pega `apps-script/Code.gs` (y opcionalmente el manifiesto `appsscript.json`).
3. Ejecuta una vez `setupSheet` para crear la pestaña `Llaveros` con encabezados y ejemplos.
4. **Implementar → Nueva implementación → Aplicación web**
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier persona**
5. Copia la URL `/exec` en `.env` como `VITE_GAS_URL` (ver `.env.example`).

> **CORS:** Apps Script no permite fijar headers, pero una Web App pública responde con `Access-Control-Allow-Origin: *`. El servicio hace un GET *simple* (sin headers custom) para evitar el preflight `OPTIONS` y, si aun así falla, reintenta por **JSONP** (`?callback=`), que `Code.gs` soporta. Las respuestas se cachean 5 min en `CacheService` y en `sessionStorage`.

> Al editar `Code.gs` hay que crear una **nueva versión** de la implementación para que el cambio se publique.

## Publicar (hosting estático)

El `postbuild` deja `dist/` listo para cualquier hosting **sin necesidad de rewrites**:

- `dist/id/<slug>/index.html` para cada llavero de `src/data/keychains.js` → responden 200 directamente.
- `dist/404.html` (copia de la app) → los slugs que vienen del Sheet también abren en GitHub Pages / Netlify / Cloudflare Pages.
- `public/_redirects` (Netlify) y `vercel.json` como refuerzo SPA.

**GitHub Pages (automático):** activa *Settings → Pages → Source: GitHub Actions*. Cada push a `main` publica. Variables opcionales del repo: `VITE_GAS_URL` y `VITE_BASE` (`/` si usas dominio propio; por defecto `/<repo>/`).

**Manual:** `npm run build` y sube `dist/` a Netlify Drop, Cloudflare Pages, Vercel, etc. Si publicas en una subcarpeta: `VITE_BASE=/subcarpeta/ npm run build`.

## Plantillas

| ID | Nombre | Vibra | Interacción |
| --- | --- | --- | --- |
| 1 | Minimalist Elegant | Monocromo, Playfair Display | Texto palabra por palabra con blur, firma encadenada, repetir |
| 2 | Floral Bloom | Pasteles, Great Vibes + Cormorant | Pétalos cayendo, flor que se abre, tarjeta de vidrio que respira |
| 3 | Polaroid Memory | Papel, Caveat manuscrita | Foto que se "revela", inclinación con el dedo, flip 3D con resorte, tinta al voltear |
| 4 | Neon / Cosmic | Oscuro, Unbounded + Space Grotesk | Encendido de neón, estrellas en 3 capas con paralaje (giroscopio), estrella fugaz |
| 5 | Playful Heart | Vibrante, Fredoka | Mantener presionado: anillo de carga, temblor, explosión de partículas con resortes, vibración |

Todas respetan `prefers-reduced-motion`, las safe-areas del iPhone y usan `100dvh`.

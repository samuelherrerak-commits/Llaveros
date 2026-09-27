/**
 * ============================================================
 *  Llaveros NFC — Backend en Google Apps Script
 * ============================================================
 *
 *  Hoja esperada (primera fila = encabezados):
 *    slug | template_id | sender | receiver | message | extra_data
 *
 *  Endpoint:
 *    GET  https://script.google.com/macros/s/<DEPLOY_ID>/exec?slug=juan-maria&token=Llaverosv1
 *    GET  ...?slug=juan-maria&token=Llaverosv1&callback=miFuncion   (modo JSONP opcional)
 *
 *  Respuesta:
 *    { ok: true,  data: { slug, template_id, sender, receiver, message, extra_data } }
 *    { ok: false, error: "UNAUTHORIZED" | "NOT_FOUND" | "MISSING_SLUG" | "INTERNAL_ERROR", message }
 *
 *  ── Sobre el token ─────────────────────────────────────────
 *  Toda petición debe incluir `token`. Se envía como parámetro de la URL
 *  (no como header) para que el GET siga siendo "simple" y no dispare
 *  preflight CORS. El token viaja dentro del JS del portal estático, así que
 *  es visible para quien inspeccione el sitio: frena el scraping casual y los
 *  accesos directos al endpoint, pero no es un secreto fuerte. Para rotarlo,
 *  cambia API_TOKEN (o la propiedad del script) y VITE_API_TOKEN del portal.
 *
 *  ── Sobre CORS ──────────────────────────────────────────────
 *  ContentService NO permite fijar headers HTTP arbitrarios. Aun así,
 *  cuando la Web App se despliega con acceso "Cualquier persona", Google
 *  responde (tras el redirect 302 a script.googleusercontent.com) con
 *  `Access-Control-Allow-Origin: *`. Para que funcione en el navegador:
 *    1. Desplegar como: Ejecutar como "Yo" · Acceso "Cualquier persona".
 *    2. Desde el frontend hacer un GET "simple" (sin headers custom, sin
 *       Content-Type) para que el navegador NO dispare un preflight OPTIONS,
 *       que Apps Script no sabe responder.
 *    3. Seguir redirects (fetch lo hace por defecto: redirect: "follow").
 *  Como red de seguridad, se soporta JSONP con `?callback=nombre`, que
 *  evita CORS por completo.
 * ============================================================
 */

/** Nombre de la pestaña. Si no existe, se usa la primera hoja. */
var SHEET_NAME = 'Llaveros';

/**
 * Opcional: ID del Spreadsheet si el script NO está vinculado (standalone).
 * Déjalo vacío si creaste el script desde Extensiones → Apps Script.
 */
var SPREADSHEET_ID = '';

/**
 * Token de acceso. Se puede sobreescribir sin tocar el código desde
 * Configuración del proyecto → Propiedades del script → API_TOKEN.
 */
var API_TOKEN = 'Llaverosv1';

/** Tiempo de cache en segundos (CacheService, máx 21600 = 6 h). */
var CACHE_TTL_SECONDS = 300;

var REQUIRED_COLUMNS = ['slug', 'template_id', 'sender', 'receiver', 'message', 'extra_data'];

/* ------------------------------------------------------------------ */
/*  Entry point                                                        */
/* ------------------------------------------------------------------ */

function doGet(e) {
  var params = (e && e.parameter) || {};
  var callback = sanitizeCallback_(params.callback);

  try {
    if (!isAuthorized_(params.token)) {
      return respond_({ ok: false, error: 'UNAUTHORIZED', message: 'Token inválido o ausente.' }, callback);
    }

    var slug = normalizeSlug_(params.slug);

    if (!slug) {
      return respond_({ ok: false, error: 'MISSING_SLUG', message: 'Falta el parámetro "slug".' }, callback);
    }

    var record = getRecordBySlug_(slug);

    if (!record) {
      return respond_({ ok: false, error: 'NOT_FOUND', message: 'No existe un llavero con ese slug.' }, callback);
    }

    return respond_({ ok: true, data: record }, callback);
  } catch (err) {
    console.error(err);
    return respond_({ ok: false, error: 'INTERNAL_ERROR', message: String(err && err.message || err) }, callback);
  }
}

/* ------------------------------------------------------------------ */
/*  Lectura de datos                                                   */
/* ------------------------------------------------------------------ */

function getRecordBySlug_(slug) {
  var cache = CacheService.getScriptCache();
  var cacheKey = 'slug:' + slug;
  var cached = cache.get(cacheKey);
  if (cached) return JSON.parse(cached);

  var sheet = getSheet_();
  var values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return null;

  var headers = values[0].map(function (h) {
    return String(h).trim().toLowerCase();
  });
  var index = {};
  REQUIRED_COLUMNS.forEach(function (col) {
    index[col] = headers.indexOf(col);
  });
  if (index.slug === -1) throw new Error('La hoja no tiene la columna "slug".');

  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    if (normalizeSlug_(row[index.slug]) !== slug) continue;

    var record = {
      slug: slug,
      template_id: toTemplateId_(cell_(row, index.template_id)),
      sender: cell_(row, index.sender),
      receiver: cell_(row, index.receiver),
      message: cell_(row, index.message),
      extra_data: parseExtraData_(cell_(row, index.extra_data)),
    };

    cache.put(cacheKey, JSON.stringify(record), CACHE_TTL_SECONDS);
    return record;
  }

  return null;
}

function getSheet_() {
  var ss = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('No se encontró el Spreadsheet. Configura SPREADSHEET_ID.');
  return ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getApiToken_() {
  var fromProps = PropertiesService.getScriptProperties().getProperty('API_TOKEN');
  return fromProps || API_TOKEN;
}

/** Comparación en tiempo constante para no filtrar el token por timing. */
function isAuthorized_(token) {
  var expected = getApiToken_();
  var given = String(token || '');
  if (given.length !== expected.length) return false;
  var diff = 0;
  for (var i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ given.charCodeAt(i);
  }
  return diff === 0;
}

function cell_(row, i) {
  return i > -1 && row[i] != null ? String(row[i]).trim() : '';
}

function normalizeSlug_(value) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function toTemplateId_(value) {
  var n = parseInt(value, 10);
  return n >= 1 && n <= 5 ? n : 1;
}

/**
 * extra_data admite:
 *   - JSON:  {"photo":"https://...","color":"#ff7aa2"}
 *   - Pares: photo=https://...; color=#ff7aa2
 *   - Una URL suelta (se interpreta como foto)
 */
function parseExtraData_(raw) {
  if (!raw) return {};

  if (raw.charAt(0) === '{') {
    try {
      return JSON.parse(raw);
    } catch (err) {
      // cae al parser de pares
    }
  }

  if (/^https?:\/\//i.test(raw) && raw.indexOf(';') === -1) {
    return { photo: raw };
  }

  var out = {};
  raw.split(';').forEach(function (pair) {
    var i = pair.indexOf('=');
    if (i === -1) return;
    var key = pair.slice(0, i).trim();
    var val = pair.slice(i + 1).trim();
    if (key) out[key] = val;
  });
  return out;
}

function sanitizeCallback_(cb) {
  return cb && /^[A-Za-z_$][\w$]{0,63}$/.test(cb) ? cb : null;
}

function respond_(payload, callback) {
  var json = JSON.stringify(payload);

  if (callback) {
    return ContentService.createTextOutput(callback + '(' + json + ');').setMimeType(
      ContentService.MimeType.JAVASCRIPT
    );
  }

  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

/* ------------------------------------------------------------------ */
/*  Utilidades para el editor (ejecutar manualmente)                   */
/* ------------------------------------------------------------------ */

/** Crea la hoja con encabezados y una fila de ejemplo por plantilla. */
function setupSheet() {
  var ss = SPREADSHEET_ID ? SpreadsheetApp.openById(SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

  sheet.clear();
  sheet.appendRow(REQUIRED_COLUMNS);
  sheet.appendRow(['juan-maria', 1, 'Juan', 'María', 'Contigo aprendí que el silencio también puede ser un hogar.', '']);
  sheet.appendRow(['flor-de-abril', 2, 'Andrés', 'Sofía', 'Floreces en todo lo que tocas, y yo contigo.', '{"color":"#f9a8c9"}']);
  sheet.appendRow(['nuestro-verano', 3, 'Leo', 'Valen', 'Este fue el día en que supe que eras tú.', '{"photo":"https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=900","date":"14 · 02 · 2025"}']);
  sheet.appendRow(['baby-galaxia', 4, 'Kevin', 'Dani', 'En un universo de millones, siempre te elijo a ti.', '{"color":"#a855f7"}']);
  sheet.appendRow(['boom-amor', 5, 'Pau', 'Nico', '¡Te quiero más que ayer y menos que mañana!', '']);
  sheet.setFrozenRows(1);
}

/** Prueba rápida desde el editor: Ver → Registros. */
function testDoGet() {
  var ok = doGet({ parameter: { slug: 'juan-maria', token: getApiToken_() } });
  console.log(ok.getContent());

  var denied = doGet({ parameter: { slug: 'juan-maria', token: 'incorrecto' } });
  console.log(denied.getContent()); // → UNAUTHORIZED
}

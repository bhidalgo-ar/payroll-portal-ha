# Reporte de capturas del portal

## Métodos
- Server: `http-server -p 8899 /home/user/payroll-portal-ha` (200 en index.html/apps.json). No se modificó nada del repo (`git status` limpio).
- React: SÍ hizo falta. Sin interceptar, queda en `[bundle] error` (unpkg.com bloqueado: ERR_TUNNEL_CONNECTION_FAILED). Las URLs están dentro del template (el grep del brief sobre index.html crudo no las encuentra): `https://unpkg.com/react@18.3.1/umd/react.production.min.js` y `https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js`. Se sirvieron con `page.route` desde `node_modules` (react/react-dom 18.3.1, `npm install` en la carpeta de capturas).
- Fecha: `page.clock.setFixedTime(2026-10-01T10:30:00-03:00)` + `timezoneId America/Argentina/Buenos_Aires`, `locale es-AR`. Verificado: `new Date()` = Thu Oct 01 2026 10:30:00 GMT-0300. (Fecha fija: los timers siguen corriendo.)
- Espera: networkidle + 1500 ms antes de cada captura. Playwright 1.56.1, Chromium de /opt/pw-browsers.

## Capturas (todas salieron; todas con el portal renderizado completo)
| Archivo | Tamaño px |
|---|---|
| desktop-1440-full.png | 1440x2342 |
| desktop-1440-fold.png | 1440x900 |
| laptop-1280-full.png | 1280x2342 |
| tablet-820-full.png | 820x2599 |
| mobile-390-full.png | 1142x10690 (= 571x5345 CSS a dpr 2; ver nota) |
| mobile-390-fold.png | 780x1688 (390x844 CSS a dpr 2) |
| desktop-hover-fila.png | 1440x900, mouse sobre fila 01 SIRADIG Engine |
| desktop-focus-tab.png | 1440x900, después de 3 Tab; activeElement = `<a>` fila 01, outline `rgb(16,16,16) auto 1px` |

Nota mobile: con isMobile el layout viewport quedó en 586 CSS px (no 390). En un contexto no móvil de 390 el `scrollWidth` es 608 (> 390): hay overflow horizontal; elementos con right=421-423 (DIV, SPAN, BUTTON, IFRAME; el iframe del bloque de música llega a 423). Por eso la captura mobile full es más ancha que 780.

## Alturas de página (scrollHeight, CSS px)
- 1440x900: 2342
- 1280x720: 2342
- 820x1180: 2599
- 390x844 (mobile, dpr 2): 5345

## Qué se ve renderizado (desktop)
- Apps: SÍ, 10 filas (01 a 10), con chips PRODUCTIVO/BETA/ACTUALIZADO. Salen de apps.json por el fallback relativo (ver errores).
- Eventos/vencimientos: NO hay bloque con texto "Vencimiento", "Próximos" ni "Evento" (los 4 devuelven null). Lo único relacionado son los chips del hero: "Cierre de nómina: en 24 días (25 oct)" y "Pago a empleados: 6 oct (en 5 días)". Además el portal no pidió eventos.json en ninguna request registrada. eventos.json trae vencimientos de abr-may 2026 en adelante (leí solo el comienzo).
- Cumpleaños: bloque presente, texto "Sin cumpleaños este mes 🎈" (cumpleanios.json se pidió por github.io, falló, ver abajo; no confirmé si el fallback relativo lo cargó).
- Frase: "La resiliencia se forja en las llamas de la adversidad. — ANÓNIMO". Bloque de música (iframe YouTube) vacío. Footer: "Catálogo v1.6 · actualizado 2026-09-30".

## Errores de consola / requests fallidas (por viewport se repiten igual; conteo en los 4 viewports)
- `https://unpkg.com/react...` y `react-dom...`: ERR_TUNNEL_CONNECTION_FAILED (solo en la corrida sin interceptar; resuelto con page.route).
- `https://bhidalgo-ar.github.io/payroll-portal-ha/{apps,cumpleanios,frases}.json?_t=...`: ERR_TUNNEL_CONNECTION_FAILED (x1 cada uno por viewport). El portal cae al fallback relativo.
- `https://api.github.com/repos/bhidalgo-ar/...commits?...` (11 por viewport: 6 de payroll-portal-ha, validadorrecibos, Controles-Varios, migrador-meta4-axton, controles-contables): ERR_CERT_AUTHORITY_INVALID. La API de GitHub FALLÓ: el Chromium no confía en el CA del proxy. Las fechas de commit de la API no se usaron; "actualizado" sale de apps.json.
- `https://api.rss2json.com/v1/api.json?...` (iprofesional y ambito): ERR_TUNNEL_CONNECTION_FAILED (noticias no cargan; no se ven en la página).
- `https://www.youtube.com/embed/videoseries?...`: ERR_TUNNEL_CONNECTION_FAILED (iframe vacío).
- `http://localhost:8899/%7B%7B%20musicSrc%20%7D%7D` (literal `{{ musicSrc }}`): 404. Es un bug del propio template: un src sin resolver pide esa URL.
- 1 `pageerror` solo en la corrida sin React. Con React: sin pageerror.

## Fuentes computadas (desktop)
- body: "Plus Jakarta Sans", system-ui, sans-serif; 16px; line-height normal.
- h1 ("Buen día, equipo Payroll."): "DM Serif Display", Georgia, serif; 64px / 67.84px.
- Título de app (en mi script salió el número "01": "DM Serif Display" 30px/30px). El nombre de la app ("SIRADIG Engine") no se midió por separado.
- Descripción de app: Plus Jakarta Sans 12.5px / 18.75px.
- Headings: H1 "Buen día, equipo Payroll."; H2 "APPS INTERNAS", "PRIVACIDAD Y USO DE IA", "CUMPLEAÑOS", "ESPACIO DEL EQUIPO". No hay h3/h4.
- document.title: vacío (""); lang del html: vacío (""). Imágenes: solo 2 `<img>` (blob: 252x252), sin bytes por resource timing (blob). Detalle en dom-resumen.json.

## Archivos
dom-resumen.json (todo el DOM extraído), cap.js (script), sw.js (chequeo de ancho).

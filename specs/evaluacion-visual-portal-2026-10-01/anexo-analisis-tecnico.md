# Análisis técnico del portal `index.html`, Portal Payroll H&A

Fecha del análisis: 2026-10-01. Modo solo lectura, sin cambios en el repo.
Fuentes:
- `index.html`, 353.227 bytes y 180 líneas.
- Template extraído de la línea 177: `scratchpad/analisis/template_extraido.html`, 1086 líneas. Las referencias `T:nnn` de abajo son líneas de ese archivo.
- Runtime `dc-runtime`, que viene embebido en gzip dentro del manifest. Lo descomprimí en `scratchpad/analisis/runtime.js`. Las referencias `R:nnn` son líneas de ese archivo.
- `apps.json`, `cumpleanios.json`, `eventos.json`, `frases.json`, `git log`.

Para verificar, rendericé la página con Playwright/Chromium: zona `America/Argentina/Buenos_Aires`, reloj fijo en 2026-10-01 10:00 ART (y 2026-10-25), anchos 1280, 768 y 375 px. React vino de npm local. Internet estaba bloqueada salvo localhost. Capturas en `scratchpad/analisis/shot_*.png`, salida en `shot_out.txt`.

---

## 0. Cómo arranca la página (fuera del string JSON)

`index.html` tiene tres bloques `<script type="__bundler/...">`:

| Línea | Bloque | Tamaño | Contenido |
|---|---|---|---|
| 169 | `__bundler/manifest` | 273.068 car. (77 % del archivo) | 14 assets en base64 |
| 173 | `__bundler/ext_resources` | `[]` | vacío |
| 177 | `__bundler/template` | 71.259 car. (20 %) | template HTML como string JSON |

El arrancador (líneas 33‑165) hace esto en orden:
1. Decodifica cada asset con `atob`. Si `entry.compressed`, lo descomprime con `DecompressionStream('gzip')`. Después arma un `blob:` URL.
2. Reemplaza cada UUID del template por su blob URL: `template.split(uuid).join(blobUrls[uuid])`.
3. Quita `integrity` y `crossorigin` del template con regex.
4. Reemplaza el documento entero: `document.documentElement.replaceWith(doc.documentElement)`. Por eso el `<title>Bundled Page</title>` y el SVG de miniatura de afuera se descartan.
5. Recrea los `<script>` para que ejecuten.

El único script del template es el runtime (`T:6 <script src="9ea1e782-…">`). Al ejecutarse:
- `hideRawTemplate()` oculta `x-dc` (`R:1347`).
- `loadReactUmd()` carga React 18.3.1 y ReactDOM desde unpkg con SRI puesto por JS (`R:1343-1370`).
- Evalúa la clase `Component` del bloque `<script type="text/x-dc">` con `new Function(...)` (`R:650`).
- Atributos que interpreta: `style-hover`/`style-focus` se convierten en clases CSS generadas con `insertRule` (`R:1143`). `onclick` pasa a `onClick` según `EVENT_MAP` (`R:281`).

Hay un listener global de errores en fase de captura (líneas 37‑45). Captura también los errores de carga de recursos y los muestra en un cartel rojo `[bundle] …`.

---

## 1. Estructura de pantalla

El orden es el del DOM. Todo está dentro de `<div data-screen-label="Portal Payroll">` (`T:332`).

| # | Bloque | Líneas | Qué muestra | Origen del dato |
|---|---|---|---|---|
| 1 | **Topbar** `<header>` sticky | T:335‑352 | Logo PNG 34 px (`alt="H&A"`), "Hidalgo & Asociados" / "PORTAL PAYROLL", botón "Buscar apps · Ctrl K", botón de tema ☾/☀, círculo de iniciales (`PY` por defecto) | hardcodeado + `localStorage.hyaPortalName` |
| 2 | **Masthead** | T:357‑385 | Cejilla "Portal interno · Equipo Payroll". H1 "Buen día/Buenas tardes/Buenas noches, *nombre*." (el nombre se edita con clic). Línea con fecha larga, "Cierre de nómina: …" y "Pago a empleados: …". Bloque decorativo con mes/año, día en 92 px y día de la semana | reloj del navegador (ver §2) |
| 3 | **Apps internas** | T:388‑419 | Encabezado con contador "N herramientas" y el texto fijo "● Sincronizado con el repositorio". Una fila `<a>` por app: número editorial, emoji, nombre, descripción, chips, línea `vX · Categoría · actualizado …`, flecha → | `apps.json` |
| 4 | **Privacidad y uso de IA** (acordeón) | T:422‑440 | 3 preguntas y respuestas | hardcodeado en `FAQS` (T:605‑612) |
| 5 | **Cumpleaños** (columna derecha del bloque 4) | T:441‑462 | Lista de cumpleaños del **mes en curso** o "Sin cumpleaños este mes 🎈" | `cumpleanios.json` |
| 6 | **Espacio del equipo** (3 columnas) | T:466‑498 | (a) frase del día con botón "Otra frase →". (b) "Música del equipo": iframe de YouTube o Spotify. (c) tarjeta "Biblioteca del equipo" con link a SharePoint | `frases.json`; URLs hardcodeadas (`MUSIC` T:621, SharePoint T:495) |
| 7 | **Footer** | T:501‑530 | Logo, "Catálogo vX · actualizado … · sincronización automática", 4 links externos (monday.com, ARCA, ANSES, Padrón DGISI) y un texto legal fijo | `apps.json` meta + API de GitHub |
| 8 | **Paleta de comandos** (modal) | T:534‑561 | Búsqueda sobre apps y los 4 links externos; navegación con ↑↓/Enter/Esc | `apps.json` + `EXT_LINKS` (T:614) |
| 9 | **Toast de cumpleaños** + confeti | T:564‑572 | "¡Feliz cumpleaños, X! 🎂" en un pill ámbar, más un `<canvas>` de confeti | `cumpleanios.json` |

**No hay bloque de vencimientos ni de eventos** (ver §2.2). Tampoco hay bloque de noticias: se reemplazó por "Biblioteca" en el commit `b9cfc0f` del 2026‑07‑23, pero la carga de noticias sigue corriendo (ver §6).

### Responsive

- **El template no declara ningún `@media`.** `grep -c '@media'` sobre el template da 0. El único `@media` es `@media print` del runtime (`R:101`).
- Todo el layout está en estilos inline con valores fijos:
  - topbar y main: `padding:14px 40px` / `0 40px`, `max-width:1140px` (T:336, T:354);
  - masthead: `display:flex` con hero de ancho fijo `width:230px; height:210px` (T:373);
  - fila de app: `grid-template-columns:64px 1fr auto 48px; gap:22px` (T:397);
  - FAQ + cumpleaños: `grid-template-columns:1.55fr 1fr; gap:56px` (T:422);
  - Espacio del equipo: `grid-template-columns:1.15fr 1fr 1fr; gap:48px` (T:471).
- Los únicos elementos fluidos son el H1 (`font-size:clamp(40px, 5.4vw, 64px)`, T:360) y los `flex-wrap:wrap` de la línea de fechas (T:367) y del footer (T:502, T:510).
- Lo que medí:
  - **1280 px**: sin desborde.
  - **768 px**: sin desborde horizontal (`scrollWidth 768`); las tres columnas del Espacio del equipo quedan angostas ("Música / del / equipo" se parte en 3 renglones).
  - **375 px**: `scrollWidth 584` contra `clientWidth 375`, o sea **209 px de scroll horizontal**. El "01" del hero se encima con el H1. La columna de nombre y descripción de las apps queda de 1‑2 palabras por renglón y los chips se superponen con la descripción. Captura: `shot_mobile.png`.

---

## 2. Lógica de fechas

### 2.1 Cómo se calcula "hoy"

- Siempre con `new Date()` / `Date.now()` del navegador, en **hora local del equipo del usuario**. No fija ninguna zona horaria, ni Argentina ni UTC, y no usa `Intl` ni `timeZone`.
  - Estado inicial `now: new Date()` (T:598).
  - Se actualiza cada 60 s: `this.clock = setInterval(() => this.setState({ now: new Date() }), 60000);` (T:636).
- La medianoche local se calcula así: `const todayMid = new Date(now.getFullYear(), now.getMonth(), now.getDate());` (T:875).
- Los cálculos de "días desde" (`diasDesde`, `relDate`, T:745‑761) **comparan `Date.now()` contra `new Date('AAAA-MM-DD')`**. JavaScript interpreta un ISO de solo fecha **como medianoche UTC**, así que en UTC‑3 cada fecha del catálogo equivale a las 21:00 del día anterior en hora local. Consecuencias, verificadas con Node en TZ `America/Argentina/Buenos_Aires`:
  - `relDate` muestra la fecha absoluta **un día antes** de la real cuando `d ≥ 30`: usa `dt.getDate()` local sobre una fecha parseada en UTC (T:758‑760). `new Date('2026-04-28').getDate()` da `27`. En pantalla hoy se lee "v2.5.2 · Reportes · actualizado **27 abr 2026**" cuando `apps.json` dice `2026-04-28`. Lo mismo pasa con todas las apps de más de 30 días: 17 jun (es 18), 15 abr (16), 3 ago (4), 6 ago (7), 9 ago (10).
  - El texto relativo también se corre: el 2026‑09‑30 a las 22:00 ART, una app con `actualizado: "2026-09-30"` muestra "actualizado **ayer**".
  - La ventana de chips (`diasDesde <= ventana`) se cierra a las 21:00 ART del séptimo día y no a medianoche.

### 2.2 Eventos y vencimientos (`eventos.json`)

- **`eventos.json` no se lee.** `loadData()` pide solo tres archivos:
  ```js
  const [appsData, cumple, frases] = await Promise.all([
    get('apps.json'), get('cumpleanios.json'), get('frases.json'),
  ]);                                                    // T:661-663
  ```
  No hay ninguna referencia a "eventos" en el template (`grep` da 0), ni plantilla para `urgente`, `tipo` o `sub`. `--urgent` y `--urgent-dim` están declaradas en `:root` (T:310) y se usan 0 veces.
- Historial (`git log -S'eventos.json' -- index.html`): el `index.html` de `187ff7c` (2026‑04‑10) lo referenciaba 2 veces y el de `5352e9f` (2026‑05‑19), 1 vez. Desde `49b94b3` (2026‑06‑11) lo referencia 0 veces.
- **Respuesta al caso pedido:** hoy (2026‑10‑01) el usuario **no ve ningún evento ni vencimiento de `eventos.json`**, ni pasado ni futuro. Que el archivo tenga solo fechas de abr/may 2026 no se nota en pantalla: es un archivo muerto. No aplica filtrar, ordenar, "faltan X días" ni `urgente`, porque ese código no existe.
- Los únicos "vencimientos" visibles están **hardcodeados** en la línea del masthead (T:369‑370):
  - **Cierre de nómina = día 25 de cada mes**:
    ```js
    let cierre = new Date(now.getFullYear(), now.getMonth(), 25);
    if (cierre <= todayMid) cierre.setMonth(cierre.getMonth() + 1);
    const dCierre = Math.max(0, Math.ceil((cierre - todayMid) / 86400000));
    const cierreLabel = dCierre === 0 ? '¡hoy!' : 'en ' + dCierre + ' días (' + …   // T:876-879
    ```
    El `<=` hace que **"¡hoy!" no pueda aparecer nunca**: el día 25, `cierre == todayMid`, salta al mes siguiente. Render del 2026‑10‑25: "Cierre de nómina: en 31 días (25 nov)". No ajusta si el 25 cae fin de semana (el 2026‑10‑25 es domingo).
  - **Pago a empleados = 4.º día hábil del mes**. Hábil quiere decir lunes a viernes, sin feriados:
    ```js
    getFourthBizDay(y, m) { … if (dow !== 0 && dow !== 6) { c++; if (c === 4) return dt; } … }   // T:846-854
    if (todayMid > pago) pago = this.getFourthBizDay(/* mes siguiente, con cambio de año */);  // T:881
    const pagoLabel = dPago <= 0 ? '¡hoy!' : pago.getDate() + ' ' + lm[…] + ' (en ' + dPago + ' días)';
    ```
    Aquí sí aparece "¡hoy!" (el día de pago, `>` estricto). El cambio de año está contemplado. **Los feriados no se consideran.** Ejemplo: enero 2027 da 6 ene porque cuenta el 1/1 (viernes) como hábil.
  - Render del 2026‑10‑01: "Cierre de nómina: en 24 días (25 oct)" · "Pago a empleados: 6 oct (en 5 días)".

### 2.3 Cumpleaños (`cumpleanios.json`, "MM-DD")

- **No se calcula "el próximo cumpleaños".** Se muestran solo los del **mes calendario actual**, ordenados por string, **incluidos los que ya pasaron este mes** (no se marcan de ninguna forma):
  ```js
  const monthStr = String(now.getMonth() + 1).padStart(2, '0');
  const thisMonth = s.bdays.filter(b => b.fecha && b.fecha.startsWith(monthStr))
                           .sort((a, b) => a.fecha.localeCompare(b.fecha));       // T:949-959
  ```
- No hay lógica de cambio de año porque nunca mira más allá del mes en curso.
- Cada fila muestra `iniciales` (del JSON), el nombre y `area · D de <mes>`, o `area · ¡Hoy!` con el chip ámbar "HOY 🎂" pulsante (T:458).
- El color del avatar **no usa `color` del JSON**: lo calcula un hash del nombre sobre la paleta `AV` (T:951‑956). El campo `color` del JSON se ignora.
- Contador: `bdayCountLabel = N + ' en ' + mes` (T:976).
- Vacío: `bdayEmpty = s.bdays.length > 0 && thisMonth.length === 0` (T:975). Si el fetch falla, `bdays` queda `[]` y no aparece ni el mensaje vacío: el bloque queda solo con el título.
- Toast y confeti: `checkTodayBirthdays()` corre **una sola vez** al terminar la carga (T:675) y compara `b.fecha === MM-DD` local (T:764‑775). Si la pestaña queda abierta y cambia el día, no se dispara.
- Con los datos actuales (7 personas con fechas solo en 04, 05 y 06), **de julio a marzo el bloque muestra "Sin cumpleaños este mes 🎈"**. Así se ve hoy, 2026‑10‑01 (captura desktop).
- No hay manejo de "02-29" en años no bisiestos (no está en los datos).

### 2.4 Chips NUEVO / ACTUALIZADO

```js
const ventana = s.appsMeta.diasReciente || this.DIAS_RECIENTE;          // T:886; DIAS_RECIENTE = 7 (T:603)
const fechaRef = a.actualizado || commit || '';                          // T:897
const esNuevo = diasAlta !== null && diasAlta <= ventana;                // diasAlta = diasDesde(a.agregado)
const esReciente = !esNuevo && diasUpd !== null && diasUpd <= ventana;   // diasUpd = diasDesde(fechaRef)
```

- Los dos chips son excluyentes. NUEVO tiene prioridad y la etiqueta sale de `esNuevo ? 'Nuevo' : 'Actualizado'`.
- Si alguno aplica, el número editorial se pinta de `var(--green)` (T:921).
- `diasDesde` usa `Math.floor` sobre UTC (ver §2.1), así que el chip dura los días 0..7 inclusive (8 días calendario) y vence a las 21:00 ART.
- Si una fecha está en el futuro, da negativo y cumple `<= ventana`: la app aparecería como NUEVO.
- Si `diasReciente: 0`, el `||` lo convierte en 7.
- **Fallback a GitHub:**
  - `fetchCommitDates()` (T:691‑714) llama a `https://api.github.com/repos/{repo}/commits?path={path}&per_page=1`, una vez por app y una más para `apps.json`. Son **11 requests** sin autenticar (observados en el render).
  - Guarda `commit.committer.date` y cachea en `localStorage.hyaPortalCommits2` por 6 h.
  - Si la respuesta no es `ok` (403 por rate limit, 404, red), hace `if (!r.ok) return;` y no avisa nada.
  - Si **ninguna** respuesta funcionó, no se guarda caché y se reintentan las 11 en la carga siguiente.
  - Hoy las 10 apps tienen `actualizado`, así que **la fecha de commit no se usa para ningún chip**. Las 10 requests de apps no tienen efecto visible.
  - [NO VERIFICABLE desde el código: el límite de 60 requests/hora por IP de la API anónima de GitHub es documentación externa. Con 11 requests por carga sin caché, una IP compartida de oficina lo alcanzaría con unas 5 cargas en frío por hora.]
- Estado al 2026‑10‑01: solo **06 "Cómo usar Claude"** lleva ACTUALIZADO (`actualizado: 2026-09-30`). SIRADIG Engine (`2026-09-22`, 9 días) ya no tiene chip. Ninguna app lleva NUEVO.

### 2.5 Otras fechas

- **Saludo** (T:866‑868): `h < 12 'Buen día'`, `h < 19 'Buenas tardes'`, el resto `'Buenas noches'`. De 00:00 a 05:59 dice "Buen día".
- **Fecha larga** `dias[getDay()] + ' ' + getDate() + ' de ' + meses[getMonth()]`, sin año (T:874). **Hero**: `heroMonthYear` ("OCT 2026"), `heroDay` ("01"), `heroWday` ("JUEVES") (T:1037‑1039). Los nombres de meses y días están en arrays hardcodeados en español.
- **Footer** (T:1013‑1015):
  ```js
  const metaDate = appsJsonCommit ? this.relDate(appsJsonCommit) : (s.appsMeta.ultimaActualizacion || '');
  ```
  Prioriza **la fecha del último commit de `apps.json`**, cualquiera sea el commit, por encima de `meta.ultimaActualizacion`. Si la API falla, muestra el ISO crudo: el render dice "Catálogo v1.6 · actualizado **2026-09-30** · sincronización automática". Con API funcionando diría algo como "ayer" o "hace N días". El formato del footer depende del éxito de la API.
- `meta.ultimaRevision`, `meta.titulo`, `meta.subtitulo` y `meta.repoDefecto` **no se usan** en el portal (solo se leen `version`, `ultimaActualizacion` y `diasReciente`).
- `timeAgo()` (T:737) sirve solo a noticias, que ya no se muestran.

### 2.6 Hardcodeado contra datos

| Hardcodeado en `index.html` | Leído de datos |
|---|---|
| Cierre día 25; pago 4.º día hábil (sin feriados); ventana 7 por defecto; caché 6 h; saludos por hora; nombres de meses y días; FAQs; links externos; playlists; URL de SharePoint; "Sincronizado con el repositorio" | `apps.json` (apps, `meta.version`, `meta.ultimaActualizacion`, `meta.diasReciente`); `cumpleanios.json`; `frases.json`; fechas de commit (API de GitHub) |

---

## 3. Catálogo de apps

- **Filtro**: `appsData.apps.filter(a => a.estado !== 'inactivo')` (T:666).
- **Orden**: el de `apps.json`. No hay `sort`.
- **Agrupación**: ninguna. La categoría aparece solo como texto en `metaLine` (`'v' + (a.version || '1.0') + ' · ' + a.categoria + upd`, T:923).
- **Número editorial**: `idx: String(i + 1).padStart(2, '0')` (T:907). Es la **posición** en la lista filtrada, no el `id`: si una app pasa a `inactivo`, las siguientes se renumeran.
- **Estado**: `tag: beta ? 'Beta' : 'Productivo'`, con `beta = a.estado === 'beta'` (T:898, T:909). Cualquier valor distinto de `beta` (incluido ausente o mal escrito) se muestra como **Productivo**.
- **Versión**: `'v' + (a.version || '1.0')`. Si falta, se muestra **v1.0** en lugar de vacío. Respeta el esquema propio (`v16`, `v2.5.2`).
- **Contenido de cada fila** (T:397‑416): número (DM Serif itálica 30 px; gris `--text-3`, o verde si está destacada), ícono emoji 19 px en un cuadrado de 42 px con `--celeste-dim`, nombre 18 px/700 `--ink`, descripción 12.5 px `--text-2`, chips de 10 px/700 en mayúsculas y meta 10.5 px `--text-3`, flecha → de 40 px.
- **Chips** (`chipBase`, T:887‑891: radio 9999 px, padding 3 px 11 px, 10 px, 700, uppercase):

| Chip | Fondo | Texto |
|---|---|---|
| Productivo | `--celeste-dim` rgba(0,172,212,.10) | `--celeste` #00ACD4 |
| Beta | `--amber-dim` rgba(245,158,11,.12) | `--amber` #F59E0B |
| Nuevo / Actualizado | `--green-dim` rgba(34,197,94,.10) | `--green` #22C55E |

- Al hacer hover sobre la fila: `background:var(--celeste-dim); transform:translateX(6px)` (T:397).
- Cada fila es un `<a target="_blank" rel="noopener">`.
- Si `apps.json` falla en las dos URLs, la lista queda vacía y el contador vacío. No hay mensaje de error y el texto "Sincronizado con el repositorio" sigue visible.

---

## 4. Sistema visual

### Paleta `:root` (T:302‑313) y modo oscuro `:root[data-theme="dark"]` (T:314‑321)

| Variable | Claro | Oscuro | Usos en el template |
|---|---|---|---|
| `--bg` | #FFFFFF | #0F2133 | 3 |
| `--bg-soft` | #F4F7FA | #15293F | 2 |
| `--surface` | #FFFFFF | #16293F | 4 |
| `--ink` | #0F2133 | #FFFFFF | 8 |
| `--text-1` | #1E3A5F | #E8EEF5 | 11 |
| `--text-2` | #4A6080 | #9FB1C7 | 6 |
| `--text-3` | #8FA3BA | #5F7691 | **21** |
| `--line` / `--line-soft` | #DDE5EF / #EEF3F8 | rgba(255,255,255,.12/.07) | 15 / 12 |
| `--celeste` / `--celeste-dark` | #00ACD4 / #0090B4 | (igual) | **25** / 1 |
| `--celeste-dim` / `--celeste-border` | rgba(0,172,212,.10/.30) | .15/.40 | 6 / 9 |
| `--amber` / `--amber-dim` | #F59E0B / rgba(…,.12) | (igual) | 2 / 1 |
| `--green` / `--green-dim` | #22C55E / rgba(…,.10) | (igual) | 4 / 1 |
| `--urgent` / `--urgent-dim` | #E85518 / rgba(…,.10) | (igual) | **0** / 0 |
| `--sh-sm` / `--sh` / `--sh-lg` | sombras en tono #1E3A5F, alfa .07/.10/.15 | negras .30/.35/.50 | 5 / **0** / 1 |
| `--topbar-bg` | rgba(255,255,255,.82) | rgba(15,33,51,.82) | 1 |

Colores hardcodeados fuera de las variables:
- `#1E3A5F` en el fondo de la Biblioteca (T:491).
- `#18B7E8` y `#149BC9` en el botón "Abrir biblioteca" (T:495).
- `white` sobre ámbar en "HOY" y el toast (T:458, T:566).
- Paleta de avatares `AV` (T:951).
- Colores de los logos externos (#6161FF, #003A8C, #00843D, #1A6B3C).

El gris cálido de marca `#8C837B` (CLAUDE.md §8) **no aparece** en el template; los grises son azulados.

### Tipografía

- Fuentes embebidas como woff2 en el manifest:
  - **Plus Jakarta Sans**, cuerpo (`body`, T:323). Declarada en pesos 300/400/500/600/700/800 normal y 400 itálica, todos apuntando al mismo archivo variable.
  - **DM Serif Display** 400 normal e itálica, para el H1, el día del hero, la frase y los números editoriales.
- Pesos usados en el template: 700 ×20, 600 ×12, 300 ×2, 400 ×1. El 800 se declara y no se usa.
- Tamaños inline (px, ocurrencias): 9.5 ×2, 10 ×4(+1), 10.5 ×6(+1), 11 ×10, 11.5 ×2, 12 ×6(+2), 12.5 ×5, 13 ×6, 13.5 ×3, 14 ×3, 15 ×4, 16 ×2, 18, 19, 24, 30, 64, 92, más el H1 con `clamp(40px,5.4vw,64px)`. **Hay 24 ocurrencias de texto de 11 px o menos.** Incluyen los títulos de sección `<h2>`, que son de 11 px (T:390, 425, 443, 468).
- Espaciado entre letras: títulos en mayúsculas con `letter-spacing` de .12 a .16 em.

### Espaciados, radios y sombras

- Espaciados verticales entre secciones: 76/60 px en el masthead y `margin-top:84px` ×2 / `96px` en el footer.
- Gaps frecuentes: 14 px ×6, 6 px ×5, 9 px ×4.
- Radios: `9999px` ×11 (pills), 14 px ×3, 7 px ×4, 5 px ×2, más 10/12/20/3 px.
- Sombras: casi solo `--sh-sm`; `--sh-lg` en la paleta modal.

### Modo oscuro

- Existe solo como **toggle manual**: botón ☾/☀, atributo `data-theme` en `<html>`, persistido en `localStorage.hyaPortalTheme` (T:628‑633, T:645‑647, T:1020‑1024). **No hay `prefers-color-scheme`** (`grep` da 0).
- El estado inicial es `theme: 'light'` y el tema guardado se aplica en `componentDidMount`. Para quien usa oscuro, hay un primer render en claro antes de aplicarlo [NO VERIFICABLE a simple vista: depende del tiempo de montaje].

### Contraste WCAG 2.x

Calculado con la fórmula de luminancia relativa. Los fondos con alfa están compuestos sobre el fondo real.

| # | Texto / fondo | Dónde se usa | Ratio | AA texto normal (4.5) | AA grande (3.0) |
|---|---|---|---|---|---|
| 1 | `--text-3` #8FA3BA / #FFFFFF | 21 usos: contadores, meta de apps ("v2.2 · Nómina · …"), footer, "Buscar apps", flecha, fecha de cumpleaños | **2.59** | falla | falla |
| 2 | `--celeste` #00ACD4 / #FFFFFF | 25 usos: títulos de sección h2 de 11 px, cejilla, "PORTAL PAYROLL" de 9.5 px, nombre del H1, autor de la frase | **2.67** | falla | falla |
| 3 | #FFFFFF / `--celeste` #00ACD4 | botón "Guardar", segmento activo YouTube/Spotify, chevron FAQ abierto | **2.67** | falla | falla |
| 4 | `--celeste` / `--celeste-dim` sobre blanco | chip PRODUCTIVO (10 px) | **2.43** | falla | falla |
| 5 | `--amber` #F59E0B / `--amber-dim` sobre blanco | chip BETA (10 px) | **1.96** | falla | falla |
| 6 | `--green` #22C55E / `--green-dim` sobre blanco | chip NUEVO/ACTUALIZADO (10 px) | **2.09** | falla | falla |
| 7 | `--text-2` #4A6080 / #FFFFFF | descripciones de apps, respuestas de FAQ | 6.41 | pasa | pasa |
| 8 | `--text-1` #1E3A5F / #FFFFFF | preguntas de FAQ, nombres de cumpleaños | 11.50 | pasa | pasa |

Otros pares que medí:
- Claro:
  - #FFFFFF / #F59E0B (chip HOY): 2.15
  - #FFFFFF / #FBBF24 (extremo claro del toast): 1.67
  - #FFFFFF / #18B7E8 ("Abrir biblioteca"): 2.34
  - `--green` / #FFFFFF (número destacado de 30 px): 2.28
  - `--text-3` / `--bg-soft` ("Buscar apps"): 2.41
  - rgba(255,255,255,.55) / #1E3A5F ("INFORMACIÓN LEGAL INTERNA", 10 px): 4.66
- Oscuro:
  - `--text-3` #5F7691 / #0F2133: **3.49** (falla AA normal)
  - `--text-2`: 7.46
  - celeste: 6.11
  - chip beta: 6.25
  - chip verde: 6.07
  - `--text-1` sobre surface: 12.63

---

## 5. Accesibilidad y semántica

- **`lang`**: el `<html>` del template no tiene `lang` (T:2: `<html><head>`), y es el que queda después de `replaceWith`. El render da `document.documentElement.lang === ""`.
- **`<title>`**: el template no tiene `<title>` (`grep -c '<title'` da 0). El render da `document.title === ""`, así que la pestaña muestra la URL. El `<title>Bundled Page</title>` externo se descarta.
- **Headings**:
  - un `<h1>` (saludo) y cuatro `<h2>` de 11 px en mayúsculas: Apps internas, Privacidad y uso de IA, Cumpleaños, Espacio del equipo;
  - no hay `h3`;
  - los nombres de app, el título de la Biblioteca y "Música del equipo" son `<span>`;
  - el footer y la paleta no tienen heading.
- **Landmarks**:
  - hay `<header>` (T:335), `<main>` (T:354) y `<section>` (sin `aria-label`, solo `data-screen-label`);
  - **`<footer>` está dentro de `<main>`** (T:501 dentro de T:354‑531), así que no funciona como landmark `contentinfo`;
  - no hay `<nav>`.
- **Imágenes**:
  - los dos `<img>` del logo tienen `alt="H&A"` (T:338, T:504);
  - los SVG decorativos no tienen `aria-hidden`;
  - **el `<iframe>` de música no tiene `title`** (T:488).
- **Emojis como contenido**: los íconos de apps y FAQ, "HOY 🎂", "🎈", "🎉" y las flechas "→"/"▾" son texto plano sin `aria-hidden` ni `aria-label`, así que los lectores de pantalla los leen.
- **Botón de tema**: su único contenido es el glifo ☾/☀ más `title="Cambiar tema"`, sin `aria-label`.
- **Controles que no se operan con teclado**:
  - FAQ: `<div onclick=… role="button" tabindex="0">` (T:430) **sin `onkeydown`**, así que Enter/Espacio no lo abren. No tiene `aria-expanded`. La respuesta se oculta con `maxHeight:'0px'; overflow:hidden` (T:941‑944) y no con `display:none`/`hidden`, por lo que el texto sigue en el árbol de accesibilidad (el `innerText` del render incluye las respuestas cerradas).
  - Editar el nombre: `<span onclick=…>` (T:360) sin `tabindex` ni rol, inalcanzable con teclado.
  - Cerrar el toast: `<span onclick=…>✕</span>` (T:569), inalcanzable con teclado.
- **Paleta modal**: sin `role="dialog"` ni `aria-modal`, sin trampa de foco, sin roles listbox/option. Esc/↑↓/Enter funcionan por listener global (T:823‑843). `Ctrl/Cmd+K` hace `preventDefault()` global.
- **Foco visible**:
  - no hay reset global de `outline` (ni en el template ni en `BASE_CSS`), así que links y botones conservan el outline del navegador;
  - el input del nombre usa `outline:none` reemplazado por `style-focus` con box‑shadow (T:363);
  - **el input de la paleta tiene `outline:none; border:none` sin reemplazo** (T:539). Igual recibe autofoco.
- **Targets**:
  - botón de tema y avatar: 36×36;
  - fila de app: target grande;
  - botones YouTube/Spotify: `padding:5px 13px` + 10.5 px, unos 24‑25 px de alto [NO VERIFICABLE exacto sin medir el box: está al límite de 24 px de WCAG 2.5.8];
  - "✕" del toast: span inline de 15 px, menor que 24×24.
- **Movimiento**: el chip "HOY" tiene `animation:pulseDot 1.6s … infinite` y hay confeti de 220 frames. **No hay `prefers-reduced-motion`.**
- **Texto chico**: 24 ocurrencias de 11 px o menos (§4), incluidos los h2 y los chips de estado.

---

## 6. Dependencias externas y riesgos

| Recurso | Dónde | Si falla |
|---|---|---|
| React y ReactDOM 18.3.1 desde **unpkg.com** con SRI | `R:1343-1370` | `loadReactUmd()` rechaza: `console.error("[dc] failed to load React or boot")` y `throw`. El listener de captura muestra `[bundle] error` abajo. `x-dc` ya está oculto y la página queda **en blanco** (además, la miniatura del bundle desapareció con `replaceWith`) |
| Babel standalone (unpkg) | `R:917`, `ensureBabel` | Solo se carga si hay `text/babel` o imports; este template no lo dispara (no aparece en las requests del render) |
| `https://bhidalgo-ar.github.io/payroll-portal-ha/{apps,cumpleanios,frases}.json?_t=<ts>` | T:652‑660 | Fallback a `./archivo`. Si fallan los dos: apps vacías sin mensaje, frase "Cargando frase del día…" para siempre, cumpleaños vacíos sin mensaje. El `?_t=` anula la caché HTTP en cada carga. Al servir desde otro origen (pruebas locales), **lee primero los datos de producción** |
| API GitHub `api.github.com/repos/*/commits` ×11 | T:691‑714 | Falla silenciosa; sin caché, reintenta en cada carga; el footer pasa al ISO crudo (§2.5) |
| **api.rss2json.com** ×2 (feeds de iProfesional y Ámbito) | `fetchNews`, T:716‑735, llamado en T:678 | Corre en cada carga, pero **el template ya no tiene bloque de noticias** (`newsRows` solo existe en `renderVals`, T:984‑986 y T:1055; se quitó en `b9cfc0f`, 2026‑07‑23). Son requests a un tercero sin uso visible, que le exponen IP y origen del visitante |
| Iframe YouTube / Spotify (`loading="lazy"`) | T:488, T:621 | Iframe vacío (así queda en el render con red bloqueada) |
| `<link rel="preconnect" href="https://fonts.googleapis.com">` | T:11 | Conexión innecesaria: las fuentes ya están embebidas |
| Iframe con `src="{{ musicSrc }}"` literal | T:488 | Antes de que React renderice, el HTML crudo de `x-dc` ya está en el DOM y el navegador **pide la URL literal** `.../%7B%7B%20musicSrc%20%7D%7D`. Responde 404 en cada carga (observado en el render) |
| Links: SharePoint, monday, afip, anses, padrón | T:495, T:511‑526 | Solo navegación |

### Peso de `index.html`: 353.227 bytes

- Manifest (línea 169): 273.068 caracteres de base64:
  - **Fuentes woff2: 212.680 caracteres de b64** (unos 160 KB reales, 12 archivos y **60 % del archivo**). Dentro de eso, los subsets **cyrillic-ext y vietnamese** de Plus Jakarta Sans suman 20.600 caracteres (`394b30c1`, `04e068ce`, `5097464b`, `9c7eabcf`).
  - **Logo PNG de 252×252: 40.740 caracteres de b64** (30.553 bytes), que se muestra a 34 px y 30 px (T:338, T:504).
  - Runtime JS en gzip: 18.384 caracteres de b64 (50.015 bytes descomprimido).
- Template (línea 177): 71.259 caracteres, con **un favicon PNG en data URI de unos 9.020 caracteres** (T:5), el CSS `@font-face` y la lógica.
- El arrancador y el HTML externo suman unos 8,9 KB.

### `image2.jpg` (1.250.523 bytes, 2669×1503)

**No se usa.** `grep -r image2` en el repo (sin `.git`) da 0 coincidencias. En el historial, el `index.html` de `5352e9f` (2026‑05‑19) lo referenciaba 2 veces y desde `49b94b3` (2026‑06‑11) 0 veces. Es un archivo huérfano publicado en Pages.

---

## 7. Hallazgos

| # | Hallazgo | Evidencia | Severidad | Tipo |
|---|---|---|---|---|
| 1 | `eventos.json` no se carga ni se muestra desde el 2026‑06‑11; no existe bloque de vencimientos/eventos y su contenido (abr/may 2026) es invisible | `loadData` T:661‑663 pide solo 3 archivos; `git log -S'eventos.json'` (`49b94b3`) | alta | datos |
| 2 | Las fechas ISO de solo día se parsean como UTC: en Argentina la fecha absoluta del catálogo se muestra un día antes ("27 abr 2026" en lugar de 28‑04, 17 jun en lugar de 18‑06, etc.) | `relDate` T:752‑761, `dt.getDate()` sobre `new Date('2026-04-28')` da 27 (Node TZ ART); render desktop | alta | fechas |
| 3 | Sin `@media`: a 375 px hay 209 px de scroll horizontal, el hero se superpone al H1 y las filas de apps quedan ilegibles | 0 `@media` en el template; grids fijos T:397/422/471; render `scrollWidth 584` | alta | visual |
| 4 | "Cierre de nómina ¡hoy!" es inalcanzable: el día 25 salta al mes siguiente ("en 31 días") | T:877 `if (cierre <= todayMid)`; render del 2026‑10‑25 | media | fechas |
| 5 | Cierre fijo en el día 25 y pago en el 4.º día hábil, hardcodeados; el pago no considera feriados y el cierre no ajusta fines de semana (ej. enero 2027: pago calculado el 6‑01 contando el 1‑01) | T:846‑854, T:876‑883 | media | fechas |
| 6 | Texto relativo y ventana de chips corridos por UTC: entre 21:00 y 24:00 ART una app actualizada hoy figura "ayer"; el chip vence a las 21:00 del 7.º día | `diasDesde`/`relDate` T:745‑761; simulación 2026‑09‑30 22:00 ART | media | fechas |
| 7 | Cumpleaños: solo el mes en curso, incluidos los ya pasados; no hay "próximo cumpleaños"; con los datos actuales el bloque queda vacío de julio a marzo | T:949‑959; `cumpleanios.json` solo tiene meses 04‑06; render "Sin cumpleaños este mes" | media | datos |
| 8 | 11 requests anónimas a la API de GitHub por carga en frío; 10 no tienen efecto visible (todas las apps traen `actualizado`); fallan en silencio y sin caché si todas fallan | T:691‑714, T:897; requests del render | media | performance |
| 9 | Footer: el formato cambia según la API (relativo con éxito, ISO crudo "2026-09-30" si falla) y prioriza el commit de `apps.json` sobre `meta.ultimaActualizacion` | T:1013‑1015; render del footer | baja | fechas |
| 10 | `fetchNews` sigue llamando 2 veces a `api.rss2json.com` aunque el bloque de noticias se quitó | T:678, T:716‑735; sin uso en el template; commit `b9cfc0f` | media | performance |
| 11 | Contrastes bajo AA en los pares más usados: `--text-3`/blanco 2.59, celeste/blanco 2.67, blanco/celeste 2.67, chip Beta 1.96, chip Nuevo 2.09, chip Productivo 2.43, HOY 2.15, "Abrir biblioteca" 2.34 | `:root` T:302‑313; T:495; tabla §4 | alta | accesibilidad |
| 12 | Sin `lang` en `<html>` y sin `<title>` en el template: `document.title` vacío | T:2; 0 `<title>`; render | media | accesibilidad |
| 13 | FAQ con `role="button"` sin manejo de teclado ni `aria-expanded`; editar nombre y cerrar el toast son `<span onclick>` no focuseables | T:430, T:360, T:569 | media | accesibilidad |
| 14 | `<footer>` anidado dentro de `<main>`; sin `<nav>`; h2 de 11 px; nombres de app sin heading | T:354‑531, T:390 | baja | accesibilidad |
| 15 | Iframe de música sin `title`; emojis y glifos sin `aria-hidden`/`aria-label`; botón de tema solo con glifo | T:488, T:349, T:400, T:431 | baja | accesibilidad |
| 16 | Animación infinita (`pulseDot`) y confeti sin `prefers-reduced-motion` | T:328, T:458, T:777 | baja | accesibilidad |
| 17 | Input de la paleta con `outline:none; border:none` sin estilo de foco | T:539 | baja | accesibilidad |
| 18 | 24 ocurrencias de texto ≤ 11 px (mínimo 9.5 px), incluidos chips de estado y h2 | conteo de `font-size` en el template | baja | visual |
| 19 | `image2.jpg` (1,25 MB) huérfano: sin referencias desde el 2026‑06‑11 | `grep -r image2` = 0; historial `5352e9f` y `49b94b3` | baja | performance |
| 20 | Fuentes = 60 % del `index.html` (212.680 caracteres de b64), con 20.600 de subsets cyrillic-ext/vietnamese; logo 252 px embebido para mostrarse a 34 px; favicon de 9 KB aparte | manifest línea 169; T:5, T:338 | baja | performance |
| 21 | Request 404 en cada carga a `{{ musicSrc }}` literal, antes de que React renderice | T:488; request observada `/%7B%7B%20musicSrc%20%7D%7D` | baja | performance |
| 22 | `preconnect` a fonts.googleapis.com sin uso (fuentes embebidas) | T:11 | baja | performance |
| 23 | Cualquier `estado` distinto de `beta` se muestra como "Productivo"; si falta la versión se muestra "v1.0"; el número de fila es la posición, no el `id` | T:898, T:907, T:923 | baja | datos |
| 24 | "● Sincronizado con el repositorio" es texto fijo y sigue visible aunque fallen `apps.json` o la API | T:393 | baja | datos |
| 25 | Si React falla (unpkg bloqueado), la página queda en blanco con un cartel `[bundle] error` | `R:1428`, `index.html` líneas 37‑45 | media | performance |
| 26 | Al probar desde otro origen, los JSON se leen primero de producción (`BASE` absoluto) y no del directorio local | T:652‑660 | baja | datos |
| 27 | El campo `color` de `cumpleanios.json` no se usa (color por hash); `meta.ultimaRevision/titulo/subtitulo/repoDefecto` no se leen | T:951‑956, T:1013‑1015 | baja | datos |
| 28 | Variables declaradas sin uso: `--urgent`, `--urgent-dim`, `--sh`; peso 800 de Plus Jakarta declarado sin uso; el gris cálido de marca #8C837B no aparece | conteo de `var(--…)`; `grep 8C837B` = 0 | baja | visual |
| 29 | Toast de cumpleaños evaluado solo al cargar; no reacciona al cambio de día con la pestaña abierta | T:675, T:764 | baja | fechas |
| 30 | Modo oscuro solo manual (sin `prefers-color-scheme`); en oscuro `--text-3` sobre `--bg` da 3.49 | T:314‑321, T:628‑633 | baja | visual |

---

## Decisiones que tomé

1. **"Hoy" a efectos del render**: el pedido dice 2026‑10‑01. Fijé el reloj a 10:00 ART con zona `America/Argentina/Buenos_Aires`, porque el portal usa la hora local del navegador y el equipo está en Argentina.
2. **"Vencimientos/eventos"**: como `eventos.json` no se usa, describí como vencimientos los dos únicos visibles (cierre y pago, hardcodeados) y respondí el caso pedido con "no ve nada".
3. **"Pares más usados" de contraste**: los elegí por cantidad de usos en el template (`--text-3` 21, `--celeste` 25) y por relevancia funcional (chips de estado). Los chips con alfa los compuse sobre el fondo blanco o `#0F2133`.
4. **Severidad**:
   - "alta": afecta datos o lectura de todos los usuarios en el caso normal (fecha mostrada errónea, eventos invisibles, móvil roto, contraste en los textos principales).
   - "media": afecta en días puntuales o con fallos de red.
   - "baja": el resto.
5. **Tamaños de target y flash del tema**: los marqué [NO VERIFICABLE] donde haría falta medir el box o el timing real.
6. **Datos de personas**: en el informe no transcribí nombres del archivo de cumpleaños; solo meses y cantidades.
7. **El `http-server`** que intenté levantar en el puerto 8899 terminó con código 1 porque el puerto ya estaba ocupado por otro servidor del mismo repo. Usé ese servidor ya existente; no modifiqué nada en el repo.

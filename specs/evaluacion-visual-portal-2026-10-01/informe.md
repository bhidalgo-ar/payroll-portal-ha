# Evaluación visual y funcional del Portal Payroll

Fecha: 2026-10-01. Objeto: `index.html` del portal (no las herramientas que lista).
Método: crítica de diseño sobre capturas reales del portal con la fecha del navegador
fijada al 1/10/2026 (hora Argentina), más lectura completa del template y del JS que
viene dentro del bundle. Cada hallazgo tiene evidencia: una captura de `capturas/` o
una línea del template (`T:nnn`, ver `anexo-analisis-tecnico.md`).

Esto es una evaluación. No se cambió nada del portal. La última sección propone qué
mejorar y en qué orden, para decidir antes de tocar código.

Limitaciones del entorno de prueba: `unpkg.com` está bloqueado, así que React se sirvió
localmente (misma versión, 18.3.1). La API de GitHub falló por el proxy; como todas las
apps traen `actualizado` en `apps.json`, eso no cambia lo que se ve. YouTube y los RSS
también fallaron, por eso el recuadro de música sale vacío.

---

## 1. Resumen: los cinco problemas que importan

1. **Los vencimientos no existen en el portal.** `eventos.json` dejó de leerse el
   2026-06-11 (commit `49b94b3`) y nadie lo notó porque no hay bloque que lo muestre.
   Lo único con fecha es el hero: "Cierre de nómina" fijo el día 25 y "Pago a empleados"
   el 4.º día hábil, los dos calculados en código (`T:876-885`), sin feriados y sin
   relación con ningún dato editable.
2. **En celular el portal está roto.** El CSS no tiene ni un `@media`. A 390 px el header
   se pisa, el "01" del calendario se encima con el saludo, las filas del catálogo se
   superponen y hay scroll horizontal de más de 200 px (`capturas/mobile-390-fold.png`).
3. **Las fechas del catálogo se muestran un día antes.** `"2026-04-28"` se parsea como
   medianoche UTC, que en Argentina es el 27 a las 21:00, y la pantalla dice "27 abr
   2026" (`T:752-761`, visible en `desktop-1440-full.png`). Afecta a todas las apps con
   más de 30 días y corre el "hoy/ayer" y la ventana de los chips NUEVO/ACTUALIZADO
   entre las 21:00 y las 24:00.
4. **El texto chico no se lee.** Los pares de color más usados fallan WCAG AA: gris
   `--text-3` sobre blanco 2.59, celeste sobre blanco 2.67, chip BETA 1.96, chip
   NUEVO/ACTUALIZADO 2.09. Son justamente la versión, la fecha y el estado de cada app,
   a 10 y 10.5 px.
5. **La mitad inferior de la página no trabaja.** Cumpleaños dice "Sin cumpleaños este
   mes" de julio a marzo porque el JSON solo tiene abril a junio y el código solo mira
   el mes en curso (`T:949-959`). El recuadro de música es un rectángulo blanco cuando
   YouTube no carga. Y los cuatro links que más se usan en el día (monday, ARCA, ANSES,
   Padrón) están al final de todo, en el footer.

---

## 2. Crítica visual por pantalla

### Desktop 1440 (`desktop-1440-fold.png`, `desktop-1440-full.png`)

Lo que funciona: la tipografía (DM Serif Display + Plus Jakarta Sans) le da identidad
propia, el celeste H&A está bien usado como acento, el catálogo en filas se escanea
rápido, hay paleta de comandos con Ctrl K, modo oscuro y un foco de teclado visible
sobre las filas (`desktop-focus-tab.png`).

Lo que no:

- **El hero ocupa casi la mitad del primer viewport** (unos 400 de 900 px) y encima de
  la línea de pliegue entran solo 5 de las 10 herramientas. Para un lanzador que se
  abre varias veces por día, la primera pantalla tiene que ser el catálogo, no un saludo.
- **El "01" con los arcos es decoración que compite con el H1.** Repite la fecha que ya
  está escrita a la izquierda ("Jueves 1 de octubre") y no aporta información.
- **El chip PRODUCTIVO en 5 de 10 filas es ruido.** El estado normal no necesita chip;
  la excepción (BETA) sí. Lo mismo con la flecha en círculo a la derecha: la fila
  entera ya es un link.
- **"● Sincronizado con el repositorio" es texto fijo** (`T:393`): sigue en verde aunque
  falle la carga de `apps.json`. Un indicador que nunca cambia no es un indicador.
- **La metadata de cada app (versión · categoría · fecha) está a 10.5 px en gris 2.59:1.**
  Es la información que justifica el catálogo (qué versión uso, cuándo cambió) y es lo
  menos legible de la página.
- **No se usa `categoria`.** El JSON agrupa en Nómina / Reportes / Herramientas, pero la
  lista es plana y mezcla una guía de uso de Claude entre validadores de nómina.
- **Los h2 de sección son celeste a 11 px en mayúsculas** con contraste 2.67. Como
  rótulo de marca pasa; como heading, no.
- **Tercio inferior:** el acordeón de privacidad es útil pero estático desde su alta;
  cumpleaños vacío; música en blanco; frase motivacional. Cuatro bloques, uno con uso
  real. El footer con los links externos queda a 2.300 px del inicio.

### Modo oscuro (`desktop-1280-oscuro.png`)

Correcto y consistente. El gris `--text-3` sobre el fondo oscuro da 3.49:1, mejor que
en claro pero todavía bajo AA para texto de 10 px. Es solo manual: no sigue
`prefers-color-scheme` del sistema.

### Tablet 820 (`tablet-820-full.png`)

Se sostiene bien. La línea del hero parte en dos renglones sin romperse y el catálogo
conserva la jerarquía. Es la prueba de que el problema de móvil es la ausencia total de
breakpoints, no el diseño de base.

### Móvil 390 (`mobile-390-fold.png`, `mobile-390-full.png`)

No es usable. En orden de aparición:

- El buscador se monta sobre el logotipo y el texto "Hidalgo & Asociados" queda cortado.
- La cejilla "PORTAL INTERNO · EQUIPO PAYROLL" se parte palabra por palabra en cinco
  líneas.
- El "01" del calendario y sus arcos se dibujan encima de "equipo Payroll".
- "Cierre de nómina: en 24 días (25 oct)" ocupa diez renglones de una palabra cada uno.
- En el catálogo, el chip de estado, la versión y la descripción se superponen al
  nombre de la app; el ícono queda tapado por el chip.
- Página de 5.345 px de alto con scroll horizontal.

La causa es una sola: grids con columnas fijas (`T:397`, `T:422`, `T:471`) y ningún
`@media` que los apile.

### Día 25 (`desktop-1280-dia-25.png`)

El 25 de octubre el hero dice "Cierre de nómina: en 31 días (25 nov)". El cartel
"¡hoy!" no puede aparecer nunca porque la condición es `cierre <= todayMid` (`T:877`):
el mismo día ya salta al mes siguiente.

---

## 3. Fechas: qué hay y qué falta

| Dato | De dónde sale hoy | Problema |
|---|---|---|
| Cierre de nómina | Día 25 fijo en código | No es dato, no considera fin de semana ni feriado, "¡hoy!" inalcanzable |
| Pago a empleados | 4.º día hábil, en código | Sin feriados: enero 2027 cuenta el 1/1 como hábil y da el 6/1 |
| Vencimientos ARCA (LSD, F.931, Ganancias) | `eventos.json`, pero **no se lee** | El archivo tiene abril/mayo 2026 y está muerto desde junio |
| Cumpleaños | `cumpleanios.json` (MM-DD) | Solo mes en curso; datos cargados solo de abril a junio |
| "actualizado" por app | `apps.json` | Se muestra un día antes por el parseo UTC |
| Chips NUEVO / ACTUALIZADO | `apps.json` + ventana de 7 días | La ventana vence a las 21:00 del 7.º día, no a medianoche |
| Pie "Catálogo v1.6 · actualizado" | commit de `apps.json` vía API; si falla, `meta.ultimaActualizacion` crudo | Formato distinto según si la API respondió |

Lo que pediste, "fechas de vencimiento que viajen solas", hoy no tiene de dónde viajar:
no hay un archivo de reglas, no hay feriados, y el único archivo de eventos es una lista
de fechas absolutas que alguien tendría que reescribir todos los meses. Las opciones
están en la sección 5.

---

## 4. Hallazgos completos

Treinta hallazgos con evidencia y severidad, en la tabla final de
`anexo-analisis-tecnico.md` (sección 7). Los de severidad alta son el 1 (eventos
no se leen), 2 (fechas un día antes), 3 (sin `@media`) y 11 (contrastes). Además de
lo ya dicho, vale mencionar:

- 11 requests anónimas a la API de GitHub por carga en frío, 10 sin efecto visible
  porque todas las apps ya traen `actualizado`. Y 2 requests a `rss2json` para un bloque
  de noticias que se quitó en julio (`T:716-735`). Y un 404 por carga al pedir la URL
  literal `{{ musicSrc }}` antes de que React renderice (`T:488`).
- Sin `lang` en `<html>` y sin `<title>`: la pestaña del navegador sale vacía.
- El acordeón de privacidad y el "editar nombre" no se pueden operar con teclado.
- `image2.jpg` (1,25 MB) está en el repo sin que nada lo referencie desde junio.
- Las fuentes embebidas son el 60 % de los 353 KB de `index.html`, incluidos subsets
  cirílico y vietnamita que nadie usa.
- Variables declaradas sin uso: `--urgent` (el color que iba a marcar vencimientos
  urgentes nunca llegó a usarse), y el gris cálido de marca `#8C837B` no aparece.

---

## 5. Qué se podría mejorar, en orden

Son propuestas para decidir, no un plan aprobado. Están ordenadas por relación entre
impacto y esfuerzo; cada punto dice qué resuelve.

### Tanda 1: arreglar lo que está mal (sin cambiar el diseño)

1. **Parseo de fechas en hora local.** Leer `"AAAA-MM-DD"` como fecha local y no UTC.
   Corrige el día corrido, el "hoy/ayer" nocturno y la ventana de los chips. Un cambio
   chico en dos funciones (`diasDesde`, `relDate`).
2. **Breakpoints para móvil.** Apilar los tres grids y el hero debajo de ~720 px,
   esconder el "01" decorativo, dejar que los chips bajen de línea. Con esto el celular
   pasa de inusable a correcto; tablet ya demuestra que el diseño aguanta.
3. **Contraste.** Oscurecer `--text-3` (hoy `#8FA3BA`) hasta pasar 4.5:1, y subir la
   metadata de las apps a 11.5-12 px. Para los chips, texto más oscuro sobre el mismo
   fondo pálido (ámbar oscuro, verde oscuro, celeste oscuro ya existe como
   `--celeste-dark`).
4. **Limpieza:** sacar `fetchNews`, el `{{ musicSrc }}` sin resolver, `image2.jpg`, el
   `preconnect` a Google Fonts, los subsets de fuente que no se usan. Agregar `lang="es"`
   y `<title>`. Es la tanda de menor riesgo y se puede hacer junto con la 1.

### Tanda 2: vencimientos que viajen solos

El problema de fondo es que hoy el portal no distingue entre una **regla** ("el pago es
el 4.º día hábil") y una **fecha** ("6 de octubre"). Para que las fechas viajen solas
hace falta guardar reglas y que el portal las resuelva cada vez que se abre.

Propuesta mínima, todo en archivos del repo y 100 % en el navegador:

- `vencimientos.json` con reglas, no fechas. Tres tipos de regla alcanzan para lo que
  hay: día fijo del mes con ajuste a hábil anterior o posterior (cierre), n-ésimo día
  hábil (pago), y tabla de fechas por mes para los vencimientos que ARCA publica por
  terminación de CUIT (LSD, F.931, SICORE), que se cargan una vez por año desde la
  agenda oficial.
- `feriados.json` con los feriados nacionales del año (y el siguiente cuando se
  publique). Sin esto, "día hábil" es mentira en enero, mayo, julio y diciembre.
- Un bloque "Próximos vencimientos" en el hero, en lugar de los dos chips fijos: los
  tres o cuatro próximos, con "en N días", y `--urgent` cuando faltan 2 días o menos.
  Es el bloque que `eventos.json` iba a alimentar y nunca tuvo.
- El cierre y el pago se convierten en la primera y segunda regla del archivo, así se
  pueden cambiar sin tocar el bundle.

Lo que descarto y por qué: leer un tablero de monday o un calendario de Outlook desde
el portal implicaría poner un token en una página estática pública, y la regla del repo
es sin backend y sin credenciales. Si en algún momento se quiere que la fuente sea un
tablero de monday, el camino es que una automatización de monday o una tarea
programada escriba el `vencimientos.json` en el repo, no que el portal lo consulte.

Pregunta de criterio antes de armar esto: **el cierre el 25 y el pago el 4.º día hábil,
¿son fechas internas de H&A o varían por cliente?** Si varían, el hero tendría que
mostrar las de H&A y el bloque de vencimientos las de ARCA, y lo de clientes queda
afuera del portal.

### Tanda 3: rediseño de la página (cuando lo anterior esté andando)

- **Catálogo primero.** Reducir el hero a una línea (saludo, fecha, próximos
  vencimientos) y que las herramientas arranquen arriba del pliegue.
- **Agrupar por categoría** y mostrar chip solo para la excepción (BETA, NUEVO,
  ACTUALIZADO). Sacar la flecha redundante.
- **Links externos arriba**, al lado del buscador o como primera fila del catálogo.
  Son los que más se usan y hoy están a 2.300 px.
- **Cumpleaños: próximos 30 días**, con cambio de año, en vez del mes en curso. Y
  completar `cumpleanios.json` con el año entero (hoy tiene 7 personas, abril a junio).
- **Indicador de sincronización real**: verde si cargó `apps.json`, gris si vino del
  caché, rojo si falló.
- **Música:** si el iframe no carga, no mostrar el recuadro. O sacar el bloque.
- **Modo oscuro automático** con `prefers-color-scheme`, manteniendo el toggle.

---

## 6. Decisiones que tomé y lo que no se pudo verificar

- "Esta app" se interpretó como el portal (`index.html`), no como las herramientas del
  catálogo, porque las fechas, los vencimientos y los cumpleaños viven ahí.
- La skill `design:design-critique` no está instalada en esta cuenta. La crítica se
  hizo con el mismo método (capturas por viewport, estados hover y foco, lectura del
  CSS y la lógica) sin esa plantilla.
- No se verificó el comportamiento con la API de GitHub respondiendo (el proxy del
  entorno la bloquea). El código indica que, de responder, solo cambiaría el formato
  del pie de página.
- No se transcribieron nombres de `cumpleanios.json` en este informe ni en el anexo.

## Archivos de esta evaluación

- `informe.md`: este documento.
- `anexo-analisis-tecnico.md`: análisis línea por línea del template y del JS, tabla de
  contrastes y los 30 hallazgos con evidencia.
- `capturas/`: 10 capturas (desktop 1440 completa y primer viewport, laptop 1280,
  tablet 820, móvil 390 completa y primer viewport, hover, foco de teclado, modo
  oscuro, día 25) y `como-se-tomaron.md` con el método.

# Spec — Guía "Cómo usar Claude" (`casos_uso_modelos_comparativa.html`)

**Entrega: v15** (el archivo está en v14; el brief decía v8 → v9, pero la versión nunca baja, CLAUDE.md §3).
Hechos vigentes al 28/09/2026. Spec escrita el 29/09/2026. El nombre del archivo mantiene "v9" porque es la ruta pedida.

## 1. Guardrails

- Solo se editan `casos_uso_modelos_comparativa.html`, `referencia-claude-hya.md`, `datos-y-planes-claude-hya.md` y `specs/`.
- No se tocan `apps.json`, `index.html`, los assets ni el resto de las páginas del portal.
- Sin commit ni push.

## 2. Preservar

- La estructura actual: la tarjeta de flujo con 4 preguntas, los atajos y los 10 acordeones (`why, tools, pedir, effort, compare, cowork, code, artifacts, datos, refs`). La página ya no tiene pestañas desde la v11.
- Los 8 casos de `CASES_RAW`.
- La sintaxis `sc-if` / `sc-for` y el motor propio del template.
- La paleta y las tipografías (Poppins, Lora).
- Un solo HTML autocontenido.
- Buena vista a 380 px.
- Los porcentajes de confianza, sin cambios. A la nota de procedencia se le agrega "medidos sobre el escalón anterior, pendiente de re-medir".
- Los códigos de concepto del ejemplo de fórmulas encadenadas (`#3510`, `#4050`, `#9080`, `#1006`, dentro de `sec-effort`, en "Ejemplo aplicado"). Decisión pendiente de Willy.

## 3. Scope

A–H del brief, más una línea sobre Cowork fusionado con Chat. En detalle:

- **A.** Nombres de modelo: Haiku 4.5, Sonnet 5.5, Opus 5.5, Fable 5.1, en todo el archivo. Incluye la regex de `buildVerdictParts`.
- **B.** Cupo relativo en lugar de dólares.
  - Salen los precios de API, los multiplicadores 3× / 1,7× / 2× y los chips de tokens de las tarjetas de artifact.
  - Del asesor salen los benchmarks y las cifras de tokens.
  - Fable 5.1 por tipo de asiento.
- **C.** Esfuerzo como criterio.
  - Sale el interruptor de thinking: chip, `resolveThinking`, tarjeta "¿Prendo thinking?" y "+ thinking activado".
  - Defaults: Medium en las apps, High para Sonnet 5.5 en la API.
  - Escalera: primero subir el esfuerzo, después cambiar de modelo. Fable 5.1 solo tras dos fallas de Opus 5.5 en Extra high.
  - Cada caso suma esfuerzo inicial y cuándo subir (criterio de Willy, no medido), más la regla de bolsillo.
- **D.** Claude Design: Beta, sin atribución de modelo, `/design` y `/design-sync`.
- **E.** Los ítems 1, 2, 3 y 5 de §8 ya están aplicados, así que solo se actualizan. Datos:
  - Team no entrena por defecto.
  - Los 30 días / 5 años rigen solo en cuentas personales.
  - El pulgar puede guardar la conversación hasta 5 años.
  - Incógnito aparece en las exportaciones del Owner.
- **F.** Sección Code.
  - Tarjetas sin precio.
  - Default de Team Standard = Opus 5.5 (v2.1.280). `/model sonnet` para lo acotado (Sonnet 5.5 desde v2.1.284) y `/effort`.
  - El bloque "Novedad Opus 5" pasa a Opus 5.5, sin cifras.
- **G.** Referencias.
  - Links a Sonnet 5.5, Opus 5.5 y Fable 5.1, más los tres posts de claude.dev.
  - Sale el cartel del control de exportación.
  - Verificado al 28 de septiembre de 2026.
- **H.** Badge y pie: v15.
- **Cowork:** se fusionó con Chat el 16/9, con despliegue por olas; en Team todavía sin fecha.

Afuera: la línea de "1 millón de tokens" en datos, la numeración de `apps.json` y cualquier mejora no listada.

Regla base (confirmada): se sigue arrancando por Sonnet 5.5. Regla de bolsillo: Sonnet para escribir y armar, Opus para pensar y revisar.

## 4. Evals

1. Static server + Playwright (Chromium de `/opt/pw-browsers`):
   - abrir los 10 acordeones;
   - clickear los 8 chips de caso;
   - correr los 9 atajos;
   - completar un flujo manual;
   - cero errores de consola y cero `pageerror`.
2. A 380 px: sin scroll horizontal de página (`scrollWidth <= 380`) y capturas revisadas a ojo.
3. `buildVerdictParts` sobre los 8 veredictos: "Sonnet 5.5", "Opus 5.5" y "Fable 5.1" salen como un segmento entero y con color.
4. Grep en el HTML, cero ocurrencias de: `Opus 4\.[78]`, `Fable 5(?!\.1)`, `Sonnet 5(?!\.5)`, `MTok` (sin distinguir mayúsculas), `research preview` (sin distinguir mayúsculas) y `Extended Thinking`.
5. Revisión a mano: ningún `thinking` que quede puede presentarse como decisión.
6. Los cuatro códigos de concepto siguen en su lugar.

## 5. Autonomía

- **Decido solo:** la redacción en español rioplatense, y la ubicación y el estilo de los bloques nuevos, reusando los existentes.
- **Consulto antes de:**
  - escribir una cifra que no esté en los hechos del brief;
  - tocar lo de NO TOCAR;
  - interpretar una fuente que contradiga a otra.

## 6. Salida

- Paro cuando pasan los evals.
- Entrego un resumen de cambios y lo que quedó dudoso.
- Otras mejoras: una línea al final, sin hacerlas.
- Sin commit ni push; el diff lo revisa quien publica.

**Dudoso, conocido de antemano:**
- Haiku 4.5 queda en esfuerzo "Low", como hoy: no hay un hecho sobre cómo maneja el esfuerzo.
- Las alturas de las barras de cupo pasan a escalones ordinales (25/50/75/100): son solo visuales, no una medición.
- `apps.json` sigue en `"version": "14"`: quien publica tiene que pasarlo a `"15"` y actualizar `actualizado`.

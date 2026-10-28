# Portal Payroll H&A — guía para Claude

Portal interno del equipo de Payroll de Hidalgo & Asociados.
Publicado con GitHub Pages en **https://bhidalgo-ar.github.io/payroll-portal-ha/**.

## 1. Cómo está armado

| Archivo | Qué es |
|---|---|
| `index.html` | El portal. **Es un bundle**: una de las líneas del `<head>` externo es un string JSON con todo el template. Ver §5. |
| `apps.json` | Catálogo de herramientas. Fuente de verdad de versión, estado y fechas. |
| `cumpleanios.json`, `frases.json`, `vencimientos.json` | Datos que el portal lee en runtime. `vencimientos.json` alimenta las fichas F.931 del calendario laboral. Ver §9. |
| `feriados.json` | Feriados nacionales y días no laborables. El portal lo lee para el calendario laboral y los días hábiles del mes; además lo usa `scripts/validar-vencimientos.mjs`. Ver §9. |
| `indicadores.json` | Indicadores del mes (SMVM, bases SIPA, IPC, movilidad) que el portal lee en runtime para la tarjeta "Indicadores del mes". Ver §10. |
| `musica.json` | Listas de YouTube y Spotify de "Música del equipo". Cada una lleva `nombre` (vacío = "Lista de YouTube/Spotify"), `url` (el link normal que se comparte; el portal arma el reproductor) y `recomendadaPor` (vacío si no se sabe, nunca inventarlo). Las recomendaciones llegan por mail a gesposito@bhidalgo.com.ar (botón "Recomendar una lista") y se cargan a mano. |
| `normativa.json` | Normas recientes del Boletín Oficial ya filtradas, que el portal lee en runtime para "Normativa reciente". Ver §10. |
| `iconos/` | SVG de los accesos rápidos (monday, Outlook, Teams). El portal los pide con la misma base que los JSON (`BASE` + fallback relativo). |
| `*.html` (resto) | Las herramientas en sí. Cada una es un HTML autónomo, sin backend. |
| `scripts/validar-catalogo.mjs` | Valida `apps.json`. Corre solo vía hook al editarlo. |
| `scripts/revisar-catalogo.mjs` | Recalcula `cambios`, `actualizado` y `version` de cada app desde su historial git y reordena el catálogo. Ver §3. |
| `scripts/validar-vencimientos.mjs` | Valida `vencimientos.json` contra `feriados.json`. Se corre a mano antes de pushear cualquiera de los dos. |

El portal lee `apps.json` en cada carga (`BASE` + fallback relativo), así que **para
cambiar el catálogo alcanza con editar `apps.json` y pushear** — no hay build.

## 2. Esquema de `apps.json`

```jsonc
{
  "id": 7,                      // entero único y estable; no se reusa
  "nombre": "Validador de Recibos",
  "descripcion": "...",         // una línea, qué hace y sobre qué archivos
  "url": "https://bhidalgo-ar.github.io/validadorrecibos/",
  "icono": "🧾",
  "version": "1.0",             // ver §3
  "cambios": 12,                // cambios funcionales acumulados (lo escribe revisar-catalogo.mjs); ordena el portal
  "versionPropia": true,        // sólo si la app lleva su propia numeración entera (vN en los commits): no se auto-incrementa
  "categoria": "Nómina",        // Nómina | Reportes | Herramientas
  "estado": "beta",             // productivo | beta | inactivo (inactivo = no se muestra)
  "repo": "bhidalgo-ar/validadorrecibos",  // sólo si la app NO vive en este repo
  "path": "docs",               // sólo si la app vive en un subdirectorio del otro repo
  "agregado": "2026-08-04",     // alta en el portal — dispara el chip NUEVO
  "actualizado": "2026-08-04"   // último cambio FUNCIONAL — dispara el chip ACTUALIZADO
}
```

`meta.diasReciente` (hoy 7) es la ventana en días para destacar novedades.

## 3. Versión, cambios y orden (criterio único, reemplaza al anterior)

**Todo se deduce del historial git de cada app, no a ojo.** `scripts/revisar-catalogo.mjs`
lo calcula y es lo primero que corre la revisión semanal.

**Cambio funcional** = commit (sin merges) que toca código de la app y no es cosmético.
No cuentan: asuntos `docs`/`style`/`chore`/`test`/`ci`, README, branding, favicon, el
propio bump del catálogo, commits que sólo tocan estilos (`.css`), tests, specs o
configuración, ni un commit que sólo *agrega* el archivo (alta).

- **`cambios`**: total acumulado de cambios funcionales de la app. Es lo que usa el portal
  para ordenar: **las apps con más cambios van primero**, y el orden se arma solo en
  runtime al leer `apps.json` (no hay que reordenar a mano; el script además deja el
  archivo en el mismo orden).
- **`version`**: se suma **+0,1 por cada cambio funcional nuevo** desde la corrida anterior
  (`x.y` → décimas, `6.9` → `7.0`; `x.y.z` → +1 al parche por cambio). La primera vez que
  una app recibe `cambios` es un ancla y no sube nada.
- **`actualizado`**: fecha (hora Argentina) del último cambio funcional. Sólo avanza.
- **`versionPropia: true`** (hoy sólo "Cómo usar Claude"): la app numera sus propios
  cambios con un entero (`(v17)` en cada commit). Su versión se lee de ahí, a mano, y el
  script no la toca.
- Una app cuyo repo no está clonado en la sesión queda **sin tocar** y se informa como
  "sin acceso": nunca se asume que no cambió.

Reglas duras:

- **La versión nunca baja.**
- **Si la herramienta muestra su versión en pantalla** (`APP_VERSION` u otro badge), se
  sincroniza el badge en el HTML junto con `apps.json`. No dejar los dos números en
  desacuerdo.
- Falsos positivos que no son la versión de la app: `F.1359 v2.0` (formulario de ARCA),
  `skill v2.0` (skill de branding), `version="1.2"` de SheetJS en `siradig_engine_hya.html`.
- Si el script cuenta algo que claramente no es funcional (o se pierde algo que sí lo es),
  no se corrige a mano el número: se ajusta el filtro del script y se vuelve a correr.

## 4. Cómo decidir `estado` y qué destacar

### productivo

Las tres condiciones, juntas:

1. No tiene marcadores de inmadurez propios: `beta`, `MVP`, `en desarrollo`, `Unreleased`
   en su `CHANGELOG.md`/`ROADMAP.md`, ni ítems sin cerrar en su Definition of Done.
2. Ya pasó al menos una ronda de correcciones después de la primera publicación
   (existe un commit de fix posterior al de alta).
3. Lleva **≥ 30 días sin cambios funcionales**. Si se sigue tocando, todavía se está
   estabilizando.

### beta

Cualquier cosa que no cumpla las tres. En particular: recién publicada, o su propio
repo declara que es un MVP.

Casos de esta revisión, para calibrar:

- `Validador F. 1359`, `Análisis IG Anual` y `Validador Novedades` pasaron de beta a
  productivo: última corrección funcional en abr/jun 2026, con rondas de fix previas
  y sin marcadores de inmadurez.
- `Controles Nómina` entra como beta aunque tiene 8 controles andando y CI verde: su
  `ROADMAP.md` dice `v1.0 (en curso)` y la DoD de v2 tiene ítems sin tildar.
- `Validador de Recibos` entra como beta: se publicó el mismo día, sin ronda de
  estabilización todavía.

### Chips de novedad

- `NUEVO` (verde) si `agregado` está dentro de la ventana de `meta.diasReciente`.
- `ACTUALIZADO` (verde) si `actualizado` está dentro de la ventana.
- Además el número editorial de la fila se pinta en verde.

**`actualizado` se recalcula solo con `scripts/revisar-catalogo.mjs`** (§3) y se mueve sólo por
cambios funcionales. Un bump de versión, un ajuste de estilo o un cambio de README no lo
mueven — si no, cualquier commit cosmético haría aparecer la app como novedad. Por eso el portal prioriza `actualizado` de `apps.json`
sobre la fecha de commit que trae la API de GitHub (esa queda como respaldo para las
apps que no la declaren).

## 5. Editar `index.html` (bundle)

**El `<head>`/`<html>` de afuera del bundle no importa — se descarta entero.** El
script arrancador hace `document.documentElement.replaceWith(doc.documentElement)`
con el HTML parseado del template, así que cualquier `<title>`, `<meta>` o
`<link rel="icon">` puesto fuera del string JSON nunca se ve: se reemplaza apenas
carga la página. Favicon, título y demás van **dentro** del `<head>` que está en
el propio template (justo después del `<meta name="viewport">`).

`index.html` **no se edita a mano.** Una de las líneas del `<head>` externo (hoy la
177, pero **no asumir el número** — se corre cada vez que se toca algo antes, como
casi pasó al agregar el favicon) es un string JSON con el template entero, y cada `</`
va escapado como `<\u002F` para que el `<script>` contenedor no se cierre antes
de tiempo. Ubicarla por contenido, no por número de línea, y preservar esa
convención en el round-trip:

```python
import json
raw = open('index.html', encoding='utf-8').read().split('\n')
i = next(i for i, l in enumerate(raw) if l.startswith('"<!DOCTYPE html>'))
tpl = json.loads(raw[i])            # extraer
# ... modificar tpl ...
enc = json.dumps(tpl, ensure_ascii=False).replace('</', '<\\u002F')
assert '</' not in enc
raw[i] = enc
open('index.html', 'w', encoding='utf-8').write('\n'.join(raw))
```

Verificar siempre después: `json.loads` de esa línea tiene que seguir andando, y
`línea.count('</')` tiene que dar 0.

El template usa un motor propio: `{{ expr }}`, `<sc-for list="{{ rows }}" as="r">` y
`<sc-if value="{{ r.flag }}">`. Los estilos dinámicos se pasan como objeto
(`style="{{ r.miStyle }}"`). Variables de color disponibles: `--celeste`, `--amber`,
`--green`, `--urgent` y sus `-dim`.

Para probar el portal hace falta un static server (los `fetch` no andan con `file://`):

```bash
node /opt/node22/lib/node_modules/http-server/bin/http-server -p 8899 -s .
```

El template carga React desde `unpkg.com`; si el entorno bloquea salida a internet,
la página queda en `[bundle] error`. En ese caso hay que interceptar esas dos
requests y servir React desde `npm install react@18.3.1 react-dom@18.3.1`.

## 6. Inventario de repos de la organización

Estado al 2026-10-26. Actualizar en cada revisión semanal.

### Publicados en el portal

| Repo | App |
|---|---|
| `bhidalgo-ar/payroll-portal-ha` | ids 1-6 (las herramientas viven en este mismo repo) |
| `bhidalgo-ar/validadorrecibos` | id 7 — Validador de Recibos |
| `bhidalgo-ar/controles-varios` | id 8 — Controles Nómina |
| `bhidalgo-ar/migrador-meta4-axton` | id 9 — Migrador Meta4 → AXTON |
| `bhidalgo-ar/controles-contables` | id 10 — Controles Contables |

### NO publicar (decisión del equipo)

No proponer estos repos en la revisión semanal:

- `bhidalgo-ar/brandinghya` (2026-08-04)
- `bhidalgo-ar/siradig-f572-2025-TASA` (2026-08-04)
- `bhidalgo-ar/siradig-f572-2025-TPA` (2026-08-04)
- `bhidalgo-ar/toyota-kpis` (2026-08-04)
- `bhidalgo-ar/planmigracion` (2026-08-10 — no es para compartir con todo el equipo)
- `bhidalgo-ar/distribucion-cuentas-10062026` (2026-08-10 — ídem)

### Sin decidir — preguntar en la revisión semanal

Ninguno pendiente al 2026-08-10.

Antes de sumar cualquier repo hay que verificar que **GitHub Pages esté publicado**:
en este entorno las URLs `*.github.io` suelen estar bloqueadas, así que se comprueba
por API buscando un run exitoso de `pages-build-deployment`.

## 7. Revisión semanal del catálogo

Corre los lunes por una tarea programada. Checklist:

1. Clonar (o actualizar con `git fetch`, **sin** `--depth`: un clon superficial subcuenta
   los cambios) los repos de las apps de §6 que la sesión pueda leer. Listar los repos de
   la organización con su último push si hay herramienta; si no la hay, decirlo en el
   resumen en vez de asumir que no apareció nada.
2. Correr `node scripts/revisar-catalogo.mjs --clones <carpeta>` (simulacro) y mirar el
   informe; después con `--aplicar`. Eso actualiza `cambios`, `version` (+0,1 por cambio
   funcional, §3), `actualizado` y el orden. Los repos sin acceso se listan en el resumen.
   Sincronizar el badge interno de las herramientas que muestren su versión, y leer a mano
   la versión de las de `versionPropia`.
3. Revisar `estado` contra §4 (ahí sí hay juicio): beta → productivo sólo si cumple las tres
   condiciones. Un pedido explícito de Willy pasa por encima del criterio y se anota en el PR.
4. Subir `meta.version` si algo cambió; el script ya fija `ultimaActualizacion` y
   `ultimaRevision`. Correr `node scripts/validar-catalogo.mjs` y dejarlo en verde.
5. Repos nuevos o "sin decidir": **no publicar nada sin confirmación** y respetar la lista
   de "NO publicar" de §6 (los seis). La tarea corre sin nadie delante: no hay
   `AskUserQuestion`; las preguntas van en el resumen final y en la notificación.
6. Si no cambió nada y no hay nada que preguntar, no abrir PR ni notificar. Si cambió algo:
   rama de la sesión, commit y PR según §8 (listo para mergear, squash). Si el PR es sólo de
   datos del catálogo (script + validador en verde) se mergea; si hay una decisión pendiente,
   se avisa por notificación con lo que se necesita.
7. Actualizar la fecha del inventario de §6.

## 8. Convenciones

- Todo en español, incluidos commits y comentarios de código.
- Las herramientas corren 100% en el navegador. **Nunca** agregar un backend ni enviar
  datos de empleados o clientes a ningún servicio.
- Marca H&A: celeste `#00ACD4`, gris cálido `#8C837B`. Hay una skill de branding en
  `.claude/skills/`.

### Pull requests

- Los PR se abren listos para mergear, **no en borrador**.
- Claude los mergea (squash) apenas el PR está creado y no hay CI en rojo ni conflicto.
  No espera una aprobación aparte. Excepción: la revisión semanal (§7) sigue pidiendo
  confirmación antes de publicar una app nueva o un repo de "sin decidir".

## 9. Vencimientos y feriados

**Los vencimientos de ARCA nunca se cargan de memoria ni de fuentes no oficiales**
(blogs, estudios contables, prensa). Si la fuente oficial no se puede abrir, la fecha
no se carga y queda como pendiente. En los feriados, `oficial` significa que hay norma
citada para esa fecha; si el documento no se pudo abrir completo, `meta.nota` lo aclara.

### `vencimientos.json`

Lo lee el portal (mismo `loadData` que `apps.json`). Ya no hay bloque "Próximos
vencimientos" en el hero: las obligaciones F.931 se muestran como fichas por grupo de
terminación dentro del **calendario laboral de 2 semanas** (desde el lunes de la semana
actual), junto con los feriados de `feriados.json`; debajo, una línea con el próximo
feriado fuera de la vista. Si el archivo falta o está roto, el calendario se muestra sin
fichas de vencimiento.

```jsonc
{
  "meta": { "actualizado": "AAAA-MM-DD", "nota": "..." },   // actualizado: null mientras no haya carga
  "vencimientos": [
    {
      "id": "f931-AAAA-MM",                  // único y estable
      "nombre": "F.931 · Presentación y pago",
      "periodo": "AAAA-MM",                  // período fiscal; "AAAA" para obligaciones anuales
      "grupos": [                            // por terminación de CUIT del empleador
        { "terminaciones": "0-1-2-3", "fecha": "AAAA-MM-DD" },
        { "terminaciones": "4-5-6", "fecha": "AAAA-MM-DD" },
        { "terminaciones": "7-8-9", "fecha": "AAAA-MM-DD" }
      ],                                     // o un único { "terminaciones": "todas", ... }
      "fuente": "https://..."                // URL oficial de ARCA de donde sale la fecha
    }
  ]
}
```

Cómo se carga: desde el **calendario oficial de vencimientos de ARCA**, una entrada por
obligación y período, copiando la tabla de terminaciones de CUIT tal como la publica
ARCA. Las terminaciones de cada obligación tienen que cubrir 0-9 una sola vez. Al
cargar, poner `meta.actualizado` en la fecha de carga.

De dónde sale: la Agenda de Vencimientos de ARCA, `https://seti.afip.gob.ar/av/seleccionVencimientos.do`.
Es un formulario: GET con cookies, tomar el `action` del form `consultaVencimientoForm`
y POST con `fechaVDesde`/`fechaVHasta` (dd/mm/aaaa), `terminacionCuit=Todos` e
`impuestosSeleccionados` = `2` (Seguridad Social) y `16` (Ganancias). Respuesta en
latin-1. Si el rango no está publicado responde "no está cargado"; consultar mes a mes.
Mapeo: F.931 = Seguridad Social, Sujeto "Empleadores.", SIPA, Régimen General.
Ganancias 4ª = régimen general de retenciones SICORE (RG 2233): la agenda no la
discrimina aparte; la 2ª quincena se paga el mismo día que vence la DJ F.744. F.1359 es
anual y no vence entre octubre y diciembre. El entorno tiene que permitir
`*.arca.gob.ar`, `*.afip.gob.ar`, `*.argentina.gob.ar`, `*.boletinoficial.gob.ar` y
`*.indec.gob.ar` (este último para el IPC, §10) (con el comodín: sin él, `www.` queda
bloqueado).

Carga del 2026-10-05: vencimientos de oct, nov y dic 2026 (ARCA no publicó 2027 todavía).

### `feriados.json`

Lo lee el portal: marca los feriados y días no laborables en el calendario de 2 semanas y
calcula los días hábiles del mes del masthead (`inamovible`, `trasladable` y `puntual` hacen
inhábil el día; `no_laborable` cuenta como hábil). Si falta o está roto, el calendario sale
sin feriados y no se muestran los días hábiles. Además sirve para que el validador rechace
un vencimiento que caiga en día no hábil.

```jsonc
{
  "meta": { "actualizado": "AAAA-MM-DD", "nota": "...", "pendientes": ["..."] },
  "feriados": [   // ordenado por fecha, sin duplicados
    { "fecha": "AAAA-MM-DD", "nombre": "...", "tipo": "inamovible", "estado": "oficial",
      "fuente": "Ley 27.399 art. 1" },
    { "fecha": "AAAA-MM-DD", "nombre": "...", "tipo": "trasladable", "estado": "estimado",
      "fuente": "Ley 27.399 arts. 1 y 6", "fechaOriginal": "AAAA-MM-DD",
      "regla": "regla aplicada para estimarla" }
  ]
}
```

- `tipo`: `inamovible` | `trasladable` | `puntual` (feriado por decreto, una sola vez) |
  `no_laborable` (día no laborable, optativo para el empleador: no es feriado).
- `estado`: `oficial` (hay norma para esa fecha) | `estimado` (calculado por la ley;
  `regla` obligatoria). `fechaOriginal` (opcional): fecha histórica de un trasladado.
- `fuente`: la norma, corta, sin URL.
- **2026** está cargado como oficial (verificado por búsquedas en sitios oficiales y
  cruce con prensa; ningún documento oficial se pudo abrir completo). **Todo 2027 es
  estimado** por la Ley 27.399. Pendientes, en `meta.pendientes`: 2027-11-20
  (Soberanía, cae sábado y la JGM puede moverlo), los días no laborables con fines
  turísticos 2027, los feriados regionales del DNU 1103/2026 y los días no laborables
  religiosos. Cuando salga la norma, pasar la fecha a `oficial` y sacarla de pendientes.

### Validación

```bash
node scripts/validar-vencimientos.mjs
```

Error (exit 1): JSON inválido, fecha que no existe o fuera de formato, duplicados,
`tipo`/`estado` fuera de los valores permitidos, estimado sin `regla`, feriados fuera de
orden, `id` repetido, terminaciones que no cubren 0-9 exactamente una vez, `fuente` que
no es una URL `https` de `arca.gob.ar`, `afip.gob.ar`, `argentina.gob.ar` o
`boletinoficial.gob.ar` (o un subdominio), y vencimiento en un feriado o día no laborable de `feriados.json`.
Advertencia: vencimiento en sábado o domingo, o en un año que `feriados.json` no cubre.

## 10. Indicadores y normativa

### `indicadores.json`

```jsonc
{
  "meta": { "consultado": "AAAA-MM-DD" },
  "periodos": [                              // uno por mes; el portal muestra dos
    { "periodo": "AAAA-MM", "etiqueta": "Octubre 2026",
      "items": [
        { "id": "smvm", "nombre": "Salario mínimo, vital y móvil", "valor": 391200,
          "unidad": "ARS/mes",              // "ARS/mes" se muestra en pesos; "%" como porcentaje
          "vigencia": "desde AAAA-MM-DD ...",
          "norma": "Resolución X/AAAA ... (BO DD-MM-AAAA)",
          "fuente": "https://...",          // URL oficial (boletinoficial.gob.ar, argentina.gob.ar, ...)
          "cita": "texto literal de la norma que respalda el valor" }
      ] }
  ]
}
```

La tarjeta "Indicadores del mes" muestra **dos columnas**, elegidas por la fecha real (hora
local):

- Del día 1 al 10 (inclusive): el mes anterior ("Mes anterior") y el mes en curso
  (destacado como "Vigente"). Motivo: hay empresas que liquidan los primeros días del mes
  con las tablas del mes anterior.
- Del día 11 a fin de mes: el mes en curso ("Vigente") y el mes siguiente ("Mes
  siguiente"), porque a fin de mes ya se necesitan los valores del que viene.

Ejemplos: 15/10 → octubre + noviembre; 05/11 y 10/11 → octubre (anterior) + noviembre;
11/11 → noviembre + diciembre. Por eso **el período anterior se conserva en el JSON hasta
el día 10 del mes siguiente**; recién después se puede sacar. Los `id` estables (`smvm`, `sipa-base-min`,
`sipa-base-max`, `ipc`, `movilidad`) alinean las filas entre períodos.

**Regla dura:** un indicador sólo se carga desde fuente oficial, con `fuente` y `cita`
literal. Si no se pudo verificar, no se carga: la celda muestra "—" con "Pendiente de
publicación oficial" (las filas base SMVM, base mínima y máxima SIPA e IPC salen siempre). El mes
siguiente se completa a medida que sale cada norma; no se copia el valor del mes anterior.
Si el archivo falta o está roto, todo sale en "—".

**IPC** (`id: "ipc"`, `unidad: "%"`): variación mensual del nivel general del IPC nacional
del INDEC. En la columna de un mes va **el IPC del mes anterior**, que es el último dato
publicado durante ese mes (INDEC lo publica a mediados del mes siguiente): en "Octubre
2026" va el IPC de septiembre 2026. `vigencia` lo avisa ("dato de septiembre 2026, el último
publicado (INDEC publica el IPC a mediados del mes siguiente); publicado el AAAA-MM-DD"); `norma` = "INDEC, Informe técnico IPC <mes> <año>"; `fuente` = el PDF del
informe en `indec.gob.ar` y `cita` = la frase literal con la variación mensual. El valor
va con los decimales que publica INDEC (uno): `1.9`, no `1.90`. En la columna "Mes
siguiente" el IPC queda casi siempre pendiente, porque se publica recién a mediados de ese mes. No se deduce
de otras normas: la resolución de movilidad de ANSES se calcula con el IPC pero no lo cita
literal.

### `normativa.json`

```jsonc
{
  "meta": { "consultado": "AAAA-MM-DD", "fuente": "...", "nota": "...",
            "filtro": "qué se muestra y qué se excluye" },
  "items": [
    { "organismo": "...", "norma": "Resolución X/AAAA", "detalle": "RESOL-...",
      "fecha": "AAAA-MM-DD", "tema": "Seguridad social",
      "url": "https://www.boletinoficial.gob.ar/detalleAviso/primera/...",
      "resumen": "...", "fuenteResumen": "https://www.argentina.gob.ar/normativa/..." }
  ]
}
```

- Se carga desde el listado de la primera sección del Boletín Oficial, aplicando el filtro
  editorial de `meta.filtro` (hoy: ARCA, ANSES, salario mínimo, feriados, SRT y
  homologaciones de convenios; fuera estatutos y altas sindicales, concursos y
  designaciones).
- El `resumen` se copia tal cual de InfoLEG (argentina.gob.ar/normativa); **no se redacta**.
  Si no hay resumen oficial, se omite el campo.
- El portal resalta con "HOY" las normas con `fecha` igual a la fecha real del día. Si el
  archivo falta o está roto, la sección muestra "No hay normativa cargada por ahora".

### Cómo llegar al Boletín Oficial

Desde la nube, `www.boletinoficial.gob.ar` suele cortar la conexión (connection reset o 503)
y bloquea las ráfagas. Hay tres vías, todas oficiales; se prueban en este orden:

1. **InfoLEG** (`argentina.gob.ar/normativa`): `buscar-boletin?s=1&fecha_publicacion=DD-MM-AAAA`
   lista lo publicado ese día y cada norma tiene `/texto`. Anda bien, pero carga el boletín
   con uno o dos días de atraso: el del día casi nunca está.
2. **`www.boletinoficial.gob.ar`** (`/seccion/primera/AAAAMMDD` y `detalleAviso`): máximo 3
   requests espaciadas 10 s.
3. **`otslist.boletinoficial.gob.ar`**: el listado oficial de PDF de cada edición. En
   `https://otslist.boletinoficial.gob.ar/ots/` (filtro `?date_filter=` por fecha) cada día
   tiene una fila por sección; la sección 1 es la primera y el PDF se baja de
   `/ots/download/<hash>/0/`. Tiene la edición del día. Se pasa a texto con `pdftotext`
   y se busca el organismo o la norma en el sumario. Mismo límite que la vía 2: es el
   mismo organismo.

Si un valor sale de la vía 3, `fuente` es la URL del PDF y la cita lleva la página
(`BO Nº NN.NNN, primera sección, p. N`). No hace falta tocar el entorno: el comodín
`*.boletinoficial.gob.ar` de §9 ya cubre `otslist.`.

**Una norma no está "pendiente de publicación" hasta haber probado las tres vías.** Si
InfoLEG no tiene cargado el día, se sigue con `otslist` (tiene la edición del día) y
no se concluye nada con una sola. Si una vía no se pudo consultar, el resumen dice
"no verificado", no "no publicada". Detalles que ya costaron un error (ANSES, Res.
304/2026, publicada el 28-10-2026 y no vista por la corrida de la mañana):

- El listado de InfoLEG (`buscar-boletin`) es paginado: recorrer `&page=0,1,2,…` hasta
  que no haya más filas, no mirar sólo la primera.
- El organismo figura en mayúsculas y sin tilde (`ADMINISTRACION NACIONAL DE LA
  SEGURIDAD SOCIAL`); buscar sin distinguir mayúsculas ni acentos. Para las bases SIPA y
  la movilidad, el rótulo es `HABERES MINIMOS Y MAXIMOS - BASES IMPONIBLES - PBU Y PUAM`.
- El `/texto` de InfoLEG da 404 el día de publicación aunque la norma ya figure en el
  listado: el monto y la cita se toman del PDF de `otslist` (`pdftotext -layout`).
- ANSES publica la resolución del mes siguiente en los últimos días del mes (la de
  noviembre 2026: sancionada el 27 y publicada el 28-10), no en una fecha fija.

**Horarios de búsqueda.** El boletín del día no siempre está en InfoLEG a primera hora.
Las corridas de los días 20 a 31 y 1 a 5 deben hacerse dos veces: a la mañana (para lo
publicado el día anterior) y a las 14:00 hora Argentina (para la edición del día, vía
`otslist`). Para el IPC (días 12 a 16) la corrida útil es a las 17:00 hora Argentina,
porque INDEC publica por la tarde (horario sin verificar: confirmarlo la primera vez).

## Forma de trabajar: orquestador y subagentes

El chat principal es el orquestador: entiende el pedido, decide, arma los briefs, verifica lo
barato, me pregunta lo que es criterio y se queda con el resultado, no con el contenido.
Todo lo que implique leer o producir volumen lo hace un subagente.

### Qué se delega y qué no

- Se delega: leer Excel o exports de clientes, barrer carpetas de SharePoint o del repo,
  extraer datos, correr scripts, armar un entregable a partir de un brief cerrado,
  implementar a partir de una spec aprobada, auditar.
- No se delega: decisiones de criterio, cosas de una línea, algo que ya está en el chat
  (si lo pegué yo, ya lo tenés), ni el brief mismo.
- Regla práctica: si la tarea va a meter en el chat más de lo que cabe en una pantalla
  de resultado, va a un subagente.

### Qué modelo usa cada subagente

- Haiku: la tarea tiene una sola respuesta correcta y se comprueba mecánicamente.
  Listar archivos, contar ocurrencias, extraer un valor de un lugar conocido, convertir
  formato, correr un script ya escrito y devolver su salida, buscar un texto.
- Sonnet: leer e interpretar con consigna clara. Resumir un Excel, cruzar dos archivos
  con claves conocidas, redactar a partir de un esquema, escribir código a partir de una
  spec cerrada, inventariar.
- Opus: decidir, diseñar, armar specs, implementar lo que toca lógica de cálculo o
  varios archivos a la vez, y auditar lo que produjo Sonnet u Opus.
- El auditor nunca es más chico que el productor.
- Ante la duda entre dos niveles, el más alto: un resultado plausible y equivocado
  cuesta más que los tokens que ahorra.

### Qué va en cada brief

El orquestador arma el brief completo; el subagente no tiene la conversación ni mis
reglas. Siempre incluye:

- Objetivo y qué tiene que devolver, con formato: número, tabla, lista de casos con
  legajo, archivo escrito en tal ruta.
- Carpeta de trabajo y rutas exactas de entrada. Qué no puede tocar.
- Las reglas duras que apliquen: nunca inventar datos de personas ni de clientes, lo
  que falta va como [FALTA: ...]; Esposito sin acento; español.
- Cómo actuar ante ambigüedad: lo mecánico lo decide solo; lo que tiene dos lecturas
  lo decide, lo anota en la respuesta bajo "Decisiones que tomé" y sigue; lo que
  cambiaría el resultado según quién decida, frena y lo devuelve como pregunta.
- Cómo responder: compacto, números exactos, sin opinar sobre diseño ni proponer
  extras.

### Paralelo

Tareas independientes van en paralelo. Independiente significa: ninguna escribe el
mismo archivo que otra y ninguna necesita la salida de otra. Cada subagente en paralelo
escribe en su propio archivo; el orquestador junta.

### Verificación

Lo que devuelve un subagente no es verdad hasta verificarlo. Prefiero gastar tokens
que tiempo mío, y hay pedidos que no sé cómo tienen que quedar, así que la verificación
no depende de mí.

- El orquestador verifica sólo lo barato y sin abrir el contenido: totales que cierran,
  cantidades que coinciden, scripts que corren, archivos que existen.
- Todo lo que sale hacia afuera o alguien va a usar para actuar (un número a un cliente,
  un archivo a Axton, un control, código que toca cálculo) pasa por un auditor: otro
  subagente con contexto limpio que lee las fuentes originales, no el resumen del
  productor, e intenta refutarlo. Devuelve CONFIRMADO, REFUTADO o NO VERIFICABLE.
- Cambios cosméticos, ajustes visuales y cosas internas de un solo uso no pasan por
  auditor.

### Continuidad

- Un trabajo largo escribe su avance en un archivo en disco (ledger, notas de estado)
  para que cualquier subagente pueda retomarlo en otra sesión.
- Dentro de la misma sesión, si el trabajo es continuación directa, se retoma el mismo
  subagente. Si cambió la tarea o el subagente ya cargó mucho, uno nuevo con el archivo
  de avance como entrada.

### Lo que me tiene que llegar a mí

Qué subagentes corrieron, con qué modelo, qué devolvió cada uno en una línea, qué
decisiones declararon y qué quedó como pregunta de criterio. No el contenido.

## Título sugerido al cerrar cada respuesta

Cada respuesta termina con una línea que propone cómo titular ese pedido, para que
Willy lo encuentre después. Formato:

`Título sugerido: XXX · <número de decisión o unas palabras de foco>`

- `XXX` son tres letras fijas por proyecto, que siguen siendo las mismas en todos los chats.
- Después va el número de la decisión que se tocó, si el pedido toca una decisión
  numerada. Si no, dos a cinco palabras que digan en qué se trabajó.
- Es una sola línea, siempre la última de la respuesta.

### Siglas por proyecto

| Sigla | Proyecto |
|---|---|
| PPH | Portal Payroll H&A (este repo) |

Antes de titular, buscar la sigla del proyecto en esta tabla. Si el proyecto no está,
es el primero: **no inventar la sigla**, proponer dos o tres opciones a Willy, esperar
su elección y recién entonces agregarla acá.

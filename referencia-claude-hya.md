# Claude en Hidalgo & Asociados — referencia del equipo

**Verificado al 27 de julio de 2026.** Reemplaza al documento de investigación de abril de 2026
(`compass_artifact_wf-162df681...md`), que quedó completamente desactualizado: hablaba de Opus 4.6,
Sonnet 4.6 y "adaptive thinking", ninguno de los cuales es el estado actual.

Este archivo es la fuente de verdad para actualizar `casos_uso_modelos_comparativa.html`.
Si un dato de la guía HTML contradice a este archivo, gana este archivo.

---

## 1. Quién usa Claude en el equipo

Cinco usuarios en el plan de la empresa:

| Persona  | Rol                                    | Qué necesita casi siempre |
|----------|----------------------------------------|---------------------------|
| Willy    | Payroll, IT & Implementation Manager   | Fórmulas, automatizaciones, artifacts, interfaces. Es quien decide qué entra al portal. |
| Gabriela | Especialista de Implementación de Payroll | Cruces entre sistemas, entender fórmulas heredadas, documentar procesos de implementación. |
| Matías   | Gerente de Payroll                     | Reportes, comunicaciones a cliente, decisiones sobre proceso. |
| Lucas    | Programador                            | Claude Code sobre el repo, SQL, debugging real. Único perfil que necesita la pestaña técnica completa. |
| Manuel   | CEO                                    | Informes ejecutivos, decisiones, lectura rápida. Le sirve la conclusión, no la comparativa. |

**Sobre el perfil "Liquidador/a":** se mantiene en la guía como perfil de consulta, porque a
alguno del equipo le puede interesar a título personal o para explicarle el criterio a un cliente.
Pero nadie del equipo trabaja hoy como liquidador dentro del plan de la empresa, así que ese perfil
**tiene que aparecer con el aviso de datos bien visible**: si alguien lo usa desde una cuenta
personal —y sobre todo desde una cuenta gratuita— no puede pegar información de clientes.
El detalle está en `datos-y-planes-claude-hya.md`, que es el documento que hay que leer antes que este.

---

## 2. Modelos vigentes

Cuatro escalones. La regla de arranque no cambió: **empezá siempre por Sonnet 5.**

**Haiku 4.5** — el más rápido, el que menos cupo consume. Sirve para preguntas puntuales,
resúmenes cortos, clasificar o extraer datos de una lista. Claude Code también lo usa por
detrás para tareas chicas en paralelo. No lo uses para nada que tenga cálculo encadenado.

**Sonnet 5** — el default para todo el día a día: entender una fórmula, cruzar dos planillas,
redactar un mail, armar un reporte, corregir un bug puntual. Salió el 30 de junio de 2026 y
Anthropic lo describe como cercano a Opus 4.8 en capacidad.

**Opus 5** — el escalón de arriba. Salió el 24 de julio de 2026 y reemplazó a Opus 4.8.
Para cálculos riesgosos (SAC, retenciones, recálculos), cambios que tocan varios archivos, o
cualquier cosa que sale al cliente. Es el modelo por defecto del plan Max y el más capaz de Pro.

**Fable 5** — último recurso. Tareas de máxima complejidad y largo aliento: migrar un sistema
completo, auditar todo el repositorio, trabajar en modo autónomo varios minutos. Consume mucho
cupo. Con la salida de Opus 5 el margen entre ambos se volvió chico, así que **casi nunca hace
falta llegar hasta acá.** En Claude Design aparece marcado como "requires usage credits".

### Cómo medir el costo: cupo, no dólares

El equipo entra por el plan de la empresa, no por API. Nadie paga por token, así que
**la unidad correcta es cuánto cupo consume una consulta, no cuántos dólares cuesta.**
Toda referencia a `$/MTok` en la guía tiene que salir o quedar como nota al pie.

Escala relativa de consumo de cupo, de menor a mayor: Haiku 4.5 → Sonnet 5 → Opus 5 → Fable 5.
El salto grande de calidad está entre Haiku y Sonnet; de Sonnet para arriba pagás bastante
más cupo por unos pocos puntos de mejora.

Precios de lista de API, solo como referencia si alguna vez se evalúa integrar algo por fuera
del plan (**no aplican al uso diario del equipo**): Haiku 4.5 $1/$5 · Sonnet 5 $3/$15
—con precio introductorio de $2/$10 hasta el 31 de agosto de 2026— · Opus 5 $5/$25 ·
Fable 5 $10/$50, por millón de tokens de entrada/salida.

### Por qué los estimados de tokens de la guía quedaron cortos

Sonnet 5 usa un tokenizador nuevo que cuenta alrededor de 30% más tokens para el mismo texto,
con más peso en código, datos estructurados y texto que no está en inglés. O sea: justo lo que
pega este equipo. Los valores tipo "~4K" o "~2,5K" del HTML son de la generación anterior y hoy
subestiman. Otro motivo para sacar tokens de la vista del usuario final y dejarlos, si se quiere,
en la pestaña técnica.

---

## 3. La decisión que faltaba: Chat, Code o Design

No es "qué tan complejo es". Es **si alguien lo va a volver a abrir.**

**Chat** cuando lo usás hoy y lo cerrás hoy. Un simulador para verificar un caso, una tabla para
mirar un cruce, un mail, un mockup rápido para decidir. El dato lo tenés en la mano y lo pegás.

**Claude Code** cuando el resultado va a vivir en el repo, cuando otra persona lo va a abrir la
semana que viene, o cuando tocás algo que ya existe y tiene que seguir pareciéndose al resto de
las páginas. También cuando la información ya está en archivos del repo y no hace falta pegar nada.

**Claude Design** cuando lo que necesitás es la parte visual antes que el código: un deck, un
one-pager, el mockup de un formato nuevo. Después se lo pasás a Code para el HTML final.

**El modo de falla real está en el medio:** alguien arma algo en Chat, el equipo lo empieza a usar,
y queda enterrado en una conversación que nadie encuentra. Al mes siguiente se rehace de cero.
De ahí la regla, que va en la primera pantalla de la guía:

> **Si le sirve a alguien más que a vos, o lo vas a necesitar de nuevo, va por Code —
> aunque sea más rápido hacerlo en Chat.**

---

## 4. Guía interactiva: "¿No sabés qué usar?"

Especificación del bloque opcional para el HTML. Tres preguntas, respuestas predeterminadas,
resultado determinístico. Arranca cerrado, con un botón que lo abre.

**Pregunta 1 — ¿Qué querés que quede cuando termines?**

| Respuesta | Resultado |
|---|---|
| Una respuesta, un texto, un mail | Chat |
| Un archivo o pantalla para usar una o dos veces | Chat, pidiendo un artifact |
| Una página del portal que el equipo va a abrir de nuevo | Claude Code |
| Algo visual para presentar: deck, one-pager, mockup | Claude Design |

**Pregunta 2 — ¿Dónde está la información con la que hay que trabajar?**

| Respuesta | Resultado |
|---|---|
| La tengo y la puedo pegar (Excel, export, texto) | No cambia el resultado de la P1 |
| Está en archivos del portal | Claude Code, incluso si la P1 dijo Chat |
| Está en un board de Monday | Chat con el conector de Monday activo |

**Pregunta 3 — ¿Qué pasa si sale mal?**

| Respuesta | Modelo y configuración |
|---|---|
| Me doy cuenta al instante y lo rehago | Sonnet 5, esfuerzo medium, sin thinking |
| Hay números o pasos que dependen entre sí | Sonnet 5, esfuerzo high, thinking activado |
| Toca cálculo de sueldo, retenciones, o sale al cliente | Opus 5, high o xhigh, thinking activado |
| Es un cambio grande en muchos archivos, o una auditoría completa | Opus 5 en xhigh. Si no alcanza, Fable 5 — avisar antes, consume mucho cupo |

Cierre del flujo: una línea con el resultado combinado, más el recordatorio de datos si la
respuesta involucra pegar información ("¿estás en el plan de la empresa? ver manejo de datos").

---

## 5. Razonamiento y esfuerzo, en criterio

Son dos cosas distintas que se pueden combinar, y están disponibles tanto en el chat como en
Code y en Design.

**Thinking (razonamiento extendido):** Claude piensa paso a paso antes de responder y muestra ese
razonamiento aparte. La regla práctica, sin tecnicismos:

- **Prendido** cuando hay números que rastrear o pasos que dependen unos de otros: debugging de
  liquidación, fórmulas encadenadas, cruces entre sistemas, decisiones con varias variables.
- **Apagado** para escribir, redactar un mail, documentar o pensar opciones. Ahí solo lo hace más
  lento y más rígido, sin mejorar el resultado.

**Esfuerzo (effort):** cuánto a fondo trabaja en general — razonamiento más cantidad de pasos y
herramientas. Se elige al lado del selector de modelo.

| Nivel | Cuándo |
|---|---|
| Low | Consultas puntuales, alto volumen. Estira más el cupo. |
| Medium | Tareas de rutina donde no hace falta el máximo detalle. |
| **High** (default) | Razonamiento complejo, código, varios pasos. Es el default de Sonnet 5 y Opus 5. |
| Extra high (xhigh) | Tareas de código o agénticas largas. En Opus 5 es el nivel recomendado para código. |
| Max | Cuando querés la máxima profundidad sin importar tiempo ni cupo. Lo más lento y lo más caro en cupo. |

**Este bloque tiene que estar en la pestaña "Por tarea", no en la de Claude Code.** Hoy está en
la pestaña técnica, justo debajo del cartel que le dice al usuario común que no entre ahí.

---

## 6. Claude Design — corregido

La guía dice que "corre sobre Opus 4.7". Es falso y hay que sacarlo.
Verificado con captura del 27 de julio de 2026:

- Está en **Beta**, no en research preview.
- **Corre sobre cualquier modelo**: el selector ofrece Fable 5 (requiere usage credits),
  Opus 5, Sonnet 5 y Haiku 4.5, más un selector de **Effort** propio. Opus 5 viene seleccionado.
- Tiene **design systems propios ya cargados**, incluido el "H&A Design System", y desde la semana
  del 20 de julio también trae design systems incorporados de fábrica.
- **Exporta a** PDF (ahora con elección de tamaño de página), PowerPoint, HTML, Google Slides
  directo desde el menú de exportación, y permite **publicar un diseño como artifact público**
  accesible por link.
- Sigue siendo solo front-end: no arma base de datos ni lógica de servidor.

Recomendación de mantenimiento: no volver a escribir en la guía sobre qué modelo corre por debajo
de una herramienta. Es un dato que envejece solo y no cambia cómo se usa.

---

## 7. Ultracode

No es un modelo, es un modo que se activa sobre Sonnet 5, Opus 5 o Fable 5. Reparte una tarea
grande entre varios agentes en paralelo y después cruza los resultados. Hay que pedirlo
explícitamente. Sirve para auditar todo el repo, para un cambio que se repite en muchas páginas,
o para una revisión previa a publicar. No sirve para un fix puntual, y consume bastante más cupo
que un pedido normal.

---

## 8. Decisiones cerradas para la v4 del HTML

1. Bloque "¿Chat o Code?" arriba, antes de las pestañas, con la regla del punto 3.
2. Guía interactiva opcional con las tres preguntas del punto 4.
3. Sección de manejo de datos, según `datos-y-planes-claude-hya.md`.
4. Sacar `$/MTok` como eje y pasar todo a consumo de cupo. El equipo no usa API.
5. Podar la pestaña Claude Code: CursorBench, Frontier-Bench, ARC-AGI 3 y OSWorld salen. Se
   reemplazan por una línea: *"Opus 5 salió al mismo precio que 4.8 y rinde bastante más;
   seguí arrancando por Sonnet."*
6. Sacar la atribución de modelo de Claude Design y actualizar el bloque con el punto 6.
7. Subir thinking y esfuerzo a "Por tarea", como criterio y no como escalera de niveles.
8. Definir si los códigos de concepto del ejemplo de fórmulas encadenadas quedan o se
   reemplazan por genéricos. **Pendiente de decisión.**

Los porcentajes de confianza de la pestaña "Por tarea" siguen siendo estimaciones internas del
equipo, medidas sobre el escalón Opus anterior. No inventar valores nuevos: o se revalidan con
casos propios, o se dejan con la nota de procedencia que ya tienen.

---

## 9. Fuentes

- Precios oficiales: <https://platform.claude.com/docs/en/about-claude/pricing>
- Anuncio de Claude Opus 5 (24 jul 2026): <https://www.anthropic.com/news/claude-opus-5>
- Anuncio de Claude Sonnet 5 (30 jun 2026): <https://www.anthropic.com/news/claude-sonnet-5>
- Fable 5 y Mythos 5 (9 jun 2026): <https://www.anthropic.com/news/claude-fable-5-and-claude-mythos-5>
- Restablecimiento de acceso a Fable 5 (1 jul 2026): <https://www.anthropic.com/news/fable-mythos-access>
- Manejo de datos en Claude Code: <https://docs.anthropic.com/en/docs/claude-code/data-usage>
- Centro de privacidad: <https://privacy.claude.com>

Claude Design se verificó por captura de pantalla del producto, no por documentación publicada.

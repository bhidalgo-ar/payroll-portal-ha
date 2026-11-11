# Claude en Hidalgo & Asociados — referencia del equipo

**Verificado al 28 de septiembre de 2026** (Haiku 5.5, el 20 de octubre de 2026; modelos vigentes, anuncios oficiales, guías de prompting de §9 y consejos para Haiku 5.5 de §2, el 30 de octubre de 2026; Fable 5.2 —tabla de modelos vigentes, anuncio, guía de prompting y consejos de §2—, el 11 de noviembre de 2026). Reemplaza al documento de investigación de abril de 2026
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

Cuatro escalones. La regla de arranque no cambió: **empezá siempre por Sonnet 5.5.** Regla de bolsillo: Sonnet para escribir y armar, Opus para pensar y revisar.

**Haiku 5.5** — el más rápido, el que menos cupo consume. Es el primer Haiku con niveles de esfuerzo (por defecto, Medium). Sirve para preguntas puntuales,
resúmenes cortos, clasificar o extraer datos de una lista. Claude Code también lo usa por
detrás para tareas chicas en paralelo. No lo uses para nada que tenga cálculo encadenado.
Cómo pedirle (guía oficial de prompting de Haiku 5.5): Low es el nivel más rápido, para preguntas cortas y
pedidos simples en cantidad; pedirle que responda directo no evita que piense, lo que lo regula es el
esfuerzo; si tiene búsqueda web, darle la fecha de hoy hace que se apoye en resultados recientes (con
esfuerzo bajo o instrucciones largas a veces no busca); en tareas largas de agente con instrucciones largas
(por ejemplo, en Claude Code) y esfuerzo Low a veces se frena antes de terminar, y subir a Medium lo reduce
(a cambio de más consumo). En la guía HTML son los cuatro consejos de su tarjeta.

**Sonnet 5.5** — el default para todo el día a día: entender una fórmula, cruzar dos planillas,
redactar un mail, armar un reporte, corregir un bug puntual. En Claude Code se elige con
`/model sonnet` (Sonnet 5.5 desde la v2.1.284).

**Opus 5.5** — el escalón de arriba. Para cálculos riesgosos (SAC, retenciones, recálculos),
cambios que tocan varios archivos, o cualquier cosa que sale al cliente. En Claude Code con el
plan Team Standard es el modelo por defecto (desde la v2.1.280).

**Fable 5.2** — último recurso (reemplazó a Fable 5.1 como vigente el 9 de noviembre de 2026; Fable 5.1 pasó a modelo anterior, todavía disponible). Tareas de máxima complejidad y largo aliento: migrar un sistema
completo, auditar todo el repositorio, trabajar en modo autónomo varios minutos. Consume mucho
cupo. **Solo se llega después de dos fallas de Opus 5.5 en Extra high**, y avisando antes. Para el equipo solo
está disponible con Créditos de Uso (hoy no habilitados) y solo lo tienen los asientos premium.
Cómo pedirle (guía oficial de prompting de Fable 5.2): en tareas largas a veces corta antes de terminar,
sobre todo en Low o Medium; pedirle que responda directo no evita que piense en Medium o más, lo que lo
regula es el esfuerzo; las reglas de aprobación las aplica al pie de la letra, así que al darle el OK hay que
nombrar el paso (no un "dale"); y después de una tarea larga conviene pedirle un cierre que se entienda
solo. En la guía HTML son los cuatro consejos de su tarjeta.

**Oferta de lanzamiento de Fable 5.2 (temporal; pedido de Willy del 11/11/2026: va bien visible en la guía).**
Según <https://support.claude.com/en/articles/17506494>: en asientos estándar de Team, Fable incluido hasta el
50 % del cupo semanal desde el 9/11 hasta el 16/11/2026 a las 23:59 hora del Pacífico (17/11 04:59 en Argentina),
más 1 restablecimiento del límite de Fable que vence ese mismo día. En asientos premium, de 1 a 3 restablecimientos
según la antigüedad de la organización (menos de 6 meses: 1; de 6 a 12: 2; más de 12: 3), iguales para todos los
asientos premium, que vencen el 8/3/2027 a las 23:59 hora del Pacífico (9/3/2027 04:59 en Argentina). Un
restablecimiento devuelve el uso gastado en Fable y rellena la ventana de 5 horas; no sube los límites. Se usa en
Configuración → Uso → "Limit resets" → "Reset for free". Solo para quienes estaban en la organización antes del
9/11/2026 a las 10:00 hora del Pacífico; no se transfieren. En la guía HTML es el aviso arriba de las tarjetas, que
se oculta solo al vencer (la línea de asientos estándar, el 17/11; el aviso entero, el 9/3/2027). Pasadas esas
fechas vuelve a valer lo de arriba: en asientos estándar, Fable solo con Créditos de Uso.

**Fable 5.2 en la comparativa oficial (pedido de Willy del 11/11/2026).** Su anuncio solo publica AA-Briefcase v1.1
(no GDPval-AA): Fable 5.2 1785 Elo, y en esa misma medición Opus 5.5 1800 y Fable 5.1 1669 (esfuerzo más alto
disponible de cada modelo). En la guía va solo en "Tareas largas", con el aviso de que es otra medición que la del
anuncio de Sonnet 5.5 (donde Opus 5.5 tiene 1822; los anuncios no explican la diferencia). En la misma fila, por
rúbrica, Fable 5.2 66,1 % contra 61,2 % de Opus 5.5: también va en la nota.

**"¿Más esfuerzo o un modelo más grande?" (pedido de Willy del 11/11/2026).** Bloque al pie de la Comparativa oficial
con siete comparaciones textuales de los anuncios de Fable 5.2, Opus 5.5 y Sonnet 5.5 (modelo y esfuerzo contra
modelo y esfuerzo, con el costo por tarea relativo tal como lo dice Anthropic: "about", "roughly", "less than
one-tenth") y tres reglas: el modelo nuevo en Low/Medium alcanzó al anterior en Max en varias pruebas (no en todas);
la mayor parte de la mejora llega en High (guía de Fable 5.2); Max no siempre es mejor (Sonnet 5.5 en FrontierCode
v1.1). Los anuncios no publican el valor de cada punto de sus gráficos de esfuerzo: no se leen a ojo. No mezclar
FrontierCode 2.0 (anuncio de Fable 5.2) con FrontierCode v1.1 (anuncios de Opus y Sonnet 5.5).

### Cómo medir el costo: cupo, no dólares

El equipo entra por el plan de la empresa, no por API. Nadie paga por token, así que
**la unidad correcta es cuánto cupo consume una consulta, no cuántos dólares cuesta.**
Ninguna referencia a `$/MTok` ni a precios de API va en la guía.

Escala relativa de consumo de cupo, de menor a mayor: Haiku 5.5 → Sonnet 5.5 → Opus 5.5 → Fable 5.2. En la guía las barras van en escalones parejos
(25/50/75/100): son visuales, no una medición.
El salto grande de calidad está entre Haiku y Sonnet; de Sonnet para arriba pagás bastante
más cupo por unos pocos puntos de mejora.

Los precios de API y los estimados de tokens salieron de la guía: el equipo no usa API y las cifras
de tokens eran de la generación anterior.

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
| Me doy cuenta al instante y lo rehago | Sonnet 5.5, esfuerzo Medium |
| Hay números o pasos que dependen entre sí | Sonnet 5.5, esfuerzo Medium; si no cierra, High |
| Toca cálculo de sueldo, retenciones, o sale al cliente | Opus 5.5, High o Extra high |
| Es un cambio grande en muchos archivos, o una auditoría completa | Opus 5.5 en Extra high. Fable 5.2 solo tras dos fallas de Opus 5.5 en Extra high, avisando antes |

Cierre del flujo: una línea con el resultado combinado, más el recordatorio de datos si la
respuesta involucra pegar información ("¿estás en el plan de la empresa? ver manejo de datos").

---

## 5. Esfuerzo, en criterio

El esfuerzo regula cuánto trabajo hace Claude por pedido: cuántos archivos abre, cuánto verifica y
hasta dónde avanza antes de volver a preguntar. Ya no hay un interruptor de thinking aparte: la
perilla es el nivel de esfuerzo, y se elige al lado del selector de modelo (en Code, con `/effort`).

**Escalera:** primero subir el esfuerzo, después cambiar de modelo. Fable 5.2 solo tras dos fallas
de Opus 5.5 en Extra high. Regla de bolsillo: Sonnet para escribir y armar, Opus para pensar y
revisar. El criterio para empezar es **Medium**; cada caso de "Por tarea" trae cuándo subirlo
(criterio del equipo, no medido).

| Nivel | Cuándo |
|---|---|
| Low | Consultas puntuales, alto volumen. Estira más el cupo. |
| **Medium** (default en las apps) | Tareas de rutina donde no hace falta el máximo detalle. |
| High | Razonamiento complejo, código, varios pasos. Es el default de Sonnet 5.5 en la API. |
| Extra high (xhigh) | Tareas de código o agénticas largas. Último escalón antes de pensar en cambiar de modelo. |
| Max | Cuando querés la máxima profundidad sin importar tiempo ni cupo. Lo más lento y lo más caro en cupo. |

Este bloque vive en la sección "Niveles de esfuerzo" de la guía.

---

## 6. Claude Design — corregido

La guía dice que "corre sobre Opus 4.7". Es falso y hay que sacarlo.
Verificado con captura del 27 de julio de 2026 (Beta y "sin atribución de modelo" se reafirmaron el 28/09):

- Está en **Beta**, no en research preview.
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

No es un modelo, es un modo que se activa sobre Sonnet 5.5, Opus 5.5 o Fable 5.1. Reparte una tarea
grande entre varios agentes en paralelo y después cruza los resultados. Hay que pedirlo
explícitamente. Sirve para auditar todo el repo, para un cambio que se repite en muchas páginas,
o para una revisión previa a publicar. No sirve para un fix puntual, y consume bastante más cupo
que un pedido normal.

---

## 8. Decisiones cerradas para la v4 del HTML

1. Bloque "¿Chat o Code?" arriba, con la regla del punto 3.
2. Guía interactiva opcional con las tres preguntas del punto 4.
3. Sección de manejo de datos, según `datos-y-planes-claude-hya.md`.
4. Sacar `$/MTok` como eje y pasar todo a consumo de cupo. El equipo no usa API.
5. Podar la pestaña Claude Code: CursorBench, Frontier-Bench, ARC-AGI 3 y OSWorld salen. Se
   reemplazan por las líneas de la novedad de Opus 5.5 (default de Team Standard, `/model sonnet`,
   `/effort`), sin cifras.
6. Sacar la atribución de modelo de Claude Design y actualizar el bloque con el punto 6.
7. Subir thinking y esfuerzo a "Por tarea", como criterio y no como escalera de niveles.
8. Definir si los códigos de concepto del ejemplo de fórmulas encadenadas quedan o se
   reemplazan por genéricos. **Pendiente de decisión.**

Los porcentajes de confianza de "Por tarea" siguen siendo estimaciones internas del equipo,
medidos sobre el escalón anterior, pendiente de re-medir. No inventar valores nuevos: o se revalidan con
casos propios, o se dejan con la nota de procedencia que ya tienen.

---

## 9. Fuentes

- Opus 5.5: <https://www.anthropic.com/claude-opus-5-5>
- Sonnet 5.5: <https://www.anthropic.com/claude-sonnet-5-5>
- Haiku 5.5: <https://www.anthropic.com/claude-haiku-5-5>
- Guía de prompting de Haiku 5.5 (español): <https://platform.claude.com/docs/es/build-with-claude/prompt-engineering/prompting-claude-haiku-5-5>
- Guía de prompting de Sonnet 5.5 (español): <https://platform.claude.com/docs/es/build-with-claude/prompt-engineering/prompting-claude-sonnet-5-5>
- Guía de prompting de Opus 5.5 (español): <https://platform.claude.com/docs/es/build-with-claude/prompt-engineering/prompting-claude-opus-5-5>
- Guía de prompting de Fable 5.2 (español): <https://platform.claude.com/docs/es/build-with-claude/prompt-engineering/prompting-claude-fable-5-2>
- Fable 5.2 (anuncio oficial del 9 de noviembre de 2026, presentado junto con Mythos 5.2): <https://www.anthropic.com/claude-fable-and-mythos-5-2>
- Fable en los planes (soporte): <https://support.claude.com/en/articles/15424964-claude-fable-models-on-your-plan>
- Esfuerzo en Claude Code (claude.dev): <https://claude.dev/blog/spending-your-effort/>
- Opus 5.5 en Claude y Claude Code (claude.dev): <https://claude.dev/blog/getting-the-most-out-of-opus-5-5/>
- Qué cuesta una tarea en Opus 5.5 (claude.dev): <https://claude.dev/blog/what-a-task-costs-on-opus-5-5/>
- Manejo de datos en Claude Code: <https://docs.anthropic.com/en/docs/claude-code/data-usage>
- Centro de privacidad: <https://privacy.claude.com>

Los cuatro anuncios oficiales y las cuatro guías de prompting de esta lista se volvieron a abrir el 30 de octubre de 2026;
la tabla de modelos vigentes (§2) se contrastó ese día con <https://platform.claude.com/docs/en/about-claude/models/overview>.
El 11 de noviembre de 2026 se volvió a contrastar esa tabla (Fable 5.2 vigente, Fable 5.1 en modelos anteriores) y se
abrieron el anuncio y la guía de prompting de Fable 5.2, que reemplazan a los de Fable 5.1.
Los links de claude.dev salieron de una búsqueda: el dominio está bloqueado en el entorno y no se abrieron.
Claude Design se verificó por captura de pantalla del producto, no por documentación publicada.

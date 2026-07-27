# Qué se puede subir a Claude — y desde qué cuenta

**Verificado al 27 de julio de 2026.** Leer esto antes que cualquier otra parte de la guía.
Ante cualquier duda sobre un caso concreto, consultar con IT antes de pegar nada.

---

## La regla corta

**Lo que define si podés subir información de un cliente no es qué información es: es desde qué
cuenta estás entrando.**

| Desde dónde entrás | Podés trabajar con información de clientes |
|---|---|
| Plan de la empresa (Team de H&A) | **Sí.** El contenido no se usa para entrenar modelos. |
| Cuenta personal paga (Pro o Max) | **Solo después de revisar la configuración y avisar a IT.** Ver abajo. |
| Cuenta gratuita (Free) | **No. Nunca.** Ni datos de empleados, ni de clientes, ni documentos internos. |

---

## Por qué la cuenta personal es distinta

Los planes individuales —Free, Pro y Max, incluyendo Claude Code usado desde esas cuentas— se
rigen por los Términos de Consumidor, no por los términos comerciales. Ahí hay una opción de
privacidad que decide si tus conversaciones se usan para mejorar los modelos de Anthropic.

Lo que cambia según cómo esté esa opción:

- **Activada:** las conversaciones nuevas o reanudadas quedan disponibles para entrenamiento y se
  retienen hasta **5 años**.
- **Desactivada:** no se usan para entrenamiento y la retención vuelve al estándar de **30 días**.

Se revisa y se cambia en cualquier momento acá: <https://claude.ai/settings/data-privacy-controls>
(o Configuración → Privacidad → "Help improve Claude" / "Ayudá a mejorar Claude").

Dos cosas importantes que suelen pasarse por alto. Primero: apagar la opción **no borra
retroactivamente** lo que ya se usó para entrenar. Segundo: esa información queda asociada a la
licencia personal del usuario, no a la empresa — o sea, H&A no tiene forma de administrarla,
auditarla ni darla de baja cuando esa persona deja de usar la cuenta. Por eso, aunque la opción
esté apagada, **el trabajo con datos de clientes va por el plan de la empresa.**

En el plan Team de H&A esto no aplica: los planes comerciales (Team, Enterprise y API) no usan el
contenido para entrenar modelos y mantienen retención estándar de 30 días.

Nota aparte: las conversaciones en modo incógnito nunca se usan para entrenamiento, cualquiera sea
la configuración de la cuenta. Y las conversaciones marcadas por los sistemas de seguridad de
Anthropic como posible violación de las políticas de uso pueden retenerse más tiempo que el
estándar, en cualquier plan.

---

## Qué se puede pegar y qué no

Vale en el plan de la empresa. En cuenta personal, nada de esto reemplaza la conversación con IT.

**Se puede:**

- Queries SQL, estructuras de tablas, DDL
- Fórmulas y lógica de cálculo
- Configuraciones de sistema y parámetros de proceso
- Textos y borradores para revisar
- Datos estadísticos agregados y reportes
- Project plans y cronogramas

**No se puede, en ningún plan:**

- DNI, CUIL/CUIT, datos bancarios
- Contraseñas, API keys, tokens de acceso
- Strings de conexión a bases de datos
- Datos de salud de empleados
- Información bajo NDA sin autorización expresa

---

## Anonimizar antes de subir

Si necesitás analizar datos de personas, reemplazá nombres por identificadores genéricos
(`Empleado_001`), quitá los documentos completos, y saquá cualquier campo que permita reconstruir
la identidad. Con eso se puede trabajar el 90% de los casos —cruces, estadísticas, detección de
anomalías— sin exponer nada.

Regla de contexto, por si aparece la duda: los modelos actuales manejan 1 millón de tokens de
contexto, así que **un export mensual completo entra sin problema.** El límite no es técnico:
es qué corresponde subir.

---

## Enlaces oficiales

- Configuración de privacidad de la cuenta: <https://claude.ai/settings/data-privacy-controls>
- Centro de privacidad de Anthropic: <https://privacy.claude.com>
- Política de privacidad: <https://www.anthropic.com/legal/privacy>
- Manejo y retención de datos en Claude Code: <https://docs.anthropic.com/en/docs/claude-code/data-usage>

Las políticas cambian. Si este documento tiene más de tres meses, revalidar contra los enlaces
antes de usarlo como respaldo de una decisión.

---
name: claude-branding
description: Aplica la identidad visual oficial de Anthropic/Claude (colores de marca y tipografía) a cualquier artifact, página o documento que se beneficie de tener el look-and-feel de Claude. Usar cuando se pidan colores de marca, guías de estilo, formato visual o estándares de diseño corporativo de Anthropic/Claude.
---

# Anthropic Brand Styling

## Overview

Para acceder a la identidad de marca oficial y los recursos de estilo de Anthropic, usar esta skill.

**Keywords**: branding, identidad corporativa, identidad visual, post-processing, styling, colores de marca, tipografía, marca Anthropic, formato visual, diseño visual

## Brand Guidelines

### Colors

**Main Colors:**

- Dark: `#141413` - Texto principal y fondos oscuros
- Light: `#faf9f5` - Fondos claros y texto sobre fondo oscuro
- Mid Gray: `#b0aea5` - Elementos secundarios
- Light Gray: `#e8e6dc` - Fondos sutiles

**Accent Colors:**

- Orange: `#d97757` - Acento primario
- Blue: `#6a9bcc` - Acento secundario
- Green: `#788c5d` - Acento terciario

### Typography

- **Headings**: Poppins (fallback Arial)
- **Body Text**: Lora (fallback Georgia)
- **Nota**: para mejores resultados, las fuentes deberían estar preinstaladas en el entorno; si no están disponibles, usar automáticamente el fallback correspondiente.

## Features

### Smart Font Application

- Aplica la fuente Poppins a los títulos (24pt o más)
- Aplica la fuente Lora al texto de cuerpo
- Recurre automáticamente a Arial/Georgia si las fuentes custom no están disponibles
- Preserva la legibilidad en todos los sistemas

### Text Styling

- Títulos (24pt+): fuente Poppins
- Texto de cuerpo: fuente Lora
- Selección de color inteligente según el fondo
- Preserva jerarquía y formato del texto

### Shape and Accent Colors

- Las formas que no son texto usan los colores de acento
- Rota entre los acentos naranja, azul y verde
- Mantiene interés visual sin salirse de la marca

## Aplicación en HTML/CSS

Para páginas o artifacts web (no solo PowerPoint), mapear las guías de marca así:

```css
:root {
  --brand-dark: #141413;
  --brand-light: #faf9f5;
  --brand-mid-gray: #b0aea5;
  --brand-light-gray: #e8e6dc;
  --brand-orange: #d97757;
  --brand-blue: #6a9bcc;
  --brand-green: #788c5d;
}
body { font-family: 'Lora', Georgia, serif; }
h1, h2, h3, .heading { font-family: 'Poppins', Arial, sans-serif; }
```

- Usar como máximo los 3 acentos oficiales (naranja/azul/verde) con un significado fijo y consistente en toda la página — no inventar colores adicionales por categoría o componente.
- Evitar degradés/gradientes decorativos por card o sección; preferir fondos planos en Light/Light Gray y reservar el color para el acento de marca.
- El naranja oficial es `#d97757` (coral/salmón) — no confundir con tonos ámbar/mostaza más saturados como `#D97706`.

## Technical Details

### Font Management

- Usa las fuentes Poppins y Lora instaladas en el sistema cuando están disponibles
- Fallback automático a Arial (títulos) y Georgia (cuerpo)
- No requiere instalación de fuentes — funciona con las fuentes del sistema existentes
- Para mejores resultados, preinstalar las fuentes Poppins y Lora en el entorno

### Color Application

- Usa valores de color RGB para un match preciso de marca
- En PowerPoint/python-pptx, aplicar vía la clase `RGBColor`
- En HTML/CSS, aplicar vía variables CSS (`:root`) para mantener un único punto de verdad
- Mantiene fidelidad de color entre distintos sistemas

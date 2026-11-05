# MarketHub AI — Contrato de fidelidad visual aprobado

**Norma del proyecto (5 de noviembre de 2026):** cuando se solicita que algo sea «igual» o «como si se viese en un espejo», el resultado debe corresponder al diseño elegido, no a una interpretación estética alternativa. Los cambios de elementos, composición, colores o proporciones no se sustituyen por propuestas nuevas sin una nueva elección explícita.

## Cuatro referencias oficiales

| Pantalla | Archivo original de referencia | Aplicación |
| --- | --- | --- |
| 01 · Pantalla principal | `assets/boceto-01-inicio-original.jpeg` | Escritorio: navegación lateral, seis KPI, rendimiento, calendario, asistente, próximos contenidos, campañas, escucha, bandeja y conexiones |
| 02 · Estudio creativo | `assets/boceto-02-estudio-original.jpeg` | Columnas de herramientas, zona central de edición, línea de tiempo, recomendaciones, paneles inferiores y plantillas |
| 03 · Versión móvil | `assets/boceto-03-movil-original.jpeg` | Menús y tarjetas para iPhone/iPad/Android/tablet, navegación inferior Inicio/Crear/Planificar/Bandeja/Más |
| 04 · Pantalla de carga | `assets/boceto-04-carga-original.jpeg` | Esfera luminosa, logo M, seis funciones, ondas neón, progreso animado y entrada a la app |

Las cuatro imágenes se conservan **sin recomprimir** en sus archivos `-original.jpeg`. Los correspondientes `.webp` son derivados ligeros para uso técnico, no sustitutos de referencia. El test `tests/reference.test.mjs` verifica los hashes SHA-256 de los JPEG originales para detectar cambios no solicitados. Se pueden abrir desde `referencias.html` en el sitio.

## Reglas de implementación y aceptación

1. La imagen original es fuente de verdad para la apariencia, no fuente de datos ni de funciones reales.
2. Los elementos visuales se reproducen respetando ubicación relativa, densidad, disposición, iconos, tonos y efectos. En pantallas más pequeñas se reorganizan los paneles sin ocultar funciones.
3. La pantalla de carga panorámica puede usar directamente el JPEG original como referencia visual, con una barra de progreso **real** superpuesta; la variante vertical debe conservar el mismo lenguaje gráfico.
4. Los botones deben conducir a funciones reales o indicar que están pendientes. Nunca representar publicaciones, conexiones de redes, mensajes, resultados, anuncios, recomendaciones IA o cobros comerciales ficticios como reales.
5. FREE debe ofrecer utilidades locales; PRO de demostración no puede presentar anuncios, sin afirmar que existe una suscripción pagada.
6. Antes de declarar «idéntico», verificar comparaciones de capturas en las resoluciones de referencia (escritorio, smartphone y tablet) y pasar `npm test`. Los tests estructurales **no** demuestran igualdad visual ni funcionamiento nativo.
7. Ninguna mejora debe eliminar módulos, copias locales, borradores, navegación o los requisitos anteriores del proyecto.

## Estado

Las referencias originales están incorporadas; el panel y estudio tienen una implementación HTML/CSS interactiva y la pantalla de carga utiliza la ilustración aprobada en panorámico. **La paridad visual píxel a píxel de la interfaz funcional aún requiere medición y corrección en dispositivos reales.** No se debe afirmar que ya se ha logrado.

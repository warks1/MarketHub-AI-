# MarketHub AI — Compatibilidad y publicación en tiendas

**Objetivo confirmado:** la aplicación terminada se distribuirá en Apple App Store, Google Play y Microsoft Store. La misma interfaz debe funcionar en iPhone, iPad, móviles y tablets Android, Windows y Mac, con teclado/ratón y táctil. Documento de requisitos: 5 de noviembre de 2026.

## Referencias visuales vinculantes

Los cuatro archivos ORIGINALES guardados en assets/ son la fuente del diseño, no propuestas para sustituir:
- **01 · Principal:** barra lateral, métricas, gráfico de rendimiento, calendario, IA, campañas, escucha social, bandeja y conexiones, con brillo cian/fucsia/violeta y marcos luminosos.
- **02 · Estudio creativo:** editor de vídeo e imagen con herramientas, previsualización, línea de tiempo, recomendaciones, métricas y plantillas.
- **03 · Móvil:** navegación inferior y menú Más, orden de los módulos, editor y planificador adaptados a la altura, orientación y tacto.
- **04 · Carga:** esfera y logo originales con animación y barra de progreso real; posibilidad de saltar el inicio.

Los originales se pueden consultar en referencias.html sin modificaciones. La interfaz operativa debe reproducirlos con la mayor fidelidad posible, pero conservar controles accesibles: no sustituir una pantalla funcional por una única foto.

## Plataformas, empaquetado y situación

| Destino | Base técnica | Estado actual | Siguiente puerta de salida |
|---|---|---|---|
| iPhone y iPad · Apple App Store | Capacitor 8 y Xcode | Proyecto web adaptable; no compilado en dispositivos | Generar proyecto iOS, probar con TestFlight, firmar y enviar a App Store Connect |
| Móviles/tablets Android · Google Play | Capacitor 8 y Android Studio | Proyecto web adaptable; no existe AAB firmado de tienda | Pruebas en terminales, AAB firmado, pista de pruebas Play Console y revisión |
| PC Windows · Microsoft Store | PWA HTTPS, manifiesto, iconos, service worker | Base PWA instalable; PWABuilder no verificado | Analizar en PWABuilder y empaquetar para Partner Center |
| Mac · Safari/Chrome/Edge | Web responsive y PWA donde esté admitida | Sin pruebas físicas de escritorio Mac | Validar navegadores y ventanas redimensionables; una distribución Mac App Store sería adicional |
| PC, Mac y tablets por navegador | Vite y estilos responsive | Prototipo web | Tests de ratón, teclado, orientación y accesibilidad |

## Requisitos oficiales a comprobar al lanzar

- **Apple (noviembre 2026):** carga de apps con Xcode 26 o posterior y SDK iOS/iPadOS 26 o posterior; Apple exige software completo, útil más allá de un sitio web envuelto, probado en dispositivos. Reconsultar requisitos al publicar: https://developer.apple.com/news/upcoming-requirements/ y https://developer.apple.com/app-store/review/guidelines/es/
- **Google Play (noviembre 2026):** apps nuevas y actualizaciones de móvil deben apuntar a Android 16 / nivel API 36 o superior desde el 31 de agosto de 2026. Revalidar los requisitos cuando se prepare el AAB: https://support.google.com/googleplay/android-developer/answer/11926878
- **Microsoft Store:** la PWA requiere web HTTPS, manifiesto, service worker y evaluación de PWABuilder; registrar app en Partner Center, generar paquetes y superar certificación: https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps/how-to/microsoft-store
- **Capacitor 8:** iOS requiere macOS y Xcode 26 o superior; Android requiere Android Studio y SDK: https://capacitorjs.com/docs/getting-started/environment-setup

## Matriz de pantallas antes de declarar finalizada la aplicación

| Tamaño de prueba | Entorno | Criterios |
|---|---|---|
| 320, 375, 390 y 430 px | iPhone / Android | Menús accesibles, teclado virtual, zonas seguras, texto completo, carga |
| 768, 1024 y 1280 px | Tablets y portátiles | Cambio automático entre columnas, uso táctil y ratón, rotación |
| 1440, 1920 y 2560 px | PC/Mac | Sidebar y paneles completos, edición amplia, varias ventanas |
| 3840 px | Pantallas UHD | Sin escalado desproporcionado y sin desbordamiento |

## Puertas de lanzamiento obligatorias

- [ ] Comparar visualmente en cada resolución con bocetos 01–04; corregir diferencias.
- [ ] Autenticación, proyectos y sincronización segura reales, sin depender exclusivamente de datos locales.
- [ ] Herramientas reales de IA, vídeo, diseño, calendario, campañas y analítica con costes controlados.
- [ ] Integraciones de redes sociales exclusivamente con OAuth y APIs autorizadas y pruebas de publicación.
- [ ] FREE: anuncios reales identificados, consentimiento y cuotas; PRO: suscripción mensual verificada y ningún anuncio; restaurar compras.
- [ ] Privacidad, RGPD, seguridad, soporte, términos de servicio y medidas antiabuso.
- [ ] Compilación nativa firmada, pruebas en dispositivos físicos, capturas reales, iconos nativos, pruebas de accesibilidad.
- [ ] Cuentas de desarrollador, metadatos legales, identidad comercial, descripciones veraces y revisiones de tiendas.
- [ ] Ningún botón de demostración puede hacerse pasar por una función comercial integrada.

**Situación actual:** prototipo en desarrollo; NO está subido ni aprobado en ninguna de las tres tiendas.

## Regla adicional de fidelidad estricta — v0.5.0

No volver a generar diseños alternativos. Los cuatro JPEG originales son la única fuente de verdad de la apariencia elegida. No aplicar `flip`, filtros cromáticos ni cambios de composición. Para apps nativas, las imágenes deben copiarse a `public/assets` conservando el hash del original; la navegación real se implementa mediante controles accesibles sobre las vistas aprobadas mientras se completa el componente dinámico equivalente. Las métricas fotografiadas son ilustrativas.

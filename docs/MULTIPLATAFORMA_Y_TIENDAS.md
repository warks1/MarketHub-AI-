# MarketHub AI — Matriz de compatibilidad, fidelidad y salida a tiendas
Actualizado: 2026-11-05 · Estado: **prototipo, no publicado en tiendas**.

## Norma de diseño aceptada
Los cuatro bocetos que aportó el propietario son la **referencia visual vinculante**:
- **Boceto 01 / principal:** distribución de tarjetas KPI, gráfico por plataformas, calendario, asistente, contenido, campañas, Social Listening, bandeja y conexiones.
- **Boceto 02 / estudio:** barra lateral, creación por formatos, editor de vídeo, herramientas, recomendaciones IA, línea de tiempo, métricas y plantillas.
- **Boceto 03 / móvil:** menús superiores adaptados, navegación inferior Inicio · Crear · Planificar · Bandeja · Más, páginas por columnas y controles táctiles.
- **Boceto 04 / carga:** logo M en esfera con órbitas, tarjetas flotantes, olas cyan/magenta, progreso animado y copyright.
Los archivos de referencia seleccionados se conservan **sin modificaciones** en `assets/boceto-01-inicio.webp`, `boceto-02-estudio.webp`, `boceto-03-movil.webp` y `boceto-04-carga.webp`. La galería `referencias.html` permite compararlos con las pantallas funcionales.
**Regla:** no sustituir estos diseños por otros «similares» ni reducir u omitir módulos. Se admite solo la redistribución necesaria para legibilidad, uso táctil, accesibilidad y tamaños de ventana.

## Plataformas de ejecución
| Plataforma | Interfaz requerida | Paquete de distribución proyectado | Estado |
|---|---|---|---|
| Windows 10/11 | Ratón, teclado, pantalla táctil y ventana redimensionable | Web/PWA instalable; Microsoft Store vía PWABuilder | Web en pruebas; tienda no publicada |
| Mac | Trackpad, teclado y ventana redimensionable | Navegador/PWA; estudiar app nativa macOS si procede | Web en pruebas; tienda no publicada |
| iPhone | Touch, notch, safe areas, zoom y orientación | Capacitor iOS → archivo IPA firmado → App Store | Configuración base; sin compilación nativa final |
| iPad | Touch/teclado, tamaño adaptable, multitarea | Capacitor iOS/iPadOS → App Store | Configuración base; sin compilación nativa final |
| Android | Touch, safe areas, diversidad de densidades | Capacitor Android → AAB firmado → Google Play | Configuración base; sin paquete comercial |
| Tablets Android | Touch/teclado, landscape y portrait | Mismo paquete Android adaptable | Sin verificación final |

Diseño y lógica compartidos. La disponibilidad comercial queda supeditada a la política de cada plataforma y a las pruebas nativas.

## Pruebas obligatorias antes de terminar
1. Visual: comparar pantallas reales 01–04 con sus referencias, posición por posición. Registrar diferencias; no declarar «idéntico» antes de completar las comprobaciones.
2. Interacción: probar **todos** los botones, menú Más, controles por ratón/touch, edición, descarga PNG, copia JSON, CSV, borrado con confirmación y salida de modales.
3. Respuesta: 320, 360, 390, 430, 768, 1024, 1366, 1920 y 2560 px, zoom 200 %, modo vertical/horizontal, teclado móvil, safe areas, movimiento reducido.
4. Arranque: Chrome Android, Safari iOS, Safari macOS, Edge Windows; online/offline y cachés de versiones anteriores; sin pantalla blanca ni pérdida de datos.
5. Seguridad, privacidad y rendimiento: CSP, gestión de secretos, protección del backend, consentimiento GDPR/ePrivacy y cumplimiento de tiendas.
6. Integraciones reales: OAuth de redes, permisos, conectores, IA, almacenamiento, cuotas verificadas, publicación multired, analítica y soporte.
7. Modelo FREE/PRO: FREE con anuncios **reales autorizados** y límites útiles; PRO **sin anuncios**; compras verificadas en backend y restablecimiento de suscripción. Los anuncios demo no generan ingresos.

## Canales de publicación (no enviar prototipos incompletos)
**Apple App Store:** Xcode en Mac; alta y configuración de App Store Connect; bundle ID definitivo, firma, políticas de privacidad, datos de usuario, compras in-app conforme a las reglas de Apple, pruebas TestFlight y revisión. Apple exige funcionalidad completa y que no sea solo una web empaquetada. [Directrices Apple](https://developer.apple.com/app-store/review/guidelines/).

**Google Play:** Play Console, identidad y fichas completas, AAB firmado, controles de datos, permisos, facturación integrada según las reglas aplicables y pruebas. **Nuevas apps/actualizaciones desde 31 agosto 2026: Android 16 / API 36 o superior** (salvo categorías especiales). [Requisitos Google Play](https://support.google.com/googleplay/android-developer/answer/11926878).

**Microsoft Store:** reservar nombre en Partner Center; PWA HTTPS instalable, manifiesto, iconos PNG 192/512 y service worker; validar en PWABuilder, empaquetar, crear ficha y enviar a certificación. [Documentación Microsoft](https://learn.microsoft.com/es-es/windows/apps/package-and-deploy/choose-distribution-path).

**Mac:** la interfaz web/PWA funciona en navegadores modernos; una distribución por **Mac App Store** requeriría además un empaquetado macOS aprobado y firma/notarización, no incluido aún.

## Criterios de aceptación
- Ningún módulo previo eliminado; toda migración reversible y cubierta por pruebas.
- Diseño fiel y utilizable en cada factor de forma, con capturas reales comprobadas.
- Sin afirmaciones falsas: cuentas conectadas, publicaciones, IA generada, anuncios cobrados o compras solo si se ejecutan y validan realmente.
- Cuenta/paquete de cada tienda y aprobación verificadas antes de anunciar disponibilidad.

## Verificación del boceto 04 (5 noviembre 2026)
- La pantalla de carga emplea **una sola composición DOM responsiva** en escritorio, tablet y teléfono: no hay una imagen panorámica alternativa ni una versión móvil visualmente distinta.
- Se conservan los seis paneles, el logotipo, la esfera extraída del JPEG aprobado, la barra de progreso y los colores originales.
- En pantallas estrechas los seis módulos se distribuyen en dos columnas, sin ocultarse; en pantallas anchas rodean la esfera central.
- Las pantallas pequeñas utilizan áreas seguras de iOS/Android y desplazamiento vertical cuando el contenido no cabe sin sacrificar legibilidad.
- La animación sutil modifica únicamente los brillos: no altera las geometrías ni mueve los paneles; se desactiva con la preferencia de movimiento reducido.
- La prueba visual de Chromium/Safari WebKit/Firefox está automatizada en GitHub Actions y guarda capturas para inspección.
- **Compilación web de producción:** `npm run build` ahora ejecuta `vite build`, no el servidor de desarrollo. El flujo de compilación web de GitHub Actions ha concluido correctamente.
- **Android:** el workflow puede generar una APK de depuración para pruebas internas. No equivale a un paquete AAB comercial ni a su publicación en Google Play. iOS requiere compilación y firma en macOS.

### Media Forge — revisión de paquete Android (5 noviembre 2026)
La suite web ya incluye edición local de imágenes con 15 máscaras, SafeFrame PULSE orientativo,
PULSE PACK ZIP en cinco relaciones de aspecto, SRT/VTT, WAV PCM, vídeo y fotogramas PNG,
visualización PDF y transferencia directa de foto a Estudio.

El paquete Android es una **APK de prueba**, no una publicación comercial. La compatibilidad
de codecs, WebM, visor PDF y descargas debe comprobarse instalándolo en dispositivos reales.
Las funciones de IA generativa, seguimiento de sujetos, transcripción y conversión MP4/MP3
universal siguen siendo objetivos futuros: no se presentan como activas.

### Paquete de validación de la suite integrada (5 de noviembre de 2026)
Este build suma Media Forge, biblioteca privada IndexedDB, perfiles ADN Creativo de Marca,
Auditor PULSE, SafeFrame y transferencia interna al Estudio. La compilación se usa
para **probar dispositivos Android reales**: permisos de archivos, WebView, galería,
descargas, IndexedDB, almacenamiento lleno, recarga y navegación, antes de generar un
AAB firmado para distribución comercial. Los datos locales no se sincronizan entre móviles.

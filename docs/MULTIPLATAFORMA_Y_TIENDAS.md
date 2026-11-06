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

### Corrección de biblioteca móvil (5 noviembre, revisión final de prueba)
La carga de la galería se serializa por versión de solicitud para que un listado
obsoleto no sobrescriba un guardado reciente. Los flujos de prueba esperan a
que IndexedDB confirme el guardado y luego verifican reapertura tras recarga.
La versión de prueba Android debe regenerarse a partir del último código.

### Persistencia multimedia compatible con WebKit (noviembre 2026)
Para guardar medios en la biblioteca, el navegador transforma los Blobs a ArrayBuffer
antes de IndexedDB. Al abrirlos, se reconstruye el Blob del mismo tipo. Se conservan
lecturas de registros anteriores con Blob sin borrarlos. Esta estrategia evita una
incompatibilidad observada en pruebas WebKit de almacenamiento de archivos.
Las pruebas de navegador deben seguir verificando persistencia tras recargar en
Chromium y Safari WebKit. La compatibilidad física aún requiere instalación y prueba.

### Proyectos creativos portables — comprobación Android (5 noviembre 2026)
El módulo Media Forge conserva en una base IndexedDB independiente el origen de
cada fotografía y los ajustes editables (máscara, proporción, estilo, texto, guías
SafeFrame y colores de marca). Incorpora guardado, reapertura tras reiniciar y
copias individuales .mhub importables en otro dispositivo. Los archivos .mhub
son copias JSON con imagen original en base64, sin cifrar: se deben custodiar
como imágenes privadas. Se comprueban navegadores Chromium y WebKit; el siguiente
paquete Android es únicamente una APK de depuración para probar en teléfonos.
No existe sincronización automática entre móviles ni cuentas de usuario.

### Proyectos editables portables — APK de pruebas (5 de noviembre de 2026)
Media Forge permite guardar proyectos de imagen con ajustes editables en una
base local independiente (12 proyectos / imagen origen máxima 8 MB), reabrirlos
tras reiniciar y exportar/importar copias individuales `.mhub` entre equipos.
El formato portable incluye la imagen original y configuración en un JSON
base64 **sin cifrar**; no contiene claves de acceso ni sincroniza por la nube.
La APK que se compile ahora sigue siendo de depuración: antes de publicar en
tiendas se necesita probar almacenamiento persistente, selector de archivos
personalizados, exportación/compartición y recuperación de proyectos en
teléfonos y tabletas Android reales e iPhone/iPad con Xcode.

### Verificación de versión de prueba (5 noviembre 2026)
El flujo E2E de proyectos `.mhub` ha superado pruebas de guardar, descargar,
reimportar y reabrir en Chromium y WebKit. Se ha corregido además la etiqueta
de selección de subtítulos para no presentar `undefined`, con comprobación
de texto legible en las pestañas de Media Forge.
Compilar una nueva APK de depuración con esos cambios; la aceptación comercial
de iOS y Android sigue supeditada a pruebas en dispositivos reales.

### Copia integral de proyectos creativos para pruebas Android (5 noviembre 2026)
Media Forge añade copia total `.mhubpack` (ZIP con `manifest.json`, fotografías
originales sin base64 y ajustes editables). La importación valida CRC, nombres,
referencias, tamaños y estructura, y añade un lote mediante transacción única,
sin modificar proyectos que ya existan. El usuario ve el alcance: **no incluye
Mi biblioteca multimedia, ADN de Marca ni datos de Oficina**, que requieren
sus propios respaldos. Los ZIP no están cifrados.
La APK generada por este workflow es únicamente una versión de depuración;
se debe probar importación/exportación en Android físico antes del lanzamiento.

### Copia integral de MarketHub AI — APK de verificación (5 noviembre 2026)
La app incorpora en **Configuración** la descarga de un ZIP privado `.mhubfull`
con proyectos editables, archivos de la biblioteca, perfiles de marca y los
cuatro módulos locales de trabajo. La importación añade nuevos proyectos y
medios sin sustituir los anteriores; la recuperación de otras áreas solo
rellena datos ausentes. Se validan CRC, formatos y capacidad.
**Importante:** el ZIP no está cifrado y puede alcanzar 245 MB. La app no lo
sincroniza automáticamente. Se debe probar su descarga y reimportación en
WebViews de Android e iOS reales, especialmente en móviles con poca memoria.
La APK del workflow es de depuración, no un AAB comercial firmado.

### Revisión completa de respaldo local (5 noviembre 2026)
Pruebas de navegador aprobadas para copia integral `.mhubfull` y para el sistema
previo `.mhubpack`: recuperación sin reemplazar los datos existentes,
validación CRC, rechazo de archivos dañados y controles estables tras la carga
asíncrona de IndexedDB. Los archivos no están cifrados. La protección requiere
guardar copias fuera del dispositivo, especialmente antes de limpiar caché.
La APK resultante es de depuración; falta instalación y QA en teléfonos reales,
firma para tiendas, integración comercial de anuncios y suscripciones.

### APK de pruebas: respaldo integral protegido (.mhubsecure) — noviembre 2026
La aplicación ofrece, además del respaldo integral anterior sin cifrar,
un formato nuevo **`.mhubsecure`** protegido con contraseña y AES-256-GCM por
bloques, PBKDF2-SHA256 y autenticación de encabezado y tamaño. La contraseña
no se guarda y no existe recuperación si el usuario la pierde.
El cifrado/descifrado se hace en el dispositivo y nunca transmite
fotografías, documentos ni la contraseña a servidores de MarketHub AI.

**Verificar en teléfonos físicos**: descarga mediante WebView nativa Android,
exportación/importación de ficheros con extensiones personalizadas, disponibilidad
Web Crypto, rendimiento en terminales con RAM limitada, reanudación después
de interrupciones y recuperación con contraseña incorrecta.
La APK generada en CI es de depuración; no equivale a publicación en
Google Play o App Store. Las copias sin cifrar siguen admitidas solo
por compatibilidad.

### Verificación responsive y búsqueda mejorada — 6 noviembre 2026
La biblioteca de borradores admite búsqueda **local** sin distinguir acentos ni
mayúsculas, con varios términos en cualquier orden y búsqueda por plataforma,
estado y fecha. El teclado conserva el foco al filtrar en móviles.
Se mantienen los bloqueos de fondo/foco de diálogos, los avisos de calendario,
las etiquetas en castellano y los botones de copia cifrada sin desbordamiento.
Los dos service workers están sincronizados en **v0.7.23** y el JS de arranque
usa `20261106c` para forzar su actualización, sin borrar datos locales.
Pruebas funcionales y de Chromium/WebKit automatizadas; el instalador Android
es una APK de depuración, no una versión final de Play Store. Verificar en móvil
físico que el teclado, los backups y los archivos siguen funcionando.

### PULSE Campaign Pilot — paquete Android de validación (6 noviembre 2026)
- Growth Lab incorpora un flujo **brief → siete días de planificación → textos editables → CSV/ICS → borradores locales**, con control de cuota FREE/PRO de demostración.
- Cada día puede enviar texto directamente al editor Media Forge para preparar una creatividad y, si coincide una marca local, reutilizar sus colores. No descarga automáticamente fotografías ni genera vídeo por IA.
- Se mantiene el funcionamiento offline de plantillas, editor, biblioteca y respaldo, sujeto a los límites de almacenamiento del dispositivo. No conecta redes externas, no programa publicaciones reales y no realiza cargos.
- Es necesario instalar la APK de depuración y probar específicamente los flujos de ficheros CSV/ICS, selector de fotografías, teclado táctil, persistencia local y uso en Android de gama baja. En iPhone/iPad se necesitan pruebas WebKit y posteriormente una compilación firmada con Xcode.

### Paquete Android de PULSE v0.7.26 — 6 noviembre 2026
La actualización final de esta fase conserva NEXUS × PULSE y añade la transferencia
directa de un día del plan editorial a Media Forge con formato social sugerido y
reutilización de ADN de Marca, además de siete borradores de una sola operación,
exportación CSV/ICS y enlaces de descarga con tiempo suficiente para Safari iOS.
La cuota FREE/PRO de borradores se aplica antes de escribir; no hay publicación
automática, anuncios monetizados ni IA generativa real en esta función.
**Verificación pendiente en dispositivos físicos:** descargas CSV/ICS, editores táctiles,
permisos, almacenamiento y estabilidad con poca memoria.
El paquete generado es exclusivamente una APK Android de depuración.

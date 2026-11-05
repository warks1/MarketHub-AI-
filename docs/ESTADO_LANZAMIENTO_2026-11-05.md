# MarketHub AI — estado de salida (5 de noviembre de 2026)

## Estado comprobable
- Pantalla de carga de boceto 04: una sola composición responsiva. Pruebas web y WebKit automatizadas; falta homologación en dispositivos físicos.
- Web: aplicación Vite compilable y PWA con service worker, sin sustituir el menú ni las pantallas por imágenes estáticas.
- Android: existe APK de depuración generada por GitHub Actions. Se requiere probar la nueva versión del código, y después firmar y generar el paquete comercial. No es una aplicación publicada.
- iOS/iPadOS: preparada la base Capacitor, pero sin paquete firmado ni aprobación en App Store.
- Media Forge: imágenes y 15 máscaras, PULSE PACK ZIP, audio WAV donde el navegador decodifica, reproductores, fotogramas PNG, WebM condicional, visor PDF dependiente del navegador, SRT/VTT, SafeFrame PULSE, Mi biblioteca IndexedDB, ADN Creativo de Marca, Auditor Creativo y envío de foto al Estudio.
- Oficina, Growth Lab, planificación y módulos previos: conservar y verificar en cada compilación. Las herramientas de marketing con terceros aún no conectadas no se anuncian como servicios reales.

## Diferenciación propia ya implementada
1. Órbita NEXUS: máscara elíptica con contornos dobles en colores propios.
2. SafeFrame PULSE: guía visual orientativa y posicionamiento del texto para cinco formatos.
3. PULSE PACK: generación de cinco formatos con una sola fotografía y archivo ZIP local.
4. Mi biblioteca: persistencia de elementos multimedia en IndexedDB, con apertura y borrado confirmado.
5. ADN Creativo: perfiles de marca locales de colores, tono y CTA reutilizables.
6. Auditor Creativo: chequeos locales de recorte, resolución, longitud del texto y guías.
7. Transferencia interna de Media Forge a Estudio sin reimportar manualmente.

La originalidad de la composición y flujos no certifica exclusividad jurídica o de mercado. Nunca afirmar que nadie más los ofrece sin investigación independiente.

## Límites actuales
- La biblioteca conserva ficheros en el mismo navegador y dispositivo; no se incorpora automáticamente a la copia JSON, no se sincroniza y puede desaparecer si se borran los datos del navegador. Límite operativo: 40 archivos y 150 MB, máximo 50 MB por archivo.
- Brand DNA se guarda en almacenamiento local, sin servicio de cuentas ni sincronización.
- El auditor es heurístico; no certifica contraste accesible, derechos de autor ni requisitos oficiales de redes.
- Los motores de vídeo/sonido dependen de códecs del dispositivo; no hay conversión universal MP4/MP3.
- Los pagos, anuncios monetizados y conexiones a redes externas todavía requieren integración y pruebas específicas. FREE/PRO actualmente incluye elementos de demostración.

## Bloqueantes para lanzamiento comercial
- Validación de funciones, permisos, almacenamiento y consumo de memoria en iPhone, iPad, Android de distinta gama y escritorio Windows/Mac.
- Compatibilidad de PDF, grabación WebM, exportaciones, descargas y reanudación de proyectos en WebViews nativas.
- Revisión de seguridad, consentimiento, protección de datos, accesibilidad y derechos sobre contenido multimedia.
- Cuentas y recuperación segura de datos; backups recuperables antes de confiar archivos a la biblioteca local.
- Integrar suscripciones reales de App Store/Google Play y publicidad real solo en FREE, con procedimientos correctos de prueba y política de privacidad.
- Configurar identidad de app, iconos de distribución, fichas, capturas, firma, certificados, builds finales y revisión por las tiendas.
- Definir motor local/nativo de conversión de audio/vídeo bajo licencias válidas cuando el navegador no lo soporta.
- Pruebas end-to-end de flujos reales y auditoría de contraste y lecturas de pantalla.

## Regla de continuidad
Cualquier actualización debe conservar pantalla 04, paneles NEXUS+PULSE, navegación móvil, funciones de Estudio, Oficina, Growth Lab y el resto de módulos ya presentes. Añadir pruebas antes de declarar una característica terminada. No prometer publicación hasta terminar la verificación.

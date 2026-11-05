## 2026-11-05 — v0.7.2 · Corrección de carga PWA

- Precache corregida para incluir los nuevos estilos responsive de la pantalla de carga. Se conserva íntegra la apariencia seleccionada y los cuatro diseños de referencia.
- Actualización de versión para evitar mezclar hojas de estilo viejas en instalaciones anteriores.

## 2026-11-05 — v0.7.1 · Recomendaciones con datos propios

- Las recomendaciones del panel ahora se calculan desde CSV importados, borradores y campañas locales.
- Se identifican porcentajes de alcance por plataforma según la fuente importada y borradores vencidos o próximos.
- No se atribuye crecimiento, ROI ni inteligencia generativa donde no existen fuentes.
- Tests unitarios y caché PWA actualizados para mantener este módulo en todos los dispositivos.

## 2026-11-05 — v0.7.0 · Vídeo, copias cifradas y competencia

- Exportación de vídeo local desde storyboard (MP4/WebM según navegador), fundidos y zoom suave, 720p, duración máxima 45 s y 12 escenas. Sin audio.
- Copias locales AES-256-GCM protegidas por contraseña con PBKDF2-SHA256, sal/IV por archivo y restauración compatible con anteriores.
- Registro de competidores: CRUD, ratios orientativos, CSV protegido de inyección de fórmulas y adaptación móvil.
- Nuevas pruebas unitarias y visuales con descargas reales y controles de seguridad.
- Siguen pendientes redes conectadas, IA externa, publicidad y suscripciones comerciales, video profesional completo, publicación en tiendas.

## 2026-11-05 — v0.6.1 Compatibilidad y funciones de editor

- Interfaz real responsive en vez de una fotografía con zonas transparentes; los cuatro diseños originales siguen intactos como referencia.
- Escritorio PC/Mac desde 1250 px: seis indicadores en una fila, tres columnas en paneles y estudio amplio como en el boceto elegido.
- Textos y controles más legibles en smartphone, manteniendo todos los módulos mediante desplazamiento y barra inferior.
- Storyboard con reproducción temporizada y pausa, edición de escenas y exportación PNG 9:16/16:9; integración de modos Imagen, Copy e Ideas con herramientas locales operativas.
- Aviso visible si falla el guardado local, en vez de perder cambios silenciosamente.
- Auditoría de navegadores WebKit/Safari, Firefox, Chromium horizontal y UHD, más las nueve resoluciones responsive existentes.
- Preparación de APK Android de depuración para pruebas: no equivale a una publicación de Google Play.

## 2026-11-05 — v0.6.0 Paneles funcionales y diseño responsive

- Inicio deja de estar cubierto por una captura estática: ahora muestra componentes reales que se redistribuyen en smartphone, tablet y escritorio, conservando azul oscuro, cian, violeta y fucsia.
- Indicadores con métricas CSV reales del usuario; falta de fuentes marcada como sin datos. Calendario, publicaciones y campañas interactivos.
- Estudio con storyboard editable: escenas, textos, paletas, duraciones, orden, duplicación, borrado confirmado y exportaciones JSON y PNG 9:16/16:9.
- Bandeja y Social Listening permiten registros locales; IA externa, cuentas y anuncios siguen sin conectar.
- Adaptación de menús: barra inferior en móvil, etiquetas de navegación en tablet y paneles multicolumna en PC/Mac.
- Auditoría automatizada para nueve resoluciones, conservando los cuatro diseños originales como referencia.

## 2026-11-05 — v0.5.0 Modo ESPEJO: originales sin redibujar

- Carga 04 sustituida por el JPEG original seleccionado en todas las plataformas, con barra real y entrada pulsable sobre la imagen.
- Inicio 01 y Estudio 02 reproducidos con JPEG originales y zonas transparentes de interacción. La pantalla 03 aporta las vistas móviles, sin flip horizontal ni cambios de color.
- Barra de navegación fija en móviles usando otro recorte de la misma referencia original, no iconos recreados.
- Los cuatro JPEG se incluyen en `public/assets/` idénticos byte por byte para Windows, Mac, Android, iOS y PWA.
- Se preservan todas las herramientas reales y se añade acceso explícito a controles editables; las cifras de la imagen permanecen como demo visual.
- Nueva auditoría visual responsive y pruebas de fidelidad de assets. No implica aprobación comercial ni publicación en tiendas.

## 2026-11-05 — v0.4.4 Calendario editorial táctil

- Calendario del panel principal con navegación mensual y selección de un día para preparar una publicación con la fecha precargada.
- Controles con teclado, ratón y toque adaptados a smartphone, tablet y escritorio.
- Nueva revisión de caché PWA y pruebas visuales del flujo calendario → formulario.

## 2026-11-05 — v0.4.3 Analítica local con datos importados

- Añadida importación CSV con validación, plantilla descargable, agregación por plataforma, gráfico por fechas y borrado confirmado de datos importados.
- Los datos se guardan localmente y se distinguen expresamente de métricas ilustrativas; ninguna API externa se consulta.
- Actualizada caché offline para incluir nuevas herramientas, pruebas unitarias y auditoría visual de CSV.

## 2026-11-05 — Planificador local de campañas y corrección móvil

- Corregido el desbordamiento del estudio creativo en móviles de 320–430 px, manteniendo la línea de tiempo desplazable horizontalmente.
- Añadida creación, edición, duplicación, eliminación confirmada y exportación CSV de campañas locales con validación de objetivos, fechas y presupuestos; sin activar anuncios reales.
- Campañas guardadas en los datos locales incluidos por el mecanismo de copia JSON; límites demo FREE 10 y PRO 150.
- Nuevas pruebas unitarias y ampliación de la auditoría visual responsive a la pantalla Campañas.
- Módulos de campaña incluidos en caché offline con revisión separada de la PWA.

## 2026-11-05 — v0.4.1 Multiplataforma, fidelidad visual y caché segura

- Conservados en el repositorio los cuatro bocetos originales como referencia inalterable, con visor de comparación y pantalla de carga panorámica usando la imagen elegida.
- Corregida una importación ES duplicada que podía impedir el arranque.
- Service worker con red primero para módulos JS/CSS e imagen, versión nueva y exclusión del webview nativo de Capacitor.
- Añadidas pruebas automatizadas de imports, assets 01–04, iconos PWA, caché y matriz multiplataforma.
- Definida ruta de entrega futura a App Store, Google Play y Microsoft Store sin afirmar disponibilidad comercial.

## 2026-11-05 — v0.3.2 Gestión de contenidos y recuperación de inicio

- Pantalla de recuperación de arranque, caché versionada y acceso al diagnóstico de recursos en GitHub Pages, sin borrar datos locales.
- Nueva biblioteca local de contenidos: edición, duplicado, eliminación con confirmación, estados y exportación CSV (neutralización de fórmulas).
- Límites de biblioteca local en prototipo: FREE 20 / PRO demo 500; cuotas comerciales por validar.
- Mejoras responsive en las acciones de publicación y nuevas pruebas de validación, CSV y continuidad.
- Sin integraciones con redes, ni publicación automática, anuncios reales o pagos comerciales.

# Registro de cambios — MarketHub AI

## 2026-11-04 — Integración visual, backup e innovación sectorial
- Diseñador PNG local de formatos sociales y acceso móvil a todos los módulos.
- Copia JSON versionada unificada con validación y restauración confirmada.
- Pruebas automatizadas de Oficina, Growth Lab, diseño gráfico, navegación y backup; la compilación nativa queda pendiente de verificación.
- Investigación verificada de IA contextual, AEO, imagen a vídeo, social listening y nuevas integraciones autorizadas.
- Sin borrar funcionalidades previas; integraciones comerciales aún pendientes.


## 2026-11-04 — v0.3.1 Seguridad local y navegación móvil

- Añadida copia local conjunta de los cuatro módulos del prototipo y restauración explícita, sin borrar automáticamente módulos ausentes del archivo.
- Rechazo de JSON desconocidos/inseguros, tamaños excesivos y estructuras desmesuradas; rollback de best effort al fallar el almacenamiento.
- Corregida la barra móvil que usaba índices frágiles: botón «Más» y directorio completo de secciones.
- Añadidas ocho pruebas de respaldo y cinco de navegación. Se conserva todo el código y las pantallas anteriores.
- **PENDIENTE:** cifrado, sincronización en nube, pruebas nativas finales y publicación en tiendas.


## 2026-11-04 — v0.3.0 Growth Lab y marketing local

- Se conserva el proyecto NEXUS + PULSE, sus pantallas, estudio gráfico, calendario, catálogo, FREE/PRO y Oficina.
- Nuevo Growth Lab: briefs con biblioteca, enlaces UTM válidos, análisis SEO de redacción, plantillas email exportables, reutilización multired y «link en bio».
- Las funciones nuevas usan almacenamiento local independiente: no se sobrescriben los borradores ni la Oficina.
- Catálogo ampliado con generador UTM y accesos directos a los nuevos módulos, sin alterar los anteriores.
- Pruebas automáticas para URLs HTTPS, parámetros UTM, salida HTML escapada, borrado confirmado, SEO y persistencia.
- Límite actual: ninguna herramienta nueva conecta con redes, genera IA real, envía campañas o emails, ni se ha aprobado para gestionar datos personales reales.


## 2026-11-04 — Alcance máximo FREE/PRO y explorador de herramientas

- Ampliado catálogo de producto a **78 capacidades previstas**, repartidas en 9 familias.
- Añadida pantalla navegable, búsquedas y filtros FREE/PRO, con indicador explícito «demo» o «pendiente».
- Definidas cuotas comerciales **provisionales**, sujetas a costes y autorizaciones.
- Se conservan todas las pantallas, módulos y decisiones previas.

## 2026-11-04 — Requisitos maestros + protección de continuidad
- Reunidos los requisitos acumulativos desde la creación del proyecto sin retirar ninguna solicitud.
- Fijada como regla de producto **no eliminar módulos ni capacidades previas**; mejorar, corregir, ampliar y verificar compatibilidad.
- Añadidas tendencias 2026 verificadas: IA estratégica/agentes con revisión humana, vídeo corto, social search, escucha social, edición estructurada/por capas, colaboraciones medibles.
- Añadido control automático estructural de continuidad de módulos críticos al proceso de CI.
- Actualizadas referencias a las especificaciones y el estado REAL del prototipo.

## 2026-11-04 — Prototipo mobile-first v0.1.0 (histórico)
- NEXUS + PULSE, splash animado, navegación móvil/tablet/PC, panel y estudio creativos ilustrativos.
- FREE y PRO demo, sin pagos ni anuncios reales; borradores locales y páginas de prueba.
- Vite + Capacitor para futura compilación nativa Android/iOS; flujo web CI y opción de APK de depuración.
- No se han verificado builds ni funciones comerciales reales.

## Política de próximas versiones
Cada entrega incluirá: fecha, versión, IDs de requisitos tocados, funcionalidades añadidas o corregidas, pruebas ejecutadas, cambios de estructura y riesgos conocidos.

## 2026-11-05 · MEDIA FORGE (ampliación original)
- Conservado el editor y reproductores integrados: fotografía PNG/JPG/WebP, 15 máscaras, PULSE PACK ZIP con cinco formatos, audio WAV, vídeo y fotogramas PNG, visor PDF.
- Añadido conversor SRT ↔ WebVTT totalmente local con validación de marcas de tiempo, edición y descarga.
- Añadida función **SafeFrame PULSE**, una guía orientativa de márgenes y posicionamiento de texto que solo se dibuja sobre la vista previa, no sobre los archivos exportados. No se presenta como certificación oficial de ninguna plataforma.
- Añadida transferencia directa de imagen editada desde Media Forge al Estudio de storyboard, con compresión y comprobaciones de capacidad antes de guardar.
- Añadidas pruebas unitarias y secuencias visuales de comprobación móvil/escritorio.
- Pendiente: comprobar resultados finales de integración y compatibilidad en dispositivos físicos, y ampliar decodificadores nativos bajo licencias adecuadas. No se promete conversión universal de MP4/MP3, transcripción automática ni uso de modelos de IA sin proveedores efectivos.

## 2026-11-05 · Suite autónoma: integración incremental
- **Mi biblioteca multimedia local:** guardado real con IndexedDB, galería con vistas previas, descarga, reapertura, eliminación confirmada, controles de tamaño/cantidad y límites de almacenamiento.
- **ADN Creativo de Marca:** perfiles de identidad con nombre, paleta, tono y CTA; se pueden guardar, recuperar, modificar y aplicar a la máscara original Órbita.
- **Auditor PULSE:** análisis geométrico local de recorte, resolución, texto y SafeFrame; recomendaciones orientativas sin representar políticas oficiales.
- **Pruebas:** módulos unitarios para validación de biblioteca, marca y auditor; el recorrido visual cubre guardado, recarga, reapertura, eliminación y exportaciones anteriores.
- **Continuidad:** contrato obligatorio actualizado; shell offline actualizado sin perder el boceto de carga aprobado ni otros módulos.
- **Limitaciones reales:** biblioteca y marcas no se sincronizan; no hay todavía conversión universal MP4/MP3, IA generativa integrada, suscripciones ni anuncios comerciales.
- **Estado de distribución:** los paquetes APK/web de la versión previa se generaron; la ampliación posterior debe volver a pasar el pipeline. Publicar en tiendas requiere pruebas y firma.

## 2026-11-05 · Proyectos creativos reeditables y copias portables .mhub
- Media Forge incorpora la pestaña **Proyectos editables** y un botón para guardar/reanudar desde la herramienta Foto y máscaras.
- Cada proyecto guarda su **imagen fuente original**, formato, máscara, tratamiento visual, texto, SafeFrame y colores activos de identidad de marca, no solo la foto exportada.
- Los proyectos se guardan en una base IndexedDB independiente de Mi biblioteca para no modificar ni perder los ficheros multimedia existentes.
- Límite preventivo: 12 proyectos, imágenes originales de hasta 8 MB y 80 MB en total.
- Permite **exportar/descargar una copia .mhub** e importarla en otro navegador/dispositivo sin cuenta, con validación de estructura, campos y tamaño. La copia incluye datos de la imagen (no contraseñas).
- Las importaciones de una foto nueva se mantienen independientes para evitar sobrescribir accidentalmente el último proyecto abierto.
- Pruebas unitarias y E2E añadidas: guardar, reabrir, formato 1:1, máscara, texto, exportación, eliminación e importación portable tras recargar, en Chromium y WebKit.
- Corregido el paso CI de instalación de Playwright a una versión estable publicada: 1.64.1; el instalador anterior intentaba instalar una versión de playwright-core todavía inexistente.
- Se conserva la composición de pantalla de carga aprobada, PULSE PACK, la biblioteca, los otros conversores, Estudio y las funciones anteriores. La sincronización automática en nube y las publicaciones comerciales siguen pendientes.

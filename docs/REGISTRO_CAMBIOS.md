## 2026-11-06 · MarketHub AI v0.7.6 — transición blanca del lanzamiento iOS

- El vídeo grabado desde la pantalla de inicio de iPhone confirma un intervalo blanco entre el lanzamiento nativo y la pantalla de carga NEXUS × PULSE. No se trata de una pantalla blanca permanente ni de un fallo del módulo de reproductores.
- Metadatos `apple-mobile-web-app-*` y pantallas de inicio PNG de tamaño exacto, generadas por Node y publicadas con la app en GitHub Pages. Incluye 430×932 puntos a 3×, además de otros tamaños modernos iPhone/iPad y orientación horizontal en iPad.
- Color base y tema oscuros en el primer documento HTML; precache y versión PWA renovados sin borrar almacenamiento local.
- El splash animado anterior y todas las demás funciones se conservan. La comprobación final de la transición del sistema requiere abrirla desde el icono del iPhone y, si iOS conserva el splash antiguo, reinstalar ese icono desde Safari.

## 2026-11-06 · MarketHub AI v0.7.5 — visores y reproductores reales

- Nueva pestaña «Visores · imagen y sonido» dentro de Media Forge: galería multiimagen con miniaturas, flechas, zoom 1–5×, giro, swipe, pantalla completa adaptable y presentación automática.
- Reproductor local de audio con controles HTML nativos, reproducción/pausa, velocidad, búsqueda ±10 s, bucle y forma de onda/espectro Web Audio API sin simulación.
- Se revocan URLs temporales de galería/audio al sustituirlos; el analizador se desconecta al salir. Se preservan las pestañas multimedia anteriores, la biblioteca, los proyectos y el contrato de continuidad.
- Pruebas unitarias, CI y navegador Chromium PC + Safari WebKit iPhone/iPad; interfaz NEXUS × PULSE con controles visibles en tamaños pequeños.
- Límites honestos: sin IA externa, subida de medios ni publicación real; formatos sujetos a compatibilidad de navegador, archivos locales temporales no respaldados automáticamente.

## 2026-11-06 · MarketHub AI v0.7.4 — estrategia y analítica verificable

- Incorporados el planificador de tamaño de muestra para test A/B (nivel de confianza, potencia, conversión de base y mejora mínima), un asignador de presupuestos para tres canales con tope de concentración, y una comparativa de métricas importadas en Analítica.
- Los nuevos motores usan reglas y cálculos locales, sin IA generativa externa, sin publicar, sin cuentas de anuncios y sin predicciones verificadas.
- Los resultados de planificación se guardan con los motores previos en Growth Lab, se incluyen en el respaldo existente y pueden exportarse como TXT. La analítica sigue vinculada a las filas CSV del módulo principal.
- Formularios y tablas adaptativos sin ocultación de métricas en smartphones; cobertura funcional y QA con Playwright para escritorio, iPhone e iPad.
- Conservados los cuatro motores v0.7.3 y el diseño NEXUS × PULSE.

## 2026-11-06 · MarketHub AI v0.7.3 — motores de marketing operativos

- Cuatro motores locales: auditor de copy (7 reglas), variantes editables y exportables, simulación de embudo/ROAS y comparación estadística A/B con precauciones de muestra.
- Nuevos formularios en Growth Lab, acceso desde Catálogo, persistencia en almacenamiento local existente, exportación TXT y compatibilidad con copias integrales.
- FREE: 2 variantes por generación. PRO (simulación): 5. Sin anuncios monetizados, IA externa ni conexiones reales a redes.
- Cobertura de tests de cálculo, integración y QA visual de PC, iPhone y iPad, a comprobar en CI.
- Diseño NEXUS × PULSE y herramientas precedentes conservadas; tablas anchas con desplazamiento interno horizontal.

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

## 2026-11-05 · Copia total de proyectos editables (.mhubpack)
- La pestaña Proyectos editables de Media Forge incluye **Respaldar TODOS los proyectos · ZIP** y **Restaurar copia completa .mhubpack**.
- El formato .mhubpack incluye un `manifest.json` y las imágenes originales en binario sin inflar su tamaño mediante base64; conserva máscara, composición, texto, SafeFrame y paleta de cada proyecto.
- Antes de restaurar, comprueba la estructura del ZIP, las rutas permitidas, nombres duplicados, tamaños, CRC32, referencias del manifiesto, formato y ajustes de todos los proyectos.
- La restauración **no sustituye proyectos existentes**. Comprueba previamente espacio y cantidad, luego incorpora todo el lote en una sola transacción IndexedDB; si no hay capacidad o el archivo es inválido, no añade ninguno.
- Se conserva la exportación de proyectos individuales `.mhub` y el resto de herramientas del editor. No se altera ni mezcla la biblioteca multimedia anterior.
- Límites: 12 proyectos, 80 MB de imágenes fuente y 90 MB por respaldo importado. No hay cifrado de .mhubpack ni sincronización automática; custodiar las copias como archivos privados.
- Pruebas unitarias de ZIP/CRC/integridad y E2E en Chromium/WebKit para copia total, importación y conservación del proyecto previamente restaurado.

## 2026-11-05 · Copia integral `.mhubfull`: proyectos + biblioteca + ADN + módulos locales
- Añadido un respaldo único accesible desde Configuración y el catálogo de herramientas. Incluye proyectos editables con sus originales, todos los archivos multimedia locales, perfiles ADN de Marca y los cuatro módulos de almacenamiento local: publicaciones/Estudio, Oficina, Estudio Visual y Growth Lab.
- Se mantiene sin modificar la anterior copia JSON compatible y la opción AES-256-GCM cifrada para esos módulos de menor tamaño.
- El formato `.mhubfull` es un ZIP **sin compresión, sin cifrado y sin conexión de red** con manifiesto de versión 1 y sumas CRC32 para cada medio original.
- La recuperación comprueba antes de modificar datos las rutas permitidas, firmas ZIP, tamaños, tipos de archivo, perfiles de marca, módulos conocidos, máscaras y parámetros válidos, así como cantidad y capacidad disponibles.
- **No sobrescribe el trabajo anterior:** se añaden proyectos y archivos con nuevos IDs; las marcas que ya existan no se modifican; los datos locales de Oficina y otros módulos solo se rellenan cuando faltan.
- La importación usa transacciones locales por módulo y trata de revertir todos los cambios nuevos si alguna fase falla. No existe una transacción única entre diferentes bases IndexedDB y localStorage ante cierre forzoso o apagado, por lo que el respaldo debe conservarse aparte.
- Límites: archivo íntegro de hasta 245 MB; 12 proyectos (80 MB), 40 medios (150 MB) y 12 identidades de marca. El importador no permite ZIP con compresión, rutas arbitrarias ni archivos extraños.
- Añadidas pruebas unitarias y de navegador para exportación, recuperación en un perfil nuevo, protección de datos existentes y rechazo de archivos manipulados (Chromium/WebKit).
- Pruebas en iOS y Android reales, cifrado del paquete completo y sincronización de proyectos entre dispositivos siguen pendientes. No se presenta como funcionalidad de almacenamiento en la nube.

## 2026-11-05 · Protección de la copia integral cifrada (.mhubsecure)
- Añadida una opción **recomendada con contraseña** en Configuración: exportar/restaurar todos los datos locales de trabajo en el nuevo formato binario `.mhubsecure`.
- Cifrado de todo el ZIP integral mediante **AES-256-GCM** por bloques de 1 MiB, con sal e identificador de nonce aleatorios, derivación **PBKDF2-SHA256** (310.000 iteraciones) y autenticación del encabezado, secuencia y tamaño de cada bloque.
- Ninguna contraseña se guarda, se envía a servidores ni se incorpora al archivo. No existe recuperación si el usuario la olvida. Una contraseña errónea, encabezado alterado, bloque modificado o archivo incompleto provoca rechazo ANTES de llamar a restauración.
- Se conserva la opción `.mhubfull` SIN cifrar para compatibilidad, además de `.mhubpack`, `.mhub` y la copia JSON pequeña cifrada existente.
- El cifrado utiliza Web Crypto en contexto seguro; si falta compatibilidad no se presenta el botón como operativo.
- Pruebas unitarias de cifrado/descifrado multibloque, autenticidad, contraseñas, aleatoriedad por archivo y controles de interfaz. Pruebas visuales de exportación cifrada, recuperación y rechazo de archivos manipulados en Chromium y Safari WebKit.
- Limitaciones: copias potencialmente de hasta 245 MB requieren memoria libre; es necesario probar descargas/compartición en iPhone y Android físicos. No implica que exista sincronización automática ni almacenamiento en la nube.

## 2026-11-06 · Auditoría de límite FREE, Safari y actualización PWA
- Detectada y corregida la acción interna **`draft-from-studio`**, que antes creaba un borrador aunque se hubiera alcanzado el límite. Ahora aplica el mismo `draftLimit(plan)` de las pantallas de creación y duplicación (20 FREE / 500 PRO).
- Las rutas adicionales de Growth Lab, Diseñador y Oficina dejan de tener el máximo FREE `20` codificado como condición independiente. Todas usan el mismo límite de borradores; incluso PRO queda protegido ante un número excesivo de publicaciones.
- Corregido el renderizado Canvas de Diseñador en Safari antiguo: cuando no existe `CanvasRenderingContext2D.filter`, se utiliza un gradiente radial con caída progresiva para el resplandor de fondo. Cuando no existe `ctx.roundRect`, el botón se traza mediante `moveTo`, `lineTo` y `quadraticCurveTo`.
- Conservada la apariencia del diseño y la ruta nativa para navegadores modernos. No se retiran funciones anteriores.
- Los dos archivos del service worker (`sw.js` y `public/sw.js`) están sincronizados en **v0.7.20**, que sustituye a v0.7.19 y es posterior a v0.7.4. `skipWaiting`, `clients.claim`, red primero para JS/CSS y limpieza de cachés antiguas siguen en el flujo.
- Actualizada la versión de carga del módulo principal a `20261106a` para evitar servir la versión anterior en navegadores instalados.
- Nuevas pruebas unitarias de límite de borradores y Canvas antiguo/moderno, integridad de SW, y prueba end-to-end de acción de Estudio en Chromium y Safari WebKit.
- Nota de plataforma: que el SW se actualice no garantiza que una pestaña ya abierta cambie su JS sin recargar; puede requerir cerrar y volver a abrir la aplicación. El navegador Safari antiguo se reproduce mediante simulación de APIs Canvas ausentes, no mediante un dispositivo antiguo físico.

## 2026-11-06 · PULSE Campaign Pilot: de brief guardado a plan editorial editable
- **Nueva herramienta funcional, local, sin IA remota:** Growth Lab puede convertir un brief guardado en **7 publicaciones sugeridas** y revisiones editoriales diferenciadas (presentación, problema, beneficio, demostración, confianza, preguntas y cierre).
- Las propuestas conservan nombre, oferta, público, llamada a la acción y fecha; se ajustan al canal elegido, incluido multicanal. El usuario puede editar cada texto antes de usarlo y guardar el plan en el almacenamiento local de Growth Lab.
- Se exporta **CSV seguro para hojas de cálculo** (neutralización de textos que empiezan como fórmulas) y **calendario ICS de día completo** sin inventar horas de publicación. No se conecta a redes ni activa anuncios.
- **Crear 7 borradores locales en un paso:** todas las propuestas se validan antes de escribir. No se guarda ningún borrador cuando el conjunto supera el máximo FREE (20) o PRO de demostración (500), o cuando falla el almacenamiento local.
- Email y Google Ads pueden exportar CSV/ICS, pero no se envían al gestor de borradores sociales porque éste aún no admite esos destinos. Multicanal elige solo redes sociales admitidas.
- Interfaz responsive para smartphone, tablet, PC y Mac dentro del estilo NEXUS × PULSE, manteniendo los módulos anteriores y el menú existente.
- Nuevas pruebas unitarias para formato, fechas, integridad CSV/ICS y flujo de Growth Lab; prueba E2E en Chromium y Safari WebKit de exportaciones, edición, transferencia y respeto de cuota.
- Se marca como **reglas y plantillas locales, no generación por IA ni publicación automática**. Para publicidad/servicios conectados se necesitan autorizaciones y backends reales.

### 2026-11-06 · Flujo creativo PULSE conectado a Media Forge
- Desde cada día del plan editorial se puede pulsar **Preparar imagen en Media Forge**. Copia la propuesta editable, selecciona un formato social sugerido y abre el editor existente sin descargar ni importar el texto en programas externos.
- Si existe un perfil de ADN Creativo de Marca con el mismo nombre que el brief, el editor carga sus colores principales y de acento. Nunca se presenta como generación automática de imágenes; se necesita elegir o recuperar una fotografía para componerla.
- Antes de reemplazar texto/formato de una composición que ya tenga una imagen abierta, se solicita confirmación y se conserva el archivo fuente.
- La vista del día en Growth Lab mantiene una acción táctil adaptada a smartphones y tablets. Se añaden pruebas unitarias y de navegador del enlace PULSE → Media Forge → borradores.
- La fecha inicial propuesta en briefs ahora usa el día local del dispositivo, no UTC, evitando sugerir el día anterior en España cerca de medianoche.

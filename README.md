# MarketHub AI · NEXUS × PULSE

**Estado actual: prototipo v0.7.8. No hay redes conectadas, IA comercial, suscripciones cobradas ni anuncios reales.**

**Documentación maestra que debe consultarse antes de cualquier modificación:**

- [ESPECIFICACIONES MAESTRAS — todos los requisitos acumulados](docs/ESPECIFICACIONES_MAESTRAS.md)
- [Bocetos originales y contrato de fidelidad visual](docs/REFERENCIAS_VISUALES.md)
- [Registro de cambios y política de continuidad](docs/REGISTRO_CAMBIOS.md)
- [Matriz de funciones FREE y PRO](docs/MATRIZ_FREE_PRO.md)
- [Comparativa competitiva 2026](docs/COMPARATIVA_COMPETIDORES_2026.md)
- [Contrato automatizado de continuidad](docs/CONTRATO_CONTINUIDAD.json)
- [Roadmap técnico](ROADMAP.md)
- [Plataformas y publicación en tiendas](docs/PLATAFORMAS_Y_TIENDAS.md)

> **Regla del proyecto:** no eliminar funciones solicitadas; corregir, mejorar y ampliar conservando los módulos previos. No confundir prototipo con integración real.

Para comprobar que no han desaparecido módulos estructurales fundamentales:

```bash
npm test
```

Este control se ejecuta en CI antes de compilar. No sustituye pruebas funcionales.

Base de una aplicación **mobile-first** de marketing digital para iPhone, iPad, Android, tablets Android y navegadores de ordenador.

**Estado: v0.7.8 · PROTOTIPO INTERACTIVO CON HERRAMIENTAS LOCALES · NO PRODUCCIÓN.**

## Restitución de redes sociales visibles (v0.7.8)

**Corregido el recorte del panel principal:** la versión anterior tenía 13 logotipos en el código, pero solo mostraba **7**. La nueva versión **muestra los 25 iconos disponibles**, con 12 incorporaciones: Reddit, Discord, Mastodon, Tumblr, Spotify, Vimeo, Behance, Dribbble, Messenger, WeChat, LINE y VK. Se conservan los 13 anteriores.

Las **25 tarjetas se dibujan simultáneamente**, sin carruseles ni pestañas que oculten redes; la cuadrícula cambia de columnas según el ancho del móvil, tablet o PC, admite desplazamiento vertical y utiliza iconos SVG legibles de 36 px y nombres completos sin puntos suspensivos. Las seis plataformas del editor mantienen el botón para preparar borradores locales; el resto se identifica como «Sin conectar», sin prometer publicación. La misma lista aparece en la variante visual NEXUS y en Inicio funcional.

La prueba de navegador comprueba las **25 marcas**, tamaños mínimos, accesibilidad de las últimas tarjetas, ausencia de recortes laterales y creación/guardado de borradores en Chrome, iPhone SE, iPhone y iPad. Las pruebas no implican conexión real de redes.

## Iconos originales de redes sociales (v0.7.7)

MarketHub AI muestra ahora **13 siluetas vectoriales de redes reales** (Instagram, TikTok, YouTube, Facebook, LinkedIn, X, WhatsApp, Threads, Pinterest, Snapchat, Bluesky, Twitch y Telegram), integradas como vectores SVG locales y con colores reconocibles: **sin CDN y con soporte sin conexión**.

En el panel principal se muestran las siete plataformas existentes con sus marcas correspondientes y el aviso visible **Sin conectar**. Las seis plataformas admitidas para publicaciones locales (Instagram, TikTok, YouTube, Facebook, LinkedIn y X) tienen ahora tarjetas pulsables que abren directamente el formulario de un borrador preseleccionado. El planificador incorpora los mismos iconos como opciones táctiles sincronizadas con el desplegable sin perder el texto en curso. Los iconos se muestran también junto a publicaciones, campañas y leyendas de gráficos importados.

Las marcas son propiedad de sus titulares; su presencia **no implica patrocinio, conexión de cuentas ni publicación real**. Lee [origen de iconos y directrices de marca](docs/REDES_E_IDENTIDAD.md) antes de distribuir comercialmente la aplicación, especialmente por las restricciones de LinkedIn.

Pruebas: `node --test tests/social-brand-icons.test.mjs` y `node scripts/social-brand-qa.mjs` con Chrome y WebKit en cuatro tamaños de pantalla.

## Solución del arranque blanco en iPhone/iPad (v0.7.6)

El vídeo real de apertura instalado en el iPhone mostró aproximadamente 1,5 segundos de pantalla blanca **antes de que el navegador renderizara la pantalla de carga**. La solución añade metadatos nativos iOS, 17 imágenes PNG de inicio con las resoluciones exactas (incluida **1290 × 2796 para iPhone 15 Pro Max**), inicio en tema oscuro y precarga PWA. Las imágenes se generan con `npm run generate:ios-launch` y se versionan para GitHub Pages, que también publica archivos del repositorio directamente. La pantalla NEXUS × PULSE animada, sus seis módulos y las funciones existentes se mantienen intactos.

**Limitación:** no es posible asegurar el comportamiento del arranque del sistema operativo únicamente con pruebas web; requiere volver a abrir la app instalada en un iPhone. **Antes de quitar el icono de la app instalada, exporta y conserva una copia integral cifrada `.mhubsecure` desde Ajustes.** iOS puede eliminar los datos locales de una PWA al desinstalarla. Solo si cuentas con la copia verificada, puedes retirar el icono y volver a añadirlo desde Safari para actualizar la imagen de inicio. Las versiones no incluidas en la lista de dispositivos utilizarán su transición nativa hasta añadir su resolución.

## Reproductores y visualizadores de imagen y sonido (v0.7.6)

- **Media Forge → Visores · imagen y sonido**: galería de hasta 10 fotografías, miniaturas, gestos táctiles, zoom 100–500 %, giro, descarga del original y presentación automática cada 3,5 segundos.
- Reproductor de audio con controles nativos, saltos de 10 segundos, bucle, velocidad 0,75×–1,5× y visualizadores de **espectro en tiempo real y forma de onda**, utilizando Web Audio API tras una activación expresa.
- Los archivos no se suben a servidores: son `blob:` de tu navegador, sin datos de ejemplo simulados. La compatibilidad de formatos y de Web Audio depende de cada navegador y sistema.
- Se conservan los antiguos módulos Foto/Máscaras, WAV, Vídeo/Fotogramas, PDF, subtítulos, proyectos y biblioteca privada. La galería y el audio en reproducción son **temporales**, no se incluyen automáticamente en los backups: guarda los originales o en Mi biblioteca.
- Interfaz adaptativa para PC, Mac, iPhone, Android y tablets; cobertura unitaria más navegador Chrome y Safari WebKit.

## Motores de marketing locales (v0.7.6)

En **Growth Lab → Motores inteligentes** funcionan cuatro módulos verificables, sin conexión a redes ni modelos de IA externos: auditor de copy basado en siete reglas editoriales, generador de variantes editables (FREE: dos; PRO demo: cinco), simulador de embudo con escenarios conservador/base/optimista y comparación estadística A/B con advertencias por muestra insuficiente. Los resultados se conservan en el mismo almacenamiento de Growth Lab y en las copias integrales `.mhubfull`/`.mhubsecure`. Se puede exportar el informe en TXT. Las cifras de escenario son simulaciones y no predicciones de rendimiento.

Además se han incorporado **tres motores estratégicos** en el mismo panel: planificación de muestra A/B (confianza y potencia), asignación matemática de presupuestos a tres canales y análisis de CTR/interacciones a partir de **filas CSV realmente importadas en Analítica**. Los escenarios dependen de parámetros introducidos y no garantizan conversiones. Ninguno publica campañas ni envía métricas a redes.

Pruebas: `node --test tests/marketing-engines.test.mjs tests/advanced-engines.test.mjs tests/growth-engines-integration.test.mjs tests/advanced-engine-lab.test.mjs` y `node scripts/marketing-engines-qa.mjs` (con Playwright, servido por Vite).

## Inicio rápido

Necesitas Node.js 22 o posterior (y sus herramientas de desarrollo para Android/iOS si compilas una app nativa).

```bash
npm install
npm run dev
```

Abre la dirección local que indique Vite. Para generar una versión web distribuible:

```bash
npm run build
npm run preview
```

### Android (requiere Android Studio + SDK)

```bash
npm install
npm run build
npm run android:init
npm run android:open
```

### iPhone / iPad (requiere un Mac con Xcode)

```bash
npm install
npm run build
npm run ios:init
npm run ios:open
```

Una vez creados los proyectos nativos, tras cambiar el código web usa `npm run mobile:sync`. Las carpetas nativas se generan con Capacitor y deben revisarse, probarse y versionarse una vez configuradas para las tiendas. **No se incluyen APK, AAB ni IPA firmados, ni apps publicadas.**

## Funciones visibles y operativas localmente en v0.3

- Identidad NEXUS + PULSE: cian, magenta, violeta y neón.
- Pantalla de carga animada, saltable y adaptable a movimiento reducido; recuperación de inicio y diagnóstico sin borrar datos.
- Panel principal, estudio creativo ilustrativo, campañas, analítica, bandeja, ajustes y centro de herramientas planificadas por plan.
- Crear y organizar **borradores locales** con fecha y estado; editarlos, duplicarlos, eliminarlos con confirmación y exportarlos en CSV (con protección contra fórmulas); no publica en redes reales.
- Editor conceptual de vídeo 9:16 y 16:9, sin exportación audiovisual.
- Modo FREE con espacios publicitarios ficticios y créditos de ejemplo.
- Modo PRO activable sin pagar en demo; desaparecen los espacios de anuncios.
- Responsive para smartphones, tablets y escritorios; shell de Capacitor preparado.

**Los números, campañas, mensajes y gráficas del prototipo son inventados y se etiquetan como demostración.** No existen cuentas reales conectadas ni generación de IA activa. Las recompensas son ficticias y no se cargan anuncios.

## Monetización futura

FREE con anuncios aprobados e identificados, recompensas opcionales; PRO con suscripción mensual y sin publicidad. **Precio provisional: 29,90 €/mes IVA incluido**. Hay que validar los costes de IA, permisos de APIs, métodos de pago, verificación en backend, privacidad y anuncios reales antes de comercializar.

## Seguridad y privacidad

La versión demo no requiere usuario ni servidor: preferencias y borradores se guardan en `localStorage`. No es una solución segura para almacenar datos empresariales reales. No incluye claves ni redes publicitarias. Antes del lanzamiento se necesita autenticación real, cifrado y permisos por usuario, consentimientos y revisión legal.

Consulta [ROADMAP.md](ROADMAP.md).

---
MarketHub AI es un nombre de trabajo, no implica que se haya registrado una marca.

### Verificación del arranque (iPhone, Android y navegador)

Si la página no inicia, abre `diagnostico.html` dentro del sitio publicado. El inicio incluye una pantalla de recuperación que muestra fallos de recursos y errores de ejecución; no borra borradores ni preferencias. La publicación GitHub Pages y las pruebas en Node no sustituyen comprobaciones en Safari iOS y Chrome Android.

## Desarrollo para Apple, Android, Microsoft y Mac

El diseño elegido se conserva en los bocetos originales de la carpeta assets; el visor referencias.html permite verlos intactos. El interfaz operativo debe reproducir esos diseños en móvil, tablet y escritorio, no reemplazarlos por una imagen decorativa. Se han preparado los iconos 192/512, el manifiesto y el servicio PWA para Windows/Mac y las configuraciones Capacitor para Android/iOS. El producto sigue siendo un prototipo sin AAB/IPA/MSIX comerciales ni publicación en tiendas. La lista de validación se encuentra en docs/PLATAFORMAS_Y_TIENDAS.md.

### Referencias visuales exactas

Los cuatro bocetos elegidos se conservan sin modificar en `assets/*-original.jpeg`. Puedes abrir la galería `referencias.html` para comparar la interfaz, el estudio creativo, las pantallas móviles y la pantalla de carga. La vista panorámica de carga usa directamente el boceto 04 con progreso superpuesto; la vista previa central del estudio usa un recorte fiel del boceto 02. **Esto no equivale todavía a una réplica píxel a píxel de la UI funcional en todos los dispositivos.**

## Campañas locales operativas

Desde **Campañas → Planificador de campañas** puedes crear, editar, duplicar, eliminar y exportar CSV con objetivos, plataforma, fechas y presupuesto **previsto**. FREE demo admite hasta 10 campañas locales y PRO demo hasta 150; son límites provisionales de demostración. Estas acciones no activan anuncios, no generan gasto, no requieren cuenta y se guardan en el navegador (también en el respaldo JSON existente).

La interfaz de ejemplo de métricas del boceto se conserva por separado y se identifica como ilustrativa.

## Analítica CSV real, sin cuentas conectadas

En **Analítica → Analítica con datos propios**, descarga la plantilla CSV, complétala con cifras de tus informes y vuelve a importarla. El módulo valida fechas, plataformas y números, suma las métricas por canal y genera una gráfica de alcance por fecha. No se envía información a ningún servidor. Los datos guardados entran en el respaldo JSON local; no representan datos de cuentas conectadas.

## Modo ESPEJO — referencia visual aprobada

La versión 0.6.0 conserva intactos los cuatro JPEG aprobados, pero **las vistas Inicio y Estudio se abren con componentes vivos y adaptables**. La superposición de fotos anterior impedía que los paneles se reorganizaran o editaran sin perder usabilidad. En versiones anteriores, las vistas se abrían mostrando **los JPEG originales** de los bocetos 01 (Inicio), 02 (Estudio creativo) y 03 (pantallas móviles), sin filtros, inversiones, recoloreados ni reinterpretaciones. La pantalla de carga utiliza el JPEG original 04 en todos los dispositivos. Los originales están duplicados **sin modificar un byte** en `public/assets/` para que la compilación Vite y las apps Capacitor utilicen los mismos diseños que la web.

Las áreas transparentes sobre los originales permiten navegar y abrir funciones locales. Desde la placa inferior del escritorio, las zonas de edición del estudio o la opción «Abrir controles editables» del menú móvil se entra a los controles funcionales. Los KPI, conexiones y cifras fotografiados forman parte del boceto y **no representan mediciones ni conexiones reales**. La reproducción pixel a pixel de una imagen no equivale todavía a haber implementado todas sus funciones. Se debe mantener este diseño literal mientras se sustituyen progresivamente las zonas estáticas por componentes vivos con geometría y paleta coincidentes.

## Interfaz adaptable y funcional (v0.6.1)

El panel principal se construye con componentes reales: seis indicadores, gráfico de alcance basado en CSV, calendario, publicaciones, campañas, bandeja, Social Listening y accesos funcionales. Los datos sin conectar se presentan como no disponibles, sin fingir ROI ni conexiones. En móviles todos los bloques se reordenan verticalmente y la navegación permanece accesible en la barra inferior; en tablet el menú lateral muestra sus etiquetas; en PC/Mac aparecen varias columnas.

El Estudio creativo ahora incluye storyboard con edición de escenas, orden, duración, textos, formato, paleta, vista previa, exportación JSON y descarga **PNG auténtica** de 1080×1920 o 1920×1080. El editor gráfico PNG previo se mantiene. **Todavía no renderiza vídeo**, ni genera imágenes con IA externa, ni publica en redes. Los cuatro bocetos originales siguen guardados como referencia de fidelidad; la composición dinámica aún necesita ajustes visuales para igualar exactamente cada elemento.

### Controles del estudio 0.6.1

La previsualización del storyboard reproduce escenas con su duración configurada y permite pausar. Su imagen estática puede exportarse como PNG auténtico en 9:16/16:9; el proyecto se exporta en JSON. El editor completo de vídeo con audio, exportación MP4, generación IA y publicaciones automáticas todavía están pendientes. Imagen/Diseño/Plantillas abren el diseñador local, Texto/Copy las plantillas de Oficina y Ideas las utilidades locales Growth Lab.

Las pruebas abarcan Chromium y una auditoría separada de WebKit y Firefox. Las pruebas de navegador **no sustituyen** Safari iOS ni dispositivos físicos. Se puede generar un APK Android de **depuración** mediante GitHub Actions, pero no hay todavía paquete comercial firmado ni versión publicada en tiendas.

## v0.7.0 · Funciones locales nuevas

**Vídeo desde el estudio.** Cuando el navegador permite Canvas y MediaRecorder, puedes generar clips auténticos sin audio en MP4 o WebM con fotografías propias, escenas, textos, fundidos y zoom. Esta fase admite hasta 12 escenas y 45 segundos a 720p. Si el navegador no soporta grabación local, el botón se desactiva. No incorpora todavía música, subtítulos automáticos, exportación 4K ni IA generativa. Los archivos no se envían a un servidor.

**Copias protegidas.** Ajustes permite exportar y restaurar archivos cifrados con contraseña mediante AES-256-GCM y PBKDF2-SHA256, sal e IV aleatorios. La contraseña no se almacena y no se puede recuperar. Las copias JSON sin cifrar siguen disponibles para no perder compatibilidad.

**Competencia.** Registro manual de cuentas, seguidores e interacciones por publicación; comparación, edición y descarga CSV. Hasta 3 competidores en FREE demo y 30 en PRO demo. No se simulan consultas a APIs ni se afirman métricas oficiales.

## v0.7.1–0.7.2 · Recomendaciones y compatibilidad

Las recomendaciones del panel usan alcance por plataforma importado, fechas de publicaciones y presupuestos previstos. No son análisis generados por una IA externa. La versión 0.7.2 corrige la precarga de estilos de la pantalla de carga adaptable en la PWA, manteniendo los cuatro originales de referencia.

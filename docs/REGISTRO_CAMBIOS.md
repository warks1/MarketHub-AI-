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

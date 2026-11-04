# MarketHub AI — Especificaciones maestras y reglas de conservación
**Edición:** 2026-11-04 · **Estado:** documento rector del proyecto · **Nombre provisional:** MarketHub AI

> Esta lista es acumulativa. Una tarea nueva no sustituye ninguna petición anterior. Lo que el usuario ha pedido pasa a ser parte del alcance mientras no lo modifique expresamente.

## A. Reglas de evolución y conservación — OBLIGATORIAS

- **GOV-01 — Nunca quitar funciones por simplificar.** Reparar, modernizar y mejorar de forma compatible. Si cambia la implementación de una función, mantener una equivalente o superior, sus rutas de acceso, sus datos y sus permisos.
- **GOV-02 — Especificaciones acumulativas.** Antes de implementar una actualización, consultar este archivo, la hoja de ruta y el estado real del código. Añadir nuevas solicitudes aquí con ID estable y fecha.
- **GOV-03 — Cambios incrementales y reversibles.** Mantener control de versiones, historial de cambios, respaldo anterior en Git y migraciones de datos cuando se necesiten. Evitar borrados silenciosos de proyectos, planes, borradores, conexiones, suscripciones o créditos.
- **GOV-04 — Verificación antirregresión.** Ejecutar controles estructurales, compilación y, al madurar el producto, tests unitarios, integrados y E2E para móvil/tablet/escritorio; comprobar cada botón y navegación.
- **GOV-05 — Transparencia de madurez.** Diferenciar siempre: «diseñado», «prototipo/demo», «implementado localmente», «conectado/probado» y «publicado/operativo». No llamar real a funciones simuladas ni mostrar datos ficticios como datos de clientes.
- **GOV-06 — Mantenimiento de vanguardia.** Revisión periódica de tendencias, APIs, seguridad, formatos y competencia. Solo incorporar herramientas maduras, útiles, conformes a políticas y financieramente sostenibles.
- **GOV-07 — Prioridad de producto.** Debe ser una de las suites de marketing digital más completas, modernas, únicas, visualmente espectaculares y sencillas para principiantes sin limitar a profesionales.
- **GOV-08 — Sin degradar experiencias.** Mejorar rendimiento, accesibilidad, seguridad, privacidad, usabilidad, adaptación de pantallas y calidad gráfica en cada actualización.
- **GOV-09 — Estado verificable.** Cada cambio enlazará IDs de requisito, pruebas y entrada en REGISTRO_CAMBIOS.md. Si una función cambia de lugar, debe seguir siendo accesible y documentarse.

## B. Identidad visual, UX e inicio

- **UX-01** Interfaz NEXUS + PULSE, elegida expresamente: panel de inteligencia futurista + estudio creativo profesional.
- **UX-02** Colores oscuros de alto contraste, azul cian, violeta, magenta y acentos en verde eléctrico; tarjetas, gráficos y efectos de luz neón, sin sacrificar legibilidad.
- **UX-03** Tres experiencias de referencia: pantalla principal, estudio creativo y versión móvil, con estética extraordinaria.
- **UX-04** Splash de entrada coherente con la interfaz: logotipo, animación futurista de IA, movimiento lumínico, barra/progreso auténtico, accesibilidad y transición suave.
- **UX-05** Navegación clara, botones funcionales, estados de carga y error, modos táctiles con controles adecuados para dedos y ratón/teclado.
- **UX-06** Pantallas y menús completos; personalización de espacios de trabajo y de la marca, biblioteca visual, plantillas y tema claro opcional futuro sin perder el tema principal.
- **UX-07** Diseño moderno en todas las resoluciones, uso real de espacio para edición (no solo pantallas publicitarias).

## C. Plataformas — prioridad móvil

- **PLAT-01** iPhone (iOS), iPad (iPadOS), teléfonos Android, tablets Android.
- **PLAT-02** Web de escritorio para Windows/PC y Mac; tablet y móvil con adaptación funcional, no solo escalado.
- **PLAT-03** App multiplataforma con módulos compartidos y capacidades nativas donde sean necesarias; publicación en App Store y Google Play al completar los requisitos.
- **PLAT-04** En smartphones: navegación inferior, creación vertical y uso con una mano, gestos, zonas seguras, accesibilidad, cámara y biblioteca de medios cuando proceda.
- **PLAT-05** En tablet y PC: edición avanzada de vídeo, paneles múltiples, calendario ampliado, colaboración y soporte de teclado/ratón.
- **PLAT-06** Sincronización segura entre dispositivos y recuperación de proyectos tras autenticación, prevista para la versión de producción.
- **PLAT-07** Optimización de memoria, autonomía, carga, conectividad y accesibilidad; avisos claros de compatibilidad por red.

## D. Estudio de contenido y creación

- **CREA-01** Crear contenido completo para Instagram, TikTok, YouTube, Facebook, LinkedIn, X y otras plataformas compatibles.
- **CREA-02** Imágenes IA, diseños, banners, miniaturas, carruseles, infografías y anuncios; edición por capas y elementos editables.
- **CREA-03** Vídeo IA, Reels, Shorts, TikToks, Stories y anuncios en 9:16, 1:1, 4:5 y 16:9; línea de tiempo real, corte, transiciones, audio y exportación.
- **CREA-04** Subtítulos automáticos multidioma, voz en off, doblaje/traducción, música con licencia, silencios, clips automáticos y adaptación por plataforma.
- **CREA-05** Copywriting: títulos, descripciones, guiones, CTA, hashtags, ideas, variaciones y pruebas A/B; tono y estilo de marca.
- **CREA-06** Editor de plantillas, kit de marca con logotipo, tipografía y colores; reutilización multiformato, redimensionamiento y exportación profesional.
- **CREA-07** Biblioteca y gestor multimedia, historial de versiones, borradores y activos por marca/proyecto.
- **CREA-08** Previsualización por plataforma y revisión humana del contenido antes de publicar; derechos de uso y transparencia sobre contenido generado con IA.

## E. Publicación, calendario y plataformas

- **SOC-01** Conectar varias cuentas y marcas con OAuth oficial; mostrar permisos, errores y expiraciones de conexión.
- **SOC-02** Calendario de contenido con orden, borradores, vista día/semana/mes, aprobaciones, colas, mejores horas y programación multicanal.
- **SOC-03** Publicación automática y manual donde las APIs lo permitan; notificación o flujo alternativo cuando existan limitaciones.
- **SOC-04** Adaptación creativa y textual específica para cada red, no copias idénticas sin optimización.
- **SOC-05** Gestión de publicaciones, comentarios, mensajes y menciones según permisos de cada plataforma.
- **SOC-06** Incorporar novedades oficiales (por ejemplo publicación de fotos en TikTok API según permisos) sin perder funciones previas.

## F. Marketing experto con IA

- **AI-01** IA experta en marketing digital hasta el mínimo detalle, comprensible para una persona principiante y útil para empresas, creadores, autónomos y agencias.
- **AI-02** Copiloto conversacional que explique qué hacer y por qué, planifique desde cero y guíe por objetivos, sector, público, presupuesto y país.
- **AI-03** Asistentes de estrategia, posicionamiento, segmentación, identidad de marca, embudos y optimización de campañas; prompts y flujos reutilizables.
- **AI-04** Agentes de trabajo: investigar tendencias, generar propuestas, montar campañas, analizar resultados, sugerir cambios y pedir aprobación antes de publicar o gastar.
- **AI-05** IA de rendimiento que recomiende cuándo publicar, qué creatividades probar y cómo mejorar KPI, con explicaciones y posibilidad de deshacer.
- **AI-06** Control de coste real de IA: cuotas, créditos, límites de uso razonable, evaluación de proveedores y fallback seguro.
- **AI-07** Privacidad: no entrenar modelos con datos de clientes sin permiso; secretos fuera del cliente; moderación y revisión del contenido.
- **AI-08** Coherencia de marca y generación editable, con intervención humana y verificación de hechos para evitar publicidad engañosa.

## G. Publicidad digital gestionada

- **CAMP-01** Crear, administrar y medir campañas Meta Ads, Google Ads y TikTok Ads, sujeto a integración y permisos oficiales.
- **CAMP-02** Objetivos de awareness, tráfico, contactos, ventas, remarketing, públicos y campañas multicanal.
- **CAMP-03** Presupuestos, límites, alertas y aprobación humana antes de comprometer gastos.
- **CAMP-04** Creatividades dinámicas, experimentos A/B, comparación de anuncios y sugerencias IA.
- **CAMP-05** Panel de conversiones, leads, coste por adquisición (CPA), ROAS, ROI y atribución.
- **CAMP-06** Optimización progresiva sin prometer resultados ni gestionar dinero sin autorización explícita.

## H. Analítica, inteligencia social y crecimiento

- **AN-01** Paneles y reportes configurables: alcance, interacciones, seguidores, clicks, conversiones, ingresos, coste y rentabilidad.
- **AN-02** Comparación de fechas, plataformas, campañas, marcas y segmentos con datos oficiales disponibles.
- **AN-03** Social Listening: menciones, hashtags, palabras clave, sentimiento, alertas de reputación, tendencias y temas emergentes.
- **AN-04** Análisis de competidores, cuota de conversación y benchmarking dentro de datos públicos y permisos.
- **AN-05** Investigación de contenidos, tendencias, audiencias, hooks y factores creativos asociados al rendimiento.
- **AN-06** Informes exportables, paneles por cliente y seguimiento de objetivos/KPIs.
- **AN-07** Optimización para búsqueda social y descubrimiento multimodal; SEO tradicional y descubrimiento por motores de IA, sin prometer posicionamiento.
- **AN-08** Investigación de influencers/UGC y relaciones de creadores, con seguimiento de retorno y divulgación de colaboraciones pagadas.

## I. Marketing completo, ventas, CRM y equipos

- **BUS-01** Bandeja unificada de mensajes, comentarios y menciones; clasificación y sugerencias de respuesta con IA.
- **BUS-02** CRM con clientes, contactos, etiquetas, oportunidades, leads, historial y seguimiento de conversiones.
- **BUS-03** Email marketing: diseños, segmentación, envíos, automatizaciones y métricas; bajas y consentimiento.
- **BUS-04** SEO, web, landing pages, formularios de captura y embudos.
- **BUS-05** Comercio electrónico, catálogos, promociones, atribución y conexión a tiendas compatibles.
- **BUS-06** Automatizaciones visuales con disparadores/condiciones, revisiones, errores y límites.
- **BUS-07** Espacios para agencias, marcas y empresas; equipos, roles, clientes y procesos de aprobación.
- **BUS-08** Informes profesionales, facturación/gestión de la suscripción y herramientas de productividad para campañas.
- **BUS-09** Centro de notificaciones, tareas, historial, biblioteca y trazabilidad.

## J. Modelo de negocio FREE + PRO

- **MON-01** FREE permanece realmente utilizable sin tarjeta: funciones esenciales de creación, planificación y paneles limitados.
- **MON-02** FREE incluye publicidad integrada, inequívocamente identificada y no intrusiva; nunca ocultar un anuncio como contenido o interrumpir un editor a mitad de trabajo.
- **MON-03** Monetización prevista con anuncios autorizados: AdMob en Android/iOS, sistema adecuado para web como AdSense si cumple sus políticas; ingresos no garantizados.
- **MON-04** Anuncios recompensados estrictamente optativos para conseguir créditos de IA; recompensa solo tras verificación real del proveedor en producción.
- **MON-05** PRO con suscripción mensual, *sin publicidad*, más herramientas y mayor cuota de IA; precio de estudio: **29,90 €/mes, IVA incluido**, todavía no aprobado como definitivo.
- **MON-06** Claridad de límites, renovaciones y cancelaciones; prueba gratuita solo si realmente se implementa con términos precisos.
- **MON-07** Cuotas FREE/PRO, número de redes y marcas, créditos y políticas de uso sujetos a costes reales y pruebas de producto.
- **MON-08** Suscripciones con compras de plataforma donde sean obligatorias, backend de verificación, recuperación de compras, protección antifraude y gestión multi-dispositivo.
- **MON-09** Privacidad RGPD y consentimientos para anuncios en España/UE; CMP conforme a requisitos, preferencia y revocación fáciles; anuncios adecuados y botón de reporte.
- **MON-10** La pantalla de carga no incluirá publicidad intrusiva en PRO; toda prueba visual de FREE/PRO debe estar identificada como demostración hasta disponer de proveedores reales.

## K. Seguridad, confiabilidad y accesibilidad

- **SEC-01** Cuentas, permisos por marca/rol, autenticación segura, control de sesiones y backend protegido.
- **SEC-02** Almacenamiento cifrado, copias verificables, gestión de datos, recuperación y exportación.
- **SEC-03** Protección ante abuso, límites por API, registros, monitorización, seguridad web/móvil, secretos y cambios de configuración.
- **SEC-04** Cumplimiento RGPD, políticas y permisos de cada red y de App Store/Google Play.
- **SEC-05** Rendimiento y fiabilidad en smartphones/tablets; modo accesible y respeto a reducción de movimiento.
- **SEC-06** Métricas y anuncios *reales* solo después de conexiones verificadas; sin testimonios ni números ficticios presentados como verdaderos.

## L. Estado real al 4 de noviembre de 2026

**IMPLEMENTADO SOLO COMO DEMO / BASE VISUAL**
- Navegación NEXUS + PULSE; splash animado; tarjetas y gráfico ilustrativo; cambio FREE↔PRO local; espacios publicitarios ficticios; créditos ficticios.
- Estudio creativo visual con modos de formato, sin procesamiento de vídeo real.
- Borradores guardados localmente, calendario y pantallas ilustrativas; responsive, archivos de configuración Capacitor Android/iOS.
- Documentación, GitHub y posibilidad de intentar compilar versiones de desarrollo. No se ha confirmado una APK/IPA instalable y probada en dispositivo físico.

**PENDIENTE DE IMPLEMENTACIÓN REAL**
- Registro/login, sincronización nube, IA conectada, publicación multired, OAuth, edición audiovisual/exportación, campañas y analítica con datos reales, inbox/CRM, publicidad real, recompensas verificadas, compras y suscripciones reales, seguridad/privacidad completas y publicación en tiendas.

## M. Referencias sectoriales revisadas en noviembre de 2026

- Hootsuite: https://www.hootsuite.com/research/social-trends
- Metricool (19-08-2026): https://metricool.com/press-release-state-of-ai-in-social-media-study/
- Sprout Social (2026): https://sproutsocial.com/insights/data/2026-social-media-content-strategy-report/
- Canva AI 2.0: https://www.canva.com/newsroom/news/canva-create-2026-ai/
- HubSpot (septiembre de 2026): https://www.hubspot.com/media-kit?facet1=powerpoint
- TikTok Content Posting API: https://developers.tiktok.com/docs/en/content-posting-api-get-started
- AdMob y CMP: https://support.google.com/admob/answer/13554116?hl=en
- Apple App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/

**Revisión de novedades:** trimestral como mínimo y en cada cambio importante de APIs, tiendas o herramientas de IA. Todo cambio técnico exige comprobar permisos y términos vigentes.

## N. Criterios de aceptación de cada entrega

1. La funcionalidad nueva está identificada con un ID del registro maestro.
2. Ningún módulo previo desaparece; si se refactoriza, se documenta su paridad funcional.
3. No se pierde contenido local/de clientes ni se revierte la identidad NEXUS + PULSE.
4. Se ejecuta el control de preservación y la compilación; los tests E2E se harán obligatorios antes del lanzamiento.
5. Se explica qué está probado de verdad y qué sigue siendo simulación.
6. La nueva función es accesible en móvil, tablet y escritorio según corresponda.
7. Se incorpora la entrada al registro de cambios antes de cerrar una versión.

## O. Completar al máximo FREE y PRO — ampliación 2026-11-04

- **FULL-01:** El usuario podrá cubrir toda la cadena de marketing (estrategia, producción, publicación, promoción, atención, captación, ventas, análisis y mejora).
- **FULL-02:** FREE será útil y tendrá acceso a herramientas en casi todas las familias, con límites claros y anuncios identificados.
- **FULL-03:** PRO tendrá todas las familias, funciones profesionales y mayor capacidad, sin anuncios, manteniendo cuotas viables de IA.
- **FULL-04:** Incluir un catálogo navegable y con búsqueda que distinga FREE/PRO y el estado real (demo, pendiente, operativo).
- **FULL-05:** Registrar herramientas por ID estable, aumentar sin borrar módulos y conservar navegación móvil/PC.
- **FULL-06:** Incorporar link en bio, CRM, SEO social, email, landings, afiliados/UGC, social listening, agentes supervisados, automatización, edición audiovisual y publicidad.
- **FULL-07:** Revisar alternativas líderes y capacidades de API periódicamente, adoptando mejoras útiles de forma segura.
- **FULL-08:** Ser de las más completas del mercado es la meta comercial, **no un hecho** hasta que la cobertura esté implementada, probada y comparada.

Consultar [Matriz FREE/PRO](MATRIZ_FREE_PRO.md) y [Comparativa noviembre 2026](COMPARATIVA_COMPETIDORES_2026.md).


## Q. Growth Lab local v0.3.0 — funcionalidades añadidas y conservadas

Estas funciones son **utilizables localmente en navegador** y se añaden a las anteriores. No las presentar como IA generativa ni como conexiones reales a redes. Es importante que no se retire ninguno de los módulos anteriores.

- **GROW-01** Laboratorio de marketing accesible desde inicio, menú y fichas del catálogo, adaptable a iPhone, Android, tablets y escritorio.
- **GROW-02** Brief de campaña: guardar objetivo, marca, público, oferta, canal, presupuesto, fecha y CTA; biblioteca local y exportación a texto. No ejecuta campañas ni gasta presupuesto.
- **GROW-03** Constructor de enlaces UTM sobre URL HTTPS, preservando los parámetros existentes y generando source/medium/campaign, content y term opcionales; biblioteca y copia del enlace. No implica analítica conectada.
- **GROW-04** Revisión SEO social por heurísticas de redacción (palabra clave, CTA, longitud, hashtags), puntuación explícitamente orientativa; no equivale al algoritmo real de TikTok/Meta/Google/YouTube.
- **GROW-05** Editor de email, asunto, preheader, contenido y CTA HTTPS con exportación HTML/texto. No envía mensajes, no conserva destinatarios y requiere consentimiento y mecanismos de baja antes del envío comercial.
- **GROW-06** Reutilización de contenido mediante tres plantillas para Instagram, LinkedIn y Reels/TikTok. Contenido editable, copiable y transferible a borradores sin publicación.
- **GROW-07** Micrositio «link en bio» HTML descargable: enlaces HTTPS, nombre, descripción y controles de cuota; sin dominio ni hosting.
- **GROW-08** Herramientas accesibles en FREE con límites de uso locales y PRO con cuotas superiores. El modo PRO sigue siendo demostración, sin pagos.
- **GROW-09** Las URLs se validan en HTTPS, los textos mostrados se escapan, las eliminaciones requieren confirmación y hay pruebas automáticas; estas salvaguardas **no** convierten aún el sistema en una plataforma apta para datos sensibles.
- **GROW-10** Las bibliotecas de Growth Lab, Oficina, Estudio Visual y borradores anteriores usan claves locales independientes para evitar borrar el trabajo previo. Una futura sincronización real exigirá migraciones seguras.


## R. Protección de trabajos y navegación móvil completa (v0.3.1)

- **SAFE-01:** pantalla de Ajustes con exportación conjunta de borradores, Oficina, Estudio Visual y Growth Lab a JSON local.
- **SAFE-02:** importación JSON versionada, válida únicamente para módulos conocidos, comprobando tamaño, profundidad y tipos de dato.
- **SAFE-03:** confirmar explícitamente la restauración e informar sobre cuántos módulos existentes se sobrescribirán; los módulos omitidos en la copia deben conservarse.
- **SAFE-04:** ante un fallo de almacenamiento, intentar recuperar los valores anteriores en los módulos afectados; informar claramente de la limitación.
- **SAFE-05:** la copia no está cifrada; advertir al usuario de que no almacene datos sensibles y de que proteja el archivo exportado.
- **SAFE-06:** la exportación local nunca equivale a sincronización de cuenta ni a copias en servidores; requiere implementación adicional antes de uso empresarial.
- **MOB-01:** no construir barras móviles con posiciones fijas de un listado que crece; acceso por identificadores estables.
- **MOB-02:** mantener cinco accesos rápidos y el menú «Más» con **todas las secciones** (actualmente doce).
- **MOB-03:** el menú «Más» debe funcionar con botón, cierre y tecla Escape, y ofrecer entrada a módulos aunque no aparezcan en la barra inferior.
- **MOB-04:** añadir pruebas de regresión de navegación, conservar acceso desde móvil, tablet y PC y no degradar accesibilidad.


## Q. Innovación continua y nuevas capacidades · noviembre 2026

- **VIS-01** Editor gráfico real de navegador: cuatro formatos, textos, estilos, colores, foto de sesión y exportación PNG; preservarlo en cada refactor. La herramienta sigue siendo simple, no un editor por capas ni IA generativa.
- **BACK-01** Copias JSON versionadas de los cuatro almacenes locales (borradores, oficina, diseño y Growth Lab); restauración con confirmación previa y validación básica, con advertencia de sobrescritura y de ausencia de cifrado.
- **RADAR-01** Copiloto y agentes de marketing conscientes del contexto del CRM, con explicaciones, datos de origen, control de créditos y aprobación humana antes de actuar.
- **RADAR-02** AEO (optimización para motores de respuesta de IA), además del SEO tradicional y social.
- **RADAR-03** Imagen a vídeo y edición de animación, timeline multicapa, doblaje, subtítulos y exportación de calidad.
- **RADAR-04** Escucha social avanzada y alertas de reputación con datos realmente autorizados.
- **RADAR-05** Flujos conectados a CRM, publicidad, contenido y email, con consentimiento, roles y simulación de costes.
- **RADAR-06** Evaluación trimestral de plataformas, tendencias y SDKs sin retirar funciones anteriores.

Referencias y fechas: [RADAR_TECNOLOGICO_2026.md](RADAR_TECNOLOGICO_2026.md).

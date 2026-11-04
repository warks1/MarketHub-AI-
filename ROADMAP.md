# Hoja de ruta · MarketHub AI

## Enfoque principal: smartphones y tablets

- Mobile first: iPhone, iPad, Android y tablets Android.
- Navegación inferior táctil, gestos previstos, zonas seguras para notch e indicadores.
- Layout expandible para PC/Mac con editor de mayor tamaño.
- Base compartida Vite + Capacitor 8, proyectos nativos generables para Android e iOS.

## v0.1 · Entregada como prototipo técnico

- [x] Sistema visual NEXUS + PULSE
- [x] Pantalla de carga animada y saltable
- [x] Panel principal y gráficas de ejemplo
- [x] Estudio creativo ilustrativo, modos 9:16 y 16:9
- [x] Borradores y calendario persistentes localmente
- [x] Vistas de campañas, analítica y bandeja (ficticias)
- [x] Plan FREE con espacios de anuncios simulados y recompensa ficticia opcional
- [x] Plan PRO de demo sin publicidad, seleccionable sin pago
- [x] Responsive móvil, tablet y escritorio; configuración Capacitor
- [x] Textos explícitos de estado demo y sin datos falsamente atribuidos a usuarios reales

## v0.2 · Base real

- [ ] Arquitectura de frontend por componentes y tests automatizados.
- [ ] Backend, sesiones, perfiles, organización multiempresa y permisos.
- [ ] Gestión segura de secretos, registros de auditoría y RGPD.
- [ ] Autenticación con email y opciones de inicio seguras.
- [ ] Generar proyectos nativos y pasar pruebas en dispositivos físicos.
- [ ] Iconos nativos y splash nativos; una animación de carga dentro de la app no los sustituye.

## v0.3 · Marketing real

- [ ] OAuth y APIs oficiales para programar y publicar donde lo permita cada red.
- [ ] Bandeja real según permisos de plataformas.
- [ ] Analítica unificada y métricas no ficticias.
- [ ] Editor audiovisual real, multimedia, plantillas y exportaciones.
- [ ] Motor de IA remoto, cuotas verificadas, moderación y control de costes.
- [ ] Flujo de aprobación de contenido y almacenamiento seguro.

## v0.4 · Monetización real

- [ ] PRO: compras dentro de iOS / Google Play, recibos verificados en servidor y restauración de compras.
- [ ] FREE: integración de SDKs de anuncios en iOS/Android, formatos no intrusivos y anuncios recompensados optativos.
- [ ] Consentimiento UE para anuncios, privacidad, retirar consentimiento y gestión de datos.
- [ ] Configurar identificadores reales de anuncios solo en builds de prueba/producción, nunca inventarlos.
- [ ] Políticas de anuncios, privacidad, suscripciones, reembolsos, términos y transparencia.
- [ ] Limitar costes variables de IA, antiabuso, tasa de solicitudes y control de márgenes.

## v1.0 · Publicación

- [ ] Accesibilidad, pruebas de carga, seguridad y seguridad de datos.
- [ ] Publicación en App Store / Google Play con cuentas de desarrollador y revisiones.
- [ ] Versión web desplegada con HTTPS y dominio oficial.
- [ ] Auditoría de privacidad y seguridad previa al lanzamiento.

## Identidad y monetización preliminar

- Nombre provisional MarketHub AI.
- FREE: anuncios identificados + funciones limitadas.
- PRO: sin anuncios, suscripción mensual con precio de referencia 29,90 € IVA incluido (pendiente de estudio).
- La plataforma no es aún una solución lista para operar comercialmente.


## Política de continuidad — añadida 2026-11-04

- El alcance acumulativo y los estados reales se encuentran en [docs/ESPECIFICACIONES_MAESTRAS.md](docs/ESPECIFICACIONES_MAESTRAS.md).
- Cada actualización debe conservar las funciones existentes, registrar IDs de requisitos, pasar controles de continuidad y compilar.
- La cobertura actual de regresión es **estructural, no funcional**; crear pruebas reales de flujos de usuario y en smartphones/tablets antes del lanzamiento.
- Prioridades sectoriales 2026: IA estratégica/agentes con aprobación humana, vídeos cortos, diseño editable en capas, social listening, búsqueda social, campañas guiadas por datos y colaboración con creadores; no sustituyen a módulos anteriores.

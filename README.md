# MarketHub AI · NEXUS × PULSE

**Estado actual: prototipo v0.3.0. No hay redes conectadas, IA comercial, suscripciones cobradas ni anuncios reales.**

**Documentación maestra que debe consultarse antes de cualquier modificación:**

- [ESPECIFICACIONES MAESTRAS — todos los requisitos acumulados](docs/ESPECIFICACIONES_MAESTRAS.md)
- [Registro de cambios y política de continuidad](docs/REGISTRO_CAMBIOS.md)
- [Matriz de funciones FREE y PRO](docs/MATRIZ_FREE_PRO.md)
- [Comparativa competitiva 2026](docs/COMPARATIVA_COMPETIDORES_2026.md)
- [Contrato automatizado de continuidad](docs/CONTRATO_CONTINUIDAD.json)
- [Roadmap técnico](ROADMAP.md)

> **Regla del proyecto:** no eliminar funciones solicitadas; corregir, mejorar y ampliar conservando los módulos previos. No confundir prototipo con integración real.

Para comprobar que no han desaparecido módulos estructurales fundamentales:

```bash
npm test
```

Este control se ejecuta en CI antes de compilar. No sustituye pruebas funcionales.

Base de una aplicación **mobile-first** de marketing digital para iPhone, iPad, Android, tablets Android y navegadores de ordenador.

**Estado: v0.3.1 · PROTOTIPO INTERACTIVO CON HERRAMIENTAS LOCALES · NO PRODUCCIÓN.**

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
- Pantalla de carga animada, saltable y adaptable a movimiento reducido.
- Panel principal, estudio creativo ilustrativo, campañas, analítica, bandeja, ajustes y centro de herramientas planificadas por plan.
- Crear y programar **borradores locales** con fecha; no publica en redes reales.
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

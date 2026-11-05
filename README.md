# MarketHub AI · NEXUS × PULSE

**Estado actual: prototipo v0.5.0. No hay redes conectadas, IA comercial, suscripciones cobradas ni anuncios reales.**

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

**Estado: v0.5.0 · PROTOTIPO INTERACTIVO CON HERRAMIENTAS LOCALES · NO PRODUCCIÓN.**

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

Por decisión del propietario, las vistas principales se abren mostrando **los JPEG originales** de los bocetos 01 (Inicio), 02 (Estudio creativo) y 03 (pantallas móviles), sin filtros, inversiones, recoloreados ni reinterpretaciones. La pantalla de carga utiliza el JPEG original 04 en todos los dispositivos. Los originales están duplicados **sin modificar un byte** en `public/assets/` para que la compilación Vite y las apps Capacitor utilicen los mismos diseños que la web.

Las áreas transparentes sobre los originales permiten navegar y abrir funciones locales. Desde la placa inferior del escritorio, las zonas de edición del estudio o la opción «Abrir controles editables» del menú móvil se entra a los controles funcionales. Los KPI, conexiones y cifras fotografiados forman parte del boceto y **no representan mediciones ni conexiones reales**. La reproducción pixel a pixel de una imagen no equivale todavía a haber implementado todas sus funciones. Se debe mantener este diseño literal mientras se sustituyen progresivamente las zonas estáticas por componentes vivos con geometría y paleta coincidentes.

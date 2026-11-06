# MarketHub AI · iconos de redes sociales y uso de marca (v0.7.7)

Los iconos sustituyen **solo** glifos genéricos de la interfaz. No implica que MarketHub AI esté asociada, patrocinada o autorizada por ninguna plataforma. Las siete tarjetas del panel indican expresamente **«Sin conectar»**. El selector de redes prepara borradores locales, no publica contenido ni solicita credenciales.

## Geometrías y fuentes

El módulo local `src/social-brand-icons.js` incluye las siluetas vectoriales originales de Instagram, TikTok, YouTube, Facebook, LinkedIn, X, WhatsApp, Threads, Pinterest, Snapchat, Bluesky, Twitch y Telegram.

Fuente geométrica: https://github.com/simple-icons/simple-icons (biblioteca Simple Icons); archivos SVG bajo `icons/<red>.svg` de la rama `develop`, capturados el 6 de noviembre de 2026. El icono de LinkedIn se obtuvo de `simple-icons` versión histórica 13.16.0 debido a que su archivo ya no está en la rama actual. **La licencia de los trazados vectoriales no concede permisos sobre las marcas registradas**.

Los colores corporativos se reservan a los iconos; la interfaz NEXUS × PULSE mantiene su identidad visual alrededor. Se conservan las proporciones de cada SVG, sin reflejos, distorsiones o efectos sobre el logotipo.

## Directrices oficiales y revisión legal antes de monetizar

- Instagram / Facebook / WhatsApp / Threads: https://www.meta.com/brand/resources/
- Instagram: https://www.meta.com/brand/resources/instagram/instagram-brand/
- LinkedIn: https://brand.linkedin.com/in-logo y https://brand.linkedin.com/downloads
- YouTube: https://www.youtube.com/howyoutubeworks/resources/brand-resources/
- TikTok: https://www.tiktok.com/about

**Importante:** LinkedIn restringe el uso de sus logotipos y ofrece variaciones aprobadas; para un producto comercial conviene sustituir la geometría histórica por un archivo oficial obtenido y usado conforme a las condiciones de LinkedIn. Las mismas comprobaciones de marca aplican a las demás redes. No debe representarse una integración activa cuando la API no esté conectada. Las cuentas no se vinculan en la versión actual.

## Continuidad y accesibilidad

Iconos incrustados localmente sin CDN ni conexiones externas, accesibles en modo oscuro, con textos legibles junto a cada símbolo. El SVG decorativo no duplica la etiqueta de lectura de pantalla; el módulo puede ofrecer `role="img"` y `aria-label` para uso independiente. Se conserva la tabla de opciones de la planificación, los estados locales y el resto de la app.

Nuevas acciones: tocar una tarjeta de plataforma válida abre el planificador con esa red preseleccionada; seleccionar otro icono o el desplegable actualiza la plataforma sin borrar el texto del borrador. Las tarjetas de redes que todavía no soportan borradores se muestran informativas, no como botones que engañen al usuario.

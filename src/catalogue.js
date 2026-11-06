export const catalogueSections = [
  {
    name:'Media Forge · herramientas integradas',
    icon:'✦',
    tools:[
      {id:'MF-001',name:'Órbita NEXUS · máscara propia',tier:'free',status:'local',mediaTab:'photo',description:'Máscara orbital, estilos y exportación para publicaciones; funciona sin conexión externa.'},
      {id:'MF-002',name:'Conversor de fotografías PNG/JPG/WebP',tier:'free',status:'local',mediaTab:'photo',description:'Conversión local con cinco formatos sociales. La compatibilidad WebP depende del navegador.'},
      {id:'MF-003',name:'Reproductor y conversor WAV',tier:'free',status:'local',mediaTab:'audio',description:'Reproduce audio y exporta WAV PCM recortado hasta 10 minutos si el navegador decodifica el original.'},
      {id:'MF-004',name:'Reproductor de vídeo y fotogramas',tier:'free',status:'local',mediaTab:'video',description:'Reproducción local y captura PNG del fotograma seleccionado.'},
      {id:'MF-005',name:'Conversor WebM compatible',tier:'free',status:'local',mediaTab:'video',description:'Solo en navegadores con MediaRecorder y captura de flujo soportados; máximo 90 segundos.'},
      {id:'MF-006',name:'Visor de PDF local',tier:'free',status:'local',mediaTab:'pdf',description:'Abre PDFs dentro de la aplicación si el navegador tiene visor integrado.'},
      {id:'MF-011',name:'Conversor SRT ↔ WebVTT',tier:'free',status:'local',mediaTab:'subs',description:'Edición y conversión de subtítulos con validación temporal, sin subir archivos.'},
      {id:'MF-012',name:'SafeFrame PULSE · guía creativa propia',tier:'free',status:'local',mediaTab:'photo',description:'Guías de márgenes orientativas y texto protegido para composiciones sociales. No es certificación de ninguna red.'},
      {id:'MF-013',name:'PULSE PACK · cinco formatos ZIP',tier:'free',status:'local',mediaTab:'photo',description:'Exporta cinco tamaños de imagen en un único ZIP sin salir de la aplicación.'},
      {id:'MF-014',name:'Enviar imagen de Media Forge a Estudio',tier:'free',status:'local',mediaTab:'photo',description:'Transferencia directa al storyboard con compresión y guardado local.'},
      {id:'MF-015',name:'Mi biblioteca multimedia privada',tier:'free',status:'local',mediaTab:'vault',description:'Guardado y recuperación persistente de archivos mediante IndexedDB. Se conserva en el dispositivo, no en la nube.'},
      {id:'MF-016',name:'ADN Creativo · perfiles locales',tier:'free',status:'local',mediaTab:'photo',description:'Guardar y aplicar colores, tono y CTA de hasta doce marcas en el dispositivo.'},
      {id:'MF-017',name:'Auditor Creativo PULSE',tier:'free',status:'local',mediaTab:'photo',description:'Revisa recortes, resolución, texto y guías SafeFrame. Diagnóstico orientativo sin certificar requisitos oficiales.'},
      {id:'MF-018',name:'Proyectos editables · MarketHub .mhub',tier:'free',status:'local',mediaTab:'projects',description:'Guarda la foto original, máscara, ajustes y ADN visual. Reanuda la edición y mueve una copia portable .mhub entre dispositivos.'},
      {id:'MF-019',name:'Respaldo completo de proyectos .mhubpack',tier:'free',status:'local',mediaTab:'projects',description:'Exporta todos los proyectos originales y ajustes en ZIP; restaura sin sobreescribir los existentes y detecta archivos dañados antes de importar.'},
      {id:'MF-020',name:'Copia integral de MarketHub AI (.mhubfull)',tier:'free',status:'local',settingsPage:'ajustes',description:'Respalda proyectos, medios, ADN de marca y módulos locales en un solo ZIP privado. Restauración aditiva, sin reemplazar datos preexistentes.'},
      {id:'MF-007',name:'ADN de Marca avanzado PRO',tier:'pro',status:'planned',description:'Ampliación futura con tipografías licenciadas, reglas por marca, variantes automáticas y biblioteca compartida.'},
      {id:'MF-008',name:'Una idea → campaña multiformato',tier:'pro',status:'planned',description:'Generar versiones coordinadas de imagen, vídeo, copies y miniaturas desde un brief con revisión humana.'},
      {id:'MF-009',name:'Máscaras inteligentes multicapa',tier:'pro',status:'planned',description:'Biblioteca ampliada y máscaras editables con seguimiento y herramientas para recortes complejos.'},
      {id:'MF-010',name:'Conversor avanzado de vídeo y audio',tier:'pro',status:'planned',description:'Motor local/nativo para MP4, MOV, H.264/H.265, MP3, AAC, subtítulos y cambios de resolución cuando exista soporte real.'}
    ]
  },

  {
    "name": "IA estratégica y copilotos",
    "icon": "✦",
    "tools": [
      {
        "id": "CAT-001",
        "name": "Asistente de marketing por chat",
        "tier": "free",
        "status": "planned"
      },
      {
        "id": "CAT-002",
        "name": "Brief de campaña inteligente",
        "tier": "free",
        "status": "local",
        "growthTab": "campanas",
        "description": "Brief de campaña manual y biblioteca local; no utiliza IA externa."
      },
      {
        "id": "CAT-PULSE-01",
        "name": "PULSE Campaign Pilot · de brief a 7 días",
        "tier": "free",
        "status": "local",
        "growthTab": "campanas",
        "description": "Crea siete textos y tareas editoriales editables desde un brief, exporta CSV o calendario ICS y envía borradores locales con cuotas. Funciona mediante plantillas, sin IA ni publicación automática."
      },
      {
        "id": "CAT-003",
        "name": "Agentes IA con aprobación",
        "tier": "pro",
        "status": "planned"
      },
      {
        "id": "CAT-004",
        "name": "Consejos de optimización",
        "tier": "free",
        "status": "planned"
      },
      {
        "id": "CAT-005",
        "name": "Guía de marca y tono",
        "tier": "free",
        "status": "planned"
      },
      {
        "id": "CAT-006",
        "name": "Investigación del público",
        "tier": "free",
        "status": "planned"
      },
      {
        "id": "CAT-007",
        "name": "Pronósticos y escenarios",
        "tier": "pro",
        "status": "planned"
      },
      {
        "id": "CAT-008",
        "name": "Experimentos con IA",
        "tier": "pro",
        "status": "planned"
      }
    ]
  },
  {
    "name": "Diseño, imágenes y marca",
    "icon": "🎨",
    "tools": [
      {
        "id": "CAT-009",
        "name": "Generador de ideas y copys",
        "tier": "free",
        "status": "local",
        "localTab": "copys",
        "description": "Genera tres propuestas de texto mediante plantillas sin usar IA externa."
      },
      {
        "id": "CAT-010",
        "name": "Editor de imágenes y plantillas",
        "tier": "free",
        "status": "local",
        "localTab": "diseño",
        "description": "Diseñador gráfico local funcional: plantillas, formatos y exportación PNG (sin edición por capas ni IA real)."
      },
      {
        "id": "CAT-011",
        "name": "Kit de marca",
        "tier": "free",
        "status": "local",
        "localTab": "marca",
        "description": "Guarda colores, nombre, eslogan y tono de una marca en el navegador."
      },
      {
        "id": "CAT-012",
        "name": "Imágenes con IA",
        "tier": "free",
        "status": "planned"
      },
      {
        "id": "CAT-013",
        "name": "Banners y carruseles",
        "tier": "free",
        "status": "planned"
      },
      {
        "id": "CAT-014",
        "name": "Retoque IA avanzado",
        "tier": "pro",
        "status": "planned"
      },
      {
        "id": "CAT-015",
        "name": "Variantes A/B",
        "tier": "free",
        "status": "planned"
      },
      {
        "id": "CAT-016",
        "name": "Exportación de alta calidad",
        "tier": "pro",
        "status": "planned"
      }
    ]
  },
  {
    "name": "Vídeo, Reels y audio",
    "icon": "🎬",
    "tools": [
      {
        "id": "CAT-017",
        "name": "Editor vídeo 9:16 y 16:9",
        "tier": "free",
        "status": "demo"
      },
      {
        "id": "CAT-018",
        "name": "Subtítulos automáticos",
        "tier": "free",
        "status": "planned"
      },
      {
        "id": "CAT-019",
        "name": "Generación de clips IA",
        "tier": "free",
        "status": "planned"
      },
      {
        "id": "CAT-020",
        "name": "Voz en off",
        "tier": "free",
        "status": "planned"
      },
      {
        "id": "CAT-021",
        "name": "Traducción y doblaje",
        "tier": "pro",
        "status": "planned"
      },
      {
        "id": "CAT-022",
        "name": "Recortes de vídeos largos",
        "tier": "pro",
        "status": "planned"
      },
      {
        "id": "CAT-023",
        "name": "Música con licencia",
        "tier": "free",
        "status": "planned"
      },
      {
        "id": "CAT-024",
        "name": "Edición multicapa avanzada",
        "tier": "pro",
        "status": "planned"
      },
      {
        "id": "CAT-025",
        "name": "Exportación 4K",
        "tier": "pro",
        "status": "planned"
      }
    ]
  },
  {
    "name": "Redes y calendario",
    "icon": "📅",
    "tools": [
      {
        "id": "CAT-026",
        "name": "Conexión de perfiles sociales",
        "tier": "free",
        "status": "planned"
      },
      {
        "id": "CAT-027",
        "name": "Calendario de contenido",
        "tier": "free",
        "status": "demo"
      },
      {
        "id": "CAT-028",
        "name": "Publicación multired",
        "tier": "free",
        "status": "planned"
      },
      {
        "id": "CAT-029",
        "name": "Adaptación por plataforma",
        "tier": "free",
        "status": "planned"
      },
      {
        "id": "CAT-030",
        "name": "Colas inteligentes",
        "tier": "pro",
        "status": "planned"
      },
      {
        "id": "CAT-031",
        "name": "Biblioteca de publicaciones",
        "tier": "free",
        "status": "planned"
      },
      {
        "id": "CAT-032",
        "name": "Mejores horas",
        "tier": "pro",
        "status": "planned"
      },
      {
        "id": "CAT-033",
        "name": "Link en bio",
        "tier": "free",
        "status": "local",
        "growthTab": "bio",
        "description": "Micrositio de enlaces exportable a HTML; no alojado en internet."
      },
      {
        "id": "CAT-034",
        "name": "Borradores locales",
        "tier": "free",
        "status": "demo"
      },
      {
        "id": "CAT-035",
        "name": "Gestión multimarcas",
        "tier": "pro",
        "status": "planned"
      }
    ]
  },
  {
    "name": "Analítica y tendencias",
    "icon": "📈",
    "tools": [
      {
        "id": "CAT-036",
        "name": "Dashboard de rendimiento",
        "tier": "free",
        "status": "demo"
      },
      {
        "id": "CAT-037",
        "name": "Analítica por fecha y perfil",
        "tier": "free",
        "status": "planned"
      },
      {
        "id": "CAT-038",
        "name": "Social listening básico",
        "tier": "free",
        "status": "planned"
      },
      {
        "id": "CAT-039",
        "name": "Competidores y benchmarking",
        "tier": "free",
        "status": "planned"
      },
      {
        "id": "CAT-040",
        "name": "Tendencias y hashtags",
        "tier": "free",
        "status": "planned"
      },
      {
        "id": "CAT-041",
        "name": "Informe simple",
        "tier": "free",
        "status": "planned"
      },
      {
        "id": "CAT-042",
        "name": "SEO social y búsqueda IA",
        "tier": "free",
        "status": "local",
        "growthTab": "seo",
        "description": "Revisión orientativa con reglas explícitas; no representa el algoritmo real de plataformas."
      },
      {
        "id": "CAT-043",
        "name": "Alertas de reputación",
        "tier": "pro",
        "status": "planned"
      },
      {
        "id": "CAT-044",
        "name": "Atribución de conversiones",
        "tier": "pro",
        "status": "planned"
      },
      {
        "id": "CAT-045",
        "name": "Informes avanzados de agencia",
        "tier": "pro",
        "status": "planned"
      }
    ]
  },
  {
    "name": "Publicidad y campañas",
    "icon": "🚀",
    "tools": [
      {
        "id": "CAT-046",
        "name": "Planificador de campañas",
        "tier": "free",
        "status": "demo"
      },
      {
        "id": "CAT-047",
        "name": "Gestor básico de anuncios",
        "tier": "free",
        "status": "planned"
      },
      {
        "id": "CAT-048",
        "name": "Control de presupuestos",
        "tier": "free",
        "status": "planned"
      },
      {
        "id": "CAT-049",
        "name": "Pruebas A/B publicitarias",
        "tier": "free",
        "status": "planned"
      },
      {
        "id": "CAT-050",
        "name": "ROI y ROAS",
        "tier": "free",
        "status": "local",
        "localTab": "calculadora",
        "description": "Calcula ROI, ROAS y costes usando cifras introducidas manualmente."
      },
      {
        "id": "CAT-051",
        "name": "Optimizador avanzado con IA",
        "tier": "pro",
        "status": "planned"
      },
      {
        "id": "CAT-052",
        "name": "Remarketing y audiencias",
        "tier": "pro",
        "status": "planned"
      },
      {
        "id": "CAT-053",
        "name": "Campañas multicanal avanzadas",
        "tier": "pro",
        "status": "planned"
      },
      {
        "id": "CAT-079",
        "name": "Generador de enlaces UTM",
        "tier": "free",
        "status": "local",
        "growthTab": "utm",
        "description": "Crea URLs de seguimiento HTTPS con parámetros utm_source, utm_medium, utm_campaign y opcionales, almacenadas localmente."
      }
    ]
  },
  {
    "name": "Clientes, ventas y email",
    "icon": "💼",
    "tools": [
      {
        "id": "CAT-054",
        "name": "Bandeja de mensajes",
        "tier": "free",
        "status": "demo"
      },
      {
        "id": "CAT-055",
        "name": "CRM de contactos",
        "tier": "free",
        "status": "local",
        "localTab": "crm",
        "description": "Contactos de prueba guardados en este dispositivo, con estados editables."
      },
      {
        "id": "CAT-056",
        "name": "Email marketing",
        "tier": "free",
        "status": "local",
        "growthTab": "emails",
        "description": "Diseño HTML y exportación; no permite enviar correo."
      },
      {
        "id": "CAT-057",
        "name": "Landing pages",
        "tier": "free",
        "status": "local",
        "localTab": "landing",
        "description": "Diseña y descarga una página HTML estática de captación."
      },
      {
        "id": "CAT-058",
        "name": "E-commerce y catálogos",
        "tier": "free",
        "status": "planned"
      },
      {
        "id": "CAT-059",
        "name": "Automatizaciones básicas",
        "tier": "free",
        "status": "planned"
      },
      {
        "id": "CAT-060",
        "name": "Segmentación avanzada",
        "tier": "pro",
        "status": "planned"
      },
      {
        "id": "CAT-061",
        "name": "Lead scoring con IA",
        "tier": "pro",
        "status": "planned"
      },
      {
        "id": "CAT-062",
        "name": "Reservas y formularios",
        "tier": "free",
        "status": "planned"
      }
    ]
  },
  {
    "name": "Crecimiento y creadores",
    "icon": "🌱",
    "tools": [
      {
        "id": "CAT-063",
        "name": "Influencers y UGC",
        "tier": "free",
        "status": "planned"
      },
      {
        "id": "CAT-064",
        "name": "Media kit para creadores",
        "tier": "free",
        "status": "planned"
      },
      {
        "id": "CAT-065",
        "name": "Afiliados y códigos",
        "tier": "pro",
        "status": "planned"
      },
      {
        "id": "CAT-066",
        "name": "Oportunidades locales",
        "tier": "free",
        "status": "planned"
      },
      {
        "id": "CAT-067",
        "name": "Google Business Profile",
        "tier": "free",
        "status": "planned"
      },
      {
        "id": "CAT-068",
        "name": "Reciclado de contenido",
        "tier": "free",
        "status": "local",
        "growthTab": "reutilizar",
        "description": "Adaptación de contenido por plantillas editables; sin IA externa."
      },
      {
        "id": "CAT-069",
        "name": "Brand lift y estudios avanzados",
        "tier": "pro",
        "status": "planned"
      }
    ]
  },
  {
    "name": "Equipos e integraciones",
    "icon": "⚙️",
    "tools": [
      {
        "id": "CAT-070",
        "name": "Usuarios y permisos básicos",
        "tier": "free",
        "status": "planned"
      },
      {
        "id": "CAT-071",
        "name": "Aprobación de contenidos",
        "tier": "pro",
        "status": "planned"
      },
      {
        "id": "CAT-072",
        "name": "Agencias y múltiples clientes",
        "tier": "pro",
        "status": "planned"
      },
      {
        "id": "CAT-073",
        "name": "Integraciones externas",
        "tier": "free",
        "status": "planned"
      },
      {
        "id": "CAT-074",
        "name": "API y webhooks",
        "tier": "pro",
        "status": "planned"
      },
      {
        "id": "CAT-075",
        "name": "Tareas y proyectos",
        "tier": "free",
        "status": "local",
        "localTab": "tareas",
        "description": "Lista local de tareas con fechas, prioridades y seguimiento."
      },
      {
        "id": "CAT-076",
        "name": "Historial y versiones",
        "tier": "free",
        "status": "planned"
      },
      {
        "id": "CAT-077",
        "name": "Auditoría profesional",
        "tier": "pro",
        "status": "planned"
      },
      {
        "id": "CAT-078",
        "name": "Seguridad y exportación",
        "tier": "free",
        "status": "planned"
      }
    ]
  }
];

import { catalogueSections } from './catalogue.js';
import {officePage,officeClick,officeSubmit,officeChange,officeOpenTab} from './office.js';
import {growthPage,growthOpenTab,growthClick,growthSubmit} from './growth.js';
import {backupExport,backupImport,backupSettingsHTML} from './backup.js';
import {visualPage,visualMount,visualClick,visualInput,visualFile} from './visual.js';
import {draftLimit,findPost,validatePost,postsToCSV} from './post-manager.js';

const app=document.querySelector('#app');
const safe = value => String(value??'').replace(/[&<>"']/g, chr => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[chr]));
const storeKey='markethub-ai-demo-v1';
// Fecha ISO local estable también en Safari iOS, sin depender del formato del locale.
const todayLocal=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
const demoPosts=[
  {id:1,title:'Bienvenido a MarketHub AI',platform:'Instagram',date:'2026-11-08',status:'Programada'},
  {id:2,title:'Presentación de nuestra campaña',platform:'TikTok',date:'2026-11-11',status:'Borrador'}
];
let saved={};
try{saved=JSON.parse(localStorage.getItem(storeKey)||'{}')||{}}catch{saved={}}
let state={
  page:'inicio',plan:saved.plan==='pro'?'pro':'free',credits:Number.isFinite(saved.credits)?saved.credits:20,
  posts:Array.isArray(saved.posts)?saved.posts:demoPosts,modal:null,creativeMode:'Video / Reels',
  videoFormat:'9:16',search:'',menuMore:false,consent: saved.consent || 'pending'
};
state.toolsFilter='all';state.toolsQuery='';state.selectedTool=null;
state.editPostId=null;state.pendingDeleteId=null;
const save=()=>{try{localStorage.setItem(storeKey,JSON.stringify({plan:state.plan,credits:state.credits,posts:state.posts,consent:state.consent}))}catch{}};
const icons={
 home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
 sparkles:'<path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7z"/><path d="m19 17 .7 2.3L22 20l-2.3.7L19 23l-.7-2.3L16 20l2.3-.7z"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18"/>',
 megaphone:'<path d="M3 11v3h4l10 5V6L7 11zM7 14l2 6h3l-2-5M17 9c2 0 3 1 3 3s-1 3-3 3"/>',
 chart:'<path d="M4 20V12h4v8M10 20V4h4v16M16 20v-9h4v9M2 20h20"/>',
 inbox:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 13h5l2 3h4l2-3h5"/>',
 gear:'<circle cx="12" cy="12" r="3"/><path d="m19 12 2-2-2-3-3 1-2-3h-4L8 8 5 7l-2 3 2 2-2 2 2 3 3-1 2 3h4l2-3 3 1 2-3z"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 crown:'<path d="m2 7 5 5 5-8 5 8 5-5-2 12H4z"/>',
 check:'<path d="m4 12 5 5L20 6"/>',
 close:'<path d="M5 5l14 14M19 5 5 19"/>',
 search:'<circle cx="10" cy="10" r="7"/><path d="m15 15 6 6"/>',
 arrow:'<path d="m5 12 14 0m-6-6 6 6-6 6"/>',
 users:'<circle cx="9" cy="7" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 7a3 3 0 0 1 0 6M17 15a5 5 0 0 1 4 5"/>',
 bolt:'<path d="M13 2 4 13h7l-1 9 10-12h-7z"/>',
 play:'<path d="m8 5 12 7-12 7z"/>',
 laptop:'<rect x="4" y="4" width="16" height="12" rx="2"/><path d="M2 20h20"/>'
};
function icon(name){return '<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+(icons[name]||icons.sparkles)+'</svg>'}
const nav=[
 ['inicio','Inicio','home'],['estudio','Estudio IA','sparkles'],['diseño','Diseño gráfico','sparkles'],['crear','Crear / Programar','plus'],['oficina','Oficina de marketing','users'],['laboratorio','Growth Lab','chart'],['herramientas','Herramientas','bolt'],
 ['campanas','Campañas','megaphone'],['analitica','Analítica','chart'],
 ['bandeja','Bandeja','inbox'],['planes','Suscripción','crown'],['ajustes','Ajustes','gear']
];
function sectionHeader(title,subtitle,action){
 return '<div class="page-head"><div><span class="eyebrow">NEXUS × PULSE · v0.3.2</span><h1>'+title+'</h1><p>'+subtitle+'</p></div><div class="page-head-actions">'+(action||'')+'<span class="demo-pill">Datos demo</span></div></div>';
}
function btn(text,action,klass='secondary',extra=''){return '<button class="'+klass+'" data-action="'+action+'" '+extra+'>'+text+'</button>'}
function kpi(title,value,delta,symbol,glow){return '<div class="kpi" style="--glow:'+glow+'"><div class="kpi-label">'+safe(title)+'<span class="kpi-symbol">'+symbol+'</span></div><div class="kpi-value">'+safe(value)+'</div><div class="positive">↗ '+safe(delta)+' · ejemplo</div></div>'}
function lines(){
 return '<div class="chart-box"><svg viewBox="0 0 600 220" role="img" aria-label="Gráfico ilustrativo de tendencia de redes sociales, sin datos reales"><defs><linearGradient id="fade" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#11d8f2" stop-opacity=".3"/><stop offset="1" stop-color="#11d8f2" stop-opacity="0"/></linearGradient></defs><path d="M2 40H599 M2 90H599 M2 140H599 M2 190H599" stroke="#354771" stroke-width="1"/><path d="M2 186 C55 178 60 103 115 121 S205 170 263 109 S356 62 412 98 S525 38 599 17 L599 218H2Z" fill="url(#fade)"/><path d="M2 186 C55 178 60 103 115 121 S205 170 263 109 S356 62 412 98 S525 38 599 17" fill="none" stroke="#1de7f7" stroke-width="4"/><path d="M2 198 C65 182 99 169 146 147 S247 92 305 117 S420 68 458 80 S555 27 599 53" fill="none" stroke="#ef4de6" stroke-width="4"/><path d="M2 206 C85 201 101 183 162 182 S265 140 320 150 S420 147 491 113 S548 125 599 93" fill="none" stroke="#b5fa36" stroke-width="3"/><circle cx="599" cy="17" r="6" fill="#1de7f7"/><circle cx="599" cy="53" r="6" fill="#ef4de6"/></svg></div><div class="chart-labels"><span>Semana 1</span><span>Semana 2</span><span>Semana 3</span><span>Semana 4</span></div><div class="legend"><span><i style="background:#1de7f7"></i>Instagram</span><span><i style="background:#ef4de6"></i>TikTok</span><span><i style="background:#b5fa36"></i>YouTube</span></div>';
}
function calendar(){
 const now=new Date(),yr=now.getFullYear(),month=now.getMonth(),first=new Date(yr,month,1),shift=(first.getDay()+6)%7,days=new Date(yr,month+1,0).getDate();
 let cells=['L','M','X','J','V','S','D'].map(d=>'<div class="weekday">'+d+'</div>');
 for(let i=0;i<shift;i++)cells.push('<div></div>');
 for(let day=1;day<=days;day++){
  const date=yr+'-'+String(month+1).padStart(2,'0')+'-'+String(day).padStart(2,'0');
  const has=state.posts.some(p=>p && typeof p==='object' && p.date===date);
  cells.push('<div class="'+(has?'event ':'')+(day===now.getDate()?'today':'')+'" title="'+(has?'Publicación de demostración':'')+'">'+day+'</div>');
 }
 return '<div class="card"><div class="card-head"><h2>📅 Calendario de contenidos</h2>'+btn('Programar','goto-crear','secondary small-btn')+'</div><p class="muted tiny" style="margin-bottom:10px">'+new Intl.DateTimeFormat('es',{month:'long',year:'numeric'}).format(now)+'</p><div class="calendar-days">'+cells.join('')+'</div></div>';
}
function postRow(p, managed=false){
 const actions=managed?'<div class="post-actions">'+
  '<button type="button" class="secondary small-btn" data-action="edit-post" data-id="'+safe(p.id)+'" aria-label="Editar '+safe(p.title)+'">Editar</button>'+
  '<button type="button" class="secondary small-btn" data-action="duplicate-post" data-id="'+safe(p.id)+'" aria-label="Duplicar '+safe(p.title)+'">Duplicar</button>'+
  '<button type="button" class="secondary small-btn" data-action="delete-post" data-id="'+safe(p.id)+'" aria-label="Eliminar '+safe(p.title)+'">Eliminar</button></div>':'';
 return '<div class="list-row post-list-row"><div class="post-main"><b>'+safe(p.title)+'</b><p>'+safe(p.platform)+' · '+safe(p.date)+'</p></div><div class="post-right"><span class="tag '+(p.status==='Programada'?'green':'')+'">'+safe(p.status)+'</span>'+actions+'</div></div>';
}
function postsFiltered(){
 const query=state.search.toLowerCase();
 return state.posts.filter(p=>p && typeof p==='object' && (String(p.title??'')+' '+String(p.platform??'')+' '+String(p.status??'')).toLowerCase().includes(query));
}
function adUnit(placement){
 if(state.plan==='pro')return '';
 return '<div class="ad-unit '+(placement==='desktop'?'desktop-only-ad':'mobile-ad')+'"><div class="eyebrow">Espacio publicitario · demo</div><strong>Publicidad en MarketHub FREE</strong><p>Zona reservada para anuncios autorizados. No hay publicidad real ni ingresos en este prototipo.</p>'+btn('Conoce PRO sin anuncios','goto-planes','secondary small-btn')+'</div>';
}
function rewardUnit(){
 return state.plan==='pro'?'':'<div class="reward"><div class="reward-icon">🎁</div><strong>'+state.credits+' créditos demo</strong><p class="muted tiny" style="margin:9px 0">Prueba la mecánica de recompensas. No se reproduce publicidad real.</p>'+btn('Simular anuncio +5 créditos','reward','primary full small-btn')+'</div>';
}
function home(){
 const filtered=postsFiltered();
 return sectionHeader('Tu centro de marketing ✨','Crea, planifica y crece desde un solo lugar.',btn('Crear publicación '+icon('arrow'),'goto-crear','primary'))+
 '<div class="catalogue-cta">'+btn('🧰 Explorar todas las herramientas','goto-herramientas','secondary')+btn('✦ Abrir oficina de marketing','goto-oficina','primary') +btn('🚀 Growth Lab','goto-laboratorio','secondary')+btn('🎨 Crear diseño PNG','goto-diseño','secondary')+'</div>'+
 '<div class="grid kpis">'+kpi('Alcance','2,84 M','34,7%','◉','#00dfee45')+kpi('Interacciones','328,4 K','28,1%','♡','#e13ade45')+kpi('Leads','56,7 K','41,2%','♧','#846bff45')+kpi('ROI','4,9×','62,3%','↗','#b5fa3645')+'</div>'+
 '<div class="dashboard-grid"><div class="section-stack"><div class="card"><div class="card-head"><h2>📈 Rendimiento de redes</h2><span class="tag">Últimos 30 días</span></div>'+lines()+'</div><div class="card"><div class="card-head"><h2>📚 Próximos contenidos</h2>'+btn('Ver todos','goto-crear','secondary small-btn')+'</div><div class="line-list">'+(filtered.length?filtered.slice(0,4).map(postRow).join(''):'<div class="empty">No hay publicaciones que coincidan.</div>')+'</div></div>'+adUnit('mobile')+'</div>'+
 '<div class="section-stack"><div class="card ai-card"><div class="card-head"><h2>✦ Copiloto de IA</h2><span class="tag pink">Vista previa</span></div><div class="ai-wave"></div><p class="muted">Ideas, textos y recomendaciones estratégicas en una sola experiencia.</p><div class="line-list" style="margin:15px 0">'+['5 ideas para la próxima semana','Reutilizar un vídeo en varios formatos','Planificar contenido para Instagram'].map(t=>'<div class="list-row"><b>✦ '+t+'</b></div>').join('')+'</div>'+btn('Abrir estudio creativo','goto-estudio','primary full')+'</div>'+calendar()+rewardUnit()+adUnit('desktop')+'</div></div>';
}
function toolsCatalogue(){
 const term=state.toolsQuery.trim().toLocaleLowerCase('es');
 const all=catalogueSections.flatMap(s=>s.tools);
 const sections=catalogueSections.map(section=>({...section,tools:section.tools.filter(tool=>(state.toolsFilter==='all'||tool.tier===state.toolsFilter)&&(!term||(tool.name+' '+section.name).toLocaleLowerCase('es').includes(term)))})).filter(s=>s.tools.length);
 const filterBar=[['all','Todas'],['free','FREE y PRO'],['pro','Avanzadas PRO']].map(([value,label])=>'<button class="secondary'+(state.toolsFilter===value?' selected':'')+'" aria-pressed="'+(state.toolsFilter===value)+'" data-filter="'+value+'">'+label+'</button>').join('');
 const modules=sections.map(section=>'<section class="card catalogue-section"><div class="card-head"><h2>'+section.icon+' '+safe(section.name)+'</h2><span class="tag">'+section.tools.length+'</span></div><div class="catalogue-grid">'+section.tools.map(tool=>'<button type="button" class="catalogue-tool" data-action="catalogue-tool" data-tool="'+safe(tool.id)+'"><span class="tool-badges"><span class="tag '+(tool.tier==='pro'?'pink':'green')+'">'+(tool.tier==='pro'?'PRO':'FREE + PRO')+'</span><span class="tiny muted">'+(tool.status==='local'?'Disponible local':tool.status==='demo'?'Vista demo':'Pendiente')+'</span></span><strong>'+safe(tool.name)+'</strong><span class="catalogue-more">Ver detalles ↗</span></button>').join('')+'</div></section>').join('');
 return sectionHeader('Centro de herramientas 🚀','Todo lo previsto para la suite, organizado por plan y estado real.',btn('Comparar planes','goto-planes','primary'))+
 '<div class="notice"><strong>Catálogo de producto, no de funciones activas.</strong> «Vista demo» significa interfaz visual o trabajo local, no integración comercial. El resto está pendiente. FREE dispondrá de muchas funciones con cuotas y anuncios; PRO será más completo y sin publicidad.</div>'+
 '<div class="catalogue-stats"><div><strong>'+all.length+'</strong><span>Herramientas planificadas</span></div><div><strong>'+all.filter(t=>t.tier==='free').length+'</strong><span>Previstas en FREE</span></div><div><strong>'+all.filter(t=>t.tier==='pro').length+'</strong><span>Avanzadas de PRO</span></div></div>'+
 '<div class="card catalogue-controls"><label class="eyebrow" for="toolSearch">Buscar herramientas</label><input class="input catalogue-search" id="toolSearch" placeholder="IA, vídeo, SEO, CRM, anuncios..." value="'+safe(state.toolsQuery)+'"><div class="catalogue-filters" role="group" aria-label="Filtrar herramientas">'+filterBar+'</div></div><div class="section-stack">'+(modules||'<div class="card empty">Sin coincidencias</div>')+'</div>';
}
function studio(){
 return sectionHeader('Estudio creativo IA ✨','Crea contenido visual, vídeo y campañas. Editor ilustrativo; sin generación IA conectada.',btn('Programar este diseño','goto-crear','secondary')+btn('🎨 Abrir diseñador PNG real','goto-diseño','primary'))+
 '<div class="studio-grid"><div class="card"><div class="card-head"><h2>Herramientas</h2></div><div class="tool-list studio-toolbox">'+['Video / Reels','Imagen','Diseño','Texto / Copy','Voz IA','Plantillas'].map(t=>'<button data-mode="'+safe(t)+'" aria-pressed="'+(state.creativeMode===t)+'">'+(t==='Video / Reels'?'▶ ':t==='Imagen'?'▧ ':'✦ ')+t+'</button>').join('')+'</div><div class="tip" style="margin-top:15px">Una misma campaña, múltiples formatos. La generación real será una integración posterior.</div></div>'+
 '<div class="card"><div class="card-head"><h2>🎬 Vista previa · '+safe(state.creativeMode)+'</h2><div>'+btn(state.videoFormat==='9:16'?'Horizontal 16:9':'Vertical 9:16','format','secondary small-btn')+'</div></div><div class="preview-wrap"><div class="video-preview '+(state.videoFormat==='16:9'?'horizontal':'')+'"><div class="preview-badge">'+safe(state.videoFormat)+' · DEMO</div><div class="video-play">'+icon('play')+'</div><div class="video-label">TU PRÓXIMO<br>GRAN LANZAMIENTO</div></div></div><div class="timeline"><div class="card-head"><h2>Línea de tiempo</h2><span class="tiny muted">00:00 / 00:28 · demo</span></div><div class="timeline-bar"></div><div class="audio-track"></div></div></div>'+
 '<div class="card studio-aside"><div class="card-head"><h2>✦ IA Creativa</h2><span class="tag pink">Prototipo</span></div><div class="form-field"><label for="creativePrompt">Describe tu contenido</label><textarea class="input" id="creativePrompt" placeholder="Ej.: Anuncio dinámico de un lanzamiento para Instagram..."></textarea></div>'+btn('Crear borrador con mi idea','draft-from-studio','primary full')+'<p class="tiny muted" style="margin-top:10px">Crea un borrador local a partir de tu texto. No envía datos ni llama a una IA.</p><div class="card-head" style="margin-top:24px"><h2>Opciones del estudio</h2></div><div class="studio-tools-grid">'+['Subtítulos IA','Voz en off','Recortar','Redimensionar','Estilos','Exportar'].map(t=>'<button data-action="studio-unavailable">'+t+'</button>').join('')+'</div></div></div>';
}
function create(){
 const editing=findPost(state.posts,state.editPostId);
 const status=editing?.status==='Borrador'?'Borrador':'Programada';
 const date=editing?.date||todayLocal();
 const platform=editing?.platform||'Instagram';
 const platforms=['Instagram','TikTok','YouTube','Facebook','LinkedIn','X'];
 const selected=platforms.map(name=>'<option '+(platform===name?'selected':'')+'>'+name+'</option>').join('');
 return sectionHeader('Crear y programar','Prepara, edita y organiza publicaciones en tu dispositivo. No se envían a las redes sociales.',
  btn('Exportar biblioteca CSV','export-posts','secondary'))+
 '<div class="notice"><strong>Planificador local.</strong> Una fecha asignada sirve para organizarte: esta versión no publica automáticamente en Instagram, TikTok ni otras redes.</div>'+
 '<div class="two-cols"><div class="card"><div class="card-head"><h2>✦ '+(editing?'Editar publicación':'Nueva publicación')+'</h2><span class="tag">Local · demo</span></div>'+
 '<form id="postForm"><div class="form-field"><label for="title">Título o texto</label><textarea class="input" id="title" name="title" required maxlength="240" placeholder="Escribe el contenido de tu publicación">'+safe(editing?.title||'')+'</textarea></div>'+
 '<div class="form-field"><label for="platform">Plataforma</label><select class="input" name="platform" id="platform">'+selected+'</select></div>'+
 '<div class="form-field"><label for="date">Fecha prevista</label><input class="input" type="date" name="date" id="date" required value="'+safe(date)+'"></div>'+
 '<div class="form-field"><label for="postStatus">Estado local</label><select class="input" id="postStatus" name="status"><option value="Borrador" '+(status==='Borrador'?'selected':'')+'>Borrador</option><option value="Programada" '+(status==='Programada'?'selected':'')+'>Planificada (sin publicación automática)</option></select></div>'+
 '<div class="platforms" style="margin:0 0 16px"><span class="tag">✓ Archivo local</span><span class="tag pink">Sin publicar</span></div>'+
 '<button type="submit" class="primary full">'+(editing?'Guardar cambios locales':'Guardar publicación local')+'</button>'+
 (editing?'<div class="post-actions" style="margin-top:12px">'+btn('Cancelar edición','cancel-edit','secondary full','type="button"')+'</div>':'')+
 '</form></div>'+
 '<div class="section-stack"><div class="card"><div class="card-head"><h2>Biblioteca local</h2><span class="tag">'+state.posts.filter(p=>p&&typeof p==='object').length+' / '+draftLimit(state.plan)+' borradores</span></div>'+
 '<div class="line-list">'+(postsFiltered().length?postsFiltered().map(p=>postRow(p,true)).join(''):'<div class="empty">No hay publicaciones.</div>')+'</div>'+
 '<p class="tiny muted" style="margin-top:14px">Puedes editar, duplicar y eliminar tus borradores. Exporta una copia CSV para trabajar fuera de MarketHub AI.</p></div>'+
 calendar()+'</div></div>';
}
function campaigns(){
 return sectionHeader('Campañas','Panel de preparación de campañas. Las cifras son ilustrativas.')+
 '<div class="grid kpis">'+kpi('Campañas','3','ejemplo','🚀','#e33fa045')+kpi('Presupuesto','3.250 €','ejemplo','€','#13d6e445')+kpi('Conversiones','2.310','ejemplo','◎','#b5fa3645')+kpi('ROI','5,8×','ejemplo','↗','#846bff45')+'</div>'+
 '<div class="two-cols"><div class="card"><div class="card-head"><h2>Campañas de ejemplo</h2><span class="demo-pill">Sin conexión publicitaria</span></div><div class="line-list">'+['Lanzamiento de producto','Reconocimiento de marca','Remarketing inteligente'].map((t,i)=>'<div class="list-row"><div><b>'+t+'</b><p>Campaña ficticia · '+(i===0?'Instagram / Facebook':'Multicanal')+'</p></div><span class="tag green">Ejemplo</span></div>').join('')+'</div></div><div class="card ai-card"><h2 style="margin-bottom:12px">✦ Optimizador de campañas</h2><p class="muted">La conexión con las APIs oficiales y el control presupuestario estarán disponibles en próximas fases.</p><div class="tip" style="margin-top:16px">No se han creado ni cobrado campañas reales.</div></div></div>';
}
function analytics(){
 return sectionHeader('Analítica avanzada','Panel visual de demostración. Los datos reales requerirán conectar cuentas autorizadas.')+
 '<div class="grid kpis">'+kpi('Audiencia','128.450','12,6%','👥','#1de7f745')+kpi('Visualizaciones','3,2 M','41,7%','▶','#f341c445')+kpi('Engagement','7,8%','2,1 pp','♡','#af8bff45')+kpi('Clics','84.220','18,4%','↗','#b5fa3645')+'</div><div class="two-cols"><div class="card"><div class="card-head"><h2>📊 Evolución por plataforma</h2><span class="tag">Gráfico de ejemplo</span></div>'+lines()+'</div><div class="card"><h2>Informe profesional</h2><p class="muted" style="margin:12px 0 20px">Conecta tus cuentas para consultar estadísticas reales. Los informes descargables se implementarán después.</p>'+btn('Ver planes disponibles','goto-planes','primary full')+'</div></div>';
}
function inbox(){
 return sectionHeader('Bandeja unificada','Vista simulada de conversaciones, sin acceso a mensajes privados.')+
 '<div class="two-cols"><div class="card"><div class="card-head"><h2>Mensajes de ejemplo</h2><span class="tag pink">Solo demo</span></div><div class="line-list">'+['Consulta sobre nuevos productos','Solicitud de colaboración','Pregunta sobre disponibilidad'].map((t,i)=>'<div class="list-row"><div><b>Contacto de prueba '+(i+1)+'</b><p>'+t+'</p></div><span class="tag">Demo</span></div>').join('')+'</div></div><div class="card ai-card"><h2>✦ Respuestas asistidas con IA</h2><p style="margin-top:15px;color:#b9c6e3">La bandeja real se conectará mediante permisos oficiales de cada red y controles de privacidad.</p><div class="notice" style="margin-top:18px">Ningún mensaje se envía desde este prototipo.</div></div></div>';
}
function plans(){
 const isPro=state.plan==='pro';
 return sectionHeader('MarketHub FREE & PRO','Una versión gratuita con anuncios y una experiencia PRO sin publicidad.')+
 '<div class="pricing"><div class="price-card"><div><span class="eyebrow">PLAN FREE</span><h2 style="font-size:28px;margin:8px 0">Empieza gratis</h2></div><div class="price">0 € <span class="muted" style="font-size:14px">/mes</span></div><p>Herramientas esenciales y publicidad integrada.</p><ul class="features"><li>Panel de control y calendario básicos</li><li>Crear y organizar borradores</li><li>Acceso limitado futuro a IA</li><li>Publicidad identificada en la app</li><li>Recompensas voluntarias (previstas)</li></ul>'+btn(isPro?'Cambiar a FREE (demo)':'Plan activo: FREE',isPro?'activate-free':'no-op',isPro?'secondary full':'secondary full',''+(!isPro?'disabled':''))+'</div>'+
 '<div class="price-card featured"><div><span class="eyebrow">✦ PLAN PRO · RECOMENDADO</span><h2 style="font-size:28px;margin:8px 0">Marketing sin límites visuales</h2></div><div class="price">29,90 € <span class="muted" style="font-size:14px">/mes</span></div><p>Precio propuesto con IVA. Cuotas de IA y uso razonable por definir.</p><ul class="features"><li>Sin anuncios, ni banners ni vídeos publicitarios</li><li>Estudio creativo profesional</li><li>Herramientas completas de marketing</li><li>Automatizaciones y analítica avanzada</li><li>Más créditos mensuales de IA</li></ul>'+btn(isPro?'Plan PRO activo (demo)':'Activar PRO (demo)',isPro?'no-op':'activate-pro','primary full',''+(isPro?'disabled':''))+'</div></div>'+
 '<div class="notice" style="margin-top:19px">Estos botones solo cambian la interfaz de demostración y no realizan ningún cobro. Antes de lanzar las suscripciones habrá que integrar Apple/Google y verificar pagos en servidor. La cifra de 29,90 € es provisional.</div>';
}
function settings(){
 return sectionHeader('Configuración','Personaliza la demostración de MarketHub AI.')+
 '<div class="two-cols"><div class="card"><div class="card-head"><h2>Cuenta y suscripción</h2></div><div class="switch-wrap"><div><b>Tu plan actual (demo)</b><p class="muted tiny">'+(state.plan==='pro'?'PRO · sin publicidad':'FREE · con publicidad')+'</p></div>'+btn('Ver planes','goto-planes','secondary small-btn')+'</div><div class="switch-wrap" style="margin-top:12px"><div><b>Créditos de ejemplo</b><p class="muted tiny">'+state.credits+' créditos guardados localmente</p></div><span class="tag">'+state.credits+'</span></div><div class="notice" style="margin-top:14px">Los datos se almacenan solo en este navegador. No hay cuenta, sincronización, publicidad real ni contratación activa.</div></div>'+
 '<div class="card"><div class="card-head"><h2>Privacidad y demostración</h2></div><p class="muted">No almacenamos información en un servidor. El prototipo no incluye rastreadores publicitarios ni cookies de terceros configuradas por nosotros.</p><div class="line-list" style="margin-top:18px">'+btn('Borrar borradores y preferencias locales','reset-data','secondary full')+btn('Más información sobre FREE y PRO','goto-planes','secondary full')+'</div></div></div>'+backupSettingsHTML();
}
function content(){
 switch(state.page){case 'estudio':return studio();case 'diseño':return visualPage();case 'crear':return create();case 'oficina':return officePage(state.plan)+adUnit('mobile')+adUnit('desktop');case 'laboratorio':return growthPage(state.plan)+adUnit('mobile')+adUnit('desktop');case 'herramientas':return toolsCatalogue();case 'campanas':return campaigns();case 'analitica':return analytics();case 'bandeja':return inbox();case 'planes':return plans();case 'ajustes':return settings();default:return home();}
}
function navButton(item,kind='side'){
 const cur=state.page===item[0];
 return '<button class="'+(kind==='side'?'nav-btn':'')+'" data-page="'+item[0]+'" aria-label="'+safe(item[1])+'" '+(cur?'aria-current="page"':'')+'>'+icon(item[2])+'<span>'+safe(item[1])+'</span></button>';
}
function mobileDrawer(){
 const links=nav.map(item=>'<button class="mobile-drawer-link" data-page="'+item[0]+'" '+(state.page===item[0]?'aria-current="page"':'')+'>'+icon(item[2])+'<span>'+safe(item[1])+'</span></button>').join('');
 return '<div class="mobile-menu-backdrop" data-action="close-mobile-menu"></div><section class="mobile-menu-drawer" role="dialog" aria-modal="true" aria-label="Todas las secciones"><div class="mobile-menu-head"><h2>Todas las herramientas</h2>'+btn('Cerrar','close-mobile-menu','secondary small-btn')+'</div><nav class="mobile-drawer-grid" aria-label="Todas las secciones">'+links+'</nav></section>';
}
function render(){
 const side=nav.map(n=>navButton(n)).join('');
 const quickIds=['inicio','estudio','diseño','crear','herramientas'];
 const mob=quickIds.map(id=>nav.find(n=>n[0]===id)).filter(Boolean).map(n=>navButton(n,'bottom')).join('')+'<button type="button" class="mobile-more-button" data-action="show-mobile-menu" aria-label="Abrir todas las herramientas" aria-expanded="'+state.menuMore+'">'+icon('plus')+'<span>Más</span></button>';
 app.innerHTML='<div class="app-shell"><aside class="sidebar"><div class="brand"><img src="./logo.svg" alt=""><span>MarketHub <em>AI</em></span></div><nav class="nav" aria-label="Navegación principal">'+side+'</nav><div class="sidebar-bottom"><div class="plan-widget"><span class="eyebrow">✦ TU PLAN '+state.plan.toUpperCase()+'</span><h3>'+ (state.plan==='free'?'Haz crecer tus ideas':'Sin anuncios, más enfoque')+'</h3><p>'+(state.plan==='free'?'Accede a las funciones PRO y elimina la publicidad.':'Experiencia PRO activada en la demostración.')+'</p><div style="margin-top:13px">'+btn('Ver suscripción '+icon('arrow'),'goto-planes','primary full')+'</div></div></div></aside>'+
 '<main id="main" class="workspace"><header class="topbar"><div class="brand"><img src="./logo.svg" alt=""><span>MarketHub <em>AI</em></span></div><input class="search" id="globalSearch" aria-label="Filtrar publicaciones" placeholder="Buscar publicaciones de demo..." value="'+safe(state.search)+'"><div class="topbar-right"><button class="plan-pill '+(state.plan==='pro'?'pro':'')+'" data-action="goto-planes">'+(state.plan==='pro'?'✦ PRO · SIN ANUNCIOS':'FREE · CON ANUNCIOS')+'</button><div class="avatar" aria-label="Perfil de demostración">MH</div></div></header>'+content()+'</main></div><nav class="mobile-bottom" aria-label="Navegación móvil">'+mob+'</nav>'+(state.modal?modalHTML():'')+(state.menuMore?mobileDrawer():'');
 if(state.page==='diseño')visualMount();
}
function modalHTML(){
 let head='',body='',foot='';
 if(state.modal==='upgrade'){head='Activar PRO (demostración)';body='Esto solo cambiará el aspecto de la aplicación para probarla sin anuncios. No es una suscripción ni se realizará un pago.';foot=btn('Cancelar','close-modal')+btn('Activar PRO demo','confirm-pro','primary')}
 if(state.modal==='reward'){head='Publicidad recompensada · simulación';body='Aquí se integrará en el futuro un anuncio real con recompensa opcional. En esta demostración puedes recibir 5 créditos ficticios sin visualizar anuncios.';foot=btn('Cancelar','close-modal')+btn('Recibir 5 créditos demo','confirm-reward','primary')}
 if(state.modal==='tools'){head='Función prevista para próximas versiones';body='Esta herramienta todavía no está operativa. La interfaz muestra dónde se incorporará, pero no simula una acción completada.';foot=btn('Entendido','close-modal','primary')}
 if(state.modal==='tool-detail'&&state.selectedTool){head=safe(state.selectedTool.name);body=(state.selectedTool.tier==='pro'?'Herramienta avanzada del plan PRO.':'Prevista en FREE y PRO, con distintos límites de uso.')+' Estado real: '+(state.selectedTool.status==='local'?'funciona localmente en el navegador':state.selectedTool.status==='demo'?'interfaz de demostración':'pendiente de integración')+'.'+(state.selectedTool.description?' '+safe(state.selectedTool.description):'');foot=btn('Cerrar','close-modal')+(state.selectedTool.localTab?btn('Abrir herramienta local','catalogue-open-local','primary'):'')+(state.selectedTool.growthTab?btn('Abrir Growth Lab','catalogue-open-growth','primary'):'')}
 if(state.modal==='reset'){head='Borrar datos locales';body='Se eliminarán los borradores de ejemplo y tu selección de plan de este navegador.';foot=btn('Cancelar','close-modal')+btn('Sí, borrar','confirm-reset','primary')}
 if(state.modal==='delete-post'){head='Eliminar borrador local';body='La publicación seleccionada desaparecerá de la biblioteca de este dispositivo. Puedes exportar una copia antes de eliminar.';foot=btn('Cancelar','close-modal')+btn('Eliminar publicación','confirm-delete-post','primary')}
 return '<div class="modal-backdrop" role="presentation"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle"><h2 id="modalTitle">'+head+'</h2><p>'+body+'</p><div class="modal-actions">'+foot+'</div></div></div>';
}
let toastTimer;
function toast(msg){
 document.querySelectorAll('.toast').forEach(e=>e.remove());
 const elem=document.createElement('div');elem.className='toast';elem.setAttribute('role','status');elem.textContent=msg;document.body.append(elem);
 clearTimeout(toastTimer);toastTimer=setTimeout(()=>elem.remove(),3300);
}
function go(page){state.page=page;state.modal=null;state.menuMore=false;state.search='';render();window.scrollTo({top:0,behavior:'auto'})}
document.addEventListener('click',e=>{
 const growthTarget=e.target.closest('[data-growth-action]');
 if(growthTarget&&growthClick(growthTarget,{refresh:render,toast,newPost:text=>{if(state.plan==='free'&&state.posts.length>=20){toast('Límite de borradores locales FREE demo.');return}state.posts.unshift({id:Date.now(),title:String(text).slice(0,240),platform:'Instagram',date:todayLocal(),status:'Borrador'});save();go('crear');toast('Texto enviado a borradores locales, sin publicar.')}}))return;
 const visualTarget=e.target.closest('[data-visual-action]');
 if(visualTarget&&visualClick(visualTarget,{refresh:render,toast,newPost:text=>{if(state.plan==='free'&&state.posts.length>=20){toast('Límite de 20 borradores en FREE demo.');return}state.posts.unshift({id:Date.now(),title:text.slice(0,240),platform:'Instagram',date:todayLocal(),status:'Borrador'});save();go('crear');toast('Texto añadido a borradores locales; exporta la imagen PNG por separado.')}}))return;
 const officeTarget=e.target.closest('[data-office-action]');
 if(officeTarget&&officeClick(officeTarget,{refresh:render,toast,newPost:text=>{if(state.plan==='free'&&state.posts.length>=20){toast('Límite de 20 borradores en FREE demo.');return}state.posts.unshift({id:Date.now(),title:text.slice(0,240),platform:'Instagram',date:todayLocal(),status:'Borrador'});save();go('crear');toast('Texto añadido a los borradores locales.')}}))return;
 const page=e.target.closest('[data-page]');
 if(page){go(page.dataset.page);return}
 const filter=e.target.closest('[data-filter]');if(filter){state.toolsFilter=filter.dataset.filter;render();return}
 const mode=e.target.closest('[data-mode]');
 if(mode){state.creativeMode=mode.dataset.mode;render();return}
 const target=e.target.closest('[data-action]');
 if(!target)return;
 const action=target.dataset.action;
 if(action.startsWith('goto-')){go(action.slice(5));return}
 switch(action){
 case 'catalogue-open-growth':{if(state.selectedTool?.growthTab){growthOpenTab(state.selectedTool.growthTab);go('laboratorio')}break}
 case 'catalogue-open-local':{
  if(state.selectedTool?.localTab){if(state.selectedTool.localTab==='diseño')go('diseño');else{officeOpenTab(state.selectedTool.localTab);go('oficina')}}break;
 }
 case 'catalogue-tool':{
 const tool=catalogueSections.flatMap(s=>s.tools).find(t=>t.id===target.dataset.tool);
 if(tool){state.selectedTool=tool;state.modal='tool-detail';render()}break;
 }
 case 'show-mobile-menu':state.menuMore=true;render();break;
 case 'close-mobile-menu':state.menuMore=false;render();break;
 case 'backup-export':backupExport({toast});break;
  case 'edit-post':{
   const post=findPost(state.posts,target.dataset.id);
   if(post){state.editPostId=post.id;go('crear');}break;
  }
  case 'cancel-edit':state.editPostId=null;render();break;
  case 'duplicate-post':{
   const post=findPost(state.posts,target.dataset.id);
   if(!post){toast('No se ha encontrado el borrador.');break}
   if(state.posts.length>=draftLimit(state.plan)){toast('Has alcanzado el límite local de borradores de tu plan de demostración.');break}
   const copy={...post,id:String(Date.now())+'-'+Math.random().toString(36).slice(2,9),title:String(post.title||'Sin título').slice(0,240),status:'Borrador'};
   state.posts.unshift(copy);save();render();toast('Copia creada como borrador local.');break;
  }
  case 'delete-post':state.pendingDeleteId=target.dataset.id;state.modal='delete-post';render();break;
  case 'confirm-delete-post':{
   const id=state.pendingDeleteId;
   if(id!=null&&findPost(state.posts,id)){
    state.posts=state.posts.filter(p=>!(p&&String(p.id)===String(id)));
    if(String(state.editPostId)===String(id))state.editPostId=null;
    save();toast('Publicación local eliminada.');
   }
   state.pendingDeleteId=null;state.modal=null;render();break;
  }
  case 'export-posts':{
   const blob=new Blob([postsToCSV(state.posts)],{type:'text/csv;charset=utf-8'});
   const url=URL.createObjectURL(blob),link=document.createElement('a');
   link.href=url;link.download='markethub-publicaciones-'+new Date().toISOString().slice(0,10)+'.csv';
   document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
   toast('Archivo CSV generado en este dispositivo.');break;
  }
 case 'format':state.videoFormat=state.videoFormat==='9:16'?'16:9':'9:16';render();break;
 case 'draft-from-studio':{
  const input=document.querySelector('#creativePrompt'),val=input?.value.trim();
  if(!val){toast('Escribe una idea antes de crear el borrador.');break}
  state.posts.unshift({id:Date.now(),title:val.slice(0,240),platform:'Instagram',date:todayLocal(),status:'Borrador'});
  save();go('crear');toast('Borrador de demostración guardado en el dispositivo.');break;
 }
 case 'studio-unavailable':state.modal='tools';render();break;
 case 'reward':state.modal='reward';render();break;
 case 'activate-pro':state.modal='upgrade';render();break;
 case 'confirm-pro':state.plan='pro';state.modal=null;save();render();toast('Modo PRO de demostración activo. Sin anuncios.');break;
 case 'activate-free':state.plan='free';save();render();toast('Modo FREE activo. Espacios de anuncios de demostración visibles.');break;
 case 'confirm-reward':state.credits+=5;state.modal=null;save();render();toast('+5 créditos ficticios. No se ha visto ningún anuncio.');break;
 case 'close-modal':state.modal=null;render();break;
 case 'reset-data':state.modal='reset';render();break;
 case 'confirm-reset':localStorage.removeItem(storeKey);state.plan='free';state.credits=20;state.posts=demoPosts.slice();state.editPostId=null;state.pendingDeleteId=null;state.modal=null;state.search='';render();toast('Se han restablecido los datos de ejemplo.');break;
 case 'no-op':break;
 }
});
document.addEventListener('submit',e=>{
 if(e.target.id?.startsWith('growth-')){e.preventDefault();growthSubmit(e.target,state.plan,{refresh:render,toast});return}
 if(e.target.id?.startsWith('office-')){e.preventDefault();officeSubmit(e.target,state.plan,{refresh:render,toast});return}
 if(e.target.id!=='postForm')return;
 e.preventDefault();const form=new FormData(e.target);
 const result=validatePost({title:form.get('title'),platform:form.get('platform'),date:form.get('date'),status:form.get('status')});
 if(result.error){toast(result.error);return}
 const editing=findPost(state.posts,state.editPostId);
 if(editing){Object.assign(editing,result.value)}
 else{
  if(state.posts.length>=draftLimit(state.plan)){toast('Límite local de '+draftLimit(state.plan)+' borradores alcanzado en el modo demo.');return}
  state.posts.unshift({id:String(Date.now())+'-'+Math.random().toString(36).slice(2,9),...result.value});
 }
 state.editPostId=null;
 save();render();toast(editing?'Publicación local actualizada.':'Borrador local guardado. No se ha publicado en ninguna red.');
});
document.addEventListener('change',e=>{if(e.target.matches('[data-backup-import]')){backupImport(e.target.files?.[0],{toast}).catch(err=>toast('No se pudo importar: '+String(err))).finally(()=>{e.target.value=''});return}if(e.target.closest('[data-visual-file]')){visualFile(e.target,{refresh:render,toast});return}if(e.target.closest('[data-visual-field]')){visualInput(e.target);return}if(e.target.closest('[data-office-change]'))officeChange(e.target,{refresh:render,toast})});
document.addEventListener('input',e=>{
 if(e.target.closest('[data-visual-field]')){visualInput(e.target);return}
 if(e.target.id==='toolSearch'){
  state.toolsQuery=e.target.value;const pos=e.target.selectionStart;render();const input=document.querySelector('#toolSearch');if(input){input.focus();input.setSelectionRange(pos,pos)}return;
 }
 if(e.target.id==='globalSearch'){
  const val=e.target.value;state.search=val;
  if(state.page==='inicio'||state.page==='crear'){const start=e.target.selectionStart;render();const input=document.querySelector('#globalSearch');if(input){input.focus();input.setSelectionRange(start,start)}}
 }
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(state.menuMore){state.menuMore=false;render()}else if(state.modal){state.modal=null;render()}}});
function splash(){
 const overlay=document.createElement('div');overlay.className='splash';overlay.setAttribute('role','status');
 overlay.innerHTML='<div class="splash-content"><div class="eyebrow">NEXUS × PULSE · INICIANDO</div><div class="splash-orb"><img alt="" src="./logo.svg"></div><h1>MarketHub <span>AI</span></h1><p class="muted">Tu centro de marketing digital inteligente</p><div class="progress-track"><div class="progress-fill" id="progressFill"></div></div><p id="progressLabel" class="muted tiny">Preparando experiencia visual...</p><button class="splash-skip" id="skipSplash">Entrar ahora</button><div class="splash-footer">© '+new Date().getFullYear()+' MarketHub AI · Prototipo v0.3</div></div>';
 document.body.append(overlay);
 let progress=0;const bar=overlay.querySelector('#progressFill'),label=overlay.querySelector('#progressLabel');
 const timer=setInterval(()=>{progress=Math.min(100,progress+10);bar.style.width=progress+'%';label.textContent='Cargando interfaz de demostración… '+progress+'%';if(progress===100)finish()},110);
 let closed=false;
 function finish(){if(closed)return;closed=true;clearInterval(timer);overlay.remove()}
 overlay.querySelector('#skipSplash').addEventListener('click',finish);
 if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)finish();
}
try {
  render();
  if (window.__MARKETHUB_BOOT__) window.__MARKETHUB_BOOT__.ready = true;
  splash();
} catch (error) {
  if (window.__MARKETHUB_BOOT__) window.__MARKETHUB_BOOT__.ready = false;
  document.querySelector('.splash')?.remove();
  if (typeof window.markethubBootFailed === 'function') window.markethubBootFailed(error);
  else throw error;
}

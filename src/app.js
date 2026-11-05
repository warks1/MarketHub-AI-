import { catalogueSections } from './catalogue.js';
import {officePage,officeClick,officeSubmit,officeChange,officeOpenTab} from './office.js';
import {growthPage,growthOpenTab,growthClick,growthSubmit} from './growth.js';
import {backupExport,backupEncryptedExport,backupImport,backupSettingsHTML} from './backup.js';
import {visualPage,visualMount,visualClick,visualInput,visualFile} from './visual.js';
import {draftLimit,findPost,validatePost,postsToCSV} from './post-manager.js';
import {nexusHome,nexusStudio} from './nexus-ui.js';
import {campaignManagerHTML,campaignLimit,validateCampaign,campaignById,campaignsToCSV} from './campaign-manager.js';
import {analyticsLocalHTML,analyticsCsvTemplate,parseAnalyticsCSV} from './analytics-local.js';
import {mirrorLayer} from './mirror-ui.js';
import {liveHome,liveInbox,liveListening} from './live-ui.js';
import {liveStudio,createScene,parseScene,STUDIO_THEMES} from './live-studio.js';
import {imageFileToSceneData,canStoreSceneImage} from './studio-scene-media.js';
import {exportEditorialICS} from './calendar-export.js';
import {downloadScenePNG} from './studio-scene-export.js';
import {renderStoryboardVideo,saveVideoDownload} from './studio-video-export.js';

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
  posts:Array.isArray(saved.posts)?saved.posts:demoPosts,campaigns:Array.isArray(saved.campaigns)?saved.campaigns:[],analyticsRows:Array.isArray(saved.analyticsRows)?saved.analyticsRows:[],localMessages:Array.isArray(saved.localMessages)?saved.localMessages:[],localMentions:Array.isArray(saved.localMentions)?saved.localMentions:[],storyboard:Array.isArray(saved.storyboard)?saved.storyboard:[{id:'demo-scene-1',title:'Nuevo lanzamiento',caption:'Presenta tu producto o servicio',duration:5,theme:'Neón'},{id:'demo-scene-2',title:'Contenido que convierte',caption:'Describe el valor de tu marca',duration:5,theme:'Violeta'}],modal:null,creativeMode:'Video / Reels',
  videoFormat:'9:16',search:'',menuMore:false,consent: saved.consent || 'pending'
};
state.toolsFilter='all';state.toolsQuery='';state.selectedTool=null;
state.editPostId=null;state.pendingDeleteId=null;
state.editCampaignId=null;state.pendingDeleteCampaignId=null;
state.calendarOffset=0;state.preselectedDate=null;
state.mirrorLive=true;state.mirrorMenu=false;
state.storyboardCurrent=0;
state.storyboardPlaying=false;
let storyboardTimer=null;
let activeVideoExport=null;
function stopStoryboardPlayback(){
 state.storyboardPlaying=false;
 if(storyboardTimer!=null){clearTimeout(storyboardTimer);storyboardTimer=null}
}
function scheduleStoryboardPlayback(){
 if(!state.storyboardPlaying||state.page!=='estudio')return;
 const current=state.storyboard[state.storyboardCurrent];
 if(!current){stopStoryboardPlayback();render();return}
 const duration=Math.min(60,Math.max(1,Number(current.duration)||5));
 storyboardTimer=setTimeout(()=>{
  storyboardTimer=null;
  if(!state.storyboardPlaying||state.page!=='estudio')return;
  if(state.storyboardCurrent<state.storyboard.length-1){
   state.storyboardCurrent++;render();scheduleStoryboardPlayback();
  }else{
   stopStoryboardPlayback();render();toast('Reproducción de storyboard terminada.');
  }
 },duration*1000);
}
state.storageError=false;
const save=()=>{
 try{
  localStorage.setItem(storeKey,JSON.stringify({plan:state.plan,credits:state.credits,posts:state.posts,campaigns:state.campaigns,analyticsRows:state.analyticsRows,localMessages:state.localMessages,localMentions:state.localMentions,storyboard:state.storyboard,consent:state.consent}));
  state.storageError=false;
  return true;
 }catch(error){
  state.storageError=true;
  toast('No se han guardado los cambios: almacenamiento lleno o bloqueado. Exporta una copia de seguridad.');
  return false;
 }
};
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
 ['inicio','Inicio','home'],['estudio','Estudio IA','sparkles'],['diseño','Diseño gráfico','sparkles'],['crear','Crear / Programar','plus'],
 ['campanas','Campañas','megaphone'],['analitica','Analítica','chart'],['escucha','Social Listening','bolt'],
 ['bandeja','Bandeja','inbox'],['competencia','Competencia','users'],['automatizaciones','Automatizaciones','gear'],
 ['biblioteca','Biblioteca','laptop'],['oficina','Oficina de marketing','users'],
 ['laboratorio','Growth Lab','chart'],['herramientas','Herramientas','bolt'],['planes','Suscripción','crown'],['ajustes','Ajustes','gear']
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
 // Boceto 01: panel funcional NEXUS × PULSE con datos de ejemplo claramente identificados.
 return nexusHome({posts:postsFiltered(),chart:lines(),plan:state.plan,calendarOffset:state.calendarOffset})+(state.plan==='free'?adUnit('mobile'):'');
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
 // Boceto 02: editor de demostración con acceso a herramientas locales reales.
 return nexusStudio({mode:state.creativeMode,format:state.videoFormat,posts:state.posts});
}
function create(){
 const editing=findPost(state.posts,state.editPostId);
 const status=editing?.status==='Borrador'?'Borrador':'Programada';
 const date=editing?.date||state.preselectedDate||todayLocal();
 const platform=editing?.platform||'Instagram';
 const platforms=['Instagram','TikTok','YouTube','Facebook','LinkedIn','X'];
 const selected=platforms.map(name=>'<option '+(platform===name?'selected':'')+'>'+name+'</option>').join('');
 return sectionHeader('Crear y programar','Prepara, edita y organiza publicaciones en tu dispositivo. No se envían a las redes sociales.',
  '<div class="workspace-actions">'+btn('Exportar biblioteca CSV','export-posts','secondary')+btn('Exportar calendario .ics','export-calendar','secondary')+'</div>')+
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
 '<div class="two-cols"><div class="card"><div class="card-head"><h2>Campañas de ejemplo</h2><span class="demo-pill">Sin conexión publicitaria</span></div><div class="line-list">'+['Lanzamiento de producto','Reconocimiento de marca','Remarketing inteligente'].map((t,i)=>'<div class="list-row"><div><b>'+t+'</b><p>Campaña ficticia · '+(i===0?'Instagram / Facebook':'Multicanal')+'</p></div><span class="tag green">Ejemplo</span></div>').join('')+'</div></div><div class="card ai-card"><h2 style="margin-bottom:12px">✦ Optimizador de campañas</h2><p class="muted">La conexión con las APIs oficiales y el control presupuestario estarán disponibles en próximas fases.</p><div class="tip" style="margin-top:16px">No se han creado ni cobrado campañas reales.</div></div></div>'+campaignManagerHTML({campaigns:state.campaigns,editingId:state.editCampaignId,plan:state.plan});
}
function analytics(){
 return sectionHeader('Analítica avanzada','Panel visual de demostración. Los datos reales requerirán conectar cuentas autorizadas.')+
 '<div class="grid kpis">'+kpi('Audiencia','128.450','12,6%','👥','#1de7f745')+kpi('Visualizaciones','3,2 M','41,7%','▶','#f341c445')+kpi('Engagement','7,8%','2,1 pp','♡','#af8bff45')+kpi('Clics','84.220','18,4%','↗','#b5fa3645')+'</div><div class="two-cols"><div class="card"><div class="card-head"><h2>📊 Evolución por plataforma</h2><span class="tag">Gráfico de ejemplo</span></div>'+lines()+'</div><div class="card"><h2>Informe profesional</h2><p class="muted" style="margin:12px 0 20px">Conecta tus cuentas para consultar estadísticas reales. Los informes descargables se implementarán después.</p>'+btn('Ver planes disponibles','goto-planes','primary full')+'</div></div>'+analyticsLocalHTML(state.analyticsRows);
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
function extraScreen(page){
 if(page==='biblioteca'){
  return sectionHeader('Biblioteca de contenidos','Tus publicaciones guardadas en este dispositivo. No se publican automáticamente.')+
  '<div class="card"><div class="card-head"><h2>Publicaciones locales</h2>'+btn('Crear una publicación','goto-crear','primary')+'</div>'+
  '<div class="line-list">'+(postsFiltered().length?postsFiltered().map(p=>postRow(p,true)).join(''):'<p class="muted">No hay borradores guardados.</p>')+'</div></div>';
 }
 const configs={
 escucha:['Social Listening','Escucha, tendencias y seguimiento de menciones',
 'Las conexiones a redes y el análisis de menciones reales están pendientes. Puedes preparar contenidos y análisis locales sin fingir estadísticas reales.','goto-laboratorio','Explorar Growth Lab'],
 competencia:['Análisis de competencia','Comparativas y oportunidades',
 'Para comparar marcas y cuentas reales necesitaremos fuentes autorizadas, permisos de las plataformas e indicadores comprobables.','goto-analitica','Abrir panel de analítica'],
 automatizaciones:['Automatizaciones','Flujos supervisados de marketing',
 'Las automatizaciones externas aún no están conectadas. Antes de ejecutar acciones reales se requerirán autorizaciones, límites, registros y confirmaciones.','goto-herramientas','Ver herramientas disponibles']
 };
 const c=configs[page];
 if(!c)return home();
 return sectionHeader(c[0],c[1])+ '<div class="card"><h2>✦ '+c[0]+'</h2><p class="muted" style="margin:12px 0 20px">'+c[2]+'</p>'+
 btn(c[4],c[3],'primary')+'</div>';
}
function content(){
 switch(state.page){
 case 'inicio':return liveHome({posts:postsFiltered(),campaigns:state.campaigns,analyticsRows:state.analyticsRows,messages:state.localMessages,mentions:state.localMentions,plan:state.plan,calendarOffset:state.calendarOffset})+adUnit('mobile')+adUnit('desktop');
 case 'estudio':return liveStudio({scenes:state.storyboard,current:state.storyboardCurrent,mode:state.creativeMode,format:state.videoFormat,posts:state.posts,playing:state.storyboardPlaying})+adUnit('mobile')+adUnit('desktop');
 case 'diseño':return visualPage();
 case 'crear':return create();
 case 'oficina':return officePage(state.plan)+adUnit('mobile')+adUnit('desktop');
 case 'laboratorio':return growthPage(state.plan)+adUnit('mobile')+adUnit('desktop');
 case 'herramientas':return toolsCatalogue();
 case 'campanas':return campaigns();
 case 'analitica':return analytics();
 case 'bandeja':return liveInbox({messages:state.localMessages});
 case 'escucha':return liveListening({mentions:state.localMentions});
 case 'planes':return plans();
 case 'ajustes':return settings();
 case 'biblioteca':case 'competencia':case 'automatizaciones':return extraScreen(state.page);
 default:return nexusHome({posts:postsFiltered(),chart:lines(),plan:state.plan,calendarOffset:state.calendarOffset});
 }
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
 const quickIds=['inicio','estudio','crear','bandeja'];
 const mobileLabels={'inicio':'Inicio','estudio':'Crear','crear':'Planificar','bandeja':'Bandeja'};
 const mob=quickIds.map(id=>nav.find(n=>n[0]===id)).filter(Boolean).map(n=>
  '<button type="button" data-page="'+n[0]+'" aria-label="'+mobileLabels[n[0]]+'" '+(state.page===n[0]?'aria-current="page"':'')+'>'+
  icon(n[2])+'<span>'+mobileLabels[n[0]]+'</span></button>').join('')+
  '<button type="button" class="mobile-more-button" data-action="show-mobile-menu" aria-label="Abrir todas las herramientas" aria-expanded="'+state.menuMore+'">'+icon('plus')+'<span>Más</span></button>';
 const featureNames=['Crea','Planifica','Publica','Analiza','Conversa','Escucha','Automatiza','Escala'];
 const brand='<img src="./logo.svg" alt=""><span>MarketHub <em>AI</em></span>';
 app.innerHTML='<div class="nexus-canvas">'+
 '<header class="nexus-masthead"><div class="nexus-brand-main"><img src="./logo.svg" alt="">MarketHub <em>AI</em></div>'+
 '<p>La plataforma todo-en-uno de marketing digital y redes sociales con IA</p>'+
 '<div class="nexus-features">'+featureNames.map(n=>'<span><b>✓</b> '+n+'</span>').join('')+'</div></header>'+
 '<div class="app-shell nexus-app"><aside class="sidebar"><div class="brand">'+brand+'</div>'+
 '<nav class="nav" aria-label="Navegación principal">'+side+'</nav>'+
 '<div class="sidebar-bottom"><div class="plan-widget"><span class="eyebrow">✦ TU PLAN '+state.plan.toUpperCase()+'</span>'+
 '<h3>Potencia tu marketing con IA</h3><p>'+(state.plan==='free'?'FREE: herramientas locales y espacios publicitarios de demostración.':'PRO de demostración, sin anuncios.')+'</p>'+
 '<div style="margin-top:12px">'+btn('Explorar herramientas →','goto-herramientas','primary full')+'</div></div></div></aside>'+
 '<main id="main" class="workspace"><header class="topbar nexus-topbar">'+
 '<div class="brand">'+brand+'</div>'+
 '<div class="nexus-header-context"><div class="nexus-context-chip"><span>▥</span><span>Espacio de trabajo<b>Marketing Global · demo</b></span></div>'+
 '<div class="nexus-context-chip"><span>✧</span><span>Proyecto<b>Lanzamiento Q1 · demo</b></span></div></div>'+
 '<input class="search" id="globalSearch" aria-label="Filtrar publicaciones" placeholder="Buscar publicaciones guardadas..." value="'+safe(state.search)+'">'+
 '<div class="topbar-right"><button type="button" class="nexus-bell" data-action="goto-bandeja" aria-label="Abrir bandeja">♧</button>'+
 '<button type="button" class="plan-pill '+(state.plan==='pro'?'pro':'')+'" data-action="goto-planes">'+(state.plan==='pro'?'✦ PRO · DEMO':'FREE · DEMO')+'</button>'+
 '<div class="avatar" aria-label="Perfil de demostración">MH</div></div></header>'+(state.storageError?'<div class="storage-warning" role="alert">Los cambios de esta sesión no se han guardado. El almacenamiento está lleno o bloqueado. Abre Ajustes y exporta la copia de seguridad antes de cerrar.</div>':'')+content()+'</main></div></div>'+
 '<nav class="mobile-bottom" aria-label="Navegación móvil">'+mob+'</nav>'+
 (state.modal?modalHTML():'')+(state.menuMore?mobileDrawer():'')+
 (!state.mirrorLive?mirrorLayer(state.page,{menu:state.mirrorMenu}):'');
 const mirrored=!state.mirrorLive&&['inicio','estudio'].includes(state.page);
 const underlying=app.querySelector('.nexus-canvas');
 if(underlying)underlying.inert=mirrored;
 const mobileNative=app.querySelector('.mobile-bottom');
 if(mobileNative)mobileNative.inert=mirrored;
 if(state.page==='diseño')visualMount();
}
function modalHTML(){
 let head='',body='',foot='';
 if(state.modal==='upgrade'){head='Activar PRO (demostración)';body='Esto solo cambiará el aspecto de la aplicación para probarla sin anuncios. No es una suscripción ni se realizará un pago.';foot=btn('Cancelar','close-modal')+btn('Activar PRO demo','confirm-pro','primary')}
 if(state.modal==='reward'){head='Publicidad recompensada · simulación';body='Aquí se integrará en el futuro un anuncio real con recompensa opcional. En esta demostración puedes recibir 5 créditos ficticios sin visualizar anuncios.';foot=btn('Cancelar','close-modal')+btn('Recibir 5 créditos demo','confirm-reward','primary')}
 if(state.modal==='tools'){head='Función prevista para próximas versiones';body='Esta herramienta todavía no está operativa. La interfaz muestra dónde se incorporará, pero no simula una acción completada.';foot=btn('Entendido','close-modal','primary')}
 if(state.modal==='tool-detail'&&state.selectedTool){head=safe(state.selectedTool.name);body=(state.selectedTool.tier==='pro'?'Herramienta avanzada del plan PRO.':'Prevista en FREE y PRO, con distintos límites de uso.')+' Estado real: '+(state.selectedTool.status==='local'?'funciona localmente en el navegador':state.selectedTool.status==='demo'?'interfaz de demostración':'pendiente de integración')+'.'+(state.selectedTool.description?' '+safe(state.selectedTool.description):'');foot=btn('Cerrar','close-modal')+(state.selectedTool.localTab?btn('Abrir herramienta local','catalogue-open-local','primary'):'')+(state.selectedTool.growthTab?btn('Abrir Growth Lab','catalogue-open-growth','primary'):'')}
 if(state.modal==='reset'){head='Borrar datos locales';body='Se eliminarán los borradores y campañas locales, y tu selección de plan de este navegador.';foot=btn('Cancelar','close-modal')+btn('Sí, borrar','confirm-reset','primary')}
 if(state.modal==='delete-post'){head='Eliminar borrador local';body='La publicación seleccionada desaparecerá de la biblioteca de este dispositivo. Puedes exportar una copia antes de eliminar.';foot=btn('Cancelar','close-modal')+btn('Eliminar publicación','confirm-delete-post','primary')}
 if(state.modal==='storyboard-delete'){head='Eliminar esta escena';body='Se borrará la escena seleccionada del storyboard local. Exporta una copia antes si deseas conservarla.';foot=btn('Cancelar','close-modal')+btn('Eliminar escena','confirm-storyboard-delete','primary')}
 if(state.modal==='delete-campaign'){head='Eliminar campaña local';body='Se borrará esta planificación del dispositivo. No afecta a anuncios reales: no hay cuentas conectadas.';foot=btn('Cancelar','close-modal')+btn('Eliminar campaña','confirm-delete-campaign','primary')}
 if(state.modal==='clear-analytics'){head='Eliminar métricas importadas';body='Se eliminarán las filas CSV guardadas localmente. No afecta a tus cuentas externas.';foot=btn('Cancelar','close-modal')+btn('Borrar métricas locales','confirm-clear-analytics','primary')}
 return '<div class="modal-backdrop" role="presentation"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle"><h2 id="modalTitle">'+head+'</h2><p>'+body+'</p><div class="modal-actions">'+foot+'</div></div></div>';
}
let toastTimer;
function toast(msg){
 document.querySelectorAll('.toast').forEach(e=>e.remove());
 const elem=document.createElement('div');elem.className='toast';elem.setAttribute('role','status');elem.textContent=msg;document.body.append(elem);
 clearTimeout(toastTimer);toastTimer=setTimeout(()=>elem.remove(),3300);
}
function go(page){if(activeVideoExport){activeVideoExport.abort();activeVideoExport=null;}stopStoryboardPlayback();if(page!=='crear')state.preselectedDate=null;state.page=page;state.modal=null;state.menuMore=false;state.mirrorMenu=false;state.mirrorLive=true;state.search='';render();window.scrollTo({top:0,behavior:'auto'})}
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
 if(mode){
  const choice=mode.dataset.mode;state.creativeMode=choice;
  if(choice==='Imagen'||choice==='Diseño'||choice==='Plantillas'){go('diseño');return}
  if(choice==='Texto / Copy'){officeOpenTab('copys');go('oficina');return}
  if(choice==='Ideas'){growthOpenTab('reutilizar');go('laboratorio');return}
  if(choice==='Voz IA'){state.modal='tools';render();return}
  render();return;
 }
 const target=e.target.closest('[data-action]');
 if(!target)return;
 const action=target.dataset.action;
 if(action.startsWith('goto-')){go(action.slice(5));return}
 if(state.storyboardPlaying && ['storyboard-add','storyboard-move-left','storyboard-move-right','storyboard-duplicate','storyboard-remove','confirm-storyboard-delete'].includes(action))stopStoryboardPlayback();
 switch(action){
 case 'catalogue-open-growth':{if(state.selectedTool?.growthTab){growthOpenTab(state.selectedTool.growthTab);go('laboratorio')}break}
 case 'catalogue-open-local':{
  if(state.selectedTool?.localTab){if(state.selectedTool.localTab==='diseño')go('diseño');else{officeOpenTab(state.selectedTool.localTab);go('oficina')}}break;
 }
 case 'catalogue-tool':{
 const tool=catalogueSections.flatMap(s=>s.tools).find(t=>t.id===target.dataset.tool);
 if(tool){state.selectedTool=tool;state.modal='tool-detail';render()}break;
 }
 case 'mirror-menu':state.mirrorMenu=true;render();break;
  case 'mirror-close-menu':state.mirrorMenu=false;render();break;
  case 'mirror-live':state.mirrorLive=true;state.mirrorMenu=false;render();break;
  case 'mirror-back':state.mirrorLive=false;render();break;
  case 'show-mobile-menu':state.menuMore=true;render();break;
 case 'close-mobile-menu':state.menuMore=false;render();break;
 case 'backup-export':backupExport({toast});break;
 case 'backup-encrypted-export':{
  const passwordField=document.querySelector('#backupPassword');
  const password=passwordField?.value||'';
  if(passwordField)passwordField.value='';
  backupEncryptedExport({toast,password}).catch(error=>toast('Error al proteger copia: '+String(error.message||error)));
  break;
 }
case 'calendar-prev':state.calendarOffset=Math.max(-12,state.calendarOffset-1);render();break;
case 'calendar-next':state.calendarOffset=Math.min(12,state.calendarOffset+1);render();break;
case 'calendar-day':{
 const date=target.dataset.date;
 if(/^\d{4}-\d{2}-\d{2}$/.test(date||'')){
  state.preselectedDate=date;state.editPostId=null;go('crear');
 }
 break;
}
case 'campaign-edit':{
 const campaign=campaignById(state.campaigns,target.dataset.id);
 if(campaign){state.editCampaignId=campaign.id;go('campanas')}break;
}
case 'campaign-cancel':state.editCampaignId=null;render();break;
case 'campaign-duplicate':{
 const campaign=campaignById(state.campaigns,target.dataset.id);
 if(!campaign){toast('Campaña no encontrada.');break}
 if(state.campaigns.length>=campaignLimit(state.plan)){toast('Límite local de campañas del plan demo.');break}
 state.campaigns.unshift({...campaign,id:String(Date.now())+'-'+Math.random().toString(36).slice(2,9),name:String(campaign.name).slice(0,110)+' copia',status:'Borrador'});
 save();render();toast('Campaña local duplicada.');break;
}
case 'campaign-delete':state.pendingDeleteCampaignId=target.dataset.id;state.modal='delete-campaign';render();break;
case 'confirm-delete-campaign':{
 const id=state.pendingDeleteCampaignId;
 if(id!=null&&campaignById(state.campaigns,id)){
  state.campaigns=state.campaigns.filter(c=>!(c&&String(c.id)===String(id)));
  if(String(state.editCampaignId)===String(id))state.editCampaignId=null;
  save();toast('Campaña local eliminada.');
 }
 state.pendingDeleteCampaignId=null;state.modal=null;render();break;
}
case 'analytics-template':{
 const blob=new Blob([analyticsCsvTemplate],{type:'text/csv;charset=utf-8'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='markethub-plantilla-analitica.csv';document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),900);toast('Plantilla CSV descargada.');break;
}
case 'analytics-clear':state.modal='clear-analytics';render();break;
case 'confirm-clear-analytics':state.analyticsRows=[];state.modal=null;save();render();toast('Métricas locales eliminadas.');break;
case 'campaign-export':{
 const blob=new Blob([campaignsToCSV(state.campaigns)],{type:'text/csv;charset=utf-8'});
 const url=URL.createObjectURL(blob),link=document.createElement('a');
 link.href=url;link.download='markethub-campanas-'+todayLocal()+'.csv';
 document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),900);
 toast('Campañas exportadas a CSV.');break;
}
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
  case 'export-calendar':{
  const result=exportEditorialICS(state.posts);
  if(result.error){toast(result.error);break}
  const blob=new Blob([result.content],{type:'text/calendar;charset=utf-8'});
  const url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download='markethub-calendario-editorial-'+todayLocal()+'.ics';
  document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  toast(result.count+' recordatorios de publicaciones exportados. No se han publicado anuncios.');
  break;
 }
 case 'export-posts':{
   const blob=new Blob([postsToCSV(state.posts)],{type:'text/csv;charset=utf-8'});
   const url=URL.createObjectURL(blob),link=document.createElement('a');
   link.href=url;link.download='markethub-publicaciones-'+new Date().toISOString().slice(0,10)+'.csv';
   document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
   toast('Archivo CSV generado en este dispositivo.');break;
  }
 case 'storyboard-clear-photo':{
  stopStoryboardPlayback();
  const current=state.storyboard[state.storyboardCurrent];
  if(current?.imageData){
   const old=current.imageData;delete current.imageData;
   if(!save()){current.imageData=old;toast('No se pudo guardar el cambio.');break}
   render();toast('Fotografía quitada de esta escena.');
  }
  break;
 }
 case 'storyboard-play':{
  if(state.storyboardPlaying){stopStoryboardPlayback();render();break}
  if(!state.storyboard.length){toast('Añade al menos una escena para reproducir.');break}
  stopStoryboardPlayback();state.storyboardCurrent=0;state.storyboardPlaying=true;
  render();scheduleStoryboardPlayback();break;
 }
 case 'storyboard-add':{
  if(state.storyboard.length>=80){toast('Máximo de 80 escenas por proyecto local.');break}
  state.storyboard.push(createScene('Escena '+(state.storyboard.length+1)));state.storyboardCurrent=state.storyboard.length-1;
  save();render();toast('Escena añadida.');break;
 }
 case 'storyboard-select':stopStoryboardPlayback();state.storyboardCurrent=Math.max(0,Math.min(state.storyboard.length-1,Number(target.dataset.index)||0));render();break;
 case 'storyboard-next':stopStoryboardPlayback();state.storyboardCurrent=Math.min(state.storyboard.length-1,state.storyboardCurrent+1);render();break;
 case 'storyboard-prev':stopStoryboardPlayback();state.storyboardCurrent=Math.max(0,state.storyboardCurrent-1);render();break;
 case 'storyboard-move-left':case 'storyboard-move-right':{
  const a=state.storyboardCurrent,b=a+(action==='storyboard-move-left'?-1:1);
  if(b<0||b>=state.storyboard.length){toast('La escena ya está en el extremo de la secuencia.');break}
  [state.storyboard[a],state.storyboard[b]]=[state.storyboard[b],state.storyboard[a]];
  state.storyboardCurrent=b;save();render();break;
 }
 case 'storyboard-duplicate':{
  const scene=state.storyboard[state.storyboardCurrent];
  if(!scene){toast('Añade una escena primero.');break}
  if(state.storyboard.length>=80){toast('Máximo de 80 escenas por proyecto.');break}
  state.storyboard.splice(state.storyboardCurrent+1,0,{...scene,id:Date.now()+'-'+Math.random().toString(36).slice(2,8),title:String(scene.title||'Escena').slice(0,78)+' copia'});
  state.storyboardCurrent++;save();render();toast('Escena duplicada.');break;
 }
 case 'storyboard-remove':{
  if(!state.storyboard.length){toast('No hay escenas que eliminar.');break}
  state.modal='storyboard-delete';render();break;
 }
 case 'confirm-storyboard-delete':{
  if(state.storyboard.length)state.storyboard.splice(state.storyboardCurrent,1);
  state.storyboardCurrent=Math.max(0,Math.min(state.storyboardCurrent,state.storyboard.length-1));
  state.modal=null;save();render();toast('Escena eliminada del proyecto local.');break;
 }
 case 'storyboard-export-video':{
  if(activeVideoExport){toast('Ya se está exportando el vídeo.');break}
  stopStoryboardPlayback();
  if(!state.storyboard.length){toast('Añade una escena antes de exportar vídeo.');break}
  const controller=new AbortController();
  activeVideoExport=controller;
  const sceneCopy=state.storyboard.map(x=>({...x}));
  const format=state.videoFormat;
  const button=target;
  const status=document.querySelector('#liveVideoExportStatus');
  const cancel=document.querySelector('[data-action="storyboard-video-cancel"]');
  if(status){status.hidden=false;status.textContent='Preparando escenas para grabar el vídeo…'}
  if(cancel)cancel.hidden=false;
  if(button)button.disabled=true;
  renderStoryboardVideo({
   scenes:sceneCopy,format,signal:controller.signal,
   onProgress:({phase,percent})=>{
    if(activeVideoExport!==controller)return;
    const label=document.querySelector('#liveVideoExportStatus');
    if(label){label.hidden=false;label.textContent=(phase==='preparando'?'Preparando escenas':'Grabando vídeo')+' · '+percent+'%'}
   }
  }).then(file=>{
    if(activeVideoExport===controller&&state.page==='estudio'){
     saveVideoDownload(file);
     toast('Vídeo local '+file.extension.toUpperCase()+' · '+file.width+'×'+file.height+' descargado.');
    }
  }).catch(error=>{
    if(error?.name!=='AbortError'&&activeVideoExport===controller)
     toast('Error al exportar vídeo: '+String(error?.message||error).slice(0,180));
  }).finally(()=>{
    if(activeVideoExport===controller){
     activeVideoExport=null;
     const label=document.querySelector('#liveVideoExportStatus');
     const cancelButton=document.querySelector('[data-action="storyboard-video-cancel"]');
     const exportButton=document.querySelector('[data-action="storyboard-export-video"]');
     if(label){label.hidden=true;label.textContent=''}
     if(cancelButton)cancelButton.hidden=true;
     if(exportButton)exportButton.disabled=false;
    }
  });
  break;
 }
 case 'storyboard-video-cancel':{
  if(activeVideoExport){activeVideoExport.abort();activeVideoExport=null;toast('Exportación de vídeo cancelada.')}
  const label=document.querySelector('#liveVideoExportStatus');
  if(label)label.hidden=true;
  const cancel=document.querySelector('[data-action="storyboard-video-cancel"]');
  if(cancel)cancel.hidden=true;
  const exportButton=document.querySelector('[data-action="storyboard-export-video"]');
  if(exportButton)exportButton.disabled=false;
  break;
 }
 case 'storyboard-export-png':{
  downloadScenePNG(state.storyboard[state.storyboardCurrent],state.videoFormat)
   .then(file=>toast('PNG '+file.width+'×'+file.height+' creado localmente.'))
   .catch(error=>toast('No se ha podido exportar la imagen: '+String(error.message||error)));
  break;
 }
 case 'storyboard-export':{
  const data={app:'MarketHub AI',format:state.videoFormat,kind:'Storyboard local (no vídeo exportado)',scenes:state.storyboard};
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'});
  const url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download='markethub-storyboard-'+todayLocal()+'.json';
  document.body.append(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Storyboard JSON exportado.');break;
 }
 case 'studio-focus-title':case 'studio-focus-duration':
  document.querySelector(action==='studio-focus-title'?'#live-scene-title':'#live-scene-duration')?.focus();break;
 case 'studio-theme':{
  const scene=state.storyboard[state.storyboardCurrent];
  if(scene){const i=STUDIO_THEMES.indexOf(scene.theme);scene.theme=STUDIO_THEMES[(i+1)%STUDIO_THEMES.length];save();render()}break;
 }
 case 'live-message-toggle':{
  const m=state.localMessages.find(m=>String(m.id)===String(target.dataset.id));
  if(m){m.status=m.status==='Resuelto'?'Pendiente':'Resuelto';save();render()}break;
 }
 case 'live-message-delete':{
  state.localMessages=state.localMessages.filter(m=>String(m.id)!==String(target.dataset.id));save();render();toast('Conversación local eliminada.');break;
 }
 case 'live-mention-delete':{
  state.localMentions=state.localMentions.filter(m=>String(m.id)!==String(target.dataset.id));save();render();toast('Mención local eliminada.');break;
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
 case 'confirm-reset':localStorage.removeItem(storeKey);state.plan='free';state.credits=20;state.posts=demoPosts.slice();state.campaigns=[];state.analyticsRows=[];state.localMessages=[];state.localMentions=[];state.storyboard=[createScene()];state.storyboardCurrent=0;state.editPostId=null;state.pendingDeleteId=null;state.editCampaignId=null;state.pendingDeleteCampaignId=null;state.modal=null;state.search='';render();toast('Se han restablecido los datos de ejemplo.');break;
 case 'no-op':break;
 }
});
document.addEventListener('submit',e=>{
 if(e.target.id?.startsWith('growth-')){e.preventDefault();growthSubmit(e.target,state.plan,{refresh:render,toast});return}
 if(e.target.id?.startsWith('office-')){e.preventDefault();officeSubmit(e.target,state.plan,{refresh:render,toast});return}
 if(e.target.id==='storyboardForm'){
  stopStoryboardPlayback();
  e.preventDefault();
  const current=state.storyboard[state.storyboardCurrent];
  if(!current){toast('Añade una escena primero.');return}
  const f=new FormData(e.target);
  const result=parseScene({title:f.get('title'),caption:f.get('caption'),duration:f.get('duration'),theme:f.get('theme')});
  if(result.error){toast(result.error);return}
  Object.assign(current,result.value);save();render();toast('Cambios de la escena guardados.');return;
 }
 if(e.target.id==='liveMessageForm'){
  e.preventDefault();
  const f=new FormData(e.target),contact=String(f.get('contact')||'').trim().slice(0,80),
  network=String(f.get('network')||'Otro').slice(0,30),body=String(f.get('body')||'').trim().slice(0,600);
  if(!contact||!body){toast('Completa el contacto y el mensaje.');return}
  if(state.localMessages.length>=200){toast('Límite local de 200 conversaciones.');return}
  state.localMessages.unshift({id:Date.now()+'-'+Math.random().toString(36).slice(2,8),contact,network,body,status:'Pendiente',date:todayLocal()});
  save();render();toast('Conversación guardada en este dispositivo.');return;
 }
 if(e.target.id==='liveMentionForm'){
  e.preventDefault();
  const f=new FormData(e.target),text=String(f.get('text')||'').trim().slice(0,140),
  sentiment=String(f.get('sentiment')||'Neutra'),source=String(f.get('source')||'').trim().slice(0,60);
  if(!text||!source){toast('Completa la mención y la fuente.');return}
  if(!['Positiva','Neutra','Negativa'].includes(sentiment)){toast('Sentimiento no válido.');return}
  if(state.localMentions.length>=500){toast('Límite local de 500 menciones.');return}
  state.localMentions.unshift({id:Date.now()+'-'+Math.random().toString(36).slice(2,8),text,source,sentiment,date:todayLocal()});
  save();render();toast('Mención guardada localmente.');return;
 }
 if(e.target.id==='campaignForm'){
 e.preventDefault();
 const form=new FormData(e.target);
 const validated=validateCampaign({
  name:form.get('name'),objective:form.get('objective'),channel:form.get('channel'),
  start:form.get('start'),end:form.get('end'),budget:form.get('budget'),status:form.get('status')
 });
 if(validated.error){toast(validated.error);return}
 const existing=campaignById(state.campaigns,state.editCampaignId);
 if(existing)Object.assign(existing,validated.value);
 else{
  if(state.campaigns.length>=campaignLimit(state.plan)){toast('Límite de '+campaignLimit(state.plan)+' campañas locales alcanzado en el modo demo.');return}
  state.campaigns.unshift({id:String(Date.now())+'-'+Math.random().toString(36).slice(2,9),...validated.value});
 }
 state.editCampaignId=null;save();render();
 toast(existing?'Campaña local actualizada.':'Campaña local guardada. No se han activado anuncios.');
 return;
}
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
 state.editPostId=null;state.preselectedDate=null;
 save();render();toast(editing?'Publicación local actualizada.':'Borrador local guardado. No se ha publicado en ninguna red.');
});
document.addEventListener('change',e=>{
 if(e.target.matches('[data-scene-image]')){
  const file=e.target.files?.[0];
  if(!file)return;
  const sceneId=state.storyboard[state.storyboardCurrent]?.id;
  if(sceneId==null){toast('Primero añade una escena.');return}
  stopStoryboardPlayback();
  imageFileToSceneData(file).then(data=>{
   const item=state.storyboard.find(x=>String(x.id)===String(sceneId));
   if(!item){toast('Esa escena ya no existe.');return}
   if(!canStoreSceneImage(state.storyboard,sceneId,data)){
    toast('El proyecto supera 1,35 MB de fotografías guardadas. Elimina fotos de otras escenas.');return;
   }
   const previous=item.imageData;item.imageData=data;
   if(!save()){item.imageData=previous;return}
   render();toast('Fotografía añadida a la escena y al PNG exportable.');
  }).catch(err=>toast('No se pudo importar la foto: '+String(err.message||err).slice(0,160)));
  return;
 }
 if(e.target.matches('[data-analytics-file]')){
  const file=e.target.files?.[0];
  if(!file)return;
  if(file.size>1500000){toast('El archivo CSV supera el límite de 1,5 MB.');e.target.value='';return}
  file.text().then(text=>{
   const rows=parseAnalyticsCSV(text);
   state.analyticsRows=rows;
   save();render();
   toast(rows.length+' filas importadas y resumidas localmente.');
  }).catch(err=>toast('Error en CSV: '+String(err.message||err).slice(0,150)));
  return;
 }
 if(e.target.matches('[data-backup-import]')){const field=document.querySelector('#backupPassword'),password=field?.value||'';if(field)field.value='';backupImport(e.target.files?.[0],{toast,password}).catch(err=>toast('No se pudo importar: '+String(err))).finally(()=>{e.target.value=''});return}if(e.target.closest('[data-visual-file]')){visualFile(e.target,{refresh:render,toast});return}if(e.target.closest('[data-visual-field]')){visualInput(e.target);return}if(e.target.closest('[data-office-change]'))officeChange(e.target,{refresh:render,toast})});
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
 const overlay=document.createElement('div');
 overlay.className='splash nexus-splash nexus-original-splash';
 overlay.setAttribute('role','status');
 overlay.setAttribute('aria-label','MarketHub AI iniciando');
 const original='./assets/boceto-04-carga-original.jpeg';
 // En formato panorámico se muestra la fotografía completa y SIN modificar.
 const desktop='<div class="nexus-original-splash-board">'+
  '<img src="'+original+'" width="1536" height="864" alt="Pantalla de carga 04 original de MarketHub AI" fetchpriority="high" draggable="false">'+
  '<div class="progress-track" aria-label="Progreso de inicialización">'+
   '<div class="progress-fill" id="progressFill"></div><span class="progress-value" id="progressPercent">0%</span></div>'+
  '<p id="progressLabel">Preparando paneles, campañas y analítica...</p>'+
  '<button type="button" class="splash-skip mirror-skip" id="skipSplash" aria-label="Entrar a MarketHub AI"></button>'+
 '</div>';
 // En móvil NO se aplica zoom de pantalla completa que corta el nombre.
 // Se muestran fragmentos sin retoque del MISMO archivo aprobado, manteniendo
 // centrada la esfera, el nombre, el progreso y el mensaje original.
 function segment(name,x,y,w,h){
  return '<div class="mirror-splash-fragment '+name+'" style="aspect-ratio:'+w+'/'+h+'">'+
   '<img src="'+original+'" width="1536" height="864" alt="" draggable="false" '+
   'style="width:'+(1536/w*100).toFixed(5)+'%;left:'+(-x/w*100).toFixed(5)+'%;top:'+(-y/h*100).toFixed(5)+'%">'+
   (name==='mirror-splash-progress'?
    '<div class="progress-track" aria-label="Progreso de inicialización"><div class="progress-fill" id="progressFill"></div>'+
    '<span class="progress-value" id="progressPercent">0%</span></div>':'')+
  '</div>';
 }
 const mobile='<div class="mirror-mobile-splash-shell">'+
  segment('mirror-splash-hero',410,0,716,405)+
  segment('mirror-splash-brand',410,400,716,151)+
  segment('mirror-splash-progress',315,556,910,95)+
  segment('mirror-splash-status',465,645,650,72)+
  '<div class="mirror-splash-disclaimer">© '+new Date().getFullYear()+' MarketHub AI · Todos los derechos reservados</div>'+
  '<button type="button" class="mirror-splash-touch" id="skipSplash" aria-label="Entrar a MarketHub AI">Entrar</button>'+
  '<span id="progressLabel" class="mirror-sr-only">Preparando paneles, campañas y analítica...</span>'+
 '</div>';
 const portrait=window.matchMedia?.('(max-width:860px) and (orientation:portrait)')?.matches;
 overlay.innerHTML=portrait?mobile:desktop;
 document.body.append(overlay);
 let progress=0,closed=false,timer;
 const bar=overlay.querySelector('#progressFill');
 const value=overlay.querySelector('#progressPercent');
 const current=overlay.querySelector('#skipSplash');
 function finish(){if(closed)return;closed=true;if(timer!=null)clearInterval(timer);overlay.remove()}
 current.addEventListener('click',finish);
 if(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches){finish();return}
 timer=setInterval(()=>{
  progress=Math.min(100,progress+8);
  bar.style.width=progress+'%';
  value.textContent=progress+'%';
  if(progress===100)finish();
 },105);
}
try {
  render();
  if (window.__MARKETHUB_BOOT__) window.__MARKETHUB_BOOT__.ready = true;
  splash();
  // PWA instalable en HTTPS (Windows, Mac y navegadores); Capacitor conserva su propia capa nativa.
  if (typeof navigator!=='undefined' && 'serviceWorker' in navigator && location.protocol==='https:' && location.hostname!=='localhost' && !window.Capacitor?.isNativePlatform?.()) {
    navigator.serviceWorker.register('./sw.js',{scope:'./'}).catch(()=>{});
  }
} catch (error) {
  if (window.__MARKETHUB_BOOT__) window.__MARKETHUB_BOOT__.ready = false;
  document.querySelector('.splash')?.remove();
  if (typeof window.markethubBootFailed === 'function') window.markethubBootFailed(error);
  else throw error;
}

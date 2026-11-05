// MarketHub AI · Pantallas NEXUS × PULSE según bocetos elegidos (01 principal / 02 estudio / 03 móvil).
// Los datos y acciones externas no conectados están marcados expresamente como demostración.
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const action=(name,label,css='nexus-link')=>'<button type="button" class="'+css+'" data-action="'+name+'">'+label+'</button>';
const card=(title,body,more='',cls='')=>'<section class="nexus-panel '+cls+'"><div class="nexus-panel-title"><strong>'+title+'</strong>'+more+'</div>'+body+'</section>';
const spark='<svg viewBox="0 0 150 28" preserveAspectRatio="none" aria-hidden="true"><path d="M0 21 Q12 21 22 12 T50 15 T78 10 T108 19 T150 5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>';
function kpi(icon,label,value,change,hue){
 return '<div class="nexus-kpi '+hue+'"><div class="nexus-kpi-head"><span class="nexus-metric-icon">'+icon+'</span><span>'+label+'</span></div><strong>'+value+'</strong><span class="nexus-kpi-rise">▲ '+change+'</span><div class="nexus-spark">'+spark+'</div><span class="nexus-demo-mini">Ejemplo</span></div>';
}
function postItem(p){
 const title=esc(p?.title??'Sin título');
 const name=esc(p?.platform??'Instagram');
 const when=esc(p?.date??'');
 const status=p?.status==='Borrador'?'Borrador':'Planificada';
 return '<div class="nexus-post-item"><div class="nexus-post-thumb" aria-hidden="true">✦</div><div class="nexus-post-details"><b>'+title+'</b><small>'+name+' · '+when+'</small></div><span class="nexus-post-status">'+status+'</span></div>';
}
function monthCalendar(posts){
 const today=new Date();
 const yr=today.getFullYear(), month=today.getMonth();
 const first=(new Date(yr,month,1).getDay()+6)%7;
 const last=new Date(yr,month+1,0).getDate();
 const marked=new Set(posts.filter(p=>p&&typeof p==='object').map(p=>p.date));
 let cells=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(t=>'<span class="nexus-weekday">'+t+'</span>').join('');
 for(let n=0;n<first;n++)cells+='<span class="nexus-empty"></span>';
 for(let day=1;day<=last;day++){
  const iso=[yr,String(month+1).padStart(2,'0'),String(day).padStart(2,'0')].join('-');
  const classes=['nexus-day',day===today.getDate()?'active':'',marked.has(iso)?'marked':''].join(' ');
  cells+='<span class="'+classes+'" title="'+(marked.has(iso)?'Contenido guardado':'')+'">'+day+'</span>';
 }
 return '<div class="nexus-cal-month">'+new Intl.DateTimeFormat('es-ES',{month:'long',year:'numeric'}).format(today)+'</div><div class="nexus-calendar-grid">'+cells+'</div>';
}
function platform(name,symbol){
 return '<div class="nexus-platform"><span class="nexus-platform-symbol">'+symbol+'</span><b>'+name+'</b><small>Sin conectar</small></div>';
}
function assistant(){
 const rows=[
  ['◎','Optimizar contenido y campañas','goto-laboratorio'],
  ['✧','Crear ideas para la próxima semana','goto-estudio'],
  ['▤','Revisar el calendario editorial','goto-crear'],
  ['⚙','Explorar las automatizaciones','goto-herramientas']
 ];
 return card('✦ Asistente IA <small class="nexus-tag">DEMO</small>',
 '<p class="nexus-muted">Tu copiloto estratégico de marketing</p><div class="nexus-waveform" aria-hidden="true"></div>'+
 '<small class="nexus-label">Acciones sugeridas</small><div class="nexus-assistant-list">'+rows.map(([i,t,go])=>action(go,'<span>'+i+'</span>'+t+' <b>›</b>','nexus-assistant-action')).join('')+'</div>'+
 action('goto-herramientas','Explorar herramientas IA ✦','nexus-cta'),
 '', 'nexus-assistant');
}
function performance(chart){
 return card('▥ Rendimiento por plataforma <small class="nexus-tag">DATOS DEMO</small>',chart+
 '<div class="nexus-platform-legend"><span>● Instagram</span><span>● TikTok</span><span>● YouTube</span><span>● LinkedIn</span><span>● Facebook</span></div>',
 action('goto-analitica','Ver analítica ↗'),'nexus-performance');
}
function latest(posts){
 return card('▤ Próximos contenidos',
 '<div class="nexus-posts">'+(posts.length?posts.slice(0,3).map(postItem).join(''):'<p class="nexus-muted">Todavía no hay borradores.</p>')+'</div>',
 action('goto-crear','Ver todos ↗'),'nexus-latest');
}
function campaigns(){
 return card('◎ Rendimiento de campañas <small class="nexus-tag">EJEMPLO</small>',
 '<div class="nexus-campaign-feature"><span class="nexus-campaign-art">🚀</span><div><strong>Lanzamiento Q1</strong><small>Campaña ilustrativa · sin gasto real</small></div><span class="nexus-soft-chip">DEMO</span></div>'+
 '<div class="nexus-campaign-metrics"><div><small>Gasto</small><b>3.250 €</b></div><div><small>Leads</small><b>8.420</b></div><div><small>ROI</small><b>5,8×</b></div></div>'+
 '<div class="nexus-mini-row">Remarketing PRO <span>Vista de ejemplo</span></div><div class="nexus-mini-row">Contenido Always On <span>Vista de ejemplo</span></div>',
 action('goto-campanas','Ver campañas ↗'),'nexus-campaigns');
}
function listening(){
 return card('◉ Social Listening <small class="nexus-tag">EJEMPLO</small>',
 '<div class="nexus-listen-stats"><div><strong>12,4 K</strong><small>Menciones ficticias</small><span>▲ +29,7%</span></div><div class="nexus-donut"><strong>87%</strong><small>positivas</small></div></div>'+
 '<small class="nexus-label">Temas ilustrativos</small>'+
 ['#LanzamientoQ1','#MarketHubAI','#MarketingConIA'].map((t,i)=>'<div class="nexus-mini-row">'+t+' <span>+'+(185-i*61)+'%</span></div>').join(''),
 action('goto-laboratorio','Ver herramientas ↗'),'nexus-listening');
}
function inbox(){
 return card('▣ Bandeja unificada <small class="nexus-tag">SIN CONECTAR</small>',
 '<div class="nexus-inbox-metrics">'+[['8','Mensajes'],['3','Correos'],['1','Comentarios'],['0','Menciones']].map(([n,t])=>'<div><strong>'+n+'</strong><small>'+t+' · demo</small></div>').join('')+'</div>',
 action('goto-bandeja','Ver bandeja ↗'),'nexus-inbox');
}
function connections(){
 return card('♧ Plataformas conectadas',
 '<div class="nexus-platforms">'+[
 platform('Instagram','◎'),platform('TikTok','♪'),platform('YouTube','▶'),
 platform('LinkedIn','in'),platform('Facebook','f'),platform('X','𝕏'),platform('WhatsApp','◉')
 ].join('')+'</div><p class="nexus-muted nexus-footnote">Las conexiones reales requieren autorización oficial de cada red.</p>',
 action('goto-ajustes','Gestionar ↗'),'nexus-connections');
}
export function nexusHome({posts=[],chart='',plan='free'}={}){
 const valid=posts.filter(p=>p&&typeof p==='object');
 return '<div class="nexus-home">'+
 '<div class="nexus-page-head"><div><span class="nexus-eyebrow">PANEL PRINCIPAL · NEXUS × PULSE</span><h1>¡Hola! 👋</h1><p>Así va tu marketing hoy. Tu ecosistema en un solo lugar.</p></div><div class="nexus-period">▦ Últimos 30 días <span>· datos demo</span></div></div>'+
 '<div class="nexus-kpi-grid">'+[
 kpi('♧','Alcance','2,84 M','34,7%','cyan'),
 kpi('♡','Interacciones','328,4 K','28,1%','pink'),
 kpi('♙','Leads','56,7 K','41,2%','blue'),
 kpi('▽','Conversiones','14,9 K','37,6%','violet'),
 kpi('◫','ROI','4,9×','62,3%','lime'),
 kpi('▥','Crecimiento','+42,8%','10,9 pp','green')
 ].join('')+'</div>'+
 '<div class="nexus-main-grid">'+performance(chart)+
 card('▦ Calendario de contenidos',monthCalendar(valid)+
 '<div class="nexus-calendar-next"><small>Próximas publicaciones · locales</small>'+
 (valid.length?valid.slice(0,2).map(postItem).join(''):'<p>No hay publicaciones guardadas.</p>')+'</div>',
 action('goto-crear','Ver calendario ↗'),'nexus-calendar')+
 assistant()+'</div>'+
 '<div class="nexus-lower-grid">'+latest(valid)+campaigns()+listening()+'</div>'+
 '<div class="nexus-bottom-grid">'+inbox()+connections()+'</div>'+
 '<div class="nexus-foot-strip"><span>✦ MarketHub AI · NEXUS + PULSE</span><span>Plan '+(plan==='pro'?'PRO (demostración, sin anuncios)':'FREE (espacios publicitarios demo)')+'</span>'+
 action('goto-planes',plan==='pro'?'Ver suscripción':'Actualizar a PRO ↗','nexus-cta')+'</div>'+
 '</div>';
}
function previewSvg(){
 return '<svg class="nexus-product-art" viewBox="0 0 620 365" role="img" aria-label="Ilustración de demostración de un producto para una campaña">' +
 '<defs><linearGradient id="serumBg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#050d40"/><stop offset=".48" stop-color="#491467"/><stop offset="1" stop-color="#075a81"/></linearGradient><linearGradient id="serumGlass"><stop stop-color="#aa3eff"/><stop offset=".45" stop-color="#30125b"/><stop offset=".8" stop-color="#da81ff"/><stop offset="1" stop-color="#21134f"/></linearGradient><linearGradient id="serumLiquid"><stop stop-color="#6619a5"/><stop offset=".5" stop-color="#c833e7"/><stop offset="1" stop-color="#181272"/></linearGradient></defs>'+
 '<rect width="620" height="365" rx="18" fill="url(#serumBg)"/>'+
 '<path d="M-40 290Q120 10 340 140T650 20" fill="none" stroke="#f32dff" stroke-width="8" opacity=".7"/><path d="M-30 310Q120 30 340 120T680 5" fill="none" stroke="#18eaff" stroke-width="5" opacity=".85"/>'+
 '<g transform="translate(304 31) rotate(20 65 150)"><rect x="67" y="0" width="80" height="75" rx="10" fill="#42176e" stroke="#b46eff" stroke-width="9"/><rect x="40" y="58" width="135" height="250" rx="27" fill="url(#serumGlass)" stroke="#f39aff" stroke-width="5"/><rect x="53" y="96" width="109" height="188" rx="12" fill="url(#serumLiquid)"/><text x="108" y="153" text-anchor="middle" font-size="15" fill="#fff" font-weight="700">SÉRUM</text><text x="108" y="180" text-anchor="middle" font-size="12" fill="#fff">Renovador+</text><text x="108" y="207" text-anchor="middle" font-size="10" fill="#eee7ff">Hialurónico</text><path d="M59 80Q115 67 153 80" stroke="#fff" opacity=".5" fill="none"/></g>'+
 '<text x="30" y="61" font-size="26" font-weight="900" fill="#fff">NUEVO</text><text x="30" y="94" font-size="26" font-weight="900" fill="#fff">LANZAMIENTO</text>'+
 '<g fill="#39c5b1"><path d="M220 314Q160 260 75 288Q125 347 220 314Z"/><path d="M224 315Q202 229 152 207Q168 293 224 315Z"/></g>'+
 '<circle cx="310" cy="193" r="35" fill="#081237b8" stroke="#fff" stroke-width="2"/><path d="M300 176L328 193L300 210Z" fill="#fff"/>'+
 '<text x="30" y="350" font-size="12" fill="#e9e7ff">VISTA DEMO · SIN VÍDEO GENERADO</text></svg>';
}
const toolButton=(label)=>'<button type="button" data-action="studio-unavailable" class="nexus-studio-tool">'+label+' <span>›</span></button>';
function timeline(){
 return '<div class="nexus-timeline"><div class="nexus-timeline-header"><strong>▶ Línea de tiempo · ejemplo visual</strong><small>00:00 / 00:28</small></div>'+
 '<div class="nexus-timeline-scroller"><div class="nexus-timeline-ruler">0:00　 　　 0:05　　 　 0:10　　 　 0:15　 　 0:20　　 0:28</div>'+
 '<div class="nexus-timeline-track"><b>🎞 Vídeo</b><div class="nexus-clip c1">Nuevo lanzamiento</div><div class="nexus-clip c2">Hidratación</div><div class="nexus-clip c3">Beneficios</div><div class="nexus-clip c4">Descubre más</div></div>'+
 '<div class="nexus-timeline-track"><b>≡ Audio</b><div class="nexus-audio-wave"></div></div>'+
 '<div class="nexus-timeline-track"><b>CC Texto</b><div class="nexus-sub-track"></div></div></div></div>';
}
export function nexusStudio({mode='Video / Reels',format='9:16',posts=[]}={}){
 const kinds=['Video / Reels','Imagen','Diseño','Texto / Copy','Voz IA','Ideas','Plantillas'];
 const editor=['✂ Recortar','T Texto','♫ Música','▤ Transiciones','✧ Efectos','◌ Filtros','▣ Subtítulos IA','♩ Voz en off'];
 const ai=['Generar guion','Crear copies','Clips automáticos','Subtítulos con IA','Redimensionar','Voz en off realista','Generar imagen','Eliminar silencios'];
 return '<div class="nexus-studio">'+
 '<div class="nexus-page-head"><div><span class="nexus-eyebrow">ESTUDIO CREATIVO · BOCETO 02</span><h1>▣ Estudio creativo</h1><p>Crea, edita y organiza contenido para tus campañas. <span class="nexus-muted">Vista conceptual; edición de vídeo e IA todavía no conectadas.</span></p></div>'+
 action('goto-diseño','Abrir diseñador PNG ↗','nexus-cta')+'</div>'+
 '<div class="nexus-studio-body">'+
 '<section class="nexus-panel nexus-studio-categories"><div class="nexus-panel-title"><strong>Crear contenido</strong></div>'+
 kinds.map(t=>'<button type="button" class="nexus-studio-choice '+(mode===t?'active':'')+'" data-mode="'+esc(t)+'">'+(t==='Video / Reels'?'▷':t==='Imagen'?'▧':'✦')+' '+esc(t)+'</button>').join('')+'</section>'+
 '<section class="nexus-panel nexus-studio-editor"><div class="nexus-panel-title"><strong>Herramientas de edición</strong></div>'+
 editor.map(toolButton).join('')+'</section>'+
 '<section class="nexus-panel nexus-studio-preview"><div class="nexus-preview-tools"><span>Formato: '+esc(format)+'</span>'+
 action('format',format==='9:16'?'Cambiar a 16:9 ↔':'Cambiar a 9:16 ↕','nexus-quiet')+
 '<span>1080 × 1920 · DEMO</span></div><div class="nexus-preview-screen">'+previewSvg()+'</div>'+
 '<div class="nexus-preview-transport"><span>▶</span><span>0:00 / 0:28</span><div class="nexus-seek"><i></i></div><span>1.0×</span><span>CC</span></div></section>'+
 '<section class="nexus-panel nexus-studio-ai"><div class="nexus-panel-title"><strong>✦ IA Creativa</strong><span class="nexus-tag">PREVISTA</span></div>'+
 '<div class="nexus-ai-tool-list">'+ai.map(toolButton).join('')+'</div></section>'+
 '<section class="nexus-panel nexus-studio-recommend"><div class="nexus-panel-title"><strong>◎ Recomendaciones IA</strong><span class="nexus-tag">EJEMPLO</span></div>'+
 '<div class="nexus-score"><span>94/100</span><small>Score ilustrativo</small></div>'+
 ['✓ Hook de inicio','✓ Duración recomendada: 24–30 s','✓ Formato vertical 9:16','✓ Palabras de impacto','✓ CTA claro para convertir'].map(t=>'<div class="nexus-recommend-line">'+t+'</div>').join('')+
 action('goto-laboratorio','Herramientas de optimización ✧','nexus-cta')+'</section>'+
 '</div>'+
 '<div class="nexus-prompt-row"><div class="nexus-prompt-group"><label for="creativePrompt">✦ Tu idea para un contenido</label><textarea id="creativePrompt" class="input" placeholder="Describe la idea para tu próxima publicación..."></textarea></div>'+
 '<div class="nexus-prompt-actions">'+action('draft-from-studio','Guardar borrador local','nexus-cta')+
 action('goto-diseño','Diseñar imagen PNG','nexus-quiet')+'</div></div>'+
 timeline()+
 '<div class="nexus-studio-stats">'+
 card('▥ Rendimiento estimado','<strong>+68,4%</strong><p>Valor ilustrativo; no es una predicción real.</p>','','nexus-smallstat')+
 card('▦ Publicaciones guardadas','<strong>'+posts.filter(p=>p&&typeof p==='object').length+'</strong><p>Biblioteca local</p>',action('goto-crear','Abrir ↗'),'nexus-smallstat')+
 card('✧ Campañas activas','<strong>3</strong><p>Ejemplos, sin inversión real</p>','','nexus-smallstat')+
 card('♧ Plataformas destino','<p>Instagram · TikTok · YouTube · LinkedIn · Facebook</p><small>Sin conectar</small>','','nexus-smallstat')+'</div>'+
 '<div class="nexus-templates"><strong>▧ Plantillas destacadas</strong><div>'+
 ['▶ Reel promocional','▣ Tutorial','✦ Testimonio','% Oferta flash'].map(t=>action('goto-diseño',t+' ↗','nexus-template')).join('')+'</div></div>'+
 '</div>';
}

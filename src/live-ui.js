// MarketHub AI · paneles reales, sin fotografías sobre los controles.
import {summarizeAnalytics} from './analytics-local.js';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clean=xs=>Array.isArray(xs)?xs.filter(x=>x&&typeof x==='object'):[];
const fmt=x=>new Intl.NumberFormat('es-ES',{maximumFractionDigits:1}).format(x||0);
const money=x=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(x||0);
const page=(label,id,cls='live-link')=>'<button type="button" class="'+cls+'" data-page="'+id+'">'+label+'</button>';
const action=(label,id,cls='live-link',props='')=>'<button type="button" class="'+cls+'" data-action="'+id+'" '+props+'>'+label+'</button>';
const panel=(title,more,content,cls='')=>'<section class="live-panel '+cls+'"><div class="live-panel-heading"><h2>'+title+'</h2>'+(more||'')+'</div>'+content+'</section>';
const dateKey=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
const displayDate=s=>/^\d{4}-\d\d-\d\d$/.test(String(s))?new Intl.DateTimeFormat('es-ES',{day:'numeric',month:'short'}).format(new Date(s+'T12:00:00')):(s?esc(s):'Sin fecha');
function stat(name,value,hint,ico,tint,route){
 return '<button type="button" class="live-stat '+tint+'" data-page="'+route+'" aria-label="'+name+': '+value+'">'+
 '<span><i>'+ico+'</i>'+name+'</span><strong>'+value+'</strong><small>'+hint+'</small><b class="live-stat-light"></b></button>';
}
function post(p,i){
 return '<div class="live-row"><span class="live-thumb '+(i%2?'pink':'cyan')+'">✦</span><div><strong>'+esc(p.title||'Sin título')+'</strong>'+
 '<small>'+esc(p.platform||'')+' · '+displayDate(p.date)+'</small></div><span class="live-state">'+esc(p.status||'Borrador')+'</span>'+
 action('✎','edit-post','live-pencil','data-id="'+esc(p.id)+'" aria-label="Editar publicación"')+'</div>';
}
function campaign(c,i){
 return '<div class="live-row"><span class="live-thumb '+(i%2?'pink':'lime')+'">◎</span><div><strong>'+esc(c.name||'Sin título')+'</strong>'+
 '<small>'+esc(c.channel||'')+' · '+esc(c.objective||'')+'</small></div><span class="live-state">'+esc(c.status||'Borrador')+'</span>'+
 action('✎','campaign-edit','live-pencil','data-id="'+esc(c.id)+'" aria-label="Editar campaña"')+'</div>';
}
function calendar(posts,offset){
 const now=new Date(),d=new Date(now.getFullYear(),now.getMonth()+Math.max(-12,Math.min(12,Number(offset)||0)),1);
 const start=(d.getDay()+6)%7,last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();
 const marked=new Set(posts.map(p=>p.date));
 let cells=['L','M','X','J','V','S','D'].map(n=>'<span class="live-weekday">'+n+'</span>').join('');
 for(let n=0;n<start;n++)cells+='<span></span>';
 for(let day=1;day<=last;day++){
  const key=dateKey(new Date(d.getFullYear(),d.getMonth(),day)),has=marked.has(key);
  cells+='<button type="button" class="live-day'+(key===dateKey(now)?' today':'')+(has?' has-post':'')+
   '" data-action="calendar-day" data-date="'+key+'" aria-label="Crear publicación para '+key+'">'+day+(has?'<i></i>':'')+'</button>';
 }
 return '<div class="live-month">'+action('‹','calendar-prev','live-arrow','aria-label="Mes anterior"')+
 '<strong>'+esc(new Intl.DateTimeFormat('es-ES',{month:'long',year:'numeric'}).format(d))+'</strong>'+
 action('›','calendar-next','live-arrow','aria-label="Mes siguiente"')+'</div><div class="live-calendar">'+cells+'</div>';
}
function graph(rows){
 const data=clean(rows),dates=[...new Set(data.map(r=>r.fecha).filter(Boolean))].sort().slice(-15);
 if(!dates.length)return '<div class="live-blank-graph"><svg viewBox="0 0 600 180" role="img" aria-label="Gráfico ilustrativo de redes sin datos reales">'+
 '<path d="M0 30H600 M0 75H600 M0 120H600 M0 165H600" stroke="#415682" fill="none"/>'+
 '<path d="M0 151C55 142 80 116 140 124S238 48 303 70S403 108 473 46S552 31 600 17" fill="none" stroke="#17eaff" opacity=".93" stroke-width="3"/>'+
 '<path d="M0 165C63 155 92 91 162 104S248 124 318 69S420 56 488 65S562 28 600 25" fill="none" stroke="#f044ed" opacity=".9" stroke-width="3"/>'+
 '<path d="M0 170C61 160 101 149 170 141S259 123 314 115S405 122 474 84S554 93 600 66" fill="none" stroke="#baff42" opacity=".9" stroke-width="3"/>'+
 '<path d="M0 175C75 170 100 167 172 153S261 154 321 147S414 122 474 136S563 104 600 102" fill="none" stroke="#9261ff" opacity=".87" stroke-width="2.5"/>'+
 '<path d="M0 166C63 157 101 156 166 141S262 126 324 132S411 98 480 112S553 79 600 81" fill="none" stroke="#fa467b" opacity=".82" stroke-width="2.5"/></svg>'+
 '<p>Vista de ejemplo · Importa un CSV para activar tu gráfica de rendimiento.</p>'+page('Importar métricas','analitica','live-primary')+'</div>';
 const networks=['Instagram','TikTok','YouTube','Facebook','LinkedIn','X'],cols=['#f044ed','#11ecf7','#ff3b63','#69d5ff','#aaff49','#b269ff'];
 const max=Math.max(1,...data.map(r=>Number(r.alcance)||0));
 const plots=networks.map((network,k)=>{
  const values=dates.map(date=>data.filter(r=>r.fecha===date&&r.plataforma===network).reduce((sum,r)=>sum+(Number(r.alcance)||0),0));
  if(!values.some(Boolean))return '';
  const path=values.map((v,i)=>(i?'L':'M')+(i*570/Math.max(1,dates.length-1)+15).toFixed(1)+','+(164-v/max*140).toFixed(1)).join(' ');
  return '<path d="'+path+'" fill="none" stroke="'+cols[k]+'" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>';
 }).join('');
 return '<svg class="live-graph" viewBox="0 0 600 180" preserveAspectRatio="none" role="img" aria-label="Alcance por plataforma, datos importados">'+
 '<path d="M0 30H600 M0 75H600 M0 120H600 M0 165H600" stroke="#415682" fill="none"/>'+plots+'</svg>'+
 '<div class="live-graph-labels"><span>'+esc(dates[0])+'</span><span>'+esc(dates[dates.length-1])+'</span></div>'+
 '<div class="live-graph-key">'+networks.map((n,i)=>data.some(r=>r.plataforma===n)?'<span style="--bullet:'+cols[i]+'">● '+n+'</span>':'').join('')+'</div>';
}
export function liveHome({posts=[],campaigns=[],analyticsRows=[],messages=[],mentions=[],calendarOffset=0,plan='free'}={}){
 const p=clean(posts),c=clean(campaigns),a=clean(analyticsRows),m=clean(messages),mentionsArr=clean(mentions),t=summarizeAnalytics(a);
 const next=[...p].sort((x,y)=>String(x.date||'9999-12-31').localeCompare(String(y.date||'9999-12-31'))).slice(0,4);
 const metrics=[
  stat('Alcance',a.length?fmt(t.alcance):'—',a.length?'Datos importados':'Sin datos de redes','◉','cyan','analitica'),
  stat('Interacciones',a.length?fmt(t.interacciones):'—',a.length?'Datos importados':'Sin datos de redes','♡','pink','analitica'),
  stat('Leads','—','Sin cuenta conectada','♙','cyan','analitica'),
  stat('Publicaciones',fmt(p.length),'Biblioteca local','▤','violet','crear'),
  stat('ROI','—','Sin datos de gasto','◎','lime','campanas'),
  stat('Campañas',fmt(c.length),'Presupuesto '+money(c.reduce((s,x)=>s+(Number(x.budget)||0),0)),'▥','green','campanas')
 ].join('');
 const assistant=[
  ['✦','Crear contenido para la semana','crear'],['◎','Revisar campañas y presupuestos','campanas'],
  ['▥',a.length?'Consultar resultados reales':'Importar analítica de redes','analitica'],
  ['▣','Abrir el diseñador gráfico','diseño']
 ].map(([ic,label,route])=>page('<span>'+ic+'</span>'+label+' <b>›</b>',route,'live-tip')).join('');
 const pPanel=panel('▥ Rendimiento por plataforma',page('Ver informes','analitica'),graph(a),'live-performance');
 const cPanel=panel('▦ Calendario de contenidos',page('Programar','crear'),calendar(p,calendarOffset)+
 '<div class="live-calendar-next"><strong>Publicaciones previstas</strong>'+
 (next.length?next.slice(0,2).map(post).join(''):'<p>Aún no hay publicaciones.</p>')+'</div>','live-calendar-panel');
 const iaPanel=panel('✦ Asistente de marketing <small>LOCAL</small>','',
 '<div class="live-aurora" aria-hidden="true"></div><div class="live-tips">'+assistant+'</div>'+
 page('Explorar herramientas de IA','herramientas','live-primary'),'live-assistant');
 const upcoming=panel('▤ Próximos contenidos',page('Ver todos','biblioteca'),
 next.length?next.map(post).join(''):'<p class="live-empty">Todavía no hay publicaciones.</p>'+page('Crear publicación','crear','live-primary'),'live-post-panel');
 const campPanel=panel('◎ Campañas planificadas',page('Gestionar','campanas'),
 c.length?c.slice(0,3).map(campaign).join(''):'<p class="live-empty">Prepara tu primera campaña.</p>'+page('Nueva campaña','campanas','live-primary'),'live-campaign-panel');
 const listenPanel=panel('◉ Social Listening',page('Abrir escucha','escucha'),
 '<div class="live-mention-count"><strong>'+mentionsArr.length+'</strong><span>Menciones registradas manualmente</span></div>'+
 '<div class="live-mention-bar"><i style="width:'+Math.min(100,mentionsArr.length*9)+'%"></i></div>'+
 '<p class="live-empty">Las redes todavía no están conectadas.</p>','live-listening');
 const inboxPanel=panel('▣ Bandeja unificada',page('Abrir bandeja','bandeja'),
 '<div class="live-inbox-summary"><div><strong>'+m.filter(x=>x.status!=='Resuelto').length+'</strong><small>Pendientes</small></div>'+
 '<div><strong>'+m.length+'</strong><small>Guardadas</small></div><div><strong>0</strong><small>Cuentas conectadas</small></div></div>','live-inbox');
 const networks=[['Instagram','◎'],['TikTok','♪'],['YouTube','▶'],['LinkedIn','in'],['Facebook','f'],['X','𝕏'],['WhatsApp','◉']];
 const platformPanel=panel('♧ Plataformas',page('Gestionar','ajustes'),
 '<div class="live-platforms">'+networks.map(([n,ic])=>'<div><span>'+ic+'</span><b>'+n+'</b><small>Sin conectar</small></div>').join('')+'</div>','live-platform-panel');
 return '<div class="live-home"><div class="live-heading"><div><span class="live-eyebrow">PANEL PRINCIPAL · NEXUS + PULSE</span>'+
 '<h1>¡Hola! 👋</h1><p>Organiza tu marketing con datos reales cuando los importas.</p></div>'+
 '<div class="live-period">▦ Datos locales · '+(a.length?a.length+' registros':'Sin conexión')+'</div></div>'+
 '<div class="live-metrics">'+metrics+'</div><div class="live-top-grid">'+pPanel+cPanel+iaPanel+'</div>'+
 '<div class="live-mid-grid">'+upcoming+campPanel+listenPanel+'</div>'+
 '<div class="live-bottom-grid">'+inboxPanel+platformPanel+'</div>'+
 '<div class="live-notice">Los datos se guardan en este dispositivo. No hay cuentas publicitarias ni redes conectadas. '+
 (plan==='free'?page('FREE · Ver PRO','planes','live-outline'): 'PRO de demostración · Sin anuncios')+'</div></div>';
}
export function liveInbox({messages=[]}={}){
 const m=clean(messages);
 return '<div class="live-submodule"><div class="live-heading"><div><span class="live-eyebrow">BANDEJA UNIFICADA · LOCAL</span><h1>▣ Bandeja de trabajo</h1>'+
 '<p>Organiza conversaciones manualmente; las redes no están conectadas.</p></div></div><div class="live-subgrid">'+
 panel('Nueva conversación','',
 '<form id="liveMessageForm" class="live-form"><label for="lmsg-contact">Contacto</label><input class="input" id="lmsg-contact" name="contact" maxlength="80" required>'+
 '<label for="lmsg-channel">Origen</label><select class="input" id="lmsg-channel" name="network">'+['Instagram','TikTok','Correo','Facebook','Otro'].map(x=>'<option>'+x+'</option>').join('')+'</select>'+
 '<label for="lmsg-text">Mensaje o nota</label><textarea class="input" id="lmsg-text" name="body" maxlength="600" rows="4" required></textarea>'+
 '<button class="live-primary" type="submit">Guardar conversación</button></form>')+
 panel('Conversaciones <small>'+m.length+'</small>','',
 m.length?m.map(x=>'<div class="live-message"><div><strong>'+esc(x.contact)+'</strong><small>'+esc(x.network)+' · '+esc(x.status||'Pendiente')+'</small><p>'+esc(x.body)+'</p></div>'+
 action(x.status==='Resuelto'?'Reabrir':'Resolver','live-message-toggle','live-outline','data-id="'+esc(x.id)+'"')+
 action('Eliminar','live-message-delete','live-outline','data-id="'+esc(x.id)+'"')+'</div>').join(''):'<p class="live-empty">Todavía no hay conversaciones locales.</p>')+'</div></div>';
}
export function liveListening({mentions=[]}={}){
 const rows=clean(mentions);
 return '<div class="live-submodule"><div class="live-heading"><div><span class="live-eyebrow">SOCIAL LISTENING · LOCAL</span><h1>◉ Escucha social</h1>'+
 '<p>Registra menciones manualmente hasta conectar fuentes oficiales.</p></div></div><div class="live-subgrid">'+
 panel('Registrar mención','',
 '<form id="liveMentionForm" class="live-form"><label for="lmention-text">Mención</label><input class="input" name="text" id="lmention-text" maxlength="140" required>'+
 '<label for="lmention-tone">Sentimiento observado</label><select class="input" name="sentiment" id="lmention-tone">'+['Positiva','Neutra','Negativa'].map(x=>'<option>'+x+'</option>').join('')+'</select>'+
 '<label for="lmention-source">Fuente</label><input class="input" name="source" id="lmention-source" maxlength="60" required>'+
 '<button type="submit" class="live-primary">Guardar mención</button></form>')+
 panel('Registro <small>'+rows.length+'</small>','',rows.length?rows.map(x=>'<div class="live-message"><div><strong>'+esc(x.text)+'</strong>'+
 '<small>'+esc(x.sentiment)+' · '+esc(x.source)+'</small></div>'+
 action('Eliminar','live-mention-delete','live-outline','data-id="'+esc(x.id)+'"')+'</div>').join(''):'<p class="live-empty">Sin menciones registradas.</p>')+'</div></div>';
}

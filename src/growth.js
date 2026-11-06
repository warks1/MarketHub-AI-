// MarketHub AI — Growth Lab v0.3
// Herramientas 100 % locales, sin IA externa, publicación ni envío de campañas.
import {buildPulsePlan,pulsePlanCSV,pulsePlanICS} from './pulse-campaign.js';
const STORE = 'markethub-growth-local-v1';
const initial=()=>({
 briefs:[], utms:[], seo:null, email:{subject:'',preheader:'',message:'',cta:'Descubre más',url:'https://example.com'},
 bio:{name:'',description:'',links:[]},repurpose:[],pulsePlan:null
});
const validStoredPlan=p=>p&&typeof p==='object'&&!Array.isArray(p)&&
 typeof p.name==='string'&&p.name.length<=100&&
 Array.isArray(p.items)&&p.items.length===7&&p.items.every(it=>
 it&&typeof it==='object'&&!Array.isArray(it)&&typeof it.title==='string'&&it.title.length<=240&&
 typeof it.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(it.date)&&
 typeof it.platform==='string'&&it.platform.length<=40&&
 typeof it.phase==='string'&&it.phase.length<=100&&
 typeof it.format==='string'&&it.format.length<=100&&typeof it.check==='string'&&it.check.length<=240);
let data=initial();
try{
 const raw=JSON.parse(localStorage.getItem(STORE)||'null');
 if(raw&&typeof raw==='object'&&!Array.isArray(raw)){
  const base=initial();
  data={...base,briefs:Array.isArray(raw.briefs)?raw.briefs.slice(0,250):[],utms:Array.isArray(raw.utms)?raw.utms.slice(0,300):[],
   seo:raw.seo&&typeof raw.seo==='object'?raw.seo:null,
   email:raw.email&&typeof raw.email==='object'?{...base.email,...raw.email}:base.email,
   bio:raw.bio&&typeof raw.bio==='object'?{...base.bio,...raw.bio}:base.bio,
   repurpose:Array.isArray(raw.repurpose)?raw.repurpose.slice(0,5):[],
   pulsePlan:validStoredPlan(raw.pulsePlan)?raw.pulsePlan:null};
 }
}catch{}
let active='campanas';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cut=(value,max)=>String(value??'').trim().slice(0,max);
const save=()=>{try{localStorage.setItem(STORE,JSON.stringify(data));return true}catch{return false}};
const https=value=>{
 try{const u=new URL(String(value).trim());if(u.protocol==='https:'&&!u.username&&!u.password)return u.href}catch{}
 return null;
};
const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
const newId=()=>new Date().getTime().toString(36)+'-'+Math.random().toString(36).slice(2,8);
const fmtMoney=v=>{const n=Number(v);return new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR'}).format(Number.isFinite(n)?n:0)};
function card(title,body){return '<div class="card"><div class="card-head"><h2>'+title+'</h2></div>'+body+'</div>'}
function textField(label,id,value='',attrs=''){return '<div class="form-field"><label for="'+id+'">'+label+'</label><input class="input" id="'+id+'" name="'+id+'" value="'+esc(value)+'" '+attrs+'></div>'}
function areaField(label,id,value='',attrs=''){return '<div class="form-field"><label for="'+id+'">'+label+'</label><textarea class="input" id="'+id+'" name="'+id+'" '+attrs+'>'+esc(value)+'</textarea></div>'}
function selectField(label,id,opts){return '<div class="form-field"><label for="'+id+'">'+label+'</label><select class="input" id="'+id+'" name="'+id+'">'+opts.map(x=>'<option>'+esc(x)+'</option>').join('')+'</select></div>'}
function button(label,action,extra=''){return '<button type="button" class="secondary small-btn" data-growth-action="'+action+'" '+extra+'>'+label+'</button>'}
function chips(items){return items.map(i=>'<span class="tag">'+esc(i)+'</span>').join(' ')}
const sections=[
 ['campanas','Briefs de campaña','🎯'],['utm','Enlaces UTM','🔗'],['seo','SEO para redes','🔎'],
 ['emails','Editor de email','✉️'],['reutilizar','Reutilizar contenido','♻️'],['bio','Link en bio','🌐']
];
function header(){
 return '<div class="page-head"><div><span class="eyebrow">MARKETHUB AI · GROWTH LAB v0.3</span><h1>Laboratorio de crecimiento 🚀</h1><p>Herramientas de marketing utilizables sin conectar ninguna red social.</p></div><span class="demo-pill">100 % local</span></div>'+
 '<div class="notice" style="margin-bottom:13px">Herramientas locales y manuales: <strong>sin generación de IA, sin campañas enviadas, sin analítica externa ni publicación real.</strong> No guardes datos personales de clientes ni información confidencial. FREE tiene límites de prueba; PRO aquí es un modo de demostración.</div>';
}
function pulsePlanPanel(){
 const p=data.pulsePlan;
 if(!p||!Array.isArray(p.items)||p.items.length!==7)return '';
 const rows=p.items.map((post,i)=>
  '<article class="growth-pulse-day"><div class="growth-pulse-day-head"><span class="tag">'+esc(post.date)+'</span>'+
  '<strong>Día '+(i+1)+' · '+esc(post.phase)+'</strong><small>'+esc(post.platform)+' · '+esc(post.format)+'</small></div>'+
  '<p>'+esc(post.angle)+'</p><label for="pulseText'+i+'">Texto editable para '+esc(post.platform)+'</label>'+
  '<textarea class="input" id="pulseText'+i+'" data-pulse-text="'+i+'" maxlength="240" rows="4">'+esc(post.title)+'</textarea>'+
  '<small class="growth-pulse-check">Antes de publicar: '+esc(post.check)+'</small>'+
  button('Preparar imagen en Media Forge','pulse-to-forge','data-id="'+i+'"')+'</article>'
 ).join('');
 return '<section class="growth-pulse card"><div class="card-head"><div><span class="eyebrow">PULSE CAMPAIGN PILOT · MOTOR LOCAL</span>'+
 '<h2>Plan editorial de 7 días · '+esc(p.name)+'</h2></div><span class="tag">Editable</span></div>'+
 '<p class="muted tiny">Propuestas mediante reglas propias, sin IA generativa. El calendario no programa ni publica automáticamente. Revisa derechos, datos, promesas y condiciones antes de usar cada texto.</p>'+
 '<div class="growth-pulse-grid">'+rows+'</div>'+
 '<div class="workspace-actions growth-pulse-actions">'+
 button('Guardar ajustes','pulse-save-edits')+button('Descargar CSV','pulse-export-csv')+
 button('Calendario .ics','pulse-export-ics')+
 '<button type="button" class="primary" data-growth-action="pulse-to-drafts"'+(p.items.some(x=>!['Instagram','TikTok','YouTube','Facebook','LinkedIn','X'].includes(x.platform))?' disabled title="Este canal no está habilitado en el módulo de borradores"':'')+'>Crear 7 borradores locales</button></div>'+
 '<p class="tiny muted">'+(p.items.some(x=>!['Instagram','TikTok','YouTube','Facebook','LinkedIn','X'].includes(x.platform))?
 'Los borradores de Email y Google Ads no están integrados en el editor social; usa las exportaciones CSV o ICS.':
 'Los borradores respetan el límite FREE/PRO. Todos deben caber para poder añadirlos sin pérdidas ni publicaciones parciales.')+'</p></section>';
}
function briefs(plan){
 const max=plan==='pro'?100:10;
 const items=data.briefs.slice().reverse().map(b=>'<div class="growth-entry"><div><strong>'+esc(b.name)+'</strong><p>'+esc(b.goal)+' · '+esc(b.channel)+' · '+fmtMoney(b.budget)+'</p><p class="tiny muted">Público: '+esc(b.audience)+'</p></div><div class="workspace-actions">'+button('Crear plan PULSE 7 días','pulse-generate','data-id="'+esc(b.id)+'"')+button('Exportar .txt','export-brief','data-id="'+esc(b.id)+'"')+button('Eliminar','delete-brief','data-id="'+esc(b.id)+'"')+'</div></div>').join('');
 return '<div class="workspace-dual">'+card('🎯 Preparar campaña',
 '<p class="tiny muted" style="margin-bottom:12px">Organiza objetivos, público, oferta, canal y presupuesto. No hay IA ni gasto publicitario real.</p>'+
 '<form id="growth-brief">'+textField('Nombre de campaña','briefName','','required maxlength="100" placeholder="Ej.: lanzamiento primavera"')+
 selectField('Objetivo','briefGoal',['Visibilidad','Captación de contactos','Ventas','Interacciones','Tráfico web'])+
 textField('Marca','briefBrand','','maxlength="80" placeholder="Tu marca"')+
 textField('Público objetivo','briefAudience','','required maxlength="200"')+
 textField('Propuesta de valor / oferta','briefOffer','','required maxlength="320"')+
 selectField('Canal principal','briefChannel',['Instagram','TikTok','Facebook','Google Ads','YouTube','LinkedIn','Email','Multicanal'])+
 textField('Presupuesto de referencia en euros','briefBudget','100','type="number" min="0" max="100000000" step="0.01" required')+
 textField('Fecha de inicio','briefDate',today(),'type="date" required')+
 textField('Llamada a la acción','briefCta','','maxlength="120" placeholder="Solicita información"')+
 '<button class="primary full" type="submit">Guardar brief de campaña</button></form><p class="tiny muted" style="margin-top:12px">Hasta '+max+' briefs locales en este plan de prueba.</p>')+
 card('Biblioteca de campañas · '+data.briefs.length,'<div class="line-list">'+(items||'<div class="empty">Aún no has preparado una campaña.</div>')+'</div>')+'</div>'+pulsePlanPanel();
}
function utms(plan){
 const max=plan==='pro'?250:20;
 const items=data.utms.slice().reverse().map(l=>'<div class="growth-entry"><div class="growth-clip"><strong>'+esc(l.name)+'</strong><p>'+esc(l.link)+'</p></div><div class="workspace-actions">'+button('Copiar enlace','copy-utm','data-id="'+esc(l.id)+'"')+button('Eliminar','delete-utm','data-id="'+esc(l.id)+'"')+'</div></div>').join('');
 return '<div class="workspace-dual">'+card('🔗 Constructor de URL con seguimiento',
 '<p class="tiny muted" style="margin-bottom:10px">Genera enlaces UTM estándares. Solo añade parámetros a la URL; la medición requiere analítica configurada en el sitio de destino.</p><form id="growth-utm">'+
 textField('URL de destino (HTTPS)','utmBase','','required type="url" placeholder="https://tusitio.es/producto"')+
 textField('Origen: utm_source','utmSource','','required maxlength="90" placeholder="instagram"')+
 textField('Medio: utm_medium','utmMedium','social','required maxlength="90"')+
 textField('Campaña: utm_campaign','utmCampaign','','required maxlength="120" placeholder="lanzamiento"')+
 textField('Contenido opcional','utmContent','','maxlength="90"')+
 textField('Término opcional','utmTerm','','maxlength="90"')+
 '<button class="primary full" type="submit">Generar enlace UTM</button></form>')+
 card('Enlaces guardados · '+data.utms.length,'<div class="line-list">'+(items||'<div class="empty">Aquí aparecerán los enlaces que prepares.</div>')+'</div><p class="tiny muted" style="margin-top:12px">Límite local del plan: '+max+' enlaces.</p>')+'</div>';
}
function calculateSEO(text,keyword,platform){
 const caption=cut(text,2800), key=cut(keyword,80).toLocaleLowerCase('es'), words=caption.trim().split(/\s+/).filter(Boolean);
 const tagCount=(caption.match(/#[\p{L}\p{N}_]+/gu)||[]).length;
 const length=caption.length, hasKey=!!key&&caption.toLocaleLowerCase('es').includes(key);
 const cta=/(comenta|coméntanos|descubre|escríb|haz clic|reserva|compart|guarda|síguenos|visita|suscríb|contáct)/i.test(caption);
 const validLength=length>=40&&length<=1800;
 const pts=[caption.length>=40?20:0,hasKey?25:0,cta?20:0,validLength?20:0,tagCount>=1&&tagCount<=6?15:0];
 const score=pts.reduce((a,b)=>a+b,0);
 const findings=[];
 if(!hasKey)findings.push('Incluye tu palabra clave principal de forma natural en el texto.');
 if(!cta)findings.push('Añade una llamada a la acción clara al final.');
 if(!validLength)findings.push('Revisa la longitud: el texto debería ser informativo pero fácil de escanear.');
 if(tagCount===0)findings.push('Puedes probar uno o varios hashtags relevantes; no son obligatorios.');
 if(tagCount>6)findings.push('Revisa si todos los hashtags aportan valor.');
 if(!findings.length)findings.push('El borrador cumple las reglas básicas del comprobador local. Revísalo antes de publicar.');
 return {caption,keyword:key,platform,wordCount:words.length,charCount:length,tagCount,score,findings};
}
function seo(){
 const r=data.seo;
 return '<div class="workspace-dual">'+card('🔎 Comprobador de textos para redes',
 '<p class="tiny muted" style="margin-bottom:10px">Heurísticas de redacción, NO algoritmos ni límites oficiales de ninguna plataforma. No garantiza visibilidad ni posicionamiento.</p><form id="growth-seo">'+
 areaField('Texto / descripción','seoCaption',r?.caption||'','required maxlength="2800" placeholder="Escribe tu publicación..."')+
 textField('Palabra clave principal','seoKeyword',r?.keyword||'','required maxlength="80"')+
 selectField('Plataforma','seoPlatform',['Instagram','TikTok','YouTube','LinkedIn','Facebook'])+
 '<button type="submit" class="primary full">Analizar mi borrador</button></form>')+
 card('Diagnóstico local',r?'<div class="growth-score"><strong>'+r.score+'/100</strong><span>Índice orientativo de redacción</span></div>'+
 '<div class="growth-indicators">'+chips([r.charCount+' caracteres',r.wordCount+' palabras',r.tagCount+' hashtags',r.platform])+'</div>'+
 '<div class="line-list" style="margin-top:17px">'+r.findings.map(f=>'<div class="list-row"><p>✦ '+esc(f)+'</p></div>').join('')+'</div>'+
 '<div class="workspace-actions" style="margin-top:15px">'+button('Enviar a borradores','seo-to-post')+'</div>':
 '<div class="empty">Escribe un texto y pulsa «Analizar».</div>')+'</div>';
}
function mailHTML(e){
 const subject=esc(e.subject||'Tu próxima campaña'),pre=esc(e.preheader||''),body=esc(e.message||'').replace(/\n/g,'<br>');
 const href=https(e.url);
 return '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+subject+'</title></head>'+
 '<body style="margin:0;background:#f3f6fb;color:#182240;font-family:Arial,sans-serif"><div style="display:none;max-height:0;overflow:hidden">'+pre+'</div>'+
 '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f6fb"><tr><td align="center" style="padding:28px 12px">'+
 '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:18px"><tr><td style="padding:35px 28px">'+
 '<p style="font-size:12px;letter-spacing:2px;color:#694be3">MARKETHUB AI · PLANTILLA</p><h1 style="font-size:30px;line-height:1.2">'+subject+'</h1>'+
 '<p style="font-size:16px;line-height:1.7;white-space:normal">'+body+'</p>'+
 (href?'<p><a href="'+esc(href)+'" style="display:inline-block;padding:14px 24px;border-radius:12px;background:#6d48d7;color:#fff;text-decoration:none">'+esc(e.cta||'Descubre más')+'</a></p>':'')+
 '<p style="font-size:12px;line-height:1.6;color:#66718e">Plantilla no enviada. Para campañas reales: identifica al remitente, añade información legal y un enlace de baja operativo, y verifica consentimiento.</p>'+
 '</td></tr></table></td></tr></table></body></html>';
}
function emails(){
 const e=data.email;
 return '<div class="workspace-dual">'+card('✉️ Diseñar email profesional',
 '<p class="tiny muted" style="margin-bottom:10px">Editor y exportación de HTML; no envía mensajes ni guarda direcciones de destinatarios.</p><form id="growth-email">'+
 textField('Asunto','emailSubject',e.subject,'required maxlength="140"')+
 textField('Preencabezado','emailPreheader',e.preheader,'maxlength="170"')+
 areaField('Contenido del mensaje','emailMessage',e.message,'required maxlength="6000"')+
 textField('Texto del botón','emailCta',e.cta,'maxlength="70"')+
 textField('Destino HTTPS del botón','emailUrl',e.url,'type="url" required')+
 '<button class="primary full" type="submit">Guardar email y actualizar vista</button></form>')+
 card('Vista previa · HTML descargable',
 '<div class="growth-email-preview"><span class="eyebrow">EMAIL DE PRUEBA</span><h2>'+esc(e.subject||'Tu próximo email')+'</h2><p>'+esc(e.preheader||'Mensaje para tus suscriptores')+'</p><div class="growth-email-body">'+esc(e.message||'Escribe el contenido y actualiza la vista previa.')+'</div><span class="landing-preview-button">'+esc(e.cta)+'</span></div>'+
 '<div class="workspace-actions" style="margin-top:14px">'+button('Descargar HTML','export-email')+button('Descargar texto','export-email-txt')+'</div>'+
 '<p class="tiny muted" style="margin-top:10px">Antes de enviar: consentimiento, remitente identificable, política de privacidad y cancelación de suscripción real.</p>')+'</div>';
}
function repurposeTemplates(idea,audience,tone){
 const tag=tone==='Profesional'?'Enfoque práctico':tone==='Divertido'?'¡Vamos allá!':'Te contamos algo útil';
 const cta='¿Cómo lo aplicarías a tu proyecto?';
 return [
  {label:'Instagram',text:'✨ '+idea+'\n\nPara '+audience+'. '+tag+'.\n\n'+cta+'\n#marketing #ideas'},
  {label:'LinkedIn',text:'Una idea para reflexionar:\n\n'+idea+'\n\nSi trabajas con '+audience+', conviene analizar qué necesita realmente tu público y ajustar tu propuesta.\n\n'+cta},
  {label:'Guion corto para TikTok / Reel',text:'GANCHO (0–3 s): ¿Sabías que...?\n\nIDEA PRINCIPAL (3–18 s): '+idea+'\n\nPÚBLICO: '+audience+'\n\nCIERRE (18–25 s): '+cta}
 ];
}
function reuse(){
 return '<div class="workspace-dual">'+card('♻️ Reutilización de contenido',
 '<p class="tiny muted" style="margin-bottom:10px">Adaptaciones mediante plantillas manuales, sin IA ni publicación automática. Edita cada propuesta antes de usarla.</p><form id="growth-repurpose">'+
 areaField('Idea o publicación original','repIdea','','required maxlength="800"')+
 textField('Público al que te diriges','repAudience','','required maxlength="100"')+
 selectField('Tono','repTone',['Cercano','Profesional','Divertido'])+
 '<button class="primary full" type="submit">Crear 3 adaptaciones</button></form>')+
 card('Adaptaciones editables',
 '<div class="line-list">'+(data.repurpose.length?data.repurpose.map((p,i)=>'<div class="workspace-copy"><div class="card-head"><strong>'+esc(p.label)+'</strong><span class="tag">Plantilla</span></div><textarea class="input" id="repText'+i+'" aria-label="Editar adaptación '+(i+1)+'" rows="6">'+esc(p.text)+'</textarea><div class="workspace-actions">'+button('Copiar','copy-rep','data-id="'+i+'"')+button('Enviar a borradores','post-rep','data-id="'+i+'"')+'</div></div>').join(''):'<div class="empty">Introduce una idea para generar versiones por red.</div>')+'</div>')+'</div>';
}
function bioHTML(){
 const b=data.bio, links=Array.isArray(b.links)?b.links:[];
 return '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+
 '<title>'+esc(b.name||'Mis enlaces')+'</title><style>*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 50% 0,#602e90,#0b112c 65%);color:#fff;font:16px system-ui,sans-serif}main{max-width:590px;margin:0 auto;padding:60px 18px;text-align:center}h1{font-size:clamp(30px,6vw,50px)}p{color:#c5c8ec;line-height:1.6}a{display:block;margin:12px 0;padding:15px 18px;border-radius:14px;border:1px solid #8cb1e9;text-decoration:none;background:#2c2967;color:#fff;font-weight:700}small{display:block;margin-top:34px;color:#9bafd4}</style></head><body><main><h1>'+esc(b.name||'Mis enlaces')+'</h1><p>'+esc(b.description||'Encuentra aquí todos mis enlaces.')+'</p>'+links.map(l=>'<a href="'+esc(https(l.url)||'https://example.com')+'" rel="noopener noreferrer">'+esc(l.title)+'</a>').join('')+'<small>Página creada con MarketHub AI · demo estática</small></main></body></html>';
}
function bio(plan){
 const b=data.bio,cap=plan==='pro'?8:3;
 const previews=(Array.isArray(b.links)?b.links:[]).map(l=>'<span class="growth-bio-button">'+esc(l.title)+'</span>').join('');
 const rows=Array.from({length:cap},(_,i)=>'<div class="growth-link-row">'+textField('Nombre del enlace '+(i+1),'bioTitle'+i,b.links?.[i]?.title||'','maxlength="60" placeholder="Mi tienda"')+textField('URL HTTPS '+(i+1),'bioUrl'+i,b.links?.[i]?.url||'','type="url" placeholder="https://..."')+'</div>').join('');
 return '<div class="workspace-dual">'+card('🌐 Enlaces en bio',
 '<p class="tiny muted" style="margin-bottom:10px">Crea un micrositio de enlaces descargable. No se publica hasta que lo subas a un alojamiento.</p><form id="growth-bio">'+
 textField('Nombre público','bioName',b.name,'required maxlength="90"')+
 areaField('Descripción','bioDescription',b.description,'maxlength="270"')+rows+
 '<button class="primary full" type="submit">Guardar mi página de enlaces</button></form>')+
 card('Vista previa y exportación',
 '<div class="growth-bio-preview"><h2>'+esc(b.name||'Tu nombre o marca')+'</h2><p>'+esc(b.description||'Todos tus enlaces en un solo lugar.')+'</p>'+ (previews||'<span class="growth-bio-button">Tus enlaces aparecerán aquí</span>')+'</div>'+
 '<div class="workspace-actions" style="margin-top:13px">'+button('Descargar HTML','export-bio')+'</div><p class="tiny muted" style="margin-top:10px">FREE: hasta 3 enlaces · PRO demo: hasta 8. Exportar no significa que esté publicado en internet.</p>')+'</div>';
}
export function growthOpenTab(tab){if(sections.some(s=>s[0]===tab))active=tab}
export function growthPage(plan){
 const n=sections.map(s=>'<button type="button" data-growth-action="tab-'+s[0]+'" aria-current="'+(active===s[0]?'page':'false')+'">'+s[2]+' '+s[1]+'</button>').join('');
 const page=active==='utm'?utms(plan):active==='seo'?seo():active==='emails'?emails():active==='reutilizar'?reuse():active==='bio'?bio(plan):briefs(plan);
 return header()+'<div class="workspace-tabs" role="navigation" aria-label="Laboratorio de marketing">'+n+'</div><section class="section-stack">'+page+'</section>';
}
function download(filename,content,type){
 const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),anchor=document.createElement('a');
 anchor.href=url;anchor.download=filename;document.body.append(anchor);anchor.click();anchor.remove();
 // Evitar revocar antes de que Safari iOS haya iniciado la descarga.
 setTimeout(()=>URL.revokeObjectURL(url),60000);
}
const callbacks=(ctx,message)=>{if(!save()){ctx.toast('No se pudo guardar en este navegador.');return}ctx.refresh();ctx.toast(message)};
const copyText=(value,ctx)=>{if(navigator.clipboard?.writeText)navigator.clipboard.writeText(value).then(()=>ctx.toast('Copiado.'),()=>ctx.toast('Selecciona y copia el texto manualmente.'));else ctx.toast('Selecciona y copia el texto manualmente.')};
export function growthClick(target,ctx){
 const action=target.dataset.growthAction;
 if(!action)return false;
 if(action.startsWith('tab-')){growthOpenTab(action.slice(4));ctx.refresh();return true}
 const id=String(target.dataset.id||'');
 if(action==='delete-brief'||action==='delete-utm'){
  if(!window.confirm('¿Eliminar este elemento guardado? Esta operación no se puede deshacer.'))return true;
  if(action==='delete-brief')data.briefs=data.briefs.filter(x=>x.id!==id);
  else data.utms=data.utms.filter(x=>x.id!==id);
  callbacks(ctx,'Elemento eliminado.');return true;
 }
 if(action==='pulse-generate'){
  const brief=data.briefs.find(b=>b.id===id);
  if(!brief){ctx.toast('No se encuentra el brief seleccionado.');return true}
  try{data.pulsePlan=buildPulsePlan(brief);callbacks(ctx,'Plan PULSE de siete días generado y guardado localmente.')}
  catch(error){ctx.toast('No se pudo generar: '+String(error.message||error).slice(0,100))}
  return true;
 }
 if(action.startsWith('pulse-')){
  const plan=data.pulsePlan;
  if(!plan||!Array.isArray(plan.items)||plan.items.length!==7){
   ctx.toast('Genera antes un plan PULSE desde un brief.');return true;
  }
  // Antes de exportar o añadir borradores se incorporan los textos corregidos por el usuario.
  const updated=plan.items.map((item,i)=>({
   ...item,title:cut(document.getElementById('pulseText'+i)?.value??item.title,240)
  }));
  if(updated.some(item=>!item.title)){
   ctx.toast('Todos los días necesitan un texto antes de guardar el plan.');return true;
  }
  if(action==='pulse-to-forge'){
   const index=Number(id),item=Number.isInteger(index)?updated[index]:null;
   if(!item){ctx.toast('No se encuentra el día solicitado.');return true}
   if(typeof ctx.editCreative!=='function'){ctx.toast('El editor multimedia no está disponible.');return true}
   if(ctx.editCreative({text:item.title,platform:item.platform,brand:plan.brand})){
    plan.items=updated;save();
   }
   return true;
  }
  if(action==='pulse-to-drafts'){
   if(updated.some(item=>!['Instagram','TikTok','YouTube','Facebook','LinkedIn','X'].includes(item.platform))){
    ctx.toast('Este canal no tiene borradores sociales; exporta el calendario o CSV.');return true;
   }
   if(typeof ctx.newPosts!=='function'){ctx.toast('El editor de borradores no está disponible.');return true}
   if(ctx.newPosts(updated.map(item=>({title:item.title,date:item.date,platform:item.platform,status:'Borrador'})))){
    plan.items=updated;save();
   }
   return true;
  }
  plan.items=updated;
  if(!save()){ctx.toast('No se han podido guardar los ajustes.');return true}
  if(action==='pulse-save-edits'){ctx.refresh();ctx.toast('Los siete textos se han guardado.');return true}
  try{
   if(action==='pulse-export-csv'){
    download('PULSE-Plan-7-dias.csv',pulsePlanCSV(plan),'text/csv;charset=utf-8');
    ctx.toast('Plan editorial CSV descargado.');
   }else if(action==='pulse-export-ics'){
    download('PULSE-Calendario-7-dias.ics',pulsePlanICS(plan),'text/calendar;charset=utf-8');
    ctx.toast('Calendario local descargado, sin publicación automática.');
   }
  }catch(error){ctx.toast('No se pudo exportar: '+String(error.message||error).slice(0,100))}
  return true;
 }
 if(action==='export-brief'){
  const b=data.briefs.find(x=>x.id===id);
  if(!b){ctx.toast('No encontrado.');return true}
  download('brief-markethub.txt',[
   'BRIEF DE CAMPAÑA (DOCUMENTO PREPARATORIO)',
   'Nombre: '+b.name,'Marca: '+b.brand,'Objetivo: '+b.goal,
   'Público: '+b.audience,'Oferta: '+b.offer,'Canal: '+b.channel,
   'Presupuesto estimado: '+fmtMoney(b.budget),'Inicio previsto: '+b.date,
   'Llamada a la acción: '+b.cta,
   'No es una campaña contratada ni enviada.'
  ].join('\n'),'text/plain;charset=utf-8');
  ctx.toast('Brief descargado como texto.');return true;
 }
 if(action==='copy-utm'){
  const u=data.utms.find(x=>x.id===id);
  if(u)copyText(u.link,ctx);
  return true;
 }
 if(action==='seo-to-post'){
  if(!data.seo?.caption){ctx.toast('Analiza antes un texto.');return true}
  ctx.newPost(data.seo.caption.slice(0,240));return true;
 }
 if(action==='copy-rep'||action==='post-rep'){
  const text=document.getElementById('repText'+Number(id))?.value||'';
  if(!text.trim()){ctx.toast('No hay texto.');return true}
  if(action==='copy-rep')copyText(text,ctx);else ctx.newPost(text.slice(0,240));
  return true;
 }
 if(action==='export-email'){
  download('markethub-email.html',mailHTML(data.email),'text/html;charset=utf-8');
  ctx.toast('Plantilla HTML descargada; no se ha enviado correo.');return true;
 }
 if(action==='export-email-txt'){
  download('markethub-email.txt',[data.email.subject,data.email.preheader,data.email.message,data.email.url].join('\n\n'),'text/plain;charset=utf-8');
  ctx.toast('Texto del email descargado.');return true;
 }
 if(action==='export-bio'){
  download('markethub-link-en-bio.html',bioHTML(),'text/html;charset=utf-8');
  ctx.toast('Página de enlaces descargada. No está publicada.');return true;
 }
 return false;
}
export function growthSubmit(form,plan,ctx){
 if(!form?.id?.startsWith('growth-'))return false;
 const id=form.id,f=new FormData(form),v=k=>cut(f.get(k),320);
 if(id==='growth-brief'){
  const cap=plan==='pro'?100:10;
  if(data.briefs.length>=cap){ctx.toast('Se alcanzó el límite local de briefs para este plan de prueba.');return true}
  const name=v('briefName'),audience=v('briefAudience'),offer=v('briefOffer');
  if(!name||!audience||!offer){ctx.toast('Completa nombre, público y oferta.');return true}
  const budget=Number(f.get('briefBudget'));
  if(!Number.isFinite(budget)||budget<0||budget>100000000){ctx.toast('El presupuesto debe ser un número positivo válido.');return true}
  data.briefs.push({id:newId(),name,goal:v('briefGoal'),brand:v('briefBrand'),audience,offer,channel:v('briefChannel'),budget,date:v('briefDate'),cta:v('briefCta')});
  callbacks(ctx,'Brief guardado localmente; no se ha gastado dinero.');return true;
 }
 if(id==='growth-utm'){
  const cap=plan==='pro'?250:20;
  if(data.utms.length>=cap){ctx.toast('Límite local de enlaces alcanzado.');return true}
  const base=https(f.get('utmBase'));
  if(!base){ctx.toast('La URL debe ser HTTPS y no contener credenciales.');return true}
  const source=v('utmSource'),medium=v('utmMedium'),campaign=v('utmCampaign');
  if(!source||!medium||!campaign){ctx.toast('Completa origen, medio y campaña.');return true}
  const url=new URL(base);
  for(const [key,value] of [['utm_source',source],['utm_medium',medium],['utm_campaign',campaign],['utm_content',v('utmContent')],['utm_term',v('utmTerm')]]){
   if(value)url.searchParams.set(key,value);else url.searchParams.delete(key);
  }
  data.utms.push({id:newId(),name:campaign,link:url.href});
  callbacks(ctx,'Enlace UTM creado y guardado en el navegador.');return true;
 }
 if(id==='growth-seo'){
  const caption=cut(f.get('seoCaption'),2800),keyword=cut(f.get('seoKeyword'),80);
  if(!caption||!keyword){ctx.toast('Introduce un texto y su palabra clave.');return true}
  data.seo=calculateSEO(caption,keyword,v('seoPlatform'));
  callbacks(ctx,'Comprobación de redacción realizada con reglas locales.');return true;
 }
 if(id==='growth-email'){
  const subject=cut(f.get('emailSubject'),140),message=cut(f.get('emailMessage'),6000),url=https(f.get('emailUrl'));
  if(!subject||!message||!url){ctx.toast('Completa asunto, contenido y una URL HTTPS válida.');return true}
  data.email={subject,preheader:cut(f.get('emailPreheader'),170),message,cta:cut(f.get('emailCta'),70),url};
  callbacks(ctx,'Plantilla guardada localmente, ningún mensaje enviado.');return true;
 }
 if(id==='growth-repurpose'){
  const idea=cut(f.get('repIdea'),800),audience=cut(f.get('repAudience'),100);
  if(!idea||!audience){ctx.toast('Introduce una idea y su público.');return true}
  data.repurpose=repurposeTemplates(idea,audience,v('repTone'));
  callbacks(ctx,'Tres versiones generadas mediante plantillas locales.');return true;
 }
 if(id==='growth-bio'){
  const name=cut(f.get('bioName'),90);
  if(!name){ctx.toast('Escribe el nombre de la página.');return true}
  const cap=plan==='pro'?8:3,links=[];
  for(let i=0;i<cap;i++){
   const title=cut(f.get('bioTitle'+i),60),link=cut(f.get('bioUrl'+i),1600);
   if(!title&&!link)continue;
   const url=https(link);
   if(!title||!url){ctx.toast('Cada enlace debe incluir título y URL HTTPS válida (fila '+(i+1)+').');return true}
   links.push({title,url});
  }
  data.bio={name,description:cut(f.get('bioDescription'),270),links};
  callbacks(ctx,'Página de enlaces guardada localmente.');return true;
 }
 return false;
}
// Exports de cálculo separables y comprobables en pruebas sin navegador.
export { calculateSEO as analyzeCaption, https as validHttps, mailHTML as buildEmailHtml, bioHTML as buildBioHtml };

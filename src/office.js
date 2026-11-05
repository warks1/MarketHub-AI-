// MarketHub AI · Oficina creativa local (sin backend, IA externa ni conexiones a redes).
// Funciones reales en el navegador: CRM, tareas, kit de marca, copies por plantilla,
// landing exportable, calculadora de campañas y copia JSON. No introducir datos sensibles reales.
const KEY='markethub-ai-office-v1';
const blank=()=>({leads:[],tasks:[],brand:{name:'',tagline:'',tone:'Cercano',primary:'#23dff2',accent:'#e24acb'},copies:[],landing:{title:'',subtitle:'',button:'Descubre más',url:'https://example.com'},calculation:null});
let model=blank();
try {
 const saved=JSON.parse(localStorage.getItem(KEY)||'null');
 if(saved&&typeof saved==='object'&&!Array.isArray(saved)){
  model={...blank(),leads:Array.isArray(saved.leads)?saved.leads.slice(0,1000):[],tasks:Array.isArray(saved.tasks)?saved.tasks.slice(0,1000):[],
   brand:{...blank().brand,...(saved.brand&&typeof saved.brand==='object'?saved.brand:{})},
   copies:Array.isArray(saved.copies)?saved.copies.slice(0,5):[],
   landing:{...blank().landing,...(saved.landing&&typeof saved.landing==='object'?saved.landing:{})},
   calculation:saved.calculation&&typeof saved.calculation==='object'?saved.calculation:null};
 }
} catch { model=blank() }
let active='resumen';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const truncate=(s,n)=>String(s??'').trim().slice(0,n);
const numeric=v=>Math.max(0,Number.isFinite(Number(v))?Number(v):0);
const money=v=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:2}).format(Number.isFinite(v)?v:0);
const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(model));return true}catch{return false}};
const statusList=['Nuevo','Contactado','Propuesta','Ganado','Perdido'];
const validHex=v=>/^#[a-fA-F0-9]{6}$/.test(String(v))?String(v):'#28ddef';
const safeUrl=v=>{try{const u=new URL(String(v));return u.protocol==='https:'?u.href:'https://example.com'}catch{return 'https://example.com'}};
const tabs=[
 ['resumen','Vista general','✦'],['copys','Textos','✍'],['crm','CRM','♧'],['tareas','Tareas','☑'],
 ['landing','Landing','▤'],['calculadora','Campañas','↗'],['marca','Mi marca','◈']
];
function header(title,subtitle){
 return '<div class="page-head"><div><span class="eyebrow">OFICINA CREATIVA · LOCAL</span><h1>'+title+'</h1><p>'+subtitle+'</p></div><span class="demo-pill">Sin nube · beta</span></div>';
}
function field(label,id,value='',type='text',extra=''){
 return '<div class="form-field"><label for="'+id+'">'+label+'</label><input class="input" id="'+id+'" name="'+id+'" type="'+type+'" '+extra+' value="'+esc(value)+'"></div>';
}
function textarea(label,id,value='',extra=''){
 return '<div class="form-field"><label for="'+id+'">'+label+'</label><textarea class="input" id="'+id+'" name="'+id+'" '+extra+'>'+esc(value)+'</textarea></div>';
}
function select(label,id,choices,selected=''){
 return '<div class="form-field"><label for="'+id+'">'+label+'</label><select class="input" id="'+id+'" name="'+id+'">'+choices.map(c=>'<option value="'+esc(c)+'" '+(selected===c?'selected':'')+'>'+esc(c)+'</option>').join('')+'</select></div>';
}
function card(title,body){return '<div class="card"><div class="card-head"><h2>'+title+'</h2></div>'+body+'</div>'}
function asButton(label,action,klass='secondary',attrs=''){return '<button type="button" class="'+klass+'" data-office-action="'+action+'" '+attrs+'>'+label+'</button>'}
function row(label,desc,right=''){return '<div class="list-row"><div><b>'+esc(label)+'</b><p>'+esc(desc)+'</p></div>'+right+'</div>'}
function statusMark(status){return '<span class="tag '+(status==='Ganado'||status==='Completada'?'green':status==='Perdido'?'pink':'')+'">'+esc(status)+'</span>'}
function overview(plan){
 const done=model.tasks.filter(t=>t.done).length;
 return '<div class="workspace-summary">'+[
  [model.leads.length,'Contactos guardados','CRM local'],[model.tasks.length-done,'Tareas pendientes','Organización'],
  [model.copies.length,'Textos guardados','Plantillas'],[model.brand.name?'1':'0','Marcas configuradas','Kit de marca']
 ].map(v=>'<div class="workspace-stat"><strong>'+v[0]+'</strong><span>'+v[1]+'</span><small>'+v[2]+'</small></div>').join('')+'</div>'+
 card('Empieza por aquí','<p class="muted" style="margin-bottom:14px">Crea copys listos para editar, organiza tus oportunidades, prepara una landing descargable y calcula los costes de una campaña. Todas estas operaciones funcionan <strong>solo en este navegador</strong>.</p><div class="workspace-shortcuts">'+tabs.slice(1).map(t=>asButton(t[2]+' '+t[1],'tab-'+t[0],'secondary')).join('')+'</div>')+
 card('FREE y PRO · uso responsable','<div class="notice">Este laboratorio se puede probar en FREE y PRO. En FREE se permiten hasta 100 contactos y 30 tareas de prueba; PRO aumenta esos límites dentro de las restricciones del almacenamiento local. <strong>El selector PRO de este prototipo no verifica pagos.</strong></div>'+
 '<div class="workspace-shortcuts" style="margin-top:14px">'+asButton('Exportar copia JSON','export','primary')+asButton('Ir al CRM','tab-crm','secondary')+'</div>')+
 '<div class="notice">Privacidad: no introduzcas datos personales reales ni secretos empresariales. La información se almacena en este dispositivo sin cifrado de servidor. Para uso comercial faltan cuentas, base de datos, permisos y copias seguras.</div>';
}
function copyTemplates(form){
 const brand=truncate(form.get('copyBrand'),70)||truncate(model.brand.name,70)||'tu marca';
 const product=truncate(form.get('copyProduct'),100)||'nuestro nuevo servicio';
 const audience=truncate(form.get('copyAudience'),90)||'personas interesadas';
 const platform=truncate(form.get('copyPlatform'),25);
 const goal=truncate(form.get('copyGoal'),35);
 const cta=goal==='Conseguir contactos'?'Escríbenos y te contamos más.':goal==='Vender'?'Descúbrelo y da el siguiente paso.':'Coméntanos qué te parece.';
 return [
  {label:'Directo y convincente',text:'🚀 '+product+' está pensado para '+audience+'. En '+brand+' queremos ayudarte a conseguir resultados de forma sencilla. '+cta+' #'+platform.replace(/[^a-zA-Z]/g,'')},
  {label:'Cercano y conversacional',text:'¿Y si '+product+' fuera justo lo que necesitabas? ✨ En '+brand+' trabajamos para '+audience+'. Queremos conocer tu opinión. '+cta},
  {label:'Educativo y útil',text:'3 razones para descubrir '+product+':\n✅ Una solución para '+audience+'.\n✅ Ahorra tiempo en la decisión.\n✅ Conoce el valor que ofrece '+brand+'.\n'+cta}
 ];
}
function copiesPage(){
 return '<div class="workspace-dual">'+card('✍ Generador de textos por plantillas',
 '<p class="tiny muted" style="margin-bottom:12px">Funciona sin IA externa. Los textos son borradores editables y requieren revisión; no prometen resultados.</p><form id="office-copy-form">'+
 field('Producto, servicio o tema','copyProduct','','text','required maxlength="100" placeholder="Ej.: nuevo menú de temporada"')+
 field('Marca','copyBrand',model.brand.name,'text','maxlength="70" placeholder="Nombre de tu marca"')+
 field('Público','copyAudience','','text','maxlength="90" placeholder="Ej.: jóvenes que quieren cuidar su salud"')+
 select('Plataforma','copyPlatform',['Instagram','TikTok','LinkedIn','Facebook','YouTube'])+
 select('Objetivo','copyGoal',['Conseguir contactos','Vender','Dar a conocer'])+
 '<button class="primary full" type="submit">Generar 3 propuestas editables</button></form>')+
 card('Tus 3 propuestas','<div class="line-list">'+(model.copies.length?model.copies.map((c,i)=>'<div class="workspace-copy"><div class="card-head"><b>'+esc(c.label)+'</b><span class="tag">Plantilla</span></div><textarea id="officeCopy'+i+'" class="input" aria-label="Editar texto '+(i+1)+'" rows="5">'+esc(c.text)+'</textarea><div class="workspace-actions">'+asButton('Copiar texto','copy-copy','secondary small-btn','data-id="'+i+'"')+asButton('Enviar a borradores','use-copy','primary small-btn','data-id="'+i+'"')+'</div></div>').join(''):'<div class="empty">Completa el formulario para generar propuestas.</div>')+'</div>')+'</div>';
}
function crmPage(plan){
 const cap=plan==='pro'?1000:100;
 return '<div class="workspace-dual">'+card('♧ Nuevo contacto de prueba','<form id="office-lead-form">'+
 field('Nombre o alias','leadName','','text','required maxlength="75" placeholder="Ej.: Cliente 1"')+
 field('Email (opcional)','leadEmail','','email','maxlength="120" placeholder="correo@ejemplo.com"')+
 select('Origen','leadSource',['Formulario','Instagram','TikTok','Web','Referido','Otro'])+
 '<button class="primary full" type="submit">Guardar contacto local</button></form><p class="tiny muted" style="margin-top:12px">Límite de esta prueba: '+cap+' registros. No escribas información sensible ni uses este CRM con clientes reales.</p>')+
 card('Contactos · '+model.leads.length,'<div class="line-list">'+(model.leads.length?model.leads.slice().reverse().map(l=>'<div class="workspace-record"><div class="workspace-record-main"><strong>'+esc(l.name)+'</strong><span class="tiny muted">'+esc(l.email||'Sin email')+' · '+esc(l.source||'Otro')+'</span></div><label class="tiny muted">Estado<select class="input" data-office-change="lead-status" data-id="'+esc(l.id)+'" aria-label="Estado de '+esc(l.name)+'">'+statusList.map(v=>'<option '+(v===l.status?'selected':'')+'>'+v+'</option>').join('')+'</select></label>'+asButton('Eliminar','delete-lead','secondary small-btn','data-id="'+esc(l.id)+'"')+'</div>').join(''):'<div class="empty">Aún no hay contactos de prueba.</div>')+'</div>')+'</div>';
}
function tasksPage(plan){
 const cap=plan==='pro'?300:30;
 return '<div class="workspace-dual">'+card('☑ Añadir tarea','<form id="office-task-form">'+
 field('Descripción de la tarea','taskTitle','','text','required maxlength="140" placeholder="Ej.: preparar calendario del mes"')+
 field('Vencimiento','taskDue','','date')+
 select('Prioridad','taskPriority',['Normal','Alta','Baja'])+
 '<button class="primary full" type="submit">Guardar tarea</button></form><p class="tiny muted" style="margin-top:12px">Límite '+cap+' tareas almacenadas en este dispositivo.</p>')+
 card('Lista de trabajo · '+model.tasks.length,'<div class="line-list">'+(model.tasks.length?model.tasks.slice().reverse().map(t=>'<div class="workspace-record"><label class="workspace-task-check"><input type="checkbox" data-office-change="task-done" data-id="'+esc(t.id)+'" '+(t.done?'checked':'')+' aria-label="Completar '+esc(t.title)+'"><span><strong style="'+(t.done?'text-decoration:line-through;opacity:.7':'')+'">'+esc(t.title)+'</strong><small>'+esc(t.due||'Sin fecha')+' · '+esc(t.priority)+'</small></span></label>'+asButton('Eliminar','delete-task','secondary small-btn','data-id="'+esc(t.id)+'"')+'</div>').join(''):'<div class="empty">No hay tareas guardadas.</div>')+'</div>')+'</div>';
}
function landingHTML(){
 const d=model.landing,primary=validHex(model.brand.primary),accent=validHex(model.brand.accent);
 return '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="'+esc(d.subtitle)+'"><title>'+esc(d.title)+'</title><style>*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;background:linear-gradient(135deg,#101633,#24154a);color:#fff;font-family:system-ui,sans-serif}main{max-width:790px;padding:50px 25px;text-align:center}h1{font-size:clamp(34px,6vw,75px);line-height:1.07}p{font-size:clamp(17px,2vw,23px);color:#dae5f3;line-height:1.6}a{display:inline-block;margin-top:18px;border-radius:12px;padding:16px 25px;background:linear-gradient(105deg,'+primary+','+accent+');color:#fff;font-weight:800;text-decoration:none}small{display:block;margin-top:46px;color:#b5c4df}</style></head><body><main><h1>'+esc(d.title||'Tu propuesta comienza aquí')+'</h1><p>'+esc(d.subtitle||'Descubre lo que tenemos preparado para ti.')+'</p><a href="'+esc(safeUrl(d.url))+'" rel="noopener noreferrer">'+esc(d.button||'Descubre más')+'</a><small>'+esc(model.brand.name||'Tu marca')+' · Página creada con MarketHub AI · plantilla local</small></main></body></html>';
}
function landingPage(){
 const d=model.landing;
 return '<div class="workspace-dual">'+card('▤ Página de captación exportable',
 '<p class="tiny muted" style="margin-bottom:12px">Crea una página HTML estática con botón de contacto. No incluye formularios, analítica ni alojamiento.</p><form id="office-landing-form">'+
 field('Título principal','landingTitle',d.title,'text','required maxlength="110"')+
 textarea('Descripción','landingSubtitle',d.subtitle,'maxlength="420"')+
 field('Texto del botón','landingButton',d.button,'text','maxlength="65"')+
 field('URL segura del botón (https)','landingUrl',d.url,'url','required pattern="https://.*"')+
 '<button type="submit" class="primary full">Guardar y actualizar vista previa</button></form>')+
 card('Vista previa y exportación',
 '<div class="workspace-landing-preview"><span class="eyebrow">'+esc(model.brand.name||'TU MARCA')+'</span><h2>'+esc(d.title||'Tu propuesta comienza aquí')+'</h2><p>'+esc(d.subtitle||'Descubre lo que tenemos preparado para ti.')+'</p><span class="landing-preview-button">'+esc(d.button||'Descubre más')+'</span></div><div class="workspace-actions" style="margin-top:14px">'+asButton('Descargar landing HTML','download-landing','primary')+'</div><p class="tiny muted" style="margin-top:10px">El archivo se abre en navegador. Para publicar en internet necesitas alojamiento web, dominio y revisión legal.</p>')+'</div>';
}
function calculatorPage(){
 const raw=model.calculation;
 // Los datos restaurados pueden estar incompletos o dañados; nunca pintar NaN/Infinity.
 const c=raw&&['spend','revenue','leads','orders'].every(k=>typeof raw[k]==='number'&&Number.isFinite(raw[k])&&raw[k]>=0&&raw[k]<=1e12)?raw:null;
 return '<div class="workspace-dual">'+card('↗ Calculadora de rentabilidad',
 '<p class="tiny muted" style="margin-bottom:12px">Introduce cifras propias; los resultados serán cálculos matemáticos, no estimaciones de ventas.</p><form id="office-calc-form">'+
 field('Gasto publicitario (€)','calcSpend',c?.spend??'','number','required min="0" step="0.01"')+
 field('Ingresos atribuidos (€)','calcRevenue',c?.revenue??'','number','required min="0" step="0.01"')+
 field('Contactos conseguidos','calcLeads',c?.leads??'','number','required min="0" step="1"')+
 field('Ventas / conversiones','calcOrders',c?.orders??'','number','required min="0" step="1"')+
 '<button type="submit" class="primary full">Calcular indicadores</button></form>')+
 card('Resultados'+(c?' con tus cifras':''),
 c?'<div class="workspace-metrics">'+[
  ['ROAS',c.spend?(c.revenue/c.spend).toFixed(2)+'×':'No calculable'],
  ['ROI',c.spend?(((c.revenue-c.spend)/c.spend)*100).toFixed(1)+'%':'No calculable'],
  ['Coste por lead',c.leads?money(c.spend/c.leads):'No calculable'],
  ['Coste por venta',c.orders?money(c.spend/c.orders):'No calculable'],
  ['Conversión lead-venta',c.leads?((c.orders/c.leads)*100).toFixed(1)+'%':'No calculable'],
  ['Beneficio atribuido (antes de otros costes)',money(c.revenue-c.spend)]
 ].map(v=>'<div><span>'+v[0]+'</span><strong>'+v[1]+'</strong></div>').join('')+'</div><div class="notice">Los indicadores dependen de la calidad de los datos introducidos y no incluyen impuestos, costes de producto o atribución multiplataforma.</div>':'<div class="empty">Rellena el formulario para calcular métricas reales a partir de tus números.</div>')+'</div>';
}
function brandPage(){
 const b=model.brand;
 return '<div class="workspace-dual">'+card('◈ Configura tu marca','<form id="office-brand-form">'+
 field('Nombre de marca','brandName',b.name,'text','required maxlength="70"')+
 field('Eslogan','brandTagline',b.tagline,'text','maxlength="150"')+
 select('Tono de comunicación','brandTone',['Cercano','Profesional','Divertido','Elegante','Directo'],b.tone)+
 field('Color principal','brandPrimary',b.primary,'color')+
 field('Color de acento','brandAccent',b.accent,'color')+
 '<button type="submit" class="primary full">Guardar kit de marca</button></form>')+
 card('Identidad visual','<div class="workspace-brand-preview" style="--brand-primary:'+validHex(b.primary)+';--brand-accent:'+validHex(b.accent)+'"><span class="eyebrow">TU IDENTIDAD</span><h2>'+esc(b.name||'Nueva marca')+'</h2><p>'+esc(b.tagline||'Tu próximo gran proyecto.')+'</p><div class="workspace-brand-swatches"><i style="background:'+validHex(b.primary)+'"></i><i style="background:'+validHex(b.accent)+'"></i><span>'+esc(b.tone)+'</span></div></div><p class="tiny muted" style="margin-top:12px">Este kit se guarda de forma local y sirve de referencia para tus copys y landings.</p>')+'</div>';
}
export function officeOpenTab(tab){if(tabs.some(t=>t[0]===tab))active=tab}
export function officePage(plan){
 const nav='<div class="workspace-tabs" role="navigation" aria-label="Herramientas de oficina">'+tabs.map(t=>'<button type="button" aria-current="'+(active===t[0]?'page':'false')+'" data-office-action="tab-'+t[0]+'">'+t[2]+' '+t[1]+'</button>').join('')+'</div>';
 let content=active==='copys'?copiesPage():active==='crm'?crmPage(plan):active==='tareas'?tasksPage(plan):active==='landing'?landingPage():active==='calculadora'?calculatorPage():active==='marca'?brandPage():overview(plan);
 const footer=active==='resumen'?'':'<div class="workspace-actions" style="margin-top:19px">'+asButton('Exportar copia de oficina (.json)','export','secondary')+asButton('Volver al resumen','tab-resumen','secondary')+'</div>';
 return header('Oficina de marketing ✦','Herramientas prácticas y locales para crear, organizar y calcular, sin conexión con redes sociales.')+
 '<div class="notice" style="margin-bottom:14px">Versión BETA LOCAL · Las operaciones guardan datos únicamente en tu navegador. No utilices datos reales de clientes hasta disponer de seguridad y sincronización en la nube.</div>'+
 nav+'<section class="section-stack">'+content+'</section>'+footer;
}
function download(filename,text,type){
 const blob=new Blob([text],{type});
 const link=document.createElement('a');const href=URL.createObjectURL(blob);link.href=href;link.download=filename;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(href),600);
}
export function officeClick(target,ctx){
 const action=target.dataset.officeAction;
 if(!action)return false;
 if(action.startsWith('tab-')){active=action.slice(4);ctx.refresh();return true}
 if(action==='copy-copy'||action==='use-copy'){
  const value=document.getElementById('officeCopy'+Number(target.dataset.id))?.value||'';
  if(!value.trim()){ctx.toast('No hay texto para utilizar.');return true}
  if(action==='use-copy'){ctx.newPost(truncate(value,240));return true}
  if(navigator.clipboard?.writeText){navigator.clipboard.writeText(value).then(()=>ctx.toast('Texto copiado.'),()=>ctx.toast('No se pudo copiar; selecciona el texto manualmente.'))}else ctx.toast('Selecciona el texto y utiliza copiar.');
  return true;
 }
 if(action==='download-landing'){download('markethub-landing.html',landingHTML(),'text/html;charset=utf-8');ctx.toast('Landing HTML descargada.');return true}
 if(action==='export'){download('markethub-oficina-backup.json',JSON.stringify({version:1,exportedAt:new Date().toISOString(),workspace:model},null,2),'application/json');ctx.toast('Copia de oficina exportada (no incluye publicaciones del calendario).');return true}
 if(action==='delete-lead'||action==='delete-task'){
  if(!window.confirm('¿Quieres eliminar este registro? Esta operación no se puede deshacer.'))return true;
  const field=action==='delete-lead'?'leads':'tasks';model[field]=model[field].filter(x=>String(x.id)!==String(target.dataset.id));
  if(persist()){ctx.refresh();ctx.toast('Registro eliminado.')}else ctx.toast('No se pudo guardar el cambio.');
  return true;
 }
 return false;
}
export function officeSubmit(form,plan,ctx){
 const data=new FormData(form),id=form.id;
 if(!id.startsWith('office-'))return false;
 const value=k=>truncate(data.get(k),140);
 let message='Cambios guardados localmente.';
 if(id==='office-copy-form'){
  if(!value('copyProduct')){ctx.toast('Introduce un producto o tema.');return true}
  model.copies=copyTemplates(data);message='3 copys generados mediante plantillas locales. No se ha usado IA externa.';
 }else if(id==='office-lead-form'){
  if(model.leads.length>=(plan==='pro'?1000:100)){ctx.toast('Límite de contactos de esta demostración alcanzado.');return true}
  const name=value('leadName');if(!name){ctx.toast('Escribe un nombre o alias.');return true}
  model.leads.push({id:String(Date.now())+'-'+Math.floor(Math.random()*1000),name,email:value('leadEmail'),source:value('leadSource'),status:'Nuevo'});
  message='Contacto de prueba guardado localmente.';
 }else if(id==='office-task-form'){
  if(model.tasks.length>=(plan==='pro'?300:30)){ctx.toast('Límite de tareas alcanzado.');return true}
  if(!value('taskTitle')){ctx.toast('Escribe una tarea.');return true}
  model.tasks.push({id:String(Date.now())+'-'+Math.floor(Math.random()*1000),title:value('taskTitle'),due:value('taskDue'),priority:value('taskPriority'),done:false});
  message='Tarea guardada localmente.';
 }else if(id==='office-landing-form'){
  const title=value('landingTitle');if(!title){ctx.toast('Añade un título.');return true}
  const url=String(data.get('landingUrl')||'');
  if(!url.startsWith('https://')){ctx.toast('Usa un enlace que empiece por https://');return true}
  model.landing={title,subtitle:truncate(data.get('landingSubtitle'),420),button:value('landingButton'),url:safeUrl(url)};
  message='Vista previa actualizada. Ya puedes descargar la landing.';
 }else if(id==='office-brand-form'){
  if(!value('brandName')){ctx.toast('Introduce el nombre de tu marca.');return true}
  model.brand={name:value('brandName'),tagline:truncate(data.get('brandTagline'),150),tone:value('brandTone'),primary:validHex(data.get('brandPrimary')),accent:validHex(data.get('brandAccent'))};
 }else if(id==='office-calc-form'){
  const raw=['calcSpend','calcRevenue','calcLeads','calcOrders'].map(k=>data.get(k));
  if(raw.some(v=>v===null||String(v).trim()===''||!Number.isFinite(Number(v))||Number(v)<0||Number(v)>1e12)){
   ctx.toast('Introduce importes y cantidades numéricos válidos, sin valores negativos.');return true;
  }
  const [spend,revenue,leads,orders]=raw.map(Number);
  if(!Number.isInteger(leads)||!Number.isInteger(orders)){
   ctx.toast('Los contactos y las conversiones deben ser números enteros.');return true;
  }
  if(orders>leads){ctx.toast('Las conversiones no deben superar los contactos para esa tasa.');return true}
  model.calculation={spend,revenue,leads,orders};
  message='Indicadores calculados con tus cifras.';
 }else return false;
 if(!persist()){ctx.toast('No se pudo almacenar: revisa el espacio del navegador.');return true}
 ctx.refresh();ctx.toast(message);return true;
}
export function officeChange(target,ctx){
 const action=target.dataset.officeChange;
 if(!action)return false;
 if(action==='lead-status'){
  const lead=model.leads.find(x=>String(x.id)===String(target.dataset.id));
  if(lead&&statusList.includes(target.value)){lead.status=target.value;persist();ctx.toast('Estado actualizado.')}
 }else if(action==='task-done'){
  const task=model.tasks.find(x=>String(x.id)===String(target.dataset.id));
  if(task){task.done=target.checked;persist();ctx.refresh();}
 }
 return true;
}

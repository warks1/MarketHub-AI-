// MarketHub AI · Campañas de planificación local, sin activar anuncios ni gastar dinero.
export const campaignLimit=plan=>plan==='pro'?150:10;
const NETWORKS=['Instagram','Facebook','TikTok','YouTube','LinkedIn','X','Multicanal'];
const GOALS=['Alcance','Interacciones','Tráfico web','Leads','Conversiones'];
const STATUSES=['Borrador','Planificada'];
export const campaignNetworks=NETWORKS;
export const campaignGoals=GOALS;
export const campaignStatuses=STATUSES;
const str=x=>String(x??'').trim();
const validDate=value=>{
 const d=str(value);
 if(!/^\d{4}-\d{2}-\d{2}$/.test(d))return false;
 const parsed=new Date(d+'T12:00:00Z');
 return Number.isFinite(parsed.valueOf())&&parsed.toISOString().slice(0,10)===d;
};
export function validateCampaign(raw={}){
 const name=str(raw.name).slice(0,120),objective=str(raw.objective),channel=str(raw.channel);
 const start=str(raw.start),end=str(raw.end),status=str(raw.status||'Borrador');
 const amount=Number(raw.budget);
 if(!name)return {error:'Escribe el nombre de la campaña.'};
 if(!GOALS.includes(objective))return {error:'Elige un objetivo de la lista.'};
 if(!NETWORKS.includes(channel))return {error:'Selecciona una plataforma válida.'};
 if(!validDate(start)||!validDate(end)||start>end)return {error:'Selecciona un rango de fechas válido.'};
 if(str(raw.budget)===''||!Number.isFinite(amount)||amount<0||amount>1000000)return {error:'Indica un presupuesto estimado de 0 a 1.000.000 €.'};
 if(!STATUSES.includes(status))return {error:'Selecciona Borrador o Planificada.'};
 return {value:{name,objective,channel,start,end,budget:Math.round(amount*100)/100,status}};
}
export function campaignById(campaigns,id){
 if(!Array.isArray(campaigns)||id==null)return null;
 return campaigns.find(c=>c&&typeof c==='object'&&String(c.id)===String(id))??null;
}
export function campaignSummary(campaigns){
 const safe=(Array.isArray(campaigns)?campaigns:[]).filter(c=>c&&typeof c==='object');
 return {count:safe.length,plannedBudget:safe.reduce((sum,c)=>sum+(Number.isFinite(Number(c.budget))?Math.max(0,Number(c.budget)):0),0),planned:safe.filter(c=>c.status==='Planificada').length};
}
export const money=n=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:2}).format(Number(n)||0);
const cell=v=>{
 const raw=String(v??'').replace(/\0/g,'');
 return '"'+(/^\s*[=+\-@]/.test(raw)?"'"+raw:raw).replace(/"/g,'""')+'"';
};
export function campaignsToCSV(campaigns){
 const headings=['Nombre','Objetivo','Plataforma','Inicio','Final','Presupuesto estimado EUR','Estado'];
 const safe=(Array.isArray(campaigns)?campaigns:[]).filter(c=>c&&typeof c==='object');
 const rows=safe.map(c=>[c.name,c.objective,c.channel,c.start,c.end,c.budget,c.status]);
 return '\uFEFF'+[headings,...rows].map(row=>row.map(cell).join(',')).join('\r\n')+'\r\n';
}
const esc=x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
function opts(items,value){
 return items.map(x=>'<option value="'+esc(x)+'" '+(x===value?'selected':'')+'>'+esc(x)+'</option>').join('');
}
export function campaignManagerHTML({campaigns=[],editingId=null,plan='free'}={}){
 const safe=Array.isArray(campaigns)?campaigns.filter(c=>c&&typeof c==='object'):[];
 const editing=campaignById(safe,editingId);
 const sum=campaignSummary(safe);
 const date=new Date();
 const today=[date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
 const rows=safe.map(c=>
  '<div class="campaign-local-row"><div class="campaign-local-main"><strong>'+esc(c.name)+'</strong>'+
  '<small>'+esc(c.objective)+' · '+esc(c.channel)+' · '+esc(c.start)+' → '+esc(c.end)+'</small></div>'+
  '<div class="campaign-local-meta"><span class="tag">'+esc(c.status)+'</span><strong>'+money(c.budget)+'</strong></div>'+
  '<div class="campaign-local-actions">'+
  '<button type="button" class="secondary small-btn" data-action="campaign-edit" data-id="'+esc(c.id)+'">Editar</button>'+
  '<button type="button" class="secondary small-btn" data-action="campaign-duplicate" data-id="'+esc(c.id)+'">Duplicar</button>'+
  '<button type="button" class="secondary small-btn" data-action="campaign-delete" data-id="'+esc(c.id)+'">Eliminar</button></div></div>'
 ).join('');
 return '<section class="campaign-local"><div class="campaign-local-title">'+
  '<div><span class="eyebrow">GESTIÓN REAL · EN ESTE DISPOSITIVO</span><h2>Planificador de campañas</h2>'+
  '<p>Prepara presupuestos y calendarios sin activar publicidad ni realizar cargos.</p></div>'+
  '<button type="button" class="secondary" data-action="campaign-export">Exportar CSV ↓</button></div>'+
  '<div class="campaign-local-summary">'+
  '<div><span>Campañas locales</span><strong>'+sum.count+' / '+campaignLimit(plan)+'</strong></div>'+
  '<div><span>Presupuesto previsto</span><strong>'+money(sum.plannedBudget)+'</strong></div>'+
  '<div><span>Planificadas</span><strong>'+sum.planned+'</strong></div></div>'+
  '<div class="campaign-local-grid"><div class="card">'+
  '<div class="card-head"><h3>'+(editing?'Editar campaña':'Nueva campaña')+'</h3><span class="tag">Sin publicación automática</span></div>'+
  '<form id="campaignForm" class="campaign-local-form">'+
  '<label for="campaignName">Nombre de la campaña</label>'+
  '<input class="input" id="campaignName" name="name" maxlength="120" required placeholder="Lanzamiento del nuevo producto" value="'+esc(editing?.name||'')+'">'+
  '<div class="campaign-local-fields"><div><label for="campaignGoal">Objetivo</label>'+
  '<select class="input" id="campaignGoal" name="objective">'+opts(GOALS,editing?.objective||'Alcance')+'</select></div>'+
  '<div><label for="campaignNetwork">Plataforma</label>'+
  '<select class="input" id="campaignNetwork" name="channel">'+opts(NETWORKS,editing?.channel||'Instagram')+'</select></div></div>'+
  '<div class="campaign-local-fields"><div><label for="campaignStart">Inicio</label>'+
  '<input class="input" type="date" id="campaignStart" name="start" value="'+esc(editing?.start||today)+'" required></div>'+
  '<div><label for="campaignEnd">Final</label>'+
  '<input class="input" type="date" id="campaignEnd" name="end" value="'+esc(editing?.end||today)+'" required></div></div>'+
  '<div class="campaign-local-fields"><div><label for="campaignBudget">Presupuesto previsto (€)</label>'+
  '<input class="input" type="number" id="campaignBudget" name="budget" min="0" max="1000000" step="0.01" inputmode="decimal" value="'+esc(editing?.budget??0)+'" required></div>'+
  '<div><label for="campaignStatus">Estado</label><select class="input" id="campaignStatus" name="status">'+opts(STATUSES,editing?.status||'Borrador')+'</select></div></div>'+
  '<button class="primary full" type="submit">'+(editing?'Guardar cambios':'Guardar campaña')+'</button>'+
  (editing?'<button type="button" class="secondary full" data-action="campaign-cancel">Cancelar edición</button>':'')+
  '</form></div><div class="card"><div class="card-head"><h3>Mis campañas locales</h3><span class="tag">'+sum.count+'</span></div>'+
  '<div class="campaign-local-list">'+(rows||'<p class="muted">Crea tu primera campaña para verla aquí.</p>')+'</div>'+
  '<p class="muted tiny" style="margin-top:14px">Los importes son presupuestos introducidos por ti, no gasto realizado. No hay plataformas publicitarias conectadas.</p>'+
  '</div></div></section>';
}

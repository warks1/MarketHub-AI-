// MarketHub AI · benchmarking manual de competidores, sin rastreo ni APIs.
export const COMPETITOR_NETWORKS=['Instagram','TikTok','YouTube','LinkedIn','Facebook','X','Otra'];
export const competitorLimit=plan=>plan==='pro'?30:3;
const str=v=>String(v??'').trim();
const num=v=>{
 const t=str(v);
 if(!/^\d{1,10}$/.test(t))return null;
 const n=Number(t);
 return Number.isSafeInteger(n)&&n>=0&&n<=1_000_000_000?n:null;
};
export function validateCompetitor(raw={}){
 const name=str(raw.name).slice(0,90),network=str(raw.network);
 const followers=num(raw.followers),averageInteractions=num(raw.averageInteractions);
 if(!name)return {error:'Escribe el nombre del competidor.'};
 if(!COMPETITOR_NETWORKS.includes(network))return {error:'Selecciona una red social válida.'};
 if(followers===null)return {error:'Indica un número válido de seguidores, sin decimales.'};
 if(averageInteractions===null)return {error:'Indica interacciones medias por publicación, sin decimales.'};
 return {value:{name,network,followers,averageInteractions}};
}
export function competitorProxy(record){
 const followers=Number(record?.followers),interactions=Number(record?.averageInteractions);
 return Number.isFinite(followers)&&followers>0&&Number.isFinite(interactions)&&interactions>=0?
  Math.round(interactions/followers*10000)/100:null;
}
export function competitorsSummary(items=[]){
 const all=(Array.isArray(items)?items:[]).filter(x=>x&&typeof x==='object');
 const comparable=all.filter(c=>competitorProxy(c)!==null);
 return {total:all.length,withFollowers:comparable.length,
  averageFollowers:comparable.length?Math.round(comparable.reduce((s,c)=>s+Number(c.followers),0)/comparable.length):null,
  averageEngagementProxy:comparable.length?Math.round(comparable.reduce((s,c)=>s+competitorProxy(c),0)/comparable.length*100)/100:null};
}
export const findCompetitor=(items,id)=>Array.isArray(items)?items.find(c=>c&&String(c.id)===String(id))||null:null;
const escape=v=>str(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=v=>new Intl.NumberFormat('es-ES',{maximumFractionDigits:2}).format(v);
const ccell=x=>{
 const v=str(x).replace(/\0/g,'');
 return '"'+(/^[=+\-@]/.test(v)?"'"+v:v).replace(/"/g,'""')+'"';
};
export function competitorsToCSV(items){
 const header=['Nombre','Red','Seguidores (manual)','Interacciones medias por publicación (manual)','Ratio orientativo %','Fecha de registro'];
 const rows=(Array.isArray(items)?items:[]).filter(x=>x&&typeof x==='object').map(c=>
  [c.name,c.network,c.followers,c.averageInteractions,competitorProxy(c)??'',c.createdAt??'']);
 return '\uFEFF'+[header,...rows].map(r=>r.map(ccell).join(';')).join('\r\n')+'\r\n';
}
export function competitorsHTML({items=[],editingId=null,plan='free'}={}){
 const all=(Array.isArray(items)?items:[]).filter(x=>x&&typeof x==='object');
 const selected=findCompetitor(all,editingId),summary=competitorsSummary(all);
 const opts=COMPETITOR_NETWORKS.map(x=>'<option value="'+x+'"'+((selected?.network||'Instagram')===x?' selected':'')+'>'+x+'</option>').join('');
 const rows=[...all].sort((a,b)=>Number(b.followers)-Number(a.followers)).map(c=>{
  const ratio=competitorProxy(c);
  return '<div class="benchmark-row"><div class="benchmark-name"><strong>'+escape(c.name)+'</strong>'+
   '<small>'+escape(c.network)+' · Captura manual '+escape(c.createdAt||'')+'</small></div>'+
   '<div class="benchmark-value"><span>Seguidores</span><b>'+fmt(c.followers)+'</b></div>'+
   '<div class="benchmark-value"><span>Interacciones medias</span><b>'+fmt(c.averageInteractions)+'</b></div>'+
   '<div class="benchmark-value"><span>Ratio orientativo</span><b>'+(ratio===null?'—':fmt(ratio)+'%')+'</b></div>'+
   '<div class="benchmark-row-actions"><button type="button" class="secondary small-btn" data-action="competitor-edit" data-id="'+escape(c.id)+'">Editar</button>'+
   '<button type="button" class="secondary small-btn" data-action="competitor-delete" data-id="'+escape(c.id)+'">Eliminar</button></div></div>';
 }).join('');
 return '<section class="benchmark"><div class="benchmark-head"><div><span class="eyebrow">INTELIGENCIA COMPETITIVA · DATOS MANUALES</span>'+
 '<h1>◉ Análisis de competencia</h1><p>Compara cuentas y marcas utilizando cifras que tú registras. No se consulta ni rastrea ninguna red.</p></div>'+
 '<button class="secondary" type="button" data-action="competitor-export">Exportar comparación CSV</button></div>'+
 '<div class="benchmark-stats"><div><span>Competidores guardados</span><strong>'+summary.total+' / '+competitorLimit(plan)+'</strong></div>'+
 '<div><span>Seguidores medios registrados</span><strong>'+(summary.averageFollowers===null?'—':fmt(summary.averageFollowers))+'</strong></div>'+
 '<div><span>Ratio medio orientativo</span><strong>'+(summary.averageEngagementProxy===null?'—':fmt(summary.averageEngagementProxy)+'%')+'</strong></div></div>'+
 '<div class="benchmark-layout"><div class="card"><h2>'+(selected?'Editar competidor':'Registrar competidor')+'</h2>'+
 '<form id="competitorForm" class="benchmark-form">'+
 '<label for="competitorName">Nombre o cuenta</label><input class="input" id="competitorName" name="name" maxlength="90" required value="'+escape(selected?.name||'')+'" placeholder="Nombre de la marca">'+
 '<label for="competitorNetwork">Plataforma</label><select class="input" id="competitorNetwork" name="network">'+opts+'</select>'+
 '<label for="competitorFollowers">Seguidores registrados</label><input class="input" id="competitorFollowers" name="followers" type="number" min="0" max="1000000000" step="1" required value="'+escape(selected?.followers??0)+'">'+
 '<label for="competitorInteractions">Interacciones medias por publicación</label><input class="input" id="competitorInteractions" name="averageInteractions" type="number" min="0" max="1000000000" step="1" required value="'+escape(selected?.averageInteractions??0)+'">'+
 '<button type="submit" class="primary full">'+(selected?'Guardar cambios':'Guardar competidor')+'</button>'+
 (selected?'<button class="secondary full" type="button" data-action="competitor-cancel">Cancelar edición</button>':'')+
 '</form><p class="benchmark-note">Introducir estos valores no verifica su autenticidad. El ratio = interacciones medias / seguidores × 100. No equivale a la tasa de alcance ni a resultados certificados.</p></div>'+
 '<div class="card"><div class="card-head"><h2>Comparativa local</h2><span class="tag">'+all.length+' registros</span></div>'+
 '<div class="benchmark-records">'+(rows||'<p class="muted">No has registrado competidores. Añade la primera cuenta para compararla.</p>')+'</div>'+
 '<p class="benchmark-note">Sin conexiones oficiales, los datos dependen de su fecha de captura manual. Evita comparar periodos o definiciones de interacciones diferentes.</p>'+
 '</div></div></section>';
}

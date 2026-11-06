// MarketHub AI · formularios de estrategia y lectura segura de analítica importada.
import {planABSample,allocateBudget,reviewImportedMetrics} from './advanced-engines.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const number=(v,d=1)=>new Intl.NumberFormat('es-ES',{maximumFractionDigits:d}).format(Number(v)||0);
const money=v=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:2}).format(Number(v)||0);
const field=(label,name,value,attrs='')=>'<label class="engine-field"><span>'+esc(label)+'</span><input class="input" name="'+name+'" value="'+esc(value)+'" '+attrs+'></label>';
const select=(label,name,choices,selected)=>'<label class="engine-field"><span>'+esc(label)+'</span><select class="input" name="'+name+'">'+choices.map(([v,t])=>'<option value="'+v+'"'+(Number(v)===Number(selected)?' selected':'')+'>'+esc(t)+'</option>').join('')+'</select></label>';
const panel=(title,description,form,result)=>'<section class="card engine-panel"><div class="card-head"><h2>'+title+'</h2><span class="tag">Cálculo local</span></div><p class="tiny muted">'+description+'</p>'+form+'<div class="engine-result" aria-live="polite">'+result+'</div></section>';
const defaults=[{name:'Instagram',cpm:10,ctr:2,conversionRate:3},{name:'TikTok',cpm:8,ctr:1.5,conversionRate:2},{name:'Google Ads',cpm:18,ctr:3,conversionRate:5}];
function sampleResult(report){
 if(!report||typeof report!=='object'||!Number.isFinite(report.samplePerGroup))return '<p class="tiny muted">Calcula cuántas visitas podrías necesitar antes de realizar un experimento A/B.</p>';
 return '<div class="engine-score"><strong>'+number(report.samplePerGroup,0)+'</strong><span>Visitas aproximadas por variante</span></div>'+
 '<div class="engine-ab-metrics"><div>Visitas totales<strong>'+number(report.totalSample,0)+'</strong></div><div>Duración de captación<strong>'+number(report.days,0)+' días</strong></div><div>Conversión actual<strong>'+number(report.baselinePct,2)+' %</strong></div><div>Objetivo variante B<strong>'+number(report.expectedVariantPct,2)+' %</strong></div></div>'+
 '<p class="tiny muted">'+esc(report.caveat)+'</p>';
}
function allocationResult(report){
 if(!report||!Array.isArray(report.channels)||report.channels.length!==3)return '<p class="tiny muted">Estima una distribución de presupuesto a partir de tus supuestos, sin gastar dinero ni conectarte a ninguna plataforma.</p>';
 const rows=report.channels.map(c=>'<tr><th>'+esc(c.name)+'</th><td data-label="Porcentaje">'+number(c.share,2)+' %</td><td data-label="Presupuesto">'+money(c.allocation)+'</td><td data-label="Conversiones teóricas">'+number(c.expectedConversions,2)+'</td></tr>').join('');
 return '<div class="engine-score"><strong>'+money(report.totalAlloc)+'</strong><span>Presupuesto teórico distribuido</span></div>'+
 '<div class="engine-table-wrap"><table class="engine-table"><thead><tr><th>Canal</th><th>Porcentaje</th><th>Presupuesto</th><th>Conversiones teóricas</th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
 '<p class="tiny muted">'+(report.noSignal?'Los supuestos no ofrecen una tasa de conversión positiva. Se ha aplicado reparto equilibrado; no se puede elegir un canal ganador. ':'')+esc(report.caveat)+'</p>';
}
function importedResult(rows){
 const data=reviewImportedMetrics(rows);
 if(!data.available)return '<div class="empty">Todavía no hay métricas importadas. Abre Analítica, carga tu CSV y regresa aquí para comparar canales sin inventar cifras.</div>'+
 '<button type="button" class="secondary small-btn" data-page="analitica">Ir a Analítica e importar CSV</button>';
 const tableRows=data.channels.map(c=>'<tr><th>'+esc(c.name)+'</th><td data-label="Registros">'+number(c.records,0)+'</td><td data-label="Impresiones">'+number(c.impresiones,0)+'</td><td data-label="Clics">'+number(c.clics,0)+'</td><td data-label="CTR">'+(c.ctr===null?'No calculable':number(c.ctr,2)+' %')+'</td><td data-label="Interacciones / alcance">'+(c.interactionReach===null?'No calculable':number(c.interactionReach,2)+' %')+'</td></tr>').join('');
 return '<div class="engine-score"><strong>'+number(data.records,0)+'</strong><span>Filas aportadas · '+number(data.days,0)+' días con datos</span></div>'+
 (data.leader?'<p><strong>CTR observado más alto:</strong> '+esc(data.leader.name)+' ('+number(data.leader.ctr,2)+' %; al menos 100 impresiones). No indica por sí solo ventas ni rentabilidad.</p>':'<p class="muted tiny">No hay datos suficientes para destacar un canal por CTR (mínimo orientativo: 100 impresiones).</p>')+
 '<div class="engine-table-wrap"><table class="engine-table"><thead><tr><th>Canal</th><th>Registros</th><th>Impresiones</th><th>Clics</th><th>CTR</th><th>Interacciones / alcance</th></tr></thead><tbody>'+tableRows+'</tbody></table></div>'+
 '<ul class="engine-checks">'+data.notes.map(n=>'<li class="pass">'+esc(n)+'</li>').join('')+'</ul>'+
 '<div class="engine-actions"><button type="button" class="secondary small-btn" data-page="analitica">Abrir datos de Analítica</button><button type="button" class="secondary small-btn" data-growth-action="engine-adv-export-analytics">Descargar diagnóstico TXT</button></div>';
}
export function advancedLabPage(_plan,stored={},importedRows=[]){
 const obj=x=>x&&typeof x==='object'&&!Array.isArray(x)?x:{};
 const s=obj(stored),sample=obj(s.sample),allocation=obj(s.allocation);
 const si=obj(sample.input),ai=obj(allocation.input),channelInputs=Array.isArray(ai.channels)&&ai.channels.length===3?ai.channels:defaults;
 const channelForms=channelInputs.map((c,i)=>'<fieldset class="engine-channel"><legend>Canal '+(i+1)+'</legend><div class="engine-fields">'+
 field('Nombre del canal','advName'+i,c.name??defaults[i].name,'required maxlength="50"')+
 field('CPM (€)','advCpm'+i,c.cpm??defaults[i].cpm,'type="number" min="0.01" max="100000" step="any" required')+
 field('CTR (%)','advCtr'+i,c.ctr??defaults[i].ctr,'type="number" min="0" max="100" step="any" required')+
 field('Conversión clic → objetivo (%)','advCvr'+i,c.conversionRate??defaults[i].conversionRate,'type="number" min="0" max="100" step="any" required')+
 '</div></fieldset>').join('');
 return '<div class="engine-advanced">'+
 '<div class="card engine-section-head"><h2>Más motores de estrategia</h2><p class="tiny muted">La planificación no activa anuncios ni garantiza ventas. Los cálculos utilizan datos y supuestos introducidos por ti.</p></div>'+
 '<div class="engine-grid">'+
 panel('▤ Tamaño de muestra A/B','Calcula una muestra orientativa para dos variantes antes de lanzar una prueba; no mira resultados existentes.',
 '<form id="growth-engine-adv-sample" class="engine-form"><div class="engine-fields">'+
 field('Conversión actual (%)','advBaseline',si.baselinePct??5,'type="number" min="0.01" max="80" step="any" required')+
 field('Mejora relativa mínima detectable (%)','advLift',si.liftPct??20,'type="number" min="0.5" max="200" step="any" required')+
 field('Visitas diarias entre las dos variantes','advDaily',si.trafficDaily??500,'type="number" min="1" max="100000000" step="1" required')+
 select('Nivel de confianza','advConfidence',[[95,'95 %'],[99,'99 %']],si.confidence??95)+
 select('Potencia','advPower',[[80,'80 %'],[90,'90 %']],si.power??80)+
 '</div><button class="primary" type="submit">Estimar muestra necesaria</button></form>',sampleResult(sample.report))+
 panel('◉ Repartidor de presupuesto','Prioriza conversiones modeladas por euro, con un porcentaje máximo por canal. No extrapola rendimientos ni contempla saturación.',
 '<form id="growth-engine-adv-allocate" class="engine-form"><div class="engine-fields">'+
 field('Presupuesto total (€)','advBudget',ai.budget??1000,'type="number" min="1" max="10000000" step="any" required')+
 field('Máximo por canal (%)','advMaxShare',ai.maxShare??60,'type="number" min="34" max="100" step="any" required')+
 '</div>'+channelForms+'<button class="primary" type="submit">Calcular reparto teórico</button></form>',allocationResult(allocation.report))+
 panel('▥ Inteligencia de canales con tus datos','Lee únicamente las métricas CSV ya importadas en Analítica; compara CTR y participación sin inventar ingresos, conversiones ni horas.',
 '',importedResult(importedRows))+
 '</div><div class="engine-actions"><button type="button" class="secondary small-btn" data-growth-action="engine-adv-export">Descargar informe de planificación TXT</button></div></div>';
}
const cut=(value,n)=>String(value??'').trim().slice(0,n);
export function advancedLabSubmit(form,data,ctx,commit){
 if(!form?.id?.startsWith('growth-engine-adv-'))return false;
 const f=new FormData(form),value=name=>f.get(name);
 try{
  const prev=data.engines&&typeof data.engines==='object'&&!Array.isArray(data.engines)?data.engines:{};
  const adv=prev.advanced&&typeof prev.advanced==='object'&&!Array.isArray(prev.advanced)?prev.advanced:{};
  if(form.id==='growth-engine-adv-sample'){
   const input={baselinePct:value('advBaseline'),liftPct:value('advLift'),trafficDaily:value('advDaily'),
    confidence:value('advConfidence'),power:value('advPower')};
   const report=planABSample(input);
   adv.sample={input:{baselinePct:report.baselinePct,liftPct:report.liftPct,trafficDaily:report.trafficDaily,
    confidence:report.confidence,power:report.power},report};
  }else if(form.id==='growth-engine-adv-allocate'){
   const input={budget:value('advBudget'),maxShare:value('advMaxShare'),
    channels:Array.from({length:3},(_,i)=>({name:cut(value('advName'+i),50),
    cpm:value('advCpm'+i),ctr:value('advCtr'+i),conversionRate:value('advCvr'+i)}))};
   const report=allocateBudget(input);
   adv.allocation={input:{budget:report.budget,maxShare:report.maxShare,
    channels:report.channels.map(({name,cpm,ctr,conversionRate})=>({name,cpm,ctr,conversionRate}))},report};
  }else return false;
  prev.advanced=adv;data.engines=prev;
  commit(ctx,'Planificación calculada y guardada en tu dispositivo.');
 }catch(error){ctx.toast('Corrige los valores: '+String(error.message||error).slice(0,130))}
 return true;
}
const metricReport=rows=>{
 const r=reviewImportedMetrics(rows);
 if(!r.available)return 'No hay CSV de métricas importado.\n';
 return ['DATOS IMPORTADOS POR EL USUARIO','Registros: '+r.records,'Días registrados: '+r.days,
  ...r.channels.map(c=>c.name+': '+c.impresiones+' impresiones, '+c.clics+' clics, CTR '+(c.ctr===null?'N/D':number(c.ctr,2)+' %')),
  ...r.notes].join('\n');
};
export function advancedLabClick(target,data,ctx,download){
 const action=target?.dataset?.growthAction||'';
 if(!['engine-adv-export','engine-adv-export-analytics'].includes(action))return false;
 const s=data.engines?.advanced||{};
 const lines=['MARKETHUB AI · INFORME DE ESTRATEGIA LOCAL','Cálculos teóricos; no hay conexión a redes ni IA generativa.',''];
 if(action==='engine-adv-export-analytics'){
  lines.push(metricReport(ctx.analyticsRows||[]));
 }else{
  if(s.sample?.report){
   const r=s.sample.report;
   lines.push('PLANIFICACIÓN A/B','Visitas por variante: '+r.samplePerGroup,
    'Visitas totales: '+r.totalSample,'Días estimados de captación: '+r.days,r.caveat,'');
  }
  if(s.allocation?.report){
   const r=s.allocation.report;
   lines.push('ASIGNACIÓN TEÓRICA DE INVERSIÓN',...r.channels.map(x=>x.name+': '+number(x.share,2)+' % · '+money(x.allocation)+' · '+number(x.expectedConversions,2)+' conversiones teóricas'),r.caveat,'');
  }
  lines.push(metricReport(ctx.analyticsRows||[]));
 }
 try{
  download(action==='engine-adv-export-analytics'?'MarketHub-Analitica-Local.txt':'MarketHub-Estrategia.txt',lines.join('\n'),'text/plain;charset=utf-8');
  ctx.toast('Informe local descargado. Ningún dato se ha enviado a servidores.');
 }catch(error){ctx.toast('No se pudo generar el informe: '+String(error.message||error).slice(0,90))}
 return true;
}

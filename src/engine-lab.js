// MarketHub AI · interfaz y controladores del laboratorio de motores locales.
// Las salidas son diagnósticos y escenarios, no datos de redes ni IA generativa.
import {analyzeCreative,generateCopyVariants,forecastScenarios,compareAB} from './marketing-engines.js';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;',"'":'&#39;'}[c]));
const field=(title,name,value='',attrs='')=>'<label class="engine-field"><span>'+title+'</span><input class="input" name="'+name+'" value="'+esc(value)+'" '+attrs+'></label>';
const area=(title,name,value='',attrs='')=>'<label class="engine-field"><span>'+title+'</span><textarea class="input" name="'+name+'" '+attrs+'>'+esc(value)+'</textarea></label>';
const select=(title,name,choices,selected)=>'<label class="engine-field"><span>'+title+'</span><select class="input" name="'+name+'">'+choices.map(v=>'<option value="'+esc(v)+'"'+(v===selected?' selected':'')+'>'+esc(v)+'</option>').join('')+'</select></label>';
const euro=n=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:2}).format(n);
const dec=(n,d=1)=>new Intl.NumberFormat('es-ES',{maximumFractionDigits:d}).format(n);
const pct=(n,d=2)=>dec(100*n,d)+' %';
const box=(title,note,form,result)=>'<section class="card engine-panel"><div class="card-head"><h2>'+title+'</h2><span class="tag">Motor local</span></div><p class="tiny muted">'+note+'</p>'+form+'<div class="engine-result" aria-live="polite">'+result+'</div></section>';
const channels=['Instagram','TikTok','Facebook','LinkedIn','YouTube','X','Email'];
export function engineLabPage(plan,stored={}){
 const s=stored&&typeof stored==='object'?stored:{};
 const creative=s.creative||{},copies=s.copies||{},forecast=s.forecast||{},ab=s.ab||{};
 const isPro=plan==='pro';
 const auditResult=creative.report?
  '<div class="engine-score"><strong>'+esc(creative.report.score)+'/100</strong><span>Calidad editorial orientativa</span><span>'+esc(creative.report.words)+' palabras · '+esc(creative.report.readingSeconds)+' s aprox. · '+esc(creative.report.hashtags)+' etiquetas</span></div>'+
  '<ul class="engine-checks">'+creative.report.checks.map(x=>'<li class="'+(x.pass?'pass':'review')+'">'+(x.pass?'✓ ':'• ')+esc(x.message)+'</li>').join('')+'</ul>':'<p class="muted tiny">Analiza un texto para ver criterios verificables y recomendaciones.</p>';
 const copyResult=Array.isArray(copies.variants)&&copies.variants.length?
  '<div class="engine-variants">'+copies.variants.map((x,i)=>'<div class="engine-variant"><label for="engine-variant-'+i+'">'+esc(x.name)+' · '+esc(x.channel)+'</label><textarea class="input" id="engine-variant-'+i+'" maxlength="1700" rows="5">'+esc(x.text)+'</textarea><button type="button" class="secondary small-btn" data-growth-action="engine-copy" data-id="'+i+'">Copiar variante</button></div>').join('')+'</div>'+
  '<div class="engine-actions"><button type="button" class="secondary small-btn" data-growth-action="engine-save-copies">Guardar ediciones</button><button type="button" class="secondary small-btn" data-growth-action="engine-export-copies">Descargar TXT</button></div>'+
  '<p class="tiny muted">Los textos son plantillas por reglas, no contenidos generados por un modelo de IA. Revisa datos, estilo y promesas.</p>':
  '<p class="muted tiny">Introduce una idea y el motor producirá variantes editables.</p>';
 const inputs=forecast.input||{};
 const foreResult=Array.isArray(forecast.report?.scenarios)?
  '<div class="engine-table-wrap"><table class="engine-table"><thead><tr><th>Escenario</th><th>Impresiones</th><th>Clics</th><th>Conversiones</th><th>Ingresos</th><th>ROAS</th><th>Margen menos inversión</th></tr></thead><tbody>'+
  forecast.report.scenarios.map(x=>'<tr><th>'+esc(x.name)+'</th><td>'+dec(x.impressions,0)+'</td><td>'+dec(x.clicks,0)+'</td><td>'+dec(x.conversions,1)+'</td><td>'+euro(x.revenue)+'</td><td>'+dec(x.roas,2)+'×</td><td>'+euro(x.netContribution)+'</td></tr>').join('')+
  '</tbody></table></div><p class="tiny muted">Conversiones para cubrir inversión con margen bruto: '+(forecast.report.breakEvenConversions===null?'No calculables':dec(forecast.report.breakEvenConversions,1))+'. El modelo no contempla otros costes, devoluciones ni atribución.</p>':
  '<p class="tiny muted">Calcula escenarios conservador, base y optimista con supuestos editables.</p>';
 const abResult=ab.report?
  '<div class="engine-score"><strong>'+esc(ab.report.winner)+'</strong><span>Interpretación estadística (aproximación normal, 95 %)</span></div>'+
  '<div class="engine-ab-metrics"><div>Tasa A <strong>'+pct(ab.report.rateA)+'</strong></div><div>Tasa B <strong>'+pct(ab.report.rateB)+'</strong></div><div>Diferencia B − A <strong>'+dec(ab.report.difference*100,2)+' pp</strong></div><div>Valor p bilateral <strong>'+dec(ab.report.pValue,4)+'</strong></div></div>'+
  '<p class="tiny muted">Intervalo aproximado de diferencia al 95 %: '+dec(ab.report.interval95[0]*100,2)+' a '+dec(ab.report.interval95[1]*100,2)+' puntos. '+(ab.report.sufficient?'Muestras mínimas para esta aproximación superadas.':'Muestras insuficientes para fiarse de la aproximación normal.')+' No sustituye un diseño experimental válido, ni corrige pruebas repetidas.</p>':
  '<p class="tiny muted">Introduce visitas y conversiones reales de un experimento A/B; no se descargan datos externos.</p>';
 return '<div class="engine-lab">'+
 '<div class="notice"><strong>Motores operativos en tu navegador.</strong> Cálculos y plantillas propios, sin IA externa, sin acceso a redes ni publicación automática. FREE: 2 variantes; PRO de demostración: hasta 5. Los resultados se guardan en el almacenamiento local y se incluyen en la copia integral.</div>'+
 '<div class="engine-grid">'+
 box('✦ Auditor de copy PULSE','7 comprobaciones editoriales ponderadas. No es un algoritmo de Instagram ni certifica cumplimiento.',
 '<form id="growth-engine-creative" class="engine-form">'+
 area('Texto para revisar','engineCreativeText',creative.text||'','required maxlength="6000" rows="5"')+
 '<div class="engine-fields">'+field('Palabra clave (opcional)','engineCreativeKeyword',creative.keyword||'','maxlength="100"')+select('Canal','engineCreativeChannel',channels,creative.channel||'Instagram')+'</div>'+
 '<button type="submit" class="primary">Auditar copy</button></form>',auditResult)+
 box('✧ Motor multivariantes','Genera textos diferentes con reglas transparentes y permite editarlos y descargarlos.',
 '<form id="growth-engine-copies" class="engine-form">'+
 area('Idea principal','engineIdea',copies.idea||'','required maxlength="650" rows="3"')+
 '<div class="engine-fields">'+field('Público objetivo','engineAudience',copies.audience||'','required maxlength="130"')+field('Marca','engineBrand',copies.brand||'','maxlength="100"')+
 field('Oferta o valor','engineOffer',copies.offer||'','maxlength="240"')+field('Llamada a la acción','engineCta',copies.cta||'','maxlength="100"')+
 select('Canal','engineChannel',channels,copies.channel||'Instagram')+'</div>'+
 '<button type="submit" class="primary">Crear '+(isPro?'5':'2')+' variantes</button></form>',copyResult)+
 box('◎ Motor de embudo y presupuesto','Escenarios teóricos a partir de CPM, CTR, conversión, ticket y margen aportados por ti. No predice campañas reales.',
 '<form id="growth-engine-forecast" class="engine-form"><div class="engine-fields">'+
 field('Presupuesto (€)','engineBudget',inputs.budget??1000,'type="number" min="0.01" step="any" required')+
 field('CPM (€ por 1000 impresiones)','engineCpm',inputs.cpm??10,'type="number" min="0.01" step="any" required')+
 field('CTR (%)','engineCtr',inputs.ctr??2,'type="number" min="0" max="100" step="any" required')+
 field('Conversión de clic a venta (%)','engineConversion',inputs.conversionRate??3,'type="number" min="0" max="100" step="any" required')+
 field('Ingreso por venta (€)','engineTicket',inputs.ticket??75,'type="number" min="0" step="any" required')+
 field('Margen bruto (%)','engineMargin',inputs.margin??40,'type="number" min="0" max="100" step="any" required')+
 '</div><button type="submit" class="primary">Calcular escenarios</button></form>',foreResult)+
 box('▥ Motor estadístico A/B','Compara tasas de conversión con una prueba bilateral aproximada. Evita declarar ganadores sin muestra suficiente.',
 '<form id="growth-engine-ab" class="engine-form"><div class="engine-fields">'+
 field('Visitas A','engineVisitsA',ab.input?.visitsA??1000,'type="number" min="1" step="1" required')+
 field('Conversiones A','engineConvertsA',ab.input?.convertsA??100,'type="number" min="0" step="1" required')+
 field('Visitas B','engineVisitsB',ab.input?.visitsB??1000,'type="number" min="1" step="1" required')+
 field('Conversiones B','engineConvertsB',ab.input?.convertsB??120,'type="number" min="0" step="1" required')+
 '</div><button type="submit" class="primary">Comparar variantes</button></form>',abResult)+
 '</div><div class="engine-actions"><button type="button" class="secondary small-btn" data-growth-action="engine-export-report">Descargar informe de motores (.txt)</button></div></div>';
}
const get=(f,key)=>f.get(key);
const cut=(v,n)=>String(v??'').trim().slice(0,n);
export function engineLabSubmit(form,plan,data,ctx,commit){
 if(!form?.id?.startsWith('growth-engine-'))return false;
 const f=new FormData(form);const s=data.engines&&typeof data.engines==='object'?data.engines:{};
 try{
  if(form.id==='growth-engine-creative'){
   const text=cut(get(f,'engineCreativeText'),6000),keyword=cut(get(f,'engineCreativeKeyword'),100),channel=cut(get(f,'engineCreativeChannel'),40);
   s.creative={text,keyword,channel,report:analyzeCreative(text,{keyword,channel})};
  }else if(form.id==='growth-engine-copies'){
   const input={idea:cut(get(f,'engineIdea'),650),audience:cut(get(f,'engineAudience'),130),brand:cut(get(f,'engineBrand'),100),
    offer:cut(get(f,'engineOffer'),240),cta:cut(get(f,'engineCta'),100),channel:cut(get(f,'engineChannel'),40)};
   s.copies={...input,variants:generateCopyVariants(input,plan==='pro'?5:2)};
  }else if(form.id==='growth-engine-forecast'){
   const input={budget:get(f,'engineBudget'),cpm:get(f,'engineCpm'),ctr:get(f,'engineCtr'),conversionRate:get(f,'engineConversion'),ticket:get(f,'engineTicket'),margin:get(f,'engineMargin')};
   const report=forecastScenarios(input);
   s.forecast={input:report.input,report};
  }else if(form.id==='growth-engine-ab'){
   const input={visitsA:get(f,'engineVisitsA'),convertsA:get(f,'engineConvertsA'),visitsB:get(f,'engineVisitsB'),convertsB:get(f,'engineConvertsB')};
   const report=compareAB(input);s.ab={input:{visitsA:report.visitsA,convertsA:report.convertsA,visitsB:report.visitsB,convertsB:report.convertsB},report};
  }else return false;
  data.engines=s;commit(ctx,'Motor calculado y guardado localmente.');
 }catch(error){ctx.toast('Comprueba los campos: '+String(error.message||error).slice(0,120))}
 return true;
}
function captureEdits(data){
 if(!Array.isArray(data.engines?.copies?.variants))return;
 for(let i=0;i<data.engines.copies.variants.length;i++){
  const el=document.getElementById('engine-variant-'+i);
  if(el)data.engines.copies.variants[i].text=cut(el.value,1700);
 }
}
function getReport(s){
 const lines=['MARKETHUB AI · INFORME DE MOTORES LOCALES','Resultado orientativo, sin IA ni datos de redes.',''];
 if(s.creative?.report){lines.push('AUDITOR DE COPY','Puntuación: '+s.creative.report.score+'/100',...s.creative.report.checks.map(x=>(x.pass?'OK: ':'REVISAR: ')+x.message),'')}
 if(s.copies?.variants?.length){lines.push('VARIANTES',...s.copies.variants.flatMap(x=>[x.name,x.text,'']))}
 if(s.forecast?.report?.scenarios?.length){lines.push('EMBUDO TEÓRICO',...s.forecast.report.scenarios.map(x=>x.name+': impresiones '+dec(x.impressions,0)+', clics '+dec(x.clicks,0)+', conversiones '+dec(x.conversions,1)+', ingresos '+euro(x.revenue)+', resultado bruto menos inversión '+euro(x.netContribution)),'')}
 if(s.ab?.report){lines.push('TEST A/B','Resultado: '+s.ab.report.winner,'Tasas: '+pct(s.ab.report.rateA)+' vs '+pct(s.ab.report.rateB),'Valor p aproximado: '+dec(s.ab.report.pValue,4),'')}
 return lines.join('\n');
}
export function engineLabClick(target,data,ctx,{commit,copyText,download}){
 const action=target?.dataset?.growthAction||'';
 if(!action.startsWith('engine-'))return false;
 const s=data.engines||{};
 if(action==='engine-save-copies'||action==='engine-export-copies'||action==='engine-export-report'){
  captureEdits(data);
  if(action==='engine-save-copies'){commit(ctx,'Ediciones de variantes guardadas.');return true}
  if(action==='engine-export-copies'){
   if(!s.copies?.variants?.length){ctx.toast('Genera primero alguna variante.');return true}
   download('MarketHub-Variantes.txt',s.copies.variants.map(x=>x.name+'\n'+x.text).join('\n\n'),'text/plain;charset=utf-8');
  }else download('MarketHub-Motores-Informe.txt',getReport(s),'text/plain;charset=utf-8');
  commit(ctx,'Informe preparado y datos conservados localmente.');return true;
 }
 if(action==='engine-copy'){
  const i=Number(target.dataset.id),variant=s.copies?.variants?.[i];
  if(!Number.isInteger(i)||i<0||!variant)return true;
  const text=document.getElementById('engine-variant-'+i)?.value||variant.text;
  copyText(cut(text,1700),ctx);return true;
 }
 return false;
}

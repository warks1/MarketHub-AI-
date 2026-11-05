// MarketHub AI · Importación local de métricas de marketing, sin conexión a redes.
const MAX_ROWS=2500;
export const analyticsNetworks=['Instagram','TikTok','YouTube','Facebook','LinkedIn','X','Otra'];
const headers=['fecha','plataforma','alcance','impresiones','interacciones','clics'];
export const analyticsCsvTemplate='\uFEFF'+headers.join(';')+'\r\n';
function parseLine(raw,delimiter){
 const out=[];let cell='',quoted=false;
 for(let i=0;i<raw.length;i++){
  const c=raw[i];
  if(c==='"'){if(quoted&&raw[i+1]==='"'){cell+='"';i++}else quoted=!quoted}
  else if(c===delimiter&&!quoted){out.push(cell);cell=''}
  else cell+=c;
 }
 if(quoted)throw Error('Comillas sin cerrar en una fila.');
 out.push(cell);
 return out.map(x=>x.trim());
}
function parseCSVRows(text){
 const src=String(text??'').replace(/^\uFEFF/,'').replace(/\r\n/g,'\n').replace(/\r/g,'\n');
 // Se aceptan saltos de línea y comillas dobles que pueden contener saltos internos.
 const lines=[];let buf='',quoted=false;
 for(let i=0;i<src.length;i++){
  const c=src[i];
  if(c==='"'){buf+=c;if(quoted&&src[i+1]==='"'){buf+=src[++i]}else quoted=!quoted;continue}
  if(c==='\n'&&!quoted){if(buf.trim())lines.push(buf);buf='';continue}
  buf+=c;
 }
 if(quoted)throw Error('El archivo CSV contiene comillas sin cerrar.');
 if(buf.trim())lines.push(buf);
 return lines;
}
function dateValid(d){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(d))return false;
 const t=new Date(d+'T12:00:00Z');
 return Number.isFinite(t.valueOf())&&t.toISOString().slice(0,10)===d;
}
const numeric=v=>{
 const x=String(v??'').trim();
 if(!/^\d{1,10}(?:[.,]\d{1,3})?$/.test(x))return null;
 const n=Number(x.replace(',','.'));
 return Number.isFinite(n)&&n>=0&&n<=1000000000?n:null;
};
export function parseAnalyticsCSV(text){
 if(typeof text!=='string'||text.length>1500000)throw Error('Archivo CSV demasiado grande (máximo 1,5 MB).');
 const lines=parseCSVRows(text);
 if(lines.length<2)throw Error('Añade filas de datos a la plantilla CSV.');
 if(lines.length>MAX_ROWS+1)throw Error('El CSV supera las 2.500 filas permitidas.');
 const delimiter=lines[0].includes(';')?';':',';
 const cols=parseLine(lines[0],delimiter).map(x=>x.toLocaleLowerCase('es'));
 const indexes=headers.map(n=>cols.indexOf(n));
 if(indexes.some(v=>v<0))throw Error('Columnas necesarias: '+headers.join(', ')+'.');
 const rows=[];
 for(let i=1;i<lines.length;i++){
  const cells=parseLine(lines[i],delimiter),get=n=>cells[indexes[headers.indexOf(n)]]??'';
  const date=get('fecha'),platform=get('plataforma');
  if(!dateValid(date))throw Error('Fecha incorrecta en la línea '+(i+1)+': usa AAAA-MM-DD.');
  if(platform.length>35||!analyticsNetworks.includes(platform))throw Error('Plataforma no válida en la línea '+(i+1)+'.');
  const metrics={};
  for(const name of headers.slice(2)){
   const value=numeric(get(name));
   if(value===null)throw Error('Número no válido en '+name+', línea '+(i+1)+'.');
   metrics[name]=value;
  }
  rows.push({fecha:date,plataforma:platform,...metrics});
 }
 return rows;
}
export function summarizeAnalytics(rows){
 const data=Array.isArray(rows)?rows.filter(x=>x&&typeof x==='object'):[];
 const total={registros:data.length,alcance:0,impresiones:0,interacciones:0,clics:0,plataformas:{}};
 const byDate={};
 for(const row of data){
  const plat=String(row.plataforma||'Otra');
  if(!total.plataformas[plat])total.plataformas[plat]={alcance:0,impresiones:0,interacciones:0,clics:0};
  for(const k of ['alcance','impresiones','interacciones','clics']){
   const v=Number.isFinite(Number(row[k]))?Math.max(0,Number(row[k])):0;
   total[k]+=v;total.plataformas[plat][k]+=v;
   if(k==='alcance')byDate[row.fecha]=(byDate[row.fecha]||0)+v;
  }
 }
 total.periodo=Object.entries(byDate).sort((a,b)=>a[0].localeCompare(b[0]));
 total.tasaInteraccion=total.alcance>0?100*total.interacciones/total.alcance:null;
 return total;
}
const esc=v=>String(v??'').replace(/[&<>"']/g,k=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[k]));
const number=v=>new Intl.NumberFormat('es-ES',{maximumFractionDigits:1}).format(v||0);
function metric(title,value,explanation){
 return '<div class="analytics-local-metric"><span>'+title+'</span><strong>'+value+'</strong><small>'+explanation+'</small></div>';
}
function trendSvg(periodo){
 if(!periodo.length)return '<p>No hay fechas registradas.</p>';
 const n=periodo.length,max=Math.max(1,...periodo.map(x=>x[1]));
 const pts=periodo.map(([date,v],i)=>{
  const x=n===1?50:(i/(n-1))*95+2.5;
  const y=94-80*(v/max);
  return {date,v,x,y};
 });
 const path=pts.map((p,i)=>(i?'L':'M')+p.x.toFixed(2)+' '+p.y.toFixed(2)).join(' ');
 return '<svg class="analytics-local-chart" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Evolución del alcance importado por fecha"><path d="M0 95H100 M0 55H100 M0 15H100" stroke="#375d99" stroke-width=".65" fill="none"/>'+
 '<path d="'+path+'" fill="none" stroke="#10ecff" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>'+
 pts.map(p=>'<circle cx="'+p.x.toFixed(2)+'" cy="'+p.y.toFixed(2)+'" r="1.3" fill="#f94be3" stroke="#eafaff" stroke-width=".4"/>').join('')+'</svg>'+
 '<div class="analytics-local-dates"><span>'+esc(pts[0].date)+'</span><span>'+esc(pts[pts.length-1].date)+'</span></div>';
}
export function analyticsLocalHTML(rows=[]){
 const safeRows=Array.isArray(rows)?rows.filter(r=>r&&typeof r==='object'):[];
 const total=summarizeAnalytics(safeRows);
 const rate=total.tasaInteraccion===null?'—':number(total.tasaInteraccion)+'%';
 const networks=Object.entries(total.plataformas).sort((a,b)=>b[1].alcance-a[1].alcance);
 return '<section class="analytics-local"><div class="analytics-local-head"><div><span class="eyebrow">MIS DATOS · IMPORTACIÓN EN EL DISPOSITIVO</span><h2>Analítica con datos propios</h2>'+
 '<p>Importa cifras de tus informes CSV; no se consultan cuentas ni se envían datos a ningún servidor.</p></div>'+
 '<button type="button" class="secondary" data-action="analytics-template">Descargar plantilla CSV</button></div>'+
 '<div class="analytics-local-upload"><label for="analyticsCsv">Archivo CSV de métricas</label>'+
 '<input id="analyticsCsv" type="file" accept=".csv,text/csv" data-analytics-file>'+
 '<p>Columnas: fecha, plataforma, alcance, impresiones, interacciones, clics. Fecha AAAA-MM-DD; separador «;» o «,». Máximo 1,5 MB y 2.500 filas.</p>'+
 (safeRows.length?'<button type="button" class="secondary small-btn" data-action="analytics-clear">Eliminar registros locales</button>':'')+'</div>'+
 (safeRows.length?
 '<div class="analytics-local-metrics">'+metric('Alcance',number(total.alcance),'Suma de filas importadas')+
 metric('Impresiones',number(total.impresiones),'Suma de filas importadas')+
 metric('Interacciones',number(total.interacciones),'Suma de filas importadas')+
 metric('Clics',number(total.clics),'Suma de filas importadas')+
 metric('Interacciones / alcance',rate,'Cálculo simple orientativo')+'</div>'+
 '<div class="analytics-local-grid"><div><h3>Alcance por fecha</h3>'+trendSvg(total.periodo)+'</div>'+
 '<div><h3>Desglose por plataforma</h3><div class="analytics-local-networks">'+networks.map(([name,x])=>
 '<div><b>'+esc(name)+'</b><span>'+number(x.alcance)+' alcance</span><small>'+number(x.interacciones)+' interacciones</small></div>').join('')+'</div></div></div>'+
 '<p class="analytics-local-note">Resultados derivados únicamente de '+safeRows.length+' filas importadas. Los KPI de demostración mostrados arriba no corresponden a estos datos.</p>':
 '<p class="analytics-local-empty">Importa una plantilla completa para visualizar tus métricas reales sin conectar redes. Los gráficos superiores siguen siendo ejemplos.</p>')+
 '</section>';
}

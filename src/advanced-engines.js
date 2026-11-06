// MarketHub AI · Motores avanzados locales: decisiones basadas en hipótesis y CSV.
const numeric=(v,label,min,max,integer=false)=>{
 if(v===null||v===undefined||String(v).trim()==='')throw new RangeError(label+' es obligatorio.');
 const x=Number(v);
 if(!Number.isFinite(x)||x<min||x>max||(integer&&!Number.isInteger(x)))
  throw new RangeError(label+' fuera de rango.');
 return x;
};
export function planABSample(input={}){
 const baselinePct=numeric(input.baselinePct,'Conversión base (%)',0.01,80);
 const liftPct=numeric(input.liftPct,'Mejora mínima relativa (%)',0.5,200);
 const trafficDaily=numeric(input.trafficDaily,'Visitas diarias',1,100000000,true);
 const confidence=numeric(input.confidence??95,'Confianza',95,99,true);
 const power=numeric(input.power??80,'Potencia',80,90,true);
 if(![95,99].includes(confidence)||![80,90].includes(power))throw new RangeError('Confianza o potencia no admitida.');
 const a=baselinePct/100,b=a*(1+liftPct/100);
 if(b>=1)throw new RangeError('La conversión objetivo debe ser menor al 100 %. Revisa la mejora relativa.');
 const critical=confidence===95?1.959963984540054:2.5758293035489004;
 const zPower=power===80?.8416212335729143:1.2815515655446004;
 const pool=(a+b)/2;
 const numerator=critical*Math.sqrt(2*pool*(1-pool))+zPower*Math.sqrt(a*(1-a)+b*(1-b));
 const samplePerGroup=Math.ceil(numerator*numerator/(b-a)**2);
 if(!Number.isFinite(samplePerGroup)||samplePerGroup>1000000000)throw new RangeError('La muestra necesaria supera el límite calculable. Amplía la mejora objetivo.');
 return {baselinePct,liftPct,trafficDaily,confidence,power,expectedVariantPct:b*100,
  samplePerGroup,totalSample:samplePerGroup*2,
  days:Math.ceil(samplePerGroup*2/trafficDaily),
  caveat:'Estimación por aproximación normal de dos proporciones, asignación 50/50. No incluye estacionalidad, grupos repetidos ni paradas tempranas.'};
}
const defaults=['Instagram','TikTok','Google Ads'];
export function allocateBudget(input={}){
 const budget=numeric(input.budget,'Presupuesto (€)',1,10000000);
 const maxShare=numeric(input.maxShare??60,'Máximo por canal (%)',34,100);
 if(!Array.isArray(input.channels)||input.channels.length!==3)throw new RangeError('Se requieren exactamente tres canales.');
 const seen=new Set();
 const channels=input.channels.map((raw,i)=>{
  const name=String(raw?.name??defaults[i]).trim().slice(0,50);
  if(!name||seen.has(name.toLocaleLowerCase('es')))throw new RangeError('Los tres canales deben tener nombres diferentes.');
  seen.add(name.toLocaleLowerCase('es'));
  const cpm=numeric(raw.cpm,'CPM de '+name,0.01,100000);
  const ctr=numeric(raw.ctr,'CTR de '+name,0,100);
  const conversionRate=numeric(raw.conversionRate,'Conversión de '+name,0,100);
  const efficiency=1000/cpm*ctr/100*conversionRate/100;
  return {name,cpm,ctr,conversionRate,efficiency,share:0};
 });
 // Solo asigna presupuesto teórico a canales de conversión estimada cuando hay diferencias.
 const ordered=[...channels].sort((a,b)=>b.efficiency-a.efficiency||a.name.localeCompare(b.name));
 let left=1;
 if(ordered.every(c=>c.efficiency===0)){
  // Sin señal en los supuestos: no proclamar ganadores; reparto lo más equilibrado posible.
  for(const c of ordered){const proportion=Math.min(maxShare/100,1/channels.length);c.share=proportion;left-=proportion}
 }
 for(const c of ordered){
  const extra=Math.min(Math.max(0,left),maxShare/100-c.share);
  c.share+=extra;left-=extra;
 }
 if(left>1e-9)throw new RangeError('No es posible cubrir el presupuesto con el máximo indicado.');
 const rows=channels.map(c=>({...c,share:c.share*100,allocation:budget*c.share,expectedConversions:budget*c.share*c.efficiency}));
 return {budget,maxShare,channels:rows,totalAlloc:rows.reduce((t,c)=>t+c.allocation,0),
  totalExpectedConversions:rows.reduce((t,c)=>t+c.expectedConversions,0),
  noSignal:channels.every(c=>c.efficiency===0),
  caveat:'Optimización matemática lineal de los supuestos proporcionados. No modela saturación, subastas, atribución, incrementalidad ni rendimiento futuro.'};
}
const supported=new Set(['Instagram','TikTok','YouTube','Facebook','LinkedIn','X','Otra']);
const keys=['alcance','impresiones','interacciones','clics'];
export function reviewImportedMetrics(rawRows=[]){
 if(!Array.isArray(rawRows))return {available:false,records:0,channels:[],leader:null,days:0,notes:['No hay un CSV importado.']};
 const groups=new Map(),dates=new Set();
 for(const row of rawRows.slice(0,2500)){
  if(!row||typeof row!=='object'||!supported.has(row.plataforma)||typeof row.fecha!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(row.fecha))continue;
  const values={};let valid=true;
  for(const k of keys){const n=Number(row[k]);if(row[k]===undefined||row[k]===null||!Number.isFinite(n)||n<0||n>1e9){valid=false;break}values[k]=n}
  if(!valid)continue;
  dates.add(row.fecha);
  const g=groups.get(row.plataforma)||{name:row.plataforma,records:0,alcance:0,impresiones:0,interacciones:0,clics:0};
  g.records++;for(const key of keys)g[key]+=values[key];
  groups.set(row.plataforma,g);
 }
 const channels=[...groups.values()].map(c=>({...c,ctr:c.impresiones>0?100*c.clics/c.impresiones:null,
  interactionReach:c.alcance>0?100*c.interacciones/c.alcance:null})).sort((a,b)=>b.impresiones-a.impresiones||a.name.localeCompare(b.name));
 const qualified=channels.filter(x=>x.impresiones>=100&&x.ctr!==null);
 const leader=[...qualified].sort((a,b)=>b.ctr-a.ctr||b.impresiones-a.impresiones)[0]||null;
 const records=channels.reduce((n,c)=>n+c.records,0);
 return {available:records>0,records,channels,leader,days:dates.size,
  notes:records?[
   'CTR = clics / impresiones; interacción = interacciones / alcance.',
   'Sin datos de conversiones, inversión u horas: no se calcula ROI ni el mejor horario.',
   'Las filas pueden tener alcance duplicado entre campañas; no se estima audiencia única.'
  ]:['Importa primero métricas desde Analítica. No se generan datos ficticios.']};
}

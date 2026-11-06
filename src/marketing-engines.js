// MarketHub AI · Motores de marketing locales, deterministas y verificables.
// Ninguna función llama a redes, consume IA externa ni predice resultados reales.
const trim=(v,max=1200)=>String(v??'').trim().replace(/\s+/g,' ').slice(0,max);
const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
const num=(value,name,min,max,integer=false)=>{
  const raw=typeof value==='string'?value.trim():value;
  if(raw===''||raw===null||raw===undefined)throw new RangeError(name+' obligatorio');
  const n=Number(raw);
  if(!Number.isFinite(n)||n<min||n>max||(integer&&!Number.isInteger(n)))
    throw new RangeError(name+' fuera de rango');
  return n;
};
const normalize=s=>trim(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const sentence=s=>s.replace(/[.!?]+$/,'').trim();
const channels=['Instagram','TikTok','Facebook','LinkedIn','YouTube','X','Email'];
export function analyzeCreative(text,{keyword='',channel='Instagram'}={}){
 const copy=trim(text,6000),key=trim(keyword,100),network=channels.includes(channel)?channel:'Instagram';
 if(!copy)throw new RangeError('Introduce el texto que deseas revisar');
 const chars=copy.length,words=copy.split(/\s+/).filter(Boolean).length;
 const hashtags=(copy.match(/#[\p{L}\p{N}_]+/gu)||[]).length;
 const first=copy.split(/[.!?\n]/)[0].trim();
 const checks=[];
 const check=(ok,weight,pass,fail)=>checks.push({pass:Boolean(ok),weight,message:ok?pass:fail});
 check(chars>=40&&chars<=600,20,'Extensión razonable para revisar','Revisa la extensión: entre 40 y 600 caracteres suele facilitar la lectura (criterio editorial propio).');
 check(!key||normalize(copy).includes(normalize(key)),20,'Palabra clave presente','Incluye la palabra clave de forma natural si es relevante.');
 check(/\b(reserva|descubre|consulta|visita|comparte|guarda|escribe|comenta|solicita|prueba|contacta|conoce|explora|apunta|inscribete|únete|unete|descarga)\b/i.test(copy),20,'Hay una llamada a la acción','Considera una llamada a la acción clara y honesta.');
 check(first.length>=12&&first.length<=110,15,'Inicio legible','Haz que la primera frase comunique una idea concreta (12–110 caracteres).');
 check(hashtags<=6,10,'Uso moderado de etiquetas','Reduce etiquetas excesivas; prioriza relevancia frente a cantidad.');
 check(!/(?:!{3,}|\?{3,}|[A-ZÁÉÍÓÚÜÑ]{12,})/.test(copy),10,'Puntuación y mayúsculas moderadas','Evita bloques largos en mayúsculas y signos repetidos.');
 check(!/\b(garantizado al 100%|resultados asegurados|sin riesgos)\b/i.test(copy),5,'No se detectan promesas extremas típicas','Comprueba la veracidad de promesas absolutas antes de publicar.');
 return {score:checks.reduce((sum,c)=>sum+(c.pass?c.weight:0),0),checks,chars,words,hashtags,readingSeconds:Math.max(1,Math.ceil(words/3.2)),channel:network,keyword:key};
}
export function generateCopyVariants(input={},count=4){
 const idea=sentence(trim(input.idea,650)),audience=trim(input.audience,130),
  offer=sentence(trim(input.offer,240)),cta=sentence(trim(input.cta,100))||'Conoce los detalles',
  brand=trim(input.brand,100),channel=channels.includes(input.channel)?input.channel:'Instagram';
 if(!idea||!audience)throw new RangeError('Introduce una idea y un público objetivo');
 const n=num(count,'Variantes',1,5,true);
 const brandLine=brand?brand+': ':'';
 const benefit=offer||idea;
 const variations=[
  {name:'Gancho · pregunta',text:'¿Buscas una propuesta para '+audience+'?\n\n'+brandLine+idea+'.\n\n'+cta+'.'},
  {name:'Problema → solución',text:'Para '+audience+', cada decisión cuenta.\n\n'+brandLine+idea+'. '+(offer?'Nuestra propuesta: '+offer+'.':'Descubre qué puede aportar a tu proyecto.')+'\n\n'+cta+'.'},
  {name:'Valor concreto',text:brandLine+benefit+'.\n\nPensado para '+audience+'.\n\n'+cta+'.'},
  {name:'Conversación',text:'Hablemos de lo que importa a '+audience+'.\n\n'+idea+'.\n\n¿Qué necesitas saber? '+cta+'.'},
  {name:'Versión breve',text:brandLine+idea+'.\n'+(offer?offer+'.\n':'')+cta+'.'}
 ];
 return variations.slice(0,n).map((v,i)=>({...v,id:i+1,channel,text:v.text.replace(/\.\./g,'.').slice(0,1700)}));
}
export function forecastScenarios(input={}){
 const budget=num(input.budget,'Presupuesto',0.01,100000000);
 const cpm=num(input.cpm,'CPM',0.01,100000);
 const ctr=num(input.ctr,'CTR',0,100);
 const conversionRate=num(input.conversionRate,'Tasa de conversión',0,100);
 const ticket=num(input.ticket,'Valor por conversión',0,100000000);
 const margin=num(input.margin,'Margen bruto',0,100);
 const compute=(name,multiplier)=>{
  const adjustedCtr=clamp(ctr*multiplier,0,100);
  const adjustedRate=clamp(conversionRate*multiplier,0,100);
  const impressions=budget/cpm*1000;
  const clicks=impressions*adjustedCtr/100;
  const conversions=clicks*adjustedRate/100;
  const revenue=conversions*ticket;
  const grossMargin=revenue*margin/100;
  return {name,impressions,clicks,conversions,revenue,grossMargin,netContribution:grossMargin-budget,
   roas:revenue/budget,cpa:conversions?budget/conversions:null,ctr:adjustedCtr,conversionRate:adjustedRate};
 };
 return {input:{budget,cpm,ctr,conversionRate,ticket,margin},
  scenarios:[compute('Conservador',.8),compute('Base',1),compute('Optimista',1.2)],
  breakEvenConversions:ticket*margin>0?budget/(ticket*margin/100):null};
}
function erf(x){
 const sign=x<0?-1:1,abs=Math.abs(x),t=1/(1+0.3275911*abs);
 const polynomial=(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-0.284496736)*t+0.254829592)*t;
 return sign*(1-polynomial*Math.exp(-abs*abs));
}
function normalCdf(x){return (1+erf(x/Math.sqrt(2)))/2}
export function compareAB(input={}){
 const visitsA=num(input.visitsA,'Visitas A',1,1000000000,true);
 const convertsA=num(input.convertsA,'Conversiones A',0,visitsA,true);
 const visitsB=num(input.visitsB,'Visitas B',1,1000000000,true);
 const convertsB=num(input.convertsB,'Conversiones B',0,visitsB,true);
 const rateA=convertsA/visitsA,rateB=convertsB/visitsB,difference=rateB-rateA;
 const pool=(convertsA+convertsB)/(visitsA+visitsB);
 const pooledSE=Math.sqrt(pool*(1-pool)*(1/visitsA+1/visitsB));
 const z=pooledSE?difference/pooledSE:0,pValue=difference===0?1:pooledSE?clamp(2*(1-normalCdf(Math.abs(z))),0,1):1;
 const standardError=Math.sqrt(rateA*(1-rateA)/visitsA+rateB*(1-rateB)/visitsB);
 const lower=difference-1.96*standardError,upper=difference+1.96*standardError;
 const sufficient=visitsA>=30&&visitsB>=30&&
    [visitsA*pool,visitsB*pool,visitsA*(1-pool),visitsB*(1-pool)].every(n=>n>=5);
 return {visitsA,visitsB,convertsA,convertsB,rateA,rateB,
  difference,relativeLift:rateA?difference/rateA:null,pValue,
  interval95:[lower,upper],sufficient,significant:sufficient&&pValue<0.05,
  winner:sufficient&&pValue<0.05?(difference>0?'B':difference<0?'A':'Sin diferencia'):'No concluyente'};
}

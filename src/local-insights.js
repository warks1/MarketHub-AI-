// MarketHub AI · recomendaciones transparentes basadas en datos LOCALES.
// No se inventa ROI, crecimiento, tráfico ni análisis remoto de redes.
const validDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s);
const num=n=>Number.isFinite(Number(n))&&Number(n)>=0?Number(n):0;
const fmt=n=>new Intl.NumberFormat('es-ES',{maximumFractionDigits:1}).format(n);
const euro=n=>new Intl.NumberFormat('es-ES',{style:'currency',currency:'EUR',maximumFractionDigits:2}).format(n);
export const INSIGHT_PLATFORMS=['Instagram','TikTok','YouTube','Facebook','LinkedIn','X','Otra'];
const dayKey=date=>[date.getFullYear(),String(date.getMonth()+1).padStart(2,'0'),String(date.getDate()).padStart(2,'0')].join('-');
export function platformReachSummary(rows=[]){
 const sources=(Array.isArray(rows)?rows:[]).filter(x=>x&&typeof x==='object'&&INSIGHT_PLATFORMS.includes(x.plataforma));
 const totals=new Map();
 for(const r of sources){
  const v=num(r.alcance);if(v<=0)continue;
  totals.set(r.plataforma,(totals.get(r.plataforma)||0)+v);
 }
 const all=[...totals].map(([platform,reach])=>({platform,reach})).sort((a,b)=>b.reach-a.reach);
 const total=all.reduce((n,r)=>n+r.reach,0);
 return {total,platforms:all.map(r=>({...r,sharePercent:total?Math.round(r.reach/total*1000)/10:0}))};
}
export function localRecommendations({posts=[],campaigns=[],rows=[]}={},options={}){
 const today=options.today instanceof Date&&Number.isFinite(options.today.valueOf())?options.today:new Date();
 const date=dayKey(today),future=new Date(today.getFullYear(),today.getMonth(),today.getDate()+7),sevenDays=dayKey(future);
 const p=(Array.isArray(posts)?posts:[]).filter(x=>x&&typeof x==='object');
 const c=(Array.isArray(campaigns)?campaigns:[]).filter(x=>x&&typeof x==='object');
 const insights=[];
 const data=platformReachSummary(rows);
 if(data.total>0){
  const best=data.platforms[0];
  insights.push({id:'reach-leader',label:best.platform+' representa el '+fmt(best.sharePercent)+'% del alcance importado',page:'analitica',icon:'▥',kind:'imported'});
 }else insights.push({id:'import-stats',label:'Importar estadísticas reales desde CSV',page:'analitica',icon:'▥',kind:'local'});
 const overdue=p.filter(x=>x.status==='Borrador'&&validDate(x.date)&&x.date<date).length;
 if(overdue>0)insights.push({id:'overdue',label:fmt(overdue)+' borrador(es) con fecha prevista ya pasada',page:'crear',icon:'▦',kind:'local'});
 const near=p.filter(x=>x.status==='Borrador'&&validDate(x.date)&&x.date>=date&&x.date<=sevenDays).length;
 if(near>0)insights.push({id:'due-soon',label:fmt(near)+' borrador(es) previstos para los próximos 7 días',page:'crear',icon:'✦',kind:'local'});
 const planned=p.filter(x=>x.status!=='Borrador'&&validDate(x.date)&&x.date>=date&&x.date<=sevenDays).length;
 if(planned<3)insights.push({id:'calendar',label:'Revisar calendario: '+fmt(planned)+' publicaciones planificadas en 7 días',page:'crear',icon:'▦',kind:'local'});
 if(c.length){
  const budget=c.reduce((sum,x)=>sum+num(x.budget),0);
  insights.push({id:'budgets',label:fmt(c.length)+' campaña(s) locales · presupuesto previsto '+euro(budget),page:'campanas',icon:'◎',kind:'local'});
 }else insights.push({id:'new-campaign',label:'Preparar una campaña y su presupuesto estimado',page:'campanas',icon:'◎',kind:'local'});
 insights.push({id:'design',label:'Abrir el diseñador gráfico para crear contenido',page:'diseño',icon:'✧',kind:'local'});
 return insights.slice(0,5);
}

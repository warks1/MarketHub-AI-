// PULSE Campaign Pilot · plan editorial local y verificable a partir de un brief.
// No usa un modelo de IA, no publica, no envía datos ni promete resultados.
const CHANNELS=['Instagram','TikTok','Facebook','Google Ads','YouTube','LinkedIn','Email','Multicanal'];
const MULTI=['Instagram','TikTok','LinkedIn','Facebook','YouTube','Instagram','TikTok'];
const STEPS=[
 {label:'Presentación',format:'Presentación de la propuesta',angle:'Explica qué problema resuelve tu propuesta',check:'Revisa que la promesa sea demostrable'},
 {label:'Problema',format:'Problema y solución',angle:'Describe una dificultad habitual de tu público',check:'No inventes datos ni cifras'},
 {label:'Beneficio',format:'Beneficio práctico',angle:'Enseña una ventaja concreta de la oferta',check:'Incluye una imagen o ejemplo real'},
 {label:'Demostración',format:'Demostración',angle:'Muestra el proceso o el producto en uso',check:'Obtén permiso para las imágenes usadas'},
 {label:'Confianza',format:'Prueba y contexto',angle:'Explica por qué funciona y aporta evidencia verificable',check:'No inventes testimonios o reseñas'},
 {label:'Preguntas',format:'Preguntas frecuentes',angle:'Responde una objeción frecuente sin presionar',check:'Aclara limitaciones y condiciones'},
 {label:'Acción',format:'Cierre de campaña',angle:'Invita a dar un siguiente paso concreto',check:'Comprueba URL, precio y condiciones antes de publicar'}
];
const SHORT=(s,length)=>Array.from(String(s??'').trim()).slice(0,length).join('');
const isoDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&
 Number.isFinite(Date.parse(s+'T12:00:00Z'))&&new Date(s+'T12:00:00Z').toISOString().slice(0,10)===s;
export function validatePulseBrief(brief){
 if(!brief||typeof brief!=='object'||Array.isArray(brief))throw Error('Selecciona un brief válido');
 const name=SHORT(brief.name,100),brand=SHORT(brief.brand,80),audience=SHORT(brief.audience,200),
  offer=SHORT(brief.offer,320),cta=SHORT(brief.cta||'Descubre más',120),channel=String(brief.channel||''),
  date=String(brief.date||'');
 if(!name||!audience||!offer||!CHANNELS.includes(channel)||!isoDate(date))
  throw Error('El brief necesita nombre, público, oferta, canal y fecha válidos');
 return {name,brand,audience,offer,cta,channel,date,goal:SHORT(brief.goal,80)};
}
const compactText=s=>SHORT(String(s).replace(/\s+/g,' '),240);
export function buildPulsePlan(brief){
 const b=validatePulseBrief(brief);
 const starting=new Date(b.date+'T12:00:00Z');
 const items=STEPS.map((step,i)=>{
  const date=new Date(starting);date.setUTCDate(date.getUTCDate()+i);
  const platform=b.channel==='Multicanal'?MULTI[i]:b.channel;
  const sentences=[
   'Presentamos '+b.name+': '+b.offer+'. '+b.cta+'.',
   '¿Te interesa resolver esto? '+b.audience+': '+b.offer+'.',
   'Una razón para conocer '+b.name+': '+b.offer+'. '+b.cta+'.',
   'Así puedes descubrir '+b.offer+'. Mira los detalles y decide.',
   'Antes de elegir '+b.name+', comprueba cómo responde a tus necesidades. '+b.cta+'.',
   'Preguntas frecuentes sobre '+b.name+': consulta condiciones y detalles. '+b.cta+'.',
   '¿Quieres conocer '+b.offer+'? '+b.cta+'.'
  ];
  return {
   day:i+1,date:date.toISOString().slice(0,10),platform,
   format:platform==='Email'?'Boletín editable':platform==='Google Ads'?'Propuesta de anuncio':
    platform==='LinkedIn'?'Publicación profesional':platform==='TikTok'||platform==='YouTube'?'Guion de vídeo':'Publicación / creatividad',
   phase:step.label,angle:step.angle,check:step.check,
   title:compactText(sentences[i]),status:'Borrador'
  };
 });
 return {sourceId:String(brief.id||''),name:b.name,brand:b.brand,goal:b.goal,
  audience:b.audience,offer:b.offer,channel:b.channel,items};
}
const csvCell=value=>{
 const raw=String(value??'').replace(/\0/g,'');
 return '"'+(/^\s*[=+\-@]/.test(raw)?"'"+raw:raw).replace(/"/g,'""')+'"';
};
export function pulsePlanCSV(plan){
 if(!Array.isArray(plan?.items)||plan.items.length!==7)throw Error('Prepara antes un plan válido de siete días');
 const header=['Día','Fecha','Red','Formato','Fase','Texto editable','Revisión antes de publicar'];
 const rows=plan.items.map(it=>[it.day,it.date,it.platform,it.format,it.phase,it.title,it.check]);
 return '\uFEFF'+[header,...rows].map(r=>r.map(csvCell).join(',')).join('\r\n')+'\r\n';
}
const icsEscape=x=>String(x??'').replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
const foldIcs=line=>{
 const out=[];let current='';
 for(const char of line){
  if(new TextEncoder().encode(current+char).length>72){
   out.push(current);current=' '+char;
  }else current+=char;
 }
 out.push(current);
 return out.join('\r\n');
};
export function pulsePlanICS(plan){
 if(!Array.isArray(plan?.items)||plan.items.length!==7)throw Error('Prepara antes un plan válido');
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//MarketHub AI//PULSE Campaign Pilot//ES','CALSCALE:GREGORIAN','METHOD:PUBLISH'];
 const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
 for(let i=0;i<plan.items.length;i++){
  const post=plan.items[i];
  if(!isoDate(post.date))throw Error('El plan contiene una fecha inválida');
  const date=post.date.replace(/-/g,'');
  const end=new Date(post.date+'T12:00:00Z');end.setUTCDate(end.getUTCDate()+1);
  const endDate=end.toISOString().slice(0,10).replace(/-/g,'');
  const summary='Revisar borrador '+post.phase+' · '+post.platform;
  const description='Propuesta local para revisar. '+post.title+' / '+post.check+'. No se publica automáticamente.';
  const uid='pulse-'+date+'-'+i+'-'+String(plan.sourceId||'local').replace(/[^a-z0-9-]/gi,'').slice(0,40)+'@markethub.local';
  lines.push('BEGIN:VEVENT','UID:'+uid,'DTSTAMP:'+stamp,'DTSTART;VALUE=DATE:'+date,
   'DTEND;VALUE=DATE:'+endDate,'STATUS:TENTATIVE',
   'SUMMARY:'+icsEscape(summary),'DESCRIPTION:'+icsEscape(description),'END:VEVENT');
 }
 lines.push('END:VCALENDAR');
 return lines.map(foldIcs).join('\r\n')+'\r\n';
}
export const pulsePlanDates=plan=>Array.isArray(plan?.items)?plan.items.map(i=>i.date):[];

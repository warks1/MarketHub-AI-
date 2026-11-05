// MarketHub AI · exportación de recordatorios al calendario del dispositivo.
// No publica automáticamente en ninguna red social.
const bytes=new TextEncoder();
const validDate=date=>{
 if(typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date))return false;
 const d=new Date(date+'T12:00:00Z');
 return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===date;
};
const compact=date=>date.replaceAll('-','');
function nextDay(date){
 const d=new Date(date+'T12:00:00Z');
 d.setUTCDate(d.getUTCDate()+1);
 return d.toISOString().slice(0,10);
}
export function icsEscape(s){
 return String(s??'').replace(/\\/g,'\\\\').replace(/\r\n|\r|\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
}
export function foldICS(line){
 const chunks=[];
 let chunk='',limit=75,count=0;
 for(const ch of String(line)){
  const n=bytes.encode(ch).length;
  if(count+n>limit){
   chunks.push(chunk);chunk=' ';count=1;limit=75;
  }
  chunk+=ch;count+=n;
 }
 chunks.push(chunk);
 return chunks.join('\r\n');
}
const uid=id=>{
 const safe=String(id??'').slice(0,100).replace(/[^a-zA-Z0-9_-]/g,'_');
 return 'markethub-'+(safe||'recordatorio')+'@local.markethub.invalid';
};
export function exportEditorialICS(posts,{now=new Date(),onlyPlanned=true}={}){
 const items=(Array.isArray(posts)?posts:[]).filter(p=>p&&typeof p==='object'&&validDate(p.date)&&
 (!onlyPlanned||p.status==='Programada'||p.status==='Planificada'));
 if(!items.length)return {error:'No hay publicaciones planificadas con fechas válidas para exportar.',content:null,count:0};
 if(!Number.isFinite(now.getTime()))throw Error('Fecha de generación inválida.');
 const timestamp=now.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//MarketHub AI//Calendario editorial local//ES','CALSCALE:GREGORIAN',
  'METHOD:PUBLISH','X-WR-CALNAME:MarketHub AI · Plan editorial'];
 items.forEach((p,i)=>{
  const id=uid(p.id??i),title=String(p.title||'Publicación sin título').slice(0,240);
  const platform=String(p.platform||'Plataforma por definir').slice(0,80);
  const start=compact(p.date),end=compact(nextDay(p.date));
  lines.push('BEGIN:VEVENT','UID:'+id,'DTSTAMP:'+timestamp,
   'DTSTART;VALUE=DATE:'+start,'DTEND;VALUE=DATE:'+end,
   'SUMMARY:'+icsEscape(title),
   'DESCRIPTION:'+icsEscape('Recordatorio editorial, no publicación automática. Plataforma: '+platform+'. Revisar y publicar manualmente.'),
   'STATUS:TENTATIVE','TRANSP:TRANSPARENT','END:VEVENT');
 });
 lines.push('END:VCALENDAR');
 return {content:lines.map(foldICS).join('\r\n')+'\r\n',count:items.length,error:null};
}

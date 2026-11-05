// MarketHub AI · Herramienta de subtítulos offline.
// Conversiones SRT ↔ WebVTT, sin cargar archivos ni vídeos en servicios externos.
const TIME=/^(\d{1,3}:)?([0-5]?\d):([0-5]\d)[.,](\d{3})$/;
function timecode(value){
 const parts=String(value??'').trim().split(':');
 if(parts.length!==2&&parts.length!==3)throw new Error('Marca de tiempo no reconocida');
 const raw=parts.length===2?'00:'+parts.join(':'):parts.join(':');
 const m=raw.match(/^(\d{1,3}):([0-5]\d):([0-5]\d)[.,](\d{3})$/);
 if(!m)throw new Error('Hora, minutos, segundos o milisegundos inválidos');
 const milliseconds=((Number(m[1])*60+Number(m[2]))*60+Number(m[3]))*1000+Number(m[4]);
 return {milliseconds,normalized:[m[1].padStart(2,'0'),m[2],m[3]].join(':')+'.'+m[4]};
}
export function parseSubtitles(input){
 const raw=String(input??'').replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n').trim();
 if(!raw||raw.length>1000000)throw new Error('Escribe subtítulos de menos de 1 MB');
 const isVtt=/^WEBVTT(?:[^\n]*)/.test(raw);
 let lines=raw.split('\n'),entries=[];
 if(isVtt){
  lines=lines.slice(1);
  // Evitar que un encabezado de WebVTT se convierta en texto de subtítulo.
  while(lines.length&&lines[0].trim()!=='')lines.shift();
  if(lines.length)lines.shift();
 }
 for(const group of lines.join('\n').split(/\n[ \t]*\n+/)){
  const a=group.trim().split('\n');if(!a.length||!a[0])continue;
  // Las notas de WebVTT no son cues.
  if(/^(NOTE|STYLE|REGION)(?:\s|$)/.test(a[0]))continue;
  const idx=a.findIndex(line=>line.includes('-->'));
  if(idx<0)throw new Error('Subtítulo sin intervalo de tiempo');
  if(idx>1)throw new Error('Identificador de subtítulo inválido');
  const timing=a[idx].split(/\s+-->\s+/);
  if(timing.length!==2)throw new Error('Intervalo de tiempo incorrecto');
  const start=timecode(timing[0]);
  // WebVTT admite ajustes de posición al final; se ignoran al convertir a SRT.
  const finish=timecode(timing[1].trim().split(/\s+/)[0]);
  if(finish.milliseconds<=start.milliseconds)throw new Error('El final debe ser posterior al inicio');
  const text=a.slice(idx+1).join('\n').trim();
  if(!text)throw new Error('Subtítulo sin texto');
  entries.push({start:start.normalized,end:finish.normalized,text});
  if(entries.length>2000)throw new Error('Máximo de 2000 subtítulos por conversión');
 }
 if(!entries.length)throw new Error('No se encontraron subtítulos reconocibles');
 for(let i=1;i<entries.length;i++){
  if(timecode(entries[i].start).milliseconds<timecode(entries[i-1].start).milliseconds)
   throw new Error('Los subtítulos deben estar ordenados cronológicamente');
 }
 return entries;
}
export function convertSubtitles(input,format){
 if(!['srt','vtt'].includes(format))throw new Error('Formato de salida no admitido');
 const cues=parseSubtitles(input),clock=x=>format==='srt'?x.replace('.',','):x;
 const body=cues.map((cue,i)=>{
  const time=clock(cue.start)+' --> '+clock(cue.end);
  return (format==='srt'?(i+1)+'\n':'')+time+'\n'+cue.text;
 }).join('\n\n');
 return (format==='vtt'?'WEBVTT\n\n':'')+body+'\n';
}

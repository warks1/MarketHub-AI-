// MEDIA FORGE · Herramientas multimedia locales originales de MarketHub AI.
import {convertSubtitles,parseSubtitles} from './subtitle-tools.js';
import {listVaultAssets,getVaultAsset,saveVaultAsset,removeVaultAsset,vaultSupported,VAULT_MAX_ITEMS} from './media-vault.js';
// Sin subida de archivos a servidores, ni dependencias de servicios externos.
const s={tab:'photo',files:{},urls:{},image:null,format:'9:16',mask:'orbita',look:'neon',caption:'',subtitle:'',safezone:'off',vault:[],vaultReady:false,vaultError:'',vaultUrls:[]};
export const SIZES={'9:16':[1080,1920],'4:5':[1080,1350],'1:1':[1080,1080],'16:9':[1920,1080],'3:2':[1500,1000]};
// SafeFrame es una orientación visual nuestra, no los requisitos oficiales de las redes sociales.
export const SAFEFRAME_GUIDES={'9:16':{top:.17,right:.12,bottom:.25,left:.09},'4:5':{top:.10,right:.08,bottom:.18,left:.08},'1:1':{top:.10,right:.08,bottom:.15,left:.08},'16:9':{top:.10,right:.11,bottom:.17,left:.11},'3:2':{top:.10,right:.10,bottom:.15,left:.10}};
export const MASKS=['orbita','circulo','ovalada','redondeada','estrella','hexagono','pentagono','octagono','triangulo','diamante','corazon','banda-horizontal','banda-vertical','ventana','completa'];
const looks={neon:['contrast(1.1) saturate(1.3)','#26e9fb','#eb4df5'],editorial:['contrast(1.06) saturate(.85)','#ffcfa2','#ef9bcd'],noir:['grayscale(1) contrast(1.25)','#f0f4ff','#8190dd'],natural:['none','#ffffff','#8acde9']};
const tabNames={photo:'Foto y máscaras',audio:'Audio y WAV',video:'Vídeo y fotogramas',pdf:'Visor PDF',subs:'Subtítulos SRT / VTT',vault:'Mi biblioteca'};
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const btn=(label,action,disabled=false)=>'<button type="button" data-forge-action="'+action+'" '+(disabled?'disabled':'')+'>'+label+'</button>';
const field=(label,key,opts)=>'<label>'+label+'<select data-forge-input="'+key+'">'+opts.map(([v,n])=>'<option value="'+v+'" '+(s[key]===v?'selected':'')+'>'+n+'</option>').join('')+'</select></label>';
const upload=(type,accept)=>'<label class="forge-file">＋ Abrir '+({photo:'fotografía',audio:'audio',video:'vídeo',pdf:'PDF'}[type])+'<input type="file" data-forge-file="'+type+'" accept="'+accept+'"></label><p class="forge-meta">'+(s.files[type]?esc(s.files[type].name)+' · '+(s.files[type].size/1048576).toFixed(1)+' MB':'Sin archivo · procesamiento local')+'</p>';
const actions=(list)=>'<div class="forge-actions">'+list.join('')+'</div>';
const panel=(title,body)=>'<section class="forge-panel"><h2>'+title+'</h2>'+body+'</section>';
function photo(){
 return '<div class="forge-grid">'+panel('Máscaras y conversor de imágenes',upload('photo','image/png,image/jpeg,image/webp,image/gif')+
 field('Formato social','format',Object.entries(SIZES).map(([k,d])=>[k,k+' · '+d.join('×')]))+
 field('Máscara creativa','mask',MASKS.map(k=>[k,k==='orbita'?'Órbita NEXUS · creación propia':k]))+
 field('Tratamiento visual','look',Object.keys(looks).map(k=>[k,k]))+
 field('SafeFrame PULSE · zona de texto','safezone',[['off','Desactivada'],['on','Mostrar guías y proteger texto']])+
 '<label>Texto sobre la composición<input data-forge-input="caption" maxlength="90" value="'+esc(s.caption)+'" placeholder="Tu mensaje opcional"></label>'+
 actions([btn('Exportar PNG','png',!s.image),btn('Exportar JPG','jpeg',!s.image),btn('Exportar WebP','webp',!s.image),btn('PULSE PACK · 5 formatos ZIP','pack',!s.image),btn('Guardar en Mi biblioteca','vault-save-photo',!s.image),btn('Usar imagen en Estudio','studio',!s.image)])+
 '<p>El editor utiliza recorte centrado y no modifica el original. SafeFrame PULSE marca guías de texto orientativas (no certificadas por las redes sociales). La máscara Órbita combina foto, marcos dobles y formato social.</p>')+
 panel('Vista previa real','<div class="forge-preview"><canvas id="forgeCanvas" role="img" aria-label="Vista previa de composición"></canvas></div>')+'</div>';
}
function audio(){
 return '<div class="forge-grid">'+panel('Reproductor y conversor WAV',upload('audio','audio/*')+
 '<div class="forge-times"><label>Inicio (s)<input id="forgeAudioStart" type="number" value="0" min="0" step=".1"></label><label>Final (s; 0 = completo)<input id="forgeAudioEnd" type="number" value="0" min="0" step=".1"></label></div>'+
 actions([btn('Convertir / recortar a WAV','wav',!s.urls.audio),btn('Guardar audio en Mi biblioteca','vault-save-audio',!s.urls.audio)])+
 '<p>Convierte localmente formatos que el dispositivo pueda decodificar. Exporta PCM WAV, hasta 10 minutos. No promete MP3 sin codificador.</p>')+
 panel('Escuchar',s.urls.audio?'<audio controls preload="metadata" src="'+s.urls.audio+'"></audio>':'<div class="forge-empty">Selecciona un audio para reproducirlo.</div>')+'</div>';
}
function video(){
 return '<div class="forge-grid">'+panel('Visor y conversión de vídeo',upload('video','video/*')+
 actions([btn('Capturar fotograma PNG','frame',!s.urls.video),btn('Convertir vídeo a WebM','webm',!s.urls.video),btn('Guardar vídeo en Mi biblioteca','vault-save-video',!s.urls.video)])+
 '<p>La conversión WebM usa MediaRecorder en tiempo real y requiere compatibilidad del navegador. Límite 90 s. MP4 y otros códecs no se ofrecen como disponibles sin comprobar soporte.</p>')+
 panel('Reproductor integrado',s.urls.video?'<video id="forgeVideo" controls playsinline preload="metadata" src="'+s.urls.video+'"></video>':'<div class="forge-empty">Selecciona un vídeo para reproducirlo.</div>')+'</div>';
}
function pdf(){
 return '<div class="forge-grid">'+panel('Visor de documentos',upload('pdf','application/pdf')+actions([btn('Guardar PDF en Mi biblioteca','vault-save-pdf',!s.urls.pdf)])+'<p>PDF local. Si tu navegador no permite mostrarlo aquí, puedes abrirlo en otra pestaña.</p>'+(s.urls.pdf?'<a href="'+s.urls.pdf+'" target="_blank" rel="noopener noreferrer">Abrir PDF</a>':''))+
 panel('Documento',s.urls.pdf?'<iframe title="PDF local" class="forge-pdf" src="'+s.urls.pdf+'"></iframe>':'<div class="forge-empty">Abre un PDF.</div>')+'</div>';
}
function subtitles(){
 const summary=(()=>{try{return parseSubtitles(s.subtitle).length+' fragmentos reconocidos';}catch{return 'Pega un archivo SRT o WebVTT para convertirlo';}})();
 return '<div class="forge-grid">'+panel('Subtítulos y conversor offline',
 '<p>Convierte SRT ↔ WebVTT sin subir textos ni vídeos. Corrige el formato de los tiempos y numera automáticamente.</p>'+
 upload('subs','.srt,.vtt,text/vtt,application/x-subrip,text/plain')+
 '<label>Texto editable de subtítulos<textarea id="forgeSubtitleText" data-forge-input="subtitle" rows="12" placeholder="1&#10;00:00:01,000 --> 00:00:03,000&#10;Tu primera frase">'+esc(s.subtitle)+'</textarea></label>'+
 '<p class="forge-meta" id="forgeSubtitleStatus">'+summary+'</p>'+
 actions([btn('Descargar SRT','srt',!s.subtitle.trim()),btn('Descargar VTT','vtt',!s.subtitle.trim()),btn('Guardar VTT en Mi biblioteca','vault-save-subs',!s.subtitle.trim())])+
 '<p>Compatible con subtítulos de hasta 1 MB y 2000 fragmentos. No traduce ni transcribe audio automáticamente.</p>')+
 panel('Flujo creativo PULSE',
 '<div class="forge-empty">Prepara subtítulos aquí y guárdalos para utilizarlos con tus vídeos y campañas. Los tiempos se comprueban antes de exportar.</div>')+'</div>';
}
// Galería offline: los ficheros persisten en IndexedDB hasta que el usuario los elimine.
function vaultPage(){
 const used=s.vault.reduce((sum,item)=>sum+item.size,0);
 const cards=s.vault.map(item=>{
  const type=item.type.startsWith('image/')?'🖼️':item.type.startsWith('audio/')?'♫':item.type.startsWith('video/')?'▶':item.type==='application/pdf'?'▤':'≡';
  const image=item.thumbnail?'<img loading="lazy" src="'+item.thumbnail+'" alt="Vista previa de '+esc(item.name)+'">':'<div class="forge-vault-icon" aria-hidden="true">'+type+'</div>';
  return '<article class="forge-vault-item">'+image+
   '<div class="forge-vault-info"><strong title="'+esc(item.name)+'">'+esc(item.name)+'</strong>'+
   '<small>'+esc(item.type)+' · '+(item.size/1048576).toFixed(2)+' MB</small></div>'+
   '<div class="forge-vault-buttons"><button type="button" data-forge-action="vault-open" data-forge-id="'+esc(item.id)+'">Abrir</button>'+
   '<button type="button" data-forge-action="vault-download" data-forge-id="'+esc(item.id)+'">Descargar</button>'+
   '<button type="button" class="forge-vault-delete" data-forge-action="vault-delete" data-forge-id="'+esc(item.id)+'" aria-label="Eliminar '+esc(item.name)+'">Eliminar</button></div></article>';
 }).join('');
 return '<section class="forge-panel forge-vault"><h2>Biblioteca multimedia privada</h2><p>Guarda fotos editadas, archivos de audio, vídeo, PDF y subtítulos. Ábrelos desde cualquier herramienta, sin salir de MarketHub AI.</p>'+
 '<p class="forge-meta">Almacenamiento de este dispositivo · '+s.vault.length+' / '+VAULT_MAX_ITEMS+' archivos · '+(used/1048576).toFixed(1)+' MB utilizados (límite 150 MB)</p>'+
 (s.vaultError?'<p role="alert" class="forge-vault-error">'+esc(s.vaultError)+'</p>':'')+
 (!s.vaultReady?'<div class="forge-empty">Cargando archivos de este dispositivo…</div>':
 cards?'<div class="forge-vault-grid">'+cards+'</div>':'<div class="forge-empty">Todavía no has guardado archivos. Abre una herramienta y pulsa «Guardar en Mi biblioteca».</div>')+
 '<p class="forge-meta">Los archivos se conservan solo en este navegador/dispositivo. No se sincronizan ni se incluyen en las copias JSON. Puedes descargarlos individualmente. Si borras los datos del navegador podrías perderlos.</p></section>';
}
async function forgeVaultLoad(refresh){
 for(const url of s.vaultUrls)URL.revokeObjectURL(url);
 s.vaultUrls=[];s.vaultReady=false;s.vaultError='';
 try{
  const items=await listVaultAssets();
  for(const item of items){
   if(item.type.startsWith('image/')){
    const asset=await getVaultAsset(item.id);
    item.thumbnail=URL.createObjectURL(asset.blob);s.vaultUrls.push(item.thumbnail);
   }
  }
  s.vault=items;
 }catch(err){s.vault=[];s.vaultError=String(err.message||err)}
 s.vaultReady=true;if(s.tab==='vault')refresh();
}
export function forgePage(){
 return '<section class="media-forge"><header class="forge-head"><div><span class="eyebrow">NEXUS + PULSE · HERRAMIENTAS INTEGRADAS</span><h1>MEDIA FORGE ✦</h1><p>Visualiza, edita y convierte sin salir de MarketHub AI.</p></div><span class="forge-private">◎ Sin subir archivos</span></header>'+
 '<nav class="forge-tabs" aria-label="Laboratorio multimedia">'+Object.entries(tabNames).map(([k,n])=>'<button type="button" data-forge-tab="'+k+'" aria-current="'+(s.tab===k?'page':'false')+'">'+n+'</button>').join('')+'</nav>'+
 (s.tab==='audio'?audio():s.tab==='video'?video():s.tab==='pdf'?pdf():s.tab==='subs'?subtitles():s.tab==='vault'?vaultPage():photo())+'</section>';
}
export function forgeTab(name,refresh){if(!tabNames[name])return false;s.tab=name;refresh();if(name==='vault')void forgeVaultLoad(refresh);return true}
export const outputDimensions=format=>SIZES[format]||SIZES['9:16'];
export const safeFileName=name=>String(name||'media').replace(/\.[^.]*$/,'').replace(/[^a-z0-9_-]/gi,'-').slice(0,70)||'media';
function maskShape(ctx,w,h,mask){
 const r=Math.min(w,h)*.43,cx=w/2,cy=h/2;
 if(mask==='completa'){ctx.rect(0,0,w,h);return}
 if(mask==='circulo'){ctx.arc(cx,cy,r,0,Math.PI*2);return}
 if(mask==='ovalada'){ctx.ellipse(cx,cy,w*.43,h*.36,0,0,Math.PI*2);return}
 if(mask==='redondeada'){ctx.roundRect(w*.06,h*.06,w*.88,h*.88,Math.min(w,h)*.11);return}
 if(mask==='ventana'){ctx.roundRect(w*.12,h*.06,w*.76,h*.88,Math.min(w,h)*.32);return}
 if(mask==='banda-horizontal'){ctx.roundRect(w*.04,h*.32,w*.92,h*.36,Math.min(w,h)*.08);return}
 if(mask==='banda-vertical'){ctx.roundRect(w*.28,h*.04,w*.44,h*.92,Math.min(w,h)*.1);return}
 if(mask==='orbita'){ctx.ellipse(cx,cy,r*.93,r*1.08,-.24,0,Math.PI*2);return}
 if(mask==='corazon'){
  ctx.moveTo(cx,cy+r*.78);
  ctx.bezierCurveTo(cx-r*.3,cy+r*.44,cx-r*1.15,cy-r*.18,cx-r*.76,cy-r*.7);
  ctx.bezierCurveTo(cx-r*.52,cy-r*1.06,cx-r*.15,cy-r*.86,cx,cy-r*.55);
  ctx.bezierCurveTo(cx+r*.15,cy-r*.86,cx+r*.52,cy-r*1.06,cx+r*.76,cy-r*.7);
  ctx.bezierCurveTo(cx+r*1.15,cy-r*.18,cx+r*.3,cy+r*.44,cx,cy+r*.78);
  ctx.closePath();return;
 }
 const n=mask==='hexagono'?6:mask==='pentagono'?5:mask==='octagono'?8:mask==='triangulo'?3:mask==='diamante'?4:10;
 for(let i=0;i<n;i++){const angle=i*Math.PI*2/n-Math.PI/2,rr=mask==='estrella'&&i%2?r*.46:r,x=cx+Math.cos(angle)*rr,y=cy+Math.sin(angle)*rr;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}
 ctx.closePath();
}
export function composeImage(canvas,image,opts={}){
 const [iw,ih]=outputDimensions(opts.format||s.format),scale=opts.preview?Math.min(1,600/Math.max(iw,ih)):1;
 canvas.width=Math.round(iw*scale);canvas.height=Math.round(ih*scale);
 const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;
 if(!ctx)throw Error('Canvas no disponible');
 const mask=MASKS.includes(opts.mask)?opts.mask:s.mask,look=looks[opts.look]||looks[s.look]||looks.neon;
 ctx.fillStyle='#080e2b';ctx.fillRect(0,0,w,h);
 ctx.save();ctx.beginPath();maskShape(ctx,w,h,mask);ctx.clip();
 const sourceW=image.naturalWidth||image.width,sourceH=image.naturalHeight||image.height;
 if(!sourceW||!sourceH)throw Error('Imagen sin dimensiones');
 const ratio=Math.max(w/sourceW,h/sourceH),dw=sourceW*ratio,dh=sourceH*ratio;
 ctx.filter=look[0];ctx.drawImage(image,(w-dw)/2,(h-dh)/2,dw,dh);ctx.filter='none';ctx.restore();
 if(mask==='orbita'){
  ctx.strokeStyle=look[1];ctx.lineWidth=Math.max(2,w*.008);ctx.beginPath();ctx.ellipse(w/2,h/2,Math.min(w,h)*.41,Math.min(w,h)*.48,-.24,0,2*Math.PI);ctx.stroke();
  ctx.strokeStyle=look[2];ctx.lineWidth=Math.max(1,w*.004);ctx.beginPath();ctx.ellipse(w/2,h/2,Math.min(w,h)*.46,Math.min(w,h)*.38,.3,0,2*Math.PI);ctx.stroke();
 }
 const caption=String(opts.caption??s.caption).trim().slice(0,90);
 if(caption){ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font='800 '+Math.max(15,Math.round(w*.045))+'px system-ui';ctx.shadowColor='#000';ctx.shadowBlur=w*.015;ctx.fillText(caption,w/2,s.safezone==='on'?h*(1-SAFEFRAME_GUIDES[opts.format||s.format].bottom)-w*.04:h*.85,w*.85)}
 // Guías para el editor: no se incluyen en los archivos exportados.
 if(opts.preview&&s.safezone==='on'){
  const m=SAFEFRAME_GUIDES[opts.format||s.format];ctx.save();ctx.setLineDash([Math.max(3,w*.014),Math.max(2,w*.008)]);
  ctx.strokeStyle='#18efff';ctx.lineWidth=Math.max(1,w*.004);
  ctx.strokeRect(w*m.left,h*m.top,w*(1-m.left-m.right),h*(1-m.top-m.bottom));
  ctx.restore();
 }
 return canvas;
}
export function forgeMount(){
 if(s.tab!=='photo')return;
 const canvas=document.getElementById('forgeCanvas');if(!canvas)return;
 if(s.image){composeImage(canvas,s.image,{preview:true});return}
 canvas.width=420;canvas.height=480;const c=canvas.getContext('2d');c.fillStyle='#121b4c';c.fillRect(0,0,420,480);c.textAlign='center';c.font='18px system-ui';c.fillStyle='#c5e4ff';c.fillText('Abre una fotografía para empezar',210,238);
}
export function forgeInput(target){
 const name=target?.dataset?.forgeInput;if(!name)return false;
 if(name==='format'&&SIZES[target.value])s.format=target.value;
 else if(name==='mask'&&MASKS.includes(target.value))s.mask=target.value;
 else if(name==='look'&&looks[target.value])s.look=target.value;
 else if(name==='safezone'&&['off','on'].includes(target.value))s.safezone=target.value;
 else if(name==='caption')s.caption=String(target.value).slice(0,90);
 else if(name==='subtitle'){
  s.subtitle=String(target.value).slice(0,1000000);
  if(typeof document!=='undefined'){
   const message=document.getElementById('forgeSubtitleStatus');
   if(message)message.textContent=(()=>{try{return parseSubtitles(s.subtitle).length+' fragmentos reconocidos';}catch{return 'Corrige o añade tiempos para convertir.'}})();
   for(const key of ['srt','vtt']){const button=document.querySelector('[data-forge-action="'+key+'"]');if(button)button.disabled=!s.subtitle.trim()}
  }
 }
 else return false;
 forgeMount();return true;
}
export async function forgeFile(target,ctx){
 const type=target?.dataset?.forgeFile;if(!tabNames[type==='photo'?'photo':type])return false;
 const file=target.files?.[0];if(!file)return true;
 const max=type==='video'?250:type==='audio'?60:type==='pdf'?30:type==='subs'?1:25;
 if(!file.size||file.size>max*1048576){ctx.toast('Archivo demasiado grande o vacío (máximo '+max+' MB).');return true}
 const mimeOk=type==='photo'?['image/png','image/jpeg','image/webp','image/gif'].includes(file.type):type==='pdf'?file.type==='application/pdf':type==='subs'?/\.(srt|vtt)$/i.test(file.name):file.type.startsWith(type+'/');
 if(!mimeOk){ctx.toast('Formato de archivo no admitido.');return true}
 if(type==='subs'){
  try{s.subtitle=(await file.text()).slice(0,1000000);s.files.subs=file;ctx.refresh();ctx.toast('Subtítulos cargados y listos para editar.');}
  catch{ctx.toast('No se pudo leer el archivo de subtítulos.');}
  return true;
 }
 const url=URL.createObjectURL(file);
 if(type==='photo'){
  try{const img=new Image();img.src=url;await img.decode();if(!img.naturalWidth||img.naturalWidth*img.naturalHeight>50000000)throw Error('Tamaño de imagen excesivo');s.image=img}
  catch{URL.revokeObjectURL(url);ctx.toast('No se puede decodificar esta foto.');return true}
 }
 if(s.urls[type])URL.revokeObjectURL(s.urls[type]);s.files[type]=file;s.urls[type]=url;
 ctx.refresh();ctx.toast('Archivo abierto en el dispositivo.');return true;
}
function send(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000)}
const asBlob=(canvas,type)=>new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('Exportación no disponible')),type,.9));
// ZIP estándar sin dependencias: crea paquetes de medios directamente en el dispositivo.
const CRC_TABLE=Uint32Array.from({length:256},(_,n)=>{
 let c=n;for(let i=0;i<8;i++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0;
});
export function createMediaZip(files){
 if(!Array.isArray(files)||!files.length||files.length>20)throw Error('Selecciona entre 1 y 20 archivos');
 const enc=new TextEncoder(),local=[],central=[];let offset=0,centralSize=0;
 const u16=(v,p,n)=>v.setUint16(p,n,true),u32=(v,p,n)=>v.setUint32(p,n>>>0,true);
 for(const {name,data} of files){
  if(!(data instanceof Uint8Array)||data.length>35000000)throw Error('Archivo ZIP no válido');
  const filename=enc.encode(String(name).slice(0,110));
  if(!filename.length||filename.length>240)throw Error('Nombre de archivo ZIP inválido');
  let crc=0xffffffff;for(const byte of data)crc=CRC_TABLE[(crc^byte)&255]^(crc>>>8);crc=(crc^0xffffffff)>>>0;
  const lh=new Uint8Array(30+filename.length),lv=new DataView(lh.buffer);
  u32(lv,0,0x04034b50);u16(lv,4,20);u16(lv,6,0x0800);u16(lv,8,0);
  u32(lv,14,crc);u32(lv,18,data.length);u32(lv,22,data.length);u16(lv,26,filename.length);lh.set(filename,30);
  const ch=new Uint8Array(46+filename.length),cv=new DataView(ch.buffer);
  u32(cv,0,0x02014b50);u16(cv,4,20);u16(cv,6,20);u16(cv,8,0x0800);u16(cv,10,0);
  u32(cv,16,crc);u32(cv,20,data.length);u32(cv,24,data.length);
  u16(cv,28,filename.length);u32(cv,42,offset);ch.set(filename,46);
  local.push(lh,data);central.push(ch);offset+=lh.length+data.length;centralSize+=ch.length;
 }
 const end=new Uint8Array(22),v=new DataView(end.buffer);
 u32(v,0,0x06054b50);u16(v,8,files.length);u16(v,10,files.length);
 u32(v,12,centralSize);u32(v,16,offset);
 return new Blob([...local,...central,end],{type:'application/zip'});
}
export function encodeWav(buffer,begin=0,finish=0){
 const rate=buffer.sampleRate,ch=Math.min(buffer.numberOfChannels,2);
 if(!rate||ch<1||!Number.isFinite(begin)||!Number.isFinite(finish)||begin<0||finish<0||(finish>0&&finish<=begin))throw Error('Audio/intervalo inválido');
 const from=Math.floor(begin*rate),to=Math.min(buffer.length,Math.ceil((finish||buffer.duration)*rate)),samples=to-from;
 if(samples<=0||samples>rate*600)throw Error('Selecciona entre 0 y 600 segundos de audio');
 const bytes=new ArrayBuffer(44+samples*ch*2),v=new DataView(bytes),word=(pos,str)=>{for(let i=0;i<str.length;i++)v.setUint8(pos+i,str.charCodeAt(i))};
 word(0,'RIFF');v.setUint32(4,bytes.byteLength-8,true);word(8,'WAVE');word(12,'fmt ');v.setUint32(16,16,true);
 v.setUint16(20,1,true);v.setUint16(22,ch,true);v.setUint32(24,rate,true);v.setUint32(28,rate*ch*2,true);v.setUint16(32,ch*2,true);v.setUint16(34,16,true);
 word(36,'data');v.setUint32(40,samples*ch*2,true);
 const tracks=Array.from({length:ch},(_,i)=>buffer.getChannelData(i));
 let offset=44;for(let i=0;i<samples;i++)for(let j=0;j<ch;j++){const sample=Math.max(-1,Math.min(1,tracks[j][i+from]||0));v.setInt16(offset,sample<0?sample*32768:sample*32767,true);offset+=2}
 return bytes;
}
export function canRecordWebM(video){return !!(video&&video.captureStream&&typeof MediaRecorder!=='undefined'&&MediaRecorder.isTypeSupported('video/webm'))}
export async function forgeClick(target,ctx){
 const action=target?.dataset?.forgeAction;if(!action)return false;
 try{
  if(action.startsWith('vault-')){
   if(action==='vault-save-photo'){
    if(!s.image)throw Error('Selecciona una fotografía');
    const canvas=document.createElement('canvas');composeImage(canvas,s.image);
    const blob=await asBlob(canvas,'image/jpeg');
    if(blob.type!=='image/jpeg')throw Error('Este navegador no puede guardar JPG');
    await saveVaultAsset(safeFileName(s.files.photo.name)+'-'+s.format.replace(':','x')+'.jpg',blob);
    ctx.toast('Composición guardada en Mi biblioteca.');
   }else if(action.startsWith('vault-save-')){
    const kind=action.slice('vault-save-'.length);
    if(kind==='subs'){
     const blob=new Blob([convertSubtitles(s.subtitle,'vtt')],{type:'text/vtt'});
     await saveVaultAsset('Subtitulos-'+Date.now()+'.vtt',blob);
    }else{
     const original=s.files[kind];
     if(!original)throw Error('Selecciona antes un archivo');
     await saveVaultAsset(original.name,original);
    }
    ctx.toast('Archivo guardado en Mi biblioteca.');
   }else{
    const asset=await getVaultAsset(target.dataset.forgeId);
    if(action==='vault-download'){
     send(asset.blob,asset.name);ctx.toast('Archivo descargado.');
    }else if(action==='vault-delete'){
     if(window.confirm('¿Eliminar definitivamente «'+asset.name+'» de la biblioteca local?')){
      await removeVaultAsset(asset.id);await forgeVaultLoad(ctx.refresh);ctx.toast('Archivo eliminado de la biblioteca.');
     }
    }else if(action==='vault-open'){
     const kind=asset.type.startsWith('image/')?'photo':asset.type.startsWith('audio/')?'audio':
      asset.type.startsWith('video/')?'video':asset.type==='application/pdf'?'pdf':'subs';
     if(kind==='subs'){s.subtitle=await asset.blob.text();s.files.subs={name:asset.name,size:asset.size};forgeTab('subs',ctx.refresh)}
     else{
      const file=new File([asset.blob],asset.name,{type:asset.type});
      await forgeFile({dataset:{forgeFile:kind},files:[file]},ctx);
      forgeTab(kind,ctx.refresh);
     }
     ctx.toast('Archivo recuperado de Mi biblioteca.');
    }
   }
   return true;
  }
  if(['png','jpeg','webp'].includes(action)){
   if(!s.image)throw Error('Primero selecciona una fotografía');
   const mime='image/'+(action==='jpeg'?'jpeg':action),canvas=document.createElement('canvas');composeImage(canvas,s.image);
   const blob=await asBlob(canvas,mime);if(blob.type!==mime)throw Error('Este navegador no admite '+mime);
   send(blob,safeFileName(s.files.photo.name)+'-'+s.format.replace(':','x')+'.'+(action==='jpeg'?'jpg':action));ctx.toast('Imagen exportada.');
  }else if(action==='studio'){
   if(!s.image)throw Error('Primero selecciona una fotografía');
   if(typeof ctx.sendStudioImage!=='function')throw Error('No está disponible el vínculo con Estudio');
   const canvas=document.createElement('canvas');
   composeImage(canvas,s.image);
   const blob=await asBlob(canvas,'image/jpeg');
   if(blob.type!=='image/jpeg')throw Error('El navegador no admite exportar JPG');
   await ctx.sendStudioImage(blob);
  }else if(action==='pack'){
   if(!s.image)throw Error('Primero selecciona una fotografía');
   const files=[];
   for(const format of Object.keys(SIZES)){
    const canvas=document.createElement('canvas');composeImage(canvas,s.image,{format});
    const blob=await asBlob(canvas,'image/jpeg');
    if(blob.type!=='image/jpeg')throw Error('No se pudo crear JPG para '+format);
    const data=new Uint8Array(await blob.arrayBuffer());
    files.push({name:safeFileName(s.files.photo.name)+'-'+format.replace(':','x')+'.jpg',data});
   }
   send(createMediaZip(files),safeFileName(s.files.photo.name)+'-PULSE-PACK.zip');
   ctx.toast('PULSE PACK: cinco formatos exportados en un ZIP.');
  }else if(action==='srt'||action==='vtt'){
   const result=convertSubtitles(s.subtitle,action);
   send(new Blob([result],{type:action==='vtt'?'text/vtt;charset=utf-8':'text/plain;charset=utf-8'}),safeFileName(s.files.subs?.name||'subtitulos')+'.'+action);
   ctx.toast('Subtítulos '+action.toUpperCase()+' exportados.');
  }else if(action==='wav'){
   if(!s.files.audio)throw Error('Selecciona un audio');
   const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw Error('El navegador no admite decodificación de audio');
   const context=new Audio();
   try{const decoded=await context.decodeAudioData(await s.files.audio.arrayBuffer());
    const start=Number(document.querySelector('#forgeAudioStart')?.value),end=Number(document.querySelector('#forgeAudioEnd')?.value);
    send(new Blob([encodeWav(decoded,start,end)],{type:'audio/wav'}),safeFileName(s.files.audio.name)+'.wav');ctx.toast('WAV exportado.');
   }finally{await context.close().catch(()=>{})}
  }else if(action==='frame'){
   const video=document.querySelector('#forgeVideo');if(!video||video.readyState<2||!video.videoWidth)throw Error('Espera a cargar el vídeo');
   const canvas=document.createElement('canvas');canvas.width=video.videoWidth;canvas.height=video.videoHeight;canvas.getContext('2d').drawImage(video,0,0);
   send(await asBlob(canvas,'image/png'),safeFileName(s.files.video.name)+'-fotograma.png');ctx.toast('Fotograma PNG exportado.');
  }else if(action==='webm'){
   const video=document.querySelector('#forgeVideo');
   if(!canRecordWebM(video))throw Error('Este navegador no permite grabar WebM');
   if(!video.duration||video.duration>90||!Number.isFinite(video.duration))throw Error('Solo vídeos de duración conocida hasta 90 segundos');
   video.pause();video.currentTime=0;
   await new Promise(resolve=>{if(video.readyState>=2&&video.currentTime===0)resolve();else video.addEventListener('seeked',resolve,{once:true})});
   const stream=video.captureStream(),rec=new MediaRecorder(stream,{mimeType:'video/webm'}),chunks=[];
   const result=new Promise((resolve,reject)=>{rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};rec.onerror=()=>reject(Error('Error del codificador'));rec.onstop=()=>{const blob=new Blob(chunks,{type:'video/webm'});blob.size?resolve(blob):reject(Error('Vídeo vacío'))}});
   const stop=()=>{if(rec.state!=='inactive')rec.stop()};
   video.addEventListener('ended',stop,{once:true});rec.start(500);
   const timer=setTimeout(()=>{video.pause();stop()},95000);
   try{await video.play();const blob=await result;send(blob,safeFileName(s.files.video.name)+'.webm');ctx.toast('WebM exportado.');}
   finally{clearTimeout(timer);video.removeEventListener('ended',stop);stop();stream.getTracks().forEach(t=>t.stop())}
  }else return false;
 }catch(err){ctx.toast('Media Forge: '+String(err.message||err).slice(0,125))}
 return true;
}

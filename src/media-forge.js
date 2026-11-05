// MEDIA FORGE · Herramientas multimedia locales originales de MarketHub AI.
// Sin subida de archivos a servidores, ni dependencias de servicios externos.
const s={tab:'photo',files:{},urls:{},image:null,format:'9:16',mask:'orbita',look:'neon',caption:''};
export const SIZES={'9:16':[1080,1920],'4:5':[1080,1350],'1:1':[1080,1080],'16:9':[1920,1080],'3:2':[1500,1000]};
export const MASKS=['orbita','circulo','redondeada','estrella','hexagono','completa'];
const looks={neon:['contrast(1.1) saturate(1.3)','#26e9fb','#eb4df5'],editorial:['contrast(1.06) saturate(.85)','#ffcfa2','#ef9bcd'],noir:['grayscale(1) contrast(1.25)','#f0f4ff','#8190dd'],natural:['none','#ffffff','#8acde9']};
const tabNames={photo:'Foto y máscaras',audio:'Audio y WAV',video:'Vídeo y fotogramas',pdf:'Visor PDF'};
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
 '<label>Texto sobre la composición<input data-forge-input="caption" maxlength="90" value="'+esc(s.caption)+'" placeholder="Tu mensaje opcional"></label>'+
 actions([btn('Exportar PNG','png',!s.image),btn('Exportar JPG','jpeg',!s.image),btn('Exportar WebP','webp',!s.image)])+
 '<p>El editor usa un recorte centrado: no modifica el archivo original. La máscara Órbita combina foto, marcos dobles y formato social.</p>')+
 panel('Vista previa real','<div class="forge-preview"><canvas id="forgeCanvas" role="img" aria-label="Vista previa de composición"></canvas></div>')+'</div>';
}
function audio(){
 return '<div class="forge-grid">'+panel('Reproductor y conversor WAV',upload('audio','audio/*')+
 '<div class="forge-times"><label>Inicio (s)<input id="forgeAudioStart" type="number" value="0" min="0" step=".1"></label><label>Final (s; 0 = completo)<input id="forgeAudioEnd" type="number" value="0" min="0" step=".1"></label></div>'+
 actions([btn('Convertir / recortar a WAV','wav',!s.urls.audio)])+
 '<p>Convierte localmente formatos que el dispositivo pueda decodificar. Exporta PCM WAV, hasta 10 minutos. No promete MP3 sin codificador.</p>')+
 panel('Escuchar',s.urls.audio?'<audio controls preload="metadata" src="'+s.urls.audio+'"></audio>':'<div class="forge-empty">Selecciona un audio para reproducirlo.</div>')+'</div>';
}
function video(){
 return '<div class="forge-grid">'+panel('Visor y conversión de vídeo',upload('video','video/*')+
 actions([btn('Capturar fotograma PNG','frame',!s.urls.video),btn('Convertir vídeo a WebM','webm',!s.urls.video)])+
 '<p>La conversión WebM usa MediaRecorder en tiempo real y requiere compatibilidad del navegador. Límite 90 s. MP4 y otros códecs no se ofrecen como disponibles sin comprobar soporte.</p>')+
 panel('Reproductor integrado',s.urls.video?'<video id="forgeVideo" controls playsinline preload="metadata" src="'+s.urls.video+'"></video>':'<div class="forge-empty">Selecciona un vídeo para reproducirlo.</div>')+'</div>';
}
function pdf(){
 return '<div class="forge-grid">'+panel('Visor de documentos',upload('pdf','application/pdf')+'<p>PDF local. Si tu navegador no permite mostrarlo aquí, puedes abrirlo en otra pestaña.</p>'+(s.urls.pdf?'<a href="'+s.urls.pdf+'" target="_blank" rel="noopener noreferrer">Abrir PDF</a>':''))+
 panel('Documento',s.urls.pdf?'<iframe title="PDF local" class="forge-pdf" src="'+s.urls.pdf+'"></iframe>':'<div class="forge-empty">Abre un PDF.</div>')+'</div>';
}
export function forgePage(){
 return '<section class="media-forge"><header class="forge-head"><div><span class="eyebrow">NEXUS + PULSE · HERRAMIENTAS INTEGRADAS</span><h1>MEDIA FORGE ✦</h1><p>Visualiza, edita y convierte sin salir de MarketHub AI.</p></div><span class="forge-private">◎ Sin subir archivos</span></header>'+
 '<nav class="forge-tabs" aria-label="Laboratorio multimedia">'+Object.entries(tabNames).map(([k,n])=>'<button type="button" data-forge-tab="'+k+'" aria-current="'+(s.tab===k?'page':'false')+'">'+n+'</button>').join('')+'</nav>'+
 (s.tab==='audio'?audio():s.tab==='video'?video():s.tab==='pdf'?pdf():photo())+'</section>';
}
export function forgeTab(name,refresh){if(!tabNames[name])return false;s.tab=name;refresh();return true}
export const outputDimensions=format=>SIZES[format]||SIZES['9:16'];
export const safeFileName=name=>String(name||'media').replace(/\.[^.]*$/,'').replace(/[^a-z0-9_-]/gi,'-').slice(0,70)||'media';
function maskShape(ctx,w,h,mask){
 const r=Math.min(w,h)*.43,cx=w/2,cy=h/2;
 if(mask==='completa'){ctx.rect(0,0,w,h);return}
 if(mask==='circulo'){ctx.arc(cx,cy,r,0,Math.PI*2);return}
 if(mask==='redondeada'){ctx.roundRect(w*.06,h*.06,w*.88,h*.88,Math.min(w,h)*.11);return}
 if(mask==='orbita'){ctx.ellipse(cx,cy,r*.93,r*1.08,-.24,0,Math.PI*2);return}
 const n=mask==='hexagono'?6:10;
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
 if(caption){ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font='800 '+Math.max(15,Math.round(w*.045))+'px system-ui';ctx.shadowColor='#000';ctx.shadowBlur=w*.015;ctx.fillText(caption,w/2,h*.85,w*.85)}
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
 else if(name==='caption')s.caption=String(target.value).slice(0,90);
 else return false;
 forgeMount();return true;
}
export async function forgeFile(target,ctx){
 const type=target?.dataset?.forgeFile;if(!tabNames[type==='photo'?'photo':type])return false;
 const file=target.files?.[0];if(!file)return true;
 const max=type==='video'?250:type==='audio'?60:type==='pdf'?30:25;
 if(!file.size||file.size>max*1048576){ctx.toast('Archivo demasiado grande o vacío (máximo '+max+' MB).');return true}
 const mimeOk=type==='photo'?['image/png','image/jpeg','image/webp','image/gif'].includes(file.type):type==='pdf'?file.type==='application/pdf':file.type.startsWith(type+'/');
 if(!mimeOk){ctx.toast('Formato de archivo no admitido.');return true}
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
  if(['png','jpeg','webp'].includes(action)){
   if(!s.image)throw Error('Primero selecciona una fotografía');
   const mime='image/'+(action==='jpeg'?'jpeg':action),canvas=document.createElement('canvas');composeImage(canvas,s.image);
   const blob=await asBlob(canvas,mime);if(blob.type!==mime)throw Error('Este navegador no admite '+mime);
   send(blob,safeFileName(s.files.photo.name)+'-'+s.format.replace(':','x')+'.'+(action==='jpeg'?'jpg':action));ctx.toast('Imagen exportada.');
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

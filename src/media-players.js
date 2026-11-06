// MarketHub AI · Visores y reproductores locales NEXUS × PULSE.
// Fotos y audio permanecen en el navegador; no se suben ni envían a servicios externos.
export const PLAYER_MAX_IMAGES=10;
export const PLAYER_MAX_IMAGE_BYTES=100*1024*1024;
export const PLAYER_MAX_AUDIO_BYTES=60*1024*1024;
const supportedImages=new Set(['image/jpeg','image/png','image/webp','image/gif']);
export const imageMimeSupported=mime=>supportedImages.has(String(mime||''));
export function nextImageIndex(index,change,count){
 if(!Number.isInteger(count)||count<=0)return 0;
 return ((Number(index)||0)+change%count+count)%count;
}
export function clampZoom(value){const n=Number(value);return Number.isFinite(n)?Math.min(5,Math.max(1,n)):1}
export function formatMediaTime(value){
 if(!Number.isFinite(value)||value<0)return '0:00';
 const secs=Math.floor(value);
 return Math.floor(secs/60)+':'+String(secs%60).padStart(2,'0');
}
const escapeHTML=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const state={
 images:[],selected:0,zoom:1,rotate:0,panX:0,panY:0,expanded:false,
 audio:null,audioUrl:'',rate:1,loop:false,mode:'spectrum',
};
let audioElement=null,audioContext=null,analyser=null,frame=0,observer=null;
let pointers=new Map(),gesture=null,slideshowTimer=null;
const getSelected=()=>state.images[state.selected]||null;
const button=(label,action,disabled=false,aria='')=>'<button type="button" data-forge-action="'+action+'"'+(disabled?' disabled':'')+(aria?' aria-label="'+aria+'"':'')+'>'+label+'</button>';
const fileInput=(label,type,accept,multiple=false)=>'<label class="forge-file">＋ '+label+'<input type="file" data-forge-file="'+type+'" accept="'+accept+'"'+(multiple?' multiple':'')+'></label>';
function imagePanel(){
 const current=getSelected(),has=Boolean(current);
 const gallery=state.images.map((image,i)=>'<button type="button" class="forge-player-thumb'+(i===state.selected?' is-active':'')+'" data-forge-action="player-select" data-id="'+i+'" aria-label="Ver imagen '+(i+1)+': '+escapeHTML(image.name)+'" aria-current="'+(i===state.selected?'true':'false')+'"><img src="'+image.url+'" alt="" loading="lazy"><span>'+(i+1)+'</span></button>').join('');
 return '<section class="forge-panel forge-player-gallery" id="forgePlayerGallery"><div class="forge-player-head"><div><h2>▧ Visor avanzado de imágenes</h2><p>Galería local de hasta 10 imágenes · zoom, giro, pantalla completa y gestos táctiles</p></div><span class="forge-player-count" id="forgePlayerCount">'+(has?(state.selected+1)+' / '+state.images.length:'0 / 0')+'</span></div>'+
 fileInput('Añadir imágenes a la galería','player-images','image/jpeg,image/png,image/webp,image/gif',true)+
 '<div class="forge-player-toolbar" role="group" aria-label="Controles de imagen">'+
 button('◀ Anterior','player-prev',!has,'Imagen anterior')+
 button('▶ Presentación','player-slideshow',!has,'Reproducir presentación de imágenes')+
 button('Siguiente ▶','player-next',!has,'Imagen siguiente')+
 button('−','player-zoom-out',!has,'Reducir imagen')+
 '<output id="forgePlayerZoom" aria-live="polite">'+Math.round(state.zoom*100)+' %</output>'+
 button('+','player-zoom-in',!has,'Ampliar imagen')+
 button('↻ Girar','player-rotate',!has,'Girar 90 grados')+
 button('Ajustar','player-reset',!has,'Restablecer zoom y giro')+
 button('⛶ Ampliar','player-expand',!has,'Pantalla completa')+
 '</div>'+
 '<div class="forge-player-stage'+(has?' has-image':'')+'" id="forgePlayerStage" tabindex="0" role="region" aria-label="Imagen ampliable; flechas para cambiar, más y menos para zoom">'+
 (has?'<img id="forgePlayerImage" src="'+current.url+'" alt="'+escapeHTML(current.name)+'" draggable="false">':
 '<div class="forge-empty">Abre tus imágenes. Puedes navegar sin modificar el archivo original.</div>')+
 '</div><p class="forge-player-caption" id="forgePlayerCaption">'+(has?escapeHTML(current.name)+' · '+current.width+' × '+current.height+' px':'Sin fotografías abiertas')+'</p>'+
 '<div class="forge-player-thumbs" id="forgePlayerThumbs" role="group" aria-label="Miniaturas de la galería">'+gallery+'</div>'+
 '<div class="forge-actions">'+button('Descargar original','player-image-download',!has)+button('Vaciar galería','player-clear-images',!has)+'</div>'+
 '<p class="forge-meta">Desliza para pasar de imagen; pellizca con dos dedos o usa los botones para ampliar. En PC funcionan la rueda del ratón y las flechas del teclado. Las imágenes no salen del dispositivo.</p></section>';
}
function audioPanel(){
 const has=Boolean(state.audioUrl);
 return '<section class="forge-panel forge-player-audio-panel"><div class="forge-player-head"><div><h2>♫ Reproductor y visualizador de sonido</h2><p>Audio real · espectro de frecuencias y forma de onda en directo</p></div><span class="forge-player-count">LOCAL</span></div>'+
 fileInput('Abrir archivo de sonido','player-audio','audio/*')+
 '<p class="forge-meta">'+(has?escapeHTML(state.audio.name)+' · '+(state.audio.size/1048576).toFixed(1)+' MB':'MP3, WAV, AAC, OGG, WebM, según códecs del navegador · hasta 60 MB')+'</p>'+
 (has?'<audio id="forgePlayerAudio" src="'+state.audioUrl+'" controls preload="metadata" playsinline aria-label="Reproductor de audio"></audio>':
 '<div class="forge-empty forge-player-noaudio">Selecciona un audio para escucharlo y activar su visualización.</div>')+
 '<div class="forge-player-toolbar" role="group" aria-label="Controles de sonido">'+
 button('▶ Reproducir / pausar','player-play',!has)+
 button('↶ 10 s','player-back',!has)+
 button('10 s ↷','player-forward',!has)+
 button('Velocidad '+state.rate+'×','player-rate',!has)+
 button('Bucle '+(state.loop?'sí':'no'),'player-loop',!has)+
 '</div>'+
 '<div class="forge-player-visual"><div class="forge-player-visual-head"><strong>Visualización de audio</strong><output id="forgePlayerAudioTime" aria-live="off">0:00 / 0:00</output></div>'+
 '<canvas id="forgePlayerSpectrum" width="900" height="240" role="img" aria-label="Visualización real del audio seleccionado"></canvas>'+
 '<p id="forgePlayerAudioStatus" class="forge-meta" aria-live="polite">'+(has?'Pulsa «Activar visualizador» para analizar el sonido durante la reproducción.':'No hay señal de audio hasta que abras un archivo.')+'</p>'+
 '</div>'+
 '<div class="forge-player-toolbar" role="group" aria-label="Opciones de visualización">'+
 button('✦ Activar visualizador','player-visualize',!has)+
 button('▥ Espectro de frecuencias','player-spectrum',!has)+
 button('∿ Forma de onda','player-waveform',!has)+
 '</div>'+
 '<p class="forge-meta">Visualización calculada con Web Audio API solo cuando el navegador la admite y se concede la activación con un toque. No es reconocimiento de voz ni extracción de datos personales.</p></section>';
}
export function playerPage(){
 return '<div class="forge-player-page"><div class="forge-player-intro"><span class="eyebrow">MEDIA FORGE · REPRODUCTORES REALES</span><p>Imágenes y sonido con controles táctiles y de ratón, sin modificar tus archivos originales.</p></div>'+
 '<div class="forge-player-grid">'+imagePanel()+audioPanel()+'</div></div>';
}
function resetView(){state.zoom=1;state.rotate=0;state.panX=0;state.panY=0}
function updateImage(){
 const img=document.getElementById('forgePlayerImage');
 const current=getSelected();
 if(!img||!current)return;
 img.src=current.url;
 img.alt=current.name;
 img.style.transform='translate('+state.panX+'px,'+state.panY+'px) rotate('+state.rotate+'deg) scale('+state.zoom+')';
 const label=document.getElementById('forgePlayerCaption');
 if(label)label.textContent=current.name+' · '+current.width+' × '+current.height+' px';
 const count=document.getElementById('forgePlayerCount');
 if(count)count.textContent=(state.selected+1)+' / '+state.images.length;
 const zoom=document.getElementById('forgePlayerZoom');
 if(zoom)zoom.textContent=Math.round(state.zoom*100)+' %';
 for(const thumb of document.querySelectorAll('.forge-player-thumb')){
  const active=Number(thumb.dataset.id)===state.selected;
  thumb.classList.toggle('is-active',active);
  thumb.setAttribute('aria-current',String(active));
 }
}
function changeImage(n){
 if(!state.images.length)return;
 state.selected=nextImageIndex(state.selected,n,state.images.length);
 resetView();updateImage();
}
function setZoom(value){
 state.zoom=clampZoom(value);
 if(state.zoom===1){state.panX=0;state.panY=0}
 updateImage();
}
function updatePlayerStatus(message){
 const status=document.getElementById('forgePlayerAudioStatus');if(status)status.textContent=message;
}
function updateAudioTime(){
 const read=audioElement;
 const out=document.getElementById('forgePlayerAudioTime');
 if(out&&read)out.textContent=formatMediaTime(read.currentTime)+' / '+formatMediaTime(read.duration);
}
function drawIdle(){
 const canvas=document.getElementById('forgePlayerSpectrum'),c=canvas?.getContext('2d');if(!c)return;
 c.clearRect(0,0,canvas.width,canvas.height);
 const gradient=c.createLinearGradient(0,0,canvas.width,canvas.height);
 gradient.addColorStop(0,'#091934');gradient.addColorStop(1,'#241349');
 c.fillStyle=gradient;c.fillRect(0,0,canvas.width,canvas.height);
 c.strokeStyle='#2c5b8d';c.lineWidth=1;
 for(let y=30;y<canvas.height;y+=30){c.beginPath();c.moveTo(0,y);c.lineTo(canvas.width,y);c.stroke()}
 c.strokeStyle='#31dcec';c.beginPath();c.moveTo(0,canvas.height/2);c.lineTo(canvas.width,canvas.height/2);c.stroke();
 canvas.dataset.live='false';
}
function drawFrame(){
 frame=0;
 if(!analyser||!audioElement||!audioElement.isConnected){playerTeardown(false);return}
 if(audioElement.paused||audioElement.ended)return;
 const canvas=document.getElementById('forgePlayerSpectrum'),c=canvas?.getContext('2d');
 if(!c)return;
 const w=canvas.width,h=canvas.height;
 c.fillStyle='#091630';c.fillRect(0,0,w,h);
 const gradient=c.createLinearGradient(0,0,w,h);
 gradient.addColorStop(0,'#21ecff');gradient.addColorStop(.48,'#7774ff');gradient.addColorStop(1,'#ed51e7');
 if(state.mode==='waveform'){
  const bytes=new Uint8Array(analyser.fftSize);
  analyser.getByteTimeDomainData(bytes);
  c.beginPath();c.lineWidth=3;c.strokeStyle=gradient;
  const step=w/(bytes.length-1);
  for(let i=0;i<bytes.length;i++){
   const y=h/2+((bytes[i]-128)/128)*h*.42;
   if(i)c.lineTo(i*step,y);else c.moveTo(0,y);
  }
  c.stroke();
 }else{
  const bytes=new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(bytes);
  const bars=72,band=bytes.length/bars,slot=w/bars;
  for(let i=0;i<bars;i++){
   let sum=0;const from=Math.floor(i*band),to=Math.min(bytes.length,Math.ceil((i+1)*band));
   for(let j=from;j<to;j++)sum+=bytes[j];
   const energy=sum/Math.max(1,to-from)/255;
   const height=Math.max(1,energy*(h-14));
   c.fillStyle=gradient;c.fillRect(i*slot+1,h-height,Math.max(2,slot-2),height);
  }
 }
 canvas.dataset.live='true';
 updateAudioTime();
 frame=requestAnimationFrame(drawFrame);
}
function startDrawing(){
 if(!frame&&analyser&&audioElement&&!audioElement.paused&&!audioElement.ended)
  frame=requestAnimationFrame(drawFrame);
}
function destroyAudioGraph(){
 if(frame)cancelAnimationFrame(frame);frame=0;
 if(audioElement){audioElement.pause();audioElement=null}
 analyser=null;
 if(audioContext){const old=audioContext;audioContext=null;void old.close().catch(()=>{})}
}
export function playerTeardown(closeGallery=false){
 if(slideshowTimer){clearInterval(slideshowTimer);slideshowTimer=null}
 destroyAudioGraph();
 if(observer){observer.disconnect();observer=null}
 pointers.clear();gesture=null;
 if(state.expanded&&typeof document!=='undefined'){
  state.expanded=false;document.body.style.overflow='';
 }
 if(closeGallery){for(const item of state.images)URL.revokeObjectURL(item.url);state.images=[];state.selected=0;
  if(state.audioUrl)URL.revokeObjectURL(state.audioUrl);state.audio=null;state.audioUrl='';}
}
function listenAudio(){
 const audio=document.getElementById('forgePlayerAudio');
 if(!audio||audioElement===audio)return;
 if(audioElement&&audioElement!==audio)destroyAudioGraph();
 audioElement=audio;audio.playbackRate=state.rate;audio.loop=state.loop;
 audio.addEventListener('timeupdate',updateAudioTime);
 audio.addEventListener('loadedmetadata',updateAudioTime);
 audio.addEventListener('durationchange',updateAudioTime);
 audio.addEventListener('play',()=>{if(audioContext?.state==='suspended')void audioContext.resume().catch(()=>{});startDrawing()});
 audio.addEventListener('pause',()=>{if(frame)cancelAnimationFrame(frame);frame=0;updateAudioTime()});
 audio.addEventListener('ended',()=>{if(frame)cancelAnimationFrame(frame);frame=0;updateAudioTime()});
 audio.addEventListener('error',()=>updatePlayerStatus('No se puede decodificar este formato con los códecs de tu navegador.'));
}
function bindGestures(){
 const stage=document.getElementById('forgePlayerStage');
 if(!stage||!getSelected()||stage.dataset.bound)return;
 stage.dataset.bound='true';
 stage.addEventListener('wheel',event=>{
  if(!getSelected())return;
  event.preventDefault();setZoom(state.zoom+(event.deltaY<0?.2:-.2));
 },{passive:false});
 stage.addEventListener('keydown',event=>{
  if(event.key==='ArrowLeft'){event.preventDefault();changeImage(-1)}
  else if(event.key==='ArrowRight'){event.preventDefault();changeImage(1)}
  else if(event.key==='+'||event.key==='='){event.preventDefault();setZoom(state.zoom+.2)}
  else if(event.key==='-'){event.preventDefault();setZoom(state.zoom-.2)}
 });
 stage.addEventListener('pointerdown',event=>{
  if(event.pointerType==='mouse'&&event.button!==0)return;
  if(pointers.size>=2)return;
  pointers.set(event.pointerId,{x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY});
  try{stage.setPointerCapture(event.pointerId)}catch{}
  if(pointers.size===2){
   const [a,b]=[...pointers.values()];
   gesture={distance:Math.hypot(a.x-b.x,a.y-b.y),zoom:state.zoom};
  }
 });
 stage.addEventListener('pointermove',event=>{
  if(!pointers.has(event.pointerId))return;
  const p=pointers.get(event.pointerId),dx=event.clientX-p.x,dy=event.clientY-p.y;
  p.x=event.clientX;p.y=event.clientY;
  if(pointers.size===2&&gesture){
   const [a,b]=[...pointers.values()];
   if(gesture.distance>0)setZoom(gesture.zoom*Math.hypot(a.x-b.x,a.y-b.y)/gesture.distance);
  }else if(state.zoom>1){
   state.panX=Math.max(-650,Math.min(650,state.panX+dx));
   state.panY=Math.max(-650,Math.min(650,state.panY+dy));
   updateImage();
  }
 });
 const pointerFinish=event=>{
  const pointer=pointers.get(event.pointerId);
  if(!pointer)return;
  const total=pointer.x-pointer.startX;
  const wasPinch=Boolean(gesture);
  pointers.delete(event.pointerId);if(pointers.size<2)gesture=null;
  if(!wasPinch&&state.zoom<=1.05&&Math.abs(total)>65)changeImage(total<0?1:-1);
 };
 stage.addEventListener('pointerup',pointerFinish);
 stage.addEventListener('pointercancel',pointerFinish);
}
function bindKeyboard(){
 const gallery=document.getElementById('forgePlayerGallery');
 if(!gallery||gallery.dataset.keybound)return;
 gallery.dataset.keybound='true';
 gallery.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&state.expanded){event.preventDefault();toggleExpand()}
 });
}
function toggleExpand(){
 state.expanded=!state.expanded;
 const node=document.getElementById('forgePlayerGallery');
 node?.classList.toggle('is-expanded',state.expanded);
 if(typeof document!=='undefined')document.body.style.overflow=state.expanded?'hidden':'';
 const button=document.querySelector('[data-forge-action="player-expand"]');
 if(button)button.textContent=state.expanded?'✕ Cerrar':'⛶ Ampliar';
 if(state.expanded)document.getElementById('forgePlayerStage')?.focus();
}
export function playerMount(){
 if(typeof document==='undefined')return;
 listenAudio();bindGestures();bindKeyboard();updateImage();drawIdle();updateAudioTime();
 if(observer){observer.disconnect();observer=null}
 const app=document.getElementById('app');
 if(app&&typeof MutationObserver!=='undefined'){
  const gallery=document.getElementById('forgePlayerGallery');
  observer=new MutationObserver(()=>{
   if(gallery&&!gallery.isConnected){playerTeardown(false)}
  });
  observer.observe(app,{childList:true});
 }
}
export async function playerFile(target,ctx){
 const kind=target?.dataset?.forgeFile;
 if(!['player-images','player-audio'].includes(kind))return false;
 const files=[...(target.files||[])];
 target.value='';
 if(!files.length)return true;
 if(kind==='player-images'){
  const current=state.images.reduce((a,x)=>a+x.size,0);
  const total=current+files.reduce((a,x)=>a+x.size,0);
  if(state.images.length+files.length>PLAYER_MAX_IMAGES||total>PLAYER_MAX_IMAGE_BYTES){
   ctx.toast('La galería admite como máximo 10 fotos y 100 MB entre todas.');return true;
  }
  const pending=[];
  try{
   for(const file of files){
    if(!imageMimeSupported(file.type)||file.size<1||file.size>25*1024*1024)throw Error('Imagen no admitida o mayor de 25 MB');
    const url=URL.createObjectURL(file);
    try{
     const image=new Image();image.src=url;await image.decode();
     if(!image.naturalWidth||!image.naturalHeight||image.naturalWidth*image.naturalHeight>50000000)throw Error('Imagen excesivamente grande');
     pending.push({name:file.name.slice(0,180),url,size:file.size,width:image.naturalWidth,height:image.naturalHeight});
    }catch(error){URL.revokeObjectURL(url);throw error}
   }
   state.selected=state.images.length;
   state.images.push(...pending);resetView();
   playerTeardown(false);
   ctx.refresh();ctx.toast(files.length+' imagen(es) añadida(s) al visor.');
  }catch(error){
   pending.forEach(x=>URL.revokeObjectURL(x.url));
   ctx.toast('No se pudo cargar la galería: '+String(error.message||error).slice(0,105));
  }
  return true;
 }
 const file=files[0];
 if(!file.type.startsWith('audio/')||!file.size||file.size>PLAYER_MAX_AUDIO_BYTES){
  ctx.toast('Selecciona un audio válido de hasta 60 MB.');return true;
 }
 const url=URL.createObjectURL(file),old=state.audioUrl;
 playerTeardown(false);
 state.audio={name:file.name.slice(0,180),size:file.size};state.audioUrl=url;
 if(old)URL.revokeObjectURL(old);
 ctx.refresh();ctx.toast('Audio listo para reproducir y analizar.');
 return true;
}
export async function playerClick(target,ctx){
 const action=target?.dataset?.forgeAction||'';
 if(!action.startsWith('player-'))return false;
 try{
  if(action==='player-slideshow'){
   if(state.images.length<2){ctx.toast('Añade al menos dos imágenes para la presentación.');return true}
   if(slideshowTimer){clearInterval(slideshowTimer);slideshowTimer=null;target.textContent='▶ Presentación'}
   else{slideshowTimer=setInterval(()=>changeImage(1),3500);target.textContent='Ⅱ Detener presentación'}
  }else if(action==='player-select'){
   const index=Number(target.dataset.id);
   if(Number.isInteger(index)&&index>=0&&index<state.images.length){state.selected=index;resetView();updateImage()}
  }else if(action==='player-prev')changeImage(-1);
  else if(action==='player-next')changeImage(1);
  else if(action==='player-zoom-in')setZoom(state.zoom+.25);
  else if(action==='player-zoom-out')setZoom(state.zoom-.25);
  else if(action==='player-rotate'){state.rotate=(state.rotate+90)%360;state.panX=0;state.panY=0;updateImage()}
  else if(action==='player-reset'){resetView();updateImage()}
  else if(action==='player-expand'){if(getSelected())toggleExpand()}
  else if(action==='player-clear-images'){
   if(state.images.length&&window.confirm('¿Vaciar la galería actual? Solo se descartan las copias temporales del visor.')){
    for(const item of state.images)URL.revokeObjectURL(item.url);
    state.images=[];state.selected=0;resetView();playerTeardown(false);ctx.refresh();
   }
  }else if(action==='player-image-download'){
   const image=getSelected();if(!image)throw Error('Abre una imagen');
   const a=document.createElement('a');a.href=image.url;a.download=image.name;document.body.append(a);a.click();a.remove();
   ctx.toast('Descargando imagen original.');
  }else if(action==='player-play'){
   if(!audioElement)throw Error('Abre un archivo de sonido');
   if(audioElement.paused){
    if(audioContext?.state==='suspended')await audioContext.resume();
    await audioElement.play();
   }else audioElement.pause();
  }else if(action==='player-back'||action==='player-forward'){
   if(!audioElement)throw Error('Abre un archivo de sonido');
   audioElement.currentTime=Math.max(0,Math.min(Number.isFinite(audioElement.duration)?audioElement.duration:1e15,
    audioElement.currentTime+(action==='player-back'?-10:10)));
   updateAudioTime();
  }else if(action==='player-rate'){
   state.rate=state.rate===1?1.25:state.rate===1.25?1.5:state.rate===1.5?.75:1;
   if(audioElement)audioElement.playbackRate=state.rate;
   target.textContent='Velocidad '+state.rate+'×';
  }else if(action==='player-loop'){
   state.loop=!state.loop;if(audioElement)audioElement.loop=state.loop;
   target.textContent='Bucle '+(state.loop?'sí':'no');
  }else if(action==='player-spectrum'||action==='player-waveform'){
   state.mode=action==='player-waveform'?'waveform':'spectrum';
   updatePlayerStatus('Modo '+(state.mode==='waveform'?'forma de onda':'espectro')+' seleccionado. '+(analyser?'Analizando sonido real.':'Activa el visualizador para ver la señal.'));
  }else if(action==='player-visualize'){
   if(!audioElement)throw Error('Abre un archivo de sonido');
   if(!audioContext){
    const Audio=window.AudioContext||window.webkitAudioContext;
    if(!Audio){updatePlayerStatus('Este navegador no ofrece Web Audio; el reproductor de audio sigue disponible.');return true}
    const context=new Audio();
    try{
     const node=context.createMediaElementSource(audioElement);
     const meter=context.createAnalyser();
     meter.fftSize=1024;meter.smoothingTimeConstant=.82;
     node.connect(meter);meter.connect(context.destination);
     audioContext=context;analyser=meter;
    }catch(error){void context.close().catch(()=>{});throw error}
   }
   // Safari iOS puede dejar pendiente resume() hasta que empiece play().
   // No bloquear la interfaz ni perder el feedback del toque: se reintenta en el evento play.
   updatePlayerStatus('Visualizador activado. Reproduce el audio para ver datos reales.');
   target.textContent='✦ Visualizador activo';
   void audioContext.resume().then(()=>startDrawing()).catch(()=>{
    updatePlayerStatus('Visualización no disponible en esta sesión. Puedes seguir usando el reproductor de audio.');
   });
   startDrawing();
  }else return false;
 }catch(error){ctx.toast('Visores: '+String(error.message||error).slice(0,115))}
 return true;
}

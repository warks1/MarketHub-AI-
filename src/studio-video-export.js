// MarketHub AI · renderización local de vídeo corto del storyboard.
// No API externa, sin pistas musicales ni IA ficticia.
// MediaRecorder elige WebM o MP4 según la compatibilidad real del navegador.
import {drawScene,sceneDimensions} from './studio-scene-export.js';
import {isSceneImageData,loadSceneImage} from './studio-scene-media.js';

export const VIDEO_LIMITS=Object.freeze({maxScenes:12,maxSeconds:45,framesPerSecond:24,shortSide:720,bitrate:2400000});
export const videoMimeCandidates=[
 'video/mp4;codecs=avc1.42E01E','video/mp4',
 'video/webm;codecs=vp8','video/webm;codecs=vp9','video/webm'
];

export function supportedVideoMime(recorder=typeof MediaRecorder!=='undefined'?MediaRecorder:null){
 if(!recorder||typeof recorder.isTypeSupported!=='function')return null;
 return videoMimeCandidates.find(type=>recorder.isTypeSupported(type))||null;
}
export function videoSupported(){
 return typeof document!=='undefined'&&
 typeof HTMLCanvasElement!=='undefined'&&
 typeof HTMLCanvasElement.prototype.captureStream==='function'&&
 !!supportedVideoMime();
}
export function videoFormatDimensions(format){
 return format==='16:9'?[1280,720]:[720,1280];
}
export function validateVideoExport(scenes,format){
 if(format!=='9:16'&&format!=='16:9')return {error:'Selecciona un formato de vídeo válido.'};
 if(!Array.isArray(scenes)||scenes.length<1)return {error:'Añade una escena al storyboard.'};
 if(scenes.length>VIDEO_LIMITS.maxScenes)return {error:'Por seguridad en móviles, el vídeo admite hasta 12 escenas.'};
 let duration=0;
 for(const scene of scenes){
  const time=Number(scene?.duration);
  if(!scene||!Number.isFinite(time)||time<1||time>60)
   return {error:'Cada escena debe durar entre 1 y 60 segundos.'};
  duration+=time;
 }
 if(duration>VIDEO_LIMITS.maxSeconds)return {error:'Para evitar bloqueos, el vídeo local puede durar hasta 45 segundos.'};
 return {totalSeconds:duration,width:videoFormatDimensions(format)[0],height:videoFormatDimensions(format)[1]};
}
function aborted(){const error=new Error('La exportación de vídeo se ha cancelado.');error.name='AbortError';return error;}
const waitFrame=()=>new Promise(resolve=>{
 if(typeof requestAnimationFrame==='function')requestAnimationFrame(resolve);
 else setTimeout(resolve,40);
});
async function prepareCanvas(scene,format,width,height){
 const stage=document.createElement('canvas');stage.width=width;stage.height=height;
 const ctx=stage.getContext('2d',{alpha:false});
 if(!ctx)throw Error('No se ha podido inicializar el lienzo de vídeo.');
 const photo=isSceneImageData(scene.imageData)?await loadSceneImage(scene.imageData):null;
 const [baseW,baseH]=sceneDimensions(format);
 ctx.save();ctx.scale(width/baseW,height/baseH);
 drawScene(ctx,scene,format,photo);ctx.restore();
 return stage;
}
const totalDuration=scenes=>scenes.reduce((acc,s)=>acc+Number(s.duration),0);
export function sceneAtTime(scenes,time){
 let elapsed=0;
 for(let index=0;index<scenes.length;index++){
  const seconds=Number(scenes[index].duration);
  if(time<elapsed+seconds||index===scenes.length-1)
   return {index,sceneTime:Math.max(0,time-elapsed),duration:seconds};
  elapsed+=seconds;
 }
 return {index:0,sceneTime:0,duration:0};
}
export async function renderStoryboardVideo({scenes,format='9:16',onProgress=()=>{},signal}={}){
 const validation=validateVideoExport(scenes,format);
 if(validation.error)throw Error(validation.error);
 if(!videoSupported())throw Error('Este navegador no dispone de grabación de vídeo local compatible. Puedes exportar PNG o JSON.');
 if(signal?.aborted)throw aborted();
 const {width,height,totalSeconds}=validation;
 const snapshots=[];
 for(let i=0;i<scenes.length;i++){
  if(signal?.aborted)throw aborted();
  snapshots.push(await prepareCanvas(scenes[i],format,width,height));
  onProgress({phase:'preparando',percent:Math.round((i+1)/scenes.length*10)});
  await waitFrame();
 }
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d',{alpha:false});
 if(!ctx)throw Error('No se ha podido crear la superficie de grabación.');
 const stream=canvas.captureStream(VIDEO_LIMITS.framesPerSecond);
 const mime=supportedVideoMime();
 let recorder;
 try{recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:VIDEO_LIMITS.bitrate})}
 catch{stream.getTracks().forEach(track=>track.stop());throw Error('El formato de vídeo elegido no puede grabarse en este dispositivo.')}
 const chunks=[];
 let stopped=false,finished=false,raf=null,startedAt=0,lastProgress=-1;
 const mimeOut=recorder.mimeType||mime;
 const extension=mimeOut.includes('mp4')?'mp4':'webm';
 const result=await new Promise((resolve,reject)=>{
  let abortListener;
  function cleanup(){
   if(raf!=null)cancelAnimationFrame(raf);
   if(abortListener&&signal)signal.removeEventListener('abort',abortListener);
   stream.getTracks().forEach(t=>t.stop());
  }
  function fail(error){
   if(finished)return;finished=true;cleanup();
   if(recorder.state!=='inactive'){try{recorder.stop()}catch{}}
   reject(error);
  }
  function complete(){
   if(finished)return;finished=true;cleanup();
   if(signal?.aborted){reject(aborted());return}
   const blob=new Blob(chunks,{type:mimeOut});
   if(blob.size<3000){reject(new Error('El navegador no ha producido un vídeo válido.'));return}
   resolve({blob,width,height,seconds:totalSeconds,extension,mimeType:mimeOut});
  }
  function frame(){
   if(finished)return;
   if(signal?.aborted){fail(aborted());return}
   const t=Math.min(totalSeconds,Math.max(0,(performance.now()-startedAt)/1000));
   const cursor=sceneAtTime(scenes,t);
   const frameImage=snapshots[cursor.index];
   if(frameImage){
    // Zoom sutil de los fotogramas y fundido de los 0,4 s finales.
    const scale=1+.015*Math.min(1,cursor.sceneTime/Math.max(1,cursor.duration));
    ctx.save();ctx.fillStyle='#050a20';ctx.fillRect(0,0,width,height);
    ctx.translate(width/2,height/2);ctx.scale(scale,scale);
    ctx.drawImage(frameImage,-width/2,-height/2,width,height);ctx.restore();
    if(cursor.index<snapshots.length-1){
     const fadeSeconds=Math.min(.4,cursor.duration*.3);
     const opacity=Math.max(0,(cursor.sceneTime-(cursor.duration-fadeSeconds))/fadeSeconds);
     if(opacity>0){ctx.globalAlpha=opacity;ctx.drawImage(snapshots[cursor.index+1],0,0,width,height);ctx.globalAlpha=1}
    }
   }
   const percent=Math.min(100,Math.round(t/totalSeconds*100));
   if(percent!==lastProgress&&percent%2===0){
    lastProgress=percent;
    onProgress({phase:'grabando',percent,seconds:t});
   }
   if(t>=totalSeconds){
    if(recorder.state==='recording'){recorder.requestData();recorder.stop()}
    return;
   }
   raf=requestAnimationFrame(frame);
  }
  recorder.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};
  recorder.onerror=e=>fail(e.error||new Error('No se ha podido grabar el vídeo.'));
  recorder.onstop=complete;
  abortListener=()=>fail(aborted());
  if(signal)signal.addEventListener('abort',abortListener,{once:true});
  try{
   ctx.drawImage(snapshots[0],0,0,width,height);
   recorder.start(750);
   startedAt=performance.now();
   frame();
  }catch(error){fail(error)}
 });
 onProgress({phase:'completado',percent:100,seconds:totalSeconds});
 return result;
}
export function saveVideoDownload(result){
 if(!result?.blob)throw Error('No hay un vídeo para descargar.');
 const url=URL.createObjectURL(result.blob);
 const a=document.createElement('a');
 a.href=url;a.download='markethub-video-'+new Date().toISOString().slice(0,10)+'.'+result.extension;
 document.body.appendChild(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),60000);
 return a.download;
}

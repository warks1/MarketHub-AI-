// MarketHub AI · imágenes locales del storyboard, sin subir contenido a servidores.
export const SCENE_IMAGE_MIMES=['image/jpeg','image/png','image/webp'];
export const MAX_SOURCE_IMAGE_BYTES=8*1024*1024;
export const MAX_SCENE_IMAGE_DATA=270000; // carácter incluido en JSON/localStorage
export const MAX_TOTAL_SCENE_MEDIA=1350000;
export const isSceneImageData=x=>typeof x==='string'&&x.length<=MAX_SCENE_IMAGE_DATA&&
 /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(x);
export const sceneMediaLength=scenes=>Array.isArray(scenes)?scenes.reduce((sum,scene)=>sum+
 (isSceneImageData(scene?.imageData)?scene.imageData.length:0),0):0;
export const canStoreSceneImage=(scenes,sceneId,data)=>{
 if(!isSceneImageData(data))return false;
 const current=Array.isArray(scenes)?scenes:[];
 let total=data.length;
 for(const scene of current){
  if(String(scene?.id)===String(sceneId))continue;
  if(isSceneImageData(scene?.imageData))total+=scene.imageData.length;
 }
 return total<=MAX_TOTAL_SCENE_MEDIA;
};
function loadFromBlob(file){
 return new Promise((resolve,reject)=>{
  const url=URL.createObjectURL(file);
  const image=new Image();
  image.onload=()=>{URL.revokeObjectURL(url);resolve(image)};
  image.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('La fotografía no se puede abrir.'))};
  image.src=url;
 });
}
export async function imageFileToSceneData(file){
 if(!file||!SCENE_IMAGE_MIMES.includes(file.type))throw Error('Utiliza una fotografía JPG, PNG o WebP.');
 if(!Number.isFinite(file.size)||file.size<1||file.size>MAX_SOURCE_IMAGE_BYTES)
  throw Error('La fotografía debe ocupar entre 1 byte y 8 MB.');
 const image=await loadFromBlob(file);
 const iw=image.naturalWidth,ih=image.naturalHeight;
 if(!(iw>0&&ih>0)||iw*ih>26000000)throw Error('La fotografía tiene unas dimensiones demasiado grandes.');
 if(typeof document==='undefined')throw Error('La importación de imágenes requiere un navegador.');
 const canvas=document.createElement('canvas');
 const ctx=canvas.getContext('2d',{alpha:false});
 if(!ctx)throw Error('No se pudo preparar la imagen.');
 const maxSide=1200;
 const factor=Math.min(1,maxSide/Math.max(iw,ih));
 const baseWidth=Math.max(1,Math.round(iw*factor)),baseHeight=Math.max(1,Math.round(ih*factor));
 for(const widthRatio of [1,.8,.6,.42]){
  canvas.width=Math.max(1,Math.round(baseWidth*widthRatio));
  canvas.height=Math.max(1,Math.round(baseHeight*widthRatio));
  ctx.drawImage(image,0,0,canvas.width,canvas.height);
  for(const quality of [.83,.68,.52]){
   const data=canvas.toDataURL('image/jpeg',quality);
   if(isSceneImageData(data))return data;
  }
 }
 throw Error('No se pudo comprimir la fotografía. Prueba con una imagen más pequeña.');
}
export function loadSceneImage(data){
 if(!isSceneImageData(data))return Promise.reject(new Error('La escena no contiene una imagen válida.'));
 return new Promise((resolve,reject)=>{
  const img=new Image();
  img.onload=()=>resolve(img);
  img.onerror=()=>reject(new Error('No se ha podido recuperar la fotografía guardada.'));
  img.src=data;
 });
}
export function drawImageCover(ctx,image,width,height){
 const iw=Number(image?.naturalWidth||image?.width),ih=Number(image?.naturalHeight||image?.height);
 if(!(iw>0&&ih>0))throw Error('Dimensiones de fotografía inválidas.');
 const scale=Math.max(width/iw,height/ih);
 const sw=width/scale,sh=height/scale;
 const sx=(iw-sw)/2,sy=(ih-sh)/2;
 ctx.drawImage(image,sx,sy,sw,sh,0,0,width,height);
}

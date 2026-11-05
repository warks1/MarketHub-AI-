// Media Forge · proyectos creativos editables, conservando la foto fuente.
// Independiente de Mi biblioteca existente: NO modifica su IndexedDB ni sus datos.
const DB='markethub-creative-projects-v1',STORE='projects',VERSION=1;
export const MAX_PROJECTS=12,MAX_PROJECT_IMAGE_BYTES=8*1024*1024,MAX_PROJECT_TOTAL_BYTES=80*1024*1024;
export const PROJECT_FORMATS=['9:16','4:5','1:1','16:9','3:2'];
export const PROJECT_MASKS=['orbita','circulo','ovalada','redondeada','estrella','hexagono','pentagono','octagono','triangulo','diamante','corazon','banda-horizontal','banda-vertical','ventana','completa'];
const LOOKS=['neon','editorial','noir','natural'],IMAGE_TYPES=['image/png','image/jpeg','image/webp','image/gif'];
const COLOR=/^#[\da-f]{6}$/i;
export const projectStorageSupported=()=>typeof indexedDB!=='undefined'&&typeof indexedDB.open==='function';
const clean=(text,max)=>String(text??'').replace(/[\x00-\x1f<>]/g,'').trim().slice(0,max);
const nameOk=s=>s.length>=2;
export function normalizeProjectSettings(value={}){
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Ajustes de proyecto inválidos');
 const fmt=value.format||'9:16',mask=value.mask||'orbita',look=value.look||'neon',safezone=value.safezone||'off';
 if(!PROJECT_FORMATS.includes(fmt)||!PROJECT_MASKS.includes(mask)||!LOOKS.includes(look)||!['on','off'].includes(safezone))
  throw Error('La composición incluye un formato, máscara o estilo no permitido');
 const brandActive=value.brandActive===true;
 const brandPrimary=String(value.brandPrimary||'#26E9FB'),brandAccent=String(value.brandAccent||'#EB4DF5');
 if(!COLOR.test(brandPrimary)||!COLOR.test(brandAccent))throw Error('Colores de marca incorrectos');
 return {format:fmt,mask,look,safezone,caption:clean(value.caption,90),
  brandActive,brandPrimary:brandPrimary.toUpperCase(),brandAccent:brandAccent.toUpperCase()};
}
export function validateCreativeProject({name,file,settings}={}){
 const title=clean(name,70);
 if(!nameOk(title))throw Error('Escribe un nombre para el proyecto de al menos dos caracteres');
 if(!(file instanceof Blob)||!IMAGE_TYPES.includes(file.type)||file.size<1||file.size>MAX_PROJECT_IMAGE_BYTES)
  throw Error('El proyecto debe incluir una imagen JPG/PNG/WebP/GIF de hasta 8 MB');
 return {name:title,type:file.type,size:file.size,settings:normalizeProjectSettings(settings)};
}
function openDb(){
 if(!projectStorageSupported())return Promise.reject(Error('Los proyectos necesitan IndexedDB en este dispositivo'));
 return new Promise((resolve,reject)=>{
  const req=indexedDB.open(DB,VERSION);
  req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE,{keyPath:'id'})};
  req.onsuccess=()=>{const db=req.result;db.onversionchange=()=>db.close();resolve(db)};
  req.onerror=()=>reject(req.error||Error('No se pudo abrir la base de proyectos'));
  req.onblocked=()=>reject(Error('Cierra otras pestañas de MarketHub para actualizar los proyectos'));
 });
}
async function transact(mode,callback){
 const db=await openDb();
 try{return await new Promise((resolve,reject)=>{
  const tx=db.transaction(STORE,mode),object=tx.objectStore(STORE);let result;
  let request;try{request=callback(object)}catch(err){tx.abort();reject(err);return}
  request.onsuccess=()=>{result=request.result};
  tx.oncomplete=()=>resolve(result);
  tx.onerror=()=>reject(tx.error||Error('No se pudo completar el guardado'));
  tx.onabort=()=>reject(tx.error||Error('Se canceló el cambio del proyecto'));
 })}finally{db.close()}
}
const metadata=({id,name,type,size,createdAt,updatedAt,settings})=>({id,name,type,size,createdAt,updatedAt,settings});
export async function listCreativeProjects(){
 const records=await transact('readonly',store=>store.getAll());
 return records.map(metadata).sort((a,b)=>b.updatedAt-a.updatedAt);
}
export async function openCreativeProject(id){
 const record=await transact('readonly',store=>store.get(String(id)));
 if(!record)throw Error('Proyecto no encontrado');
 if(!(record.bytes instanceof ArrayBuffer))throw Error('El archivo original del proyecto está dañado');
 const file=new Blob([record.bytes],{type:record.type});
 validateCreativeProject({name:record.name,file,settings:record.settings});
 return {...metadata(record),file};
}
export async function saveCreativeProject({id=null,name,file,settings}={}){
 const cleanEntry=validateCreativeProject({name,file,settings});
 const list=await listCreativeProjects(),prior=id?list.find(item=>item.id===id):undefined;
 if(id&&!prior)throw Error('No se encuentra el proyecto para actualizarlo');
 if(!prior&&list.length>=MAX_PROJECTS)throw Error('Máximo de '+MAX_PROJECTS+' proyectos. Exporta alguno antes de continuar');
 const used=list.reduce((n,item)=>n+item.size,0)-(prior?.size||0);
 if(used+cleanEntry.size>MAX_PROJECT_TOTAL_BYTES)throw Error('Almacenamiento de proyectos completo (80 MB)');
 const bytes=await file.arrayBuffer(),now=Date.now();
 const projectId=prior?.id||(globalThis.crypto?.randomUUID?.()||now.toString(36)+'-'+Math.random().toString(36).slice(2));
 const record={...cleanEntry,id:projectId,bytes,createdAt:prior?.createdAt||now,updatedAt:now};
 await transact('readwrite',store=>store.put(record));
 return metadata(record);
}
export async function removeCreativeProject(id){
 const before=await openCreativeProject(id);
 await transact('readwrite',store=>store.delete(before.id));
 return true;
}
function bytesToBase64(bytes){
 // Multiplo de 3 para que btoa no agregue relleno entre fragmentos.
 const blocks=[];const step=24576;
 for(let i=0;i<bytes.length;i+=step){const piece=bytes.subarray(i,i+step);blocks.push(btoa(String.fromCharCode(...piece)))}
 return blocks.join('');
}
function base64ToBytes(base64){
 if(typeof base64!=='string'||base64.length>Math.ceil(MAX_PROJECT_IMAGE_BYTES/3)*4+8||
    base64.length%4!==0||!/^[A-Za-z0-9+/]+={0,2}$/.test(base64))
  throw Error('La copia de seguridad contiene datos de imagen inválidos');
 const out=new Uint8Array(base64.length/4*3-(base64.endsWith('==')?2:base64.endsWith('=')?1:0));
 let offset=0;
 for(let i=0;i<base64.length;i+=32768){
  const chunk=atob(base64.slice(i,i+32768));
  for(let j=0;j<chunk.length;j++)out[offset++]=chunk.charCodeAt(j);
 }
 if(out.length<1||out.length>MAX_PROJECT_IMAGE_BYTES)throw Error('La imagen importada supera el límite');
 return out;
}
export async function portableCreativeProject(id){
 const project=await openCreativeProject(id);
 const bytes=new Uint8Array(await project.file.arrayBuffer());
 const data={app:'MarketHub AI',format:'mhub-creative-project',version:1,
  name:project.name,filename:'fuente-'+project.id,sourceType:project.type,
  sourceBase64:bytesToBase64(bytes),settings:project.settings};
 return new Blob([JSON.stringify(data)],{type:'application/json'});
}
export function parsePortableCreativeProject(json){
 if(typeof json!=='string'||json.length>12*1024*1024)throw Error('El proyecto importado supera 12 MB');
 let data;try{data=JSON.parse(json)}catch{throw Error('El archivo no es un proyecto MarketHub válido')}
 if(!data||data.app!=='MarketHub AI'||data.format!=='mhub-creative-project'||data.version!==1)
  throw Error('El archivo no es un proyecto creativo compatible');
 if(!IMAGE_TYPES.includes(data.sourceType))throw Error('Tipo de imagen no admitido');
 const bytes=base64ToBytes(data.sourceBase64),file=new Blob([bytes],{type:data.sourceType});
 const normalized=validateCreativeProject({name:data.name,file,settings:data.settings});
 return {...normalized,file};
}
export async function importPortableCreativeProject(blob){
 if(!(blob instanceof Blob)||blob.size>12*1024*1024||blob.size<10)throw Error('Copia de proyecto inválida o demasiado grande');
 const contents=parsePortableCreativeProject(await blob.text());
 return saveCreativeProject(contents);
}

/** Importar un lote validado en UNA transacción. Si falta espacio, no sobrescribe nada. */
export async function importCreativeProjectBatch(entries){
 if(!Array.isArray(entries)||!entries.length||entries.length>MAX_PROJECTS)throw Error('El lote contiene un número de proyectos no admitido');
 const prepared=[];
 for(const entry of entries){
  const valid=validateCreativeProject(entry);
  prepared.push({...valid,bytes:await entry.file.arrayBuffer()});
 }
 const existing=await listCreativeProjects();
 const total=prepared.reduce((sum,item)=>sum+item.size,existing.reduce((sum,item)=>sum+item.size,0));
 if(existing.length+prepared.length>MAX_PROJECTS)throw Error('No hay suficientes huecos: exporta y elimina proyectos antes de importar el lote');
 if(total>MAX_PROJECT_TOTAL_BYTES)throw Error('El lote supera la capacidad de proyectos de 80 MB');
 const db=await openDb(),now=Date.now();
 try{
  return await new Promise((resolve,reject)=>{
   const tx=db.transaction(STORE,'readwrite'),store=tx.objectStore(STORE);
   const ids=[];
   prepared.forEach((entry,i)=>{
    const id=globalThis.crypto?.randomUUID?.()||now.toString(36)+'-'+i+'-'+Math.random().toString(36).slice(2);
    ids.push(id);
    store.add({...entry,id,createdAt:now,updatedAt:now});
   });
   tx.oncomplete=()=>resolve(ids);
   tx.onabort=()=>reject(tx.error||Error('La restauración no se completó; no se han sustituido los proyectos anteriores'));
   tx.onerror=()=>{};
  });
 }finally{db.close()}
}

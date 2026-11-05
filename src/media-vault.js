// BIBLIOTECA LOCAL MEDIA FORGE · IndexedDB. Los archivos no salen del dispositivo.
const DB_NAME='markethub-media-vault-v1',STORE='assets',VERSION=1;
export const VAULT_MAX_ITEMS=40,VAULT_MAX_BYTES=150*1024*1024;
const TYPES=['image/png','image/jpeg','image/webp','audio/wav','audio/mpeg','audio/ogg','audio/mp4','audio/webm','video/mp4','video/webm','video/quicktime','application/pdf','text/vtt','text/plain'];
export const vaultSupported=()=>typeof indexedDB!=='undefined'&&typeof indexedDB.open==='function';
export function validateVaultAsset({name,blob}={}){
 if(!(blob instanceof Blob)||blob.size<1)throw Error('El archivo debe contener datos');
 if(blob.size>50*1024*1024)throw Error('Este archivo supera 50 MB. Utiliza un archivo más pequeño');
 if(!TYPES.includes(blob.type))throw Error('Formato no permitido en la biblioteca multimedia');
 const cleaned=String(name||'Archivo').replace(/[<>\\/\x00-\x1F]/g,'').trim().slice(0,90)||'Archivo';
 return {name:cleaned,type:blob.type,size:blob.size};
}
function openDb(){
 if(!vaultSupported())return Promise.reject(Error('Este navegador no admite almacenamiento multimedia local'));
 return new Promise((resolve,reject)=>{
  const req=indexedDB.open(DB_NAME,VERSION);
  req.onupgradeneeded=()=>{
   const db=req.result;
   if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:'id'});
  };
  req.onerror=()=>reject(req.error||Error('No se pudo abrir el archivo local'));
  req.onblocked=()=>reject(Error('Cierra otras pestañas de MarketHub para actualizar la biblioteca'));
  req.onsuccess=()=>{const db=req.result;db.onversionchange=()=>db.close();resolve(db)};
 });
}
async function operation(mode,perform){
 const db=await openDb();
 try{return await new Promise((resolve,reject)=>{
  const tx=db.transaction(STORE,mode),store=tx.objectStore(STORE);
  let value,failed=false;
  try{const request=perform(store);request.onsuccess=()=>{value=request.result};request.onerror=()=>{failed=true}}
  catch(error){tx.abort();reject(error);return}
  tx.oncomplete=()=>resolve(value);
  tx.onabort=()=>reject(tx.error||Error('Operación de biblioteca cancelada'));
  tx.onerror=()=>{failed=true};
 })}finally{db.close()}
}
export async function listVaultAssets(){
 const records=await operation('readonly',store=>store.getAll());
 return records.sort((a,b)=>b.createdAt-a.createdAt).map(({id,name,type,size,createdAt})=>({id,name,type,size,createdAt}));
}
export async function getVaultAsset(id){
 const item=await operation('readonly',store=>store.get(String(id)));
 if(!item)throw Error('No se encuentra el archivo. Es posible que ya se haya eliminado');
 // Compatibilidad con datos anteriores y Safari: reconstruir el Blob solo al abrir.
 if(item.bytes instanceof ArrayBuffer){
  return {...item,blob:new Blob([item.bytes],{type:item.type})};
 }
 if(item.blob instanceof Blob)return item; // Formato anterior, no perder archivos existentes.
 throw Error('Archivo guardado incompleto o dañado');
}
export async function saveVaultAsset(name,blob){
 const valid=validateVaultAsset({name,blob});
 const items=await listVaultAssets();
 if(items.length>=VAULT_MAX_ITEMS)throw Error('Biblioteca completa: máximo de '+VAULT_MAX_ITEMS+' archivos');
 const used=items.reduce((acc,i)=>acc+i.size,0);
 if(used+valid.size>VAULT_MAX_BYTES)throw Error('Biblioteca llena: exporta o elimina archivos antes de añadir más');
 const id=(globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,11));
 // WebKit/Safari puede fallar o bloquearse al clonar Blob/File en IndexedDB.
 // Guardar ArrayBuffer permite reconstruir el archivo sin pérdida de formato.
 const bytes=await blob.arrayBuffer();
 const data={...valid,bytes,id,createdAt:Date.now()};
 await operation('readwrite',store=>store.add(data));
 return {id,...valid};
}
export async function removeVaultAsset(id){
 const item=await getVaultAsset(id);
 await operation('readwrite',store=>store.delete(item.id));
 return true;
}

/** Guardado por lotes de medios restaurados. Una transacción para no dejar medios a medias. */
export async function saveVaultAssetsBatch(entries){
 if(!Array.isArray(entries)||!entries.length||entries.length>VAULT_MAX_ITEMS)
  throw Error('El lote de biblioteca contiene demasiados archivos');
 const prepared=[];
 for(const entry of entries){
  const valid=validateVaultAsset(entry);
  prepared.push({...valid,bytes:await entry.blob.arrayBuffer()});
 }
 const existing=await listVaultAssets();
 if(existing.length+prepared.length>VAULT_MAX_ITEMS)throw Error('La biblioteca no tiene espacio para todos los archivos');
 const total=existing.reduce((n,x)=>n+x.size,0)+prepared.reduce((n,x)=>n+x.size,0);
 if(total>VAULT_MAX_BYTES)throw Error('El respaldo supera los 150 MB admitidos por la biblioteca');
 const db=await openDb(),ids=[],createdAt=Date.now();
 try{
  return await new Promise((resolve,reject)=>{
   const tx=db.transaction(STORE,'readwrite'),store=tx.objectStore(STORE);
   prepared.forEach((p,i)=>{
    const id=globalThis.crypto?.randomUUID?.()||createdAt.toString(36)+'-'+i+'-'+Math.random().toString(36).slice(2);
    ids.push(id);store.add({...p,id,createdAt});
   });
   tx.oncomplete=()=>resolve(ids);
   tx.onabort=()=>reject(tx.error||Error('No se guardó el lote multimedia'));
   tx.onerror=()=>{};
  });
 }finally{db.close()}
}
export async function removeVaultAssetsBatch(ids){
 if(!Array.isArray(ids)||ids.some(id=>typeof id!=='string'))throw Error('IDs multimedia incorrectos');
 if(!ids.length)return;
 const db=await openDb();
 try{await new Promise((resolve,reject)=>{
  const tx=db.transaction(STORE,'readwrite'),store=tx.objectStore(STORE);
  ids.forEach(id=>store.delete(id));
  tx.oncomplete=resolve;
  tx.onabort=()=>reject(tx.error||Error('No se pudieron revertir todos los archivos'));
  tx.onerror=()=>{};
 })}finally{db.close()}
}
